
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { pontuarBusca } from "@/lib/busca-inteligente";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const q = (
      new URL(req.url).searchParams.get("q") ?? ""
    )
      .trim()
      .slice(0, 100);

    if (q.length < 2) {
      return NextResponse.json({
        termo: q,
        total: 0,
        empresas: [],
      });
    }

    const empresas = await prisma.empresa.findMany({
      where: {
        status: "ATIVA",
      },
      select: {
        id: true,
        nome: true,
        categoria1: true,
        categoria2: true,
        tipoOferta: true,
        descricao: true,
        cidade: true,
        estado: true,
        logoUrl: true,
        bannerUrl: true,
        avaliacao: true,
        plano: true,
        isDemo: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 1500,
    });

    const encontradas = empresas
      .map((empresa) => ({
        ...empresa,
        relevancia:
          pontuarBusca(empresa, q) +
          (empresa.plano === "PREMIUM" ? 2 : 0),
      }))
      .filter((empresa) => empresa.relevancia > 2)
      .sort(
        (a, b) =>
          b.relevancia - a.relevancia ||
          a.nome.localeCompare(b.nome, "pt-BR")
      );

    return NextResponse.json(
      {
        termo: q,
        total: encontradas.length,
        empresas: encontradas.slice(0, 100),
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    console.error("Erro na busca:", error);

    return NextResponse.json(
      { error: "Não foi possível pesquisar." },
      { status: 500 }
    );
  }
}
