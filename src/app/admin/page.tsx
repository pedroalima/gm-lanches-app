"use client";

import { useState, useEffect } from "react"; // Adicionado useEffect
import { useOrders } from "@/src/hooks/useOrders";
import { useAuth } from "@/src/hooks/useAuth";
import { LoginForm } from "@/src/components/LoginForm";
import Link from "next/link";
import { useMenu } from "@/src/hooks/useMenu";

export default function AdminPage() {
  const { orders, updateStatus, clearTab } = useOrders();
  const { isAuthenticated, error, login, logout } = useAuth();
  const { menu } = useMenu();

  // Estado para controlar a aba ativa: "cozinha" (Pendentes + Em Preparo) ou "prontos" (Prontos)
  const [activeTab, setActiveTab] = useState<"cozinha" | "prontos">("cozinha");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Limpa apenas os pedidos da aba atual para não apagar tudo por engano
  const clearCurrentTab = async () => {
    const mensagem =
      activeTab === "cozinha"
        ? "Deseja limpar todos os pedidos em andamento?"
        : "Deseja limpar o histórico de pedidos prontos?";

    if (confirm(mensagem)) {
      const statusParaDeletar =
        activeTab === "cozinha" ? ["Pendente", "Em Preparo"] : ["Pronto"];
      await clearTab(statusParaDeletar);
    }
  };

  if (!mounted) return <div className="min-h-screen bg-gray-50" />;
  if (!isAuthenticated) return <LoginForm onLogin={login} error={error} />;

  // Filtragem dos pedidos com base na aba ativa
  const pendingOrders = orders.filter(
    (o) => o.status === "Pendente" || o.status === "Em Preparo",
  );
  const completedOrders = orders.filter((o) => o.status === "Pronto");
  const currentOrders =
    activeTab === "cozinha" ? pendingOrders : completedOrders;

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col gap-4 pb-6 border-b border-gray-200 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center justify-between md:justify-start gap-3">
          <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            <span className="text-3xl">👨‍🍳</span> Painel de Pedidos
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:flex-nowrap">
          <Link
            href="/admin/cardapio"
            className="flex-1 sm:flex-none text-center bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-sm shadow-orange-100 flex items-center justify-center gap-1.5"
          >
            <span>✏️</span> Gerenciar Cardápio
          </Link>

          <button
            onClick={logout}
            className="bg-gray-100 hover:bg-gray-200 active:bg-gray-300 text-gray-600 text-xs font-bold px-3 py-2.5 rounded-xl transition-all border border-gray-300"
          >
            Sair
          </button>
        </div>
      </div>

      {/* Seleção de Abas Interativas */}
      <div className="flex bg-gray-100 p-1.5 rounded-2xl border border-gray-200">
        <button
          onClick={() => setActiveTab("cozinha")}
          className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs font-black rounded-xl transition-all ${
            activeTab === "cozinha"
              ? "bg-white text-blue-700 shadow-sm border border-gray-200"
              : "text-gray-500 hover:text-gray-900"
          }`}
        >
          🍳 Na Cozinha
          <span
            className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${activeTab === "cozinha" ? "bg-blue-100 text-blue-800" : "bg-gray-200 text-gray-600"}`}
          >
            {pendingOrders.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("prontos")}
          className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs font-black rounded-xl transition-all ${
            activeTab === "prontos"
              ? "bg-white text-green-700 shadow-sm border border-gray-200"
              : "text-gray-500 hover:text-gray-900"
          }`}
        >
          ✅ Prontos para Entrega
          <span
            className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${activeTab === "prontos" ? "bg-green-100 text-green-800" : "bg-gray-200 text-gray-600"}`}
          >
            {completedOrders.length}
          </span>
        </button>
      </div>

      {/* Grid de Pedidos Filtrados */}
      {currentOrders.length === 0 ? (
        <p className="text-gray-500 text-center py-12 bg-gray-50 rounded-2xl border border-dashed">
          {activeTab === "cozinha"
            ? "Nenhum pedido em preparo no momento."
            : "Nenhum pedido foi finalizado ainda."}
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {currentOrders.map((order) => {
            const orderTotal = order.items.reduce((total, item) => {
              const produtoNoMenu = menu.find(
                (m) => m.id === item.id || m.name === item.name,
              );
              const itemPrice = produtoNoMenu ? produtoNoMenu.price : 0;
              return total + item.quantity * itemPrice;
            }, 0);

            return (
              <div
                key={order.id}
                className="p-4 border rounded-xl shadow-sm bg-white flex flex-col justify-between hover:border-gray-300 transition-colors"
              >
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg text-gray-900">
                      {order.clientName}
                    </h3>
                    <span className="text-xs text-gray-400">
                      {order.createdAt}
                    </span>
                  </div>

                  <ul className="space-y-1.5 mb-4 border-t pt-2">
                    {order.items.map((item, index) => {
                      const produtoNoMenu = menu.find(
                        (m) => m.id === item.id || m.name === item.name,
                      );
                      const itemPrice = produtoNoMenu ? produtoNoMenu.price : 0;

                      return (
                        <li
                          key={index}
                          className="text-sm text-gray-700 font-medium flex justify-between items-center"
                        >
                          <div>
                            <span className="text-orange-600 font-bold mr-1.5">
                              {item.quantity}x
                            </span>{" "}
                            {item.name}
                          </div>
                          <span className="text-xs text-gray-500 font-mono">
                            R$ {(item.quantity * itemPrice).toFixed(2)}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-3 bg-gray-50 p-2 rounded-lg border border-dashed">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Total
                    </span>
                    <span className="text-base font-black text-gray-900 font-mono">
                      R$ {orderTotal.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t">
                    <span
                      className={`text-xs px-2 py-1 rounded-md font-bold ${
                        order.status === "Pendente"
                          ? "bg-yellow-100 text-yellow-800"
                          : order.status === "Em Preparo"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-green-100 text-green-800"
                      }`}
                    >
                      {order.status}
                    </span>

                    <div className="flex gap-1">
                      {order.status === "Pendente" && (
                        <button
                          onClick={() => updateStatus(order.id, "Em Preparo")}
                          className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-2.5 py-1.5 rounded-lg font-semibold transition-colors"
                        >
                          Aceitar
                        </button>
                      )}
                      {order.status === "Em Preparo" && (
                        <button
                          onClick={() => updateStatus(order.id, "Pronto")}
                          className="text-xs bg-green-600 hover:bg-green-700 text-white px-2.5 py-1.5 rounded-lg font-semibold transition-colors"
                        >
                          Concluir
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Botão de Limpeza contextualizado */}
      {currentOrders.length > 0 && (
        <button
          onClick={clearCurrentTab}
          className="w-full bg-red-50 hover:bg-red-100 text-red-600 active:bg-red-200 text-xs font-bold px-4 py-2.5 rounded-xl transition-all border border-red-200"
        >
          {activeTab === "cozinha"
            ? "❌ Limpar Pedidos da Cozinha"
            : "🧹 Limpar Histórico de Prontos"}
        </button>
      )}
    </div>
  );
}
