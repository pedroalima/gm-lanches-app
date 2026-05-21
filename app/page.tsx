"use client";

import { useState } from "react";
import { useOrders, Order } from "../src/hooks/useOrders";

const MENU = [
  { id: 1, name: "X-Burger", price: 18.0 },
  { id: 2, name: "Batata Frita", price: 12.0 },
  { id: 3, name: "Refrigerante LATA", price: 6.0 },
];

export default function CardapioPage() {
  const { orders, saveOrders } = useOrders();
  const [clientName, setClientName] = useState("");
  const [cart, setCart] = useState<{ [key: number]: number }>({});

  const handleQuantity = (id: number, delta: number) => {
    setCart((prev) => {
      const next = (prev[id] || 0) + delta;
      if (next <= 0) {
        const { [id]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [id]: next };
    });
  };

  const handleSendOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim() || Object.keys(cart).length === 0) return;

    const items = Object.entries(cart).map(([itemId, qty]) => {
      const item = MENU.find((m) => m.id === Number(itemId));
      return { id: Number(itemId), name: item?.name || "", quantity: qty };
    });

    const newOrder: Order = {
      id: Math.random().toString(36).substring(2, 9),
      clientName,
      items,
      status: "Pendente",
      createdAt: new Date().toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    saveOrders([...orders, newOrder]);
    setClientName("");
    setCart({});
    alert("Pedido enviado com sucesso para a cozinha! 🎉");
  };

  return (
    <div className="p-6 max-w-md mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-orange-600">🍔 Faça seu Pedido</h1>

      <form onSubmit={handleSendOrder} className="space-y-4">
        {MENU.map((item) => (
          <div
            key={item.id}
            className="flex justify-between items-center p-4 border rounded-xl shadow-sm bg-white"
          >
            <div>
              <p className="font-semibold text-gray-800">{item.name}</p>
              <p className="text-sm text-gray-500">
                R$ {item.price.toFixed(2)}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => handleQuantity(item.id, -1)}
                className="w-8 h-8 bg-gray-100 rounded-full font-bold"
              >
                -
              </button>
              <span className="w-4 text-center font-medium">
                {cart[item.id] || 0}
              </span>
              <button
                type="button"
                onClick={() => handleQuantity(item.id, 1)}
                className="w-8 h-8 bg-orange-100 text-orange-600 rounded-full font-bold"
              >
                +
              </button>
            </div>
          </div>
        ))}

        <input
          type="text"
          placeholder="Digite seu nome"
          required
          value={clientName}
          onChange={(e) => setClientName(e.target.value)}
          className="w-full p-3 border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
        />

        <button
          type="submit"
          className="w-full bg-orange-500 hover:bg-orange-600 text-white p-4 rounded-xl font-bold transition-colors shadow-md"
        >
          Confirmar e Enviar
        </button>
      </form>
    </div>
  );
}
