import { pdf } from 'pdf-to-img';

/**
 * Rasterize the first page of a PDF to a PNG data URL for vision models.
 *
 * Groq's vision models only accept images, so invoice PDFs are converted
 * server-side. Uses pdf-to-img (pdfjs under the hood, no native canvas or
 * system binaries) so it runs on Vercel without poppler/graphicsmagick.
 */
export async function pdfFirstPageToPngDataUrl(
  pdfBase64: string,
  scale = 2, // 2x for legible text at typical invoice sizes
): Promise<string> {
  const data = Uint8Array.from(Buffer.from(pdfBase64, 'base64'));
  // pdfjs is externalized in next.config (serverExternalPackages) so its worker
  // file resolves at runtime instead of being dropped by the bundler.
  const document = await pdf(data, { scale });

  for await (const pageBuffer of document) {
    // First page only — pageBuffer is a PNG Buffer.
    return `data:image/png;base64,${pageBuffer.toString('base64')}`;
  }

  throw new Error('PDF had no pages to render');
}
