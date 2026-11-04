/* =========================================================
   Portfólio Juan Rocha — comportamento da página
   1. Ano automático no rodapé
   2. Menu mobile (botão hambúrguer)
   3. Destacar no menu a seção que está na tela
   4. Montar os cards de projetos a partir de data/projetos.js
   ========================================================= */


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

// Cria o HTML de UM card a partir de um objeto de projeto
function criarCardProjeto(projeto) {
  const card = document.createElement('article');
  card.className = 'project';

  // Imagem (ou o espaço reservado, se ainda não tiver print)
  const midia = document.createElement('div');
  midia.className = 'project-media';
  if (projeto.imagem) {
    const img = document.createElement('img');
    img.src = projeto.imagem;
    img.alt = 'Tela do projeto ' + projeto.titulo;
    img.width = 640;
    img.height = 360;
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

  const descricao = document.createElement('p');
  descricao.className = 'desc';
  descricao.textContent = projeto.descricao;
  corpo.appendChild(descricao);

  const tecnologias = document.createElement('p');
  tecnologias.className = 'tech';
  tecnologias.textContent = projeto.tecnologias.join(' · ');
  corpo.appendChild(tecnologias);

  // Links (só aparecem se existirem nos dados)
  const links = [];
  if (projeto.repo) links.push({ texto: 'Código', url: projeto.repo });
  if (projeto.demo) links.push({ texto: 'Ver online', url: projeto.demo });

  if (links.length > 0) {
    const areaLinks = document.createElement('div');
    areaLinks.className = 'project-links';
    links.forEach(function (item) {
      const a = document.createElement('a');
      a.href = item.url;
      a.target = '_blank';
      a.rel = 'noopener';
      a.textContent = item.texto + ' →';
      a.setAttribute('aria-label', item.texto + ' de ' + projeto.titulo + ' (abre em nova aba)');
      areaLinks.appendChild(a);
    });
    corpo.appendChild(areaLinks);
  }

  card.appendChild(corpo);
  return card;
}

// Coloca todos os cards válidos na página.
// Mensagens para o visitante vão no #projetos-status; detalhes técnicos,
// no console do navegador (F12 → Console), para você descobrir o erro.
function mostrarProjetos() {
  const lista = document.getElementById('lista-projetos');
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
    lista.appendChild(criarCardProjeto(projeto));
    quantosMostrados = quantosMostrados + 1;
  });

  // Com cards na tela, a mensagem some; sem nenhum, avisa.
  status.textContent = quantosMostrados > 0 ? '' : 'Projetos chegando em breve.';
  status.hidden = quantosMostrados > 0;
}

mostrarProjetos();
