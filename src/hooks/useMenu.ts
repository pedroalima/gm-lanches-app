import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

export interface MenuItem {
  id: number;
  name: string;
  price: number;
  category: string;
}

// 1. NOVO: Interface para mapear a nova tabela do banco
export interface MenuAddon {
  id: number;
  name: string;
  price: number;
  category: string;
}

export function useMenu() {
  const [menu, setMenu] = useState<MenuItem[]>([]);
  // 2. NOVO: Estado para guardar os adicionais do banco
  const [addons, setAddons] = useState<MenuAddon[]>([]);
  const supabase = createClient();

  const fetchMenu = async () => {
    const { data, error } = await supabase
      .from("menu")
      .select("*")
      .order("id", { ascending: true });

    if (!error && data) setMenu(data as MenuItem[]);
  };

  // 3. NOVO: Função para buscar os adicionais direto do banco
  const fetchAddons = async () => {
    const { data, error } = await supabase
      .from("menu_addons")
      .select("*")
      .order("id", { ascending: true });

    if (!error && data) setAddons(data as MenuAddon[]);
  };

  useEffect(() => {
    fetchMenu();
    fetchAddons();

    const channel = supabase
      .channel("menu_realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "menu" },
        () => {
          fetchMenu();
        },
      )
      // 4. NOVO: Escuta mudanças nos adicionais em tempo real também!
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "menu_addons" },
        () => {
          fetchAddons();
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

  // ATUALIZADO: Inclui a categoria na criação
  const addItem = async (name: string, price: number, category: string) => {
    await supabase
      .from("menu")
      .insert([{ name, price, category: category.trim().toLowerCase() }]);
  };

  // ATUALIZADO: Inclui a categoria na edição
  const updateItem = async (
    id: number,
    name: string,
    price: number,
    category: string,
  ) => {
    await supabase
      .from("menu")
      .update({ name, price, category: category.trim().toLowerCase() })
      .eq("id", id);
  };

  const deleteItem = async (id: number) => {
    await supabase.from("menu").delete().eq("id", id);
  };

  // NOVO: Adicionar Adicional direto no Supabase
  const addAddon = async (name: string, price: number, category: string) => {
    await supabase
      .from("menu_addons")
      .insert([{ name, price, category: category.trim().toLowerCase() }]);
  };

  // NOVO: Deletar Adicional do Supabase
  const deleteAddon = async (id: number) => {
    await supabase.from("menu_addons").delete().eq("id", id);
  };

  return {
    menu,
    addons,
    saveMenu,
    addItem,
    updateItem,
    deleteItem,
    addAddon,
    deleteAddon,
  };
}
