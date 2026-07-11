// src/app/layout.tsx - Updated with AuthProvider for session management
import { Analytics } from "@vercel/analytics/next";
import { Bangers, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import { Providers } from "./providers";
import { AuthProvider } from "@/components/AuthProvider";
import "./globals.css";

// Comic display face — classic comic-book cover lettering.
// Bangers ships a single 400 weight; font-synthesis is disabled in
// globals.css so bold utilities don't smear it with faux bold.
const bangers = Bangers({
  subsets: ["latin"],
  variable: "--font-display",
  weight: "400",
  display: "swap",
});

// Body face — geometric, clean, not generic.
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

// Utility labels / captions.
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500", "700"],
  display: "swap",
});

export const metadata = {
  title: "Fynl.it - Get Paid Without the Awkward Chase",
  description: "Get your invoices Fynlly Paid",
  icons: "/favicon-2.ico",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${bangers.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable}`}
    >
      <body className="font-body antialiased">
        <Providers>
          <AuthProvider>
            {children}
            <Analytics />
          </AuthProvider>
        </Providers>
      </body>
    </html>
  );
}
