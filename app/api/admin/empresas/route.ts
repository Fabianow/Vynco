
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdmin } from "@/lib/admin";

export async function GET(request: Request) {
  if (!(await getAdmin())) {
    return NextResponse.json(
      { error: "Acesso negado" },
      { status: 403 }
    );
  }

  const url = new URL(request.url);

  const page = Math.max(
    1,
    Number(url.searchParams.get("page")) || 1
  );

  const busca = (
    url.searchParams.get("busca") || ""
  ).slice(0, 100);

  const where = busca
    ? {
        OR: [
          { nome: { contains: busca } },
          { cnpj: { contains: busca } },
        ],
      }
    : {};

  const [empresas, total] = await prisma.$transaction([
    prisma.empresa.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * 20,
      take: 20,
    }),
    prisma.empresa.count({ where }),
  ]);

  return NextResponse.json({
    empresas,
    total,
    page,
  });
}

export async function POST(request: Request) {
  const admin = await getAdmin();

  if (!admin) {
    return NextResponse.json(
      { error: "Acesso negado" },
      { status: 403 }
    );
  }

  const body = await request.json().catch(() => null);

  if (
    !body ||
    typeof body.nome !== "string" ||
    !body.nome.trim()
  ) {
    return NextResponse.json(
      { error: "Nome obrigatório" },
      { status: 400 }
    );
  }

  const empresa = await prisma.$transaction(
    async (tx) => {
      const criada = await tx.empresa.create({
        data: {
          nome: body.nome.trim().slice(0, 150),
          cnpj: null,
          isDemo: true,
          responsavel: "Admin Vynco",
          email: "",
          telefone: "",
          categoria1:
            typeof body.categoria1 === "string"
              ? body.categoria1.slice(0, 100)
              : "Serviços",
          tipoOferta: "Ambos",
          cidade: "",
          estado: "",
          porte: "Não informado",
          descricao:
            typeof body.descricao === "string"
              ? body.descricao.slice(0, 3000)
              : "Empresa de demonstração",
        },
      });

      await tx.logAdministrativo.create({
        data: {
          adminId: admin.id,
          acao: "CRIAR_DEMO",
          empresaId: criada.id,
        },
      });

      return criada;
    }
  );

  return NextResponse.json(empresa, {
    status: 201,
  });
}
