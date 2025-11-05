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
        const { file, mimeType } = await request.json();

        if (!file || !mimeType) {
            return NextResponse.json(
                { error: 'Missing file or mimeType' },
                { status: 400 }
            );
        }

        // Remove data URL prefix to get base64
        const base64Data = file.split(',')[1];

        // Create the prompt
        const prompt = `
      Analyze this invoice image and extract the following information:
      1. Client Name (person or company being billed)
      2. Client Email
      3. Invoice Number
      4. Total Amount (just the number, no currency symbols)
      5. Currency (USD, EUR, GBP, INR, etc.)
      6. Due Date (in YYYY-MM-DD format)
      7. Payment Link (if visible)
      8. Description of services/products

      Return the data as a JSON object with these exact keys:
      {
        "clientName": "",
        "clientEmail": "",
        "invoiceNumber": "",
        "amount": "",
        "currency": "",
        "dueDate": "",
        "paymentLink": "",
        "description": ""
      }

      If any field is not found, use an empty string. For the amount, only include numbers (no currency symbols).
      For the due date, convert to YYYY-MM-DD format.
    `;

        // Generate content with image using the correct API format
        const response = await ai.models.generateContent({
            model: "gemini-2.0-flash-exp",
            contents: [
                {
                    parts: [
                        { text: prompt },
                        {
                            inlineData: {
                                mimeType: mimeType,
                                data: base64Data
                            }
                        }
                    ]
                }
            ]
        });

        // Get the text from the response
        const text = response.text;

        if (!text) {
            return NextResponse.json(
                { error: 'No response from AI model' },
                { status: 500 }
            );
        }

        // Extract JSON from the response
        let invoiceData;
        try {
            // Try to find JSON in the response
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                invoiceData = JSON.parse(jsonMatch[0]);
            } else {
                throw new Error('No JSON found in response');
            }
        } catch (parseError) {
            aiLogger.error({
                action: 'invoice_parse_error',
                userId: user.id,
                responsePreview: text.substring(0, 200),
                err: parseError instanceof Error ? parseError : new Error(String(parseError)),
            }, 'Failed to parse Gemini invoice response');
            return NextResponse.json(
                { error: 'Failed to parse invoice data' },
                { status: 500 }
            );
        }

        // Validate and clean the data
        const cleanedData = {
            clientName: invoiceData.clientName || '',
            clientEmail: invoiceData.clientEmail || '',
            invoiceNumber: invoiceData.invoiceNumber || '',
            amount: invoiceData.amount || '',
            currency: invoiceData.currency || 'USD',
            dueDate: invoiceData.dueDate || '',
            paymentLink: invoiceData.paymentLink || '',
            description: invoiceData.description || ''
        };

        aiLogger.info({
            action: 'invoice_processed',
            userId: user.id,
            hasClientEmail: !!cleanedData.clientEmail,
            currency: cleanedData.currency,
        }, 'Invoice successfully processed by AI');

        // 4. Return response with rate limit headers
        const jsonResponse = NextResponse.json(cleanedData);
        return addRateLimitHeaders(jsonResponse, rateLimitResult);
    } catch (error) {
        aiLogger.error({
            action: 'invoice_processing_error',
            err: error instanceof Error ? error : new Error(String(error)),
        }, 'Error processing invoice');
        return NextResponse.json(
            { error: 'Failed to process invoice' },
            { status: 500 }
        );
    }
}