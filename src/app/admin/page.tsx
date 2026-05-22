"use client";

import { useState, useEffect } from "react"; // Adicionado useEffect
import { useOrders } from "@/src/hooks/useOrders";
import { useAuth } from "@/src/hooks/useAuth";
import { LoginForm } from "@/src/components/LoginForm";
import Link from "next/link";
import { useMenu } from "@/src/hooks/useMenu";
import { Modal } from "@/src/components/Modal";

export default function AdminPage() {
  const { orders, updateStatus, clearTab, deleteOrder } = useOrders();
  const { isAuthenticated, error, login, logout } = useAuth();
  const { menu } = useMenu();

  // Estado para controlar a aba ativa: "cozinha" (Pendentes + Em Preparo) ou "prontos" (Prontos)
  const [activeTab, setActiveTab] = useState<"cozinha" | "prontos">("cozinha");
  const [mounted, setMounted] = useState(false);
  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    confirmLabel?: string;
    variant?: "danger" | "success" | "warning";
    onConfirm?: () => void;
  }>({
    isOpen: false,
    title: "",
    description: "",
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  // Limpa apenas os pedidos da aba atual para não apagar tudo por engano
  const clearCurrentTab = () => {
    const isCozinha = activeTab === "cozinha";

    setModalConfig({
      isOpen: true,
      title: isCozinha ? "Limpar Cozinha? 🍳" : "Limpar Histórico? 🧹",
      description: isCozinha
        ? "Isso vai apagar definitivamente todos os pedidos Pendentes e Em Preparo da tela."
        : "Isso apaga o histórico de pedidos que já foram entregues.",
      confirmLabel: "Limpar Tudo",
      variant: "danger",
      onConfirm: async () => {
        const statusParaDeletar = isCozinha
          ? ["Pendente", "Em Preparo"]
          : ["Pronto"];
        await clearTab(statusParaDeletar);
      },
    });
  };

  const handleDeleteOrder = (id: string) => {
    setModalConfig({
      isOpen: true,
      title: "Excluir Pedido 🗑️",
      description:
        "Deseja mesmo remover permanentemente este pedido do painel de controle?",
      confirmLabel: "Excluir",
      variant: "danger",
      onConfirm: async () => {
        if (typeof deleteOrder === "function") {
          await deleteOrder(id);
        }
      },
    });
  };

  if (!mounted) return <div className="min-h-screen bg-gray-50" />;
  if (!isAuthenticated) return <LoginForm onLogin={login} error={error} />;

  // 1. Filtra e ordena a aba da Cozinha (Em Preparo no topo, depois Pendentes)
  const pendingOrders = orders
    .filter((o) => o.status === "Pendente" || o.status === "Em Preparo")
    .sort((a, b) => {
      // Se um está em preparo e o outro não, o em preparo sobe (prioridade 1)
      if (a.status === "Em Preparo" && b.status !== "Em Preparo") return -1;
      if (a.status !== "Em Preparo" && b.status === "Em Preparo") return 1;

      // Se ambos tiverem o mesmo status, ordena pelo horário de criação (mais antigo no topo da fila)
      return a.createdAt.localeCompare(b.createdAt);
    });

  // 2. Filtra e ordena a aba de Prontos (Últimos finalizados no topo)
  const completedOrders = orders
    .filter((o) => o.status === "Pronto")
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  // 3. Define qual lista exibir com base na aba ativa
  const currentOrders =
    activeTab === "cozinha" ? pendingOrders : completedOrders;

  return (
    <div className="p-4 mx-9/10 space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col gap-4 pb-6 border-b border-gray-200 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center justify-between md:justify-start gap-3">
          <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            <span className="text-3xl">👨‍🍳</span> Painel de Pedidos
          </h1>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <Link
            href="/"
            className="w-full sm:w-auto text-center bg-gray-800 hover:bg-gray-950 active:bg-black text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5"
          >
            <span>🛒</span> Ver Cardápio
          </Link>

          <Link
            href="/admin/cardapio"
            className="w-full sm:w-auto text-center bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-sm shadow-orange-100 flex items-center justify-center gap-1.5"
          >
            <span>✏️</span> Gerenciar Cardápio
          </Link>

          <button
            onClick={logout}
            className="w-full sm:w-auto bg-red-500 hover:bg-red-600 active:bg-red-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all border border-red-600 shadow-sm flex items-center justify-center"
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
          ✅ Prontos
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
                className="p-4 border rounded-xl shadow-sm bg-white flex flex-col justify-between hover:border-gray-300 transition-colors relative"
              >
                <div>
                  {/* Cabeçalho do Card: Nome e Tag de Status no lugar do Horário */}
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-bold text-lg text-gray-900 truncate pr-2">
                      {order.clientName}
                    </h3>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-md font-bold whitespace-nowrap ${
                        order.status === "Pendente"
                          ? "bg-yellow-100 text-yellow-800"
                          : order.status === "Em Preparo"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-green-100 text-green-800"
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>

                  {/* Horário posicionado abaixo do nome do cliente */}
                  <div className="text-xs text-gray-400 mb-3 flex justify-between items-center">
                    <span>{order.createdAt}</span>
                    {/* Botão de Deletar Pedido Individual */}
                    <button
                      onClick={() => handleDeleteOrder(order.id)}
                      className="text-gray-400 hover:text-red-600 transition-colors p-1"
                      title="Excluir pedido"
                    >
                      🗑️
                    </button>
                  </div>

                  {/* Lista de Itens */}
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

                {/* Rodapé do Card (Footer) */}
                <div>
                  <div className="flex justify-between items-center mb-3 bg-gray-50 p-2 rounded-lg border border-dashed">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Total
                    </span>
                    <span className="text-base font-black text-gray-900 font-mono">
                      R$ {orderTotal.toFixed(2)}
                    </span>
                  </div>

                  {/* Opções de Status no Footer com Reversibilidade Dinâmica */}
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t">
                    {/* Botão Em Preparo */}
                    <button
                      onClick={() =>
                        updateStatus(
                          order.id,
                          order.status === "Em Preparo"
                            ? "Pendente"
                            : "Em Preparo",
                        )
                      }
                      className={`text-xs py-2 rounded-lg font-bold transition-colors ${
                        order.status === "Em Preparo"
                          ? "bg-blue-600 hover:bg-blue-700 text-white shadow-inner"
                          : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                      }`}
                    >
                      {order.status === "Em Preparo"
                        ? "↩️ Voltar Pendente"
                        : "👨‍🍳 Em Preparo"}
                    </button>

                    {/* Botão Pronto */}
                    <button
                      onClick={() =>
                        updateStatus(
                          order.id,
                          order.status === "Pronto" ? "Em Preparo" : "Pronto",
                        )
                      }
                      className={`text-xs py-2 rounded-lg font-bold transition-colors ${
                        order.status === "Pronto"
                          ? "bg-green-600 hover:bg-green-700 text-white shadow-inner"
                          : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                      }`}
                    >
                      {order.status === "Pronto"
                        ? "↩️ Reverter Preparo"
                        : "✅ Pronto"}
                    </button>
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

      <Modal
        isOpen={modalConfig.isOpen}
        title={modalConfig.title}
        description={modalConfig.description}
        confirmLabel={modalConfig.confirmLabel}
        variant={modalConfig.variant}
        onConfirm={modalConfig.onConfirm}
        onClose={() => setModalConfig((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
