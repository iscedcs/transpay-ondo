import { Toaster } from "@/components/ui/toaster";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import type { Metadata } from "next";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";
import { Geist, Geist_Mono, Lato } from "next/font/google";
import NextTopLoader from "nextjs-toploader";
import { Toaster as Sonner } from "sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});
const lato = Lato({
  weight: ["100", "300", "400", "700", "900"],
  subsets: ["latin"],
  display: "swap",
});
export const metadata: Metadata = {
  title: "Transpay - Transportation Flexibility",
  description: "Powered By ISCE",

  // metadataBase: new URL('https://transpaytms.com')
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <SessionProvider>
        <body
          className={`${lato.className} ${geistSans.variable} ${geistMono.variable}`}
        >
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
            <div className="">
              <NextTopLoader color="#7F7433" showSpinner={false} />
              {children}
              <Toaster />
              <Sonner richColors />
            </div>
          </ThemeProvider>
          <Analytics />
          <SpeedInsights />
        </body>
      </SessionProvider>
    </html>
  );
}
