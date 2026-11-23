
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdmin } from "@/lib/admin";

type Context = {
  params: Promise<{ id: string }>;
};

export async function PATCH(
  request: Request,
  context: Context
) {
  const admin = await getAdmin();

  if (!admin || admin.role !== "SUPER_ADMIN") {
    return NextResponse.json(
      { error: "Acesso negado" },
      { status: 403 }
    );
  }

  const empresaId = Number(
    (await context.params).id
  );

  if (
    !Number.isSafeInteger(empresaId) ||
    empresaId <= 0
  ) {
    return NextResponse.json(
      { error: "ID inválido" },
      { status: 400 }
    );
  }

  const body = await request.json().catch(() => null);

  if (
    !body ||
    !["FREE", "PREMIUM"].includes(body.plano)
  ) {
    return NextResponse.json(
      { error: "Plano inválido" },
      { status: 400 }
    );
  }

  const existente = await prisma.empresa.findUnique({
    where: { id: empresaId },
    select: { id: true },
  });

  if (!existente) {
    return NextResponse.json(
      { error: "Empresa não encontrada" },
      { status: 404 }
    );
  }

  const empresa = await prisma.$transaction(
    async (tx) => {
      const atualizada = await tx.empresa.update({
        where: { id: empresaId },
        data: { plano: body.plano },
      });

      await tx.logAdministrativo.create({
        data: {
          adminId: admin.id,
          acao: `PLANO_${body.plano}`,
          empresaId,
        },
      });

      return atualizada;
    }
  );

  return NextResponse.json(empresa);
}
