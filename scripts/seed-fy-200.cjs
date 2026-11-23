
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const fs = require("node:fs");
const path = require("node:path");

const cores = [
  ["#1745A6", "#6396FF"],
  ["#087F78", "#7FD6C9"],
  ["#6A43A8", "#C7AAFF"],
  ["#965B1E", "#F4C277"],
  ["#354B66", "#A9BECE"],
  ["#A72F58", "#F4A1BD"],
];

function slug(texto) {
  return texto.normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function escapar(texto) {
  return texto.replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function gerarImagens(nome, categoria, indice) {
  const pasta = path.join(process.cwd(), "public", "demo-empresas");
  fs.mkdirSync(pasta, { recursive: true });

  const arquivo = slug(nome);
  const [cor1, cor2] = cores[indice % cores.length];
  const iniciais = nome.split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  const logo = `
    <svg xmlns="http://www.w3.org/2000/svg" width="240" height="240" viewBox="0 0 240 240">
      <rect width="240" height="240" rx="40" fill="${cor1}"/>
      <circle cx="204" cy="29" r="98" fill="${cor2}" opacity=".27"/>
      <path d="M-20 210 L210 -20" stroke="white" stroke-width="13" opacity=".08"/>
      <text x="120" y="146" fill="white" text-anchor="middle"
        font-family="Arial,sans-serif" font-size="87" font-weight="700">${escapar(iniciais)}</text>
    </svg>`;

  const banner = `
    <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="390" viewBox="0 0 1200 390">
      <defs>
        <linearGradient id="g">
          <stop stop-color="${cor1}"/>
          <stop offset="1" stop-color="${cor2}"/>
        </linearGradient>
      </defs>
      <rect width="1200" height="390" fill="url(#g)"/>
      <circle cx="1110" cy="-55" r="335" fill="white" opacity=".08"/>
      <circle cx="1000" cy="440" r="260" fill="white" opacity=".1"/>
      <path d="M760 0 L1140 390 M850 0 L1230 390"
        stroke="white" stroke-width="16" opacity=".1"/>
      <text x="72" y="165" fill="white" font-family="Arial,sans-serif"
        font-size="50" font-weight="700">${escapar(nome)}</text>
      <text x="75" y="226" fill="white" opacity=".82"
        font-family="Arial,sans-serif" font-size="26">${escapar(categoria)}</text>
      <rect x="74" y="266" width="114" height="7" rx="4"
        fill="white" opacity=".75"/>
    </svg>`;

  fs.writeFileSync(
    path.join(pasta, `${arquivo}-logo.svg`),
    logo,
    "utf8"
  );

  fs.writeFileSync(
    path.join(pasta, `${arquivo}-banner.svg`),
    banner,
    "utf8"
  );

  return {
    logoUrl: `/demo-empresas/${arquivo}-logo.svg`,
    bannerUrl: `/demo-empresas/${arquivo}-banner.svg`,
  };
}

// 25 setores, cada um com 8 empresas fictícias = 200.
const setores = [
  ["Construção Civil", "Engenharia Civil", "Serviços", "Construtora", "Obras comerciais, reformas e construção de instalações industriais.", "Alvora;Pilarix;Concrevia;Ediforte;Arqmont;Terrafix;Planovia;Nordestea"],
  ["Arquitetura", "Design de Interiores", "Serviços", "Arquitetura", "Projetos arquitetônicos e interiores corporativos com foco em funcionalidade.", "Lumera;Traçora;Espazia;Nuvora;Vérticea;Estilix;Ambienta;Modura"],
  ["Materiais de Construção", "Comércio", "Produtos", "Materiais", "Distribuição de materiais, ferramentas e suprimentos para obras.", "Cimentra;Obrax;Basefort;Pedriva;Estrumax;Solfix;Concretis;Fortelar"],
  ["Engenharia Mecânica", "Projetos Industriais", "Serviços", "Engenharia", "Projetos mecânicos, desenhos técnicos e soluções para instalações industriais.", "Mecanora;Projemax;Engenixa;Torcana;Tecmov;Dinamel;Ferroviax;Mecatronix"],
  ["Usinagem", "Ferramentaria", "Serviços", "CNC", "Usinagem CNC, torneamento, fresamento e peças sob medida.", "Precisora;Torvex;Cortela;Fresnova;Metalix;Usinart;Tecfresa;Microtor"],
  ["Metalurgia", "Estruturas Metálicas", "Produtos", "Metais", "Fabricação e fornecimento de componentes e estruturas metálicas.", "Açovix;Metalvora;Ferromix;Laminox;Soldexa;Metalflex;Inoxora;Fundarix"],
  ["Automação Industrial", "Robótica", "Serviços", "Automação", "Sistemas de automação, integração de máquinas e sensores industriais.", "Autonexa;Robovix;Sensora;Controlix;Movexia;Sincrovia;Integrauto;Ciberflux"],
  ["Manutenção Industrial", "Engenharia Mecânica", "Serviços", "Manutenção", "Manutenção preventiva, corretiva e recuperação de equipamentos.", "Mantex;Reparnova;Servomax;Manutrix;Tecajust;Indurepar;Giratec;Prontomaq"],
  ["Desenvolvimento de Software", "Tecnologia", "Serviços", "Software", "Desenvolvimento de sistemas web, aplicativos e integrações empresariais.", "Codexa;Softnora;Devvix;Nuvocode;Bitvora;Stackelis;Algorix;Codevento"],
  ["Tecnologia", "Computação em Nuvem", "Serviços", "Tech", "Infraestrutura de TI, computação em nuvem e suporte para negócios.", "Nexbit;Cloudora;Tecvix;Nuvix;Databrisa;Bytefolio;Netalix;Infovora"],
  ["Análise de Dados", "Inteligência Artificial", "Serviços", "Analytics", "Dashboards, análises preditivas e automação baseada em dados.", "Analytora;Dataviva;Visuplex;Nexdata;Indicora;Metrivix;Quantela;Predinova"],
  ["Segurança da Informação", "Tecnologia", "Serviços", "Cyber", "Proteção de sistemas, monitoramento e consultoria em segurança digital.", "Ciberela;Safebit;Guardix;Protecnia;Escudora;Defenbyte;Criptora;Shieldex"],
  ["Logística", "Armazenagem", "Serviços", "Logística", "Gestão logística, armazenamento e distribuição de mercadorias.", "Rotanova;Estocora;Cargovia;Armazex;Fluxlog;Distribix;Moventis;Rastrela"],
  ["Transporte", "Logística", "Serviços", "Transportes", "Transporte corporativo de cargas e entregas regionais.", "Viarota;Rodovix;Expressoza;Transnova;Cargaelo;Rodalix;Trajetora;Velocargo"],
  ["Agronegócio", "Máquinas Agrícolas", "Produtos", "Agro", "Soluções, equipamentos e suprimentos para operações agrícolas.", "Agrovora;Campix;Terraflora;Plantela;Safrora;Ruravix;Colhemax;Semearix"],
  ["Saúde", "Equipamentos Hospitalares", "Produtos", "Saúde", "Suprimentos e equipamentos para clínicas e unidades de saúde.", "Medinova;Clinora;Bioflexa;Saluvix;Medivora;Saudelis;Vitalora;Hospitalix"],
  ["Educação Corporativa", "Treinamento", "Serviços", "Educação", "Cursos e treinamentos profissionais para equipes corporativas.", "Aprendix;Educora;Capacitex;Saberiva;Formanex;Evoluora;Aulavix;Mentorae"],
  ["Consultoria Financeira", "Financeiro", "Serviços", "Finanças", "Planejamento, indicadores e consultoria financeira para empresas.", "Finora;Capitalix;Cifravia;Fluxfin;Rentavix;Lucentis;Planefin;Numerora"],
  ["Contabilidade", "Gestão Tributária", "Serviços", "Contábil", "Contabilidade, folha de pagamento e obrigações fiscais empresariais.", "Contavix;Fiscalora;Balanflex;Contamaisx;Tribunova;Escritora;Contelix;Numerafis"],
  ["Serviços Jurídicos", "Consultoria Empresarial", "Serviços", "Jurídico", "Consultoria contratual e suporte jurídico para empresas.", "Jurisora;Lexvix;Contralix;Leganex;Acordora;Normavix;Diretivae;Pactora"],
  ["Marketing", "Publicidade", "Serviços", "Marketing", "Campanhas, comunicação de marcas e estratégia de marketing B2B.", "Marquix;Brandora;Publicera;Midiora;Criativix;Anunciola;Campanex;Visibra"],
  ["Comércio", "E-commerce", "Produtos", "Comércio", "Venda corporativa, atacado e fornecimento de produtos diversos.", "Comercix;Atacora;Varevix;Lojanova;Suprivora;Distribel;Vendorae;Estoqix"],
  ["Energia Solar", "Engenharia Elétrica", "Serviços", "Energia", "Projetos elétricos, instalação de painéis solares e eficiência energética.", "Solavix;Energora;Voltaris;Lumenex;Fotovolta;Eletrovia;Potencix;Raionsol"],
  ["Alimentação Industrial", "Restaurantes Corporativos", "Serviços", "Alimentos", "Refeições coletivas e abastecimento de cozinhas empresariais.", "Saborix;Nutrelia;Refeivix;Cozinhora;Pratovia;Alimentex;Gastrovia;BomSaborix"],
  ["Recursos Humanos", "Recrutamento", "Serviços", "Pessoas", "Recrutamento, seleção e desenvolvimento de equipes.", "Talentix;Gentevora;Recrunex;Equiplan;Pessoalis;Carreirix;Humanora;Selecionaix"],
];

const locais = [
  ["Diadema", "SP"],
  ["São Bernardo do Campo", "SP"],
  ["Santo André", "SP"],
  ["São Paulo", "SP"],
  ["Campinas", "SP"],
  ["Santos", "SP"],
  ["Sorocaba", "SP"],
  ["Curitiba", "PR"],
  ["Belo Horizonte", "MG"],
  ["Rio de Janeiro", "RJ"],
  ["Joinville", "SC"],
  ["Porto Alegre", "RS"],
  ["Ribeirão Preto", "SP"],
  ["Recife", "PE"],
  ["Goiânia", "GO"],
];

async function main() {
  if (!process.argv.includes("--confirmar-demo")) {
    throw new Error(
      "Use --confirmar-demo para criar os dados de teste."
    );
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "Proibido executar no ambiente de produção."
    );
  }

  let criadas = 0;
  let puladas = 0;

  for (let s = 0; s < setores.length; s++) {
    const [
      categoria1,
      categoria2,
      tipoOferta,
      sufixo,
      descricao,
      nomes,
    ] = setores[s];

    const marcas = nomes.split(";");

    if (marcas.length !== 8) {
      throw new Error(
        `Setor ${categoria1} não tem exatamente 8 marcas.`
      );
    }

    for (let i = 0; i < marcas.length; i++) {
      const nome = `${marcas[i]} ${sufixo}`;
      const imagens = gerarImagens(nome, categoria1, s);

      const existente = await prisma.empresa.findFirst({
        where: { nome },
        select: { id: true },
      });

      if (existente) {
        puladas++;
        continue;
      }

      const [cidade, estado] =
        locais[(s * 3 + i) % locais.length];

      await prisma.empresa.create({
        data: {
          nome,
          cnpj: null,
          isDemo: true,
          status: "ATIVA",
          plano: "FREE",
          responsavel: "Equipe de Demonstração",
          email: `demo-fy-${s + 1}-${i + 1}@example.com`,
          telefone: "(00) 0000-0000",
          categoria1,
          categoria2,
          tipoOferta,
          cidade,
          estado,
          porte: i % 3 === 0 ? "Média" : "Pequena",
          descricao:
            `${descricao} Atendimento B2B em ${cidade} e região. ` +
            "Empresa fictícia criada para demonstração da Vynco+.",
          avaliacao: "Novo",
          donoId: null,
          ...imagens,
        },
      });

      criadas++;
      console.log(`+ ${nome}`);
    }
  }

  console.log(
    `\nCriadas: ${criadas} | Já existentes: ${puladas} | Modelo: ${setores.length * 8}`
  );
}

main()
  .catch((erro) => {
    console.error(erro);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
