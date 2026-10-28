import { prisma } from "../lib/prisma";
import HomeClient from "./HomeClient";

// Esta página corre no servidor, puxa os dados e entrega ao HomeClient
export default async function Home() {
  
  // A magia acontece aqui: o Prisma vai ao MySQL procurar as empresas
  const empresas = await prisma.empresa.findMany();

  // Passamos os dados reais para a tua interface
  return <HomeClient empresas={empresas} />;
}