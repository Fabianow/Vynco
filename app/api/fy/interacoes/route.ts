
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { normalizar } from "@/lib/busca-inteligente";

export const dynamic = "force-dynamic";

async function origemAutorizada(
  email: string,
  id: number
) {
  if (!Number.isSafeInteger(id) || id <= 0) {
    return false;
  }

  const empresa = await prisma.empresa.findFirst({
    where: {
      id,
      status: "ATIVA",
      dono: { email },
    },
    select: { id: true },
  });

  return Boolean(empresa);
}

// Carrega os favoritos da empresa ativa.
export async function GET(req: Request) {
  try {
    const session = await getServerSession();

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Faça login." },
        { status: 401 }
      );
    }

    const id = Number(
      new URL(req.url).searchParams.get("empresaId")
    );

    if (
      !(await origemAutorizada(session.user.email, id))
    ) {
      return NextResponse.json(
        { error: "Empresa ativa inválida." },
        { status: 403 }
      );
    }

    const registros = await prisma.$queryRaw<
      Array<{ empresaDestinoId: number }>
    >`
      SELECT empresaDestinoId
      FROM fy_favorito
      WHERE empresaOrigemId = ${id}
    `;

    return NextResponse.json({
      favoritos: registros.map(
        (r) => r.empresaDestinoId
      ),
    });
  } catch (error) {
    console.error("Erro ao buscar favoritos:", error);

    return NextResponse.json(
      { error: "Erro ao buscar favoritos." },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession();

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Faça login." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const empresaAtivaId = Number(
      body?.empresaAtivaId
    );
    const tipo = body?.tipo;

    if (
      !(await origemAutorizada(
        session.user.email,
        empresaAtivaId
      ))
    ) {
      return NextResponse.json(
        { error: "Empresa ativa inválida." },
        { status: 403 }
      );
    }

    // REGISTRO DE BUSCA
    if (tipo === "BUSCA") {
      const termo = normalizar(
        typeof body.termo === "string"
          ? body.termo
          : ""
      ).slice(0, 90);

      if (termo.length < 2) {
        return NextResponse.json(
          { error: "Busca muito curta." },
          { status: 400 }
        );
      }

      const chave = `BUSCA:${termo}`;

      await prisma.$executeRaw`
        INSERT IGNORE INTO fy_atividade (
          empresaOrigemId,
          tipo,
          termo,
          chave,
          dia
        )
        VALUES (
          ${empresaAtivaId},
          'BUSCA',
          ${termo},
          ${chave},
          CURRENT_DATE()
        )
      `;

      return NextResponse.json({
        sucesso: true,
      });
    }

    if (
      tipo !== "FAVORITO" &&
      tipo !== "CONTATO"
    ) {
      return NextResponse.json(
        { error: "Interação inválida." },
        { status: 400 }
      );
    }

    const destinoId = Number(
      body?.empresaDestinoId
    );

    if (
      !Number.isSafeInteger(destinoId) ||
      destinoId <= 0 ||
      destinoId === empresaAtivaId
    ) {
      return NextResponse.json(
        { error: "Empresa de destino inválida." },
        { status: 400 }
      );
    }

    const destino = await prisma.empresa.findFirst({
      where: {
        id: destinoId,
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

    if (
      !destino ||
      destino.dono?.email === session.user.email
    ) {
      return NextResponse.json(
        {
          error:
            "Não é possível registrar interesse em uma empresa própria ou inativa.",
        },
        { status: 403 }
      );
    }

    // INTENÇÃO DE CONTATO
    if (tipo === "CONTATO") {
      const chave = `CONTATO:${destinoId}`;

      await prisma.$executeRaw`
        INSERT IGNORE INTO fy_atividade (
          empresaOrigemId,
          tipo,
          empresaDestinoId,
          chave,
          dia
        )
        VALUES (
          ${empresaAtivaId},
          'CONTATO',
          ${destinoId},
          ${chave},
          CURRENT_DATE()
        )
      `;

      return NextResponse.json({
        sucesso: true,
      });
    }

    // FAVORITOS
    const modo = body?.modo;

    if (modo === "remover") {
      await prisma.$executeRaw`
        DELETE FROM fy_favorito
        WHERE empresaOrigemId = ${empresaAtivaId}
          AND empresaDestinoId = ${destinoId}
      `;

      return NextResponse.json({
        sucesso: true,
        favorito: false,
      });
    }

    if (modo !== "adicionar") {
      return NextResponse.json(
        {
          error: "Informe adicionar ou remover.",
        },
        { status: 400 }
      );
    }

    await prisma.$executeRaw`
      INSERT IGNORE INTO fy_favorito (
        empresaOrigemId,
        empresaDestinoId
      )
      VALUES (
        ${empresaAtivaId},
        ${destinoId}
      )
    `;

    return NextResponse.json({
      sucesso: true,
      favorito: true,
    });
  } catch (error) {
    console.error(
      "Erro nas interações da FY:",
      error
    );

    return NextResponse.json(
      {
        error: "Falha ao registrar interação.",
      },
      { status: 500 }
    );
  }
}
