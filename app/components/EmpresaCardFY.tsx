
"use client";

import Link from "next/link";
import {
  ArrowUpRight,
  Building2,
  Crown,
  Factory,
  Heart,
  MapPin,
  MessageSquare,
  Cpu,
  Truck,
  Leaf,
  Wrench,
  HardHat,
  Activity,
  Landmark,
  BriefcaseBusiness,
  Zap,
  ShoppingBag,
  GraduationCap,
  ShieldCheck,
} from "lucide-react";
import { registrarContato } from "@/app/hooks/useFY";

export type EmpresaCardDados = {
  id: number;
  nome: string;
  descricao: string;
  categoria1: string;
  categoria2?: string | null;
  tipoOferta: string;
  cidade: string;
  estado: string;
  avaliacao?: string | null;
  logoUrl?: string | null;
  bannerUrl?: string | null;
  plano?: string | null;
  isDemo?: boolean;
};

const temas = {
  industria: {
    fundo: "bg-[#E9EFF5]",
    detalhe: "bg-[#C9D8E7]",
    icone: "text-[#406789]",
    linha: "bg-[#7D9AB4]",
  },
  tecnologia: {
    fundo: "bg-[#E8EEFD]",
    detalhe: "bg-[#C5D6FD]",
    icone: "text-[#3B62B1]",
    linha: "bg-[#7497E8]",
  },
  construcao: {
    fundo: "bg-[#F3EEE6]",
    detalhe: "bg-[#E5D5B9]",
    icone: "text-[#967246]",
    linha: "bg-[#B99A72]",
  },
  logistica: {
    fundo: "bg-[#E7F1EF]",
    detalhe: "bg-[#C7DFD9]",
    icone: "text-[#377D72]",
    linha: "bg-[#6EAA9C]",
  },
  saude: {
    fundo: "bg-[#E8F4F3]",
    detalhe: "bg-[#C9E9E4]",
    icone: "text-[#2D827B]",
    linha: "bg-[#74B6AE]",
  },
  energia: {
    fundo: "bg-[#F9F1DF]",
    detalhe: "bg-[#F1DCAC]",
    icone: "text-[#B28429]",
    linha: "bg-[#D4AC58]",
  },
  financeiro: {
    fundo: "bg-[#EAE9F4]",
    detalhe: "bg-[#D4D1E9]",
    icone: "text-[#69629A]",
    linha: "bg-[#958FC2]",
  },
  outros: {
    fundo: "bg-[#EDF1F5]",
    detalhe: "bg-[#D8E0E8]",
    icone: "text-[#5A7288]",
    linha: "bg-[#9AB0C2]",
  },
};

function normalizar(texto: string) {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function identificarSetor(categoria: string) {
  const t = normalizar(categoria);

  if (
    /software|tecnologia|dados|cloud|nuvem|informatica|ciber|seguranca da informacao/.test(t)
  ) {
    return {
      tipo: "tecnologia" as const,
      Icone: Cpu,
    };
  }

  if (
    /usinagem|metal|industr|mecanica|automacao|robotica|ferramentaria|autopecas|manutencao industrial/.test(t)
  ) {
    return {
      tipo: "industria" as const,
      Icone: Factory,
    };
  }

  if (
    /construcao|arquitetura|engenharia civil|obras|materiais de construcao/.test(t)
  ) {
    return {
      tipo: "construcao" as const,
      Icone: HardHat,
    };
  }

  if (
    /logistica|transporte|armazenagem|distribuicao/.test(t)
  ) {
    return {
      tipo: "logistica" as const,
      Icone: Truck,
    };
  }

  if (
    /saude|hospital|clinica|laboratorio|medic/.test(t)
  ) {
    return {
      tipo: "saude" as const,
      Icone: Activity,
    };
  }

  if (/energia|solar|eletric/.test(t)) {
    return {
      tipo: "energia" as const,
      Icone: Zap,
    };
  }

  if (
    /financeiro|contabil|tribut|fiscal/.test(t)
  ) {
    return {
      tipo: "financeiro" as const,
      Icone: Landmark,
    };
  }

  if (/agro|agricola|rural/.test(t)) {
    return {
      tipo: "logistica" as const,
      Icone: Leaf,
    };
  }

  if (/comercio|atacado|varejo/.test(t)) {
    return {
      tipo: "outros" as const,
      Icone: ShoppingBag,
    };
  }

  if (/educacao|treinamento/.test(t)) {
    return {
      tipo: "outros" as const,
      Icone: GraduationCap,
    };
  }

  if (/seguranca|juridic/.test(t)) {
    return {
      tipo: "financeiro" as const,
      Icone: ShieldCheck,
    };
  }

  if (/manutencao|engenharia/.test(t)) {
    return {
      tipo: "industria" as const,
      Icone: Wrench,
    };
  }

  return {
    tipo: "outros" as const,
    Icone: BriefcaseBusiness,
  };
}

function iniciais(nome: string) {
  return nome
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((parte) => parte.charAt(0))
    .join("")
    .toUpperCase();
}

export default function EmpresaCardFY({
  empresa,
  favorito = false,
  onFavorito,
  compacto = false,
}: {
  empresa: EmpresaCardDados;
  favorito?: boolean;
  onFavorito?: (id: number) => void;
  compacto?: boolean;
}) {
  const setor = identificarSetor(
    `${empresa.categoria1} ${
      empresa.categoria2 ?? ""
    }`
  );

  const tema = temas[setor.tipo];
  const Icone = setor.Icone;

  // Banners Demo criados pelo seed possuem
  // texto dentro da imagem. Usamos uma capa
  // visual limpa para evitar textos cortados.
  const usarBanner =
    Boolean(empresa.bannerUrl) &&
    !empresa.isDemo;

  return (
    <article className="group flex h-full min-w-0 flex-col overflow-hidden rounded-[20px] border border-[#E2E8F0] bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-blue-200 hover:shadow-[0_12px_35px_-14px_rgba(29,84,237,0.22)]">

      {/* CAPA */}
      <div
        className={`relative flex ${
          compacto ? "h-28" : "h-36"
        } items-center justify-center overflow-hidden ${
          tema.fundo
        }`}
      >
        {usarBanner ? (
          <img
            src={empresa.bannerUrl!}
            alt={`Capa de ${empresa.nome}`}
            className="absolute inset-0 h-full w-full object-cover object-center"
          />
        ) : (
          <>
            {/* Composição geométrica discreta */}
            <div
              className={`absolute -right-10 -top-16 h-44 w-44 rounded-full ${tema.detalhe} opacity-45`}
            />

            <div
              className={`absolute -bottom-24 -left-10 h-44 w-44 rounded-full border-[30px] border-white/40`}
            />

            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative flex h-[76px] w-[76px] items-center justify-center rounded-[22px] border border-white/65 bg-white/45 shadow-sm backdrop-blur-sm">
                <Icone
                  size={36}
                  strokeWidth={1.45}
                  className={tema.icone}
                />
              </div>
            </div>

            <div
              className={`absolute bottom-0 left-0 h-1 w-full ${tema.linha} opacity-60`}
            />
          </>
        )}

        {empresa.plano === "PREMIUM" && (
          <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-bold text-amber-700 shadow-sm">
            <Crown size={12} />
            Premium
          </span>
        )}

        {onFavorito && (
          <button
            type="button"
            onClick={() =>
              onFavorito(empresa.id)
            }
            aria-label={
              favorito
                ? `Remover ${empresa.nome} dos favoritos`
                : `Salvar ${empresa.nome}`
            }
            title={
              favorito
                ? "Remover dos favoritos"
                : "Salvar empresa"
            }
            className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/95 text-slate-500 shadow-sm transition-colors hover:text-rose-500"
          >
            <Heart
              size={18}
              strokeWidth={1.8}
              className={
                favorito
                  ? "fill-rose-500 text-rose-500"
                  : ""
              }
            />
          </button>
        )}
      </div>

      {/* DADOS DA EMPRESA */}
      <div
        className={`flex flex-1 flex-col ${
          compacto ? "p-4" : "p-5"
        }`}
      >
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-white text-sm font-bold text-[#1D54ED] shadow-sm">
            {empresa.logoUrl ? (
              <img
                src={empresa.logoUrl}
                alt={`Logo de ${empresa.nome}`}
                className="h-full w-full object-cover"
              />
            ) : (
              iniciais(empresa.nome)
            )}
          </div>

          <div className="min-w-0 flex-1">
            <h3
              className="line-clamp-2 text-[15px] font-bold leading-snug text-[#14213D]"
              title={empresa.nome}
            >
              {empresa.nome}
            </h3>

            <p className="mt-1 flex min-w-0 items-center gap-1 text-xs text-slate-500">
              <MapPin
                size={12}
                className="shrink-0"
              />
              <span className="truncate">
                {empresa.cidade}, {empresa.estado}
              </span>
            </p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-1.5">
          <span className="max-w-full truncate rounded-md bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-700">
            {empresa.categoria1}
          </span>

          {empresa.categoria2 &&
            !compacto && (
              <span className="max-w-full truncate rounded-md bg-slate-100 px-2.5 py-1 text-[11px] text-slate-600">
                {empresa.categoria2}
              </span>
            )}

          <span className="rounded-md bg-slate-100 px-2.5 py-1 text-[11px] text-slate-600">
            {empresa.tipoOferta}
          </span>
        </div>

        <p className="mt-3 line-clamp-3 flex-1 text-[13px] leading-relaxed text-slate-600">
          {empresa.descricao}
        </p>

        <div className="mt-5 flex items-center justify-between gap-2 border-t border-slate-100 pt-4">
          <span className="text-xs font-medium text-slate-400">
            {empresa.avaliacao &&
            empresa.avaliacao !== "Novo"
              ? empresa.avaliacao
              : ""}
          </span>

          <div className="flex items-center gap-2">
            <Link
              href={`/mensagens?novaConversa=${empresa.id}`}
              onClick={() => {
                void registrarContato(
                  empresa.id
                );
              }}
              title="Conversar"
              aria-label={`Conversar com ${empresa.nome}`}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition-colors hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
            >
              <MessageSquare size={16} />
            </Link>

            <Link
              href={`/empresas/${empresa.id}`}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#1D54ED] px-3 text-xs font-semibold text-white transition-colors hover:bg-blue-700"
            >
              Ver perfil
              <ArrowUpRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
