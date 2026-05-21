"use client";

import { useOrders } from "@/src/hooks/useOrders"; // Ajustado o caminho se o erro persistir
import { useAuth } from "@/src/hooks/useAuth";
import { LoginForm } from "@/src/components/LoginForm";

export default function CozinhaPage() {
  const { orders, saveOrders } = useOrders();
  const { isAuthenticated, error, login, logout } = useAuth();

  const updateStatus = (id: string, nextStatus: "Em Preparo" | "Pronto") => {
    const updated = orders.map((o) =>
      o.id === id ? { ...o, status: nextStatus } : o,
    );
    saveOrders(updated);
  };

  const clearAll = () => {
    if (
      confirm(
        "Atenção: Isso irá apagar todo o histórico de pedidos da tela. Continuar?",
      )
    ) {
      saveOrders([]);
    }
  };

  // 1. Se NÃO estiver autenticado, exibe o formulário de Login
  if (!isAuthenticated) {
    return <LoginForm onLogin={login} error={error} />;
  }

  // 2. Se ESTIVER autenticado, renderiza a tela da cozinha normal que você já tinha feito
  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex justify-between items-center border-b pb-4">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-blue-700">
            👨‍🍳 Painel de Pedidos (Cozinha)
          </h1>
          <button
            onClick={logout}
            className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 px-2 py-1 rounded border transition-colors"
          >
            Sair
          </button>
        </div>
        {orders.length > 0 && (
          <button
            onClick={clearAll}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
          >
            Limpar Todos os Pedidos
          </button>
        )}
      </div>

      {orders.length === 0 ? (
        <p className="text-gray-500 text-center py-12">
          Nenhum pedido recebido ainda.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {orders.map((order) => (
            <div
              key={order.id}
              className="p-4 border rounded-xl shadow-sm bg-white flex flex-col justify-between"
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

                <ul className="space-y-1 mb-4 border-t pt-2">
                  {order.items.map((item, index) => (
                    <li
                      key={index}
                      className="text-sm text-gray-700 font-medium"
                    >
                      <span className="text-orange-600 font-bold">
                        {item.quantity}x
                      </span>{" "}
                      {item.name}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex items-center justify-between pt-2 border-t mt-auto">
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
                      className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded font-semibold transition-colors"
                    >
                      Aceitar
                    </button>
                  )}
                  {order.status === "Em Preparo" && (
                    <button
                      onClick={() => updateStatus(order.id, "Pronto")}
                      className="text-xs bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded font-semibold transition-colors"
                    >
                      Concluir
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
