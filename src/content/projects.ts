export type Project = {
  slug: string;
  title: string;
  subtitle?: string;
  year: string;
  cover?: string;
  summary: string;
  context: string;
  objectives: string[];
  activities: string[];
  results: string[];
  /**
   * Photo file prefix. All images uploaded with this prefix (e.g.
   * Projeto_Mulheres_01.jpg, Projeto_Mulheres_02.jpg) are auto-grouped in
   * the project's Gallery tab. See src/content/media.ts.
   */
  photoPrefix: string;
  /**
   * Certificate/document file prefix (e.g. Certificado_Projeto_Mulheres_).
   */
  documentPrefix: string;
};

export const projects: Project[] = [
  {
    slug: "mulheres-que-escrevem",
    title: "Mulheres que Escrevem",
    subtitle: "Escrita, escuta e memória feminina",
    year: "2024",
    summary:
      "Ciclo de oficinas de escrita criativa voltado a mulheres da tríplice fronteira, com foco em narrativas de vida, memória e território.",
    context:
      "O projeto nasce da constatação de que muitas mulheres da região mantêm memórias, cadernos e cartas sem espaço institucional de circulação. Propõe-se um lugar de escuta, escrita e publicação coletiva, aliando literatura e produção editorial comunitária.",
    objectives: [
      "Oferecer formação em escrita criativa e revisão de textos autorais",
      "Reunir e organizar narrativas femininas do território",
      "Publicar uma coletânea final impressa e digital",
      "Fortalecer redes de leitoras e escritoras locais",
    ],
    activities: [
      "8 oficinas presenciais de escrita criativa",
      "Rodas de leitura mediadas",
      "Curadoria e edição colaborativa dos textos",
      "Lançamento público com sarau e distribuição gratuita da coletânea",
    ],
    results: [
      "32 mulheres participantes ao longo do ciclo",
      "Coletânea publicada em formato impresso e e-book",
      "Formação de rede permanente de escrita feminina na região",
    ],
    photoPrefix: "Projeto_Mulheres_",
    documentPrefix: "Certificado_Projeto_Mulheres_",
  },
  {
    slug: "feira-do-livro",
    title: "Feira do Livro — Palavras da Fronteira",
    subtitle: "Curadoria literária e mediação de público",
    year: "2023",
    summary:
      "Curadoria, produção e mediação de mesas de uma feira do livro dedicada a autoras e autores da região oeste do Paraná.",
    context:
      "Iniciativa criada para dar visibilidade à produção literária local e ampliar o acesso do público leitor a livros publicados por editoras independentes da fronteira Brasil–Paraguai–Argentina.",
    objectives: [
      "Fomentar o mercado editorial regional",
      "Aproximar autores e leitores em ambiente público e gratuito",
      "Realizar mesas temáticas sobre literatura, memória e território",
    ],
    activities: [
      "Curadoria de 12 autoras e autores convidados",
      "Mediação de 6 mesas públicas",
      "Oficinas paralelas de escrita e leitura",
    ],
    results: [
      "Mais de 1.500 pessoas atendidas em três dias",
      "Registro fotográfico e audiovisual do evento",
      "Publicação de catálogo com biografia de autores convidados",
    ],
    photoPrefix: "Feira_do_Livro_",
    documentPrefix: "Certificado_Feira_",
  },
  {
    slug: "seminario-literatura",
    title: "Seminário de Literatura e Memória",
    subtitle: "Encontro acadêmico e formativo",
    year: "2022",
    summary:
      "Organização de seminário reunindo pesquisadoras, escritoras e mediadoras culturais em torno da relação entre literatura, memória oral e patrimônio.",
    context:
      "Espaço de troca entre universidade, escola pública e coletivos culturais, articulando pesquisa e prática em torno da memória social.",
    objectives: [
      "Debater metodologias de história oral aplicadas à literatura",
      "Formar mediadoras culturais e professoras da rede pública",
      "Publicar anais do seminário",
    ],
    activities: [
      "Conferências e mesas-redondas",
      "Oficinas de escrita e escuta",
      "Publicação de anais em formato digital",
    ],
    results: [
      "Participação de 120 inscritos",
      "Anais publicados e disponibilizados em acesso aberto",
      "Consolidação de rede regional de pesquisa em literatura e memória",
    ],
    photoPrefix: "Seminario_Literatura_",
    documentPrefix: "Certificado_Seminario_",
  },
  {
    slug: "oficina-escrita",
    title: "Oficina de Escrita Criativa",
    subtitle: "Formação de novas vozes",
    year: "2022",
    summary:
      "Ciclo continuado de oficinas de escrita criativa para adultos, dedicado à formação de novas vozes literárias na região.",
    context:
      "Ação de formação livre para pessoas interessadas em desenvolver projetos autorais, com acompanhamento individual e coletivo.",
    objectives: [
      "Desenvolver competências técnicas de escrita literária",
      "Estimular a publicação de textos autorais",
      "Construir comunidade de leitura crítica entre pares",
    ],
    activities: [
      "Encontros semanais de escrita",
      "Leituras compartilhadas e devolutivas",
      "Produção de portfólio literário individual",
    ],
    results: [
      "20 participantes concluintes",
      "5 textos preparados para publicação em coletânea",
      "Formação continuada de rede de escritoras iniciantes",
    ],
    photoPrefix: "Oficina_Escrita_",
    documentPrefix: "Certificado_Oficina_",
  },
];

export const projectsBySlug = Object.fromEntries(
  projects.map((p) => [p.slug, p]),
);