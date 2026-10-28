import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import EmpresaPerfilClient from "./EmpresaPerfilClient";

export const dynamic = "force-dynamic";

export default async function EmpresaPerfil({ params }: { params: Promise<{ id: string }> }) {
  const parametros = await params;
  const session = await getServerSession();

  // O Servidor faz o trabalho pesado de ir ao Banco de Dados
  const empresa = await prisma.empresa.findUnique({
    where: { id: parseInt(parametros.id) },
    include: { dono: true }
  });

  if (!empresa) {
    notFound();
  }

  const isMinhaEmpresa = session?.user?.email && empresa.dono?.email === session.user.email;

  // Envia os dados prontos para o componente visual interativo!
  return <EmpresaPerfilClient empresaInicial={empresa} isMinhaEmpresa={isMinhaEmpresa} />;
}