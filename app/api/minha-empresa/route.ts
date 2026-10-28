import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

export async function GET() {
  const session = await getServerSession();
  if (!session?.user?.email) return NextResponse.json([], { status: 401 });

  try {
    // Procura TODAS as empresas do utilizador, das mais recentes para as antigas
    const empresas = await prisma.empresa.findMany({
      where: { dono: { email: session.user.email } },
      orderBy: { createdAt: "desc" }
    });
    
    return NextResponse.json(empresas);
  } catch (error) {
    return NextResponse.json({ error: "Erro ao buscar empresas" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const session = await getServerSession();
  if (!session?.user?.email) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  try {
    const body = await req.json();
    const { id, nome, telefone, site, descricao, responsavel, email, cidade, estado, categoria1, categoria2, logoUrl, bannerUrl } = body;

    const empresaExiste = await prisma.empresa.findFirst({
      where: { id, dono: { email: session.user.email } }
    });

    if (!empresaExiste) return NextResponse.json({ error: "Permissão negada" }, { status: 403 });

    const atualizada = await prisma.empresa.update({
      where: { id },
      data: { 
        nome, telefone, site, descricao, responsavel, email, 
        cidade, estado, categoria1, categoria2, logoUrl, bannerUrl 
      }
    });

    return NextResponse.json(atualizada, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Erro ao atualizar" }, { status: 500 });
  }
}