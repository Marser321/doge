import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Michroma } from "next/font/google";
import "./globals.css";
import SmoothScroll from "@/components/SmoothScroll";
import AuraCursor from "@/components/AuraCursor";
import BottomNav from "@/components/BottomNav";
import { LanguageProvider } from "@/components/LanguageProvider";
import { ThemeProvider } from "@/components/ThemeProvider";

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
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${michroma.variable} h-full antialiased overflow-x-hidden`}
    >
      <head>
        {/*
          Applies the stored theme before first paint. Without this the theme
          was only set in a client effect, so every load flashed dark before
          switching to light. It runs blocking on purpose and is tiny.
        */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('doge-theme');if(t==='light'||t==='dark'){document.documentElement.dataset.theme=t}}catch(e){}})()`,
          }}
        />
      </head>
      {/*
        No `bg-background` here: an opaque layer on body painted over the
        ambient gradient that globals.css sets, which is why the page read as
        one flat black sheet. The colour comes from the `body` rule instead.
      */}
      <body className="min-h-full flex flex-col font-sans tracking-tight text-foreground">
        <ThemeProvider>
        <LanguageProvider>
          <SmoothScroll>
            <AuraCursor />
            {children}
          </SmoothScroll>
          <BottomNav />
        </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
