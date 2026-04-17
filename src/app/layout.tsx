import type { Metadata } from "next";
import { DM_Sans, Instrument_Serif } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  weight: "400",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Social Posts Previewer — Review & approve social content",
  description: "Get client and stakeholder feedback on social media posts before they go live. Realistic previews for LinkedIn, X, Facebook, Instagram, and Google Ads — powered by Google Sheets.",
  metadataBase: new URL("https://socials-review.michalina.dev"),
  openGraph: {
    title: "Social Posts Previewer",
    description: "Get feedback on social posts before they go live. Realistic previews, approvals, and comments — straight from a Google Sheet.",
    siteName: "Social Posts Previewer",
    type: "website",
    images: [{ url: "/opengraph-image", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Social Posts Previewer",
    description: "Get feedback on social posts before they go live. Realistic previews, approvals, and comments — straight from a Google Sheet.",
    images: ["/opengraph-image"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${dmSans.variable} ${instrumentSerif.variable} h-full`}>
      <body className="min-h-full flex flex-col font-body antialiased">{children}</body>
    </html>
  );
}
