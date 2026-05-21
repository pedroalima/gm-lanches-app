"use client";

import { useState, useEffect } from "react";

export interface MenuItem {
  id: number;
  name: string;
  price: number;
}

const DEFAULT_MENU: MenuItem[] = [
  { id: 1, name: "X-Burger", price: 18.0 },
  { id: 2, name: "Batata Frita", price: 12.0 },
  { id: 3, name: "Refrigerante LATA", price: 6.0 },
];

export function useMenu() {
  const [menu, setMenu] = useState<MenuItem[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("lanchonete_menu");
      return saved ? JSON.parse(saved) : DEFAULT_MENU;
    }
    return DEFAULT_MENU;
  });

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "lanchonete_menu" && e.newValue) {
        setMenu(JSON.parse(e.newValue));
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const saveMenu = (newMenu: MenuItem[]) => {
    setMenu(newMenu);
    localStorage.setItem("lanchonete_menu", JSON.stringify(newMenu));
  };

  return { menu, saveMenu };
}
