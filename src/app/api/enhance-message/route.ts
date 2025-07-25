import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

// Initialize the Gemini API with the API key
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

export async function POST(request: NextRequest) {
    try {
        const { prompt } = await request.json();

        if (!prompt) {
            return NextResponse.json(
                { error: 'Missing prompt' },
                { status: 400 }
            );
        }

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
            model: "gemini-1.5-flash",
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

        console.log('Gemini response:', text); // Debug log

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
                        subject: "Payment Reminder - Invoice Due",
                        content: cleanedText || "Please review and pay your outstanding invoice at your earliest convenience."
                    });
                }
            }
        } catch (parseError) {
            console.error('Failed to parse response:', text);
            console.error('Parse error:', parseError);

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

        return NextResponse.json(messageData);
    } catch (error) {
        console.error('Error enhancing message:', error);
        return NextResponse.json(
            { error: 'Failed to enhance message' },
            { status: 500 }
        );
    }
}