import { Inter as FontSans } from "next/font/google";

import "./globals.css";
import { ThemeProvider } from "@components/theme-provider";
import { cn } from "@lib/utils";

const defaultUrl = process.env.NEXT_PUBLIC_URL ?? "http://localhost:3005";

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata = {
  metadataBase: new URL(defaultUrl),
  title: "Basejump starter kit",
  description: "The fastest way to build apps with Next.js and Supabase",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={cn("min-h-screen bg-background font-sans antialiased", fontSans.variable)}
    >
      <body className="bg-background text-foreground">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <main className="flex min-h-screen flex-col items-center">{children}</main>
        </ThemeProvider>
      </body>
    </html>
  );
}
