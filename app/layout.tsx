import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

// App sans -> exposed as --font-app. To switch to PP Neue Montreal, drop the
// woff2 files in app/fonts/ and swap this for a next/font/local loader (see
// app/fonts/README.md). Geist is a close neo-grotesque stand-in until then.
const appSans = Geist({
  variable: "--font-app",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Faces",
  description: "Find reference photos of faces at a chosen head angle.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${appSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
