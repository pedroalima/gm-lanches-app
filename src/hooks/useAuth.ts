"use client";

import { useState } from "react";

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return sessionStorage.getItem("cozinha_auth") === "true";
    }
    return false;
  });
  const [error, setError] = useState("");

  const login = (username: string, password: string) => {
    // Altere aqui suas credenciais se quiser
    if (username === "admin" && password === "1234") {
      sessionStorage.setItem("cozinha_auth", "true");
      setIsAuthenticated(true);
      setError("");
      return true;
    } else {
      setError("Usuário ou senha incorretos!");
      return false;
    }
  };

  const logout = () => {
    sessionStorage.removeItem("cozinha_auth");
    setIsAuthenticated(false);
  };

  return { isAuthenticated, error, login, logout };
}
