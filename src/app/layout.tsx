import type { Metadata } from "next";
import { Inter_Tight, Instrument_Serif, JetBrains_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/ui/theme-provider";
import "./globals.css";

const interTight = Inter_Tight({
  variable: "--font-inter-tight",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: ["400"],
  style: ["italic"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Slate – Timetables, solved.",
    template: "%s · Slate",
  },
  description:
    "A premium, conflict-free timetable builder for colleges and universities. Build clash-free schedules, manage teacher workloads, and export in seconds.",
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
    apple: "/assets/brand/apple-touch-icon.png",
  },
  openGraph: {
    title: "Slate – Timetables, solved.",
    description:
      "A premium, conflict-free timetable builder for colleges and universities.",
    url: "https://slate.vercel.app",
    siteName: "Slate",
    images: [
      {
        url: "/assets/og/og-image.svg",
        width: 1200,
        height: 630,
        alt: "Slate – Timetables, solved.",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Slate – Timetables, solved.",
    description:
      "A premium, conflict-free timetable builder for colleges and universities.",
    images: ["/assets/og/og-image.svg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${interTight.variable} ${instrumentSerif.variable} ${jetbrainsMono.variable} antialiased min-h-screen selection:bg-accent/20 selection:text-accent`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
