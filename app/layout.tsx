import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Codia — Code to Diagram",
  description:
    "Turn Python code into beautiful UML class diagrams. Paste, parse, and visualize in seconds.",
  openGraph: {
    title: "Codia — Code to Diagram",
    description: "Beautiful UML diagrams from your Python code.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrains.variable} dark`}>
      <body className="antialiased">
        <div className="pointer-events-none fixed inset-0 -z-10 grid-bg" />
        {children}
        <Toaster
          theme="dark"
          position="bottom-right"
          toastOptions={{
            style: {
              background: "hsl(240 10% 8%)",
              border: "1px solid hsl(240 6% 16%)",
              color: "hsl(0 0% 98%)",
            },
          }}
        />
      </body>
    </html>
  );
}
