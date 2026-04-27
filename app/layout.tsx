import type { Metadata } from "next";
import { Inter, Oswald } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const oswald = Oswald({
  weight: ["300", "400", "500"],
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: "GParty — AI-powered Jeopardy",
  description:
    "A modern Jeopardy-style party game powered by ChatGPT. Generate categories, play three rounds, and crown a champion.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${oswald.variable}`}>
      <body className="bg-jeopardy-blue-darker text-clue-text font-body antialiased">
        {children}
      </body>
    </html>
  );
}
