/* ============================================================
   LOK CAR — app.js
   1. Sinaliza que o JS está ativo (habilita os reveals)
   2. Abertura de marca
   3. Header: estado ao rolar + menu mobile
   4. Reveal no scroll via IntersectionObserver
   5. Demonstração da reserva:
      veículo → período (calendário) → proteção → adicionais
      → resumo ao vivo → solicitação

   Sem dependências. Sem backend.
   Todos os valores da demonstração vêm de scripts/config.js.
   ============================================================ */

(function () {
  'use strict';

  var root = document.documentElement;
  var CFG = window.LOKCAR_CONFIG;

  /* JS ativo: só agora os elementos .rv podem começar escondidos.
     Assim, com JS desligado, a página aparece inteira. */
  root.classList.remove('no-js');
  root.classList.add('js');

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Faixa de diária exibida no card: "R$ 400–600".
     Fica aqui, e não lá embaixo, porque a seção de preços da
     frota roda antes de o restante das funções ser declarado. */
  var formatRange = function (min, max) {
    return 'R$ ' + min + '–' + max;
  };

  /* ==========================================================
     1 · ABERTURA DE MARCA
     A abertura é puro CSS (ver styles/intro.css). Aqui só
     cuidamos do fim dela: liberar a página e deixar as entradas
     do hero rodarem. O bloco é removido do DOM, então nada
     sobra para atrapalhar depois.

     A sequência tem duas passadas — o nome LOKCAR e, depois, a
     frase. O total é combinado com o CSS: o palco dissolve em
     2,95s, o fundo em 3,15s e some em 3,90s.
     ========================================================== */
  var intro = document.getElementById('intro');

  var finishIntro = function () {
    document.body.classList.remove('intro-on');
    if (intro && intro.parentNode) {
      intro.parentNode.removeChild(intro);
    }
    intro = null;
  };

  if (intro) {
    if (reduceMotion) {
      /* Sem cerimônia: a página simplesmente está pronta. */
      finishIntro();
    } else {
      var introMs = 3900;

      var introTimer = window.setTimeout(finishIntro, introMs);

      /* Se algo travar, um teto garante que a página nunca fique
         presa atrás da abertura. */
      window.setTimeout(function () {
        if (intro) {
          window.clearTimeout(introTimer);
          finishIntro();
        }
      }, 6000);

      /* Quem chega por link direto (ex.: #reservar) não deve
         esperar a cerimônia: pula direto ao destino. */
      window.addEventListener('load', function () {
        if (window.location.hash && window.location.hash.length > 1) {
          var alvo = document.querySelector(window.location.hash);
          if (alvo) {
            window.clearTimeout(introTimer);
            finishIntro();
            alvo.scrollIntoView();
          }
        }
      });
    }
  } else {
    document.body.classList.remove('intro-on');
  }

  /* ==========================================================
     2 · HEADER — estado ao rolar
     ========================================================== */
  var hdr = document.getElementById('hdr');

  if (hdr) {
    var ticking = false;

    var syncHeader = function () {
      if (window.scrollY > 40) {
        hdr.classList.add('is-scrolled');
      } else {
        hdr.classList.remove('is-scrolled');
      }
      ticking = false;
    };

    window.addEventListener('scroll', function () {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(syncHeader);
      }
    }, { passive: true });

    syncHeader();
  }

  /* ==========================================================
     3 · MENU MOBILE
     ========================================================== */
  var burger = document.getElementById('burger');
  var mobileMenu = document.getElementById('mobileMenu');

  var closeMenu = function () {
    if (!burger || !mobileMenu) return;
    burger.classList.remove('is-open');
    mobileMenu.classList.remove('is-open');
    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-label', 'Abrir menu');
    document.body.classList.remove('is-locked');
  };

  var openMenu = function () {
    if (!burger || !mobileMenu) return;
    burger.classList.add('is-open');
    mobileMenu.classList.add('is-open');
    burger.setAttribute('aria-expanded', 'true');
    burger.setAttribute('aria-label', 'Fechar menu');
    document.body.classList.add('is-locked');
  };

  if (burger && mobileMenu) {
    burger.addEventListener('click', function () {
      if (mobileMenu.classList.contains('is-open')) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    /* Fecha ao escolher uma opção — exigência de usabilidade mobile */
    mobileMenu.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', closeMenu);
    });

    /* Fecha com Esc */
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && mobileMenu.classList.contains('is-open')) {
        closeMenu();
        burger.focus();
      }
    });

    /* Se a janela crescer além do breakpoint, o menu não pode ficar preso */
    window.addEventListener('resize', function () {
      if (window.innerWidth > 968) closeMenu();
    });
  }

  /* ==========================================================
     4 · REVEAL NO SCROLL
     ========================================================== */
  var revealables = document.querySelectorAll('.rv');

  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealables.forEach(function (el) {
      el.classList.add('is-in');
    });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        }
      });
    }, {
      rootMargin: '0px 0px -12% 0px',
      threshold: 0.08
    });

    revealables.forEach(function (el) {
      io.observe(el);
    });
  }

  /* ==========================================================
     5 · ANO ATUAL NO RODAPÉ
     ========================================================== */
  var yearEl = document.getElementById('ftrYear');
  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }

  /* ==========================================================
     6 · PREÇOS NOS CARDS DA FROTA
     Os valores nascem no HTML (aparecem sem JS); aqui eles são
     reescritos a partir da config, para que exista uma única
     fonte de verdade.
     ========================================================== */
  if (CFG) {
    document.querySelectorAll('[data-price-for]').forEach(function (el) {
      var modelo = el.getAttribute('data-price-for');
      var v = CFG.getVeiculo(modelo);
      if (!v) return;
      el.textContent = formatRange(v.diariaMin, v.diariaMax);
    });
  }

  /* ==========================================================
     7 · VISUALIZADOR DO VEÍCULO

     Oito ângulos reais do carro, girando em volta do próprio eixo.
     Não há biblioteca nenhuma: nada de Three.js, WebGL ou canvas —
     o que existe são oito arquivos e um índice.

     OS ARQUIVOS
     São fotos COMPLETAS de estúdio (1905×826): o fundo claro, o
     gradiente do ambiente e a plataforma circular no piso já vêm
     gravados dentro do quadro, e são praticamente idênticos nos
     oito. Não há recorte nem transparência — e é justamente por
     isso que não existe nenhuma camada de cenário no CSS: qualquer
     plataforma desenhada por cima seria uma SEGUNDA plataforma
     sobre a que já está na foto.

     A VOLTA É UM ANEL
     A ordem 01 → 02 → … → 08 → 01 é fechada: passando do 08 chega-
     se ao 01, e voltando do 01 chega-se ao 08. É o contrário da
     versão anterior, cujas seis fotos eram uma espiral (o outro
     lado do carro nunca foi fotografado, e a volta tinha de ser
     feita por cima). Aqui a volta é completa e não há salto.

     COMO O GIRO FUNCIONA
     A posição não é um índice inteiro, é um número contínuo numa
     escada circular: 2,37 quer dizer "37% do caminho do ângulo 2
     para o 3". O arrasto escreve essa posição medindo a distância
     TOTAL andada pela mão desde o `pointerdown` — como um mapa, não
     como um botão. O quadro mostrado é o INTEIRO mais próximo, e a
     troca é um corte: com fotos opacas, misturar duas mostraria
     dois carros ao mesmo tempo.

     AUTOPLAY
     Enquanto ninguém toca, a cena passeia pelos ângulos sozinha. O
     primeiro gesto para tudo e entrega o controle, definitivamente,
     até recarregar a página. Não existe botão de play: retomar
     sozinho depois que a pessoa assumiu o controle seria
     atrapalhar.
     ========================================================== */
  var viewer = document.getElementById('pv');

  if (viewer) {
    var pvStage   = document.getElementById('pvStage');
    var pvWorld   = document.getElementById('pvWorld');
    var pvDots    = document.getElementById('pvDots');
    var pvHint    = document.getElementById('pvHint');
    var pvLabel   = document.getElementById('pvLabel');
    var pvZoomIn  = document.getElementById('pvZoomIn');
    var pvZoomOut = document.getElementById('pvZoomOut');
    var pvReset   = document.getElementById('pvReset');
    var pvLive    = document.getElementById('pvLive');
    /* A ÚNICA camada de imagem que existe agora. As referências às
       camadas de cenário (`pvBgWrap`, `pvPiso`, `pvRefletor`,
       `pvPodium`, `pvPodiumHalo`, `pvLuz`), à segunda camada de
       carro (`pvCarB`) e à placa (`pvPlaca*`) saíram junto com os
       elementos: o cenário está gravado nas fotos e a placa LOK CAR
       foi removida do visualizador. */
    var pvCarA    = document.getElementById('pvCarA');

    /* Os oito ângulos, na ordem oficial da volta. A ordem da lista
       É a ordem do giro: 01 frente, 02 frente e lateral direita,
       03 lateral direita, 04 traseira e lateral direita, 05
       traseira, 06 traseira e lateral esquerda, 07 lateral
       esquerda, 08 frente e lateral esquerda — e do 08 volta ao 01.
       Nenhum quadro intermediário é inventado: são estes oito e
       nada mais.

       Cada ângulo tem só duas informações: o arquivo e o rótulo, e
       é de propósito. A versão anterior guardava aqui a linha do
       chão de cada foto e a posição da placa medida no arquivo.

       · O `chao` saiu porque não há mais o que corrigir. Ele existia
         para alinhar os recortes transparentes, que vinham de fotos
         diferentes com o carro em alturas diferentes. Estes oito
         arquivos são a MESMA sessão de estúdio com a câmera
         girando: medido pixel a pixel, o arco de cima da plataforma
         cai na mesma linha (y=627) nos oito, e a linha de contato do
         pneu varia só 2,8% da altura. Ou seja, o carro já está
         alinhado dentro dos arquivos — empurrar qualquer um deles
         verticalmente só o tiraria de cima da plataforma que vem na
         própria foto.

       · A `placa` saiu porque a placa LOK CAR foi removida do
         visualizador. Ela era um retângulo da identidade desenhado
         sobre o painel branco de dois dos seis ângulos antigos; nos
         arquivos novos não há painel branco onde ela caiba sem
         cobrir a lataria. */
    var pvData = [
      { src: 'Public/carro-01-frente.png.png',
        label: 'Frente' },
      { src: 'Public/carro-02-frente-direita.png.png',
        label: 'Frente e lateral direita' },
      { src: 'Public/carro-03-direita.png.png',
        label: 'Lateral direita' },
      { src: 'Public/carro-04-traseira-direita.png.png',
        label: 'Traseira e lateral direita' },
      { src: 'Public/carro-05-traseira.png.png',
        label: 'Traseira' },
      { src: 'Public/carro-06-traseira-esquerda.png.png',
        label: 'Traseira e lateral esquerda' },
      { src: 'Public/carro-07-esquerda.png.png',
        label: 'Lateral esquerda' },
      { src: 'Public/carro-08-frente-esquerda.png.png',
        label: 'Frente e lateral esquerda' }
    ];

    var pvCount = pvData.length;

    /* O ângulo de abertura: a frente. É a vista que apresenta o carro
       de cara e a que a referência do visualizador mostra. */
    var PV_INICIAL = 0;

    var ZOOM_MIN  = 1;
    var ZOOM_MAX  = 2.2;
    var ZOOM_STEP = 0.25;

    /* ---------- Arrasto estilo mapa ----------
       O gesto é contínuo, não em degraus: a posição do ângulo
       acompanha a distância TOTAL andada desde o `pointerdown`. O
       carro é desenhado no ângulo inteiro mais próximo dessa
       posição, e continuar arrastando continua atravessando os
       ângulos.

       A distância é medida em PONTOS DA ESCADA (0 a 1 em cada
       quadro) e convertida para pixels aqui. Um arrasto de
       `PV_ARRASTO` px vira um quadro. 190 px é o tamanho de um
       arrasto confortável num palco de ~1200px sem que uma tremidа
       de 20 px já troque o carro: 20 px são 10% de um quadro, o
       bastante para o arredondamento não pular de posição. O valor é
       maior que os 168 px da versão de seis fotos porque agora são
       oito ângulos: manter 168 faria a volta inteira caber num
       arrasto 25% mais curto, e o carro giraria rápido demais para
       a mão acompanhar. */
    var PV_ARRASTO = 190;   /* px de arrasto por ângulo inteiro */

    /* ------------------------------------------------------------------
       A escada de ângulos.

       Estes oito índices são os do `pvData`, na ordem em que a
       câmera contorna o carro — conferida olhando os oito arquivos,
       não deduzida dos nomes:

         0  frente                    azimute   0°
         1  frente e lateral direita  azimute  45°
         2  lateral direita           azimute  90°
         3  traseira e lateral direita azimute 135°
         4  traseira                  azimute 180°
         5  traseira e lateral esquerda azimute 225°
         6  lateral esquerda          azimute 270°
         7  frente e lateral esquerda azimute 315°

       E aqui está a diferença que define este código: o conjunto É
       um ANEL FECHADO. A câmera deu a volta completa no carro, então
       do 8 chega-se naturalmente ao 1 e do 1, voltando, chega-se ao
       8. Não existe salto, não existe ângulo que "volta por cima" e
       não existe ponto fraco na volta.

       (Na versão anterior isto era uma espiral: só um lado do carro
       havia sido fotografado e a volta tinha de ser feita subindo por
       cima da traseira. O comentário que estava aqui descrevia esse
       salto. Ele deixou de existir.)

       O anel não precisa de nenhum tratamento especial: `pvPintar`
       fecha a conta com módulo, então passar do índice 7 cai no 0 e
       descer do 0 cai no 7 — nos dois sentidos, para sempre.

       `PV_ENTRADA` continua existindo só para deixar explícito que a
       ordem dos DADOS é a ordem do GIRO. Hoje ele é a identidade; se
       um dia os arquivos forem renomeados em outra ordem, é aqui —
       e só aqui — que a volta se corrige.
       ------------------------------------------------------------------ */
    var PV_ORDEM   = [0, 1, 2, 3, 4, 5, 6, 7];
    var PV_ENTRADA = [0, 1, 2, 3, 4, 5, 6, 7];

    /* Autoplay: pausa longa olhando cada ângulo, e uma passada só
       até o fim. Nada de vai-e-vem eterno. */
    var AUTOPLAY_MS = 4600;

    var pvIndex = PV_INICIAL;
    var pvAutoplay = !reduceMotion;
    var pvTimer = null;
    var pvZoom = 1;
    var pvX = 0;
    var pvY = 0;
    var pvToque = false;

    /* Posição contínua na escada: 1.5 é "meio caminho entre os
       ângulos das pontas 1 e 2". `pvEscada` é o valor inteiro (o
       ângulo que a interface anuncia) e `pvArrasto` é o deslize em
       curso, em unidades de ângulo — o que ainda não virou troca. */
    var pvEscada = PV_ENTRADA[PV_INICIAL];
    var pvArrasto = 0;

    /* O degrau de onde o gesto ATUAL partiu. O arrasto é medido
       contra ele e não contra a posição do quadro anterior — é isso
       que faz o carro acompanhar a distância TOTAL percorrida pela
       mão, do jeito que um mapa acompanha, em vez de andar um
       pouquinho por vez e devolver o resto a cada quadro. */
    var pvBaseEscada = pvEscada;

    /* O quadro que está na tela. Como agora há UMA camada de imagem,
       isto é só o índice do arquivo carregado nela — não há mais
       duas fotos simultâneas para controlar. */
    var pvMostraA = -1;

    /* O que a pessoa já entendeu: depois do primeiro gesto a dica
       some e não volta. */
    var pvDicaVisivel = true;

    var pvClamp = function (valor, min, max) {
      return valor < min ? min : (valor > max ? max : valor);
    };

    /* Quanto a imagem ampliada pode ser arrastada. Em 1x não sobra
       nada; conforme o zoom sobe, a folga cresce. */
    var pvFolga = function () {
      return (pvZoom - 1) * 100;
    };

    /* ---------- O transform do carro ----------
       Uma função, um elemento. O que entra nela:

         · o zoom;
         · a folga do arrasto em 1x (`pvX`/`pvY`), que em 1x é zero;
         · a folga do arrasto com zoom, que é o quanto a imagem
           ampliada pode andar dentro da caixa.

       Tudo escrito em PX contra a largura do palco, e não em
       porcentagem: em porcentagem o deslocamento mediria contra a
       PRÓPRIA caixa da imagem, e com `object-fit: contain` a caixa
       é maior que a foto em um dos eixos — o carro andaria mais no
       eixo com folga do que no outro.

       O `translate3d` promove a imagem à GPU, e é o que faz o
       arrasto custar só composição em vez de repintura. */
    var pvPuxar = function (eixo) {
      var base = eixo === 'y' ? pvY : pvX;
      var largura = eixo === 'y' ? pvStage.clientHeight : pvStage.clientWidth;

      return Math.round((base / 100) * pvZoom * largura);
    };

    var pvAplicar = function () {
      if (!pvCarA) return;

      pvCarA.style.transform =
        'translate3d(' + pvPuxar('x') + 'px, ' + pvPuxar('y') + 'px, 0) ' +
        'scale(' + pvZoom + ')';

      /* O respiro automático só existe com a mão longe e sem zoom.
         Com `.is-manual` o gesto assume a cena e o movimento para. */
      pvWorld.classList.toggle('is-manual', pvZoom > 1.001 || pvToque);
    };

    /* ---------- A troca de quadro ----------
       `pvPintar(posicao)` desenha a cena numa posição QUALQUER da
       escada — 2.37, por exemplo, quer dizer "37% do caminho do
       ângulo 2 para o 3".

       O quadro mostrado é o INTEIRO mais próximo: `Math.round`, e
       não `Math.floor`. A diferença é o que faz o carro trocar no
       MEIO do caminho entre dois ângulos em vez de só no fim, e é
       por isso que o giro parece acompanhar a mão nos dois
       sentidos: indo e voltando, a troca acontece no mesmo ponto.

       A troca em si é um CORTE — um arquivo entra, o outro sai. Não
       há dissolvência, e a razão é medida, não estética: os oito
       arquivos são fotos opacas, e o carro NÃO se sobrepõe de um
       quadro para o outro (entre o 02 e o 03, por exemplo, o centro
       da silhueta anda de 49,5% para 50,9% e a largura de 53% para
       74%). Misturar dois quadros que não coincidem não funde os
       dois carros — mostra os dois, um por cima do outro, e o de
       trás aparece inteiro com a plataforma dele junto. O corte é o
       que mantém o carro nítido e único, que é o pedido.

       O `src` só é reescrito quando o ângulo realmente muda:
       reatribuir a mesma string a cada quadro abortaria a
       decodificação e faria a imagem piscar durante o arrasto. */
    var pvPintar = function (posicao) {
      var base = Math.round(posicao);

      /* O módulo é o que fecha o anel: passando do índice 7 a conta
         volta ao 0, e descendo do 0 ela cai no 7. Vale para
         qualquer número, inclusive negativo, porque o segundo
         módulo traz o resultado para a faixa positiva. */
      var ia = PV_ORDEM[((base % pvCount) + pvCount) % pvCount];

      if (pvMostraA !== ia) {
        if (pvCarA) pvCarA.src = pvData[ia].src;
        pvMostraA = ia;
      }

      pvAplicar();
    };

    /* ---------- Assentar num ângulo ----------
       Põe a cena EXATAMENTE em `pvEscada` e sincroniza a interface.
       É o que as bolinhas, as setas, o autoplay e o fim de um
       arrasto têm em comum: três caminhos, um só lugar onde o
       ângulo anunciado e o ângulo desenhado podem divergir — e é
       por isso que eles não divergem. */
    var pvAssentar = function () {
      var indice = PV_ORDEM[((pvEscada % pvCount) + pvCount) % pvCount];
      pvIndex = indice;

      pvPintar(pvEscada);

      if (pvDots) { pvDots.setAttribute('data-index', String(indice)); }

      if (pvLabel) { pvLabel.textContent = pvData[indice].label; }

      if (pvLive) {
        pvLive.textContent = 'Ângulo ' + (indice + 1) + ' de ' + pvCount +
                             ': ' + pvData[indice].label;
      }
    };

    /* ---------- Ir para um ângulo ----------
       Salto direto, sem virada animada: é o que as bolinhas e as
       setas do teclado fazem. O gesto de arrastar usa `pvPintar`
       direto e não passa por aqui. */
    var pvIrPara = function (indice) {
      pvIndex = ((indice % pvCount) + pvCount) % pvCount;
      pvEscada = PV_ENTRADA[pvIndex];
      pvArrasto = 0;
      /* Âncora do próximo gesto: quem chega aqui por bolinha, seta
         ou autoplay começa o arrasto seguinte deste ângulo. */
      pvBaseEscada = pvEscada;

      pvAssentar();

      /* O brilho da lataria: uma passada de luz a cada troca, para
         a transição ler como movimento de estúdio, não como corte. */
      pvStage.classList.remove('is-sweep');
      void pvStage.offsetWidth;
      pvStage.classList.add('is-sweep');

      pvLed();
    };

    /* ---------- Controle discreto: uma marca por ângulo ---------- */
    var pvLed = function () {
      if (!pvDots) return;

      var marcas = pvDots.querySelectorAll('.pv__dot');
      for (var i = 0; i < marcas.length; i++) {
        var ativa = (i === pvIndex);
        marcas[i].classList.toggle('is-on', ativa);
        /* Botão, não aba: o estado ativo se anuncia por
           `aria-current`, não por `aria-selected`. */
        if (ativa) {
          marcas[i].setAttribute('aria-current', 'true');
        } else {
          marcas[i].removeAttribute('aria-current');
        }
      }
    };

    /* ---------- Autoplay ---------- */
    var pvParar = function () {
      pvToque = true;
      pvAplicar();
      pvAutoplay = false;
      if (pvTimer) { window.clearInterval(pvTimer); pvTimer = null; }
    };

    var pvSeguir = function () {
      if (!pvAutoplay) return;
      pvTimer = window.setInterval(function () { pvIrPara(pvIndex + 1); }, AUTOPLAY_MS);
    };

    var pvEsconderDica = function () {
      if (!pvDicaVisivel) return;
      pvDicaVisivel = false;
      if (pvHint) { pvHint.classList.add('is-off'); }
    };

    /* ---------- Zoom ---------- */
    var pvSetZoom = function (valor) {
      pvZoom = pvClamp(valor, ZOOM_MIN, ZOOM_MAX);

      /* Ao voltar para 1x não há o que arrastar: recentraliza. */
      var folga = pvFolga();
      pvX = pvClamp(pvX, -folga, folga);
      pvY = pvClamp(pvY, -folga, folga);

      if (pvZoom <= ZOOM_MIN + 0.001) { pvX = 0; pvY = 0; }

      pvAplicar();
    };

    /* ---------- Gestos: Pointer Events ----------
       Um só caminho para mouse, caneta e dedo. O que muda é o que
       o gesto faz, e isso depende do zoom:
         · em 1x  → arrastar troca de ângulo
         · ampliado → arrastar move a área ampliada
       Assim as duas intenções nunca disputam o mesmo gesto. */
    var pvAtivo = false;
    var pvId = null;
    var pvIniX = 0;
    var pvIniY = 0;
    var pvUltimoX = 0;
    var pvUltimoY = 0;
    var pvArrastou = false;

    var pvTemZoom = function () { return pvZoom > ZOOM_MIN + 0.001; };

    var pvDown = function (e) {
      if (e.pointerType === 'mouse' && e.button !== 0) return;

      pvAtivo = true;
      pvId = e.pointerId;
      pvIniX = e.clientX;
      pvIniY = e.clientY;
      pvUltimoX = e.clientX;
      pvUltimoY = e.clientY;
      pvArrastou = false;
      /* Zera o que sobrou do gesto anterior e fixa o degrau de
         partida: o arrasto novo começa sempre do ângulo em que o
         carro está, não de onde o antigo parou. */
      pvArrasto = 0;
      pvBaseEscada = pvEscada;

      /* Assumiu o controle: o passeio automático para aqui. */
      pvParar();
      pvEsconderDica();

      /* O capture garante o pointerup mesmo se o dedo sair da área. */
      if (pvStage.setPointerCapture) {
        try { pvStage.setPointerCapture(e.pointerId); } catch (err) {}
      }

      viewer.classList.add('is-grab');
    };

    var pvMove = function (e) {
      if (!pvAtivo || e.pointerId !== pvId) return;

      var dx = e.clientX - pvIniX;
      var dy = e.clientY - pvIniY;

      if (Math.abs(dx) > 4 || Math.abs(dy) > 4) { pvArrastou = true; }

      if (pvTemZoom()) {
        /* AMPLIADO: o arrasto navega dentro da imagem. O movimento é
           proporcional ao quanto a imagem passou do tamanho da caixa.
           A troca de ângulo fica desligada aqui de propósito: com o
           carro ampliado, o gesto horizontal tem de mover a área
           ampliada — senão as duas intenções disputam o mesmo
           movimento e nenhuma das duas funciona. */
        e.preventDefault();

        var caixa = pvStage.clientWidth || 1;
        var px = (dx / caixa) * 100 / pvZoom;
        var py = (dy / caixa) * 100 / pvZoom;
        var folga = pvFolga();

        pvX = pvClamp(pvX + px, -folga, folga);
        pvY = pvClamp(pvY + py, -folga, folga);

        pvAplicar();
      } else {
        /* Em 1x: o gesto GIRA O CARRO, proporcional à distância
           TOTAL andada desde o `pointerdown` — e não ao movimento do
           último quadro.

           Essa é a diferença que faz o giro parecer físico. Medindo
           contra o ponto de partida, a posição do carro é sempre
           `posição inicial + o que a mão andou`: parar a mão para o
           carro, andar de novo continua de onde parou, e voltar a
           mão faz o carro voltar pelo mesmo caminho. Se fosse medida
           contra o quadro anterior, qualquer tremor de 2 px viraria
           uma fração de ângulo e o carro iria se arrastando sozinho
           para longe do dedo.

           E como o quadro mostrado é o inteiro mais próximo, um
           tremor pequeno não pode pular vários ângulos: ele muda a
           posição em 20/190 = 0,1 de um quadro, e o carro só troca
           de verdade quando a posição cruza o meio do caminho.
           Tremer o dedo no lugar não gira o carro.

           Arrastar para a ESQUERDA avança — a convenção de mapa, em
           que o conteúdo anda para o lado do dedo. Para a direita,
           gira ao contrário. */
        e.preventDefault();

        pvArrasto = (-dx / PV_ARRASTO);

        var alvo = pvBaseEscada + pvArrasto;
        pvPintar(alvo);

        /* O rótulo acompanha o gesto: enquanto o carro atravessa um
           ângulo, quem lê a tela já sabe em qual ele está, em vez de
           descobrir só quando a mão solta. */
        var anunciado = PV_ORDEM[((Math.round(alvo) % pvCount) + pvCount) % pvCount];
        if (anunciado !== pvIndex) {
          pvIndex = anunciado;
          if (pvDots) { pvDots.setAttribute('data-index', String(pvIndex)); }
          if (pvLabel) { pvLabel.textContent = pvData[pvIndex].label; }
          pvLed();
        }
      }

      /* A rolagem vertical da página continua sendo rolagem, não
         virada de carro. O `touch-action: pan-y` do CSS já entrega
         o gesto vertical ao navegador e cancela este ponteiro —
         mas no desktop, com mouse, nada disso existe, e um arrasto
         na diagonal viraria o carro enquanto a página anda. Aqui o
         eixo dominante decide: se o gesto é mais vertical do que
         horizontal, o visualizador solta e deixa a página rolar. */
      if (Math.abs(dy) > Math.abs(dx)) {
        pvAtivo = false;
        pvId = null;
        pvArrastou = false;
        viewer.classList.remove('is-grab');
        if (pvArrasto !== 0) { pvArrasto = 0; pvAssentar(); }
      }

      pvUltimoX = e.clientX;
      pvUltimoY = e.clientY;
    };

    /* ---------- Soltar ----------
       Aqui o gesto se decide. Se ficou retido o suficiente para
       valer uma troca, o ângulo avança (ou volta) e a virada se
       completa; se foi só um encostão, tudo volta ao lugar. Nos dois
       casos o carro termina parado num ângulo inteiro — nunca no
       meio de dois. */
    var pvUp = function (e) {
      if (!pvAtivo || (e.pointerId !== undefined && e.pointerId !== pvId)) return;

      pvAtivo = false;
      pvId = null;
      viewer.classList.remove('is-grab');

      if (pvArrasto !== 0 && pvArrastou) {
        /* O gesto termina no ângulo INTEIRO mais próximo da posição
           em que a mão soltou. O carro nunca fica parado entre dois
           quadros: se a pessoa andou 1,4 ângulo ele fecha em 1; se
           andou 1,6 fecha em 2; se andou só um encostão de 0,2 ele
           volta para onde estava. */
        var alvo = Math.round(pvBaseEscada + pvArrasto);

        pvArrasto = 0;
        pvEscada = alvo;
        pvIndex = PV_ORDEM[((pvEscada % pvCount) + pvCount) % pvCount];

        if (pvDots) { pvDots.setAttribute('data-index', String(pvIndex)); }
        if (pvLabel) { pvLabel.textContent = pvData[pvIndex].label; }
        if (pvLive) {
          pvLive.textContent = 'Ângulo ' + (pvIndex + 1) + ' de ' + pvCount +
                               ': ' + pvData[pvIndex].label;
        }

        pvAssentar();
        pvLed();

        /* A passada de luz fecha a virada — é o que faz o gesto
           terminar com cara de movimento de estúdio. */
        pvStage.classList.remove('is-sweep');
        void pvStage.offsetWidth;
        pvStage.classList.add('is-sweep');
      } else if (pvArrasto !== 0) {
        /* Arrastou pouco e não passou do limiar: volta ao ângulo de
           onde saiu. */
        pvArrasto = 0;
        pvAssentar();
      }
    };

    pvStage.addEventListener('pointerdown', pvDown);
    pvStage.addEventListener('pointermove', pvMove);
    pvStage.addEventListener('pointerup', pvUp);
    pvStage.addEventListener('pointercancel', pvUp);

    /* `touch-action: pan-y` fica no CSS (.pv__stage): libera a
       rolagem vertical da página sobre o carro, mas reserva os
       gestos horizontais e a pinça para o visualizador. */

    /* ---------- Roda do mouse = zoom (desktop) ---------- */
    pvStage.addEventListener('wheel', function (e) {
      e.preventDefault();

      pvParar();
      pvEsconderDica();

      var passo = e.deltaY > 0 ? -0.12 : 0.12;
      pvSetZoom(pvZoom + passo);
    }, { passive: false });

    /* ---------- Pinça (mobile) ----------
       Diferente do arrasto: aqui o `touchAction` é none para o
       navegador não interpretar a pinça como zoom da página. */
    var pvPincaDist = 0;
    var pvPincaZoom = 1;

    var pvDist = function (a, b) {
      var dx = a.clientX - b.clientX;
      var dy = a.clientY - b.clientY;
      return Math.sqrt(dx * dx + dy * dy);
    };

    pvStage.addEventListener('touchstart', function (e) {
      if (e.touches.length !== 2) return;

      pvAtivo = false; /* a pinça cancela o arrasto de ângulo */
      pvPincaDist = pvDist(e.touches[0], e.touches[1]);
      pvPincaZoom = pvZoom;

      pvParar();
      pvEsconderDica();
    }, { passive: true });

    pvStage.addEventListener('touchmove', function (e) {
      if (e.touches.length !== 2 || !pvPincaDist) return;

      e.preventDefault();

      var dist = pvDist(e.touches[0], e.touches[1]);
      pvSetZoom(pvPincaZoom * (dist / pvPincaDist));
    }, { passive: false });

    var pvSoltarPinca = function () { pvPincaDist = 0; };
    pvStage.addEventListener('touchend', pvSoltarPinca);
    pvStage.addEventListener('touchcancel', pvSoltarPinca);

    /* ---------- Controles ---------- */
    var pvResetar = function () {
      pvSetZoom(1);
      pvIrPara(PV_INICIAL);
    };

    /* ---------- Teclado ----------
       O visualizador é focável e responde às setas, para quem não
       usa mouse nem toque. */
    pvStage.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft')       { pvParar(); pvEsconderDica(); pvIrPara(pvIndex - 1); }
      else if (e.key === 'ArrowRight') { pvParar(); pvEsconderDica(); pvIrPara(pvIndex + 1); }
      else if (e.key === '+' || e.key === '=') { pvSetZoom(pvZoom + ZOOM_STEP); }
      else if (e.key === '-' || e.key === '_') { pvSetZoom(pvZoom - ZOOM_STEP); }
      else if (e.key === '0') { pvResetar(); }
      else { return; }

      e.preventDefault();
    });

    /* Todo controle visível conta como "a pessoa assumiu": inclusive
       os botões de zoom. Sem o pvParar aqui, apertar "+" aproximava
       a imagem e o passeio automático continuava trocando de ângulo
       por baixo. */
    if (pvZoomIn) {
      pvZoomIn.addEventListener('click', function () {
        pvParar();
        pvEsconderDica();
        pvSetZoom(pvZoom + ZOOM_STEP);
      });
    }

    if (pvZoomOut) {
      pvZoomOut.addEventListener('click', function () {
        pvParar();
        pvEsconderDica();
        pvSetZoom(pvZoom - ZOOM_STEP);
      });
    }

    if (pvReset) {
      pvReset.addEventListener('click', function () {
        pvParar();
        pvEsconderDica();
        pvResetar();
      });
    }

    if (pvDots) {
      pvDots.addEventListener('click', function (e) {
        var alvo = e.target.closest('.pv__dot');
        if (!alvo) return;

        pvParar();
        pvEsconderDica();
        pvIrPara(parseInt(alvo.getAttribute('data-i'), 10));
      });
    }

    /* O duplo toque/clique devolve o zoom a 1x — atalho conhecido. */
    pvStage.addEventListener('dblclick', function () {
      pvParar();
      pvEsconderDica();
      pvSetZoom(pvTemZoom() ? 1 : ZOOM_MAX);
    });

    /* ---------- Pré-carregamento ----------
       Os oito arquivos entram em memória de uma vez, assim que o
       navegador fica livre. Sem isto, a primeira volta mostraria
       faixas do fundo do palco no lugar do carro enquanto cada
       arquivo desce do servidor — e o giro, que depende de trocar
       de imagem a cada ângulo, engasgaria justo no começo.

       É uma passada SÓ, no início. Durante o giro não há requisição
       nenhuma: cada arquivo já está decodificado, e trocar de quadro
       é só escrever `src` com uma string que o navegador já tem. Os
       oito são ~11 MB no total, o que é aceitável para o ganho — e
       o `requestIdleCallback` garante que isso não dispute banda nem
       CPU com o que a página precisa para aparecer.

       O laço cria um `Image` novo por arquivo em vez de usar um só:
       com um elemento só, cada `src` novo abortaria a decodificação
       do anterior e no fim restaria apenas o último arquivo em
       memória — exatamente o que não pode acontecer. */
    var pvPreparar = function () {
      for (var i = 0; i < pvCount; i++) {
        var img = new Image();
        img.decoding = 'async';
        img.src = pvData[i].src;
      }

      if (pvCarA) { pvCarA.decoding = 'async'; }
    };

    if (window.requestIdleCallback) {
      window.requestIdleCallback(pvPreparar, { timeout: 2000 });
    } else {
      window.setTimeout(pvPreparar, 600);
    }

    /* Pausa o passeio quando o visualizador sai de vista: nada de
       animação rodando fora da tela gastando bateria. */
    if ('IntersectionObserver' in window) {
      var pvObs = new IntersectionObserver(function (entradas) {
        if (!pvAutoplay) return;

        if (entradas[0].isIntersecting) {
          if (!pvTimer) pvSeguir();
        } else if (pvTimer) {
          window.clearInterval(pvTimer);
          pvTimer = null;
        }
      }, { threshold: 0.25 });

      pvObs.observe(viewer);
    }

    /* Aplica o estado inicial: o carro no ângulo de abertura. Não há
       mais nada a preparar — o cenário vem dentro da foto. */
    pvIrPara(PV_INICIAL);

    /* A folga do arrasto com zoom é escrita em px contra a largura do
       palco, então depende do tamanho dele. Se a janela mudar, ela é
       reescrita: sem isto, girar o celular ou redimensionar a janela
       deixaria a área ampliada fora de centro. Em 1x não há folga
       nenhuma e a chamada é inofensiva. */
    var pvRemedir = function () {
      pvAplicar();
    };

    window.addEventListener('resize', pvRemedir);

    /* A rotação do celular às vezes só muda as dimensões de fato
       depois deste evento. */
    window.addEventListener('orientationchange', function () {
      window.setTimeout(pvRemedir, 120);
    });

    if (pvAutoplay) { pvSeguir(); }

    /* Aba em segundo plano: o intervalo continua disparando e
       trocaria de ângulo sem ninguém ver. */
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) {
        if (pvTimer) { window.clearInterval(pvTimer); pvTimer = null; }
      } else if (pvAutoplay && !pvTimer) {
        pvSeguir();
      }
    });
  }

  /* ==========================================================
     7 · PONTE ENTRE A RESERVA E A ÁREA DO CLIENTE

     ISTO NÃO É BACKEND.

     É uma chave do `sessionStorage` — memória do próprio
     navegador, que morre quando a aba fecha. Serve para uma coisa
     só: quem monta uma solicitação no site vê essa solicitação na
     prévia da Área do Cliente, na mesma sessão do navegador. Não
     há servidor, banco, login nem reserva de verdade.

     O QUE NÃO ENTRA AQUI: nome, WhatsApp, CPF, documento, senha
     ou qualquer outro dado pessoal. Só a CONFIGURAÇÃO da locação
     — veículo, datas, formas de receber e devolver, endereço,
     proteção, adicionais e valores. `guardarDemo` copia campo por
     campo de propósito: assim um campo novo no formulário não
     vaza para o armazenamento sem alguém decidir que ele deve.

     O `try` existe porque `sessionStorage` pode estar bloqueado
     (navegação privativa, política do navegador). Sem ele, um erro
     aqui derrubaria a reserva inteira — e a reserva funciona sem
     esta ponte.
     ========================================================== */
  var CHAVE_DEMO = 'lokcar-demo-reserva';

  var lerDemo = function () {
    try {
      var cru = window.sessionStorage.getItem(CHAVE_DEMO);
      if (!cru) return null;
      var dado = JSON.parse(cru);
      return (dado && typeof dado === 'object') ? dado : null;
    } catch (e) {
      return null;
    }
  };

  var guardarDemo = function (resumo) {
    try {
      window.sessionStorage.setItem(CHAVE_DEMO, JSON.stringify(resumo));
      return true;
    } catch (e) {
      return false;
    }
  };

  var limparDemo = function () {
    try {
      window.sessionStorage.removeItem(CHAVE_DEMO);
    } catch (e) { /* sem armazenamento: não há o que limpar */ }
  };

  /* ==========================================================
     8 · ÁREA DO CLIENTE (demonstração)

     ATENÇÃO — não há autenticação nenhuma aqui.
     Nada é validado, nada é guardado, nada é enviado. O botão
     "Entrar" só confere se os campos estão vazios e abre a
     prévia da área logada. Nenhuma credencial existe no código,
     e nenhuma mensagem promete segurança que não existe.
     ========================================================== */
  var cli = document.getElementById('cli');

  if (cli) {
    var cliPanel    = document.getElementById('cliPanel');
    var cliLogin    = document.getElementById('cliLoginView');
    var cliArea     = document.getElementById('cliAreaView');
    var cliForm     = document.getElementById('cliForm');
    var cliEmail    = document.getElementById('cliEmail');
    var cliPass     = document.getElementById('cliPass');
    var cliEmailErr = document.getElementById('cliEmailError');
    var cliPassErr  = document.getElementById('cliPassError');
    var cliEye      = document.getElementById('cliEye');
    var cliForgot   = document.getElementById('cliForgot');
    var cliNote     = document.getElementById('cliNote');
    var cliSignout  = document.getElementById('cliSignout');
    var cliTabs     = document.getElementById('cliTabs');

    var cliDash     = document.getElementById('cliDash');
    var cliDashRes  = document.getElementById('cliDashRes');
    var cliDashRet  = document.getElementById('cliDashRet');
    var cliDashStatus = document.getElementById('cliDashStatus');
    var cliDashTotal  = document.getElementById('cliDashTotal');

    var cliRes         = document.getElementById('cliRes');
    var cliResMedia    = document.getElementById('cliResMedia');
    var cliResTag      = document.getElementById('cliResTag');
    var cliResTitle    = document.getElementById('cliResTitle');
    var cliResFacts    = document.getElementById('cliResFacts');
    var cliResStub     = document.getElementById('cliResStub');

    var cliDocSend  = document.getElementById('cliDocSend');
    var cliDocNote  = document.getElementById('cliDocNote');
    var cliSupNote  = document.getElementById('cliSupNote');
    var cliEdit     = document.getElementById('cliEdit');

    var focoAnterior = null;

    /* ---------- Formatação de dinheiro ----------
       A seção da reserva declara `formatBRL` dentro do próprio
       bloco, e aquele bloco sai cedo (`if (!picker || !CFG) return`)
       quando a reserva não existe. Esta cópia local garante que a
       Área do Cliente continue formatando mesmo naquele caso —
       em vez de depender de uma função que pode não ter nascido. */
    var cliBRL = function (valor) {
      var n = Math.round(Number(valor) || 0);
      var s = String(Math.abs(n));
      var out = '';

      while (s.length > 3) {
        out = '.' + s.slice(-3) + out;
        s = s.slice(0, -3);
      }

      return (n < 0 ? '-' : '') + 'R$ ' + s + out + ',00';
    };

    /* ---------- A prévia lê a solicitação montada no site ----------
       O que chega aqui é a CONFIGURAÇÃO da locação, guardada no
       `sessionStorage`. Não há nome, telefone, documento nem senha
       nesse objeto — ver `guardarDemo`, que copia campo por campo.
       Sem solicitação, a tela mostra um exemplo e diz que é exemplo. */
    var renderCliReserva = function () {
      var demo = lerDemo();
      var temDemo = Boolean(demo && demo.modelo);

      /* ---------- Estado: sem solicitação montada ---------- */
      if (!temDemo) {
        if (cliDashRes) cliDashRes.textContent = 'Nenhuma';
        if (cliDashRet) cliDashRet.textContent = '—';
        if (cliDashStatus) cliDashStatus.textContent = 'Sem solicitação';
        if (cliDashTotal) cliDashTotal.textContent = '—';

        if (cliResMedia) {
          cliResMedia.style.backgroundImage = '';
        }
        if (cliResTag) cliResTag.textContent = 'Exemplo';
        if (cliResTitle) cliResTitle.textContent = 'Veículo de demonstração';
        if (cliResFacts) {
          cliResFacts.innerHTML =
            '<div><dt>Período</dt><dd>Exemplo · 3 dias</dd></div>' +
            '<div><dt>Status da solicitação</dt>' +
              '<dd><span class="cli__status">Aguardando confirmação</span></dd></div>';
        }
        if (cliResStub) {
          cliResStub.textContent =
            'Reserva fictícia, criada só para ilustrar esta tela. Monte uma ' +
            'solicitação no site e ela aparece aqui com o veículo, o período ' +
            'e os valores que você escolheu.';
        }

        return;
      }

      /* ---------- Estado: solicitação montada nesta sessão ---------- */
      if (cliDashRes) cliDashRes.textContent = demo.modelo;
      if (cliDashRet) cliDashRet.textContent = demo.deTxt || '—';
      if (cliDashStatus) cliDashStatus.textContent = 'Aguardando confirmação';
      if (cliDashTotal) {
        cliDashTotal.textContent = demo.dias > 0 ? cliBRL(demo.total) : '—';
      }

      if (cliResMedia && demo.img) {
        /* A foto entra como FUNDO, e não como <img>: o cartão já
           tem uma moldura desenhada em CSS, e uma <img> por cima
           exigiria reescrever o layout do cartão inteiro. */
        cliResMedia.style.backgroundImage =
          'linear-gradient(160deg, rgba(10,12,17,0.25) 0%, rgba(10,12,17,0.75) 100%), url("' +
          String(demo.img).replace(/"/g, '%22') + '")';
        cliResMedia.style.backgroundSize = 'cover';
        cliResMedia.style.backgroundPosition = 'center';
      }

      if (cliResTag) cliResTag.textContent = 'Sua solicitação';
      if (cliResTitle) cliResTitle.textContent = demo.modelo;

      if (cliResFacts) {
        var linhas = [];

        if (demo.categoria) {
          linhas.push(['Categoria', demo.categoria]);
        }

        linhas.push(['Período', (demo.deTxt || '—') + ' → ' + (demo.ateTxt || '—')]);
        linhas.push(['Dias', demo.dias > 0 ? String(demo.dias) : '—']);
        linhas.push(['Forma de recebimento', demo.recebimento || '—']);

        /* Cada linha só entra quando tem o que dizer: um "—" no
           meio de uma ficha de reserva parece campo quebrado, não
           campo vazio. */
        if (demo.enderecoEntrega) {
          linhas.push(['Endereço de entrega', demo.enderecoEntrega]);
        }

        linhas.push(['Forma de devolução', demo.devolucao || '—']);

        if (demo.enderecoDevolucao) {
          linhas.push(['Endereço de devolução', demo.enderecoDevolucao]);
        }

        if (demo.protecao) {
          linhas.push(['Proteção', demo.protecao]);
        }

        if (demo.adicionais && demo.adicionais.length) {
          linhas.push(['Adicionais', demo.adicionais.map(function (a) {
            return a.nome + (a.qtd > 1 ? ' (' + a.qtd + '×)' : '');
          }).join(' · ')]);
        }

        if (demo.taxa > 0) {
          linhas.push(['Taxa de entrega', cliBRL(demo.taxa)]);
        }

        if (demo.subtotal > 0 && demo.subtotal !== demo.total) {
          linhas.push(['Subtotal', cliBRL(demo.subtotal)]);
        }

        linhas.push(['Total estimado', demo.dias > 0 ? cliBRL(demo.total) : '—']);

        cliResFacts.innerHTML = '';

        linhas.forEach(function (par) {
          var div = document.createElement('div');
          var dt = document.createElement('dt');
          var dd = document.createElement('dd');

          dt.textContent = par[0];
          dd.textContent = par[1];

          div.appendChild(dt);
          div.appendChild(dd);
          cliResFacts.appendChild(div);
        });

        /* O status entra por último, sempre — é o campo que a
           pessoa procura primeiro. Montado por DOM e não por
           innerHTML: o texto vem do `cli__status`, uma classe
           fixa, e assim nada aqui depende de string interpretada. */
        var divStatus = document.createElement('div');
        var dtStatus = document.createElement('dt');
        var ddStatus = document.createElement('dd');
        var spanStatus = document.createElement('span');

        dtStatus.textContent = 'Status da solicitação';
        spanStatus.className = 'cli__status';
        spanStatus.textContent = 'Aguardando confirmação';

        ddStatus.appendChild(spanStatus);
        divStatus.appendChild(dtStatus);
        divStatus.appendChild(ddStatus);
        cliResFacts.appendChild(divStatus);
      }

      if (cliResStub) {
        cliResStub.textContent =
          'Solicitação demonstrativa desta sessão. Nenhuma reserva foi ' +
          'confirmada, nenhum pagamento foi feito e nenhum valor foi cobrado — ' +
          'a equipe Lok Car confirma disponibilidade, condições e valores.';
      }
    };

    /* ---------- Abrir e fechar ---------- */
    var abrirCli = function () {
      focoAnterior = document.activeElement;

      cli.hidden = false;
      document.body.classList.add('is-locked');

      /* Sempre volta ao login: a prévia é sessão de demonstração,
         não estado que sobrevive ao fechamento. */
      mostrarLogin();

      /* O foco vai para o primeiro campo — não para o botão de
         fechar, que é o que o usuário menos quer agora. */
      if (cliEmail) cliEmail.focus();
    };

    var fecharCli = function () {
      cli.hidden = true;
      document.body.classList.remove('is-locked');

      if (focoAnterior && typeof focoAnterior.focus === 'function') {
        focoAnterior.focus();
      }
      focoAnterior = null;
    };

    var mostrarLogin = function () {
      if (cliLogin) cliLogin.hidden = false;
      if (cliArea) cliArea.hidden = true;
      if (cliPanel) cliPanel.classList.remove('is-area');
      if (cliNote) cliNote.hidden = true;
      limparErros();
    };

    var mostrarArea = function () {
      if (cliLogin) cliLogin.hidden = true;
      if (cliArea) cliArea.hidden = false;
      if (cliPanel) cliPanel.classList.add('is-area');

      /* A prévia é remontada a cada entrada: se a solicitação foi
         feita depois da última vez que a área abriu, ela aparece
         agora. */
      renderCliReserva();

      /* As notas de suporte e documento são de um clique anterior
         e não devem reaparecer. */
      if (cliSupNote) cliSupNote.hidden = true;
      if (cliDocNote) cliDocNote.hidden = true;

      /* Volta para a primeira aba: quem entra de novo não deve
         cair numa aba interna que ficou aberta da vez anterior. */
      trocarAba('reservas');

      var primeiroTab = cliTabs ? cliTabs.querySelector('.cli__tab') : null;
      if (primeiroTab) primeiroTab.focus();
    };

    /* ---------- Validação visual (só campo vazio) ---------- */
    var marcar = function (campo, msg, erro) {
      if (campo) campo.closest('.cli__field').classList.toggle('is-bad', erro);
      if (msg) msg.hidden = !erro;
    };

    var limparErros = function () {
      if (cliEmail) marcar(cliEmail, cliEmailErr, false);
      if (cliPass) marcar(cliPass, cliPassErr, false);
    };

    /* Sem campo no HTML não há o que validar — e o botão não deve
       abrir a prévia, senão a checagem de vazio deixaria de existir
       em silêncio. */
    var validar = function () {
      if (!cliEmail || !cliPass) return false;

      var semEmail = !cliEmail.value.trim();
      var semSenha = !cliPass.value;

      marcar(cliEmail, cliEmailErr, semEmail);
      marcar(cliPass, cliPassErr, semSenha);

      return !semEmail && !semSenha;
    };

    /* Limpa o aviso assim que a pessoa começa a corrigir */
    if (cliEmail) {
      cliEmail.addEventListener('input', function () {
        if (cliEmail.value.trim()) marcar(cliEmail, cliEmailErr, false);
      });
    }

    if (cliPass) {
      cliPass.addEventListener('input', function () {
        if (cliPass.value) marcar(cliPass, cliPassErr, false);
      });
    }

    /* ---------- Mostrar / ocultar senha ---------- */
    if (cliEye && cliPass) {
      cliEye.addEventListener('click', function () {
        var visivel = cliPass.type === 'password';

        cliPass.type = visivel ? 'text' : 'password';
        cliEye.classList.toggle('is-on', visivel);
        cliEye.setAttribute('aria-pressed', String(visivel));
        cliEye.setAttribute('aria-label', visivel ? 'Ocultar senha' : 'Mostrar senha');

        /* O foco volta para o campo: quem toca no olho normalmente
           quer continuar digitando. */
        cliPass.focus();
      });
    }

    /* ---------- Entrar ---------- */
    if (cliForm) {
      cliForm.addEventListener('submit', function (e) {
        /* Sem backend: o envio de formulário não deve recarregar
           a página nem navegar para lugar nenhum. */
        e.preventDefault();

        if (!validar()) {
          var primeiro = cliEmail && !cliEmail.value.trim() ? cliEmail : cliPass;
          if (primeiro) primeiro.focus();
          return;
        }

        mostrarArea();
      });
    }

    /* ---------- Esqueceu a senha ---------- */
    if (cliForgot) {
      cliForgot.addEventListener('click', function () {
        if (!cliNote) return;

        cliNote.textContent =
          'Na versão final, enviaremos um link de redefinição para o seu e-mail. ' +
          'Aqui é apenas demonstração — nenhuma mensagem é enviada.';

        cliNote.hidden = false;
      });
    }

    /* ---------- Abas da área do cliente ---------- */
    /* Troca de aba.

       Tabindex móvel: só a aba ativa fica alcançável pelo Tab, e
       as setas andam entre as abas — é o comportamento que um
       `role="tablist"` promete a quem usa leitor de tela. Sem
       isto, o Tab pararia nas cinco abas antes de chegar ao
       conteúdo. `focar` existe para a seta levar o foco junto. */
    var trocarAba = function (nome, focar) {
      if (cliTabs) {
        cliTabs.querySelectorAll('.cli__tab').forEach(function (tab) {
          var ativo = tab.getAttribute('data-tab') === nome;
          tab.classList.toggle('is-on', ativo);
          tab.setAttribute('aria-selected', String(ativo));
          tab.setAttribute('tabindex', ativo ? '0' : '-1');
          if (ativo && focar) tab.focus();
        });
      }

      cli.querySelectorAll('.cli__pane').forEach(function (pane) {
        pane.hidden = pane.getAttribute('data-pane') !== nome;
      });
    };

    if (cliTabs) {
      cliTabs.addEventListener('click', function (e) {
        var tab = e.target.closest('.cli__tab');
        if (tab) trocarAba(tab.getAttribute('data-tab'));
      });

      cliTabs.addEventListener('keydown', function (e) {
        var teclas = ['ArrowRight', 'ArrowLeft', 'Home', 'End'];

        if (teclas.indexOf(e.key) < 0) return;

        var abas = Array.prototype.slice.call(cliTabs.querySelectorAll('.cli__tab'));
        if (!abas.length) return;

        var atual = abas.indexOf(e.target.closest('.cli__tab'));
        if (atual < 0) return;

        var proximo = atual;

        if (e.key === 'ArrowRight')     proximo = (atual + 1) % abas.length;
        else if (e.key === 'ArrowLeft') proximo = (atual - 1 + abas.length) % abas.length;
        else if (e.key === 'Home')      proximo = 0;
        else                            proximo = abas.length - 1;

        /* A seta não deve rolar a página junto. */
        e.preventDefault();
        trocarAba(abas[proximo].getAttribute('data-tab'), true);
      });
    }

    /* ---------- Histórico: ver detalhes ---------- */
    cli.querySelectorAll('.cli__histMore').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var card = btn.closest('.cli__histCard');
        var det = card ? card.querySelector('.cli__histDet') : null;
        if (!det) return;

        var abrir = det.hidden;

        det.hidden = !abrir;
        btn.setAttribute('aria-expanded', String(abrir));
        btn.textContent = abrir ? 'Ocultar detalhes' : 'Ver detalhes';
      });
    });

    /* ---------- Meus dados: editar ----------
       Sem servidor não há onde salvar. O aviso diz exatamente
       isso, em vez de fingir um editor que não existe. */
    if (cliEdit) {
      cliEdit.addEventListener('click', function () {
        if (cliSupNote) {
          cliSupNote.hidden = true;
        }

        var alvo = document.getElementById('cliEditNote');

        if (!alvo) {
          alvo = document.createElement('p');
          alvo.className = 'cli__hintText';
          alvo.id = 'cliEditNote';
          alvo.setAttribute('role', 'status');
          cliEdit.parentNode.insertBefore(alvo, cliEdit.nextSibling);
        }

        alvo.textContent =
          'A edição de dados faz parte da versão completa do sistema. ' +
          'Nesta prévia os campos ficam como exemplo e nada é guardado.';
        alvo.hidden = false;
      });
    }

    /* ---------- Documentos: enviar ----------
       O botão NÃO abre seletor de arquivo: sem servidor, o arquivo
       não teria para onde ir. Ele informa onde a função existe. */
    if (cliDocSend) {
      cliDocSend.addEventListener('click', function () {
        if (!cliDocNote) return;

        cliDocNote.textContent =
          'Funcionalidade disponível na versão completa do sistema. ' +
          'Nesta demonstração nenhum arquivo é enviado nem guardado.';
        cliDocNote.hidden = false;
      });
    }

    /* ---------- Suporte: as três ações que não são WhatsApp ---------- */
    var NOTAS_SUPORTE = {
      duvida: 'Na versão completa, as dúvidas sobre a reserva ficam registradas aqui, ' +
              'junto com o histórico do atendimento. Nesta prévia, fale com a gente ' +
              'pelo WhatsApp — o número está acima.',
      alterar: 'Datas, veículo e forma de recebimento podem ser alterados enquanto a ' +
               'reserva não estiver confirmada. Nesta prévia, fale com a nossa equipe ' +
               'pelo WhatsApp para combinar a mudança.',
      ajuda: 'Conte o que você precisa pelo WhatsApp e a nossa equipe responde. ' +
             'No sistema completo, este pedido também fica registrado na sua conta.'
    };

    cli.querySelectorAll('[data-sup]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        if (!cliSupNote) return;

        var chave = btn.getAttribute('data-sup');
        cliSupNote.textContent = NOTAS_SUPORTE[chave] || NOTAS_SUPORTE.ajuda;
        cliSupNote.hidden = false;
      });
    });

    /* ---------- Sair ----------
       A sessão demonstrativa termina aqui: o rascunho guardado some
       junto. Não é autenticação — é só o fim da simulação. */
    if (cliSignout) {
      cliSignout.addEventListener('click', function () {
        limparDemo();
        if (cliPass) cliPass.value = '';
        if (cliPass) cliPass.type = 'password';
        if (cliEye) {
          cliEye.classList.remove('is-on');
          cliEye.setAttribute('aria-pressed', 'false');
          cliEye.setAttribute('aria-label', 'Mostrar senha');
        }

        mostrarLogin();

        if (cliEmail) cliEmail.focus();
      });
    }

    /* ---------- Gatilhos: header desktop e menu mobile ---------- */
    document.querySelectorAll('[data-open-login]').forEach(function (el) {
      el.addEventListener('click', function () {
        /* Se o menu mobile estiver aberto, ele sai de cena antes —
           senão ficaria por cima do overlay. */
        closeMenu();
        abrirCli();
      });
    });

    /* ---------- Fechar: X, fundo e "Voltar para o site" ---------- */
    document.querySelectorAll('[data-close-cli]').forEach(function (el) {
      el.addEventListener('click', fecharCli);
    });

    /* ---------- Foco preso no painel ----------
       O overlay se anuncia como modal (`aria-modal="true"`), então
       precisa se comportar como um: sem isto, o Tab escaparia para
       os links da página atrás do fundo escurecido — que o leitor
       de tela já não deveria alcançar. */
    var focaveis = function () {
      var lista = cli.querySelectorAll(
        'a[href], button:not([disabled]), input:not([disabled]), ' +
        'select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );

      /* Só o que está de fato visível: os dois estados do painel
         (login e prévia) convivem no DOM, com `hidden` alternando.
         getClientRects() é o teste que não mente — devolve vazio
         para qualquer elemento que não gere caixa, inclusive
         quando o `hidden` está num ancestral. */
      return Array.prototype.filter.call(lista, function (el) {
        return el.getClientRects().length > 0;
      });
    };

    document.addEventListener('keydown', function (e) {
      if (cli.hidden) return;

      if (e.key === 'Escape') {
        fecharCli();
        return;
      }

      if (e.key !== 'Tab') return;

      var itens = focaveis();

      if (itens.length === 0) {
        e.preventDefault();
        return;
      }

      var primeiro = itens[0];
      var ultimo = itens[itens.length - 1];
      var ativo = document.activeElement;

      if (e.shiftKey && (ativo === primeiro || !cli.contains(ativo))) {
        e.preventDefault();
        ultimo.focus();
      } else if (!e.shiftKey && (ativo === ultimo || !cli.contains(ativo))) {
        e.preventDefault();
        primeiro.focus();
      }
    });
  }

  /* ==========================================================
     8 · DEMONSTRAÇÃO DA RESERVA
     ========================================================== */
  var picker = document.getElementById('bkPicker');

  if (!picker || !CFG) return;

  var WHATSAPP = '5581997530453';

  var els = {
    picks:       Array.prototype.slice.call(picker.querySelectorAll('.bk__pick')),
    prots:       document.getElementById('bkProts'),
    adds:        document.getElementById('bkAdds'),

    period:      document.getElementById('bkPeriod'),
    periodFrom:  document.getElementById('bkPeriodFrom'),
    periodTo:    document.getElementById('bkPeriodTo'),
    periodDays:  document.getElementById('bkPeriodDays'),

    calToggle:   document.getElementById('bkCalToggle'),
    calLabel:    document.getElementById('bkCalToggleLabel'),
    cal:         document.getElementById('bkCalendar'),
    calMonth:    document.getElementById('bkCalMonth'),
    calGrid:     document.getElementById('bkCalGrid'),
    calPrev:     document.getElementById('bkCalPrev'),
    calNext:     document.getElementById('bkCalNext'),
    calHint:     document.getElementById('bkCalHint'),
    calClear:    document.getElementById('bkCalClear'),

    /* Retirada e devolução */
    receber:      document.getElementById('bkReceber'),
    devolver:     document.getElementById('bkDevolver'),
    receberNota:  document.getElementById('bkReceberNota'),
    devolverNota: document.getElementById('bkDevolverNota'),

    endWrap:     document.getElementById('bkEndWrap'),
    cep:         document.getElementById('bkCep'),
    rua:         document.getElementById('bkRua'),
    num:         document.getElementById('bkNum'),
    comp:        document.getElementById('bkComp'),
    bairro:      document.getElementById('bkBairro'),
    cidade:      document.getElementById('bkCidade'),
    uf:          document.getElementById('bkUf'),
    ref:         document.getElementById('bkRef'),

    devWrap:     document.getElementById('bkDevWrap'),
    mesmoWrap:   document.getElementById('bkMesmoWrap'),
    mesmo:       document.getElementById('bkMesmo'),
    devGrid:     document.getElementById('bkDevGrid'),
    devCep:      document.getElementById('bkDevCep'),
    devRua:      document.getElementById('bkDevRua'),
    devNum:      document.getElementById('bkDevNum'),
    devComp:     document.getElementById('bkDevComp'),
    devBairro:   document.getElementById('bkDevBairro'),
    devCidade:   document.getElementById('bkDevCidade'),
    devUf:       document.getElementById('bkDevUf'),
    devRef:      document.getElementById('bkDevRef'),

    /* Ficha do veículo escolhido */
    info:        document.getElementById('bkInfo'),
    infoImg:     document.getElementById('bkInfoImg'),
    infoTag:     document.getElementById('bkInfoTag'),
    infoName:    document.getElementById('bkInfoName'),
    infoCat:     document.getElementById('bkInfoCat'),
    infoCambio:  document.getElementById('bkInfoCambio'),
    infoLugares: document.getElementById('bkInfoLugares'),
    infoAr:      document.getElementById('bkInfoAr'),
    infoDiaria:  document.getElementById('bkInfoDiaria'),
    infoNote:    document.getElementById('bkInfoNote'),

    /* O que a locação inclui */
    inclusos:     document.getElementById('bkInclusos'),
    inclusosNote: document.getElementById('bkInclusosNote'),

    name:        document.getElementById('bkName'),
    phone:       document.getElementById('bkPhone'),
    hint:        document.getElementById('bkDateHint'),

    sumMedia:    document.getElementById('bkSumMedia'),
    sumModel:    document.getElementById('bkSumModel'),
    sumPeriod:   document.getElementById('bkSumPeriod'),
    sumDays:     document.getElementById('bkSumDays'),
    sumReceb:    document.getElementById('bkSumReceb'),
    sumEnd:      document.getElementById('bkSumEnd'),
    sumEndRow:   document.getElementById('bkSumEndRow'),
    sumDev:      document.getElementById('bkSumDev'),
    sumDiarias:  document.getElementById('bkSumDiarias'),
    sumDiscount: document.getElementById('bkSumDiscount'),
    sumProt:     document.getElementById('bkSumProt'),
    sumAdds:     document.getElementById('bkSumAdds'),
    sumTaxa:     document.getElementById('bkSumTaxa'),
    sumTaxaRow:  document.getElementById('bkSumTaxaRow'),
    sumSubtotal: document.getElementById('bkSumSubtotal'),
    sumTotal:    document.getElementById('bkSumTotal'),

    send:        document.getElementById('bkSend'),
    done:        document.getElementById('bkDone'),
    doneWa:      document.getElementById('bkDoneWa'),
    doneCli:     document.getElementById('bkDoneCli')
  };

  var state = {
    model: '',
    img: '',
    /* Ficha do carro escolhido, lida dos data-* do botão. */
    ficha: { cat: '', cambio: '', lugares: '', ar: '' },
    from: null,
    to: null,
    days: 0,
    recebimento: '',
    devolucao: '',
    /* Endereço da entrega e, quando for outro lugar, o da
       devolução. Só vivem na memória da página: nada é salvo. */
    endereco:    { cep: '', rua: '', num: '', comp: '', bairro: '', cidade: '', uf: '', ref: '' },
    devEndereco: { cep: '', rua: '', num: '', comp: '', bairro: '', cidade: '', uf: '', ref: '' },
    mesmoEndereco: true,
    protecao: '',
    /* Mapa id → quantidade. Antes era uma lista de ids; com o
       controle de quantidade no card, cada adicional precisa do
       número escolhido junto. */
    adicionais: {}
  };

  /* Calendário: qual mês está à vista e se já houve um clique
     de retirada esperando a devolução. */
  var cal = {
    view: null,
    picking: 'from'   /* 'from' = escolhendo retirada, 'to' = devolução */
  };

  /* ---------- Formatação ---------- */
  var MESES_CURTO = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun',
                     'jul', 'ago', 'set', 'out', 'nov', 'dez'];

  var MESES_LONGO = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
                     'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];

  /* R$ 1.812,00 */
  var formatBRL = function (valor) {
    var n = Math.round(Number(valor) || 0);
    var s = String(Math.abs(n));
    var out = '';
    while (s.length > 3) {
      out = '.' + s.slice(-3) + out;
      s = s.slice(0, -3);
    }
    out = s + out;
    return (n < 0 ? '-' : '') + 'R$ ' + out + ',00';
  };

  /* R$ 400–600 (faixa do card) — declarada no topo do arquivo */
  var formatBR = function (date) {
    if (!date) return '—';
    var d = String(date.getDate()).padStart(2, '0');
    var m = String(date.getMonth() + 1).padStart(2, '0');
    return d + '/' + m + '/' + date.getFullYear();
  };

  /* 18 set */
  var formatDiaCurto = function (date) {
    if (!date) return '—';
    return date.getDate() + ' ' + MESES_CURTO[date.getMonth()];
  };

  var formatDias = function (dias) {
    if (!dias || dias <= 0) return '—';
    return dias === 1 ? '1 dia' : dias + ' dias';
  };

  /* ---------- Utilidades de data ---------- */
  var hoje = function () {
    var d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  };

  var toISODate = function (date) {
    var m = String(date.getMonth() + 1).padStart(2, '0');
    var d = String(date.getDate()).padStart(2, '0');
    return date.getFullYear() + '-' + m + '-' + d;
  };

  var dayDiff = function (a, b) {
    var MS = 24 * 60 * 60 * 1000;
    var a0 = new Date(a.getFullYear(), a.getMonth(), a.getDate());
    var b0 = new Date(b.getFullYear(), b.getMonth(), b.getDate());
    return Math.round((b0 - a0) / MS);
  };

  var mesmoDia = function (a, b) {
    return Boolean(a && b) &&
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate();
  };

  /* ==========================================================
     PROTEÇÕES — construídas a partir da config

     Cada card tem o nome, o valor por dia, uma linha curta e o
     botão "Ver detalhes". Os detalhes ficam FECHADOS por padrão:
     quatro cards com seis linhas abertos de uma vez virariam uma
     parede de texto, e o que a pessoa precisa primeiro é escolher.
     ========================================================== */
  var renderProtecoes = function () {
    if (!els.prots) return;

    els.prots.innerHTML = '';

    CFG.protecoes.forEach(function (p) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'bk__prot';
      btn.setAttribute('role', 'radio');
      btn.setAttribute('aria-checked', String(p.id === state.protecao));

      var preco = p.valorDia > 0
        ? '+ ' + formatBRL(p.valorDia).replace(',00', '') + ' /dia'
        : 'Incluída';

      btn.innerHTML =
        '<span class="bk__protTop">' +
          '<span class="bk__protName"></span>' +
          '<span class="bk__protPrice"></span>' +
        '</span>' +
        '<span class="bk__protDesc"></span>' +
        '<span class="bk__protMore"></span>' +
        '<ul class="bk__protDet"></ul>';

      btn.querySelector('.bk__protName').textContent = p.nome;
      btn.querySelector('.bk__protPrice').textContent = preco;
      btn.querySelector('.bk__protDesc').textContent = p.descricao;

      var mais = btn.querySelector('.bk__protMore');
      var det = btn.querySelector('.bk__protDet');
      var aberto = false;

      var marcarMais = function () {
        btn.classList.toggle('is-open', aberto);
        mais.textContent = aberto ? 'Ocultar detalhes' : 'Ver detalhes';
        mais.setAttribute('aria-expanded', String(aberto));
      };

      /* Sem detalhes na config, o botão não existe — melhor do que
         um "Ver detalhes" que abre um bloco vazio. */
      if (p.detalhes && p.detalhes.length) {
        p.detalhes.forEach(function (linha) {
          var li = document.createElement('li');
          li.textContent = linha;
          det.appendChild(li);
        });
        marcarMais();
      } else {
        mais.hidden = true;
      }

      /* O card inteiro ESCOLHE a proteção — inclusive o botão de
         detalhes. Por isso o clique no "Ver detalhes" só alterna a
         abertura e não deixa o evento subir: quem quer ler detalhes
         não está necessariamente escolhendo aquela opção. */
      mais.addEventListener('click', function (e) {
        e.stopPropagation();
        aberto = !aberto;
        marcarMais();
      });

      btn.addEventListener('click', function () {
        state.protecao = p.id;
        esconderConfirmacao();
        renderProtecoes();
        render();
      });

      els.prots.appendChild(btn);
    });
  };

  /* ==========================================================
     ADICIONAIS — construídos a partir da config

     Adicional com `permiteQtd` ganha o controle − n +. Sem ele,
     o card continua sendo só liga/desliga. O preço do card mostra
     o valor UNITÁRIO; a multiplicação aparece no resumo, que é
     onde a conta precisa ficar visível.
     ========================================================== */
  var renderAdicionais = function () {
    if (!els.adds) return;

    els.adds.innerHTML = '';

    CFG.adicionais.forEach(function (a) {
      var qtd = state.adicionais[a.id] || 0;
      var marcado = qtd > 0;

      var label = document.createElement('label');
      label.className = 'bk__add' + (marcado ? ' is-on' : '');

      var preco = a.sobConsulta
        ? CFG.textos.rotuloSobConsulta
        : formatBRL(a.valorFixo).replace(',00', '');

      label.innerHTML =
        '<input class="bk__addInput" type="checkbox" value="" />' +
        '<span class="bk__addSwitch" aria-hidden="true"></span>' +
        '<span class="bk__addText">' +
          '<span class="bk__addName"></span>' +
          '<span class="bk__addDesc"></span>' +
        '</span>' +
        '<span class="bk__addPrice"></span>';

      var input = label.querySelector('.bk__addInput');
      input.checked = marcado;
      input.setAttribute('aria-label', a.nome);

      label.querySelector('.bk__addName').textContent = a.nome;
      label.querySelector('.bk__addDesc').textContent = a.descricao;
      label.querySelector('.bk__addPrice').textContent = preco;

      input.addEventListener('change', function () {
        if (input.checked) {
          state.adicionais[a.id] = state.adicionais[a.id] || 1;
        } else {
          delete state.adicionais[a.id];
        }

        esconderConfirmacao();
        label.classList.toggle('is-on', input.checked);
        renderAdicionais();
        render();
      });

      /* O controle de quantidade é IRMÃO do <label>, e os dois
         ficam dentro de uma linha própria (`.bk__addRow`). Dentro
         do label, um clique em "−" viraria clique no label e o
         adicional ligaria/desligaria junto com o passo. */
      var linha = document.createElement('div');
      linha.className = 'bk__addRow' + (marcado ? ' is-on' : '');
      linha.appendChild(label);

      if (a.permiteQtd) {
        var max = a.maxQtd || 9;
        var ctrl = document.createElement('span');
        ctrl.className = 'bk__addQtd';
        ctrl.innerHTML =
          '<button class="bk__addStep" type="button" data-passo="-1" aria-label="Diminuir"></button>' +
          '<span class="bk__addQtdVal"></span>' +
          '<button class="bk__addStep" type="button" data-passo="1" aria-label="Aumentar"></button>';

        var val = ctrl.querySelector('.bk__addQtdVal');
        var menos = ctrl.querySelector('[data-passo="-1"]');
        var maisQ = ctrl.querySelector('[data-passo="1"]');

        var qAtual = state.adicionais[a.id] || 0;

        val.textContent = String(marcado ? qAtual : 0);
        menos.textContent = '−';
        maisQ.textContent = '+';

        menos.disabled = !marcado || qAtual <= 1;
        maisQ.disabled = !marcado || qAtual >= max;

        ctrl.addEventListener('click', function (e) {
          /* O clique no controle nunca chega ao <label> — senão o
             adicional ligaria/desligaria junto com o passo. */
          e.preventDefault();
          e.stopPropagation();

          var passo = e.target.closest('[data-passo]');
          if (!passo) return;

          var n = state.adicionais[a.id] || 0;
          n += Number(passo.getAttribute('data-passo'));

          if (n < 1) { n = 1; }
          if (n > max) { n = max; }

          state.adicionais[a.id] = n;
          renderAdicionais();
          render();
        });

        linha.appendChild(ctrl);
      }

      els.adds.appendChild(linha);
    });
  };

  /* ==========================================================
     LISTA DO QUE A LOCAÇÃO INCLUI e ficha do veículo
     ========================================================== */
  var renderInclusos = function () {
    if (els.inclusosNote) {
      els.inclusosNote.textContent = CFG.textos.rotuloCondicoes;
    }

    if (!els.inclusos) return;

    els.inclusos.innerHTML = '';

    CFG.inclusos.forEach(function (texto) {
      var li = document.createElement('li');
      li.className = 'bk__incItem';
      li.innerHTML =
        '<svg class="bk__incMark" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' +
          '<path d="M4 12.6 L9.5 18 L20 6.6" />' +
        '</svg>' +
        '<span></span>';
      li.lastChild.textContent = texto;
      els.inclusos.appendChild(li);
    });
  };

  var renderInfo = function () {
    if (!els.info) return;

    if (!state.model) {
      els.info.hidden = true;
      return;
    }

    els.info.hidden = false;

    if (els.infoName) els.infoName.textContent = state.model;

    if (els.infoImg) {
      /* Só reatribui quando o arquivo muda: reescrever a mesma
         string a cada render faria a foto piscar. */
      if (els.infoImg.getAttribute('src') !== state.img) {
        els.infoImg.src = state.img;
      }
      els.infoImg.alt = state.model;
    }

    /* Onde o dado não existe, o campo diz "Não informado" em vez
       de inventar especificação técnica do veículo. */
    var f = state.ficha;
    var ou = function (v) { return v || 'Não informado'; };

    if (els.infoCat) els.infoCat.textContent = ou(f.cat);
    if (els.infoCambio) els.infoCambio.textContent = ou(f.cambio);
    if (els.infoLugares) els.infoLugares.textContent = ou(f.lugares);
    if (els.infoAr) els.infoAr.textContent = f.ar === 'Sim' ? 'Sim'
      : (f.ar === 'Não' ? 'Não' : 'Não informado');

    var diaria = CFG.getDiaria(state.model);

    if (els.infoDiaria) {
      els.infoDiaria.textContent = diaria > 0
        ? formatBRL(diaria).replace(',00', '') + ' /dia'
        : CFG.textos.rotuloSobConsulta;
    }

    if (els.infoNote) els.infoNote.textContent = CFG.textos.rotuloFicha;
  };

  /* ==========================================================
     ENDEREÇO — leitura e escrita dos campos

     Um só lugar que sabe ler um bloco de endereço e outro que
     sabe escrever. Antes seriam quatro blocos de sete campos
     copiados; aqui, se um campo novo entrar, entra uma vez.
     ========================================================== */
  var CAMPOS_ENDERECO = ['cep', 'rua', 'num', 'comp', 'bairro', 'cidade', 'uf', 'ref'];

  var EL_ENDERECO = {
    cep: 'cep', rua: 'rua', num: 'num', comp: 'comp',
    bairro: 'bairro', cidade: 'cidade', uf: 'uf', ref: 'ref'
  };

  var EL_DEV = {
    cep: 'devCep', rua: 'devRua', num: 'devNum', comp: 'devComp',
    bairro: 'devBairro', cidade: 'devCidade', uf: 'devUf', ref: 'devRef'
  };

  var lerEndereco = function (mapa) {
    var saida = {};

    CAMPOS_ENDERECO.forEach(function (campo) {
      var el = els[mapa[campo]];
      saida[campo] = el ? el.value.trim() : '';
    });

    return saida;
  };

  var escreverEndereco = function (mapa, dados) {
    CAMPOS_ENDERECO.forEach(function (campo) {
      var el = els[mapa[campo]];
      if (el) el.value = (dados && dados[campo]) || '';
    });
  };

  /* Um endereço só conta como preenchido quando dá para alguém
     chegar lá: rua E número. CEP, bairro e cidade completam, mas
     nenhum deles sozinho diz onde é — e um resumo dizendo
     "CEP 51020-000" como endereço de entrega seria pior do que
     não dizer nada. */
  var enderecoUtil = function (e) {
    if (!e) return false;
    return Boolean(e.rua && e.num);
  };

  /* Junta o endereço numa linha legível, sem vírgula sobrando. */
  var enderecoLinha = function (e) {
    if (!enderecoUtil(e)) return '';

    var partes = [];

    if (e.rua) {
      partes.push(e.rua + (e.num ? ', ' + e.num : ''));
    } else if (e.num) {
      partes.push('Nº ' + e.num);
    }

    if (e.comp) partes.push(e.comp);
    if (e.bairro) partes.push(e.bairro);

    var cidadeUf = [e.cidade, e.uf].filter(Boolean).join(' — ');
    if (cidadeUf) partes.push(cidadeUf);
    if (e.cep) partes.push('CEP ' + e.cep);

    var linha = partes.join(' · ');

    /* O ponto de referência é uma frase inteira ("ao lado do
       shopping") e não um campo da mesma natureza dos outros:
       colado com "·", ele se perde no meio do endereço. Vai entre
       parênteses, no fim. */
    if (e.ref) linha += ' (referência: ' + e.ref + ')';

    return linha;
  };

  /* ==========================================================
     CÁLCULO — tudo derivado da config
     ========================================================== */
  var calcular = function () {
    var dias = state.days;
    var diaria = CFG.getDiaria(state.model);

    var bruto = diaria * dias;
    var pct = dias > 0 ? CFG.getDesconto(dias) : 0;
    var desconto = Math.round(bruto * pct / 100);
    var baseDiarias = bruto - desconto;

    var prot = CFG.getProtecao(state.protecao);
    var protTotal = prot.valorDia * dias;

    var addsTotal = 0;
    var addsLinhas = [];

    /* Percorre a CONFIG e não o estado: assim a ordem das linhas
       no resumo é sempre a mesma ordem dos cards na tela, e um id
       órfão no estado (adicional que saiu da config) não aparece. */
    CFG.adicionais.forEach(function (a) {
      var qtd = state.adicionais[a.id] || 0;
      if (qtd <= 0) return;

      var nome = a.nome + (qtd > 1 ? ' (' + qtd + '×)' : '');

      if (a.sobConsulta) {
        addsLinhas.push({ nome: nome, valor: CFG.textos.rotuloSobConsulta });
      } else {
        var soma = a.valorFixo * qtd;
        addsTotal += soma;
        addsLinhas.push({ nome: nome, valor: formatBRL(soma) });
      }
    });

    /* A taxa de entrega entra UMA vez quando QUALQUER um dos lados
       é a domicílio — buscar o carro já custa a ida da equipe, e
       levar de volta custa a volta. Não cobra duas vezes pelo mesmo
       deslocamento. */
    var receb = CFG.getRecebimento(state.recebimento);
    var dev = CFG.getDevolucao(state.devolucao);

    var temEntrega = Boolean(
      (receb && receb.endereco) || (dev && dev.endereco)
    );

    /* E só entra quando o período já existe: sem datas não há
       locação, e uma taxa solta pareceria cobrança indevida. */
    var taxa = (temEntrega && dias > 0) ? CFG.taxaEntrega.valor : 0;
    var temTaxa = taxa > 0;

    var subtotal = baseDiarias + protTotal + addsTotal + taxa;

    return {
      dias: dias,
      diaria: diaria,
      bruto: bruto,
      pct: pct,
      desconto: desconto,
      baseDiarias: baseDiarias,
      prot: prot,
      protTotal: protTotal,
      addsTotal: addsTotal,
      addsLinhas: addsLinhas,
      receb: receb,
      dev: dev,
      temEntrega: temEntrega,
      taxa: taxa,
      temTaxa: temTaxa,
      subtotal: subtotal,
      total: subtotal   /* o total estimado é o próprio subtotal */
    };
  };

  /* ==========================================================
     O RESUMO DA CONFIGURAÇÃO, EM DADOS

     Monta o objeto que vai para o `sessionStorage` e alimenta a
     Área do Cliente. Sai daqui — e não do HTML — para a reserva e
     a prévia nunca discordarem: as duas leem a mesma função.
     Sem dado pessoal: nome e WhatsApp ficam de fora de propósito.
     ========================================================== */
  var montarResumo = function () {
    var c = calcular();

    var endEntrega = enderecoUtil(state.endereco) ? state.endereco : null;

    var endDevol;
    if (!c.dev || !c.dev.endereco) {
      endDevol = null;
    } else if (c.receb && c.receb.endereco && state.mesmoEndereco) {
      endDevol = endEntrega;
    } else {
      endDevol = enderecoUtil(state.devEndereco) ? state.devEndereco : null;
    }

    var adicionais = [];
    CFG.adicionais.forEach(function (a) {
      var qtd = state.adicionais[a.id] || 0;
      if (qtd > 0) {
        adicionais.push({ nome: a.nome, qtd: qtd, valorFixo: a.valorFixo, sobConsulta: Boolean(a.sobConsulta) });
      }
    });

    return {
      modelo: state.model,
      img: state.img,
      categoria: state.ficha.cat || '',
      de: state.from ? toISODate(state.from) : '',
      ate: state.to ? toISODate(state.to) : '',
      deTxt: state.from ? formatBR(state.from) : '',
      ateTxt: state.to ? formatBR(state.to) : '',
      dias: c.dias,
      recebimento: c.receb ? c.receb.nome : '',
      devolucao: c.dev ? c.dev.nome : '',
      enderecoEntrega: enderecoLinha(endEntrega),
      enderecoDevolucao: enderecoLinha(endDevol),
      protecao: c.prot ? c.prot.nome : '',
      adicionais: adicionais,
      taxa: c.taxa,
      subtotal: c.subtotal,
      total: c.total
    };
  };

  /* ==========================================================
     CALENDÁRIO VISUAL
     ========================================================== */
  var abrirCalendario = function (aberto) {
    if (!els.cal) return;
    els.cal.hidden = !aberto;
    if (els.calToggle) els.calToggle.setAttribute('aria-expanded', String(aberto));
    if (els.calLabel) {
      els.calLabel.textContent = aberto ? 'Fechar calendário' : 'Abrir calendário';
    }
    if (aberto) renderCalendario();
  };

  var renderCalendario = function () {
    if (!els.cal || els.cal.hidden) return;
    if (!cal.view) cal.view = hoje();

    var ano = cal.view.getFullYear();
    var mes = cal.view.getMonth();

    els.calMonth.textContent = MESES_LONGO[mes] + ' de ' + ano;

    /* Não dá para voltar antes do mês atual */
    var h = hoje();
    var bloqueiaVoltar = (ano === h.getFullYear() && mes === h.getMonth());
    if (els.calPrev) els.calPrev.disabled = bloqueiaVoltar;

    els.calGrid.innerHTML = '';

    var primeiro = new Date(ano, mes, 1);
    var inicioSemana = primeiro.getDay();          /* 0 = domingo */
    var diasNoMes = new Date(ano, mes + 1, 0).getDate();
    var celulas = Math.ceil((inicioSemana + diasNoMes) / 7) * 7;

    for (var i = 0; i < celulas; i++) {
      var dia = i - inicioSemana + 1;

      /* Células antes do dia 1 e depois do último dia do mês:
         espaço vazio, mantendo a grade alinhada. */
      if (dia < 1 || dia > diasNoMes) {
        var vazio = document.createElement('span');
        vazio.className = 'bk__calDay bk__calDay--off';
        vazio.setAttribute('aria-hidden', 'true');
        els.calGrid.appendChild(vazio);
        continue;
      }

      var data = new Date(ano, mes, dia);
      var passado = data < h;

      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'bk__calDay';
      btn.textContent = String(dia);

      var ehFrom = mesmoDia(data, state.from);
      var ehTo = mesmoDia(data, state.to);

      if (ehFrom || ehTo) {
        btn.classList.add('bk__calDay--edge');
      } else if (state.from && state.to && data > state.from && data < state.to) {
        btn.classList.add('bk__calDay--range');
      }

      if (passado) {
        btn.disabled = true;
        btn.setAttribute('aria-label', dia + ' de ' + MESES_LONGO[mes] + ' — indisponível');
      } else {
        var rotulo = dia + ' de ' + MESES_LONGO[mes];
        if (ehFrom) rotulo += ' — retirada';
        if (ehTo) rotulo += ' — devolução';
        btn.setAttribute('aria-label', rotulo);
        btn.addEventListener('click', function (d) {
          return function () { escolherDia(d); };
        }(data));
      }

      els.calGrid.appendChild(btn);
    }

    /* Texto de orientação conforme o passo da escolha */
    if (els.calHint) {
      if (cal.picking === 'to') {
        els.calHint.textContent = 'Retirada em ' + formatDiaCurto(state.from) +
          '. Agora escolha o dia da devolução.';
      } else if (state.from && state.to) {
        els.calHint.textContent = 'Período definido. Toque em um dia para começar de novo.';
      } else {
        els.calHint.textContent = 'Escolha o dia da retirada. Depois, o dia da devolução.';
      }
    }
  };

  var escolherDia = function (data) {
    var h = hoje();
    if (data < h) return;

    if (cal.picking === 'from') {
      state.from = data;
      state.to = null;
      state.days = 0;
      cal.picking = 'to';
    } else {
      /* Devolução nunca antes (nem no mesmo dia) da retirada */
      if (state.from && data <= state.from) {
        /* Clicou antes da retirada: recomeça a partir dali. */
        state.from = data;
        state.to = null;
        state.days = 0;
        cal.picking = 'to';
      } else {
        state.to = data;
        state.days = dayDiff(state.from, data);
        cal.picking = 'from';
      }
    }

    /* Período novo, cálculo novo: a confirmação anterior era de
       outra locação e não pode ficar na tela. */
    esconderConfirmacao();

    renderCalendario();
    render();
  };

  var limparPeriodo = function () {
    state.from = null;
    state.to = null;
    state.days = 0;
    cal.picking = 'from';
    esconderConfirmacao();
    renderCalendario();
    render();
  };

  /* ==========================================================
     RENDERIZAÇÃO — retirada e devolução
     ========================================================== */
  var renderEscolhas = function () {
    var pintar = function (host, lista, escolhido, aoEscolher) {
      if (!host) return;

      /* As bolinhas e os rótulos são fixos; só o estado muda. Nada
         de recriar os botões a cada clique — recriar o elemento que
         acabou de receber o clique joga o foco para o <body>. */
      if (host.querySelector('.bk__opt')) {
        host.querySelectorAll('.bk__opt').forEach(function (b) {
          b.setAttribute('aria-checked',
            String(b.getAttribute('data-id') === escolhido));
        });
        return;
      }

      lista.forEach(function (op) {
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'bk__opt';
        btn.setAttribute('role', 'radio');
        btn.setAttribute('data-id', op.id);
        btn.setAttribute('aria-checked', String(op.id === escolhido));

        btn.innerHTML =
          '<span class="bk__optDot" aria-hidden="true"></span>' +
          '<span class="bk__optText">' +
            '<span class="bk__optName"></span>' +
            '<span class="bk__optDesc"></span>' +
          '</span>';

        btn.querySelector('.bk__optName').textContent = op.nome;
        btn.querySelector('.bk__optDesc').textContent = op.descricao;

        btn.addEventListener('click', function () { aoEscolher(op.id); });

        host.appendChild(btn);
      });
    };

    pintar(els.receber, CFG.recebimento, state.recebimento, function (id) {
      state.recebimento = id;
      esconderConfirmacao();
      renderEscolhas();
      render();
    });

    pintar(els.devolver, CFG.devolucao, state.devolucao, function (id) {
      state.devolucao = id;
      state.mesmoEndereco = true;
      if (els.mesmo) els.mesmo.checked = true;
      esconderConfirmacao();
      renderEscolhas();
      render();
    });

    var receb = CFG.getRecebimento(state.recebimento);
    var dev = CFG.getDevolucao(state.devolucao);

    /* Endereço da entrega: aparece só na opção a domicílio. */
    var pedeEntrega = Boolean(receb && receb.endereco);
    if (els.endWrap) els.endWrap.hidden = !pedeEntrega;

    if (els.receberNota) {
      /* A unidade não tem endereço público confirmado. Inventar um
         seria pior do que dizer que ele vem depois. */
      if (receb && !receb.endereco) {
        els.receberNota.textContent = CFG.textos.rotuloEnderecoUnidade;
        els.receberNota.hidden = false;
      } else {
        els.receberNota.hidden = true;
      }
    }

    /* Devolução no endereço */
    var pedeDev = Boolean(dev && dev.endereco);
    if (els.devWrap) els.devWrap.hidden = !pedeDev;

    /* "Usar o mesmo endereço" só faz sentido se houver um endereço
       de entrega para repetir. Sem entrega a domicílio, quem escolhe
       retirada no endereço precisa informar um do zero. */
    var podeRepetir = pedeDev && pedeEntrega;
    if (els.mesmoWrap) els.mesmoWrap.hidden = !podeRepetir;

    if (els.devGrid) {
      els.devGrid.hidden = !(pedeDev && (!podeRepetir || !state.mesmoEndereco));
    }

    if (els.devolverNota) {
      if (pedeDev && podeRepetir && state.mesmoEndereco) {
        els.devolverNota.textContent =
          'Vamos buscar o veículo no mesmo endereço da entrega.';
        els.devolverNota.hidden = false;
      } else {
        els.devolverNota.hidden = true;
      }
    }
  };

  /* ==========================================================
     RENDERIZAÇÃO
     ========================================================== */
  var renderPeriodo = function () {
    var set = Boolean(state.from || state.to);

    if (els.period) els.period.classList.toggle('is-set', set);

    if (els.periodFrom) {
      els.periodFrom.textContent = state.from ? formatDiaCurto(state.from) : '—';
    }
    if (els.periodTo) {
      els.periodTo.textContent = state.to ? formatDiaCurto(state.to) : '—';
    }
    if (els.periodDays) {
      els.periodDays.textContent = state.days > 0 ? formatDias(state.days) : '—';
    }

    /* Texto de apoio sob o calendário */
    if (els.hint) {
      if (state.days > 0) {
        els.hint.textContent = 'Período de ' + formatDias(state.days) +
          ' — ' + formatBR(state.from) + ' a ' + formatBR(state.to) + '.';
      } else if (state.from) {
        els.hint.textContent = 'Retirada em ' + formatDiaCurto(state.from) +
          '. Falta escolher a devolução.';
      } else {
        els.hint.textContent = 'Escolha as duas datas no calendário para calcular o período.';
      }
    }
  };

  /* Linhas do resumo que só fazem sentido às vezes (endereço,
     taxa de entrega) são escondidas por inteiro quando não têm
     nada a dizer — mostrar o rótulo com um traço ao lado só
     ocuparia espaço para dizer "nada". */
  var mostrarLinha = function (linha, mostrar) {
    var el = linha.closest('.bk__summaryRow');
    if (el) el.hidden = !mostrar;
  };

  var renderResumo = function () {
    var c = calcular();

    /* Veículo */
    els.sumModel.textContent = state.model || '—';

    if (state.img) {
      var atual = els.sumMedia.querySelector('img');
      if (!atual || atual.getAttribute('src') !== state.img) {
        els.sumMedia.innerHTML = '';
        var img = document.createElement('img');
        img.src = state.img;
        img.alt = state.model;
        els.sumMedia.appendChild(img);
      }
    } else {
      els.sumMedia.innerHTML = '<span class="bk__summaryEmpty">Nenhum veículo selecionado</span>';
    }

    /* Período — "18 set → 21 set" */
    if (state.from && state.to) {
      els.sumPeriod.textContent = formatDiaCurto(state.from) + ' → ' + formatDiaCurto(state.to);
    } else if (state.from) {
      els.sumPeriod.textContent = formatDiaCurto(state.from) + ' → ...';
    } else {
      els.sumPeriod.textContent = '—';
    }

    /* Quantidade de dias */
    els.sumDays.textContent = c.dias > 0 ? c.dias + (c.dias === 1 ? ' dia' : ' dias') : '—';

    /* Forma de recebimento */
    if (els.sumReceb) {
      els.sumReceb.textContent = c.receb ? c.receb.nome : '—';
    }

    /* Endereço de entrega — só existe quando a entrega é a
       domicílio E o endereço já foi preenchido. */
    var linhaEntrega = enderecoLinha(state.endereco);
    var mostraEntrega = Boolean(c.receb && c.receb.endereco) && Boolean(linhaEntrega);

    if (els.sumEnd) {
      els.sumEnd.textContent = mostraEntrega ? linhaEntrega : '—';
    }
    if (els.sumEndRow) mostrarLinha(els.sumEnd, mostraEntrega);

    /* Forma de devolução, com o endereço quando for outro lugar */
    if (els.sumDev) {
      if (!c.dev) {
        els.sumDev.textContent = '—';
      } else if (c.dev.endereco) {
        var devLinha = '';

        if (c.receb && c.receb.endereco && state.mesmoEndereco && linhaEntrega) {
          devLinha = c.dev.nome + ' — mesmo endereço da entrega';
        } else {
          var outro = enderecoLinha(state.devEndereco);
          devLinha = c.dev.nome + (outro ? ' — ' + outro : '');
        }

        els.sumDev.textContent = devLinha;
      } else {
        els.sumDev.textContent = c.dev.nome;
      }
    }

    /* Diárias */
    if (c.dias > 0 && c.diaria > 0) {
      els.sumDiarias.textContent = c.dias + ' × ' + formatBRL(c.diaria) + ' = ' + formatBRL(c.bruto);
    } else {
      els.sumDiarias.textContent = '—';
    }

    /* Desconto aplicado */
    var rowDesc = els.sumDiscount.closest('.bk__summaryRow');
    if (c.pct > 0 && c.desconto > 0) {
      els.sumDiscount.textContent = '− ' + formatBRL(c.desconto) + ' (' + c.pct + '%)';
      if (rowDesc) rowDesc.classList.remove('is-empty');
    } else {
      els.sumDiscount.textContent = c.dias > 0 ? 'Nenhum desconto neste período' : '—';
      if (rowDesc) rowDesc.classList.add('is-empty');
    }

    /* Proteção selecionada */
    if (c.prot && c.prot.valorDia > 0) {
      els.sumProt.textContent = c.prot.nome + ' — ' + formatBRL(c.prot.valorDia) +
        '/dia' + (c.dias > 0 ? ' (' + formatBRL(c.protTotal) + ')' : '');
    } else {
      els.sumProt.textContent = c.prot ? c.prot.nome : '—';
    }

    /* Serviços adicionais */
    if (c.addsLinhas.length > 0) {
      els.sumAdds.innerHTML = '';

      var wrap = document.createElement('span');
      wrap.className = 'bk__sumLines';

      c.addsLinhas.forEach(function (linha) {
        var row = document.createElement('span');
        row.className = 'bk__sumLine';
        row.innerHTML = '<span></span><span class="bk__sumLineVal"></span>';
        row.firstChild.textContent = linha.nome;
        row.lastChild.textContent = linha.valor;
        wrap.appendChild(row);
      });

      els.sumAdds.appendChild(wrap);
    } else {
      els.sumAdds.textContent = 'Nenhum serviço adicional';
    }

    /* Taxa de entrega — só quando existe. Rótulo e valor juntos:
       é uma linha de cobrança, não uma observação. */
    if (els.sumTaxa) {
      els.sumTaxa.textContent = c.temTaxa ? formatBRL(c.taxa) : '—';
    }
    if (els.sumTaxaRow) mostrarLinha(els.sumTaxa, c.temTaxa);

    /* Subtotal e total estimado.
       Só aparece número quando existe período escolhido: sem
       datas, "R$ 0,00" passaria a impressão de reserva sem custo
       em vez de cálculo ainda não feito. */
    if (c.dias > 0) {
      els.sumSubtotal.textContent = formatBRL(c.subtotal);
      els.sumTotal.textContent = formatBRL(c.total);
    } else {
      els.sumSubtotal.textContent = '—';
      els.sumTotal.textContent = '—';
    }
  };

  var buildMessage = function () {
    var c = calcular();
    var lines = ['Olá! Gostaria de solicitar uma reserva na Lok Car.'];

    if (state.model) lines.push('Veículo de interesse: ' + state.model);

    if (state.from && state.to && c.dias > 0) {
      lines.push('Retirada: ' + formatBR(state.from));
      lines.push('Devolução: ' + formatBR(state.to));
      lines.push('Período: ' + formatDias(c.dias));
    }

    if (c.receb) lines.push('Forma de recebimento: ' + c.receb.nome);

    var linhaEntrega = enderecoLinha(state.endereco);
    if (c.receb && c.receb.endereco && linhaEntrega) {
      lines.push('Endereço de entrega: ' + linhaEntrega);
      if (state.endereco.ref) lines.push('Referência: ' + state.endereco.ref);
    }

    if (c.dev) {
      var devTxt = c.dev.nome;
      if (c.dev.endereco) {
        if (c.receb && c.receb.endereco && state.mesmoEndereco && linhaEntrega) {
          devTxt += ' (mesmo endereço da entrega)';
        } else if (enderecoUtil(state.devEndereco)) {
          devTxt += ': ' + enderecoLinha(state.devEndereco);
        }
      }
      lines.push('Forma de devolução: ' + devTxt);
    }

    if (c.prot && c.prot.valorDia > 0) {
      lines.push('Proteção: ' + c.prot.nome);
    }

    if (c.addsLinhas.length > 0) {
      lines.push('Adicionais: ' + c.addsLinhas.map(function (l) {
        return l.nome + ' (' + l.valor + ')';
      }).join(', '));
    }

    if (state.from && state.to && c.dias > 0) {
      lines.push('Estimativa: ' + formatBRL(c.total));
      lines.push('(Valores demonstrativos — a tabela final é confirmada pela equipe.)');
    }

    var nome = els.name ? els.name.value.trim() : '';
    var fone = els.phone ? els.phone.value.trim() : '';

    if (nome) lines.push('Nome: ' + nome);
    if (fone) lines.push('WhatsApp: ' + fone);

    lines.push('Pode confirmar a disponibilidade?');

    return 'https://wa.me/' + WHATSAPP + '?text=' + encodeURIComponent(lines.join('\n'));
  };

  var syncSend = function () {
    /* O envio só libera com veículo + período válido */
    var pronto = Boolean(state.model) && state.days > 0;

    if (els.send) {
      els.send.setAttribute('aria-disabled', pronto ? 'false' : 'true');
    }

    /* O link do WhatsApp é montado sempre que há mudança, para o
       botão de confirmação já sair com a mensagem pronta. */
    if (pronto) {
      var url = buildMessage();
      if (els.doneWa) els.doneWa.href = url;
    }
  };

  var render = function () {
    renderPeriodo();
    renderEscolhas();
    renderInfo();
    renderResumo();
    syncSend();
  };

  /* ==========================================================
     SOLICITAÇÃO — registra a configuração para a demonstração

     Não há pagamento, não há número de reserva e não há cobrança.
     O que acontece: a configuração da locação vai para o
     `sessionStorage` do próprio navegador e a tela confirma. Se o
     navegador bloquear o armazenamento, a confirmação aparece do
     mesmo jeito e só a prévia da Área do Cliente não recebe os
     dados — por isso o retorno de `guardarDemo` muda o texto.
     ========================================================== */
  /* Fecha a confirmação. Chamado por toda mudança que invalidaria
     o que já foi registrado: trocar de carro, refazer o período,
     trocar proteção, mexer num adicional. Deixar o bloco aberto
     faria a tela dizer "sua solicitação foi registrada" enquanto
     o resumo ao lado já mostra outra conta. */
  var esconderConfirmacao = function () {
    if (els.done) els.done.hidden = true;
  };

  var solicitar = function () {
    var pronto = Boolean(state.model) && state.days > 0;

    if (!pronto) {
      /* Leva a pessoa exatamente ao que falta, em vez de só
         recusar o clique. */
      var alvo = !state.model ? picker : (els.calToggle || els.period);
      if (alvo && alvo.scrollIntoView) {
        alvo.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
      }
      if (!state.model) {
        var primeiroCarro = els.picks[0];
        if (primeiroCarro) primeiroCarro.focus();
      }
      return;
    }

    var guardou = guardarDemo(montarResumo());

    if (els.done) {
      els.done.hidden = false;

      var texto = els.done.querySelector('.bk__doneText');

      if (texto) {
        /* O aviso de armazenamento só aparece quando ele de fato
           falhou: sem isto, a prévia abriria sem dados e a pessoa
           não saberia por quê. */
        texto.textContent = guardou
          ? 'A equipe Lok Car confirmará disponibilidade, condições e valores ' +
            'antes da contratação. Nenhum pagamento foi feito e nenhum valor ' +
            'foi cobrado. Esta solicitação aparece na prévia da Área do Cliente.'
          : 'A equipe Lok Car confirmará disponibilidade, condições e valores ' +
            'antes da contratação. Nenhum pagamento foi feito e nenhum valor ' +
            'foi cobrado. Neste navegador não foi possível guardar a prévia da ' +
            'Área do Cliente — a solicitação segue valendo pelo WhatsApp.';
      }

      els.done.scrollIntoView({
        behavior: reduceMotion ? 'auto' : 'smooth',
        block: 'center'
      });
    }

    if (els.doneWa) els.doneWa.href = buildMessage();
  };

  /* ==========================================================
     INTERAÇÕES
     ========================================================== */

  /* Seleção de veículo.

     Um só lugar lê o botão para o estado: rótulo, imagem e ficha.
     É o que os três caminhos de escolha (clique no card da frota,
     clique no seletor, pré-seleção por âncora) têm em comum — e o
     motivo de a ficha nunca discordar do carro escolhido. */
  var escolherVeiculo = function (btn) {
    if (!btn) return;

    esconderConfirmacao();

    els.picks.forEach(function (other) {
      other.setAttribute('aria-checked', String(other === btn));
    });

    state.model = btn.getAttribute('data-model') || '';
    state.img = btn.getAttribute('data-img') || '';

    state.ficha = {
      cat: btn.getAttribute('data-cat') || '',
      cambio: btn.getAttribute('data-cambio') || '',
      lugares: btn.getAttribute('data-lugares') || '',
      ar: btn.getAttribute('data-ar') || ''
    };
  };

  els.picks.forEach(function (btn) {
    btn.addEventListener('click', function () {
      escolherVeiculo(btn);
      render();
    });
  });

  /* ---------- Endereços ----------
     Um único handler por bloco: qualquer digitação atualiza o
     objeto do estado e re-renderiza o resumo. `input` (e não
     `change`) para o resumo acompanhar letra a letra. */
  var ligarEndereco = function (mapa, destino) {
    CAMPOS_ENDERECO.forEach(function (campo) {
      var el = els[mapa[campo]];
      if (!el) return;

      el.addEventListener('input', function () {
        destino[campo] = el.value.trim();
        esconderConfirmacao();
        renderResumo();
      });
    });
  };

  ligarEndereco(EL_ENDERECO, state.endereco);
  ligarEndereco(EL_DEV, state.devEndereco);

  /* Máscara de CEP: 00000-000. Só dígitos, com o traço entrando
     sozinho — ninguém deve ter de digitar pontuação no celular. */
  [els.cep, els.devCep].forEach(function (campo) {
    if (!campo) return;

    campo.addEventListener('input', function () {
      var d = campo.value.replace(/\D/g, '').slice(0, 8);
      campo.value = d.length > 5 ? d.slice(0, 5) + '-' + d.slice(5) : d;

      if (campo === els.cep) {
        state.endereco.cep = campo.value;
      } else {
        state.devEndereco.cep = campo.value;
      }

      esconderConfirmacao();
      renderResumo();
    });
  });

  /* UF: duas letras, maiúsculas */
  [els.uf, els.devUf].forEach(function (campo) {
    if (!campo) return;

    campo.addEventListener('input', function () {
      var v = campo.value.replace(/[^a-zA-Z]/g, '').slice(0, 2).toUpperCase();
      campo.value = v;

      if (campo === els.uf) {
        state.endereco.uf = v;
      } else {
        state.devEndereco.uf = v;
      }

      esconderConfirmacao();
      renderResumo();
    });
  });

  /* "Usar o mesmo endereço da entrega" */
  if (els.mesmo) {
    els.mesmo.addEventListener('change', function () {
      state.mesmoEndereco = els.mesmo.checked;
      esconderConfirmacao();
      renderEscolhas();
      renderResumo();
    });
  }

  /* ---------- Solicitar reserva ---------- */
  if (els.send) {
    els.send.addEventListener('click', solicitar);
  }

  /* Atalho para a prévia da Área do Cliente, já dentro dela */
  if (els.doneCli) {
    els.doneCli.addEventListener('click', function () {
      var gatilho = document.querySelector('[data-open-login]');

      /* Reaproveita o botão que já abre o overlay e já cuida do
         foco e do menu mobile. Se ele não existir, não há o que
         abrir — melhor não fazer nada do que abrir um overlay
         sem gatilho registrado. */
      if (gatilho) gatilho.click();
    });
  }

  /* Calendário */
  if (els.calToggle) {
    els.calToggle.addEventListener('click', function () {
      abrirCalendario(Boolean(els.cal && els.cal.hidden));
    });
  }

  if (els.calPrev) {
    els.calPrev.addEventListener('click', function () {
      cal.view = new Date(cal.view.getFullYear(), cal.view.getMonth() - 1, 1);
      renderCalendario();
    });
  }

  if (els.calNext) {
    els.calNext.addEventListener('click', function () {
      cal.view = new Date(cal.view.getFullYear(), cal.view.getMonth() + 1, 1);
      renderCalendario();
    });
  }

  if (els.calClear) {
    els.calClear.addEventListener('click', limparPeriodo);
  }

  /* Máscara leve de telefone: (81) 99999-9999 */
  if (els.phone) {
    els.phone.addEventListener('input', function () {
      var digits = els.phone.value.replace(/\D/g, '').slice(0, 11);
      var out = '';

      if (digits.length > 0) {
        out = '(' + digits.slice(0, 2);
      }
      if (digits.length >= 3) {
        out += ') ' + digits.slice(2, digits.length > 10 ? 7 : 6);
      }
      if (digits.length > (digits.length > 10 ? 7 : 6)) {
        out += '-' + digits.slice(digits.length > 10 ? 7 : 6);
      }

      els.phone.value = out;
      syncSend();
    });
  }

  if (els.name) els.name.addEventListener('input', syncSend);

  /* Pré-seleção vinda de um card da frota.
     O clique leva à área de reserva com o veículo já marcado —
     sem recarregar a página (o href="#reservar" é uma âncora, e
     o preventDefault evita que o navegador pule antes de marcar).

     Nem todo card tem botão no seletor da reserva: os modelos que
     a locadora ainda não fechou para reserva direta aparecem só
     como vitrine. Nesse caso o card continua levando à seção, mas
     NÃO mexe na escolha que já estava feita — limpar a seleção de
     quem clicou seria pior do que não selecionar nada. */
  var selecionarModelo = function (modelo) {
    var alvo = null;

    els.picks.forEach(function (btn) {
      if (btn.getAttribute('data-model') === modelo) alvo = btn;
    });

    if (!alvo) return false;

    escolherVeiculo(alvo);
    render();
    return true;
  };

  /* O card inteiro é acionável — mídia, nome e o link de
     interesse. Um único handler no card evita registros
     duplicados nos filhos; o clique sempre sobe até aqui. */
  document.querySelectorAll('.vcard').forEach(function (card) {
    card.addEventListener('click', function () {
      var modelo = card.getAttribute('data-model');
      if (!modelo) return;

      selecionarModelo(modelo);

      /* Nada de preventDefault: a âncora #reservar segue o fluxo
         normal e rola até a seção. A pré-seleção já aconteceu. */
    });
  });

  /* O CTA do header leva direto ao calendário aberto — quem clica
     em "Consultar disponibilidade" quer escolher datas. Os demais
     links para #reservar (navegação, rodapé) só rolam até a seção,
     sem abrir nada: seria intrusivo abrir o calendário para quem
     só pediu "como funciona". */
  document.querySelectorAll('[data-open-cal]').forEach(function (el) {
    el.addEventListener('click', function () {
      abrirCalendario(true);
    });
  });

  /* ==========================================================
     INICIALIZAÇÃO
     ========================================================== */
  renderProtecoes();
  renderAdicionais();
  renderInclusos();
  renderCalendario();
  render();

  /* Só agora a reserva existe de fato — então é agora que o
     atalho "Ir para a reserva" da área do cliente pode ser
     ligado (ver seção 7). */
  var irParaReserva = document.querySelectorAll('[data-goto-reserva]');

  irParaReserva.forEach(function (el) {
    el.addEventListener('click', function () {
      var alvo = document.getElementById('reservar');

      fecharCli();
      if (alvo) alvo.scrollIntoView();

      /* O calendário é o campo que a pessoa veio procurar */
      abrirCalendario(true);
    });
  });

  /* Se o visitante chegar por âncora direta em #reservar, o
     calendário já vem aberto — é o campo que ele veio procurar. */
  if (window.location.hash === '#reservar') {
    abrirCalendario(true);
  }
})();
