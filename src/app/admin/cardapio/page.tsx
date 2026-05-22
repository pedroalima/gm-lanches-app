"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useMenu } from "@/src/hooks/useMenu";
import { useAuth } from "@/src/hooks/useAuth";
import { LoginForm } from "@/src/components/LoginForm";
import { Modal } from "@/src/components/Modal";

export const dynamic = "force-dynamic";

export default function GerenciarCardapioPage() {
  const { menu, addItem, updateItem, deleteItem } = useMenu();
  const { isAuthenticated, error, login } = useAuth();
  const [mounted, setMounted] = useState(false);

  // Estados do formulário (Adicionar / Editar)
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
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

  if (!mounted) return <div className="min-h-screen bg-gray-50" />;
  if (!isAuthenticated) return <LoginForm onLogin={login} error={error} />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !price) return;

    if (editingId !== null) {
      // Editar item existente direto no Supabase
      await updateItem(editingId, name, Number(price));
      setEditingId(null);
    } else {
      // Adicionar novo item direto no Supabase
      await addItem(name, Number(price));
    }

    setName("");
    setPrice("");
  };

  const handleEditInit = (item: any) => {
    setEditingId(item.id);
    setName(item.name);
    setPrice(item.price.toString());
  };

  const handleDelete = (id: number) => {
    const item = menu.find((m) => m.id === id);

    setModalConfig({
      isOpen: true,
      title: "Remover do Cardápio? 🗑️",
      description: `Tem certeza que deseja excluir permanentemente o item "${item?.name || "este item"}"?`,
      confirmLabel: "Excluir Item",
      variant: "danger",
      onConfirm: async () => {
        // Deleta direto no Supabase
        await deleteItem(id);

        // Se o usuário estiver editando o item que acabou de ser deletado, limpa o formulário
        if (editingId === id) {
          setEditingId(null);
          setName("");
          setPrice("");
        }
      },
    });
  };

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div className="flex justify-between items-center border-b pb-4">
        <h1 className="text-2xl font-bold text-gray-950">
          🍔 Gerenciar Itens do Cardápio
        </h1>
        <Link
          href="/admin"
          className="text-sm bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded-lg transition-colors"
        >
          Voltar para Pedidos
        </Link>
      </div>

      {/* Formulário */}
      <form
        onSubmit={handleSubmit}
        className="p-4 border rounded-xl bg-white shadow-sm flex flex-col sm:flex-row gap-3 items-end"
      >
        <div className="flex-1 w-full">
          <label className="block text-xs font-bold text-gray-600 mb-1">
            Nome do Item
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: X-Salada Especial"
            className="w-full p-2 border rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none"
          />
        </div>
        <div className="w-full sm:w-32">
          <label className="block text-xs font-bold text-gray-600 mb-1">
            Preço (R$)
          </label>
          <input
            type="number"
            step="0.01"
            required
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="0.00"
            className="w-full p-2 border rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none"
          />
        </div>
        <button
          type="submit"
          className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg text-sm font-bold transition-colors"
        >
          {editingId !== null ? "Salvar" : "Adicionar"}
        </button>
      </form>

      {/* Lista de Itens Atuais */}
      <div className="border rounded-xl bg-white shadow-sm divide-y">
        {menu.map((item) => (
          <div key={item.id} className="p-4 flex justify-between items-center">
            <div>
              <p className="font-semibold text-gray-900">{item.name}</p>
              <p className="text-sm text-gray-500">
                R$ {item.price.toFixed(2)}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleEditInit(item)}
                className="text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-1.5 rounded-lg font-medium transition-colors"
              >
                Editar
              </button>
              <button
                onClick={() => handleDelete(item.id)}
                className="text-xs bg-red-50 hover:bg-red-100 text-red-600 px-3 py-1.5 rounded-lg font-medium transition-colors"
              >
                Excluir
              </button>
            </div>
          </div>
        ))}
      </div>

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
