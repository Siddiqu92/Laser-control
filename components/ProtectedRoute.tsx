"use client";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();


  const publicPaths = ["/auth/login", "/auth/register"];

  useEffect(() => {
    if (!isLoading && !isAuthenticated && !publicPaths.includes(pathname)) {
      router.push("/auth/login");
    }
  }, [isLoading, isAuthenticated, pathname]);

  if (isLoading) return <p>Loading...</p>;

  if (!isAuthenticated && !publicPaths.includes(pathname)) return null;

  return <>{children}</>;
}
