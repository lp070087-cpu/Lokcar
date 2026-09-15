/* ============================================================
   LOK CAR — config.js
   ------------------------------------------------------------
   ÚNICO lugar onde vivem os números da demonstração de reserva.
   Nada de valor solto no HTML ou no app.js: para mudar um preço,
   um desconto ou um serviço, mexa SOMENTE aqui.

   ATENÇÃO — LEIA ANTES DE ALTERAR
   Os valores abaixo são ILUSTRATIVOS. Servem para mostrar como a
   tela de reserva vai funcionar. Eles NÃO são a tabela comercial
   da Lok Car e não foram fornecidos pela locadora. Antes de ir
   ao ar, cada número precisa ser confirmado pelo proprietário.

   Também não há, nesta versão, nenhuma cobertura de seguro
   descrita: as proteções são apenas nomes e valores de exemplo,
   sem franquia, sem indenização e sem promessa de cobertura.
   ============================================================ */

window.LOKCAR_CONFIG = (function () {
  'use strict';

  /* ----------------------------------------------------------
     1 · VEÍCULOS

     A CHAVE precisa bater exatamente com o atributo data-model
     usado no index.html (tanto nos cards da frota quanto no
     seletor da reserva). Se um nome for escrito diferente aqui,
     o card daquele carro fica sem preço e sem seleção.

     `diariaMin` e `diariaMax` formam a faixa exibida no card.
     ---------------------------------------------------------- */
  var veiculos = {
    'Porsche 911':            { diariaMin: 700, diariaMax: 900 },
    'Porsche Cayenne':        { diariaMin: 700, diariaMax: 900 },
    'Mercedes-Benz Classe C': { diariaMin: 400, diariaMax: 600 },
    'Audi A5 Sportback':      { diariaMin: 400, diariaMax: 600 },
    'Hyundai HB20':           { diariaMin: 150, diariaMax: 220 },
    'Chevrolet Onix Plus':    { diariaMin: 150, diariaMax: 220 }
  };

  /* Valor usado na SIMULAÇÃO do total.
     A faixa exibida no card é diariaMin–diariaMax; o cálculo
     precisa de um número só, então usamos o piso da faixa. */
  var diariaParaCalculo = 'min';

  /* ----------------------------------------------------------
     2 · DESCONTO PROGRESSIVO POR DIÁRIAS
     Quanto mais dias, maior o desconto. Vale a MAIOR faixa
     cujo `minDias` o período alcança.
     ---------------------------------------------------------- */
  var descontos = [
    { minDias: 7, percentual: 10 },
    { minDias: 4, percentual: 7 },
    { minDias: 3, percentual: 5 },
    { minDias: 2, percentual: 3 },
    { minDias: 1, percentual: 0 }
  ];

  /* ----------------------------------------------------------
     3 · PROTEÇÃO DO VEÍCULO
     Valores por dia. Repetimos: são ILUSTRATIVOS e não descrevem
     cobertura, franquia ou indenização de nenhum tipo.
     `id` vazio = opção "sem proteção adicional".
     ---------------------------------------------------------- */
  var protecoes = [
    {
      id: '',
      nome: 'Sem proteção adicional',
      descricao: 'Você segue com a cobertura básica já incluída na locação.',
      valorDia: 0
    },
    {
      id: 'simples',
      nome: 'Proteção Simples',
      descricao: 'Uma camada extra de tranquilidade para o seu período.',
      valorDia: 29
    },
    {
      id: 'basica',
      nome: 'Proteção Básica',
      descricao: 'Opção intermediária, a mais escolhida nos roteiros maiores.',
      valorDia: 59
    },
    {
      id: 'completa',
      nome: 'Proteção Completa',
      descricao: 'A opção mais ampla desta demonstração.',
      valorDia: 99
    }
  ];

  /* ----------------------------------------------------------
     4 · SERVIÇOS ADICIONAIS
     `valorFixo` é cobrado uma vez. `sobConsulta` mostra "Sob
     consulta" no lugar do preço e não entra no total — porque
     depende do endereço e da distância.
     ---------------------------------------------------------- */
  var adicionais = [
    {
      id: 'lavagem',
      nome: 'Lavagem na devolução',
      descricao: 'Devolvemos o carro lavado, sem você precisar parar.',
      valorFixo: 50,
      sobConsulta: false
    },
    {
      id: 'lavagem-premium',
      nome: 'Lavagem premium',
      descricao: 'Limpeza detalhada, interna e externa.',
      valorFixo: 90,
      sobConsulta: false
    },
    {
      id: 'entrega',
      nome: 'Entrega e retirada',
      descricao: 'Vamos até você buscar e devolver o veículo.',
      valorFixo: 0,
      sobConsulta: true
    }
  ];

  /* ----------------------------------------------------------
     5 · TEXTOS DE APOIO

     Só o que o código realmente lê. Rótulos fixos de interface
     ("a partir de", "/dia") e o aviso de demonstração continuam
     escritos no index.html de propósito: são texto de página, e
     mantê-los lá deixa a marcação legível para quem for editar
     o site à mão.

     IMPORTANTE: este arquivo NÃO guarda nome, descrição, preço
     nem categoria de veículo. Isso é conteúdo editorial e vive
     no index.html — assim o proprietário edita o site inteiro
     (inclusive os carros) sem abrir um arquivo de script.
     ---------------------------------------------------------- */
  var textos = {
    rotuloSobConsulta: 'Sob consulta'
  };

  /* ----------------------------------------------------------
     Consultas — usadas pelo app.js
     ---------------------------------------------------------- */
  var getVeiculo = function (modelo) {
    return veiculos[modelo] || null;
  };

  var getDiaria = function (modelo) {
    var v = getVeiculo(modelo);
    if (!v) return 0;
    return diariaParaCalculo === 'max' ? v.diariaMax : v.diariaMin;
  };

  /* Devolve o MAIOR percentual cujo minDias o período alcança.
     Percorre a lista inteira de propósito: assim a ordem em que
     as faixas estiverem escritas não muda o resultado. */
  var getDesconto = function (dias) {
    var melhor = 0;

    for (var i = 0; i < descontos.length; i++) {
      if (dias >= descontos[i].minDias && descontos[i].percentual > melhor) {
        melhor = descontos[i].percentual;
      }
    }

    return melhor;
  };

  var getProtecao = function (id) {
    for (var i = 0; i < protecoes.length; i++) {
      if (protecoes[i].id === (id || '')) return protecoes[i];
    }
    return protecoes[0];
  };

  var getAdicional = function (id) {
    for (var i = 0; i < adicionais.length; i++) {
      if (adicionais[i].id === id) return adicionais[i];
    }
    return null;
  };

  return {
    veiculos: veiculos,
    descontos: descontos,
    protecoes: protecoes,
    adicionais: adicionais,
    textos: textos,
    getVeiculo: getVeiculo,
    getDiaria: getDiaria,
    getDesconto: getDesconto,
    getProtecao: getProtecao,
    getAdicional: getAdicional
  };
})();
