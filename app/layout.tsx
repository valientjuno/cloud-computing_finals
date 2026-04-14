import type { Metadata } from "next";
import "./globals.css";
import { Playfair_Display, Lora, DM_Mono } from "next/font/google";

const playfair = Playfair_Display({
  subsets: ["latin"],
  style: ["normal", "italic"],
  weight: ["700"],
  variable: "--font-playfair",
});

const lora = Lora({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-lora",
});

const dmMono = DM_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-dm-mono",
});

export const metadata: Metadata = {
  title: "Folio — Write Your Way Back to Yourself",
  description:
    "A journaling app built for the honest moments — the ones that shape who you're becoming.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${lora.variable} ${dmMono.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
