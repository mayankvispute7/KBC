/**
 * Root Layout — Kaun Banega College Pati
 *
 * Loads all Google Fonts via next/font/google (tree-shaken, self-hosted by Next.js):
 * - Cinzel Decorative: Titles, state labels ("LOCKED", "CORRECT", "COLLEGE PATI")
 * - Playfair Display: Question text, secondary headings
 * - Poppins: Body text, options, UI elements
 * - Space Grotesk: Timer digits only — tabular numerals prevent jitter during countdown
 */

import type { Metadata } from "next";
import { Cinzel_Decorative, Playfair_Display, Poppins, Space_Grotesk } from "next/font/google";
import "./globals.css";

const cinzel = Cinzel_Decorative({
  subsets: ["latin"],
  weight: ["400", "700", "900"],
  variable: "--font-cinzel",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-playfair",
  display: "swap",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-space-grotesk",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Kaun Banega College Pati 👑 | Teachers' Day Special",
  description:
    "A cinematic, game-show-style interactive quiz for Teachers' Day. Where knowledge meets attendance shortage.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${cinzel.variable} ${playfair.variable} ${poppins.variable} ${spaceGrotesk.variable}`}
    >
      <body className="font-body bg-void text-ink-white antialiased overflow-x-hidden">
        {children}
        <div className="fixed bottom-4 right-4 text-xs font-semibold text-ink-white/50 font-body z-[999] pointer-events-none select-none tracking-wider mix-blend-screen drop-shadow-md">
          Developed by Mayank Vispute
        </div>
      </body>
    </html>
  );
}
