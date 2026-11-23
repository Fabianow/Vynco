
"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";
import { useSession } from "next-auth/react";
import type {
  EmpresaCardDados,
} from "@/app/components/EmpresaCardFY";

type RespostaFY = {
  empresaAtiva: {
    id: number;
    nome: string;
  };
  recomendacoes: EmpresaCardDados[];
  total: number;
};

export function getEmpresaAtivaId(): number | null {
  if (typeof window === "undefined") {
    return null;
  }

  const salvo = localStorage.getItem(
    "empresaAtivaId"
  );

  if (!salvo) return null;

  const id = Number(salvo);

  return Number.isSafeInteger(id) && id > 0
    ? id
    : null;
}

async function registrarInteracao(
  dados: Record<string, unknown>
): Promise<boolean> {
  try {
    const resposta = await fetch(
      "/api/fy/interacoes",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dados),
      }
    );

    if (!resposta.ok) {
      const erro = await resposta.json().catch(
        () => ({ error: "Erro ao registrar interação." })
      );

      console.error(
        "Interação FY:",
        erro.error
      );

      return false;
    }

    return true;
  } catch (error) {
    console.error(
      "Falha de conexão com a FY:",
      error
    );

    return false;
  }
}

export async function registrarContato(
  empresaDestinoId: number
) {
  const empresaAtivaId = getEmpresaAtivaId();

  if (
    !empresaAtivaId ||
    empresaAtivaId === empresaDestinoId
  ) {
    return false;
  }

  return registrarInteracao({
    tipo: "CONTATO",
    empresaAtivaId,
    empresaDestinoId,
  });
}

export async function registrarBusca(
  termo: string
) {
  const empresaAtivaId = getEmpresaAtivaId();

  if (
    !empresaAtivaId ||
    termo.trim().length < 2
  ) {
    return false;
  }

  return registrarInteracao({
    tipo: "BUSCA",
    empresaAtivaId,
    termo: termo.trim(),
  });
}

export function useFY() {
  const { status } = useSession();

  const [empresaId, setEmpresaId] =
    useState<number | null>(null);

  const [versao, setVersao] = useState(0);

  const [dados, setDados] =
    useState<RespostaFY | null>(null);

  const [favoritos, setFavoritos] =
    useState<number[]>([]);

  const [carregando, setCarregando] =
    useState(true);

  const [erro, setErro] = useState("");

  const atualizar = useCallback(() => {
    setVersao((anterior) => anterior + 1);
  }, []);

  // Sincronização com o menu de empresas.
  useEffect(() => {
    const sincronizar = () => {
      setEmpresaId(getEmpresaAtivaId());
      atualizar();
    };

    sincronizar();

    window.addEventListener(
      "empresaAtivaAlterada",
      sincronizar
    );

    window.addEventListener(
      "storage",
      sincronizar
    );

    return () => {
      window.removeEventListener(
        "empresaAtivaAlterada",
        sincronizar
      );

      window.removeEventListener(
        "storage",
        sincronizar
      );
    };
  }, [atualizar]);

  // Atualiza a FY quando a aba volta a ficar ativa.
  useEffect(() => {
    const atualizarAoVoltar = () => {
      if (
        document.visibilityState === "visible"
      ) {
        atualizar();
      }
    };

    document.addEventListener(
      "visibilitychange",
      atualizarAoVoltar
    );

    return () => {
      document.removeEventListener(
        "visibilitychange",
        atualizarAoVoltar
      );
    };
  }, [atualizar]);

  // Recarrega o histórico da empresa selecionada.
  useEffect(() => {
    if (
      status !== "authenticated" ||
      !empresaId
    ) {
      setDados(null);
      setFavoritos([]);
      setCarregando(false);
      setErro("");
      return;
    }

    const controller = new AbortController();

    async function carregar() {
      setCarregando(true);
      setErro("");

      try {
        const resposta = await fetch(
          `/api/fy?empresaId=${empresaId}`,
          {
            cache: "no-store",
            signal: controller.signal,
          }
        );

        const resultado = await resposta.json();

        if (!resposta.ok) {
          throw new Error(
            resultado.error ??
              "Erro ao carregar recomendações."
          );
        }

        if (!controller.signal.aborted) {
          setDados(resultado);
        }

        // Favoritos carregados separadamente.
        try {
          const fav = await fetch(
            `/api/fy/interacoes?empresaId=${empresaId}`,
            {
              cache: "no-store",
              signal: controller.signal,
            }
          );

          if (fav.ok) {
            const resultadoFav = await fav.json();

            if (!controller.signal.aborted) {
              setFavoritos(
                Array.isArray(
                  resultadoFav.favoritos
                )
                  ? resultadoFav.favoritos
                  : []
              );
            }
          }
        } catch (error) {
          if (!controller.signal.aborted) {
            console.error(
              "Erro ao carregar favoritos:",
              error
            );
          }
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          setDados(null);
          setErro(
            error instanceof Error
              ? error.message
              : "Erro na FY."
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setCarregando(false);
        }
      }
    }

    carregar();

    return () => {
      controller.abort();
    };
  }, [status, empresaId, versao]);

  const alternarFavorito = useCallback(
    async (destinoId: number) => {
      if (!empresaId) return;

      const jaSalvo =
        favoritos.includes(destinoId);

      // Atualiza o coração na hora.
      setFavoritos((anteriores) =>
        jaSalvo
          ? anteriores.filter(
              (id) => id !== destinoId
            )
          : [...anteriores, destinoId]
      );

      const sucesso = await registrarInteracao({
        tipo: "FAVORITO",
        empresaAtivaId: empresaId,
        empresaDestinoId: destinoId,
        modo: jaSalvo
          ? "remover"
          : "adicionar",
      });

      if (!sucesso) {
        // Reverte caso falhe no servidor.
        setFavoritos((anteriores) =>
          jaSalvo
            ? [
                ...new Set([
                  ...anteriores,
                  destinoId,
                ]),
              ]
            : anteriores.filter(
                (id) => id !== destinoId
              )
        );

        return;
      }

      // O favorito influencia o algoritmo.
      // Recarrega a ordem imediatamente.
      atualizar();
    },
    [empresaId, favoritos, atualizar]
  );

  return {
    empresaId,
    status,
    dados,
    favoritos,
    carregando,
    erro,
    alternarFavorito,
    atualizar,
  };
}
