import { Providers } from "./Providers";
import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header"; 


export const metadata: Metadata = {
  title: "Vynco - Ecossistema de Empresas",
  description: "Conecte sua empresa a grandes oportunidades",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="flex min-h-screen bg-[#F8F9FA] font-sans">
        
        {/* AQUI ESTÁ A MUDANÇA: Abrimos o Providers */}
        <Providers>
          
          {/* A Sidebar fica fixa aqui na esquerda */}
          <Sidebar />

          <div className="flex-1 flex flex-col overflow-hidden">
            {/* O Header fica fixo no topo da área direita */}
            <Header />

            {/* A página em si entra aqui e ganha scroll vertical */}
            <main className="flex-1 overflow-y-auto">
              {children}
            </main>
          </div>

        {/* E fechamos o Providers aqui */}
        </Providers>

      </body>
    </html>
  );
}