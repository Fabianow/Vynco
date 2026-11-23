
"use client";

import Link from "next/link";
import { registrarContato } from "@/app/hooks/useFY";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  MapPin,
  Phone,
  Mail,
  User,
  MessageSquare,
  Building2,
  Camera,
  Edit2,
  X,
  Loader2,
  ChevronDown,
} from "lucide-react";

const SEGMENTOS = [
  "Construção",
  "Tecnologia",
  "Saúde",
  "Logística",
  "Comércio",
  "Serviços",
  "Indústria",
  "Financeiro",
];

const inputClass =
  "w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 transition-all hover:border-gray-300 focus:border-[#1D54ED] focus:outline-none focus:ring-4 focus:ring-[#1D54ED]/10";

const labelClass =
  "mb-1.5 block text-sm font-medium text-gray-700";

function Field({
  label,
  children,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className={labelClass}>
        {label}
      </label>
      {children}
    </div>
  );
}

function SelectSegmento({
  value,
  onChange,
  placeholder,
  opcional = false,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  opcional?: boolean;
}) {
  const extra =
    value && !SEGMENTOS.includes(value)
      ? [value]
      : [];

  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) =>
          onChange(e.target.value)
        }
        className={`${inputClass} cursor-pointer appearance-none pr-10 ${
          value ? "" : "text-gray-400"
        }`}
      >
        {opcional ? (
          <option value="">
            Nenhum
          </option>
        ) : (
          <option value="" disabled>
            {placeholder ?? "Selecione"}
          </option>
        )}

        {[...extra, ...SEGMENTOS].map(
          (s) => (
            <option
              key={s}
              value={s}
              className="text-gray-900"
            >
              {s}
            </option>
          )
        )}
      </select>

      <ChevronDown
        size={16}
        className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400"
      />
    </div>
  );
}

function Modal({
  titulo,
  subtitulo,
  onClose,
  children,
  footer,
}: {
  titulo: string;
  subtitulo?: string;
  onClose: () => void;
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener(
      "keydown",
      onKey
    );

    return () =>
      window.removeEventListener(
        "keydown",
        onKey
      );
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 p-4 backdrop-blur-sm"
      onMouseDown={(e) =>
        e.target === e.currentTarget &&
        onClose()
      }
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={titulo}
        className="flex max-h-[88vh] w-full max-w-[560px] flex-col overflow-hidden rounded-2xl bg-white shadow-[0_24px_60px_-12px_rgba(16,24,40,0.35)]"
      >
        <div className="flex items-start justify-between gap-4 px-6 pb-4 pt-5">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {titulo}
            </h2>

            {subtitulo && (
              <p className="mt-0.5 text-sm text-gray-500">
                {subtitulo}
              </p>
            )}
          </div>

          <button
            onClick={onClose}
            aria-label="Fechar"
            className="rounded-full p-2 text-gray-400 hover:bg-gray-100"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 pb-6">
          {children}
        </div>

        <div className="flex justify-end gap-2.5 border-t border-gray-100 bg-gray-50/70 px-6 py-4">
          {footer}
        </div>
      </div>
    </div>
  );
}

export default function EmpresaPerfilClient({
  empresaInicial,
  isMinhaEmpresa,
}: {
  empresaInicial: any;
  isMinhaEmpresa: boolean;
}) {
  const [empresa, setEmpresa] =
    useState(empresaInicial);

  // Continua registrando as visitas.
  useEffect(() => {
    if (isMinhaEmpresa) return;

    const registrarVisita = () => {
      const valor = localStorage.getItem(
        "empresaAtivaId"
      );

      const empresaAtivaId = valor
        ? Number(valor)
        : NaN;

      const empresaVisitadaId = Number(
        empresaInicial.id
      );

      if (
        !Number.isSafeInteger(
          empresaAtivaId
        ) ||
        empresaAtivaId <= 0 ||
        !Number.isSafeInteger(
          empresaVisitadaId
        ) ||
        empresaVisitadaId <= 0 ||
        empresaAtivaId === empresaVisitadaId
      ) {
        return;
      }

      fetch("/api/fy/visitas", {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          empresaAtivaId,
          empresaVisitadaId,
        }),
      }).catch((erro) => {
        console.error(
          "Erro ao registrar visita:",
          erro
        );
      });
    };

    registrarVisita();

    window.addEventListener(
      "empresaAtivaAlterada",
      registrarVisita
    );

    return () =>
      window.removeEventListener(
        "empresaAtivaAlterada",
        registrarVisita
      );
  }, [
    empresaInicial.id,
    isMinhaEmpresa,
  ]);

  const [
    isDadosModalOpen,
    setIsDadosModalOpen,
  ] = useState(false);

  const [
    isImagensModalOpen,
    setIsImagensModalOpen,
  ] = useState(false);

  const [
    isSaving,
    setIsSaving,
  ] = useState(false);

  const [formData, setFormData] =
    useState({
      nome: empresa.nome || "",
      categoria1:
        empresa.categoria1 || "",
      categoria2:
        empresa.categoria2 || "",
      cidade: empresa.cidade || "",
      estado: empresa.estado || "",
      responsavel:
        empresa.responsavel || "",
      email: empresa.email || "",
      telefone: empresa.telefone || "",
      descricao:
        empresa.descricao || "",
    });

  const [
    imagensData,
    setImagensData,
  ] = useState({
    logoUrl: empresa.logoUrl || "",
    bannerUrl: empresa.bannerUrl || "",
  });

  const set =
    (campo: keyof typeof formData) =>
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement
      >
    ) =>
      setFormData({
        ...formData,
        [campo]: e.target.value,
      });

  const getInitials = (name: string) => {
    const words = name.trim().split(" ");

    if (words.length >= 2) {
      return (
        words[0][0] + words[1][0]
      ).toUpperCase();
    }

    return name
      .substring(0, 2)
      .toUpperCase();
  };

  const porteSimplificado =
    (empresa.porte || "Não informado")
      .split(" ")[0];

  const contatos = [
    {
      icon: User,
      label: "Responsável",
      valor: empresa.responsavel,
      href: null as string | null,
    },
    {
      icon: Mail,
      label: "E-mail",
      valor: empresa.email,
      href: `mailto:${empresa.email}`,
    },
    {
      icon: Phone,
      label: "Telefone",
      valor: empresa.telefone,
      href: `tel:${(
        empresa.telefone || ""
      ).replace(/\D/g, "")}`,
    },
  ];

  const guardarAlteracoes = async (
    dadosNovos: any,
    tipoModal: string
  ) => {
    setIsSaving(true);

    try {
      const res = await fetch(
        "/api/minha-empresa",
        {
          method: "PUT",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            id: empresa.id,
            ...dadosNovos,
          }),
        }
      );

      if (res.ok) {
        const atualizada =
          await res.json();

        setEmpresa(atualizada);

        if (tipoModal === "dados") {
          setIsDadosModalOpen(false);
        }

        if (tipoModal === "imagens") {
          setIsImagensModalOpen(false);
        }
      } else {
        alert(
          "Erro ao guardar as alterações."
        );
      }
    } catch (error) {
      alert("Erro de ligação.");
    } finally {
      setIsSaving(false);
    }
  };

  const btnSecundario =
    "rounded-xl px-5 py-2.5 text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-200/70";

  const btnPrimario =
    "inline-flex items-center justify-center gap-2 rounded-xl bg-[#1D54ED] px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#1745C7] disabled:opacity-70";

  return (
    <div className="min-h-screen bg-[#F6F7F9] px-4 py-8 sm:px-6 lg:py-12">
      <div className="mx-auto max-w-4xl">
        <Link
          href="/"
          className="mb-5 inline-flex items-center gap-2 rounded-full text-sm font-medium text-gray-500 hover:text-[#1D54ED]"
        >
          <ArrowLeft size={16} />
          Voltar
        </Link>

        <div className="relative overflow-hidden rounded-3xl border border-gray-200/80 bg-white shadow-sm">

          {/* BANNER */}
          <div
            className="group relative h-28 bg-cover bg-center sm:h-40"
            style={{
              backgroundColor: "#EAF0FF",
              backgroundImage:
                empresa.bannerUrl
                  ? `url(${empresa.bannerUrl})`
                  : "radial-gradient(circle at 15% 20%, rgba(29,84,237,0.22), transparent 55%), radial-gradient(circle at 85% 90%, rgba(99,142,255,0.28), transparent 50%), radial-gradient(rgba(29,84,237,0.12) 1px, transparent 1px)",
              backgroundSize:
                empresa.bannerUrl
                  ? "cover"
                  : "auto, auto, 18px 18px",
            }}
          >
            {isMinhaEmpresa && (
              <button
                onClick={() =>
                  setIsImagensModalOpen(true)
                }
                aria-label="Editar imagens"
                className="absolute right-4 top-4 rounded-full bg-white/80 p-2.5 text-gray-700 shadow-sm hover:bg-white"
              >
                <Camera size={18} />
              </button>
            )}
          </div>

          <div className="relative px-6 pb-8 sm:px-10 sm:pb-10">
            {/* LOGO */}
            <div className="relative -mt-12 inline-block sm:-mt-14">
              <div className="group relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-2xl bg-[#F0F5FF] text-2xl font-bold text-[#1D54ED] shadow-md ring-4 ring-white sm:h-28 sm:w-28">
                {empresa.logoUrl ? (
                  <img
                    src={empresa.logoUrl}
                    alt={empresa.nome}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  getInitials(empresa.nome)
                )}

                {isMinhaEmpresa && (
                  <button
                    onClick={() =>
                      setIsImagensModalOpen(true)
                    }
                    aria-label="Alterar logotipo"
                    className="absolute inset-0 flex items-center justify-center bg-black/40 text-white opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    <Camera size={24} />
                  </button>
                )}
              </div>
            </div>

            {/* INFORMAÇÕES PRINCIPAIS */}
            <div className="mt-5 flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0">
                <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
                  {empresa.nome}
                </h1>

                <div className="mt-2 flex flex-wrap items-center gap-2">
                  {empresa.categoria1 && (
                    <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                      {empresa.categoria1}
                    </span>
                  )}

                  {empresa.categoria2 && (
                    <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                      {empresa.categoria2}
                    </span>
                  )}
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F0F5FF] px-3 py-1 text-xs font-medium text-[#1D54ED]">
                    <MapPin size={12} />
                    {empresa.cidade}/
                    {empresa.estado}
                  </span>

                  <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                    <Building2 size={12} />
                    Porte {porteSimplificado}
                  </span>
                </div>
              </div>

              <div className="mt-2 flex w-full flex-col gap-3 sm:items-end lg:mt-0 lg:w-auto">
                {isMinhaEmpresa ? (
                  <>
                    <span className="inline-flex items-center justify-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-6 py-2.5 text-sm font-semibold text-[#1D54ED]">
                      <Building2 size={16} />
                      Esta é a tua empresa
                    </span>

                    <button
                      onClick={() =>
                        setIsDadosModalOpen(true)
                      }
                      aria-label="Editar informações"
                      className="flex h-10 w-10 items-center justify-center rounded-full border border-blue-100 bg-blue-50 text-[#1D54ED] hover:bg-[#1D54ED] hover:text-white"
                    >
                      <Edit2 size={18} />
                    </button>
                  </>
                ) : (
                  <Link
                    href={`/mensagens?novaConversa=${empresa.id}`}
                    onClick={() => {
                      void registrarContato(
                        empresa.id
                      );
                    }}
                    className="flex items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                  >
                    <MessageSquare size={16} />
                    Conversar
                  </Link>
                )}
              </div>
            </div>

            <section className="mt-10 border-t border-gray-100 pt-8">
              <h2 className="mb-3 text-base font-semibold text-gray-900">
                Sobre a empresa
              </h2>

              <p className="max-w-2xl whitespace-pre-wrap text-[15px] leading-relaxed text-gray-600">
                {empresa.descricao}
              </p>
            </section>

            <section className="mt-8 border-t border-gray-100 pt-8">
              <h2 className="mb-4 text-base font-semibold text-gray-900">
                Contato
              </h2>

              <ul className="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
                {contatos.map(
                  ({
                    icon: Icon,
                    label,
                    valor,
                    href,
                  }) => (
                    <li
                      key={label}
                      className="flex min-w-0 items-center gap-3"
                    >
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F0F5FF] text-[#1D54ED]">
                        <Icon size={18} />
                      </span>

                      <div className="min-w-0">
                        <p className="text-xs text-gray-400">
                          {label}
                        </p>

                        {href ? (
                          <a
                            href={href}
                            className="block truncate text-sm font-medium text-gray-800 hover:text-[#1D54ED]"
                          >
                            {valor}
                          </a>
                        ) : (
                          <p className="truncate text-sm font-medium text-gray-800">
                            {valor}
                          </p>
                        )}
                      </div>
                    </li>
                  )
                )}
              </ul>
            </section>
          </div>
        </div>
      </div>

      {/* MODAL: EDITAR DADOS */}
      {isDadosModalOpen && (
        <Modal
          titulo="Editar informações"
          subtitulo="Atualize os dados que aparecem no perfil da sua empresa."
          onClose={() =>
            setIsDadosModalOpen(false)
          }
          footer={
            <>
              <button
                onClick={() =>
                  setIsDadosModalOpen(false)
                }
                className={btnSecundario}
              >
                Cancelar
              </button>

              <button
                onClick={() =>
                  guardarAlteracoes(
                    formData,
                    "dados"
                  )
                }
                disabled={isSaving}
                className={btnPrimario}
              >
                {isSaving && (
                  <Loader2
                    size={16}
                    className="animate-spin"
                  />
                )}

                {isSaving
                  ? "A guardar..."
                  : "Guardar alterações"}
              </button>
            </>
          }
        >
          <div className="space-y-4">
            <Field label="Nome da empresa">
              <input
                type="text"
                value={formData.nome}
                onChange={set("nome")}
                className={inputClass}
              />
            </Field>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Segmento principal">
                <SelectSegmento
                  value={formData.categoria1}
                  onChange={(v) =>
                    setFormData({
                      ...formData,
                      categoria1: v,
                    })
                  }
                  placeholder="Selecione o segmento"
                />
              </Field>

              <Field label="Segmento secundário (opcional)">
                <SelectSegmento
                  opcional
                  value={formData.categoria2}
                  onChange={(v) =>
                    setFormData({
                      ...formData,
                      categoria2: v,
                    })
                  }
                />
              </Field>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Nome do responsável">
                <input
                  type="text"
                  value={formData.responsavel}
                  onChange={set("responsavel")}
                  className={inputClass}
                />
              </Field>

              <Field label="E-mail comercial">
                <input
                  type="email"
                  value={formData.email}
                  onChange={set("email")}
                  className={inputClass}
                />
              </Field>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-6">
              <Field
                label="Telefone"
                className="sm:col-span-3"
              >
                <input
                  type="text"
                  value={formData.telefone}
                  onChange={set("telefone")}
                  className={inputClass}
                />
              </Field>

              <Field
                label="Cidade"
                className="sm:col-span-2"
              >
                <input
                  type="text"
                  value={formData.cidade}
                  onChange={set("cidade")}
                  className={inputClass}
                />
              </Field>

              <Field
                label="UF"
                className="sm:col-span-1"
              >
                <input
                  type="text"
                  value={formData.estado}
                  onChange={set("estado")}
                  className={`${inputClass} uppercase`}
                  maxLength={2}
                />
              </Field>
            </div>

            <Field label="Sobre a empresa">
              <textarea
                rows={4}
                value={formData.descricao}
                onChange={set("descricao")}
                className={`${inputClass} resize-none`}
              />
            </Field>
          </div>
        </Modal>
      )}

      {/* MODAL: EDITAR IMAGENS */}
      {isImagensModalOpen && (
        <Modal
          titulo="Editar imagens"
          subtitulo="Cole o link direto de uma imagem."
          onClose={() =>
            setIsImagensModalOpen(false)
          }
          footer={
            <>
              <button
                onClick={() =>
                  setIsImagensModalOpen(false)
                }
                className={btnSecundario}
              >
                Cancelar
              </button>

              <button
                onClick={() =>
                  guardarAlteracoes(
                    imagensData,
                    "imagens"
                  )
                }
                disabled={isSaving}
                className={btnPrimario}
              >
                {isSaving && (
                  <Loader2
                    size={16}
                    className="animate-spin"
                  />
                )}

                Guardar
              </button>
            </>
          }
        >
          <div className="space-y-4">
            <Field label="Logotipo">
              <input
                type="text"
                placeholder="https://..."
                value={imagensData.logoUrl}
                onChange={(e) =>
                  setImagensData({
                    ...imagensData,
                    logoUrl: e.target.value,
                  })
                }
                className={inputClass}
              />
            </Field>

            <Field label="Capa (banner)">
              <input
                type="text"
                placeholder="https://..."
                value={imagensData.bannerUrl}
                onChange={(e) =>
                  setImagensData({
                    ...imagensData,
                    bannerUrl: e.target.value,
                  })
                }
                className={inputClass}
              />
            </Field>
          </div>
        </Modal>
      )}
    </div>
  );
}
