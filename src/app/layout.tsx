// src/app/layout.tsx - Updated with AuthProvider for session management
import { Analytics } from "@vercel/analytics/next";
import { Inter } from "next/font/google";
import { Providers } from "./providers";
import { AuthProvider } from "@/components/AuthProvider";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

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
    <html lang="en">
      <body className={inter.className}>
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
