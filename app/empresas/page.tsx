import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Building2, MapPin, Tags, Star, ArrowRight, Plus } from "lucide-react";

// Força a página a buscar dados novos sempre que for carregada
export const dynamic = 'force-dynamic';

export default async function EmpresasPage() {
  // Busca todas as empresas no banco de dados, ordenando das mais recentes para as mais antigas
  const empresas = await prisma.empresa.findMany({
    orderBy: {
      createdAt: 'desc'
    }
  });

  return (
    <div className="p-8 max-w-7xl mx-auto">
      
      {/* Cabeçalho da Página */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">Empresas do Ecossistema</h1>
          <p className="text-gray-500 mt-1">Descubra parceiros, fornecedores e novos negócios.</p>
        </div>
        
        <Link 
          href="/nova-empresa" 
          className="inline-flex items-center gap-2 bg-[#1D54ED] hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-sm"
        >
          <Plus size={20} />
          Cadastrar sua Empresa
        </Link>
      </div>

      {/* Grid de Empresas */}
      {empresas.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
          <Building2 size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-xl font-bold text-gray-900">Nenhuma empresa encontrada</h3>
          <p className="text-gray-500 mt-2 mb-6">Seja o primeiro a cadastrar uma empresa no ecossistema Vynco.</p>
          <Link href="/nova-empresa" className="text-[#1D54ED] font-semibold hover:underline">
            Cadastrar agora
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {empresas.map((empresa) => (
            <div 
              key={empresa.id} 
              className="bg-white rounded-2xl p-6 border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.1)] transition-all duration-300 group flex flex-col h-full"
            >
              {/* Topo do Card: Logo e Nome */}
              <div className="flex items-start gap-4 mb-4">
                {empresa.logoUrl ? (
                  <img src={empresa.logoUrl} alt={empresa.nome} className="w-14 h-14 rounded-xl object-cover border border-gray-100" />
                ) : (
                  <div className="w-14 h-14 rounded-xl bg-blue-50 text-[#1D54ED] flex items-center justify-center font-bold text-xl border border-blue-100 shrink-0">
                    {empresa.nome.charAt(0)}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold text-gray-900 truncate" title={empresa.nome}>
                    {empresa.nome}
                  </h3>
                  <div className="flex items-center gap-1.5 text-sm text-gray-500 mt-1">
                    <MapPin size={14} />
                    <span className="truncate">{empresa.cidade}, {empresa.estado}</span>
                  </div>
                </div>
              </div>

              {/* Badges de Categoria */}
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-gray-50 text-gray-600 text-xs font-medium border border-gray-200">
                  <Tags size={12} />
                  {empresa.categoria1}
                </span>
                {empresa.categoria2 && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-gray-50 text-gray-600 text-xs font-medium border border-gray-200">
                    {empresa.categoria2}
                  </span>
                )}
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-medium border border-blue-100">
                  {empresa.tipoOferta}
                </span>
              </div>

              {/* Descrição */}
              <p className="text-sm text-gray-600 line-clamp-3 mb-6 flex-1">
                {empresa.descricao}
              </p>

              {/* Rodapé do Card */}
              <div className="pt-4 border-t border-gray-100 flex items-center justify-between mt-auto">
                <div className="flex items-center gap-1 text-amber-500 font-semibold text-sm">
                  <Star size={16} className="fill-amber-500" />
                  {empresa.avaliacao}
                </div>
                
                {/* Substitui o que tiveres do "Ver detalhes" por isto: */}
<Link 
  href={`/empresas/${empresa.id}`} 
  className="text-[#292c33] text-sm font-semibold hover:underline flex items-center gap-1"
>
  Ver detalhes <ArrowRight size={16} />
</Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}