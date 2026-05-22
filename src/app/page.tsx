"use client";

import { useState } from "react";
import { useOrders, Order } from "../hooks/useOrders";
import { useMenu } from "../hooks/useMenu";
import { Modal } from "../components/Modal";
import { useAuth } from "../hooks/useAuth";
import { Link } from "lucide-react";

export default function CardapioPage() {
  const { createOrder } = useOrders();
  const [clientName, setClientName] = useState("");
  const [cart, setCart] = useState<{ [key: number]: number }>({});
  const { menu } = useMenu();
  const [errorMessage, setErrorMessage] = useState("");
  const [sucessoOpen, setSucessoOpen] = useState(false);
  const { isAuthenticated } = useAuth();

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

  const handleSendOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!clientName.trim()) return;

    // Validação se o Carrinho está Vazio
    if (Object.keys(cart).length === 0) {
      setErrorMessage("⚠️ Adicione pelo menos um item ao seu pedido. 🛒🍔");
      return;
    }

    // Formata os itens do carrinho para o padrão do hook
    const items = Object.entries(cart).map(([itemId, qty]) => {
      const item = menu.find((m) => m.id === Number(itemId));
      return { id: Number(itemId), name: item?.name || "", quantity: qty };
    });

    const createdAt = new Date().toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });

    try {
      // Envia diretamente para o banco de dados via Supabase
      await createOrder(clientName, items, createdAt);

      // Limpa os estados locais após o sucesso
      setClientName("");
      setCart({});
      setSucessoOpen(true);
    } catch (error) {
      console.error("Erro ao enviar pedido:", error);
      setErrorMessage(
        "⚠️ Ops! Ocorreu um erro ao enviar seu pedido. Tente novamente.",
      );
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-orange-600">🍔 Faça seu Pedido</h1>

      {isAuthenticated && (
        <Link
          href="/admin"
          className="text-xs bg-gray-800 hover:bg-gray-900 text-white font-bold px-3 py-1.5 rounded-lg transition-colors shadow-sm flex items-center gap-1"
        >
          👨‍🍳 Admin
        </Link>
      )}

      <form onSubmit={handleSendOrder} className="space-y-4">
        {menu.map((item) => (
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

        {/* Bloco de Mensagem de Erro em texto vermelho */}
        {errorMessage && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 p-3 rounded-xl text-center font-bold animate-pulse">
            {errorMessage}
          </p>
        )}

        <button
          type="submit"
          className="w-full bg-orange-500 hover:bg-orange-600 text-white p-4 rounded-xl font-bold transition-colors shadow-md"
        >
          Confirmar e Enviar
        </button>
      </form>

      <Modal
        isOpen={sucessoOpen}
        title="Pedido Recebido! 🎉"
        description="Seu pedido já foi enviado diretamente para as telas da nossa cozinha e está na fila de preparo!"
        onClose={() => setSucessoOpen(false)}
        variant="warning" // Deixa o botão laranja combinando com o tema do app
      />
    </div>
  );
}
