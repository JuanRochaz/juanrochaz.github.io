/* Projetos do portfólio.
   Para adicionar um projeto, copie um bloco { ... } e altere os campos.
   status: "concluído" | "em construção" | "ideia" | "pessoal"
   "antes" e "depois" são opcionais: como a tarefa era feita à mão
   e como ficou com a automação. Sem eles, o card não mostra esse bloco.
   Atenção às vírgulas entre os blocos! */
window.PROJETOS = [
  {
    "titulo": "Muscle Factory",
    "descricao": "Site de vendas da Muscle Factory, consultoria online de treino personalizado, feito pela JR Dev. O visitante conhece o método e faz um pré-cadastro em etapas, uma pergunta por tela; os treinadores recebem as respostas organizadas e fecham a venda pelo WhatsApp. Projeto de cliente, em fase final de conteúdo.",
    "antes": "Interessados chamavam direto no WhatsApp, e os treinadores precisavam fazer as mesmas perguntas a cada pessoa para saber se o perfil combinava.",
    "depois": "O pré-cadastro faz a triagem antes: cada resposta cai numa planilha Google e chega um aviso por e-mail, e o contato pelo WhatsApp já começa com o perfil em mãos.",
    "tecnologias": ["Next.js", "TypeScript", "Tailwind CSS", "Zod", "Google Apps Script", "Vercel"],
    "status": "em construção",
    "imagem": "img/muscle-factory.webp",
    "repo": "",
    "demo": ""
  },
  {
    "titulo": "Painel Inpasa AEI",
    "descricao": "Controle dos documentos que as empresas AEI precisam entregar no Portal do Parceiro da Inpasa, por empresa e por obra: o que vence, o que está em análise, o que foi aprovado e o que voltou com pendência. (Print com dados ilustrativos.)",
    "antes": "Entrar no portal, abrir empresa por empresa e obra por obra e anotar os prazos numa planilha, contando os dias úteis à mão.",
    "depois": "Uma verificação automática lê o portal todo dia útil, e o painel já mostra o que vence em até 2 dias úteis, descontando fins de semana e feriados.",
    "tecnologias": ["HTML", "CSS", "JavaScript", "automação com Claude"],
    "status": "concluído",
    "imagem": "img/painel-inpasa.webp",
    "repo": "",
    "demo": ""
  },
  {
    "titulo": "Auditoria Contábil",
    "descricao": "Painel que revisa o Balanço Patrimonial e a DRE de vários anos e aponta o que o contador precisa conferir: testes de fechamento, indicadores e pontos de atenção por relevância, cada um com evidência e cálculo. São indícios para conferência, não parecer de auditoria. (Print com dados fictícios.)",
    "antes": "Ler os PDFs do Balanço e da DRE ano a ano, digitar os saldos numa planilha e comparar conta a conta para achar o que não fecha.",
    "depois": "O Claude lê os PDFs e gera um arquivo com testes, indicadores e achados; o painel organiza tudo por relevância e mostra o que conferir em cada ponto.",
    "tecnologias": ["HTML", "CSS", "JavaScript", "JSON", "análise com Claude"],
    "status": "concluído",
    "imagem": "img/auditoria-contabil.webp",
    "repo": "",
    "demo": ""
  },
  {
    "titulo": "Alura MIDI",
    "descricao": "Teclado de sons no navegador: cada botão toca um instrumento, com clique ou pelo teclado (Enter e Espaço). Exercício de eventos e manipulação do DOM.",
    "tecnologias": ["HTML", "CSS", "JavaScript"],
    "status": "concluído",
    "imagem": "img/alura-midi.webp",
    "repo": "https://github.com/JuanRochaz/aluramidi",
    "demo": ""
  },
  {
    "titulo": "AluraBooks",
    "descricao": "Página de uma livraria on-line com menu de categorias que abre no celular sem JavaScript, só com HTML e CSS.",
    "tecnologias": ["HTML", "CSS", "responsivo"],
    "status": "concluído",
    "imagem": "img/alurabooks.webp",
    "repo": "https://github.com/JuanRochaz/AluraBooks",
    "demo": "https://alura-books-juanrochaz.vercel.app"
  },
  {
    "titulo": "Alura Plus",
    "descricao": "Página de venda de um plano de assinatura de cursos, adaptada para TV, computador, tablet e celular.",
    "tecnologias": ["HTML", "CSS", "responsivo"],
    "status": "concluído",
    "imagem": "img/alura-plus.webp",
    "repo": "https://github.com/JuanRochaz/Alura-Plus",
    "demo": "https://alura-plus-juanrochaz.vercel.app"
  },
  {
    "titulo": "Super Mario Bros — O Filme",
    "descricao": "Página de divulgação do filme com vídeo de fundo em loop e layout responsivo.",
    "tecnologias": ["HTML", "CSS", "JavaScript", "vídeo"],
    "status": "pessoal",
    "imagem": "img/projeto-mario.webp",
    "repo": "https://github.com/JuanRochaz/Projeto-Mario",
    "demo": "https://juanrochaz.github.io/Projeto-Mario/"
  },
  {
    "titulo": "Curiosidade de Tecnologia",
    "descricao": "Meu primeiro site: a história do mascote do Android, feito acompanhando o Curso em Vídeo.",
    "tecnologias": ["HTML", "CSS"],
    "status": "concluído",
    "imagem": "img/projeto-android.webp",
    "repo": "https://github.com/JuanRochaz/projeto-android",
    "demo": "https://juanrochaz.github.io/projeto-android/"
  }
];
