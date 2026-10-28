"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, UploadCloud, Loader2, X, Building2 } from "lucide-react";

const categorias = ["Construção", "Tecnologia", "Saúde", "Logística", "Comércio", "Serviços", "Indústria", "Financeiro"];
const estados = ["AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO"];
const portes = ["Micro (Até 9 funcionários)", "Pequena (10 a 49)", "Média (50 a 249)", "Grande (250+)"];

const maskCNPJ = (value: string) => value.replace(/\D/g, '').replace(/^(\d{2})(\d)/, '$1.$2').replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3').replace(/\.(\d{3})(\d)/, '.$1/$2').replace(/(\d{4})(\d)/, '$1-$2').slice(0, 18);
const maskPhone = (value: string) => value.replace(/\D/g, '').replace(/^(\d{2})(\d)/g, '($1) $2').replace(/(\d)(\d{4})$/, '$1-$2').slice(0, 15);

export default function NovaEmpresa() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Novo estado para controlar o loading da imagem
  const [isUploading, setIsUploading] = useState(false);

  const [formData, setFormData] = useState({
    nome: "", cnpj: "", responsavel: "", email: "", telefone: "",
    categoria1: "", categoria2: "", tipoOferta: "",
    cidade: "", estado: "", porte: "", site: "", logoUrl: "", descricao: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Nova Função: Upload de Imagem para o Cloudinary
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const data = new FormData();
    data.append("file", file);
    
    // O teu Preset exato
    data.append("upload_preset", "Vynco1"); 

    try {
      // ATENÇÃO: Troca o 'TEU_CLOUD_NAME' abaixo pelo teu nome no Cloudinary!
      const res = await fetch("https://api.cloudinary.com/v1_1/p8yvn1kb/image/upload", {
        method: "POST",
        body: data,
      });
      
      const uploadedImage = await res.json();
      
      if (uploadedImage.secure_url) {
        setFormData({ ...formData, logoUrl: uploadedImage.secure_url });
      } else {
        alert("Erro no upload da imagem.");
      }
    } catch (error) {
      console.error("Erro:", error);
      alert("Falha ao enviar a imagem.");
    } finally {
      setIsUploading(false);
    }
  };

  if (status === "unauthenticated") { router.push("/"); return null; }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); 
    if (formData.cnpj.length < 18) return alert("Preencha o CNPJ completo.");
    if (!formData.tipoOferta) return alert("Selecione se você oferece Produto, Serviço ou Ambos.");

    try {
      const response = await fetch("/api/empresas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert("Empresa cadastrada com sucesso!");
        router.push("/");
      } else {
        const data = await response.json();
        alert(`Erro: ${data.error}`);
      }
    } catch (error) {
      alert("Ocorreu um erro ao salvar.");
    }
  };

  if (status === "loading") return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;

  return (
    <div className="min-h-screen bg-[#F8F9FA] p-6 lg:p-12">
      <div className="max-w-4xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 font-medium mb-8">
          <ArrowLeft size={20} /> Voltar
        </Link>

        <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100">
          <h1 className="text-2xl font-bold text-gray-900 mb-8">Cadastrar empresa</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* --- SECÇÃO DE UPLOAD DA LOGO --- */}
            <div className="mb-8 p-6 bg-gray-50 rounded-2xl border border-gray-100">
              <label className="text-sm font-bold text-gray-900 block mb-4">Logótipo da Empresa (Opcional)</label>
              
              <div className="flex items-center gap-6">
                {/* Miniatura */}
                <div className="w-24 h-24 rounded-2xl bg-white border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden shrink-0 relative">
                  {isUploading ? (
                    <Loader2 size={24} className="text-[#1D54ED] animate-spin" />
                  ) : formData.logoUrl ? (
                    <>
                      <img src={formData.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                      <button 
                        type="button"
                        onClick={() => setFormData({...formData, logoUrl: ""})}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 shadow-sm hover:bg-red-600 transition-colors"
                      >
                        <X size={12} />
                      </button>
                    </>
                  ) : (
                    <Building2 size={32} className="text-gray-300" />
                  )}
                </div>

                {/* Botão para escolher o ficheiro */}
                <div className="flex-1">
                  <label className="cursor-pointer inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 text-sm font-semibold text-gray-700 transition-colors shadow-sm">
                    <UploadCloud size={18} />
                    {isUploading ? "A carregar..." : "Fazer upload da imagem"}
                    <input 
                      type="file" 
                      accept="image/png, image/jpeg, image/jpg" 
                      className="hidden" 
                      onChange={handleImageUpload}
                      disabled={isUploading}
                    />
                  </label>
                  <p className="text-xs text-gray-500 mt-2">Recomendado: PNG ou JPG. Tamanho máximo: 2MB.</p>
                </div>
              </div>
            </div>
            {/* --------------------------------- */}

            {/* Grid 2 colunas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Nome da empresa</label>
                <input required type="text" name="nome" value={formData.nome} onChange={handleChange} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">CNPJ</label>
                <input required type="text" name="cnpj" value={formData.cnpj} onChange={(e) => setFormData({...formData, cnpj: maskCNPJ(e.target.value)})} placeholder="00.000.000/0001-00" className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Segmento Principal</label>
                <select required name="categoria1" value={formData.categoria1} onChange={handleChange} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-white focus:border-blue-600 outline-none">
                  <option value="" disabled>Selecione</option>
                  {categorias.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Segmento Secundário (Opcional)</label>
                <select name="categoria2" value={formData.categoria2} onChange={handleChange} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-white focus:border-blue-600 outline-none">
                  <option value="">Nenhum</option>
                  {categorias.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Cidade</label>
                <input required type="text" name="cidade" value={formData.cidade} onChange={handleChange} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-blue-600 outline-none" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Estado</label>
                <select required name="estado" value={formData.estado} onChange={handleChange} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-white focus:border-blue-600 outline-none">
                  <option value="" disabled>UF</option>
                  {estados.map(uf => <option key={uf} value={uf}>{uf}</option>)}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Porte</label>
                <select required name="porte" value={formData.porte} onChange={handleChange} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-white focus:border-blue-600 outline-none">
                  <option value="" disabled>Selecione o porte</option>
                  {portes.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Site (Opcional)</label>
                <input type="url" name="site" value={formData.site} onChange={handleChange} placeholder="https://" className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-blue-600 outline-none" />
              </div>

              {/* Tipo de Oferta */}
              <div className="col-span-1 md:col-span-2 space-y-3 bg-gray-50 p-4 rounded-xl border border-gray-200">
                <label className="text-sm font-semibold text-gray-900 block">O que a sua empresa oferece?</label>
                <div className="flex gap-6">
                  {['Produto', 'Serviço', 'Ambos'].map((tipo) => (
                    <label key={tipo} className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="tipoOferta" value={tipo} onChange={handleChange} checked={formData.tipoOferta === tipo} className="w-4 h-4 text-blue-600" />
                      <span className="text-sm text-gray-700">{tipo}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="col-span-1 md:col-span-2 space-y-2">
                <label className="text-sm font-semibold text-gray-700">Descrição / história da empresa</label>
                <textarea required name="descricao" rows={3} value={formData.descricao} onChange={handleChange} placeholder="O que sua empresa faz, produtos, serviços e diferenciais." className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-blue-600 outline-none resize-none" />
              </div>

            </div>

            {/* Grid 3 colunas para contatos */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-gray-100">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Responsável comercial</label>
                <input required type="text" name="responsavel" value={formData.responsavel} onChange={handleChange} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-blue-600 outline-none" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">E-mail comercial</label>
                <input required type="email" name="email" value={formData.email} onChange={handleChange} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-blue-600 outline-none" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Telefone</label>
                <input required type="tel" name="telefone" value={formData.telefone} onChange={(e) => setFormData({...formData, telefone: maskPhone(e.target.value)})} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-blue-600 outline-none" />
              </div>
            </div>
                  
            <div className="pt-6 border-t border-gray-100">
              <button 
                disabled={isUploading} 
                type="submit" 
                className="bg-[#1D54ED] hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold transition-all w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUploading ? "A carregar imagem..." : "Cadastrar empresa"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}