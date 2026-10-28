"use client";

import { useState } from "react";
import { useSession, signOut, signIn } from "next-auth/react";
import { usePathname } from "next/navigation"; 
import { 
  LayoutDashboard, Building2, Truck, Handshake, 
  FolderKanban, FileSpreadsheet, MessageSquare, 
  Star, Heart, Bell, Settings, ChevronDown, ChevronUp, 
  ChevronRight, User, LogOut, Sparkles, X // <-- Adicionei o Sparkles e o X aqui
} from "lucide-react";
import Link from "next/link";

export default function Sidebar() {
  const { data: session } = useSession();
  const pathname = usePathname(); 
  
  const [ecossistemaAberto, setEcossistemaAberto] = useState(true);
  const [negociosAberto, setNegociosAberto] = useState(true);
  const [menuPerfilAberto, setMenuPerfilAberto] = useState(false);
  
  // Novo estado para controlar a Janela Modal de Login
  const [showLoginModal, setShowLoginModal] = useState(false);

  const getLinkClasses = (caminho: string) => {
    const isAtivo = pathname === caminho;
    return `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-300 group ${
      isAtivo 
        ? "bg-[#161B29] text-[#4B7BFF] font-semibold border border-[#1D54ED]/20" 
        : "text-gray-400 hover:text-white hover:bg-white/5 hover:translate-x-1.5"
    }`;
  };

  const getIconClasses = (caminho: string) => {
    return `transition-colors duration-300 ${
      pathname === caminho 
        ? "text-[#4B7BFF]" 
        : "text-gray-500 group-hover:text-gray-300"
    }`;
  };

  return (
    <>
      <aside className="w-[260px] flex flex-col h-screen sticky top-0 bg-[#0A0B10] border-r border-gray-800 shrink-0 font-sans z-40">
        
        {/* Cabeçalho */}
        <div className="px-6 mb-6 mt-6">
          <h1 className="text-4xl font-bold text-white tracking-tight">
            Vynco<span className="text-[#1D54ED]">+</span>
          </h1>
          <p className="text-[13px] text-gray-500 mt-2 leading-relaxed">
            Empresas que constroem<br />juntas vão mais longe.
          </p>
        </div>
      
        {/* Corpo da Sidebar com Scroll */}
        <div className="flex-1 overflow-y-auto py-2 flex flex-col px-3 custom-scrollbar">
          
          <nav className="space-y-1.5 mb-6">
            <Link href="/" className={getLinkClasses("/")}>
              <LayoutDashboard size={18} className={getIconClasses("/")} />
              Dashboard
            </Link>

            <div className="pt-2">
              <button 
                onClick={() => setEcossistemaAberto(!ecossistemaAberto)}
                className="w-full flex items-center justify-between text-gray-500 hover:text-gray-300 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors"
              >
                <span className="uppercase text-xs tracking-wider font-bold">Ecossistema</span>
                {ecossistemaAberto ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              
              <div className={`flex flex-col gap-0.5 overflow-hidden transition-all duration-300 ${ecossistemaAberto ? "max-h-40 mt-1 opacity-100" : "max-h-0 opacity-0"}`}>
                <Link href="/empresas" className={getLinkClasses("/empresas")}>
                  <Building2 size={18} className={getIconClasses("/empresas")} /> Empresas
                </Link>
                <Link href="/fornecedores" className={getLinkClasses("/fornecedores")}>
                  <Truck size={18} className={getIconClasses("/fornecedores")} /> Fornecedores
                </Link>
                <Link href="/parceiros" className={getLinkClasses("/parceiros")}>
                  <Handshake size={18} className={getIconClasses("/parceiros")} /> Parceiros
                </Link>
              </div>
            </div>

            <div className="pt-2">
              <button 
                onClick={() => setNegociosAberto(!negociosAberto)}
                className="w-full flex items-center justify-between text-gray-500 hover:text-gray-300 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors"
              >
                <span className="uppercase text-xs tracking-wider font-bold">Negócios</span>
                {negociosAberto ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              
              <div className={`flex flex-col gap-0.5 overflow-hidden transition-all duration-300 ${negociosAberto ? "max-h-40 mt-1 opacity-100" : "max-h-0 opacity-0"}`}>
                <Link href="/projetos" className={getLinkClasses("/projetos")}>
                  <FolderKanban size={18} className={getIconClasses("/projetos")} /> Projetos
                </Link>
                <Link href="/orcamentos" className={getLinkClasses("/orcamentos")}>
                  <FileSpreadsheet size={18} className={getIconClasses("/orcamentos")} /> Orçamentos
                </Link>
              </div>
            </div>
          </nav>

          <div className="mt-auto pt-4 border-t border-gray-800">
            <nav className="space-y-0.5">
              <Link href="/mensagens" className={getLinkClasses("/mensagens")}>
                <div className="flex items-center gap-3">
                  <MessageSquare size={18} className={getIconClasses("/mensagens")} /> Mensagens
                </div>
                <span className="bg-[#1D54ED] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">3</span>
              </Link>
              <Link href="/notificacoes" className={getLinkClasses("/notificacoes")}>
                <Bell size={18} className={getIconClasses("/notificacoes")} /> Notificações
              </Link>
              <Link href="/avaliacoes" className={getLinkClasses("/avaliacoes")}>
                <Star size={18} className={getIconClasses("/avaliacoes")} /> Avaliações
              </Link>
              <Link href="/favoritos" className={getLinkClasses("/favoritos")}>
                <Heart size={18} className={getIconClasses("/favoritos")} /> Favoritos
              </Link>
              <Link href="/configuracoes" className={getLinkClasses("/configuracoes")}>
                <Settings size={18} className={getIconClasses("/configuracoes")} /> Configurações
              </Link>
            </nav>
          </div>
        </div>

        {/* Rodapé */}
        <div className="p-4 border-t border-gray-800 bg-[#0A0B10] relative">
          
          {menuPerfilAberto && session && (
            <div className="absolute bottom-[76px] left-4 right-4 bg-[#161B29] border border-gray-800 rounded-xl shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-bottom-2 duration-200">
              <Link 
                href="/perfil" 
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
              >
                <User size={16} />
                Perfil
              </Link>
              <button 
                onClick={() => signOut({ callbackUrl: "/" })}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-500 hover:text-red-400 hover:bg-red-500/10 transition-colors mt-1"
              >
                <LogOut size={16} />
                Sair
              </button>
            </div>
          )}

          <button 
            onClick={() => {
              if (session) {
                setMenuPerfilAberto(!menuPerfilAberto); 
              } else {
                setShowLoginModal(true); // <-- AGORA ABRE A JANELA MODAL!
              }
            }}
            className="w-full flex items-center justify-between hover:bg-white/5 p-2 rounded-xl transition-all duration-300 group"
          >
            <div className="flex items-center gap-3">
              {session?.user?.image ? (
                <img src={session.user.image} alt="Perfil" className="w-9 h-9 rounded-full border border-gray-700 shadow-sm" referrerPolicy="no-referrer" />
              ) : (
                <div className="w-9 h-9 rounded-full bg-[#1D54ED] flex items-center justify-center text-white font-bold shadow-sm">
                  {session?.user?.name?.charAt(0) || "U"}
                </div>
              )}
              <div className="flex flex-col text-left">
                <span className="text-sm font-semibold text-gray-300 group-hover:text-white transition-colors truncate w-[130px]">
                  {session?.user?.name || "Faça login"}
                </span>
              </div>
            </div>
            {session && (
              <ChevronRight size={16} className={`text-gray-600 transition-all duration-300 ${menuPerfilAberto ? "-rotate-90 text-white" : "group-hover:text-gray-400 group-hover:translate-x-1"}`} />
            )}
          </button>
        </div>
        
      </aside>

      {/* --- JANELA MODAL DE LOGIN (Igual à da página principal) --- */}
      {showLoginModal && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-8 sm:p-10 relative">
            
            <button
              onClick={() => setShowLoginModal(false)}
              className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={24} />
            </button>

            <div className="flex justify-center mb-6">
               <div className="bg-[#1D54ED] text-white p-3 rounded-2xl shadow-sm">
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
              className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-6 py-3.5 rounded-full font-semibold transition-all mb-6 shadow-sm"
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
                className="w-full px-5 py-3.5 rounded-xl border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#1D54ED] focus:ring-1 focus:ring-[#1D54ED] transition-all bg-gray-50 focus:bg-white"
              />
              <button
                onClick={() => alert("O login por e-mail será ativado na próxima fase! Por favor, utilize a opção do Google acima.")}
                className="w-full bg-[#0A0B10] hover:bg-gray-800 text-white px-6 py-3.5 rounded-full font-semibold transition-all shadow-sm"
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
    </>
  );
}