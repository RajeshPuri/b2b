import { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "B2B Wholesale Clothing Marketplace",
  description: "Multi-vendor B2B wholesale clothing marketplace connecting wholesalers and business buyers",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
