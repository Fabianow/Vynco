import { Menu, Search, LayoutGrid } from "lucide-react";
import MenuMinhaEmpresa from "./MenuMinhaEmpresa";

export default function Header() {
  return (
    <header className="bg-white border-b border-gray-200 h-[72px] flex items-center justify-between px-8 shrink-0">
      
      {/* Lado Esquerdo e Centro: Menu e Pesquisa */}
      <div className="flex items-center gap-4 flex-1">
        <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors">
          <Menu size={20} />
        </button>
        
        <div className="relative max-w-2xl w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text"
            placeholder="Buscar empresas, produtos ou serviços"
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Lado Direito: Ações e Perfil da Empresa */}
      <div className="flex items-center gap-4 ml-4">
        <button className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:bg-gray-50 px-4 py-2.5 rounded-lg border border-gray-200 transition-colors">
          <LayoutGrid size={18} /> Explorar categorias
        </button>
        
        {/* Aqui está o teu componente a ser chamado! */}
        <MenuMinhaEmpresa />
      </div>

    </header>
  );
}