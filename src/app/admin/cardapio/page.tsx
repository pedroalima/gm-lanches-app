"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useMenu } from "@/src/hooks/useMenu";
import { useAuth } from "@/src/hooks/useAuth";
import { LoginForm } from "@/src/components/LoginForm";
import { Modal } from "@/src/components/Modal";

export const dynamic = "force-dynamic";

export default function GerenciarCardapioPage() {
  const {
    menu,
    addons,
    addItem,
    updateItem,
    deleteItem,
    addAddon,
    deleteAddon,
  } = useMenu();
  const { isAuthenticated, error, login } = useAuth();
  const [mounted, setMounted] = useState(false);

  // Estados do formulário de Itens do Menu
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);

  // Estados do formulário de Novos Adicionais
  const [addonName, setAddonName] = useState("");
  const [addonPrice, setAddonPrice] = useState("");
  const [addonCategory, setAddonCategory] = useState("");

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

  // Manipula envio de Itens Principais
  const handleSubmitItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !price || !category.trim()) return;

    if (editingId !== null) {
      await updateItem(editingId, name, Number(price), category);
      setEditingId(null);
    } else {
      await addItem(name, Number(price), category);
    }

    setName("");
    setPrice("");
    setCategory("");
  };

  // Manipula criação de Adicionais
  const handleSubmitAddon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addonName.trim() || !addonPrice || !addonCategory.trim()) return;

    await addAddon(addonName, Number(addonPrice), addonCategory);

    setAddonName("");
    setAddonPrice("");
    setAddonCategory("");
  };

  const handleEditInit = (item: any) => {
    setEditingId(item.id);
    setName(item.name);
    setPrice(item.price.toString());
    setCategory(item.category);
  };

  const handleDeleteItem = (id: number) => {
    const item = menu.find((m) => m.id === id);
    setModalConfig({
      isOpen: true,
      title: "Remover do Cardápio? 🗑️",
      description: `Tem certeza que deseja excluir permanentemente o item "${item?.name || "este item"}"?`,
      confirmLabel: "Excluir Item",
      variant: "danger",
      onConfirm: async () => {
        await deleteItem(id);
        if (editingId === id) {
          setEditingId(null);
          setName("");
          setPrice("");
          setCategory("");
        }
      },
    });
  };

  const handleDeleteAddon = (id: number, name: string) => {
    setModalConfig({
      isOpen: true,
      title: "Remover Adicional? 🗑️",
      description: `Tem certeza que deseja remover o adicional "${name}"?`,
      confirmLabel: "Excluir Adicional",
      variant: "danger",
      onConfirm: async () => {
        await deleteAddon(id);
      },
    });
  };

  // Agrupa os adicionais por categoria para exibição limpa na tela
  const categoriasDeAdicionais = Array.from(
    new Set(addons.map((a) => a.category)),
  );

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-10">
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

      {/* SEÇÃO 1: ITENS PRINCIPAIS */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-gray-800">
          1. Produtos do Cardápio
        </h2>

        <form
          onSubmit={handleSubmitItem}
          className="p-4 border rounded-xl bg-white shadow-sm flex flex-col md:flex-row gap-3 items-end"
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
              placeholder="Ex: Tapioca de Carne de Sol"
              className="w-full p-2 border rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none"
            />
          </div>
          <div className="w-full md:w-40">
            <label className="block text-xs font-bold text-gray-600 mb-1">
              Categoria
            </label>
            <input
              type="text"
              required
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Ex: tapiocas, sucos"
              className="w-full p-2 border rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none lowercase"
            />
          </div>
          <div className="w-full md:w-28">
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
            className="w-full md:w-auto bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg text-sm font-bold transition-colors h-[38px]"
          >
            {editingId !== null ? "Salvar" : "Adicionar"}
          </button>
        </form>

        <div className="border rounded-xl bg-white shadow-sm divide-y max-h-96 overflow-y-auto">
          {menu.map((item) => (
            <div
              key={item.id}
              className="p-4 flex justify-between items-center hover:bg-gray-50"
            >
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-gray-900">{item.name}</p>
                  <span className="bg-orange-50 text-orange-600 text-[10px] font-bold px-2 py-0.5 rounded-full capitalize border border-orange-100">
                    {item.category}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-0.5">
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
                  onClick={() => handleDeleteItem(item.id)}
                  className="text-xs bg-red-50 hover:bg-red-100 text-red-600 px-3 py-1.5 rounded-lg font-medium transition-colors"
                >
                  Excluir
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <hr className="border-gray-200" />

      {/* SEÇÃO 2: GERENCIAR ADICIONAIS POR CATEGORIA */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-gray-800">
          2. Adicionais por Categoria
        </h2>

        <form
          onSubmit={handleSubmitAddon}
          className="p-4 border rounded-xl bg-white shadow-sm flex flex-col md:flex-row gap-3 items-end"
        >
          <div className="flex-1 w-full">
            <label className="block text-xs font-bold text-gray-600 mb-1">
              Nome do Adicional
            </label>
            <input
              type="text"
              required
              value={addonName}
              onChange={(e) => setAddonName(e.target.value)}
              placeholder="Ex: Queijo Coalho Extra"
              className="w-full p-2 border rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none"
            />
          </div>
          <div className="w-full md:w-40">
            <label className="block text-xs font-bold text-gray-600 mb-1">
              Para qual Categoria?
            </label>
            <input
              type="text"
              required
              value={addonCategory}
              onChange={(e) => setAddonCategory(e.target.value)}
              placeholder="Ex: tapiocas, sucos"
              className="w-full p-2 border rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none lowercase"
            />
          </div>
          <div className="w-full md:w-28">
            <label className="block text-xs font-bold text-gray-600 mb-1">
              Preço (R$)
            </label>
            <input
              type="number"
              step="0.01"
              required
              value={addonPrice}
              onChange={(e) => setAddonPrice(e.target.value)}
              placeholder="0.00"
              className="w-full p-2 border rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none"
            />
          </div>
          <button
            type="submit"
            className="w-full md:w-auto bg-orange-600 hover:bg-orange-700 text-white px-5 py-2 rounded-lg text-sm font-bold transition-colors h-[38px]"
          >
            Criar Adicional
          </button>
        </form>

        {/* Visualização de agrupamento dos adicionais existentes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {categoriasDeAdicionais.length === 0 ? (
            <p className="text-xs text-gray-400 font-medium p-4 border border-dashed rounded-xl text-center md:col-span-2 bg-gray-50">
              Nenhum adicional cadastrado ainda.
            </p>
          ) : (
            categoriasDeAdicionais.map((cat) => (
              <div
                key={cat}
                className="border rounded-xl bg-white p-4 shadow-sm space-y-2"
              >
                <h3 className="text-xs font-black uppercase tracking-wider text-orange-600 border-b pb-1 capitalize">
                  Categoria: {cat}
                </h3>
                <div className="divide-y divide-gray-50 max-h-48 overflow-y-auto">
                  {addons
                    .filter((a) => a.category === cat)
                    .map((addon) => (
                      <div
                        key={addon.id}
                        className="py-2 flex justify-between items-center text-xs"
                      >
                        <div>
                          <span className="font-semibold text-gray-800">
                            {addon.name}
                          </span>
                          <span className="text-gray-400 ml-2 font-mono">
                            R$ {addon.price.toFixed(2)}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            handleDeleteAddon(addon.id, addon.name)
                          }
                          className="text-red-500 hover:text-red-700 font-bold px-2 py-1"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                </div>
              </div>
            ))
          )}
        </div>
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
