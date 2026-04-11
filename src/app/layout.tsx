import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Michroma } from "next/font/google";
import "./globals.css";
import SmoothScroll from "@/components/SmoothScroll";
import AuraCursor from "@/components/AuraCursor";
import BottomNav from "@/components/BottomNav";
import { LanguageProvider } from "@/components/LanguageProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const michroma = Michroma({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-michroma",
});

export const metadata: Metadata = {
  title: "DOGE.S.M LLC | Cleaning Service & Professional Window Cleaning",
  description: "Servicios de limpieza y mantenimiento corporativo de alto nivel para propiedades exclusivas en Miami y South Florida. Automatización y confianza.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} ${michroma.variable} h-full antialiased transition-colors duration-500 overflow-x-hidden`}
    >
      <body className="min-h-full flex flex-col bg-background font-sans tracking-tight text-foreground transition-colors duration-500">
        <LanguageProvider>
          <SmoothScroll>
            <AuraCursor />
            {children}
          </SmoothScroll>
          <BottomNav />
        </LanguageProvider>
      </body>
    </html>
  );
}
