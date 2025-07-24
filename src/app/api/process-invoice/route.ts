import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

// Initialize Gemini AI
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

export async function POST(request: NextRequest) {
    try {
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

        // Generate content with image
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

        const text = response.text;

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
            console.error('Failed to parse Gemini response:', text);
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

        return NextResponse.json(cleanedData);
    } catch (error) {
        console.error('Error processing invoice:', error);
        return NextResponse.json(
            { error: 'Failed to process invoice' },
            { status: 500 }
        );
    }
}