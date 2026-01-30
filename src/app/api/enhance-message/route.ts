import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { supabase } from '@/lib/supabase';
import { applyRateLimit, addRateLimitHeaders } from '@/lib/rate-limit/rate-limiter';
import { AI_RATE_LIMIT } from '@/lib/rate-limit/config';
import { createAuthRequiredResponse } from '@/lib/rate-limit/responses';
import { aiLogger } from '@/lib/logger';
import { extractJsonFromText } from '@/lib/json-parser';
import { messagePromptSchema, formatValidationErrors } from '@/lib/validation/schemas';

interface MessageData {
    subject?: string;
    content?: string;
}

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

        // 3. Validate and process the request
        const body = await request.json();
        const validation = messagePromptSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json(
                { error: 'Validation failed', details: formatValidationErrors(validation.error) },
                { status: 400 }
            );
        }

        const { prompt } = validation.data;

        // For testing the enhance endpoint directly, wrap the prompt properly
        const fullPrompt = typeof prompt === 'string'
            ? `You are helping enhance a payment reminder email. ${prompt}

         Return ONLY a JSON object in this exact format:
         {
           "subject": "enhanced email subject line",
           "content": "enhanced email body content"
         }

         Do not include any other text, only the JSON object.`
            : prompt;

        // Generate enhanced message
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
            action: 'message_enhancement_response',
            userId: user.id,
            promptLength: prompt.length,
            responseLength: text.length,
        }, 'Received Gemini response for message enhancement');

        // Extract JSON from response
        let messageData: MessageData | null = null;
        try {
            // Try to clean the response and find JSON
            const cleanedText = text.trim();

            // Try direct parse first
            try {
                messageData = JSON.parse(cleanedText) as MessageData;
            } catch {
                // If that fails, try to extract JSON from the text
                messageData = extractJsonFromText<MessageData>(cleanedText);
                if (!messageData) {
                    // If no JSON found, create a structured response from the text
                    return NextResponse.json({
                        subject: "Payment Reminder - Invoice Due",
                        content: cleanedText || "Please review and pay your outstanding invoice at your earliest convenience."
                    });
                }
            }
        } catch (parseError) {
            aiLogger.error({
                action: 'message_enhancement_parse_error',
                userId: user.id,
                responsePreview: text.substring(0, 200),
                err: parseError instanceof Error ? parseError : new Error(String(parseError)),
            }, 'Failed to parse Gemini message enhancement response');

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
            action: 'message_enhancement_error',
            err: error instanceof Error ? error : new Error(String(error)),
        }, 'Error enhancing message');
        return NextResponse.json(
            { error: 'Failed to enhance message' },
            { status: 500 }
        );
    }
}
