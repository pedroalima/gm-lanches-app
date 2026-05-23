"use client";

import { useState } from "react";
import { useOrders } from "../hooks/useOrders";
import { useMenu } from "../hooks/useMenu";
import { Modal } from "../components/Modal";
import { useAuth } from "../hooks/useAuth";
import Link from "next/link";
import { Loading } from "../components/Loading";

interface CartItem {
  cartId: string; // ID único para diferenciar cada combinação no carrinho
  itemId: number; // ID do produto base
  selectedAddons: number[]; // IDs dos adicionais escolhidos (reais do banco)
  quantity: number;
}

export default function CardapioPage() {
  const { createOrder, isMutating } = useOrders();
  const { menu, addons, isFetching } = useMenu();
  const { isAuthenticated } = useAuth();

  const [clientName, setClientName] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [sucessoOpen, setSucessoOpen] = useState(false);
  const [confirmarOpen, setConfirmarOpen] = useState(false);

  const [activeCategory, setActiveCategory] = useState("tapiocas");

  // Guarda os adicionais selecionados na tela ANTES de mandar para o carrinho
  const [tempAddons, setTempAddons] = useState<{ [itemId: number]: number[] }>(
    {},
  );

  // Carrinho agora é um ARRAY para permitir múltiplos itens iguais com adicionais diferentes
  const [cart, setCart] = useState<CartItem[]>([]);

  const toggleTempAddon = (itemId: number, addonId: number) => {
    setTempAddons((prev) => {
      const atuais = prev[itemId] || [];
      const novos = atuais.includes(addonId)
        ? atuais.filter((id) => id !== addonId)
        : [...atuais, addonId];
      return { ...prev, [itemId]: novos };
    });
  };

  // Envia a combinação atual da tela para dentro do carrinho
  const handlePushToCart = (itemId: number) => {
    const escolhidos = tempAddons[itemId] || [];

    const uniqueId = crypto.randomUUID();

    const newItem: CartItem = {
      cartId: uniqueId,
      itemId,
      selectedAddons: [...escolhidos],
      quantity: 1,
    };

    setCart((prev) => [...prev, newItem]);

    // Limpa a seleção de adicionais daquele item na tela para o próximo pedido
    setTempAddons((prev) => ({ ...prev, [itemId]: [] }));
  };

  // Altera a quantidade de um item que JÁ ESTÁ dentro do carrinho
  const handleCartQuantity = (cartId: string, delta: number) => {
    setCart(
      (prev) =>
        prev
          .map((item) =>
            item.cartId === cartId
              ? { ...item, quantity: item.quantity + delta }
              : item,
          )
          .filter((item) => item.quantity > 0), // Remove do carrinho se zerar
    );
  };

  // Calcula o valor total de uma linha específica do carrinho
  const calcularPrecoItemCart = (cartItem: CartItem) => {
    const produto = menu.find((m) => m.id === cartItem.itemId);
    if (!produto) return 0;

    const precoAdicionais = cartItem.selectedAddons.reduce((total, addonId) => {
      const addon = addons.find((a) => a.id === addonId);
      return total + (addon?.price || 0);
    }, 0);

    return (produto.price + precoAdicionais) * cartItem.quantity;
  };

  const precoTotalGeral = cart.reduce(
    (total, item) => total + calcularPrecoItemCart(item),
    0,
  );

  const handleSendOrder = async () => {
    setErrorMessage("");

    const itemsParaEnviar = cart.map((cartItem) => {
      const itemOriginal = menu.find((m) => m.id === cartItem.itemId);

      const nomesAdicionais = cartItem.selectedAddons
        .map((id) => addons.find((a) => a.id === id)?.name)
        .filter(Boolean)
        .join(", ");

      const nomeFinal = nomesAdicionais
        ? `${itemOriginal?.name} (${nomesAdicionais})`
        : itemOriginal?.name || "";

      return {
        id: cartItem.itemId,
        name: nomeFinal,
        quantity: cartItem.quantity,
      };
    });

    const createdAt = new Date().toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });

    try {
      await createOrder(clientName, itemsParaEnviar, createdAt);
      setClientName("");
      setCart([]);
      setTempAddons({});
      setConfirmarOpen(false);
      setSucessoOpen(true);
    } catch (error) {
      console.error(error);
      setErrorMessage("⚠️ Erro ao registrar o pedido. Tente novamente.");
    }
  };

  const categoriasDisponiveis = Array.from(
    new Set(menu.map((item) => item.category)),
  );
  const itensFiltrados = menu.filter(
    (item) => item.category === activeCategory,
  );

  return (
    <div className="relative px-4 pt-6 max-w-md mx-auto space-y-6 pb-24 overflow-hidden w-full box-border min-h-screen">
      {/* Overlay de carregamento para a lista inicial */}
      {isFetching && <Loading />}

      <h1 className="text-2xl font-bold text-orange-600">🍔 Faça seu Pedido</h1>

      {isAuthenticated && (
        <Link
          href="/admin"
          className="fixed bottom-44 right-6 z-50 bg-gray-900 text-white font-black text-xs px-4 py-3 rounded-full shadow-2xl"
        >
          👨‍🍳 Painel Admin
        </Link>
      )}

      {/* Carrossel isolado de verdade em largura máxima fixa de 100% */}
      <div style={{ width: "100%", overflowX: "clip" }}>
        <div
          className="flex gap-2 pb-2 snap-x scroll-smooth"
          style={{
            overflowX: "auto",
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          {categoriasDisponiveis.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={(e) => {
                setActiveCategory(cat);
                (e.target as HTMLElement).scrollIntoView({
                  behavior: "smooth",
                  block: "nearest",
                  inline: "center",
                });
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition-all snap-center shrink-0 border ${
                activeCategory === cat
                  ? "bg-orange-500 text-white border-orange-500 shadow-sm"
                  : "bg-gray-100 text-gray-500 border-gray-200 hover:bg-gray-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Lista de Itens */}
      <div className="space-y-4">
        {itensFiltrados.map((item) => {
          const adicionaisDisponiveis = addons.filter(
            (addon) => addon.category === item.category,
          );
          const meusOpcionaisPreparados = tempAddons[item.id] || [];

          // Calcula quantas unidades deste item base já estão guardadas no carrinho total
          const totalNoCarrinho = cart
            .filter((c) => c.itemId === item.id)
            .reduce((sum, c) => sum + c.quantity, 0);

          return (
            <div
              key={item.id}
              className="p-4 border rounded-xl shadow-sm bg-white space-y-4"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold text-gray-800 text-base">
                    {item.name}
                  </p>
                  <p className="text-sm font-bold text-orange-500 mt-0.5">
                    R$ {item.price.toFixed(2)}
                  </p>
                </div>
                {totalNoCarrinho > 0 && (
                  <span className="bg-orange-100 text-orange-700 text-[10px] font-bold px-2 py-1 rounded-lg">
                    {totalNoCarrinho} no carrinho
                  </span>
                )}
              </div>

              {/* Lista os Adicionais (Checkboxes) */}
              {adicionaisDisponiveis.length > 0 && (
                <div className="space-y-1.5 bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                  <p className="text-[10px] uppercase tracking-wider font-black text-gray-400 mb-1">
                    Adicionais:
                  </p>
                  <div className="grid grid-cols-1 gap-1">
                    {adicionaisDisponiveis.map((addon) => (
                      <label
                        key={addon.id}
                        className="flex items-center justify-between text-xs font-medium text-gray-700 p-1 cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={meusOpcionaisPreparados.includes(addon.id)}
                            onChange={() => toggleTempAddon(item.id, addon.id)}
                            className="rounded border-gray-300 text-orange-500 focus:ring-orange-500 w-4 h-4"
                          />
                          <span>{addon.name}</span>
                        </div>
                        <span className="text-gray-400 font-mono">
                          + R$ {addon.price.toFixed(2)}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* O BOTÃO PEDIDO: Manda a combinação montada direto para o carrinho */}
              <button
                type="button"
                onClick={() => handlePushToCart(item.id)}
                className="w-full bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm tracking-wide"
              >
                Adicionar ao Carrinho 🛒
              </button>
            </div>
          );
        })}
      </div>

      {/* Barra Fixa de Navegação Inferior */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/85 backdrop-blur-md border-t border-gray-100 z-40 max-w-md mx-auto">
        {errorMessage && (
          <p className="text-sm mb-3 text-red-600 bg-red-50 border border-red-200 p-3 rounded-xl text-center font-bold">
            {errorMessage}
          </p>
        )}

        <input
          type="text"
          placeholder="Digite seu nome"
          required
          value={clientName}
          onChange={(e) => setClientName(e.target.value)}
          className="w-full mb-3 p-3 border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
        />

        <button
          type="button"
          onClick={() => {
            if (!clientName.trim())
              return setErrorMessage("⚠️ Por favor, preencha o seu nome.");
            if (cart.length === 0)
              return setErrorMessage("⚠️ Seu carrinho está vazio.");
            setErrorMessage("");
            setConfirmarOpen(true);
          }}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white p-3.5 rounded-xl font-bold transition-all shadow-md flex justify-between items-center px-6"
        >
          <span>Ver meu Carrinho ({cart.length})</span>
          <span className="bg-orange-600 text-white px-2.5 py-1 rounded-lg text-xs font-mono">
            R$ {precoTotalGeral.toFixed(2)}
          </span>
        </button>
      </div>

      {/* REVISÃO DO PEDIDO: Onde o cliente gerencia as quantidades de cada combinação montada */}
      <Modal
        isOpen={confirmarOpen}
        title="Revisar Pedido 🛒"
        variant="warning"
        confirmLabel={isMutating ? "" : "Enviar Agora"}
        onConfirm={handleSendOrder}
        onClose={() => !isMutating && setConfirmarOpen(false)}
      >
        <div className="space-y-3 my-2 max-h-60 overflow-y-auto pr-1">
          <p className="text-xs text-gray-500 font-bold">
            Cliente: <span className="text-gray-800">{clientName}</span>
          </p>
          <div className="border-t border-b border-dashed py-2 divide-y divide-gray-100">
            {cart.map((cartItem) => {
              const itemOrig = menu.find((m) => m.id === cartItem.itemId);
              return (
                <div
                  key={cartItem.cartId}
                  className="py-2.5 text-xs flex justify-between items-center"
                >
                  <div className="max-w-[60%]">
                    <p className="text-gray-800 font-bold text-sm">
                      {itemOrig?.name}
                    </p>
                    {cartItem.selectedAddons.length > 0 && (
                      <p className="text-[10px] text-gray-400 leading-tight mt-0.5">
                        +{" "}
                        {cartItem.selectedAddons
                          .map((id) => addons.find((a) => a.id === id)?.name)
                          .join(", ")}
                      </p>
                    )}
                    <p className="font-mono text-[11px] text-orange-600 font-bold mt-1">
                      R$ {calcularPrecoItemCart(cartItem).toFixed(2)}
                    </p>
                  </div>

                  {/* Controle de quantidade individual por combinação dentro do Modal */}
                  <div className="flex items-center gap-2.5 bg-gray-50 p-1 rounded-lg border">
                    <button
                      type="button"
                      disabled={isMutating}
                      onClick={() => handleCartQuantity(cartItem.cartId, -1)}
                      className="w-6 h-6 bg-white border rounded-md font-bold flex items-center justify-center text-gray-500 active:bg-gray-100 disabled:opacity-50"
                    >
                      -
                    </button>
                    <span className="w-4 text-center font-bold text-gray-800">
                      {cartItem.quantity}
                    </span>
                    <button
                      type="button"
                      disabled={isMutating}
                      onClick={() => handleCartQuantity(cartItem.cartId, 1)}
                      className="w-6 h-6 bg-white border rounded-md font-bold flex items-center justify-center text-gray-500 active:bg-gray-100 disabled:opacity-50"
                    >
                      +
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex justify-between items-center bg-gray-50 p-2.5 rounded-xl border">
            <span className="text-xs font-bold text-gray-500 uppercase">
              Total Geral
            </span>
            <span className="text-sm font-black text-gray-900 font-mono">
              R$ {precoTotalGeral.toFixed(2)}
            </span>
          </div>

          {/* Renderização do spinner substituindo o rodapé/botão do modal se estiver mutando */}
          {isMutating && (
            <div className="flex justify-center items-center pt-2">
              <div className="w-6 h-6 border-3 border-orange-500 border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>
      </Modal>

      {/* SUCESSO */}
      <Modal
        isOpen={sucessoOpen}
        title="Pedido Recebido! 🎉"
        description="Seu pedido já foi enviado diretamente para as telas da nossa cozinha e está na fila de preparo!"
        onClose={() => setSucessoOpen(false)}
        variant="success"
      />
    </div>
  );
}
