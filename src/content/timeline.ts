export type TimelineItem = {
  year: string;
  title: string;
  description: string;
  institution?: string;
  city?: string;
  image?: string;
  certificate?: string; // path or URL, when applicable
};

// Trajetória cultural — ordem cronológica descendente (mais recente primeiro)
export const timeline: TimelineItem[] = [
  {
    year: "2025",
    title: "E-Antologia Poética PSIQUÊ",
    description:
      "Participação como poeta convidada na antologia PSIQUÊ, publicada pela Editora e Produtora Fênixart, reunindo vozes contemporâneas em torno da psique feminina.",
    institution: "Editora Fênixart",
    city: "Brasil",
    certificate: "Certificado de Participação — PSIQUÊ",
  },
  {
    year: "2024",
    title: "Mentoria em Escrita Criativa",
    description:
      "Mentoria voltada à formação de novas vozes literárias, com foco em escrita autoral, revisão e preparação para publicação.",
    institution: "Programa independente",
    city: "Foz do Iguaçu, PR",
    certificate: "Declaração de Mentoria",
  },
  {
    year: "2023",
    title: "Projeto TAUP — Territórios da palavra",
    description:
      "Colaboração em projeto de mediação de leitura e escuta ativa, articulando literatura, memória oral e território.",
    institution: "TAUP",
    city: "Região Oeste do Paraná",
    certificate: "Declaração TAUP",
  },
  {
    year: "2022",
    title: "Extensão universitária em teatro — UNILA",
    description:
      "Participação em ensaios e processos formativos junto ao grupo de teatro da UNILA, integrando escrita, dramaturgia e criação coletiva.",
    institution: "UNILA",
    city: "Foz do Iguaçu, PR",
    image: "ensaio-teatro-unila",
    certificate: "Certificado PROEX — Teatro",
  },
  {
    year: "2021",
    title: "Menção Honrosa em Concurso Literário",
    description:
      "Reconhecimento a texto autoral inscrito em concurso literário nacional, com destaque para a densidade poética e o compromisso com narrativas femininas.",
    institution: "Concurso Literário Nacional",
    certificate: "Certificado de Menção Honrosa",
  },
  {
    year: "2019",
    title: "Clube de Leitura — Encontros de outubro",
    description:
      "Mediação e participação em rodas de leitura voltadas à formação de público leitor e ao debate sobre literatura brasileira contemporânea.",
    institution: "Clube de Leitura",
    city: "Foz do Iguaçu, PR",
    image: "clube-leitura",
  },
  {
    year: "2018",
    title: "Mestrado em Letras",
    description:
      "Formação em nível de mestrado com pesquisa dedicada à literatura, memória e representações femininas.",
    institution: "Pós-graduação em Letras",
    certificate: "Diploma de Mestrado",
  },
  {
    year: "2015",
    title: "Graduação em Letras Português/Espanhol",
    description:
      "Formação acadêmica na UNIOESTE, base para o interesse pela literatura de resistência e pelas perspectivas femininas na escrita.",
    institution: "UNIOESTE",
    city: "Paraná",
    certificate: "Diploma de Graduação",
  },
];