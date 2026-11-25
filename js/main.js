/* =========================================================
   Portfólio Juan Rocha — comportamento da página
   1. Ano automático no rodapé
   2. Menu mobile (botão hambúrguer)
   3. Destacar no menu a seção que está na tela
   4. Montar a grade de projetos e a lista de cursos
      a partir de data/projetos.js
   ========================================================= */


/* ---------- 0. E-MAIL DE CONTATO ----------
   Para trocar o e-mail do site, mude esta linha e o e-mail escrito nos dois index.html;
   os botões de e-mail das duas versões do site se atualizam sozinhos.
   (O HTML já vem com o e-mail atual, para funcionar mesmo sem JavaScript.) */
const EMAIL_CONTATO = 'contato@jrdevtecnologia.com.br';

document.querySelectorAll('[data-email]').forEach(function (link) {
  link.href = 'mailto:' + EMAIL_CONTATO;
});
document.querySelectorAll('[data-email-texto]').forEach(function (texto) {
  texto.textContent = EMAIL_CONTATO;
});


/* ---------- 1. ANO NO RODAPÉ ----------
   Assim o "© 2026" vira "© 2027" sozinho no ano que vem. */
const spanAno = document.getElementById('ano');
if (spanAno) {
  spanAno.textContent = new Date().getFullYear();
}


/* ---------- 2. MENU MOBILE ---------- */
const botaoMenu = document.querySelector('.nav-toggle');
const menu = document.getElementById('menu');

function abrirOuFecharMenu(abrir) {
  menu.classList.toggle('is-open', abrir);
  // aria-expanded avisa ao leitor de tela se o menu está aberto
  botaoMenu.setAttribute('aria-expanded', String(abrir));
  botaoMenu.setAttribute('aria-label', abrir ? 'Fechar menu' : 'Abrir menu');
}

if (botaoMenu && menu) {
  // Clique no botão: inverte o estado atual
  botaoMenu.addEventListener('click', function () {
    const estaAberto = botaoMenu.getAttribute('aria-expanded') === 'true';
    abrirOuFecharMenu(!estaAberto);
  });

  // Clicou em um link do menu: fecha (útil no celular)
  menu.addEventListener('click', function (evento) {
    if (evento.target.closest('a')) {
      abrirOuFecharMenu(false);
    }
  });

  // Tecla Esc fecha o menu e devolve o foco ao botão
  document.addEventListener('keydown', function (evento) {
    if (evento.key === 'Escape' && menu.classList.contains('is-open')) {
      abrirOuFecharMenu(false);
      botaoMenu.focus();
    }
  });
}


/* ---------- 3. LINK ATIVO NO MENU ----------
   IntersectionObserver "observa" as seções e avisa
   quando uma delas entra no meio da tela. */
const linksMenu = document.querySelectorAll('.nav-links a[href^="#"]');
const secoes = document.querySelectorAll('main section[id]');

const observador = new IntersectionObserver(function (entradas) {
  entradas.forEach(function (entrada) {
    if (!entrada.isIntersecting) return;

    const idVisivel = entrada.target.id;
    linksMenu.forEach(function (link) {
      const ehOAtual = link.getAttribute('href') === '#' + idVisivel;
      if (ehOAtual) {
        link.setAttribute('aria-current', 'true');
      } else {
        link.removeAttribute('aria-current');
      }
    });
  });
}, { rootMargin: '-45% 0px -50% 0px' }); // "meio da tela"

secoes.forEach(function (secao) {
  observador.observe(secao);
});


/* ---------- 4. PROJETOS ----------
   Os dados ficam em data/projetos.js (variável window.PROJETOS).
   Para adicionar um projeto, edite só esse arquivo — não o HTML.
   Por ser um <script> (e não um fetch de JSON), funciona até
   abrindo o index.html com dois cliques. */

// Cada status vira uma classe CSS com a cor do selo
const classeDoStatus = {
  'concluído': 'badge--concluido',
  'em construção': 'badge--construcao',
  'ideia': 'badge--ideia',
  'pessoal': 'badge--pessoal',
};

// Confere se um projeto tem os campos obrigatórios no formato certo.
// Devolve uma lista de problemas (vazia = tudo certo).
function problemasDoProjeto(projeto) {
  const problemas = [];
  if (typeof projeto !== 'object' || projeto === null) {
    return ['não é um bloco { ... }'];
  }
  if (typeof projeto.titulo !== 'string' || projeto.titulo === '') problemas.push('falta "titulo"');
  if (typeof projeto.descricao !== 'string') problemas.push('falta "descricao"');
  if (!Array.isArray(projeto.tecnologias)) problemas.push('"tecnologias" deve ser uma lista, ex.: ["HTML", "CSS"]');
  if (!(projeto.status in classeDoStatus)) {
    problemas.push('"status" inválido: "' + projeto.status + '" (use: ' + Object.keys(classeDoStatus).join(', ') + ')');
  }
  return problemas;
}

// Os caminhos de imagem em projetos.js (ex.: "img/painel.webp") são
// relativos à RAIZ do site. Para funcionarem também em páginas dentro
// de subpastas (como projetos/site-maps/), calculamos a raiz a partir de onde
// o próprio data/projetos.js foi carregado: a pasta acima de data/.
const scriptDados = document.querySelector('script[src$="projetos.js"]');
const raizDoSite = scriptDados ? new URL('../', scriptDados.src) : new URL('./', location.href);

// Cria o HTML de UM card a partir de um objeto de projeto
function criarCardProjeto(projeto) {
  const card = document.createElement('article');
  card.className = 'project';

  // Imagem (ou o espaço reservado, se ainda não tiver print)
  const midia = document.createElement('div');
  midia.className = 'project-media';
  if (projeto.imagem) {
    const img = document.createElement('img');
    img.src = new URL(projeto.imagem, raizDoSite).href;
    // "alt" é opcional nos dados; sem ele, usamos um texto padrão
    img.alt = projeto.alt || 'Tela do projeto ' + projeto.titulo;
    img.width = 1200; // tamanho real dos prints (1200×600)
    img.height = 600;
    img.loading = 'lazy'; // só baixa a imagem quando chegar perto dela
    midia.appendChild(img);
  } else {
    midia.textContent = '[ PRINT DO PROJETO ]';
    midia.setAttribute('aria-hidden', 'true');
  }
  card.appendChild(midia);

  const corpo = document.createElement('div');
  corpo.className = 'project-body';

  // Selo de status
  const selo = document.createElement('span');
  selo.className = 'badge ' + classeDoStatus[projeto.status];
  selo.textContent = projeto.status;
  corpo.appendChild(selo);

  // Título, descrição e tecnologias
  const titulo = document.createElement('h3');
  titulo.textContent = projeto.titulo;
  corpo.appendChild(titulo);

  // A descrição é uma caixa (div) com o texto e, se existir,
  // o bloco "antes / depois" logo embaixo
  const descricao = document.createElement('div');
  descricao.className = 'desc';
  const textoDescricao = document.createElement('p');
  textoDescricao.textContent = projeto.descricao;
  descricao.appendChild(textoDescricao);

  // Antes (feito à mão) e depois (com automação): só aparece se
  // o projeto tiver os dois campos preenchidos em data/projetos.js.
  // <dl> é uma "lista de definições": cada <dt> é um rótulo e o <dd>
  // logo abaixo é o texto daquele rótulo.
  if (projeto.antes && projeto.depois) {
    const comparacao = document.createElement('dl');
    comparacao.className = 'antes-depois';
    [
      { rotulo: 'antes', texto: projeto.antes },
      { rotulo: 'depois', texto: projeto.depois },
    ].forEach(function (item) {
      const dt = document.createElement('dt');
      dt.className = 'antes-depois-' + item.rotulo; // antes-depois-antes / antes-depois-depois
      dt.textContent = item.rotulo;
      const dd = document.createElement('dd');
      dd.textContent = item.texto;
      comparacao.appendChild(dt);
      comparacao.appendChild(dd);
    });
    descricao.appendChild(comparacao);
  }

  corpo.appendChild(descricao);

  const tecnologias = document.createElement('p');
  tecnologias.className = 'tech';
  tecnologias.textContent = projeto.tecnologias.join(', ');
  corpo.appendChild(tecnologias);

  // Links (só aparecem se existirem nos dados).
  // "pagina" é a página do projeto aqui no site: abre na mesma aba.
  const links = [];
  if (projeto.pagina) links.push({ texto: 'Ver detalhes', url: new URL(projeto.pagina, raizDoSite).href, mesmaAba: true });
  if (projeto.repo) links.push({ texto: 'Ver código', url: projeto.repo });
  if (projeto.demo) links.push({ texto: 'Ver online', url: new URL(projeto.demo, raizDoSite).href });

  if (links.length > 0) {
    const areaLinks = document.createElement('div');
    areaLinks.className = 'project-links';
    links.forEach(function (item) {
      const a = document.createElement('a');
      a.href = item.url;
      a.textContent = item.texto;
      if (item.mesmaAba) {
        a.setAttribute('aria-label', item.texto + ' de ' + projeto.titulo);
      } else {
        a.target = '_blank';
        a.rel = 'noopener';
        a.setAttribute('aria-label', item.texto + ' de ' + projeto.titulo + ' (abre em nova aba)');
      }
      areaLinks.appendChild(a);
    });
    corpo.appendChild(areaLinks);
  }

  card.appendChild(corpo);
  return card;
}

// Cria UMA linha da lista "Exercícios de curso": título, descrição curta,
// tecnologias e links. Sem imagem, para ocupar pouco espaço.
function criarItemCurso(projeto) {
  const item = document.createElement('li');
  item.className = 'curso';

  const titulo = document.createElement('h4');
  titulo.textContent = projeto.titulo;
  item.appendChild(titulo);

  const descricao = document.createElement('p');
  descricao.textContent = projeto.descricao;
  item.appendChild(descricao);

  const tecnologias = document.createElement('p');
  tecnologias.className = 'curso-tech';
  tecnologias.textContent = projeto.tecnologias.join(', ');
  item.appendChild(tecnologias);

  const links = document.createElement('p');
  links.className = 'curso-links';
  if (projeto.repo) links.appendChild(criarLinkExterno('Ver código', projeto.repo, projeto.titulo));
  if (projeto.demo) links.appendChild(criarLinkExterno('Ver online', projeto.demo, projeto.titulo));
  if (links.children.length > 0) item.appendChild(links);

  return item;
}

// Link que abre em nova aba, avisando isso para leitores de tela
function criarLinkExterno(texto, url, tituloDoProjeto) {
  const a = document.createElement('a');
  a.href = url;
  a.textContent = texto;
  a.target = '_blank';
  a.rel = 'noopener';
  a.setAttribute('aria-label', texto + ' de ' + tituloDoProjeto + ' (abre em nova aba)');
  return a;
}

// Coloca todos os cards válidos na página.
// Mensagens para o visitante vão no #projetos-status; detalhes técnicos,
// no console do navegador (F12 → Console), para você descobrir o erro.
function mostrarProjetos() {
  const lista = document.getElementById('lista-projetos');
  const listaCursos = document.getElementById('lista-cursos');
  const blocoCursos = document.getElementById('bloco-cursos');
  const status = document.getElementById('projetos-status');
  if (!lista || !status) return;

  const projetos = window.PROJETOS;

  // Se o arquivo de dados tiver erro de digitação (vírgula sobrando,
  // aspas faltando), o navegador não cria window.PROJETOS.
  if (!Array.isArray(projetos)) {
    console.error(
      'data/projetos.js não definiu a lista window.PROJETOS. ' +
      'Procure acima um "SyntaxError" apontando a linha com erro nesse arquivo.'
    );
    status.textContent = 'Não foi possível carregar os projetos agora.';
    status.hidden = false;
    return;
  }

  let quantosMostrados = 0;

  projetos.forEach(function (projeto, posicao) {
    const problemas = problemasDoProjeto(projeto);
    if (problemas.length > 0) {
      // Pula só ESTE projeto; os outros continuam aparecendo.
      console.error('Projeto nº ' + (posicao + 1) + ' em data/projetos.js foi ignorado: ' + problemas.join('; '));
      return;
    }
    if (projeto.tipo === 'curso' && listaCursos) {
      listaCursos.appendChild(criarItemCurso(projeto));
      if (blocoCursos) blocoCursos.hidden = false; // só aparece se tiver curso
    } else {
      lista.appendChild(criarCardProjeto(projeto));
    }
    quantosMostrados = quantosMostrados + 1;
  });

  // Com cards na tela, a mensagem some; sem nenhum, avisa.
  status.textContent = quantosMostrados > 0 ? '' : 'Projetos chegando em breve.';
  status.hidden = quantosMostrados > 0;
}

mostrarProjetos();
