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
      /* 2,9s: a saída do CSS começa em 2,05s e leva 0,85s. */
      var introMs = 2900;

      var introTimer = window.setTimeout(finishIntro, introMs);

      /* Se algo travar, um teto generoso garante que a página
         nunca fique presa atrás da abertura. */
      window.setTimeout(function () {
        if (intro) {
          window.clearTimeout(introTimer);
          finishIntro();
        }
      }, 5000);

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
     7 · DEMONSTRAÇÃO DA RESERVA
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

    name:        document.getElementById('bkName'),
    phone:       document.getElementById('bkPhone'),
    hint:        document.getElementById('bkDateHint'),

    sumMedia:    document.getElementById('bkSumMedia'),
    sumModel:    document.getElementById('bkSumModel'),
    sumPeriod:   document.getElementById('bkSumPeriod'),
    sumDays:     document.getElementById('bkSumDays'),
    sumDiarias:  document.getElementById('bkSumDiarias'),
    sumDiscount: document.getElementById('bkSumDiscount'),
    sumProt:     document.getElementById('bkSumProt'),
    sumAdds:     document.getElementById('bkSumAdds'),
    sumSubtotal: document.getElementById('bkSumSubtotal'),
    sumTotal:    document.getElementById('bkSumTotal'),

    send:        document.getElementById('bkSend')
  };

  var state = {
    model: '',
    img: '',
    from: null,
    to: null,
    days: 0,
    protecao: '',
    adicionais: []
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
      btn.setAttribute('data-prot', p.id);

      var preco = p.valorDia > 0
        ? '+ ' + formatBRL(p.valorDia).replace(',00', '') + ' /dia'
        : 'Incluída';

      btn.innerHTML =
        '<span class="bk__protTop">' +
          '<span class="bk__protName"></span>' +
          '<span class="bk__protPrice"></span>' +
        '</span>' +
        '<span class="bk__protDesc"></span>';

      btn.querySelector('.bk__protName').textContent = p.nome;
      btn.querySelector('.bk__protPrice').textContent = preco;
      btn.querySelector('.bk__protDesc').textContent = p.descricao;

      btn.addEventListener('click', function () {
        state.protecao = p.id;
        renderProtecoes();
        render();
      });

      els.prots.appendChild(btn);
    });
  };

  /* ==========================================================
     ADICIONAIS — construídos a partir da config
     ========================================================== */
  var renderAdicionais = function () {
    if (!els.adds) return;

    els.adds.innerHTML = '';

    CFG.adicionais.forEach(function (a) {
      var marcado = state.adicionais.indexOf(a.id) !== -1;

      var label = document.createElement('label');
      label.className = 'bk__add' + (marcado ? ' is-on' : '');
      label.setAttribute('data-add', a.id);

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
        var i = state.adicionais.indexOf(a.id);

        if (input.checked && i === -1) {
          state.adicionais.push(a.id);
        } else if (!input.checked && i !== -1) {
          state.adicionais.splice(i, 1);
        }

        label.classList.toggle('is-on', input.checked);
        render();
      });

      els.adds.appendChild(label);
    });
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

    state.adicionais.forEach(function (id) {
      var a = CFG.getAdicional(id);
      if (!a) return;

      if (a.sobConsulta) {
        addsLinhas.push({ nome: a.nome, valor: CFG.textos.rotuloSobConsulta });
      } else {
        addsTotal += a.valorFixo;
        addsLinhas.push({ nome: a.nome, valor: formatBRL(a.valorFixo) });
      }
    });

    var subtotal = baseDiarias + protTotal + addsTotal;

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
      subtotal: subtotal,
      total: subtotal   /* o total estimado é o próprio subtotal */
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
      btn.setAttribute('data-date', toISODate(data));

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

    renderCalendario();
    render();
  };

  var limparPeriodo = function () {
    state.from = null;
    state.to = null;
    state.days = 0;
    cal.picking = 'from';
    renderCalendario();
    render();
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
        els.hint.classList.remove('is-warn');
      } else if (state.from) {
        els.hint.textContent = 'Retirada em ' + formatDiaCurto(state.from) +
          '. Falta escolher a devolução.';
        els.hint.classList.remove('is-warn');
      } else {
        els.hint.textContent = 'Escolha as duas datas no calendário para calcular o período.';
        els.hint.classList.remove('is-warn');
      }
    }
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

    /* Diárias */
    if (c.dias > 0 && c.diaria > 0) {
      els.sumDiarias.textContent = c.dias + ' × ' + formatBRL(c.diaria) + ' = ' + formatBRL(c.bruto);
    } else {
      els.sumDiarias.textContent = '—';
    }

    /* Desconto aplicado */
    var rowDesc = els.sumDiscount.closest('.bk__summaryRow');
    if (c.pct > 0 && c.desconto > 0) {
      els.sumDiscount.textContent = '− ' + formatBRL(c.desconto) + '  (' + c.pct + '%)';
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

    /* Subtotal e total estimado */
    if (c.dias > 0 || state.model) {
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

    if (pronto) {
      els.send.setAttribute('aria-disabled', 'false');
      els.send.href = buildMessage();
    } else {
      els.send.setAttribute('aria-disabled', 'true');
      els.send.href = 'https://wa.me/' + WHATSAPP;
    }
  };

  var render = function () {
    renderPeriodo();
    renderResumo();
    syncSend();
  };

  /* ==========================================================
     INTERAÇÕES
     ========================================================== */

  /* Seleção de veículo */
  els.picks.forEach(function (btn) {
    btn.addEventListener('click', function () {
      els.picks.forEach(function (other) {
        other.setAttribute('aria-checked', 'false');
      });
      btn.setAttribute('aria-checked', 'true');

      state.model = btn.getAttribute('data-model') || '';
      state.img = btn.getAttribute('data-img') || '';

      render();
    });
  });

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
     o preventDefault evita que o navegador pule antes de marcar). */
  var selecionarModelo = function (modelo) {
    els.picks.forEach(function (btn) {
      var match = btn.getAttribute('data-model') === modelo;
      btn.setAttribute('aria-checked', match ? 'true' : 'false');

      if (match) {
        state.model = btn.getAttribute('data-model') || '';
        state.img = btn.getAttribute('data-img') || '';
      }
    });

    render();
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
  renderCalendario();
  render();

  /* Se o visitante chegar por âncora direta em #reservar, o
     calendário já vem aberto — é o campo que ele veio procurar. */
  if (window.location.hash === '#reservar') {
    abrirCalendario(true);
  }
})();
