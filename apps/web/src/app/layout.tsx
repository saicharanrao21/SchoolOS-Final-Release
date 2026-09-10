import type { Metadata } from "next";
import "../styles/globals.css";

export const metadata: Metadata = {
  title: "SchoolOS Management",
  description: "Enterprise School Operating System Management Portal",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
