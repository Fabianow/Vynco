import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";

export async function POST(request: Request) {
  try {
    const session = await getServerSession();
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return NextResponse.json({ error: "Utilizador não encontrado." }, { status: 404 });

    const body = await request.json();
    
    // Extraímos os NOVOS campos exatos do formulário
    const { 
      nome, cnpj, responsavel, email, telefone, 
      categoria1, categoria2, tipoOferta, 
      cidade, estado, porte, site, logoUrl, descricao 
    } = body;

    // Criamos a empresa com a estrutura atualizada
    const novaEmpresa = await prisma.empresa.create({
      data: {
        nome, 
        cnpj, 
        responsavel, 
        email, 
        telefone,
        categoria1, 
        categoria2, 
        tipoOferta,
        cidade, 
        estado, 
        porte, 
        site, 
        logoUrl, 
        descricao,
        donoId: user.id
      }
    });

    return NextResponse.json(novaEmpresa, { status: 201 });

  } catch (error) {
    // Este console.error é o nosso melhor amigo! Ele mostra o erro real no terminal.
    console.error("ERRO REAL DO PRISMA:", error);
    return NextResponse.json({ error: "Erro ao criar empresa. Verifique se o CNPJ já está cadastrado." }, { status: 500 });
  }
}