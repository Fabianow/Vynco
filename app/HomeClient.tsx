"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link"; // Adicionado o Link
import { 
  Building2, Factory, Cpu, Truck, HeartPulse, 
  Wheat, ShoppingBag, Briefcase, Zap, Landmark, 
  Sparkles, ArrowRight, Star, X, MapPin 
} from "lucide-react";

type Empresa = {
  id: number;
  nome: string;
  categoria1: string;
  tipoOferta: string;
  avaliacao: string;
  cidade: string;
  estado: string;
  descricao: string;
  logoUrl?: string;
  createdAt: Date;
};

const categoriasData = [
  { nome: "Construção", icon: Building2 },
  { nome: "Indústria", icon: Factory },
  { nome: "Tecnologia", icon: Cpu },
  { nome: "Logística", icon: Truck },
  { nome: "Saúde", icon: HeartPulse },
  { nome: "Agronegócio", icon: Wheat },
  { nome: "Comércio", icon: ShoppingBag },
  { nome: "Serviços", icon: Briefcase },
  { nome: "Energia", icon: Zap },
  { nome: "Financeiro", icon: Landmark },
];

export default function HomeClient({ empresas }: { empresas: Empresa[] }) {
  const { data: session } = useSession(); 
  const router = useRouter(); 
  const [categoriasAtivas, setCategoriasAtivas] = useState<string[]>([]);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const toggleCategoria = (nome: string) => {
    setCategoriasAtivas((prev) => 
      prev.includes(nome) 
        ? prev.filter((cat) => cat !== nome)
        : [...prev, nome]
    );
  };

  const empresasFiltradas = categoriasAtivas.length > 0 
    ? empresas.filter(empresa => categoriasAtivas.includes(empresa.categoria1))
    : empresas;

  return (
    <div className="p-8 lg:p-12 relative">
      
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto mb-16">
        <div className="bg-gradient-to-br from-[#F4F8FF] to-white border border-gray-100 rounded-[2rem] p-10 lg:p-16 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.02)]">
          <div className="inline-flex items-center gap-2 bg-white border border-gray-200 shadow-sm rounded-full px-4 py-1.5 mb-8">
            <Sparkles className="text-[#1D54ED]" size={16} />
            <span className="text-sm font-medium text-gray-600">Plataforma B2B para empresas de todos os segmentos</span>
          </div>
          <h1 className="text-5xl lg:text-[64px] font-extrabold text-[#0A0B10] tracking-tight mb-6 max-w-4xl leading-[1.1]">
            O Ecossistema das Empresas.
          </h1>
          <p className="text-xl text-gray-500 mb-10 max-w-2xl leading-relaxed">
            Conecte sua empresa a fornecedores, parceiros e novas oportunidades de negócio em um único lugar.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <button 
              onClick={() => {
                if (!session) {
                  setShowLoginModal(true);
                } else {
                  router.push("/nova-empresa"); 
                }
              }}
              className="w-full sm:w-auto bg-[#1D54ED] hover:bg-blue-700 text-white px-8 py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all shadow-sm"
            >
              Cadastrar minha empresa <ArrowRight size={18} />
            </button>

            <button 
              onClick={() => router.push("/empresas")}
              className="w-full sm:w-auto bg-white hover:bg-gray-50 text-gray-800 border border-gray-200 px-8 py-3.5 rounded-xl font-semibold transition-all shadow-sm"
            >
              Explorar empresas
            </button>
          </div>
        </div>
      </div>

      {/* Secção de Categorias */}
      <div className="max-w-7xl mx-auto mb-16">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Categorias empresariais</h2>
          <button 
            onClick={() => setCategoriasAtivas([])}
            className="text-[#1D54ED] text-sm font-semibold hover:underline"
          >
            Ver todas
          </button>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {categoriasData.map((cat, i) => {
            const isAtiva = categoriasAtivas.includes(cat.nome);
            return (
              <button 
                key={i} 
                onClick={() => toggleCategoria(cat.nome)}
                className={`p-6 rounded-2xl border transition-all duration-200 flex flex-col items-center text-center group bg-white
                  ${isAtiva ? 'border-[#1D54ED] ring-1 ring-[#1D54ED] shadow-md' : 'border-gray-200 hover:border-blue-300 hover:shadow-sm'}
                `}
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 transition-colors
                  ${isAtiva ? 'bg-[#1D54ED] text-white' : 'bg-[#F0F5FF] text-[#1D54ED] group-hover:bg-[#E5EDFF]'}
                `}>
                  <cat.icon size={24} strokeWidth={1.5} />
                </div>
                <h3 className="text-sm font-semibold text-gray-900">{cat.nome}</h3>
              </button>
            );
          })}
        </div>
      </div>

      {/* Secção Dinâmica: Empresas Recomendadas */}
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center gap-3">
          <h2 className="text-2xl font-bold text-gray-900">Empresas recomendadas</h2>
          
          {categoriasAtivas.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {categoriasAtivas.map(cat => (
                <span key={cat} className="flex items-center gap-1 bg-blue-50 text-[#1D54ED] px-3 py-1 rounded-full text-xs font-semibold border border-blue-100">
                  {cat}
                  <button onClick={() => toggleCategoria(cat)} className="hover:bg-blue-200 rounded-full p-0.5 transition-colors">
                    <X size={12} strokeWidth={3} />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {empresasFiltradas.length > 0 ? (
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
            {empresasFiltradas.map((empresa) => (
              <div 
                key={empresa.id} 
                className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col h-full"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3 overflow-hidden">
                    {empresa.logoUrl ? (
                      <img src={empresa.logoUrl} alt={empresa.nome} className="w-12 h-12 rounded-xl object-cover border border-gray-100 shrink-0" />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#1D54ED] flex items-center justify-center font-bold text-lg border border-blue-100 shrink-0">
                        {empresa.nome.charAt(0)}
                      </div>
                    )}
                    <div className="min-w-0">
                      <h3 className="text-base font-bold text-gray-900 truncate" title={empresa.nome}>
                        {empresa.nome}
                      </h3>
                      <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5 truncate">
                        <MapPin size={12} className="shrink-0" />
                        <span className="truncate">{empresa.cidade}, {empresa.estado}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1 px-2 py-1 bg-amber-50 text-amber-600 rounded-lg text-xs font-bold border border-amber-100 shrink-0 ml-2">
                    <Star size={12} className="fill-amber-500" />
                    {empresa.avaliacao || "Novo"}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-3">
                  <span className="px-2 py-1 bg-gray-50 text-gray-600 text-[10px] font-semibold uppercase tracking-wider rounded border border-gray-200">
                    {empresa.categoria1}
                  </span>
                  <span className="px-2 py-1 bg-blue-50 text-[#1D54ED] text-[10px] font-semibold uppercase tracking-wider rounded border border-blue-100">
                    {empresa.tipoOferta}
                  </span>
                </div>

                <p className="text-sm text-gray-600 line-clamp-2 mb-5 flex-1">
                  {empresa.descricao}
                </p>

                <div className="pt-4 border-t border-gray-50 mt-auto">
                  <Link 
                    href={`/empresas/${empresa.id}`}
                    className="w-full py-2 bg-gray-50 hover:bg-[#1D54ED] text-gray-700 hover:text-white rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2 group"
                  >
                    Ver Empresa
                    <ArrowRight size={16} className="text-gray-400 group-hover:text-white transition-colors" />
                  </Link>
                </div>
              </div>
            ))}
          </div>

        ) : (
          <div className="text-center py-12 bg-white rounded-2xl border border-gray-200 border-dashed">
            <p className="text-gray-500 font-medium">Nenhuma empresa encontrada para estas categorias.</p>
            <button onClick={() => setCategoriasAtivas([])} className="mt-4 text-[#1D54ED] text-sm font-semibold hover:underline">
              Limpar todos os filtros
            </button>
          </div>
        )}
      </div>

      {showLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-8 sm:p-10 relative">
            
            <button
              onClick={() => setShowLoginModal(false)}
              className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
            >
              <X size={24} />
            </button>

            <div className="flex justify-center mb-6">
               <div className="bg-[#1D54ED] text-white p-3 rounded-2xl">
                 <Sparkles size={28} />
               </div>
            </div>
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-2">
              Entrar na Vynco
            </h2>
            <p className="text-center text-gray-500 mb-8 text-sm">
              Registre a sua empresa e descubra novas oportunidades.
            </p>

            <button
              onClick={() => signIn("google")}
              className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-6 py-3.5 rounded-full font-semibold transition-all mb-6 cursor-pointer"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continuar com o Google
            </button>

            <div className="flex items-center gap-4 mb-6">
              <div className="flex-1 h-px bg-gray-200"></div>
              <span className="text-sm text-gray-400 font-medium">ou</span>
              <div className="flex-1 h-px bg-gray-200"></div>
            </div>

            <div className="space-y-4">
              <input
                type="text"
                placeholder="E-mail ou nome de usuário"
                className="w-full px-5 py-3.5 rounded-xl border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#1D54ED] focus:ring-1 focus:ring-[#1D54ED] transition-all"
              />
              <button
                onClick={() => alert("O login por e-mail será ativado na próxima fase! Por favor, utilize a opção do Google acima.")}
                className="w-full bg-[#0A0B10] hover:bg-gray-800 text-white px-6 py-3.5 rounded-full font-semibold transition-all shadow-sm cursor-pointer"
              >
                Continuar
              </button>
            </div>

            <p className="text-xs text-center text-gray-500 mt-8 leading-relaxed">
              Ao continuar, você concorda com os nossos <a href="#" className="text-[#1D54ED] hover:underline">Termos de Serviço</a>, <a href="#" className="text-[#1D54ED] hover:underline">Política de Privacidade</a> e <a href="#" className="text-[#1D54ED] hover:underline">Uso de cookies</a>.
            </p>
          </div>
        </div>
      )}

    </div>
  );
}