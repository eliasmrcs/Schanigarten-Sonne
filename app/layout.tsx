import type { Metadata } from "next";
import { Press_Start_2P } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/components/auth/AuthProvider";

const pixelFont = Press_Start_2P({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-pixel",
});

export const metadata: Metadata = {
  title: "homie — your AI pixel creature",
  description: "A tiny pixel creature that lives on the internet. Nurture it, feed it, regret it.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${pixelFont.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-gray-950">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
