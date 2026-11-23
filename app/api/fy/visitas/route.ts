
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

export async function POST(req: Request) {
  try {
    // Verifica se o usuário está logado
    const session = await getServerSession();

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Usuário não autenticado" },
        { status: 401 }
      );
    }

    // Recebe os IDs das empresas
    const body = await req.json();

    const empresaAtivaId = body?.empresaAtivaId;
    const empresaVisitadaId = body?.empresaVisitadaId;

    // Verifica se os IDs são válidos
    if (
      !Number.isSafeInteger(empresaAtivaId) ||
      !Number.isSafeInteger(empresaVisitadaId) ||
      empresaAtivaId <= 0 ||
      empresaVisitadaId <= 0 ||
      empresaAtivaId === empresaVisitadaId
    ) {
      return NextResponse.json(
        { error: "Empresas inválidas" },
        { status: 400 }
      );
    }

    // Confirma que a empresa ativa pertence ao usuário
    const empresaAtiva = await prisma.empresa.findFirst({
      where: {
        id: empresaAtivaId,
        status: "ATIVA",
        dono: {
          email: session.user.email,
        },
      },
      select: {
        id: true,
      },
    });

    if (!empresaAtiva) {
      return NextResponse.json(
        { error: "Empresa ativa não autorizada" },
        { status: 403 }
      );
    }

    // Verifica se a empresa visitada existe
    const empresaVisitada = await prisma.empresa.findFirst({
      where: {
        id: empresaVisitadaId,
        status: "ATIVA",
      },
      select: {
        id: true,
        dono: {
          select: {
            email: true,
          },
        },
      },
    });

    if (!empresaVisitada) {
      return NextResponse.json(
        { error: "Empresa visitada não encontrada" },
        { status: 404 }
      );
    }

    // Não registra visitas às próprias empresas
    if (empresaVisitada.dono?.email === session.user.email) {
      return NextResponse.json({
        sucesso: true,
        registrado: false,
        motivo: "Visita à própria empresa",
      });
    }

    // Registra uma visita por dia entre as mesmas empresas
    await prisma.$executeRaw`
      INSERT INTO fy_visita (
        empresaOrigemId,
        empresaDestinoId,
        dia
      )
      VALUES (
        ${empresaAtiva.id},
        ${empresaVisitada.id},
        CURRENT_DATE()
      )
      ON DUPLICATE KEY UPDATE id = id
    `;

    return NextResponse.json({
      sucesso: true,
      registrado: true,
      mensagem: "Visita processada com sucesso",
    });
  } catch (error) {
    console.error("Erro ao registrar visita na FY:", error);

    return NextResponse.json(
      { error: "Erro interno ao registrar visita" },
      { status: 500 }
    );
  }
}
