import { aiLogger } from '@/lib/logger';
import { extractJsonFromText } from '@/lib/json-parser';
import { groq, GROQ_TEXT_MODEL } from './groq-client';

interface MessageData {
  subject?: string;
  content?: string;
}

export interface GeminiMessageResult {
  subject: string;
  content: string;
}

/** Call the AI model and return a parsed { subject, content } object. Falls back gracefully if JSON is absent. */
export async function generateGeminiMessage(
  prompt: string,
  actionId: string,
  userId: string
): Promise<GeminiMessageResult> {
  const completion = await groq.chat.completions.create({
    model: GROQ_TEXT_MODEL,
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
  });

  const text = completion.choices[0]?.message?.content;

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
    `Received AI response for ${actionId}`
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
