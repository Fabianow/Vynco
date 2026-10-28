"use client";

import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import { Send, MapPin, Loader2, AlertCircle, Building } from "lucide-react";
import Link from "next/link";

function ChatContent() {
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const destinatarioId = searchParams.get("novaConversa");

  const [mensagem, setMensagem] = useState("");
  const [listaMensagens, setListaMensagens] = useState<any[]>([]);
  const [empresaDestinatario, setEmpresaDestinatario] = useState<any>(null);
  const [minhaEmpresa, setMinhaEmpresa] = useState<any>(null);
  const [semEmpresa, setSemEmpresa] = useState(false);
  
  const [isSending, setIsSending] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const getInitials = (name: string) => {
    if (!name) return "";
    const words = name.trim().split(" ");
    if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  useEffect(() => {
    if (!destinatarioId || status !== "authenticated") {
      if (status !== "loading") setIsLoading(false);
      return;
    }

    const buscarDados = () => {
      fetch(`/api/mensagens?destinatarioId=${destinatarioId}&userEmail=${session?.user?.email}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.semEmpresa) {
            setSemEmpresa(true);
            setEmpresaDestinatario(data.empresaDestinatario);
            setIsLoading(false);
            return;
          }
          
          if (data.mensagens) setListaMensagens(data.mensagens);
          if (data.empresaDestinatario) setEmpresaDestinatario(data.empresaDestinatario);
          if (data.minhaEmpresa) setMinhaEmpresa(data.minhaEmpresa);
          setIsLoading(false);
        })
        .catch(() => setIsLoading(false));
    };

    buscarDados();
    const intervalo = setInterval(buscarDados, 3000);
    return () => clearInterval(intervalo);
  }, [destinatarioId, session?.user?.email, status]);

  const enviarMensagem = async () => {
    if (!mensagem.trim() || !destinatarioId || !session?.user?.email) return;

    setIsSending(true);
    try {
      const res = await fetch("/api/mensagens", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          texto: mensagem,
          destinatarioId,
          userEmail: session.user.email,
        }),
      });

      if (res.ok) {
        const novaMsg = await res.json();
        setListaMensagens((prev) => [...prev, novaMsg]);
        setMensagem(""); 
      }
    } catch (error) {
      alert("Erro ao enviar.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-6 h-[70vh] min-h-[500px]">
      
      {/* Sidebar de Conversas */}
      <div className="w-full md:w-[35%] bg-white rounded-3xl border border-gray-200 p-6 shadow-sm overflow-y-auto">
        {empresaDestinatario ? (
          <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl mb-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-white border border-blue-200 flex items-center justify-center overflow-hidden shrink-0 text-[#1D54ED] font-bold text-sm">
              {empresaDestinatario.logoUrl ? (
                <img src={empresaDestinatario.logoUrl} alt={empresaDestinatario.nome} className="w-full h-full object-cover" />
              ) : (
                getInitials(empresaDestinatario.nome)
              )}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-[#1D54ED] truncate">{empresaDestinatario.nome}</p>
              <p className="text-xs text-blue-600/80 mt-0.5 truncate flex items-center gap-1 font-medium">
                <MapPin size={12} />
                {empresaDestinatario.cidade}
              </p>
            </div>
          </div>
        ) : (
          <p className="text-gray-500 text-sm leading-relaxed">
            Selecione uma empresa para negociar.
          </p>
        )}
      </div>

      {/* Janela Principal */}
      <div className="flex-1 bg-white rounded-3xl border border-gray-200 shadow-sm flex flex-col overflow-hidden relative">
        
        {/* BLOQUEIO B2B: SE O USUÁRIO NÃO TIVER EMPRESA */}
        {semEmpresa && (
          <div className="absolute inset-0 z-10 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center">
            <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mb-4 border border-amber-100">
              <Building className="text-amber-500" size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Plataforma exclusiva B2B</h3>
            <p className="text-gray-500 mb-6 max-w-md text-sm">
              Cadastre sua empresa <strong>{empresaDestinatario?.nome}</strong>, para conversar com outras empresas do nosso ecossistema.
            </p>
            <Link 
              href="/nova-empresa" 
              className="bg-[#1D54ED] hover:bg-blue-700 text-white px-6 py-3 rounded-full font-semibold transition-colors shadow-sm"
            >
              Cadastrar minha Empresa
            </Link>
          </div>
        )}

        <div className="flex-1 p-6 bg-gray-50/30 overflow-y-auto flex flex-col gap-4">
          {isLoading ? (
             <div className="flex-1 flex items-center justify-center text-[#1D54ED]">
               <Loader2 className="animate-spin" size={24} />
             </div>
          ) : !semEmpresa && minhaEmpresa && (
            <>
              <div className="text-center my-2">
                <span className="bg-white border border-gray-200 text-gray-500 text-xs px-4 py-1.5 rounded-full font-medium shadow-sm">
                  A conversar em nome de <strong>{minhaEmpresa.nome}</strong>
                </span>
              </div>
              
              {listaMensagens.map((msg, idx) => {
                const isMinha = msg.remetenteId === minhaEmpresa.id;
                return (
                  <div key={idx} className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm shadow-sm ${
                    isMinha 
                      ? "bg-[#1D54ED] text-white self-end rounded-br-sm" 
                      : "bg-white border border-gray-100 text-gray-800 self-start rounded-bl-sm"
                  }`}>
                    {msg.texto}
                  </div>
                );
              })}
            </>
          )}
        </div>

        <div className="p-4 bg-white border-t border-gray-100 flex gap-3 items-center">
          <input
            type="text"
            value={mensagem}
            onChange={(e) => setMensagem(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && enviarMensagem()}
            placeholder="Escreva uma mensagem..."
            className="flex-1 px-5 py-3.5 rounded-2xl border border-gray-200 focus:outline-none focus:border-[#1D54ED] focus:ring-1 focus:ring-[#1D54ED] text-sm transition-all disabled:bg-gray-50"
            disabled={!destinatarioId || isSending || semEmpresa}
          />
          <button 
            onClick={enviarMensagem}
            disabled={!destinatarioId || !mensagem.trim() || isSending || semEmpresa}
            className="bg-[#1D54ED] hover:bg-blue-700 text-white p-3.5 rounded-full transition-colors flex items-center justify-center shrink-0 disabled:opacity-50 disabled:bg-[#8CB2FF]"
          >
            {isSending ? <Loader2 size={18} className="animate-spin ml-1" /> : <Send size={18} className="ml-1" />}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function MensagensPage() {
  return (
    <div className="min-h-screen bg-[#F8F9FA] p-6 lg:p-12">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-extrabold text-[#0A0B10] tracking-tight mb-2">Mensagens</h1>
        <p className="text-gray-500 mb-8">Negocie diretamente com outras empresas do ecossistema.</p>
        
        <Suspense fallback={<div className="h-[500px] flex items-center justify-center"><Loader2 className="animate-spin text-blue-600" /></div>}>
          <ChatContent />
        </Suspense>
      </div>
    </div>
  );
}