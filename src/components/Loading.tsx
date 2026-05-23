export function Loading() {
  return (
    <div className="absolute inset-0 bg-black/15 backdrop-blur-[1px] z-50 flex items-center justify-center pointer-events-none transition-all">
      <div className="bg-white/90 p-3 rounded-xl shadow-md flex items-center gap-2 border fixed top-6 right-6 z-[60]">
        <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-bold text-gray-600">Carregando...</span>
      </div>
    </div>
  );
}
