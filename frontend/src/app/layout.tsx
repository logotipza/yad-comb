import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin", "cyrillic-ext"],
  variable: "--font-pjs",
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "ЯД Оптимизатор",
  description: "Ваша реклама в Яндекс.Директ на автопилоте",
};

import { ToastProvider } from "@/components/ToastProvider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body className={plusJakartaSans.variable}>
        {children}
        <ToastProvider />
      </body>
    </html>
  );
}
