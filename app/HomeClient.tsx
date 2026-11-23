
"use client";

import { useMemo, useState } from "react";
import {
  useSession,
  signIn,
} from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight,
  Building2,
  Cpu,
  Factory,
  Truck,
  HeartPulse,
  Wheat,
  ShoppingBag,
  Briefcase,
  Zap,
  Landmark,
  Sparkles,
  Search,
  Crown,
  MessageSquare,
  FileText,
  X,
  Compass,
  Plus,
} from "lucide-react";
import EmpresaCardFY, {
  type EmpresaCardDados,
} from "@/app/components/EmpresaCardFY";
import { useFY } from "@/app/hooks/useFY";

type EmpresaHome = EmpresaCardDados & {
  createdAt?: Date | string;
  status?: string;
};

const categorias = [
  {
    nome: "Construção",
    icon: Building2,
    termos: [
      "construcao",
      "arquitetura",
      "engenharia civil",
      "obras",
    ],
  },
  {
    nome: "Indústria",
    icon: Factory,
    termos: [
      "industria",
      "usinagem",
      "metalurgia",
      "ferramentaria",
      "mecanica",
      "automacao",
      "autopecas",
    ],
  },
  {
    nome: "Tecnologia",
    icon: Cpu,
    termos: [
      "tecnologia",
      "software",
      "dados",
      "informatica",
      "seguranca da informacao",
      "nuvem",
      "robotica",
    ],
  },
  {
    nome: "Logística",
    icon: Truck,
    termos: [
      "logistica",
      "transporte",
      "armazenagem",
      "distribuicao",
    ],
  },
  {
    nome: "Saúde",
    icon: HeartPulse,
    termos: [
      "saude",
      "hospital",
      "clinica",
      "laboratorio",
    ],
  },
  {
    nome: "Agronegócio",
    icon: Wheat,
    termos: [
      "agro",
      "agricola",
      "rural",
    ],
  },
  {
    nome: "Comércio",
    icon: ShoppingBag,
    termos: [
      "comercio",
      "atacado",
      "varejo",
      "suprimentos",
    ],
  },
  {
    nome: "Serviços",
    icon: Briefcase,
    termos: [
      "servico",
      "marketing",
      "consultoria",
      "limpeza",
      "educacao",
      "rh",
      "recursos humanos",
    ],
  },
  {
    nome: "Energia",
    icon: Zap,
    termos: [
      "energia",
      "solar",
      "eletric",
    ],
  },
  {
    nome: "Financeiro",
    icon: Landmark,
    termos: [
      "financeiro",
      "contabil",
      "fiscal",
      "tribut",
    ],
  },
];

function normalizar(t: string) {
  return t
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

export default function HomeClient({
  empresas,
}: {
  empresas: EmpresaHome[];
}) {
  const { status } = useSession();
  const router = useRouter();
  const fy = useFY();

  const [busca, setBusca] = useState("");

  const [
    categoriasAtivas,
    setCategoriasAtivas,
  ] = useState<string[]>([]);

  const [
    modalLogin,
    setModalLogin,
  ] = useState(false);

  // Usuários logados recebem recomendações da FY.
  // Visitantes recebem empresas do catálogo.
  const base =
    status === "authenticated"
      ? fy.dados?.recomendacoes ?? []
      : empresas.filter(
          (e) =>
            e.status !== "SUSPENSA" &&
            e.status !== "EXCLUIDA"
        );

  const filtradas = useMemo(
    () =>
      base.filter((empresa) => {
        if (!categoriasAtivas.length) {
          return true;
        }

        const texto = normalizar(
          `${empresa.categoria1} ${
            empresa.categoria2 ?? ""
          }`
        );

        return categoriasAtivas.some(
          (nome) =>
            categorias
              .find((c) => c.nome === nome)
              ?.termos.some(
                (t) => texto.includes(t)
              )
        );
      }),
    [base, categoriasAtivas]
  );

  const toggle = (nome: string) => {
    setCategoriasAtivas((lista) =>
      lista.includes(nome)
        ? lista.filter(
            (x) => x !== nome
          )
        : [...lista, nome]
    );
  };

  // Busca em todo o catálogo, com tolerância a erros.
  const submitBusca = (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (busca.trim().length > 1) {
      router.push(
        `/busca?q=${encodeURIComponent(
          busca.trim()
        )}`
      );
    }
  };

  return (
    <main className="min-h-screen bg-[#F5F7FB] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-[1550px] grid-cols-1 items-start gap-6 xl:grid-cols-[minmax(0,1fr)_290px]">

        {/* CONTEÚDO PRINCIPAL */}
        <div className="min-w-0 space-y-6">

          {/* HERO */}
          <section className="relative overflow-hidden rounded-3xl border border-blue-100 bg-gradient-to-br from-white via-[#F1F6FF] to-[#E4EEFF] p-6 shadow-sm sm:p-10">
            <div className="pointer-events-none absolute -right-12 -top-16 h-80 w-80 rounded-full border-[55px] border-white/40" />

            <div className="pointer-events-none absolute bottom-0 right-6 hidden rotate-[-10deg] text-[#1D54ED]/20 md:block">
              <Building2
                size={205}
                strokeWidth={0.8}
              />
            </div>

            <div className="relative z-10 max-w-[630px]">
              <span className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white px-3 py-1.5 text-xs font-semibold text-[#1D54ED] shadow-sm">
                <Sparkles size={14} />
                Ecossistema de negócios Vynco+
              </span>

              <h1 className="mt-5 text-3xl font-extrabold leading-tight tracking-tight text-[#101827] sm:text-4xl">
                Conecte sua empresa a{" "}
                <span className="text-[#1D54ED]">
                  grandes oportunidades.
                </span>
              </h1>

              <p className="mt-4 max-w-lg text-sm leading-relaxed text-slate-600 sm:text-base">
                Encontre fornecedores, parceiros,
                prestadores de serviço e novos negócios
                em um único lugar.
              </p>

              <form
                onSubmit={submitBusca}
                className="mt-7 flex max-w-xl flex-col gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm sm:flex-row"
              >
                <div className="flex flex-1 items-center gap-2 px-3">
                  <Search
                    size={18}
                    className="text-slate-400"
                  />

                  <input
                    value={busca}
                    onChange={(e) =>
                      setBusca(e.target.value)
                    }
                    placeholder="Busque empresas, produtos ou serviços..."
                    aria-label="Pesquisar empresas"
                    className="min-w-0 flex-1 py-2 text-sm text-slate-800 outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="rounded-xl bg-[#1D54ED] px-5 py-3 text-sm font-bold text-white hover:bg-blue-700"
                >
                  Buscar
                </button>
              </form>

              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() =>
                    status === "authenticated"
                      ? router.push("/nova-empresa")
                      : setModalLogin(true)
                  }
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1D54ED] hover:underline"
                >
                  <Plus size={15} />
                  Cadastrar minha empresa
                </button>

                <Link
                  href="/empresas"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:underline"
                >
                  Explorar catálogo
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </section>

          {/* CATEGORIAS */}
          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">
                Categorias em destaque
              </h2>

              <button
                onClick={() =>
                  setCategoriasAtivas([])
                }
                className="text-xs font-bold text-[#1D54ED] hover:underline"
              >
                Limpar filtros
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {categorias.map((c) => {
                const Icon = c.icon;

                const ativa =
                  categoriasAtivas.includes(
                    c.nome
                  );

                return (
                  <button
                    key={c.nome}
                    type="button"
                    onClick={() =>
                      toggle(c.nome)
                    }
                    className={`flex flex-col items-center gap-3 rounded-2xl border p-4 text-center transition-colors ${
                      ativa
                        ? "border-blue-500 bg-blue-50"
                        : "border-slate-100 hover:border-blue-200 hover:bg-blue-50/40"
                    }`}
                  >
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-[#1D54ED]">
                      <Icon size={21} />
                    </span>

                    <span className="text-xs font-semibold text-slate-800">
                      {c.nome}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* EMPRESAS RECOMENDADAS */}
          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-5 flex items-center justify-between gap-2">
              <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
                <Sparkles
                  size={18}
                  className="text-[#1D54ED]"
                />
                Empresas recomendadas
              </h2>

              <Link
                href="/fy"
                className="shrink-0 text-xs font-semibold text-[#1D54ED] hover:underline"
              >
                Ver todas
              </Link>
            </div>

            {status === "authenticated" &&
            fy.carregando ? (
              <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-3">
                {[1, 2, 3, 4, 5, 6].map(
                  (x) => (
                    <div
                      key={x}
                      className="h-80 animate-pulse rounded-2xl bg-slate-100"
                    />
                  )
                )}
              </div>
            ) : status === "authenticated" &&
              fy.erro ? (
              <div className="rounded-xl bg-red-50 p-7 text-sm text-red-700">
                {fy.erro}

                <button
                  onClick={fy.atualizar}
                  className="ml-2 font-bold underline"
                >
                  Tentar novamente
                </button>
              </div>
            ) : status === "authenticated" &&
              !fy.empresaId ? (
              <div className="rounded-xl bg-blue-50 p-7 text-sm text-slate-700">
                Selecione sua empresa no cabeçalho
                para ver recomendações.
              </div>
            ) : filtradas.length ? (
              <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-3">
                {filtradas
                  .slice(0, 6)
                  .map((empresa) => (
                    <EmpresaCardFY
                      key={empresa.id}
                      empresa={empresa}
                      compacto
                      favorito={fy.favoritos.includes(
                        empresa.id
                      )}
                      onFavorito={
                        status === "authenticated"
                          ? fy.alternarFavorito
                          : undefined
                      }
                    />
                  ))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-slate-200 p-10 text-center text-sm text-slate-500">
                <Compass
                  size={30}
                  className="mx-auto mb-3 text-slate-300"
                />

                Nenhuma empresa nessa seleção.

                <button
                  onClick={() =>
                    setCategoriasAtivas([])
                  }
                  className="ml-2 font-semibold text-[#1D54ED]"
                >
                  Limpar filtros
                </button>
              </div>
            )}

            <div className="mt-5 text-center">
              <Link
                href="/fy"
                className="inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-5 py-2.5 text-sm font-semibold text-[#1D54ED] hover:bg-blue-100"
              >
                Ver mais empresas
                <ArrowRight size={15} />
              </Link>
            </div>
          </section>

          {/* OUTRAS OPORTUNIDADES */}
          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="mb-4 text-lg font-bold text-slate-900">
              Explore novas oportunidades
            </h2>

            <div className="grid gap-3 sm:grid-cols-3">
              {[
                {
                  nome: "Projetos",
                  href: "/projetos",
                  icon: Building2,
                },
                {
                  nome: "Orçamentos",
                  href: "/orcamentos",
                  icon: FileText,
                },
                {
                  nome: "Fornecedores",
                  href: "/fornecedores",
                  icon: Factory,
                },
              ].map((link) => {
                const Icon = link.icon;

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="rounded-2xl border border-slate-100 bg-slate-50 p-4 hover:bg-blue-50"
                  >
                    <Icon
                      size={23}
                      className="text-[#1D54ED]"
                    />

                    <h3 className="mt-3 text-sm font-bold">
                      {link.nome}
                    </h3>

                    <ArrowRight
                      size={15}
                      className="mt-2 text-[#1D54ED]"
                    />
                  </Link>
                );
              })}
            </div>
          </section>
        </div>

        {/* COLUNA DIREITA */}
        <aside className="space-y-5">
          <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b p-4">
              <h2 className="text-sm font-bold">
                Sugestões para você
              </h2>

              <Link
                href="/fy"
                className="text-xs font-semibold text-[#1D54ED]"
              >
                Ver todas
              </Link>
            </div>

            {base.slice(0, 3).map(
              (empresa) => (
                <Link
                  key={empresa.id}
                  href={`/empresas/${empresa.id}`}
                  className="flex items-center gap-3 border-b border-slate-100 px-4 py-3 hover:bg-slate-50"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-blue-50 text-xs font-bold text-blue-600">
                    {empresa.logoUrl ? (
                      <img
                        src={empresa.logoUrl}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      empresa.nome
                        .slice(0, 2)
                        .toUpperCase()
                    )}
                  </span>

                  <span className="min-w-0 flex-1">
                    <strong className="block truncate text-xs">
                      {empresa.nome}
                    </strong>

                    <small className="block truncate text-slate-500">
                      {empresa.categoria1}
                    </small>
                  </span>

                  <ArrowRight
                    size={14}
                    className="text-blue-600"
                  />
                </Link>
              )
            )}

            {!base.length && (
              <p className="p-4 text-xs text-slate-400">
                Sem sugestões por enquanto.
              </p>
            )}
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-3 text-sm font-bold">
              Acessos rápidos
            </h2>

            {[
              {
                href: "/mensagens",
                label: "Mensagens",
                icon: MessageSquare,
              },
              {
                href: "/orcamentos",
                label: "Orçamentos",
                icon: FileText,
              },
              {
                href: "/empresas",
                label: "Todas as empresas",
                icon: Building2,
              },
            ].map((link) => {
              const Icon = link.icon;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center gap-3 rounded-xl p-3 text-sm text-slate-700 hover:bg-blue-50"
                >
                  <Icon
                    size={17}
                    className="text-[#1D54ED]"
                  />

                  {link.label}

                  <ArrowRight
                    size={14}
                    className="ml-auto text-slate-400"
                  />
                </Link>
              );
            })}
          </section>

          <section className="rounded-3xl bg-gradient-to-br from-[#0D2145] to-[#061329] p-6 text-white shadow-lg">
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-white/10">
              <Crown
                size={27}
                className="text-amber-300"
              />
            </div>

            <h2 className="text-xl font-extrabold text-amber-300">
              Vynco+ Premium
            </h2>

            <p className="mt-3 text-sm leading-relaxed text-blue-100">
              Mais visibilidade para sua empresa
              e novas oportunidades de negócio.
            </p>

            <div className="mt-6 rounded-xl border border-white/15 bg-white/10 p-3 text-center text-xs font-semibold">
              Mais funcionalidades em desenvolvimento
            </div>
          </section>
        </aside>
      </div>

      {/* MODAL DE LOGIN */}
      {modalLogin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="relative w-full max-w-md rounded-3xl bg-white p-8 shadow-xl">
            <button
              onClick={() =>
                setModalLogin(false)
              }
              aria-label="Fechar"
              className="absolute right-5 top-5"
            >
              <X size={20} />
            </button>

            <h2 className="mb-2 text-center text-2xl font-bold">
              Entre na Vynco+
            </h2>

            <p className="mb-6 text-center text-sm text-slate-500">
              Faça login para cadastrar sua empresa.
            </p>

            <button
              onClick={() =>
                signIn("google")
              }
              className="w-full rounded-xl border border-slate-200 p-3 font-semibold hover:bg-slate-50"
            >
              Continuar com o Google
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
