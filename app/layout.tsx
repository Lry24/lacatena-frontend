import type { Metadata } from "next";
import { DM_Sans, DM_Serif_Display } from "next/font/google";
import StoreInitializer from "@/components/StoreInitializer";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
});

const dmSerif = DM_Serif_Display({
  variable: "--font-dm-serif",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "La Catena — Boutique Multibrand",
  description: "Pièces sélectionnées. Marques choisies. Une seule adresse.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${dmSans.variable} ${dmSerif.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[var(--forest)] text-[var(--cream)]">
        <StoreInitializer />
        {children}
      </body>
    </html>
  );
}
