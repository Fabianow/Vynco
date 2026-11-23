
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

// 40 empresas fictícias adicionais.
// Não possuem CNPJ real e são somente para testes.

const empresasDemo = [
  // CONSTRUÇÃO
  ["Construmax Demo", "Construção", "Materiais de Construção", "Produtos", "Diadema", "SP", "Materiais e equipamentos para obras comerciais e industriais."],
  ["ObraCerta Demo", "Construção Civil", "Engenharia Civil", "Serviços", "São Paulo", "SP", "Execução e gerenciamento de obras e reformas."],
  ["Estrutural ABC Demo", "Estruturas Metálicas", "Construção", "Serviços", "Santo André", "SP", "Projetos e fabricação de estruturas metálicas."],
  ["ArqDesign Demo", "Arquitetura", "Construção Civil", "Serviços", "Campinas", "SP", "Projetos arquitetônicos e soluções para espaços comerciais."],

  // INDÚSTRIA
  ["TornoMax Demo", "Usinagem", "Metalurgia", "Serviços", "Diadema", "SP", "Torneamento e usinagem de precisão para a indústria."],
  ["Ferramentaria Delta Demo", "Ferramentaria", "Usinagem", "Serviços", "São Bernardo do Campo", "SP", "Fabricação de ferramentas, moldes e dispositivos industriais."],
  ["MetalPrime Demo", "Metalurgia", "Estruturas Metálicas", "Produtos", "Santo André", "SP", "Componentes e estruturas metálicas sob encomenda."],
  ["AutoComponentes Demo", "Autopeças", "Indústria Automotiva", "Produtos", "Sorocaba", "SP", "Peças e componentes para fabricantes automotivos."],

  // TECNOLOGIA
  ["NextCode Demo", "Desenvolvimento de Software", "Tecnologia", "Serviços", "São Paulo", "SP", "Criação de aplicações web e sistemas empresariais."],
  ["Inteligência Data Demo", "Análise de Dados", "Tecnologia", "Serviços", "Campinas", "SP", "Análise de dados, dashboards e inteligência de negócios."],
  ["CloudBridge Demo", "Computação em Nuvem", "Tecnologia", "Serviços", "São Bernardo do Campo", "SP", "Migração, hospedagem e infraestrutura de sistemas na nuvem."],
  ["TechRobots Demo", "Robótica", "Automação Industrial", "Produtos", "Diadema", "SP", "Robôs, sensores e equipamentos de automação."],

  // LOGÍSTICA
  ["RotaCerta Demo", "Logística", "Transporte", "Serviços", "Diadema", "SP", "Entregas e transporte de cargas para empresas."],
  ["Armazém Digital Demo", "Armazenagem", "Logística", "Serviços", "São Paulo", "SP", "Estocagem, inventário e gestão de centros de distribuição."],
  ["CargoFlex Demo", "Transporte", "Logística", "Serviços", "Santos", "SP", "Transporte de cargas e apoio a operações portuárias."],
  ["Express ABC Demo", "Logística", "Distribuição", "Serviços", "Santo André", "SP", "Distribuição regional e entregas empresariais."],

  // SAÚDE
  ["MedSupply Demo", "Equipamentos Hospitalares", "Saúde", "Produtos", "São Paulo", "SP", "Fornecimento de equipamentos para clínicas e hospitais."],
  ["BioLab Demo", "Laboratórios", "Saúde", "Serviços", "Campinas", "SP", "Serviços laboratoriais e análises técnicas."],
  ["ClinTech Demo", "Tecnologia em Saúde", "Tecnologia", "Serviços", "São Bernardo do Campo", "SP", "Sistemas digitais de gestão para clínicas."],
  ["HealthPro Demo", "Saúde", "Segurança do Trabalho", "Serviços", "Diadema", "SP", "Saúde ocupacional e programas corporativos de prevenção."],

  // AGRONEGÓCIO
  ["AgroConnect Demo", "Agronegócio", "Tecnologia", "Serviços", "Ribeirão Preto", "SP", "Tecnologia e gestão de dados para produtores rurais."],
  ["CampoFértil Demo", "Agronegócio", "Insumos Agrícolas", "Produtos", "Campinas", "SP", "Distribuição de insumos para operações agrícolas."],
  ["AgroMáquinas Demo", "Máquinas Agrícolas", "Agronegócio", "Produtos", "Sorocaba", "SP", "Máquinas e componentes para o setor agrícola."],
  ["AgroLog Demo", "Logística", "Agronegócio", "Serviços", "Ribeirão Preto", "SP", "Transporte e armazenagem de produtos agrícolas."],

  // COMÉRCIO
  ["Atacado Prime Demo", "Comércio", "Distribuição", "Produtos", "São Paulo", "SP", "Atacado de produtos e materiais para empresas."],
  ["Suprimentos ABC Demo", "Suprimentos Industriais", "Comércio", "Produtos", "Diadema", "SP", "Suprimentos e materiais de uso industrial."],
  ["OfficeMarket Demo", "Materiais de Escritório", "Comércio", "Produtos", "Santo André", "SP", "Papelaria corporativa e equipamentos de escritório."],
  ["EletroStore Demo", "Componentes Eletrônicos", "Comércio", "Produtos", "Campinas", "SP", "Comercialização de componentes e acessórios eletrônicos."],

  // SERVIÇOS
  ["CleanWork Demo", "Limpeza Empresarial", "Serviços", "Serviços", "São Bernardo do Campo", "SP", "Limpeza e conservação de ambientes comerciais."],
  ["ManutenPro Demo", "Manutenção Industrial", "Serviços", "Serviços", "Diadema", "SP", "Manutenção preventiva e corretiva de máquinas."],
  ["DesignLab Demo", "Design Gráfico", "Marketing", "Serviços", "São Paulo", "SP", "Identidade visual e comunicação para empresas."],
  ["Segurança Total Demo", "Segurança Patrimonial", "Serviços", "Serviços", "Santo André", "SP", "Controle de acesso e segurança empresarial."],

  // ENERGIA
  ["SolarTech Demo", "Energia Solar", "Engenharia Elétrica", "Serviços", "Campinas", "SP", "Projetos e instalação de sistemas fotovoltaicos."],
  ["EcoEnergia Demo", "Energia", "Sustentabilidade", "Serviços", "São Paulo", "SP", "Consultoria em eficiência energética."],
  ["PowerGrid Demo", "Engenharia Elétrica", "Energia", "Serviços", "São Bernardo do Campo", "SP", "Instalações e manutenção de sistemas elétricos."],
  ["VoltParts Demo", "Materiais Elétricos", "Energia", "Produtos", "Diadema", "SP", "Distribuição de materiais e componentes elétricos."],

  // FINANCEIRO
  ["ContaFácil Demo", "Contabilidade", "Financeiro", "Serviços", "São Paulo", "SP", "Contabilidade e escrituração para empresas."],
  ["FinData Demo", "Consultoria Financeira", "Análise de Dados", "Serviços", "Campinas", "SP", "Análise financeira, planejamento e indicadores de gestão."],
  ["FiscalPro Demo", "Gestão Tributária", "Contabilidade", "Serviços", "Santo André", "SP", "Consultoria tributária e planejamento fiscal."],
  ["BusinessCapital Demo", "Financeiro", "Consultoria Empresarial", "Serviços", "São Bernardo do Campo", "SP", "Planejamento financeiro e apoio à gestão empresarial."],
];

async function main() {
  if (!process.argv.includes("--confirmar-demo")) {
    throw new Error(
      "Execute com --confirmar-demo para criar as empresas fictícias."
    );
  }

  let criadas = 0;
  let existentes = 0;

  for (const [indice, dados] of empresasDemo.entries()) {
    const [
      nome,
      categoria1,
      categoria2,
      tipoOferta,
      cidade,
      estado,
      descricao,
    ] = dados;

    // Evita duplicar empresas ao executar novamente.
    const existente = await prisma.empresa.findFirst({
      where: { nome },
      select: { id: true },
    });

    if (existente) {
      existentes++;
      console.log(`= Já existe: ${nome}`);
      continue;
    }

    await prisma.empresa.create({
      data: {
        nome,
        cnpj: null,
        isDemo: true,
        status: "ATIVA",
        plano: "FREE",
        responsavel: "Equipe de Demonstração",
        email: `vynco.demo.extra${indice + 1}@example.com`,
        telefone: "(11) 0000-0000",
        categoria1,
        categoria2,
        tipoOferta,
        cidade,
        estado,
        porte: "Pequena",
        descricao,
        avaliacao: "Novo",
        donoId: null,
      },
    });

    criadas++;
    console.log(`+ Criada: ${nome}`);
  }

  console.log("\n===== RESULTADO =====");
  console.log("Criadas:", criadas);
  console.log("Já existentes:", existentes);
  console.log("Total deste script:", empresasDemo.length);
}

main()
  .catch((erro) => {
    console.error("Falha ao criar empresas:", erro);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
