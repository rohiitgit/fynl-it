import { GoogleGenAI } from '@google/genai';
import { aiLogger } from '@/lib/logger';
import { extractJsonFromText } from '@/lib/json-parser';

interface MessageData {
  subject?: string;
  content?: string;
}

export interface GeminiMessageResult {
  subject: string;
  content: string;
}

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

/** Call Gemini and return a parsed { subject, content } object. Falls back gracefully if JSON is absent. */
export async function generateGeminiMessage(
  prompt: string,
  actionId: string,
  userId: string
): Promise<GeminiMessageResult> {
  const response = await ai.models.generateContent({
    model: 'gemini-2.0-flash-exp',
    contents: prompt,
  });

  const text = response.text;

  if (!text) {
    throw new Error('No response from AI model');
  }

  aiLogger.debug(
    {
      action: `${actionId}_response`,
      userId,
      promptLength: prompt.length,
      responseLength: text.length,
    },
    `Received Gemini response for ${actionId}`
  );

  const cleanedText = text.trim();

  let messageData: MessageData | null = null;

  try {
    messageData = JSON.parse(cleanedText) as MessageData;
  } catch {
    messageData = extractJsonFromText<MessageData>(cleanedText);
    if (!messageData) {
      return {
        subject: 'Payment Reminder - Invoice Due',
        content: cleanedText || 'Please review and pay your outstanding invoice at your earliest convenience.',
      };
    }
  }

  return {
    subject: messageData.subject || 'Payment Reminder',
    content: messageData.content || text || 'Please review and pay your outstanding invoice.',
  };
}
