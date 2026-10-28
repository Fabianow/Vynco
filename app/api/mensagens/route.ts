import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { texto, destinatarioId, userEmail } = body;

    if (!texto || !destinatarioId || !userEmail) {
      return NextResponse.json({ error: "Faltam dados." }, { status: 400 });
    }

    // 1. Procura a empresa do utilizador logado
    const minhaEmpresa = await prisma.empresa.findFirst({
      where: { dono: { email: userEmail } }
    });

    if (!minhaEmpresa) {
      return NextResponse.json({ error: "Utilizador não tem empresa." }, { status: 403 });
    }

    // 2. Grava a mensagem ligando as duas empresas
    const novaMensagem = await prisma.mensagem.create({
      data: {
        texto,
        remetenteId: minhaEmpresa.id,
        destinatarioId: parseInt(destinatarioId),
      },
    });

    return NextResponse.json(novaMensagem, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erro ao salvar a mensagem." }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const destinatarioId = searchParams.get("destinatarioId");
    const userEmail = searchParams.get("userEmail");

    if (!destinatarioId || !userEmail) {
      return NextResponse.json({ error: "Faltam parâmetros." }, { status: 400 });
    }

    // Procura as empresas
    const minhaEmpresa = await prisma.empresa.findFirst({
      where: { dono: { email: userEmail } }
    });

    const empresaDestinatario = await prisma.empresa.findUnique({
      where: { id: parseInt(destinatarioId) },
    });

    if (!minhaEmpresa) {
      return NextResponse.json({ semEmpresa: true, empresaDestinatario }, { status: 200 });
    }

    // Busca o histórico do chat entre AS DUAS empresas (Ida e Volta)
    const mensagens = await prisma.mensagem.findMany({
      where: {
        OR: [
          { remetenteId: minhaEmpresa.id, destinatarioId: parseInt(destinatarioId) },
          { remetenteId: parseInt(destinatarioId), destinatarioId: minhaEmpresa.id }
        ]
      },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({ 
      mensagens, 
      empresaDestinatario, 
      minhaEmpresa 
    }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Erro ao buscar." }, { status: 500 });
  }
}