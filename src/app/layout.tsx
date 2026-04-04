import type { Metadata } from "next";
import { Michroma } from "next/font/google";
import "./globals.css";
import SmoothScroll from "@/components/SmoothScroll";
import AuraCursor from "@/components/AuraCursor";

const michroma = Michroma({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-orbitron", // Keeping the variable name same to not break globals.css
});

export const metadata: Metadata = {
  title: "DOGE Facility | Limpieza de Lujo en Punta del Este",
  description: "Servicios de limpieza y mantenimiento de alto nivel para propiedades exclusivas en Maldonado y Punta del Este. Automatización y confianza.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${michroma.variable} h-full antialiased`}
    >
      <body className={`min-h-full flex flex-col bg-white font-orbitron lg:tracking-wide`}>
        <SmoothScroll>
          <AuraCursor />
          {children}
        </SmoothScroll>
      </body>
    </html>
  );
}
