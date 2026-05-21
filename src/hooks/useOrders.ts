"use client";

import { useState, useEffect } from "react";

export interface OrderItem {
  id: number;
  name: string;
  quantity: number;
}

export interface Order {
  id: string;
  clientName: string;
  items: OrderItem[];
  status: "Pendente" | "Em Preparo" | "Pronto";
  createdAt: string;
}

export function useOrders() {
  const [orders, setOrders] = useState<Order[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("lanchonete_orders");
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  // Seu useEffect agora serve EXCLUSIVAMENTE para ouvir outras abas
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "lanchonete_orders") {
        setOrders(e.newValue ? JSON.parse(e.newValue) : []);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Função central para salvar dados
  const saveOrders = (newOrders: Order[]) => {
    setOrders(newOrders);
    localStorage.setItem("lanchonete_orders", JSON.stringify(newOrders));
  };

  return { orders, saveOrders };
}
