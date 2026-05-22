"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

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
  const [orders, setOrders] = useState<Order[]>([]);
  const supabase = createClient();

  const fetchOrders = async () => {
    // Busca os pedidos e faz o JOIN automático trazendo seus respectivos itens
    const { data, error } = await supabase
      .from("orders")
      .select(
        "id, client_name, status, created_at, order_items(menu_id, name, quantity)",
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
        })),
      }));
      setOrders(formattedOrders);
    }
  };

  useEffect(() => {
    fetchOrders();

    // Escuta alterações de pedidos e itens em tempo real de qualquer celular/PC
    const channel = supabase
      .channel("orders_realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        () => fetchOrders(),
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "order_items" },
        () => fetchOrders(),
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const saveOrders = async (newOrders: Order[]) => {
    setOrders(newOrders);
  };

  // Atualiza o status do pedido na nuvem
  const updateStatus = async (
    id: string,
    nextStatus: "Pendente" | "Em Preparo" | "Pronto",
  ) => {
    await supabase.from("orders").update({ status: nextStatus }).eq("id", id);
  };

  // Envia um novo pedido (usado na página do cliente / cardápio)
  const createOrder = async (
    clientName: string,
    items: OrderItem[],
    createdAt: string,
  ) => {
    const { data: orderData, error: orderError } = await supabase
      .from("orders")
      .insert([
        { client_name: clientName, status: "Pendente", created_at: createdAt },
      ])
      .select()
      .single();

    if (!orderError && orderData) {
      const itemsToInsert = items.map((item) => ({
        order_id: orderData.id,
        menu_id: item.id,
        name: item.name,
        quantity: item.quantity,
      }));
      await supabase.from("order_items").insert(itemsToInsert);
    }
  };

  const clearTab = async (statusList: string[]) => {
    await supabase.from("orders").delete().in("status", statusList);
  };

  // Deleta um único pedido definitivo no banco de dados pelo ID dele
  const deleteOrder = async (id: string) => {
    await supabase.from("orders").delete().eq("id", id);
  };

  return {
    orders,
    saveOrders,
    updateStatus,
    createOrder,
    clearTab,
    deleteOrder,
  };
}
