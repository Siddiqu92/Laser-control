"use client";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";

const publicPaths = ["/auth/login", "/auth/register"]; 

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    
    if (isLoading) return;


    if (!isAuthenticated && !publicPaths.some((p) => pathname.startsWith(p))) {
      router.push("/auth/login");
    }
  }, [isLoading, isAuthenticated, pathname, router]);

  if (isLoading) return <p>Loading...</p>;


  if (!isAuthenticated && !publicPaths.some((p) => pathname.startsWith(p))) {
    return null;
  }

  return <>{children}</>;
}
