
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import {
  normalizar,
  pontuarBusca,
} from "@/lib/busca-inteligente";

export const dynamic = "force-dynamic";

type Visita = {
  empresaDestinoId: number;
  categoria1: string;
  categoria2: string | null;
  dias: number | bigint;
};

type Atividade = {
  tipo: "BUSCA" | "CONTATO";
  termo: string | null;
  empresaDestinoId: number | null;
  categoria1: string | null;
  categoria2: string | null;
  dias: number | bigint;
};

type Favorito = {
  empresaDestinoId: number;
  categoria1: string;
  categoria2: string | null;
};

type CategoriaInteresse = {
  pontos: number;
  ocorrencias: number;
  ultimaInteracao: number;
};

function recencia(dias: number): number {
  if (dias <= 1) return 1.6;
  if (dias <= 3) return 1.35;
  if (dias <= 7) return 1.15;
  if (dias <= 14) return 0.95;
  if (dias <= 30) return 0.7;
  if (dias <= 60) return 0.45;
  return 0.25;
}

function grupoSetor(categoria: string): string {
  const t = normalizar(categoria);

  if (
    /software|tecnologia|dados|nuvem|cloud|informatica|ciber|seguranca da informacao/.test(t)
  ) return "tecnologia";

  if (
    /usinagem|metalurgia|ferramentaria|mecanica|automacao industrial|robotica|autopecas|estruturas metalicas|manutencao industrial|prototipagem/.test(t)
  ) return "industria";

  if (
    /construcao|arquitetura|engenharia civil|obra|materiais de construcao/.test(t)
  ) return "construcao";

  if (
    /logistica|transporte|armazenagem|distribuicao/.test(t)
  ) return "logistica";

  if (/saude|hospital|clinica|laboratorio|medic/.test(t))
    return "saude";

  if (/agro|agricola|rural/.test(t)) return "agronegocio";

  if (
    /contabil|financeir|tribut|fiscal|capital/.test(t)
  ) return "financeiro";

  if (/energia|eletric|solar/.test(t)) return "energia";

  if (
    /marketing|publicidade|design|comunicacao/.test(t)
  ) return "marketing";

  if (
    /comercio|atacado|varejo|suprimentos/.test(t)
  ) return "comercio";

  if (
    /educacao|treinamento|recursos humanos|recrutamento/.test(t)
  ) return "pessoas";

  return t || "outros";
}

function categoriasDe(
  principal: string | null,
  secundaria: string | null
): string[] {
  return [
    ...new Set(
      [normalizar(principal), normalizar(secundaria)]
        .filter(Boolean)
    ),
  ];
}

export async function GET(req: Request) {
  try {
    const sessao = await getServerSession();

    if (!sessao?.user?.email) {
      return NextResponse.json(
        { error: "Faça login para acessar a FY." },
        { status: 401 }
      );
    }

    const empresaId = Number(
      new URL(req.url).searchParams.get("empresaId")
    );

    if (
      !Number.isSafeInteger(empresaId) ||
      empresaId <= 0
    ) {
      return NextResponse.json(
        { error: "Selecione uma empresa válida." },
        { status: 400 }
      );
    }

    const minhaEmpresa = await prisma.empresa.findFirst({
      where: {
        id: empresaId,
        status: "ATIVA",
        dono: {
          email: sessao.user.email,
        },
      },
    });

    if (!minhaEmpresa) {
      return NextResponse.json(
        { error: "Empresa não autorizada." },
        { status: 403 }
      );
    }

    const minhasEmpresas = await prisma.empresa.findMany({
      where: {
        dono: {
          email: sessao.user.email,
        },
      },
      select: { id: true },
    });

    const meusIds = minhasEmpresas.map((e) => e.id);

    const [
      empresas,
      visitas,
      atividades,
      favoritos,
    ] = await Promise.all([
      prisma.empresa.findMany({
        where: {
          status: "ATIVA",
          id: {
            notIn: meusIds,
          },
        },
        select: {
          id: true,
          nome: true,
          descricao: true,
          categoria1: true,
          categoria2: true,
          tipoOferta: true,
          cidade: true,
          estado: true,
          logoUrl: true,
          bannerUrl: true,
          avaliacao: true,
          plano: true,
          isDemo: true,
          createdAt: true,
        },
        take: 1500,
        orderBy: {
          createdAt: "desc",
        },
      }),

      prisma.$queryRaw<Visita[]>`
        SELECT
          v.empresaDestinoId,
          e.categoria1,
          e.categoria2,
          DATEDIFF(
            CURRENT_DATE(),
            MAX(v.dia)
          ) AS dias
        FROM fy_visita v
        INNER JOIN empresa e
          ON e.id = v.empresaDestinoId
        WHERE
          v.empresaOrigemId = ${empresaId}
          AND v.dia >= DATE_SUB(
            CURRENT_DATE(), INTERVAL 90 DAY
          )
          AND e.status = 'ATIVA'
        GROUP BY
          v.empresaDestinoId,
          e.categoria1,
          e.categoria2
        ORDER BY MAX(v.dia) DESC
        LIMIT 500
      `,

      prisma.$queryRaw<Atividade[]>`
        SELECT
          a.tipo,
          a.termo,
          a.empresaDestinoId,
          e.categoria1,
          e.categoria2,
          DATEDIFF(
            CURRENT_DATE(),
            a.dia
          ) AS dias
        FROM fy_atividade a
        LEFT JOIN empresa e
          ON e.id = a.empresaDestinoId
        WHERE
          a.empresaOrigemId = ${empresaId}
          AND a.dia >= DATE_SUB(
            CURRENT_DATE(), INTERVAL 90 DAY
          )
        ORDER BY
          a.createdAt DESC
        LIMIT 500
      `,

      prisma.$queryRaw<Favorito[]>`
        SELECT
          f.empresaDestinoId,
          e.categoria1,
          e.categoria2
        FROM fy_favorito f
        INNER JOIN empresa e
          ON e.id = f.empresaDestinoId
        WHERE
          f.empresaOrigemId = ${empresaId}
          AND e.status = 'ATIVA'
        LIMIT 500
      `,
    ]);

    // Interesses são calculados apenas para o
    // CNPJ que está ativo no momento.
    const interesses = new Map<
      string,
      CategoriaInteresse
    >();

    const adicionarInteresse = (
      categoria: string,
      peso: number,
      dias: number
    ) => {
      const chave = normalizar(categoria);
      if (!chave) return;

      const anterior = interesses.get(chave) ?? {
        pontos: 0,
        ocorrencias: 0,
        ultimaInteracao: 999,
      };

      interesses.set(chave, {
        pontos:
          anterior.pontos + peso * recencia(dias),
        ocorrencias: anterior.ocorrencias + 1,
        ultimaInteracao: Math.min(
          anterior.ultimaInteracao,
          dias
        ),
      });
    };

    const aprenderCategorias = (
      principal: string | null,
      secundaria: string | null,
      peso: number,
      dias: number
    ) => {
      const categorias = categoriasDe(
        principal,
        secundaria
      );

      if (categorias[0]) {
        adicionarInteresse(
          categorias[0],
          peso,
          dias
        );
      }

      if (categorias[1]) {
        adicionarInteresse(
          categorias[1],
          peso * 0.65,
          dias
        );
      }
    };

    const empresasVisitadas = new Set<number>();

    for (const visita of visitas) {
      empresasVisitadas.add(
        Number(visita.empresaDestinoId)
      );

      aprenderCategorias(
        visita.categoria1,
        visita.categoria2,
        2.5,
        Number(visita.dias)
      );
    }

    const pesquisas: Array<{
      termo: string;
      dias: number;
    }> = [];

    const contatos = new Set<number>();

    for (const atividade of atividades) {
      const dias = Number(atividade.dias);

      if (
        atividade.tipo === "BUSCA" &&
        atividade.termo
      ) {
        pesquisas.push({
          termo: atividade.termo,
          dias,
        });

        // Aprende os segmentos que aparecem
        // no termo pesquisado.
        const buscaNormalizada = normalizar(
          atividade.termo
        );

        for (const empresa of empresas) {
          const categoriaTexto =
            `${empresa.categoria1} ${empresa.categoria2 ?? ""}`;

          if (
            buscaNormalizada.length >= 4 &&
            pontuarBusca(
              {
                nome: "",
                descricao: "",
                categoria1: empresa.categoria1,
                categoria2: empresa.categoria2,
                cidade: "",
                estado: "",
                tipoOferta: "",
              },
              buscaNormalizada
            ) >= 25
          ) {
            aprenderCategorias(
              empresa.categoria1,
              empresa.categoria2,
              0.08,
              dias
            );
          }
        }
      }

      if (
        atividade.tipo === "CONTATO" &&
        atividade.empresaDestinoId
      ) {
        contatos.add(
          Number(atividade.empresaDestinoId)
        );

        aprenderCategorias(
          atividade.categoria1,
          atividade.categoria2,
          4,
          dias
        );
      }
    }

    const idsFavoritos = new Set(
      favoritos.map((f) =>
        Number(f.empresaDestinoId)
      )
    );

    for (const favorito of favoritos) {
      aprenderCategorias(
        favorito.categoria1,
        favorito.categoria2,
        3.5,
        0
      );
    }

    const categoriasProprias = categoriasDe(
      minhaEmpresa.categoria1,
      minhaEmpresa.categoria2
    );

    // Score dinâmico: não chega ao mesmo teto
    // após poucas visitas. Interesses mais fortes
    // ganham relevância progressivamente.
    const pontuarInteresse = (
      categorias: string[]
    ) => {
      let valor = 0;

      for (const categoria of categorias) {
        const direto = interesses.get(categoria);

        if (direto) {
          valor +=
            16 * Math.log1p(direto.pontos);
        }

        const grupo = grupoSetor(categoria);

        for (const [outra, interesse] of interesses) {
          if (
            outra !== categoria &&
            grupoSetor(outra) === grupo
          ) {
            valor +=
              2.6 * Math.log1p(
                interesse.pontos
              );
          }
        }
      }

      return Math.round(valor);
    };

    const ordenadas = empresas.map((empresa) => {
      const categorias = categoriasDe(
        empresa.categoria1,
        empresa.categoria2
      );

      let pontuacao = 0;

      const emComum = categorias.filter(
        (c) => categoriasProprias.includes(c)
      );

      if (emComum.length) {
        pontuacao += 30;

        if (emComum.length > 1) {
          pontuacao += 10;
        }
      }

      const mesmoEstado =
        normalizar(empresa.estado) ===
        normalizar(minhaEmpresa.estado);

      const mesmaCidade =
        normalizar(empresa.cidade) ===
        normalizar(minhaEmpresa.cidade);

      if (mesmoEstado) {
        pontuacao += mesmaCidade ? 12 : 6;
      }

      if (
        normalizar(empresa.tipoOferta) ===
        normalizar(minhaEmpresa.tipoOferta)
      ) {
        pontuacao += 4;
      }

      pontuacao += pontuarInteresse(categorias);

      if (idsFavoritos.has(empresa.id)) {
        pontuacao += 18;
      }

      if (contatos.has(empresa.id)) {
        pontuacao += 25;
      }

      const buscaScore = pesquisas.reduce(
        (soma, pesquisa) => {
          const relevancia = pontuarBusca(
            empresa,
            pesquisa.termo
          );

          if (relevancia < 15) {
            return soma;
          }

          return (
            soma +
            Math.min(
              18,
              Math.round(
                relevancia * 0.22
              )
            ) *
              recencia(pesquisa.dias)
          );
        },
        0
      );

      pontuacao += Math.min(
        55,
        Math.round(buscaScore)
      );

      if (empresa.plano === "PREMIUM") {
        pontuacao += 4;
      }

      // Pequena preferência por novas descobertas
      // dentro dos interesses atuais.
      if (
        !empresasVisitadas.has(empresa.id) &&
        pontuacao >= 25
      ) {
        pontuacao += 5;
      }

      return {
        id: empresa.id,
        nome: empresa.nome,
        descricao: empresa.descricao,
        categoria1: empresa.categoria1,
        categoria2: empresa.categoria2,
        tipoOferta: empresa.tipoOferta,
        cidade: empresa.cidade,
        estado: empresa.estado,
        logoUrl: empresa.logoUrl,
        bannerUrl: empresa.bannerUrl,
        avaliacao: empresa.avaliacao,
        plano: empresa.plano,
        isDemo: empresa.isDemo,
        pontuacao,
        grupo: grupoSetor(empresa.categoria1),
      };
    });

    ordenadas.sort(
      (a, b) =>
        b.pontuacao - a.pontuacao ||
        a.id - b.id
    );

    // Diversificação: nas primeiras posições,
    // evita mostrar muitos cartões consecutivos
    // do mesmo macrosetor.
    const resultado: typeof ordenadas = [];
    const restantes = [...ordenadas];
    const contagem = new Map<string, number>();

    while (
      resultado.length < 100 &&
      restantes.length > 0
    ) {
      const posicao = resultado.length;
      const limiteGrupo =
        posicao < 6
          ? 2
          : posicao < 18
            ? 5
            : Infinity;

      let indice = restantes.findIndex(
        (empresa) =>
          (contagem.get(empresa.grupo) ?? 0) <
          limiteGrupo
      );

      if (indice === -1) {
        indice = 0;
      }

      const escolhida = restantes.splice(
        indice,
        1
      )[0];

      resultado.push(escolhida);

      contagem.set(
        escolhida.grupo,
        (contagem.get(escolhida.grupo) ?? 0) + 1
      );
    }

    return NextResponse.json(
      {
        empresaAtiva: {
          id: minhaEmpresa.id,
          nome: minhaEmpresa.nome,
        },
        total: resultado.length,
        recomendacoes: resultado.map(
          ({ grupo, ...empresa }) => empresa
        ),
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    console.error("Erro na FY:", error);

    return NextResponse.json(
      {
        error:
          "Não foi possível carregar as recomendações.",
      },
      { status: 500 }
    );
  }
}
