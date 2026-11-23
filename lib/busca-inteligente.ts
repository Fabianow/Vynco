
export type EmpresaPesquisavel = {
  nome: string;
  categoria1: string;
  categoria2?: string | null;
  descricao?: string | null;
  tipoOferta?: string | null;
  cidade?: string | null;
  estado?: string | null;
};

export function normalizar(
  texto: string | null | undefined
): string {
  return (texto ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const ignorar = new Set([
  "de", "do", "da", "dos", "das", "para",
  "em", "uma", "um", "e", "por", "empresa", "empresas",
]);

export function palavras(
  texto: string,
  limite = 14
): string[] {
  return normalizar(texto)
    .split(" ")
    .filter((p) => p.length > 1 && !ignorar.has(p))
    .slice(0, limite);
}

// Distância de Levenshtein.
// Calcula quantas alterações separam duas palavras.
function distancia(a: string, b: string): number {
  if (Math.abs(a.length - b.length) > 2) return 3;

  const linha = Array.from(
    { length: b.length + 1 },
    (_, i) => i
  );

  for (let i = 1; i <= a.length; i++) {
    let diagonal = linha[0];
    linha[0] = i;

    for (let j = 1; j <= b.length; j++) {
      const acima = linha[j];

      linha[j] = Math.min(
        linha[j] + 1,
        linha[j - 1] + 1,
        diagonal + (a[i - 1] === b[j - 1] ? 0 : 1)
      );

      diagonal = acima;
    }
  }

  return linha[b.length];
}

const sinonimos: Record<string, string[]> = {
  ti: ["tecnologia", "informatica", "software"],
  tech: ["tecnologia", "informatica"],
  programacao: ["software", "desenvolvimento"],
  programador: ["software", "desenvolvimento"],
  transportadora: ["transporte", "logistica"],
  entregas: ["logistica", "transporte"],
  construtora: ["construcao", "obras"],
  cnc: ["usinagem", "ferramentaria"],
  pecas: ["componentes", "autopecas", "usinagem"],
  dados: ["analise", "analytics", "dados"],
  contabilidade: ["contabil", "fiscal"],
};

function pontosPalavra(
  consulta: string,
  alvo: string
): number {
  if (consulta === alvo) return 10;

  if (
    consulta.length >= 3 &&
    alvo.startsWith(consulta)
  ) {
    return 8;
  }

  if (
    consulta.length >= 4 &&
    consulta.startsWith(alvo) &&
    alvo.length >= 4
  ) {
    return 6;
  }

  const limite =
    consulta.length >= 7
      ? 2
      : consulta.length >= 4
        ? 1
        : 0;

  if (
    limite &&
    distancia(consulta, alvo) <= limite
  ) {
    return 5;
  }

  return 0;
}

export function pontuarBusca(
  empresa: EmpresaPesquisavel,
  consulta: string
): number {
  const termos = palavras(consulta).slice(0, 7);

  if (!termos.length) return 0;

  const campos = [
    {
      peso: 5,
      tokens: palavras(empresa.nome),
    },
    {
      peso: 4,
      tokens: palavras(
        `${empresa.categoria1} ${empresa.categoria2 ?? ""}`
      ),
    },
    {
      peso: 2,
      tokens: palavras(empresa.descricao ?? "", 55),
    },
    {
      peso: 2,
      tokens: palavras(empresa.tipoOferta ?? ""),
    },
    {
      peso: 1,
      tokens: palavras(
        `${empresa.cidade ?? ""} ${empresa.estado ?? ""}`
      ),
    },
  ];

  let total = 0;
  let encontrados = 0;

  for (const termo of termos) {
    const alternativas = [
      termo,
      ...(sinonimos[termo] ?? []),
    ];

    let melhor = 0;

    for (const campo of campos) {
      for (const alvo of campo.tokens) {
        for (const palavra of alternativas) {
          melhor = Math.max(
            melhor,
            pontosPalavra(palavra, alvo) * campo.peso
          );
        }
      }
    }

    if (melhor > 0) encontrados++;
    total += melhor;
  }

  if (!encontrados) return 0;

  return Math.round(
    total * (encontrados / termos.length)
  );
}
