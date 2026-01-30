import type { ReactNode } from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { Providers } from "@/lib/providers";

const inter = Inter({ 
  subsets: ["latin"], 
  variable: "--font-inter",
  display: "swap",
});

// Friz Quadrata - Primary display/heading font
const frizQuadrata = localFont({
  src: [
    {
      path: "../../public/fonts/Friz Quadrata Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/Friz Quadrata Std Medium.otf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../public/fonts/Friz Quadrata Bold.otf",
      weight: "700",
      style: "normal",
    },
    {
      path: "../../public/fonts/Friz Quadrata Italic.ttf",
      weight: "400",
      style: "italic",
    },
  ],
  variable: "--font-friz",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "SPARC RPG",
    template: "%s | SPARC RPG",
  },
  description: "The next generation tabletop RPG platform. Create characters, run sessions, and bring your stories to life.",
  keywords: ["RPG", "tabletop", "game", "fantasy", "SPARC", "roleplaying"],
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}): JSX.Element | null {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${frizQuadrata.variable} font-sans bg-surface-base text-foreground antialiased`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
