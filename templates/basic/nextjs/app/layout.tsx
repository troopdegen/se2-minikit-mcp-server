import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Header } from "../components/Header";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "{{projectName}}",
  description: "{{description}}",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="flex flex-col min-h-screen">
          <Header />
          <main className="flex-grow">{children}</main>
          <footer className="bg-gray-100 py-4 text-center text-sm text-gray-600">
            Built with Scaffold-ETH 2 🏗️
          </footer>
        </div>
      </body>
    </html>
  );
}
