"use client";

import { LayoutProvider } from "../layout/context/layoutcontext";
import { PrimeReactProvider } from "primereact/api";
import { AuthProvider } from "../contexts/AuthContext"; // ✅ Auth context
import ProtectedRoute from "../components/ProtectedRoute"; // ✅ Protected wrapper

import "primeflex/primeflex.css";
import "primeicons/primeicons.css";
import "primereact/resources/primereact.css";
import "../styles/demo/Demos.scss";
import "../styles/layout/layout.scss";

interface RootLayoutProps {
    children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
    return (
        <html lang="en" suppressHydrationWarning>
            <head>
                <link
                    id="theme-link"
                    href={`/theme/theme-light/indigo/theme.css`}
                    rel="stylesheet"
                />
            </head>
            <body>
                <PrimeReactProvider>
                    <LayoutProvider>
                        {/* ✅ Global Auth + ProtectedRoute wrap */}
                        <AuthProvider>
                            <ProtectedRoute>{children}</ProtectedRoute>
                        </AuthProvider>
                    </LayoutProvider>
                </PrimeReactProvider>
            </body>
        </html>
    );
}
