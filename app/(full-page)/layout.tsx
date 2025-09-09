import { Metadata } from "next";
import React from "react";
import AppConfig from "../../layout/AppConfig";
import { AuthProvider } from '@/contexts/AuthContext'; 

interface FullPageLayoutProps {
    children: React.ReactNode;
}

export const metadata: Metadata = {
    title: "Shama Laser Central",
    description:
        "The ultimate collection of design-agnostic, flexible and accessible React UI Components.",
};




export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider> {/* WRAP WITH AUTH PROVIDER */}
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}