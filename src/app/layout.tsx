import type { Metadata } from "next";
import { Open_Sans, Noto_Sans_Telugu } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { LanguageProvider } from "@/context/LanguageContext";

const openSans = Open_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-open-sans",
});

const notoSansTelugu = Noto_Sans_Telugu({
  subsets: ["telugu"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-telugu",
});

export const metadata: Metadata = {
  title: "IQAC Faculty Data Portal — Kakatiya University",
  description:
    "Internal Quality Assurance Cell — Faculty Academic Data Collection System for AQAR 2024-25, Kakatiya University, Warangal.",
  keywords: ["IQAC", "Kakatiya University", "AQAR", "Faculty Data", "Academic"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${openSans.variable} ${notoSansTelugu.variable} font-sans antialiased bg-ku-grayLight text-ku-gray`}>
        <LanguageProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
