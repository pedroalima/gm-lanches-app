"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useMenu } from "@/src/hooks/useMenu";
import { useAuth } from "@/src/hooks/useAuth";
import { LoginForm } from "@/src/components/LoginForm";
import { Modal } from "@/src/components/Modal";
import { Loading } from "@/src/components/Loading";
import { DeleteButton } from "@/src/components/DeleteButton";

export const dynamic = "force-dynamic";

export default function GerenciarCardapioPage() {
  const {
    menu,
    addons,
    addItem,
    updateItem,
    deleteItem,
    addAddon,
    updateAddon,
    deleteAddon,
    isFetching,
    isMutating,
  } = useMenu();
  const { isAuthenticated, error, login } = useAuth();
  const [mounted, setMounted] = useState(false);

  // Estados do formulário de CRIAÇÃO de Itens
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");

  // Estados do formulário de CRIAÇÃO de Adicionais
  const [addonName, setAddonName] = useState("");
  const [addonPrice, setAddonPrice] = useState("");
  const [addonCategory, setAddonCategory] = useState("");

  // Estados para Controle dos Modais de Edição Independente
  const [editingItem, setEditingItem] = useState<{
    id: number;
    name: string;
    price: string;
    category: string;
  } | null>(null);
  const [editingAddon, setEditingAddon] = useState<{
    id: number;
    name: string;
    price: string;
    category: string;
  } | null>(null);

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

  // Manipula criação de Itens Principais
  const handleCreateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !price || !category.trim()) return;

    await addItem(name, Number(price), category);
    setName("");
    setPrice("");
    setCategory("");
  };

  // Salva a edição do Item Principal vinda do Modal
  const handleSaveItemEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !editingItem ||
      !editingItem.name.trim() ||
      !editingItem.price ||
      !editingItem.category.trim()
    )
      return;

    await updateItem(
      editingItem.id,
      editingItem.name,
      Number(editingItem.price),
      editingItem.category,
    );
    setEditingItem(null);
  };

  // Manipula criação de Adicionais
  const handleCreateAddon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addonName.trim() || !addonPrice || !addonCategory.trim()) return;

    await addAddon(addonName, Number(addonPrice), addonCategory);
    setAddonName("");
    setAddonPrice("");
    setAddonCategory("");
  };

  // Salva a edição do Adicional vinda do Modal
  const handleSaveAddonEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !editingAddon ||
      !editingAddon.name.trim() ||
      !editingAddon.price ||
      !editingAddon.category.trim()
    )
      return;

    if (typeof updateAddon === "function") {
      await updateAddon(
        editingAddon.id,
        editingAddon.name,
        Number(editingAddon.price),
        editingAddon.category,
      );
    }
    setEditingAddon(null);
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

  const categoriasDeAdicionais = Array.from(
    new Set(addons.map((a) => a.category)),
  );

  // Cria uma lista unificada de todas as categorias existentes na aplicação
  const listaCategorias = Array.from(
    new Set([
      ...menu.map((item) => item.category.toLowerCase()),
      ...addons.map((addon) => addon.category.toLowerCase()),
    ]),
  ).sort();

  return (
    <div className="relative p-6 max-w-3xl mx-auto space-y-10 min-h-screen">
      {/* Elemento Datalist Global compartilhado por todos os inputs de categorias */}
      <datalist id="categories-list">
        {listaCategorias.map((cat) => (
          <option key={cat} value={cat} />
        ))}
      </datalist>

      {/* Overlay de carregamento para sincronização da lista */}
      {isFetching && <Loading />}

      <div className="w-full flex flex-col sm:flex-row justify-between items-start sm:items-center border-b pb-4 gap-4">
        <h1 className="text-2xl font-bold text-gray-950">
          🍔 Gerenciar Itens do Cardápio
        </h1>
        <Link
          href="/admin"
          className="text-sm bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded-lg transition-colors text-center w-full sm:w-auto"
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
          onSubmit={handleCreateItem}
          className="p-4 border rounded-xl bg-white shadow-sm flex flex-col md:flex-row gap-3 items-end"
        >
          <div className="flex-1 w-full">
            <label className="block text-xs font-bold text-gray-600 mb-1">
              Nome do Item
            </label>
            <input
              type="text"
              required
              disabled={isMutating}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Tapioca de Carne de Sol"
              className="w-full p-2 border rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none disabled:bg-gray-50 disabled:text-gray-400"
            />
          </div>
          <div className="w-full md:w-40">
            <label className="block text-xs font-bold text-gray-600 mb-1">
              Categoria
            </label>
            <input
              type="text"
              required
              list="categories-list"
              disabled={isMutating}
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Ex: tapiocas"
              className="w-full p-2 border rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none lowercase disabled:bg-gray-50 disabled:text-gray-400"
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
              disabled={isMutating}
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0.00"
              className="w-full p-2 border rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none disabled:bg-gray-50 disabled:text-gray-400"
            />
          </div>
          <button
            type="submit"
            disabled={isMutating}
            className="w-full md:w-24 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-bold transition-colors h-[38px] flex items-center justify-center disabled:opacity-50"
          >
            {isMutating ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              "Adicionar"
            )}
          </button>
        </form>

        <div className="border border-gray-200 rounded-xl bg-white shadow-sm divide-y divide-gray-100 max-h-96 overflow-y-auto">
          {menu.map((item) => (
            <div
              key={item.id}
              className="p-4 flex items-center justify-between gap-4 hover:bg-gray-50/70 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold text-gray-900 text-sm md:text-base truncate">
                    {item.name}
                  </p>
                  <span className="bg-orange-50 text-orange-600 text-[10px] font-bold px-2 py-0.5 rounded-full capitalize border border-orange-100 shrink-0">
                    {item.category}
                  </span>
                </div>
                <p className="text-sm font-bold text-gray-500 font-mono mt-0.5">
                  R$ {item.price.toFixed(2)}
                </p>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() =>
                    setEditingItem({
                      id: item.id,
                      name: item.name,
                      price: item.price.toString(),
                      category: item.category,
                    })
                  }
                  disabled={isMutating}
                  title="Editar produto"
                  className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 active:bg-blue-100 rounded-lg transition-all disabled:opacity-40"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="w-4 h-4"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
                    />
                  </svg>
                </button>

                <DeleteButton
                  disabled={isMutating}
                  onClick={() => handleDeleteItem(item.id)}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <hr className="border-gray-200" />

      {/* SEÇÃO 2: GERENCIAR ADICIONAIS POR CATEGORIA */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-gray-800">
          2. Opções por Categoria
        </h2>

        <form
          onSubmit={handleCreateAddon}
          className="p-4 border rounded-xl bg-white shadow-sm flex flex-col md:flex-row gap-3 items-end"
        >
          <div className="flex-1 w-full">
            <label className="block text-xs font-bold text-gray-600 mb-1">
              Nome do Adicional
            </label>
            <input
              type="text"
              required
              disabled={isMutating}
              value={addonName}
              onChange={(e) => setAddonName(e.target.value)}
              placeholder="Ex: Queijo Coalho Extra"
              className="w-full p-2 border rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none disabled:bg-gray-50 disabled:text-gray-400"
            />
          </div>
          <div className="w-full md:w-40">
            <label className="block text-xs font-bold text-gray-600 mb-1">
              Para qual Categoria?
            </label>
            <input
              type="text"
              required
              list="categories-list"
              disabled={isMutating}
              value={addonCategory}
              onChange={(e) => setAddonCategory(e.target.value)}
              placeholder="Ex: tapiocas"
              className="w-full p-2 border rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none lowercase disabled:bg-gray-50 disabled:text-gray-400"
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
              disabled={isMutating}
              value={addonPrice}
              onChange={(e) => setAddonPrice(e.target.value)}
              placeholder="0.00"
              className="w-full p-2 border rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none disabled:bg-gray-50 disabled:text-gray-400"
            />
          </div>
          <button
            type="submit"
            disabled={isMutating}
            className="w-full md:w-32 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm font-bold transition-colors h-[38px] flex items-center justify-center disabled:opacity-50"
          >
            {isMutating ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              "Criar Adicional"
            )}
          </button>
        </form>

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
                        className="py-2 flex justify-between items-center text-xs gap-2 hover:bg-gray-50/50 px-1 rounded-md transition-colors"
                      >
                        <div className="flex-1 min-w-0">
                          <span className="font-semibold text-gray-800 truncate block">
                            {addon.name}
                          </span>
                          <span className="text-gray-400 font-mono text-[11px]">
                            R$ {addon.price.toFixed(2)}
                          </span>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() =>
                              setEditingAddon({
                                id: addon.id,
                                name: addon.name,
                                price: addon.price.toString(),
                                category: addon.category,
                              })
                            }
                            disabled={isMutating}
                            title="Editar adicional"
                            className="p-1.5 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-all disabled:opacity-40"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth={2}
                              stroke="currentColor"
                              className="w-3.5 h-3.5"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
                              />
                            </svg>
                          </button>

                          <DeleteButton
                            disabled={isMutating}
                            onClick={() =>
                              handleDeleteAddon(addon.id, addon.name)
                            }
                          />
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* MODAL 1: EDIÇÃO DE PRODUTO PRINCIPAL */}
      <Modal
        isOpen={editingItem !== null}
        title="Editar Produto 🍔"
        onClose={() => !isMutating && setEditingItem(null)}
      >
        {editingItem && (
          <form onSubmit={handleSaveItemEdit} className="space-y-4 my-2">
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1">
                Nome do Item
              </label>
              <input
                type="text"
                required
                disabled={isMutating}
                value={editingItem.name}
                onChange={(e) =>
                  setEditingItem({ ...editingItem, name: e.target.value })
                }
                className="w-full p-2.5 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">
                  Categoria
                </label>
                <input
                  type="text"
                  required
                  list="categories-list"
                  disabled={isMutating}
                  value={editingItem.category}
                  onChange={(e) =>
                    setEditingItem({
                      ...editingItem,
                      category: e.target.value.toLowerCase(),
                    })
                  }
                  className="w-full p-2.5 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">
                  Preço (R$)
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  disabled={isMutating}
                  value={editingItem.price}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, price: e.target.value })
                  }
                  className="w-full p-2.5 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                disabled={isMutating}
                onClick={() => setEditingItem(null)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold p-2.5 rounded-xl text-sm transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isMutating}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold p-2.5 rounded-xl text-sm transition-colors flex items-center justify-center"
              >
                {isMutating ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  "Salvar Alterações"
                )}
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* MODAL 2: EDIÇÃO DE ADICIONAL */}
      <Modal
        isOpen={editingAddon !== null}
        title="Editar Adicional ✨"
        onClose={() => !isMutating && setEditingAddon(null)}
      >
        {editingAddon && (
          <form onSubmit={handleSaveAddonEdit} className="space-y-4 my-2">
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1">
                Nome do Adicional
              </label>
              <input
                type="text"
                required
                disabled={isMutating}
                value={editingAddon.name}
                onChange={(e) =>
                  setEditingAddon({ ...editingAddon, name: e.target.value })
                }
                className="w-full p-2.5 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">
                  Categoria vinculada
                </label>
                <input
                  type="text"
                  required
                  list="categories-list"
                  disabled={isMutating}
                  value={editingAddon.category}
                  onChange={(e) =>
                    setEditingAddon({
                      ...editingAddon,
                      category: e.target.value.toLowerCase(),
                    })
                  }
                  className="w-full p-2.5 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">
                  Preço (R$)
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  disabled={isMutating}
                  value={editingAddon.price}
                  onChange={(e) =>
                    setEditingAddon({ ...editingAddon, price: e.target.value })
                  }
                  className="w-full p-2.5 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                disabled={isMutating}
                onClick={() => setEditingAddon(null)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold p-2.5 rounded-xl text-sm transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isMutating}
                className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-bold p-2.5 rounded-xl text-sm transition-colors flex items-center justify-center"
              >
                {isMutating ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  "Salvar Adicional"
                )}
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* MODAL CONFIG GERAL (EXCLUSÕES) */}
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
