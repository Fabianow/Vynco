
"use client";

import {
  useMemo,
  useState,
} from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Building2,
  Heart,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import EmpresaCardFY from "@/app/components/EmpresaCardFY";
import { useFY } from "@/app/hooks/useFY";

export default function FYPage() {
  const fy = useFY();

  const [aba, setAba] =
    useState<"todas" | "favoritas">("todas");

  const [limite, setLimite] =
    useState(18);

  const recomendacoes =
    fy.dados?.recomendacoes ?? [];

  const lista = useMemo(
    () =>
      aba === "favoritas"
        ? recomendacoes.filter(
            (empresa) =>
              fy.favoritos.includes(empresa.id)
          )
        : recomendacoes,
    [
      aba,
      recomendacoes,
      fy.favoritos,
    ]
  );

  return (
    <main className="min-h-screen bg-[#F5F7FB] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">

        {/* CABEÇALHO */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <Link
              href="/"
              className="mb-3 inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-blue-700"
            >
              <ArrowLeft size={14} />
              Início
            </Link>

            <h1 className="flex items-center gap-2 text-3xl font-extrabold text-slate-900">
              <Sparkles
                size={26}
                className="text-[#1D54ED]"
              />
              Para você
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Descubra novas empresas,
              fornecedores e parceiros.
            </p>
          </div>

          <button
            onClick={fy.atualizar}
            disabled={fy.carregando}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw
              size={15}
              className={
                fy.carregando
                  ? "animate-spin"
                  : ""
              }
            />
            Atualizar
          </button>
        </div>

        {/* EMPRESA ATIVA */}
        {fy.dados && (
          <div className="mb-6 flex items-center gap-3 rounded-2xl border border-blue-100 bg-blue-50 p-4">
            <Building2
              size={21}
              className="text-blue-600"
            />

            <div>
              <p className="text-[11px] text-blue-600">
                Empresa selecionada
              </p>

              <strong className="text-sm text-slate-900">
                {fy.dados.empresaAtiva.nome}
              </strong>
            </div>
          </div>
        )}

        {/* ABAS */}
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex gap-2 rounded-xl bg-white p-1 shadow-sm">
            <button
              onClick={() => {
                setAba("todas");
                setLimite(18);
              }}
              className={`rounded-lg px-4 py-2 text-sm font-semibold ${
                aba === "todas"
                  ? "bg-[#1D54ED] text-white"
                  : "text-slate-600"
              }`}
            >
              Descobrir
            </button>

            <button
              onClick={() => {
                setAba("favoritas");
                setLimite(18);
              }}
              className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold ${
                aba === "favoritas"
                  ? "bg-[#1D54ED] text-white"
                  : "text-slate-600"
              }`}
            >
              <Heart size={14} />
              Salvas ({fy.favoritos.length})
            </button>
          </div>

          {!fy.carregando && fy.dados && (
            <span className="text-xs text-slate-500">
              {lista.length} empresas
            </span>
          )}
        </div>

        {/* CONTEÚDO */}
        {fy.carregando ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map(
              (x) => (
                <div
                  key={x}
                  className="h-80 animate-pulse rounded-2xl bg-slate-200"
                />
              )
            )}
          </div>
        ) : fy.erro ? (
          <div className="rounded-2xl bg-red-50 p-8 text-sm text-red-700">
            {fy.erro}

            <button
              onClick={fy.atualizar}
              className="ml-2 font-bold underline"
            >
              Tentar novamente
            </button>
          </div>
        ) : !fy.empresaId ? (
          <div className="rounded-2xl bg-white p-12 text-center">
            <h2 className="font-bold">
              Selecione sua empresa
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Use o menu no cabeçalho ou
              cadastre uma nova empresa.
            </p>

            <Link
              href="/nova-empresa"
              className="mt-4 inline-block text-sm font-semibold text-blue-600"
            >
              Cadastrar empresa
            </Link>
          </div>
        ) : lista.length === 0 ? (
          <div className="rounded-2xl bg-white p-12 text-center text-sm text-slate-500">
            {aba === "favoritas"
              ? "Você ainda não salvou empresas."
              : "Nenhuma empresa para recomendar no momento."}
          </div>
        ) : (
          <>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {lista
                .slice(0, limite)
                .map((empresa) => (
                  <EmpresaCardFY
                    key={empresa.id}
                    empresa={empresa}
                    favorito={fy.favoritos.includes(
                      empresa.id
                    )}
                    onFavorito={
                      fy.alternarFavorito
                    }
                  />
                ))}
            </div>

            {limite < lista.length && (
              <div className="mt-7 text-center">
                <button
                  onClick={() =>
                    setLimite((n) => n + 18)
                  }
                  className="rounded-xl bg-[#1D54ED] px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  Carregar mais empresas
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
