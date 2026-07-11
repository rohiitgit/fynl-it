import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { applyRateLimit, addRateLimitHeaders } from '@/lib/rate-limit/rate-limiter';
import { AI_RATE_LIMIT } from '@/lib/rate-limit/config';
import { createAuthRequiredResponse } from '@/lib/rate-limit/responses';
import { aiLogger } from '@/lib/logger';
import { generateGeminiMessage } from '@/lib/ai/gemini-message';
import { messagePromptSchema, formatValidationErrors } from '@/lib/validation/schemas';

export async function POST(request: NextRequest) {
    try {
        const authHeader = request.headers.get('authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return createAuthRequiredResponse();
        }

        const token = authHeader.replace('Bearer ', '');
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);

        if (authError || !user) {
            return createAuthRequiredResponse();
        }

        const rateLimitResult = await applyRateLimit(request, user.id, AI_RATE_LIMIT, 'ai');
        if (rateLimitResult.response) {
            return rateLimitResult.response;
        }

        const body = await request.json();
        const validation = messagePromptSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json(
                { error: 'Validation failed', details: formatValidationErrors(validation.error) },
                { status: 400 }
            );
        }

        const { prompt } = validation.data;

        const fullPrompt = `You are helping enhance a payment reminder email. ${prompt}

         Return ONLY a JSON object in this exact format:
         {
           "subject": "enhanced email subject line",
           "content": "enhanced email body content"
         }

         Do not include any other text, only the JSON object.`;

        const messageData = await generateGeminiMessage(fullPrompt, 'message_enhancement', user.id);

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
