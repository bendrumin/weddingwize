import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "WeddingWise AI - Intelligent Wedding Planning",
  description: "The most intelligent wedding planning platform that combines AI optimization with real vendor data to create the perfect wedding experience.",
  keywords: ["wedding planning", "AI", "vendor matching", "budget optimization", "wedding timeline"],
  authors: [{ name: "WeddingWise AI" }],
  openGraph: {
    title: "WeddingWise AI - Intelligent Wedding Planning",
    description: "The most intelligent wedding planning platform that combines AI optimization with real vendor data.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "WeddingWise AI - Intelligent Wedding Planning",
    description: "The most intelligent wedding planning platform that combines AI optimization with real vendor data.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans antialiased bg-gray-50">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
