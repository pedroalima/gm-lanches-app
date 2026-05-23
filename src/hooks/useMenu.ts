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
  const [addons, setAddons] = useState<MenuAddon[]>([]);
  const [isFetching, setIsFetching] = useState<boolean>(false); // Para o carregamento inicial da página
  const [isMutating, setIsMutating] = useState<boolean>(false); // Para criação/edição/exclusão (botões)
  const supabase = createClient();

  const fetchMenu = async () => {
    setIsFetching(true);
    const { data, error } = await supabase
      .from("menu")
      .select("*")
      .order("id", { ascending: true });

    if (!error && data) setMenu(data as MenuItem[]);
    setIsFetching(false);
  };

  // 3. NOVO: Função para buscar os adicionais direto do banco
  const fetchAddons = async () => {
    setIsFetching(true);
    const { data, error } = await supabase
      .from("menu_addons")
      .select("*")
      .order("id", { ascending: true });

    if (!error && data) setAddons(data as MenuAddon[]);
    setIsFetching(false);
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
    setMenu(newMenu);
  };

  // Exemplo de como envelopar as suas mutações com segurança:
  const addItem = async (name: string, price: number, category: string) => {
    try {
      setIsMutating(true);
      await supabase
        .from("menu")
        .insert([{ name, price, category: category.trim().toLowerCase() }]);
    } finally {
      setIsMutating(false);
    }
  };

  const updateItem = async (
    id: number,
    name: string,
    price: number,
    category: string,
  ) => {
    try {
      setIsMutating(true);
      await supabase
        .from("menu")
        .update({ name, price, category: category.trim().toLowerCase() })
        .eq("id", id);
    } finally {
      setIsMutating(false);
    }
  };

  const deleteItem = async (id: number) => {
    try {
      setIsMutating(true);
      await supabase.from("menu").delete().eq("id", id);
    } finally {
      setIsMutating(false);
    }
  };

  const addAddon = async (name: string, price: number, category: string) => {
    try {
      setIsMutating(true);
      await supabase
        .from("menu_addons")
        .insert([{ name, price, category: category.trim().toLowerCase() }]);
    } finally {
      setIsMutating(false);
    }
  };

  const deleteAddon = async (id: number) => {
    try {
      setIsMutating(true);
      await supabase.from("menu_addons").delete().eq("id", id);
    } finally {
      setIsMutating(false);
    }
  };

  return {
    menu,
    addons,
    isFetching,
    isMutating,
    saveMenu,
    addItem,
    updateItem,
    deleteItem,
    addAddon,
    deleteAddon,
  };
}
