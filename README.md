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
├── Public/                 # as imagens originais (P maiúsculo — ver abaixo)
├── assets/
│   └── favicon.svg         # ícone da aba (logo recriada em SVG)
├── scripts/
│   ├── config.js           # TODOS os números da simulação (ver abaixo)
│   └── app.js              # intro, header, menu, reveal, área do cliente, reserva
└── styles/
    ├── base.css            # tokens, reset, tipografia, botões, utilidades
    ├── intro.css           # abertura cinematográfica da marca
    ├── header.css          # navegação fixa + menu mobile + acesso à área do cliente
    ├── hero.css            # hero + faixa de diferenciais
    ├── fleet.css           # grade de veículos
    ├── booking.css         # demonstração do sistema de reservas
    ├── brand.css           # destaque da marca + modelos complementares
    ├── cta.css             # fechamento e contatos
    ├── client.css          # área do cliente: login + prévia (demonstração)
    ├── footer.css          # rodapé
    └── responsive.css      # media queries (carregado por último)
```

As imagens **não foram duplicadas**: o site lê diretamente a pasta `Public/`
que fica ao lado do `index.html`, dentro de `lokcar-site/`. Isso mantém uma
única fonte de verdade para os arquivos originais.

Atenção à capitalização: a pasta é **`Public`**, com P maiúsculo. Em
Linux/Vercel `Public` e `public` são caminhos diferentes, e renomear a pasta
quebra todas as imagens do site.

Se um arquivo for renomeado ou removido de `Public/`, o site perde aquela
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

A logo hoje é **só tipografia**: o nome LOKCAR e a linha "LOCADORA DE VEÍCULOS",
nas classes `.hdr__wordmark` / `.hdr__wordmarkSub` (header) e `.ftr__wordmark` /
`.ftr__wordmarkSub` (rodapé). O desenho de carro que ficava acima do nome foi
removido a pedido — era um desenho próprio inspirado na marca, não o arquivo
oficial. Se a LOK CAR fornecer o logo original (SVG, PDF ou PNG em alta), basta
inserir o arquivo nesses dois pontos e ajustar o espaço vertical entre o símbolo
e o nome.

---

## A área do cliente (demonstração)

No header (e no menu do celular) existe o acesso **Área do cliente**. Ele abre
uma tela de login — e-mail, senha com o olho de mostrar/ocultar, "manter
conectado", "esqueceu sua senha" e o botão Entrar — que dá passagem para uma
prévia da área logada: minhas reservas, histórico, meus dados e suporte.

**Não existe autenticação.** Não há backend, banco, sessão, cookie nem API.
Nada é validado, nada é guardado e nada é enviado a lugar nenhum. O botão
Entrar só confere se os campos estão vazios; qualquer e-mail e qualquer senha
passam. Nenhuma credencial existe no código, e os textos na tela dizem isso com
todas as letras.

A reserva que aparece na prévia é fictícia, e é rotulada como tal: o histórico
e os dados vêm vazios de propósito, porque inventar locação ou dado pessoal de
cliente seria mentira sobre o negócio.

---

## A abertura

Ao abrir o site, uma **abertura curta da marca** (cerca de 4 segundos), em duas
passadas: primeiro o nome LOKCAR entra desfocado e assenta no lugar; depois um
fio de luz cresce sob ele e a frase **"Levamos o carro até você."** aparece; por
fim tudo se dissolve e o site está lá.

Não é uma tela de carregamento: não há barra, porcentagem, spinner nem
contagem. E não há desenho — nenhum carro, silhueta ou ícone. A abertura é só
tipografia, luz e movimento, e o banner não é tocado em momento nenhum.

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

### O hero no celular

No desktop a foto do hero é fundo de tela cheia, com o texto por cima. Em pé,
numa tela estreita, essa mesma composição obrigava a cortar a foto quase toda —
o carro virava um recorte de porta, e o texto ainda ocupava o quadro inteiro.

Em telas de até 768px o hero se reorganiza: a foto passa a ser uma **faixa no
topo**, na mesma proporção do arquivo, então o carro aparece inteiro; o texto
desce para a área escura logo abaixo, com espaçamentos mais curtos; e um
degradê faz a emenda entre a foto e o fundo. A imagem é a mesma, os textos são
os mesmos e **o hero do desktop não muda em nada**.

---

## Próximos passos (fora do escopo desta versão)

Banco de dados, autenticação de verdade, painel administrativo, disponibilidade
por data, pagamento e contrato digital. Nada disso foi implementado — são as
funcionalidades a desenvolver caso a proposta seja aprovada. A área do cliente
que existe hoje é apenas a demonstração descrita acima: a porta, não a casa.
