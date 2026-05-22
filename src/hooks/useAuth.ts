"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [error, setError] = useState("");
  const supabase = createClient();

  // Verifica se o usuário já estava logado na nuvem ao abrir o app
  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
    };
    checkUser();
  }, []);

  const login = async (username: string, password: string) => {
    setError("");

    // O username que você digitar no formulário (ex: admin) pode ser convertido
    // para o e-mail que você cadastrou lá no painel do Supabase
    const email = username.includes("@") ? username : "admin@lanchonete.com";

    const { error: supabaseError } = await supabase.auth.signInWithPassword({
      email,
      password, // Use a senha que cadastrou no painel (mínimo 6 caracteres)
    });

    if (supabaseError) {
      setError("Usuário ou senha incorretos na nuvem!");
      setIsAuthenticated(false);
      return false;
    }

    setIsAuthenticated(true);
    return true;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setIsAuthenticated(false);
  };

  return { isAuthenticated, error, login, logout };
}
