import { Bricolage_Grotesque, Fraunces, JetBrains_Mono } from "next/font/google";

export const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "500", "600", "700"],
});

export const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-editorial",
  style: ["italic"],
  weight: ["400", "500"],
});

export const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-label",
  weight: ["400", "500"],
});
