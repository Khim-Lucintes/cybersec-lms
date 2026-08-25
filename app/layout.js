import { Source_Serif_4, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const sourceSerif4 = Source_Serif_4({
  variable: "--font-serif",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

import { RouteLoadingBar } from "@/components/RouteLoadingBar";

export const metadata = {
  title: "CDI 409: Cybercrime Investigation & Environmental Laws",
  description: "Father Saturnino Urios University Criminal Justice Education Program LMS",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${sourceSerif4.variable} ${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans bg-background text-foreground selection:bg-[#C5A059] selection:text-white">
        <RouteLoadingBar />
        {children}
      </body>
    </html>
  );
}
