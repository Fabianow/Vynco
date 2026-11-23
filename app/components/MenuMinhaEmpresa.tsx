
"use client";

import { useState, useEffect, useRef } from "react";
import {
  Building2,
  ChevronDown,
  LogOut,
  Settings,
  Check,
} from "lucide-react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

type Empresa = {
  id: number;
  nome: string;
  logoUrl: string | null;
};

export default function MenuMinhaEmpresa() {
  const { data: session } = useSession();

  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [empresaAtivaId, setEmpresaAtivaId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Busca empresas pertencentes ao usuário
  useEffect(() => {
    let ativo = true;

    async function carregarEmpresas() {
      try {
        const resposta = await fetch("/api/minha-empresa");

        if (!resposta.ok) {
          throw new Error("Erro ao buscar empresas");
        }

        const dados: Empresa[] = await resposta.json();

        if (!ativo) return;

        if (Array.isArray(dados) && dados.length > 0) {
          setEmpresas(dados);

          const salva = localStorage.getItem("empresaAtivaId");

          const empresaSalva = dados.find(
            (empresa) => empresa.id.toString() === salva
          );

          const empresaSelecionada = empresaSalva ?? dados[0];

          setEmpresaAtivaId(empresaSelecionada.id);

          // Garante que a empresa inicial esteja armazenada
          localStorage.setItem(
            "empresaAtivaId",
            empresaSelecionada.id.toString()
          );

          // Avisa a FY sobre a empresa ativa inicial
          window.dispatchEvent(
            new Event("empresaAtivaAlterada")
          );
        } else {
          setEmpresas([]);
          setEmpresaAtivaId(null);
          localStorage.removeItem("empresaAtivaId");

          window.dispatchEvent(
            new Event("empresaAtivaAlterada")
          );
        }
      } catch (erro) {
        console.error("Erro ao carregar empresas:", erro);
      } finally {
        if (ativo) setIsLoading(false);
      }
    }

    carregarEmpresas();

    return () => {
      ativo = false;
    };
  }, [session?.user?.email]);

  // Fecha o menu quando clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const getInitials = (name: string) => {
    if (!name) return "";

    const words = name.trim().split(" ");

    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }

    return name.substring(0, 2).toUpperCase();
  };

  // Altera a empresa ativa e notifica outros componentes
  const selecionarEmpresa = (id: number) => {
    if (empresaAtivaId === id) {
      setIsOpen(false);
      return;
    }

    setEmpresaAtivaId(id);

    localStorage.setItem(
      "empresaAtivaId",
      id.toString()
    );

    // Permite que a FY recarregue as recomendações
    window.dispatchEvent(
      new Event("empresaAtivaAlterada")
    );

    setIsOpen(false);
  };

  if (isLoading) {
    return (
      <div className="h-10 w-32 bg-gray-100 rounded-full animate-pulse" />
    );
  }

  const empresaAtiva =
    empresas.find((empresa) => empresa.id === empresaAtivaId) ??
    empresas[0];

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Botão do cabeçalho */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 border border-gray-200 rounded-full hover:bg-gray-50 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-[#1D54ED]/30"
      >
        {empresaAtiva ? (
          <>
            <div className="w-7 h-7 rounded-full bg-[#F0F5FF] text-[#1D54ED] flex items-center justify-center text-xs font-bold shrink-0 overflow-hidden">
              {empresaAtiva.logoUrl ? (
                <img
                  src={empresaAtiva.logoUrl}
                  className="w-full h-full object-cover"
                  alt={`Logo de ${empresaAtiva.nome}`}
                />
              ) : (
                getInitials(empresaAtiva.nome)
              )}
            </div>

            <span className="text-sm font-semibold text-gray-700 truncate max-w-[120px]">
              {empresaAtiva.nome}
            </span>
          </>
        ) : (
          <>
            <div className="w-7 h-7 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center">
              <Building2 size={14} />
            </div>

            <span className="text-sm font-semibold text-gray-700">
              Minha Conta
            </span>
          </>
        )}

        <ChevronDown
          size={14}
          className="text-gray-400 ml-1"
        />
      </button>

      {/* Menu suspenso */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-72 bg-white border border-gray-200 rounded-xl shadow-xl py-2 z-50 overflow-hidden">
          {/* Perfil do usuário */}
          <div className="px-4 py-3 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-[#F0F5FF] flex items-center justify-center text-[#1D54ED] font-bold text-lg overflow-hidden shrink-0">
                {session?.user?.image ? (
                  <img
                    src={session.user.image}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  getInitials(session?.user?.name || "User")
                )}
              </div>

              <div className="min-w-0">
                <p className="text-sm font-bold text-gray-900 truncate">
                  {session?.user?.name}
                </p>

                <p className="text-xs text-gray-500 truncate">
                  {session?.user?.email}
                </p>
              </div>
            </div>
          </div>

          {/* Minhas empresas */}
          <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50">
            <h3 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-3">
              Minhas Empresas
            </h3>

            {empresas.length > 0 ? (
              <div className="space-y-1">
                {empresas.map((emp) => (
                  <div
                    key={emp.id}
                    className="flex flex-col"
                  >
                    <button
                      type="button"
                      onClick={() => selecionarEmpresa(emp.id)}
                      className={`flex items-center justify-between w-full p-2 rounded-lg transition-colors ${
                        empresaAtiva?.id === emp.id
                          ? "bg-blue-50/50 border border-blue-100"
                          : "hover:bg-gray-100 border border-transparent"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded bg-white border border-gray-200 shadow-sm flex items-center justify-center text-xs font-bold text-gray-600 overflow-hidden shrink-0">
                          {emp.logoUrl ? (
                            <img
                              src={emp.logoUrl}
                              className="w-full h-full object-cover"
                              alt={`Logo de ${emp.nome}`}
                            />
                          ) : (
                            getInitials(emp.nome)
                          )}
                        </div>

                        <div className="min-w-0 text-left flex-1">
                          <p
                            className={`text-sm font-semibold truncate transition-colors ${
                              empresaAtiva?.id === emp.id
                                ? "text-[#1D54ED]"
                                : "text-gray-800"
                            }`}
                          >
                            {emp.nome}
                          </p>
                        </div>
                      </div>

                      {empresaAtiva?.id === emp.id && (
                        <Check
                          size={16}
                          className="text-[#1D54ED] shrink-0 ml-2"
                        />
                      )}
                    </button>

                    {/* Link fora do botão para evitar elementos interativos aninhados */}
                    <Link
                      href={`/empresas/${emp.id}`}
                      onClick={() => setIsOpen(false)}
                      className="text-[11px] text-gray-500 hover:text-[#1D54ED] hover:underline ml-14 mb-1"
                    >
                      Ver perfil da empresa
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-500 mb-2">
                Nenhuma empresa cadastrada.
              </p>
            )}

            <Link
              href="/nova-empresa"
              onClick={() => setIsOpen(false)}
              className="mt-3 w-full flex items-center justify-center gap-2 border border-[#1D54ED] text-[#1D54ED] hover:bg-blue-50 py-2 rounded-full text-xs font-semibold transition-colors"
            >
              + Cadastrar nova empresa
            </Link>
          </div>

          {/* Configurações e saída */}
          <div className="py-1">
            <Link
              href="/configuracoes"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Settings size={16} className="text-gray-400" />
              Configurações
            </Link>

            <button
              type="button"
              onClick={() => signOut()}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors text-left"
            >
              <LogOut size={16} className="text-gray-400" />
              Sair da conta
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
