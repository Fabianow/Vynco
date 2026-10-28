import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const empresaIdStr = searchParams.get("empresaId");

    if (!empresaIdStr) {
      return NextResponse.json({ error: "Empresa ID não fornecido." }, { status: 400 });
    }

    const empresaId = parseInt(empresaIdStr);

    // Busca todas as mensagens onde a nossa empresa é remetente ou destinatária
    const mensagens = await prisma.mensagem.findMany({
      where: {
        OR: [
          { remetenteId: empresaId },
          { destinatarioId: empresaId },
        ],
      },
      include: {
        empresaRemetente: true,
        empresaDestinatario: true,
      },
      orderBy: { createdAt: "desc" },
    });

    // Extrai os IDs únicos das outras empresas com quem conversámos
    const mapaEmpresas = new Map<number, any>();

    mensagens.forEach((msg) => {
      const outraEmpresa = msg.remetenteId === empresaId ? msg.empresaDestinatario : msg.empresaRemetente;
      if (outraEmpresa && !mapaEmpresas.has(outraEmpresa.id)) {
        mapaEmpresas.set(outraEmpresa.id, {
          ...outraEmpresa,
          ultimaMensagem: msg.texto,
          ultimaMensagemData: msg.createdAt,
        });
      }
    });

    return NextResponse.json(Array.from(mapaEmpresas.values()), { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erro ao buscar conversas." }, { status: 500 });
  }
}