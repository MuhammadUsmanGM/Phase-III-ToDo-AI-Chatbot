import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "../context/AuthContext"; // Import AuthProvider
import { ThemeProvider } from "next-themes";
import { AccessibilityProvider } from "../context/AccessibilityContext";
import AuthExpirationNotification from "@/components/AuthExpirationNotification"; // Import the auth expiration notification
import { ChatProvider } from "@/components/ChatProvider"; // Import the chat provider

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TodoApp - Organize Your Life",
  description: "A powerful task management application designed to help you organize your life and boost productivity.",
  icons: {
    icon: '/logo.png',
  },
};

import Script from 'next/script';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-title" content="TodoApp" />
        <meta name="theme-color" content="#6366f1" />
        <meta name="application-name" content="TodoApp" />
        <link rel="apple-touch-icon" href="/logo.png" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          forcedTheme="light"
          disableTransitionOnChange
        >
          <AccessibilityProvider>
            <AuthProvider>
              <ChatProvider>
                <AuthExpirationNotification />
                {children}
              </ChatProvider>
            </AuthProvider> {/* Wrap children with AuthProvider */}
          </AccessibilityProvider>
        </ThemeProvider>
        <Script
          src="/sw-register.js"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
