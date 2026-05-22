"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

export interface MenuItem {
  id: number;
  name: string;
  price: number;
}

export function useMenu() {
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const supabase = createClient();

  // Carrega o cardápio inicial
  const fetchMenu = async () => {
    const { data, error } = await supabase
      .from("menu")
      .select("*")
      .order("id", { ascending: true });

    if (!error && data) setMenu(data as MenuItem[]);
  };

  useEffect(() => {
    fetchMenu();

    // Liga a escuta em tempo real (Corrigido para 'schema')
    const channel = supabase
      .channel("menu_realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "menu" },
        () => {
          fetchMenu();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const saveMenu = async (newMenu: MenuItem[]) => {
    // Como o admin adiciona ou edita um por vez, enviamos as alterações direto
    // Para simplificar o seu código atual, esta função pode salvar o último item alterado:
    setMenu(newMenu);
  };

  // Funções auxiliares diretas do Supabase para usar no formulário
  const addItem = async (name: string, price: number) => {
    await supabase.from("menu").insert([{ name, price }]);
  };

  const updateItem = async (id: number, name: string, price: number) => {
    await supabase.from("menu").update({ name, price }).eq("id", id);
  };

  const deleteItem = async (id: number) => {
    await supabase.from("menu").delete().eq("id", id);
  };

  return { menu, saveMenu, addItem, updateItem, deleteItem };
}
