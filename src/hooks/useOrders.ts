"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

export interface OrderItem {
  id: number;
  name: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  clientName: string;
  items: OrderItem[];
  status: "Pendente" | "Em Preparo" | "Pronto";
  createdAt: string;
}

export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isFetching, setIsFetching] = useState<boolean>(false); // Carregamento inicial ou puxado manualmente
  const [isMutating, setIsMutating] = useState<boolean>(false); // Carregamento de ações (criar, mudar status, deletar)
  const supabase = createClient();

  // Busca padrão com controle de loading visível
  const fetchOrders = async () => {
    try {
      setIsFetching(true);
      const { data, error } = await supabase.from("orders").select(
        "id, client_name, status, created_at, order_items(menu_id, name, quantity, price)", // <-- Adicionado price aqui
      );

      if (!error && data) {
        const formattedOrders: Order[] = data.map((o: any) => ({
          id: o.id,
          clientName: o.status, // Mantenha sua lógica original aqui
          status: o.status,
          createdAt: o.created_at,
          items: o.order_items.map((i: any) => ({
            id: i.menu_id,
            name: i.name,
            quantity: i.quantity,
            price: i.price, // <-- Mapeado para o estado do React
          })),
        }));
        setOrders(formattedOrders);
      }
    } finally {
      setIsFetching(false);
    }
  };

  // Função exclusiva para o Realtime atualizar a tela de forma silenciosa e fluida
  const refreshSilently = async () => {
    const { data, error } = await supabase.from("orders").select(
      "id, client_name, status, created_at, order_items(menu_id, name, quantity, price)", // <-- Adicionado price aqui
    );

    if (!error && data) {
      const formattedOrders: Order[] = data.map((o: any) => ({
        id: o.id,
        clientName: o.client_name,
        status: o.status,
        createdAt: o.created_at,
        items: o.order_items.map((i: any) => ({
          id: i.menu_id,
          name: i.name,
          quantity: i.quantity,
          price: i.price, // <-- Mapeado para o estado do React
        })),
      }));
      setOrders(formattedOrders);
    }
  };

  useEffect(() => {
    fetchOrders();

    // Escuta alterações em tempo real chamando o atualizador silencioso
    const channel = supabase
      .channel("orders_realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        () => refreshSilently(),
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "order_items" },
        () => refreshSilently(),
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const saveOrders = async (newOrders: Order[]) => {
    setOrders(newOrders);
  };

  // Atualiza o status do pedido na nuvem com tratamento de loading
  const updateStatus = async (
    id: string,
    nextStatus: "Pendente" | "Em Preparo" | "Pronto",
  ) => {
    try {
      setIsMutating(true);
      await supabase.from("orders").update({ status: nextStatus }).eq("id", id);
    } finally {
      setIsMutating(false);
    }
  };

  // Envia um novo pedido (usado na página do cliente / cardápio)
  const createOrder = async (
    clientName: string,
    items: OrderItem[],
    createdAt: string,
  ) => {
    try {
      setIsMutating(true);
      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .insert([
          {
            client_name: clientName,
            status: "Pendente",
            created_at: createdAt,
          },
        ])
        .select()
        .single();

      if (!orderError && orderData) {
        const itemsToInsert = items.map((item) => ({
          order_id: orderData.id,
          menu_id: item.id,
          name: item.name,
          quantity: item.quantity,
          price: item.price, // <-- Salvando o valor finalizado no banco de dados!
        }));
        await supabase.from("order_items").insert(itemsToInsert);
      }
    } finally {
      setIsMutating(false);
    }
  };

  const clearTab = async (statusList: string[]) => {
    try {
      setIsMutating(true);
      await supabase.from("orders").delete().in("status", statusList);
    } finally {
      setIsMutating(false);
    }
  };

  // Deleta um único pedido definitivo no banco de dados pelo ID dele
  const deleteOrder = async (id: string) => {
    try {
      setIsMutating(true);
      await supabase.from("orders").delete().eq("id", id);
    } finally {
      setIsMutating(false);
    }
  };

  return {
    orders,
    isFetching,
    isMutating,
    saveOrders,
    updateStatus,
    createOrder,
    clearTab,
    deleteOrder,
  };
}
