import { z } from 'zod';

// Common validation patterns
const uuidSchema = z.string().uuid('Invalid UUID format');

// enhance-message and generate-message share the same schema
export const messagePromptSchema = z.object({
  prompt: z.string()
    .min(1, 'Prompt is required')
    .max(10000, 'Prompt must be less than 10,000 characters'),
});

// Valid MIME types for invoice processing
const VALID_MIME_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'application/pdf'] as const;

// process-invoice schema with file validation
export const processInvoiceSchema = z.object({
  file: z.string()
    .min(1, 'File is required')
    .max(10_000_000, 'File must be less than 10MB'), // ~7.5MB after base64 encoding
  mimeType: z.enum(VALID_MIME_TYPES, {
    message: 'Invalid file type. Supported: PNG, JPEG, WebP, PDF',
  }),
});

// payments/create-link schema
export const createPaymentLinkSchema = z.object({
  invoiceId: uuidSchema,
});

// email/send-thank-you schema
export const thankYouEmailSchema = z.object({
  invoiceId: uuidSchema,
});

// email/test schema with proper email format validation
export const testEmailSchema = z.object({
  testEmail: z.string()
    .min(1, 'Email is required')
    .email('Invalid email format')
    .max(254, 'Email must be less than 254 characters'),
});

// Validation helper that returns a standardized error response
export function validateRequest<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: z.ZodError } {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, errors: result.error };
}

// Format Zod errors for API response
export function formatValidationErrors(zodError: z.ZodError): { field: string; message: string }[] {
  return zodError.issues.map((issue) => ({
    field: issue.path.join('.') || 'root',
    message: issue.message,
  }));
}
