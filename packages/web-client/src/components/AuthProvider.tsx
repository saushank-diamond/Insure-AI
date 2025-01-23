"use client";
import { jwtDecode } from "jwt-decode";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

type AuthContextValue = {
  isAuthenticated: boolean;
};

const AuthContext = React.createContext<AuthContextValue>({
  isAuthenticated: false,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  const path = usePathname();

  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");

    if (accessToken) {
      // Decode the access token to get the expiration time
      const decodedToken = jwtDecode(accessToken);
      const expirationTime = (decodedToken.exp ?? 0) * 1000; // Convert expiration time to milliseconds

      if (Date.now() < expirationTime) {
        // Token is not expired
        setIsAuthenticated(true);
      } else {
        // Token is expired
        setIsAuthenticated(false);
        localStorage.clear();
        router.push("/login");
      }
    } else {
      // No access token found, assuming first-time user
      setIsAuthenticated(false);

      localStorage.clear();

      // Redirect to login page if not already there
      if (path !== "/login" && path !== "/register") {
        router.push("/login");
      }
    }
  }, [router]);

  return (
    <AuthContext.Provider value={{ isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => React.useContext(AuthContext);
