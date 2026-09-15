# LOK CAR — Locadora de Veículos

Apresentação comercial em formato de website para a **LOK CAR Locadora de Veículos**
(Reserva do Paiva · Empresarial Novo Mundo — Cabo de Santo Agostinho, PE).

Não é um sistema funcional: é uma **proposta visual navegável** para o proprietário
enxergar como ficaria o novo site e a experiência inicial do futuro sistema de reservas.

---

## Como executar localmente

O projeto é estático (HTML + CSS + JS puros), sem build e sem dependências.

### Opção 1 — abrir direto (mais simples)

Abra o arquivo `index.html` no navegador (duplo clique). Funciona.

### Opção 2 — servidor local (recomendado)

Navegadores aplicam algumas restrições em `file://`. Para a experiência fiel:

```bash
cd lokcar-site

# Python 3 (já vem instalado em macOS/Linux; no Windows, use o py)
python -m http.server 5173

# ou com Node.js
npx serve .
```

Depois acesse: **http://localhost:5173**

---

## Estrutura de pastas

```
lokcar-site/
├── index.html              # página única: header, hero, frota, reserva, marca, CTA, footer
├── assets/
│   └── favicon.svg         # ícone da aba (logo recriada em SVG)
├── scripts/
│   ├── config.js           # TODOS os números da simulação (ver abaixo)
│   └── app.js              # intro, header, menu mobile, reveal, demo da reserva
└── styles/
    ├── base.css            # tokens, reset, tipografia, botões, utilidades
    ├── intro.css           # abertura cinematográfica da marca
    ├── header.css          # navegação fixa + menu mobile
    ├── hero.css            # hero + faixa de diferenciais
    ├── fleet.css           # grade de veículos
    ├── booking.css         # demonstração do sistema de reservas
    ├── brand.css           # destaque da marca + modelos complementares
    ├── cta.css             # fechamento e contatos
    ├── footer.css          # rodapé
    └── responsive.css      # media queries (carregado por último)
```

As imagens **não foram duplicadas**: o site lê diretamente a pasta `../Public/`
existente na raiz do projeto. Isso mantém uma única fonte de verdade para os
arquivos originais.

Se um arquivo for renomeado ou removido de `../Public/`, o site perde aquela
imagem — inclusive as fotos dos veículos. Como o caminho da imagem é escrito
dentro de cada card do `index.html`, trocar ou tirar um carro da frota é uma
edição no HTML: basta apontar o `<img src>` para o arquivo novo e ajustar o
`data-model` (que é o que liga o card ao preço no `config.js`).

---

## O que veio dos materiais fornecidos

**Informações reais** (extraídas apenas dos prints do Instagram — nada foi inventado):

| Dado | Valor |
|---|---|
| Nome | LOK CAR · Locadora de Veículos |
| Instagram | [@lokcar_locadorape](https://www.instagram.com/lokcar_locadorape/) |
| Telefone / WhatsApp | (81) 99753-0453 |
| Localização | Reserva do Paiva · Empresarial Novo Mundo — Cabo de Santo Agostinho, PE |
| Desde | 2014 |
| Diferencial | "Vamos até você" |
| Atendimento | Personalizado, por WhatsApp / Direct |
| Link da bio | contate.me/lokcarpe |

**Não foram criados** (por não constarem nos materiais): quantidade de veículos,
número de clientes, avaliações, preços, tabelas de diárias, depoimentos, condições
comerciais, endereço com número ou estatísticas.

Os nomes de modelo dos veículos vêm dos próprios arquivos de imagem em `/Public`
e dos posts do Instagram. Nenhum dado técnico (motor, câmbio, consumo, ano) foi
atribuído aos carros, já que não existe nos materiais.

**Direção de arte**: herdada do projeto em `../Site de referencia/` —
fundo quase preto, um único acento cromático usado com parcimônia, bordas de 1px,
rótulos minúsculos em caixa alta com muito espaçamento, containers de 1200px,
respiro vertical amplo entre seções, header que escurece ao rolar, imagens com
zoom lento no hover e revelações discretas na rolagem.

**Identidade cromática**: o acento dourado da referência foi substituído pelo
**vermelho institucional da LOK CAR** (`#E11D2E`), coerente com o logo, com os
posts e com a sinalização usada pela locadora. O azul-marinho aparece apenas como
profundidade, nunca como cor de interface.

---

## A logo

A logo foi **recriada como SVG vetorial** (o perfil de carro em linhas, no topo da
marca) porque os prints disponíveis não contêm o arquivo original. É um desenho
próprio inspirado na marca — **não é o arquivo oficial**. Se a LOK CAR fornecer o
logo original (SVG, PDF ou PNG em alta), basta substituir os dois blocos
`<svg class="hdr__logoMark">` / `<svg class="ftr__logoMark">` no `index.html`.

---

## A abertura

Ao abrir o site, uma **abertura curta da marca** (cerca de 3 segundos) centraliza
o nome LOKCAR sobre o fundo escuro e sai em fade, entregando a página no estado
normal — o banner não é tocado em momento nenhum. Não é uma tela de carregamento:
não há barra de progresso nem percentual, é uma assinatura da marca.

Durante a abertura, as animações de entrada do banner ficam **pausadas** e só
começam quando ela termina, para as duas não competirem. Quem tem a preferência
de sistema "reduzir movimento" ativada não vê a abertura — vai direto ao site.

---

## A demonstração de reserva

A seção **"Como funciona"** é uma demonstração visual do futuro sistema, com
front-end real funcionando, em cinco etapas:

1. **Veículo** — cards da frota. Clicar em qualquer card leva à reserva com
   aquele carro já selecionado, sem recarregar a página.
2. **Período** — calendário visual (não há digitação de data). Primeiro a
   retirada, depois a devolução; a faixa mostra o resultado no formato
   "18 set → 21 set" com a contagem de dias. Devolução antes da retirada é
   impossível: clicar num dia anterior reinicia a escolha a partir dele.
3. **Proteção** — quatro opções (nenhuma, Simples, Básica, Completa).
4. **Adicionais** — lavagens e entrega/retirada, em interruptores.
5. **Resumo** — veículo, período, dias, diárias, desconto, proteção, adicionais,
   subtotal e total estimado, atualizando a cada escolha, em formato brasileiro
   (`R$ 1.812,00`).

**Não há backend.** O botão "Enviar solicitação" monta a mensagem com tudo o que
foi escolhido e abre o WhatsApp da locadora. A interface deixa claro que a
confirmação é feita pela equipe.

### Os valores são demonstrativos

Os números que aparecem na tela — diárias, descontos, proteções e adicionais —
**não são a tabela comercial da Lok Car**. Foram criados apenas para a
demonstração funcionar e precisam ser confirmados pelo proprietário antes de o
site ir ao ar.

As proteções são apenas nomes e valores. Não há descrição de cobertura,
franquia, indenização ou promessa de seguro em nenhum ponto do site.

---

## Onde mexer nos valores

**Todo número da simulação está em um único arquivo:** `scripts/config.js`.

| O que você quer mudar | Onde |
|---|---|
| Faixa de diária de um carro | objeto `veiculos` |
| Percentual de desconto por quantidade de dias | array `descontos` |
| Opções e valores de proteção | array `protecoes` |
| Serviços adicionais e preços | array `adicionais` |

Três observações importantes:

- A **chave** de cada veículo em `veiculos` precisa ser escrita exatamente igual
  ao atributo `data-model` do card no `index.html`. Se divergir, aquele carro
  fica sem preço e sem seleção.
- O desconto vale pela **maior** faixa alcançada; a ordem em que as faixas estão
  escritas não altera o resultado.
- O que é **conteúdo** (nome do carro, categoria, descrição da proteção, textos
  da página) fica no `index.html`, para que o proprietário edite o site sem
  abrir um arquivo de script. O `config.js` guarda apenas os **números**.

Para conferir a regra de desconto: 1 dia 0%, 2 dias 3%, 3 dias 5%, 4 a 6 dias
7%, 7 dias ou mais 10%.

---

## Responsividade

Testado por breakpoints em 1200 / 1150 / 1024 / 968 / 768 / 600 / 400px.

- sem rolagem horizontal em nenhuma largura (`overflow-x: hidden` no body como rede
  de segurança, mais contenção real nos grids e `min-width: 0` nos flex)
- menu mobile fecha ao escolher uma opção e com a tecla Esc
- botões com altura mínima de 48px (área de toque confortável)
- imagens preservam o veículo inteiro (`object-fit: contain` nos recortes de catálogo)
- respeita `prefers-reduced-motion`

---

## Próximos passos (fora do escopo desta versão)

Banco de dados, autenticação, painel administrativo, disponibilidade por data,
pagamento e contrato digital. Nada disso foi implementado — são as funcionalidades
a desenvolver caso a proposta seja aprovada.
