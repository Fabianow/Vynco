
"use client";

import {
  Suspense,
  useEffect,
  useState,
} from "react";
import Link from "next/link";
import {
  useRouter,
  useSearchParams,
} from "next/navigation";
import {
  ArrowLeft,
  Search,
  Sparkles,
} from "lucide-react";
import EmpresaCardFY, {
  type EmpresaCardDados,
} from "@/app/components/EmpresaCardFY";
import {
  registrarBusca,
  useFY,
} from "@/app/hooks/useFY";

function BuscaConteudo() {
  const router = useRouter();
  const params = useSearchParams();

  const termo = (
    params.get("q") ?? ""
  ).slice(0, 100);

  const [
    entrada,
    setEntrada,
  ] = useState(termo);

  const [
    empresas,
    setEmpresas,
  ] = useState<EmpresaCardDados[]>([]);

  const [
    total,
    setTotal,
  ] = useState(0);

  const [
    carregando,
    setCarregando,
  ] = useState(false);

  const [erro, setErro] = useState("");

  const fy = useFY();

  useEffect(() => {
    setEntrada(termo);
  }, [termo]);

  // Consulta o catálogo completo.
  useEffect(() => {
    if (termo.trim().length < 2) {
      setEmpresas([]);
      setTotal(0);
      return;
    }

    const controller = new AbortController();

    setCarregando(true);
    setErro("");

    fetch(
      `/api/busca?q=${encodeURIComponent(
        termo
      )}`,
      {
        signal: controller.signal,
        cache: "no-store",
      }
    )
      .then(async (res) => {
        const dados = await res.json();

        if (!res.ok) {
          throw new Error(
            dados.error ?? "Erro na pesquisa"
          );
        }

        if (!controller.signal.aborted) {
          setEmpresas(dados.empresas);
          setTotal(dados.total);
        }
      })
      .catch((error) => {
        if (!controller.signal.aborted) {
          setErro(
            error instanceof Error
              ? error.message
              : "Erro na pesquisa"
          );
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setCarregando(false);
        }
      });

    return () => controller.abort();
  }, [termo]);

  // Registra o interesse da empresa ativa.
  useEffect(() => {
    if (
      termo.trim().length >= 2 &&
      fy.status === "authenticated" &&
      fy.empresaId
    ) {
      void registrarBusca(termo);
    }
  }, [
    termo,
    fy.status,
    fy.empresaId,
  ]);

  const buscar = (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (entrada.trim().length >= 2) {
      router.push(
        `/busca?q=${encodeURIComponent(
          entrada.trim()
        )}`
      );
    }
  };

  return (
    <main className="min-h-screen bg-[#F5F7FB] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <Link
          href="/"
          className="mb-4 inline-flex items-center gap-2 text-xs font-semibold text-slate-500"
        >
          <ArrowLeft size={15} />
          Voltar ao início
        </Link>

        <h1 className="text-3xl font-extrabold text-slate-900">
          Pesquisar empresas
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Encontre fornecedores, produtos
          e serviços — mesmo com pequenos
          erros de digitação.
        </p>

        <form
          onSubmit={buscar}
          className="mt-6 flex max-w-3xl items-center gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm"
        >
          <Search
            size={20}
            className="ml-3 shrink-0 text-slate-400"
          />

          <input
            value={entrada}
            onChange={(e) =>
              setEntrada(e.target.value)
            }
            placeholder="Ex.: usinagen, logistica, softwere..."
            className="w-full min-w-0 flex-1 px-2 py-3 text-sm outline-none"
          />

          <button
            type="submit"
            className="rounded-xl bg-[#1D54ED] px-5 py-3 text-sm font-bold text-white"
          >
            Buscar
          </button>
        </form>

        {termo.length >= 2 && (
          <div className="mb-5 mt-8 flex items-center justify-between gap-3">
            <h2 className="text-lg font-bold">
              Resultados para “{termo}”
            </h2>

            <span className="text-xs text-slate-500">
              {total} empresas encontradas
            </span>
          </div>
        )}

        {carregando ? (
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-80 animate-pulse rounded-2xl bg-slate-200"
              />
            ))}
          </div>
        ) : erro ? (
          <p className="mt-8 rounded-xl bg-red-50 p-6 text-sm text-red-700">
            {erro}
          </p>
        ) : termo.length < 2 ? (
          <p className="mt-10 flex items-center gap-2 text-sm text-slate-500">
            <Sparkles size={17} />
            Digite um nome, setor ou serviço
            para começar.
          </p>
        ) : !empresas.length ? (
          <div className="mt-6 rounded-xl bg-white p-10 text-center text-slate-500">
            Nenhuma empresa encontrada.
            Tente outras palavras.
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {empresas.map((empresa) => (
              <EmpresaCardFY
                key={empresa.id}
                empresa={empresa}
                favorito={fy.favoritos.includes(
                  empresa.id
                )}
                onFavorito={
                  fy.status === "authenticated" &&
                  fy.empresaId
                    ? fy.alternarFavorito
                    : undefined
                }
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

export default function BuscaPage() {
  return (
    <Suspense
      fallback={
        <main className="p-10 text-sm text-slate-500">
          Carregando pesquisa...
        </main>
      }
    >
      <BuscaConteudo />
    </Suspense>
  );
}
