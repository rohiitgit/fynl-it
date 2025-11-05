import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { supabase } from '@/lib/supabase';
import { applyRateLimit, addRateLimitHeaders } from '@/lib/rate-limit/rate-limiter';
import { AI_RATE_LIMIT } from '@/lib/rate-limit/config';
import { createAuthRequiredResponse } from '@/lib/rate-limit/responses';
import { aiLogger } from '@/lib/logger';

// Initialize the Gemini API with the API key
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

export async function POST(request: NextRequest) {
    try {
        // 1. Check authentication
        const authHeader = request.headers.get('authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return createAuthRequiredResponse();
        }

        const token = authHeader.replace('Bearer ', '');
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);

        if (authError || !user) {
            return createAuthRequiredResponse();
        }

        // 2. Check rate limit
        const rateLimitResult = await applyRateLimit(request, user.id, AI_RATE_LIMIT, 'ai');
        if (rateLimitResult.response) {
            return rateLimitResult.response; // Rate limit exceeded
        }

        // 3. Process the request
        const { prompt } = await request.json();

        if (!prompt) {
            return NextResponse.json(
                { error: 'Missing prompt' },
                { status: 400 }
            );
        }

        // For testing the endpoint directly, ensure we ask for JSON format
        const fullPrompt = typeof prompt === 'string'
            ? `${prompt}

         Return ONLY a JSON object in this exact format:
         {
           "subject": "email subject line",
           "content": "email body content"
         }

         Do not include any other text, only the JSON object.`
            : prompt;

        // Generate custom message using the correct API format
        const response = await ai.models.generateContent({
            model: "gemini-2.0-flash-exp",
            contents: fullPrompt,
        });

        // Get the text from the response
        const text = response.text;

        if (!text) {
            return NextResponse.json(
                { error: 'No response from AI model' },
                { status: 500 }
            );
        }

        aiLogger.debug({
            action: 'message_generation_response',
            userId: user.id,
            promptLength: prompt.length,
            responseLength: text.length,
        }, 'Received Gemini response for message generation');

        // Extract JSON from response
        let messageData;
        try {
            // Try to clean the response and find JSON
            const cleanedText = text.trim();

            // Try direct parse first
            try {
                messageData = JSON.parse(cleanedText);
            } catch {
                // If that fails, try to extract JSON from the text
                const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    messageData = JSON.parse(jsonMatch[0]);
                } else {
                    // If no JSON found, create a structured response from the text
                    return NextResponse.json({
                        subject: "Payment Reminder",
                        content: cleanedText || "Please review and pay your outstanding invoice."
                    });
                }
            }
        } catch (parseError) {
            aiLogger.error({
                action: 'message_generation_parse_error',
                userId: user.id,
                responsePreview: text.substring(0, 200),
                err: parseError instanceof Error ? parseError : new Error(String(parseError)),
            }, 'Failed to parse Gemini message generation response');

            // Fallback: Return the text as content
            return NextResponse.json({
                subject: "Payment Reminder",
                content: text || "Please review and pay your outstanding invoice."
            });
        }

        // Validate response
        if (!messageData.subject || !messageData.content) {
            // If missing fields, provide defaults
            messageData.subject = messageData.subject || "Payment Reminder";
            messageData.content = messageData.content || text || "Please review and pay your outstanding invoice.";
        }

        // 4. Return response with rate limit headers
        const jsonResponse = NextResponse.json(messageData);
        return addRateLimitHeaders(jsonResponse, rateLimitResult);
    } catch (error) {
        aiLogger.error({
            action: 'message_generation_error',
            err: error instanceof Error ? error : new Error(String(error)),
        }, 'Error generating message');
        return NextResponse.json(
            { error: 'Failed to generate message' },
            { status: 500 }
        );
    }
}
