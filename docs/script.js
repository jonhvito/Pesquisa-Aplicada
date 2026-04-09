const mindmap = document.querySelector(".mindmap");
const nodes = Array.from(document.querySelectorAll(".node"));

const solverState = {
  target: "",
  relation: "",
  varianceKnown: "",
  varianceEquality: "",
};

const questionButtons = Array.from(document.querySelectorAll(".choice-button"));
const resultTitle = document.querySelector("[data-result-title]");
const resultSummary = document.querySelector("[data-result-summary]");
const resultReason = document.querySelector("[data-result-reason]");
const resultReading = document.querySelector("[data-result-reading]");
const resultTags = document.querySelector("[data-result-tags]");
const resultPath = document.querySelector("[data-solver-path]");
const resultFeedback = document.querySelector("[data-result-feedback]");
const formulaCards = Array.from(document.querySelectorAll("[data-formula-key]"));
const hubChips = Array.from(document.querySelectorAll("[data-hub-target]"));
const caseCards = Array.from(document.querySelectorAll("[data-case-target]"));
const testCards = Array.from(document.querySelectorAll("[data-test-group]"));
const relationPanel = document.querySelector("[data-panel='relation']");
const varianceKnownPanel = document.querySelector("[data-panel='variance-known']");
const varianceEqualityPanel = document.querySelector("[data-panel='variance-equality']");
const resetSolverButton = document.querySelector("[data-reset-solver]");

const practiceTitle = document.querySelector("[data-practice-title]");
const practicePrompt = document.querySelector("[data-practice-prompt]");
const practiceTags = document.querySelector("[data-practice-tags]");
const practiceOptions = document.querySelector("[data-practice-options]");
const practiceFeedback = document.querySelector("[data-practice-feedback]");
const practiceProgress = document.querySelector("[data-practice-progress]");
const practiceScore = document.querySelector("[data-practice-score]");
const practiceLab = document.getElementById("practice-lab");
const practiceCard = document.querySelector(".practice-card-unified");
const practiceStartButton = document.querySelector("[data-practice-start]");
const practiceNextButton = document.querySelector("[data-practice-next]");
const practiceViewRelatedButton = document.querySelector("[data-practice-view-related]");
const floatingReturnButton = document.querySelector("[data-floating-return]");
const practiceModeButtons = Array.from(document.querySelectorAll("[data-practice-mode]"));

const solverQuestions = {
  target: {
    media: "Média",
    proporcao: "Proporção",
    variancia: "Variância",
    categoria: "Categoria",
  },
  relation: {
    independente: "Amostras independentes",
    pareada: "Amostras pareadas",
  },
  varianceKnown: {
    sim: "Variância populacional conhecida",
    nao: "Variância populacional desconhecida",
  },
  varianceEquality: {
    iguais: "Variâncias assumidas iguais",
    diferentes: "Variâncias tratadas como diferentes",
  },
};

const formulaLabelMap = {
  "z-mean": "Z para duas médias",
  "t-pooled": "t com variância combinada",
  "t-welch": "t de Welch",
  "t-paired": "t pareado",
  "z-proportion": "Z para proporções",
  "f-variance": "F para razão de variâncias",
  "chi-variance": "χ² para uma variância",
  "chi-category": "χ² de independência",
  "chi-goodness": "χ² de aderência",
};

const practiceScenarios = [
  {
    title: "Caso 1",
    prompt: "Duas turmas independentes tiveram as médias comparadas, e o enunciado já informa os desvios populacionais de cada grupo.",
    tags: ["Média", "Independentes", "σ conhecida"],
    options: ["z-mean", "t-pooled", "t-welch", "z-proportion"],
    answer: "z-mean",
    explanation: "Quando a questão entrega a variância populacional, a comparação entre médias independentes vai para Z.",
    state: { target: "media", relation: "independente", varianceKnown: "sim" },
  },
  {
    title: "Caso 2",
    prompt: "O mesmo grupo foi medido antes e depois de uma intervenção, e a questão quer saber se houve mudança média.",
    tags: ["Média", "Pareado"],
    options: ["t-paired", "t-pooled", "z-mean", "chi-category"],
    answer: "t-paired",
    explanation: "Antes e depois nas mesmas pessoas vira uma coluna de diferenças, então o teste é t pareado.",
    state: { target: "media", relation: "pareada" },
  },
  {
    title: "Caso 3",
    prompt: "O enunciado compara porcentagens de aprovação entre dois grupos independentes.",
    tags: ["Proporção", "Dois grupos"],
    options: ["z-proportion", "z-mean", "chi-goodness", "f-variance"],
    answer: "z-proportion",
    explanation: "Percentual, taxa ou aprovação entre grupos normalmente indica comparação de proporções com Z.",
    state: { target: "proporcao" },
  },
  {
    title: "Caso 4",
    prompt: "Uma tabela cruza tratamento e cura, e a pergunta é se existe associação entre as categorias.",
    tags: ["Categorias", "Tabela de contingência"],
    options: ["chi-category", "chi-goodness", "z-proportion", "chi-variance"],
    answer: "chi-category",
    explanation: "Tabela cruzada com duas variáveis categóricas puxa qui-quadrado de independência.",
    state: { target: "categoria" },
  },
  {
    title: "Caso 5",
    prompt: "A empresa quer testar se as frequências observadas de preferência seguem as proporções teóricas esperadas pela marca.",
    tags: ["Observado vs esperado", "Aderência"],
    options: ["chi-goodness", "chi-category", "f-variance", "z-proportion"],
    answer: "chi-goodness",
    explanation: "Quando a comparação é observado contra esperado teórico, o caminho é χ² de aderência.",
    state: { target: "categoria" },
  },
  {
    title: "Caso 6",
    prompt: "Dois métodos independentes têm médias comparadas; a variância populacional é desconhecida, e o enunciado manda assumir variâncias iguais.",
    tags: ["Média", "Independentes", "Homocedasticidade"],
    options: ["t-pooled", "t-welch", "z-mean", "t-paired"],
    answer: "t-pooled",
    explanation: "Sem variância populacional conhecida, você vai para t. Se as variâncias são iguais, use a versão com variância combinada.",
    state: {
      target: "media",
      relation: "independente",
      varianceKnown: "nao",
      varianceEquality: "iguais",
    },
  },
  {
    title: "Caso 7",
    prompt: "A questão pede comparar a variabilidade de dois processos usando a razão entre variâncias amostrais.",
    tags: ["Variância", "Razão"],
    options: ["f-variance", "chi-variance", "t-welch", "chi-category"],
    answer: "f-variance",
    explanation: "Razão de variâncias é o caso clássico da distribuição F.",
    state: { target: "variancia" },
  },
  {
    title: "Caso 8",
    prompt: "Duas rações foram comparadas em grupos independentes, e o enunciado informa os desvios padrão populacionais dos dois grupos antes de pedir um teste de hipótese bilateral.",
    tags: ["Média", "Teste bilateral", "σ conhecida"],
    options: ["z-mean", "t-pooled", "t-welch", "z-proportion"],
    answer: "z-mean",
    explanation: "Mesmo sendo teste de hipótese, a chave continua sendo Z quando as variâncias populacionais são conhecidas.",
    state: { target: "media", relation: "independente", varianceKnown: "sim" },
  },
  {
    title: "Caso 9",
    prompt: "Dois métodos de ensino são comparados, as amostras são independentes, os desvios vieram das amostras e o enunciado manda assumir variâncias iguais para testar se o método novo é melhor.",
    tags: ["Média", "Independentes", "Teste unilateral"],
    options: ["t-pooled", "t-welch", "z-mean", "t-paired"],
    answer: "t-pooled",
    explanation: "Sem σ populacional conhecida e com homocedasticidade assumida, o teste vai para t com variância combinada.",
    state: {
      target: "media",
      relation: "independente",
      varianceKnown: "nao",
      varianceEquality: "iguais",
    },
  },
  {
    title: "Caso 10",
    prompt: "Um programa de perda de peso foi avaliado antes e depois nos mesmos participantes, e a pergunta é se houve redução média significativa.",
    tags: ["Média", "Pareado", "Teste unilateral"],
    options: ["t-paired", "t-pooled", "z-mean", "chi-variance"],
    answer: "t-paired",
    explanation: "Antes e depois nas mesmas pessoas continua sendo um problema de diferenças pareadas, agora em formato de teste.",
    state: { target: "media", relation: "pareada" },
  },
  {
    title: "Caso 11",
    prompt: "Dois tratamentos para pressão arterial foram comparados em grupos independentes, com desvios amostrais diferentes e populações normais, para testar se o tratamento A reduz mais.",
    tags: ["Média", "Independentes", "Variâncias diferentes"],
    options: ["t-welch", "t-pooled", "z-mean", "z-proportion"],
    answer: "t-welch",
    explanation: "Quando as variâncias são desconhecidas e tratadas como diferentes, o caminho certo é t de Welch.",
    state: {
      target: "media",
      relation: "independente",
      varianceKnown: "nao",
      varianceEquality: "diferentes",
    },
  },
  {
    title: "Caso 12",
    prompt: "Uma pesquisa eleitoral quer testar se a proporção de votos em um candidato é maior em uma cidade do que em outra.",
    tags: ["Proporção", "Teste unilateral", "Duas cidades"],
    options: ["z-proportion", "z-mean", "chi-category", "f-variance"],
    answer: "z-proportion",
    explanation: "Comparação entre proporções populacionais de dois grupos grandes continua no teste Z com proporção combinada sob H₀.",
    state: { target: "proporcao" },
  },
  {
    title: "Caso 13",
    prompt: "Um laboratório quer verificar se um método tem variabilidade maior que outro, comparando diretamente as variâncias de duas amostras normais independentes.",
    tags: ["Variância", "Teste unilateral", "Duas amostras"],
    options: ["f-variance", "chi-variance", "t-welch", "chi-goodness"],
    answer: "f-variance",
    explanation: "Teste sobre comparação entre duas variâncias de populações normais usa a distribuição F.",
    state: { target: "variancia" },
  },
  {
    title: "Caso 14",
    prompt: "Uma empresa cruza tipo de plano e satisfação do cliente em uma tabela de contingência para verificar se existe associação entre as categorias.",
    tags: ["Categorias", "Tabela de contingência", "Associação"],
    options: ["chi-category", "chi-goodness", "z-proportion", "chi-variance"],
    answer: "chi-category",
    explanation: "Duas variáveis categóricas cruzadas em tabela pedem qui-quadrado de independência.",
    state: { target: "categoria" },
  },
  {
    title: "Caso 15",
    prompt: "Um supermercado quer saber se três embalagens são igualmente preferidas, comparando frequências observadas com uma distribuição uniforme esperada.",
    tags: ["Observado vs esperado", "Uniforme", "Aderência"],
    options: ["chi-goodness", "chi-category", "z-proportion", "f-variance"],
    answer: "chi-goodness",
    explanation: "Quando a hipótese nula define proporções teóricas esperadas, o teste correto é o χ² de aderência.",
    state: { target: "categoria" },
  },
  {
    title: "Caso 16",
    prompt: "Um estudo clínico compara três tratamentos e registra, para cada um, quantos pacientes curaram e quantos não curaram, buscando associação entre tratamento e cura.",
    tags: ["Categorias", "Tratamento x cura", "Independência"],
    options: ["chi-category", "chi-goodness", "z-proportion", "t-pooled"],
    answer: "chi-category",
    explanation: "Mesmo com três tratamentos, a lógica continua sendo independência em tabela de contingência.",
    state: { target: "categoria" },
  },
];

const practiceState = {
  mode: "guided",
  active: false,
  answered: false,
  index: -1,
  indices: [],
  current: 0,
  score: 0,
  answers: [],
};

function clearFocus() {
  if (!mindmap) {
    return;
  }

  mindmap.classList.remove("is-focused");
  nodes.forEach((node) => {
    node.classList.remove("is-active");
    node.setAttribute("aria-pressed", "false");
  });
}

function clearLinkedHighlights() {
  nodes.forEach((node) => node.classList.remove("is-linked"));
  formulaCards.forEach((card) => card.classList.remove("is-highlighted"));
  caseCards.forEach((card) => card.classList.remove("is-highlighted"));
  testCards.forEach((card) => card.classList.remove("is-highlighted"));
}

function toggleNode(node) {
  if (!mindmap) {
    return;
  }

  if (node.classList.contains("is-active")) {
    clearFocus();
    return;
  }

  mindmap.classList.add("is-focused");
  nodes.forEach((item) => {
    const isCurrent = item === node;
    item.classList.toggle("is-active", isCurrent);
    item.setAttribute("aria-pressed", String(isCurrent));
  });
}

function focusNodeById(nodeId) {
  const node = document.getElementById(nodeId);
  if (!node) {
    return;
  }

  toggleNode(node);
  node.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function setPanelVisibility(panel, visible) {
  if (panel) {
    panel.classList.toggle("is-hidden", !visible);
  }
}

function setSelectedButton(question, value) {
  questionButtons.forEach((button) => {
    const sameQuestion = button.parentElement.dataset.question === question;
    const isSelected = sameQuestion && button.dataset.value === value;
    button.classList.toggle("is-selected", isSelected);
    button.setAttribute("aria-pressed", String(isSelected));
  });
}

function resetDependentState(fromKey) {
  const order = ["target", "relation", "varianceKnown", "varianceEquality"];
  const fromIndex = order.indexOf(fromKey);

  order.slice(fromIndex + 1).forEach((key) => {
    solverState[key] = "";
    setSelectedButton(key, "__none__");
  });
}

function updateVisibleQuestions() {
  const { target, relation, varianceKnown } = solverState;

  setPanelVisibility(relationPanel, target === "media");
  setPanelVisibility(varianceKnownPanel, target === "media" && relation === "independente");
  setPanelVisibility(
    varianceEqualityPanel,
    target === "media" && relation === "independente" && varianceKnown === "nao"
  );
}

function paintTags(container, tags) {
  if (!container) {
    return;
  }

  container.innerHTML = "";
  tags.forEach((tag) => {
    const element = document.createElement("span");
    element.className = "result-tag";
    element.textContent = tag;
    container.appendChild(element);
  });
}

function paintHubSelection() {
  hubChips.forEach((chip) => {
    const isSelected = chip.dataset.hubTarget === solverState.target;
    chip.classList.toggle("is-selected", isSelected);
    chip.setAttribute("aria-pressed", String(isSelected));
  });
}

function getPathLabels() {
  const order = ["target", "relation", "varianceKnown", "varianceEquality"];
  return order
    .filter((key) => solverState[key])
    .map((key) => solverQuestions[key][solverState[key]]);
}

function paintPath() {
  if (!resultPath) {
    return;
  }

  const labels = getPathLabels();
  resultPath.innerHTML = "";

  if (!labels.length) {
    const empty = document.createElement("span");
    empty.className = "path-chip is-empty";
    empty.textContent = "Escolha um caminho para montar a trilha de decisão.";
    resultPath.appendChild(empty);
    return;
  }

  labels.forEach((label) => {
    const element = document.createElement("span");
    element.className = "path-chip";
    element.textContent = label;
    resultPath.appendChild(element);
  });
}

function getDecision() {
  const { target, relation, varianceKnown, varianceEquality } = solverState;

  if (!target) {
    return {
      title: "Responda as perguntas acima",
      summary: "O site vai montar o caminho lógico e dizer qual distribuição usar.",
      reason: "Comece pelo tipo de variável. Depois o assistente restringe as opções.",
      reading: "O objetivo aqui é sair de “decorar tudo” para “decidir pelo enunciado”.",
      feedback: "Cada resposta reduz as opções até sobrar a distribuição certa.",
      tags: ["Sem resposta ainda"],
      formulas: [],
      focusNodes: [],
      testGroups: [],
    };
  }

  if (target === "proporcao") {
    return {
      title: "Use Z para diferença de proporções",
      summary: "Comparou porcentagens, taxas, aprovação, votos ou sucesso? O caminho padrão é Z.",
      reason:
        "Para proporções, a prova normalmente trabalha com aproximação normal. No teste de hipótese, sob H₀, use a proporção combinada p̂.",
      reading:
        "Leitura de prova: se o enunciado fala em percentuais de dois grupos, pense em Z antes de qualquer outra letra.",
      feedback: "Aqui a palavra-chave é porcentagem: você não está estimando média, e sim proporção.",
      tags: ["Proporção", "Z", "IC e TH"],
      formulas: ["z-proportion"],
      focusNodes: ["proporcoes"],
      testGroups: ["proporcao"],
    };
  }

  if (target === "categoria") {
    return {
      title: "Use χ² para categorias",
      summary: "Se a questão trabalha com frequências observadas, pode ser independência em tabela ou aderência a uma distribuição esperada.",
      reason:
        "No χ² de independência você compara categorias em tabela. No χ² de aderência você compara observado contra esperado teórico.",
      reading:
        "Leitura de prova: tabela cruzada puxa independência; distribuição esperada, uniformidade ou proporções teóricas puxam aderência.",
      feedback: "O cuidado aqui é separar tabela de contingência de observado vs esperado teórico. A conta-base do χ² é a mesma.",
      tags: ["Categoria", "Qui-Quadrado", "Independência ou aderência"],
      formulas: ["chi-category", "chi-goodness"],
      focusNodes: ["qui-quadrado"],
      testGroups: ["chi"],
    };
  }

  if (target === "variancia") {
    return {
      title: "Pense em χ² ou F",
      summary: "Para variância, a decisão depende se a questão trata de uma só variância ou comparação entre duas.",
      reason:
        "Uma variância isolada costuma apontar para χ². Comparação entre duas variâncias aponta para F, porque a estatística é uma razão.",
      reading:
        "Leitura de prova: se aparecer “razão de variâncias” ou “comparar variâncias”, puxe F. Se for só uma variância, puxe χ².",
      feedback: "Quando o enunciado fala em precisão, dispersão ou razão de variâncias, você saiu do terreno de médias.",
      tags: ["Variância", "χ² ou F", "Valores positivos"],
      formulas: ["f-variance", "chi-variance"],
      focusNodes: ["distribuicoes"],
      testGroups: [],
    };
  }

  if (target === "media" && !relation) {
    return {
      title: "Agora decida se as amostras são independentes ou pareadas",
      summary: "Para médias, essa é a bifurcação mais importante antes da distribuição.",
      reason:
        "Mesmo grupo antes/depois vira pareado. Grupos diferentes, como turma A e turma B, são independentes.",
      reading: "Se a mesma pessoa aparece duas vezes no enunciado, quase sempre é pareado.",
      feedback: "Você já sabe que é média; agora precisa identificar o desenho da coleta.",
      tags: ["Média", "Falta decidir o desenho"],
      formulas: [],
      focusNodes: ["medias"],
      testGroups: ["medias"],
    };
  }

  if (target === "media" && relation === "pareada") {
    return {
      title: "Use t nas diferenças",
      summary: "Amostra pareada não é tratada como dois grupos independentes.",
      reason:
        "Transforme os dados em uma única coluna de diferenças d = depois - antes e teste se a média dessas diferenças é zero.",
      reading:
        "Leitura de prova: o nome da jogada é reduzir o problema a um teste t de uma amostra sobre d.",
      feedback: "O detalhe decisivo é o reaproveitamento das mesmas unidades. Isso elimina a comparação direta grupo a grupo.",
      tags: ["Média", "Pareada", "t", "μd = 0"],
      formulas: ["t-paired"],
      focusNodes: ["medias"],
      testGroups: ["medias"],
    };
  }

  if (target === "media" && relation === "independente" && !varianceKnown) {
    return {
      title: "Agora veja se a variância populacional é conhecida",
      summary: "Para médias independentes, a letra muda aqui: Z se conhece σ², t se não conhece.",
      reason:
        "A presença ou ausência da variância populacional define se você usa a normal padrão ou a t de Student.",
      reading:
        "Se o enunciado só entrega o desvio da amostra, trate como variância desconhecida.",
      feedback: "A próxima decisão não é sobre a média em si, mas sobre a informação disponível no enunciado.",
      tags: ["Média", "Independentes", "Falta decidir σ²"],
      formulas: [],
      focusNodes: ["medias"],
      testGroups: ["medias"],
    };
  }

  if (target === "media" && relation === "independente" && varianceKnown === "sim") {
    return {
      title: "Use Z para médias independentes",
      summary: "Duas médias com variâncias populacionais conhecidas puxam Z.",
      reason:
        "Esse é o caso mais direto para comparação de médias entre grupos independentes.",
      reading: "Leitura de prova: se o enunciado já traz σ²₁ e σ²₂, não invente t.",
      feedback: "A informação de σ² conhecida encerra a dúvida: o atalho aqui é Z.",
      tags: ["Média", "Independentes", "σ² conhecida", "Z"],
      formulas: ["z-mean"],
      focusNodes: ["medias"],
      testGroups: ["medias"],
    };
  }

  if (
    target === "media" &&
    relation === "independente" &&
    varianceKnown === "nao" &&
    !varianceEquality
  ) {
    return {
      title: "Agora veja se as variâncias podem ser tratadas como iguais",
      summary: "Sem σ² conhecida, você vai para t. Falta decidir qual versão.",
      reason:
        "Se as variâncias forem consideradas iguais, use variância combinada. Se forem diferentes, use a lógica de Welch.",
      reading: "Leitura de prova: a frase “assuma variâncias iguais” muda o caminho.",
      feedback: "Você já saiu do Z. Falta apenas escolher entre pooled e Welch.",
      tags: ["Média", "t", "Falta decidir igualdade"],
      formulas: [],
      focusNodes: ["medias"],
      testGroups: ["medias"],
    };
  }

  if (
    target === "media" &&
    relation === "independente" &&
    varianceKnown === "nao" &&
    varianceEquality === "iguais"
  ) {
    return {
      title: "Use t com variância combinada",
      summary: "Duas médias independentes, σ² desconhecida e variâncias assumidas iguais.",
      reason: "Aqui você calcula a variância misturada S²p e segue com t de Student.",
      reading:
        "Leitura de prova: se o enunciado disser que as variâncias são iguais, esse é o caso clássico de pooled t.",
      feedback: "A hipótese de variâncias iguais é o detalhe que autoriza juntar a informação das duas amostras.",
      tags: ["Média", "Independentes", "t", "S²p"],
      formulas: ["t-pooled"],
      focusNodes: ["medias"],
      testGroups: ["medias"],
    };
  }

  return {
    title: "Use t com a lógica de Welch",
    summary: "Duas médias independentes, σ² desconhecida e variâncias diferentes.",
    reason:
      "Você continua no mundo da t, mas sem juntar variâncias. Os graus de liberdade ficam aproximados.",
    reading: "Leitura de prova: quando o enunciado aponta variâncias diferentes, pense em Welch.",
    feedback: "Sem homocedasticidade, a versão segura é Welch.",
    tags: ["Média", "Independentes", "t", "Welch"],
    formulas: ["t-welch"],
    focusNodes: ["medias"],
    testGroups: ["medias"],
  };
}

function matchesCurrentCase(card) {
  if (card.dataset.caseTarget !== solverState.target) {
    return false;
  }

  const relationMatch = !card.dataset.caseRelation || card.dataset.caseRelation === solverState.relation;
  const varianceKnownMatch =
    !card.dataset.caseVarianceKnown || card.dataset.caseVarianceKnown === solverState.varianceKnown;
  const varianceEqualityMatch =
    !card.dataset.caseVarianceEquality ||
    card.dataset.caseVarianceEquality === solverState.varianceEquality;

  return relationMatch && varianceKnownMatch && varianceEqualityMatch;
}

function highlightLinkedContent(decision) {
  clearLinkedHighlights();

  formulaCards.forEach((card) => {
    card.classList.toggle("is-highlighted", decision.formulas.includes(card.dataset.formulaKey));
  });

  nodes.forEach((node) => {
    node.classList.toggle("is-linked", decision.focusNodes.includes(node.id));
  });

  caseCards.forEach((card) => {
    card.classList.toggle("is-highlighted", matchesCurrentCase(card));
  });

  testCards.forEach((card) => {
    const groups = (card.dataset.testGroup || "").split(/\s+/).filter(Boolean);
    const isMatch =
      decision.testGroups.length > 0 &&
      groups.some((group) => decision.testGroups.includes(group));
    card.classList.toggle("is-highlighted", isMatch);
  });
}

function renderDecision() {
  updateVisibleQuestions();

  const decision = getDecision();
  resultTitle.textContent = decision.title;
  resultSummary.textContent = decision.summary;
  resultReason.textContent = decision.reason;
  resultReading.textContent = decision.reading;
  resultFeedback.textContent = decision.feedback;
  paintTags(resultTags, decision.tags);
  paintPath();
  paintHubSelection();
  highlightLinkedContent(decision);
}

function applySolverState(nextState) {
  resetSolver();

  Object.entries(nextState).forEach(([key, value]) => {
    if (key in solverState && value) {
      solverState[key] = value;
      setSelectedButton(key, value);
    }
  });

  renderDecision();
}

function resetSolver() {
  Object.keys(solverState).forEach((key) => {
    solverState[key] = "";
  });

  questionButtons.forEach((button) => {
    button.classList.remove("is-selected");
    button.setAttribute("aria-pressed", "false");
  });

  clearLinkedHighlights();
  renderDecision();
}

function renderOptionButtons(container, options, onSelect) {
  container.innerHTML = "";

  options.forEach((key) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "choice-button practice-option";
    button.textContent = formulaLabelMap[key];
    button.dataset.optionValue = key;
    button.addEventListener("click", () => onSelect(button, key));
    container.appendChild(button);
  });
}

function shuffle(items) {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }
  return copy;
}

function pickRandomScenarioIndex() {
  if (practiceScenarios.length === 1) {
    return 0;
  }

  let nextIndex = Math.floor(Math.random() * practiceScenarios.length);
  while (nextIndex === practiceState.index) {
    nextIndex = Math.floor(Math.random() * practiceScenarios.length);
  }
  return nextIndex;
}

function getCurrentScenario() {
  if (practiceState.mode === "guided") {
    return practiceScenarios[practiceState.index];
  }
  return practiceScenarios[practiceState.indices[practiceState.current]];
}

function getScenarioFocusNodeId(scenario) {
  if (!scenario) {
    return "";
  }

  const focusMap = {
    media: "medias",
    proporcao: "proporcoes",
    variancia: "distribuicoes",
    categoria: "qui-quadrado",
  };

  return focusMap[scenario.state.target] || "";
}

function setFloatingReturnVisible(visible) {
  if (!floatingReturnButton) {
    return;
  }

  floatingReturnButton.classList.toggle("is-hidden", !visible);
}

function flashPracticeCard() {
  if (!practiceCard) {
    return;
  }

  practiceCard.classList.remove("return-highlight");
  void practiceCard.offsetWidth;
  practiceCard.classList.add("return-highlight");
}

function setPracticeMode(mode) {
  practiceState.mode = mode;
  practiceState.active = false;
  practiceState.answered = false;
  practiceState.index = -1;
  practiceState.indices = [];
  practiceState.current = 0;
  practiceState.score = 0;
  practiceState.answers = [];

  practiceModeButtons.forEach((button) => {
    const isSelected = button.dataset.practiceMode === mode;
    button.classList.toggle("is-selected", isSelected);
    button.setAttribute("aria-pressed", String(isSelected));
  });

  paintTags(practiceTags, []);
  practiceOptions.innerHTML = "";
  practiceScore.hidden = true;
  practiceScore.textContent = "";
  practiceNextButton.disabled = true;
  practiceNextButton.textContent = "Próximo";
  if (practiceViewRelatedButton) {
    practiceViewRelatedButton.disabled = true;
  }

  if (mode === "guided") {
    practiceTitle.textContent = "Modo guiado";
    practicePrompt.textContent =
      "Você recebe um caso curto, escolhe a distribuição e vê na hora o porquê. O foco aqui é aprender o caminho.";
    practiceFeedback.className = "practice-feedback";
    practiceFeedback.textContent = "No modo guiado, cada resposta sincroniza o assistente e destaca os blocos certos.";
    practiceProgress.textContent = "Aprendizado livre";
    practiceStartButton.textContent = "Começar";
    return;
  }

  practiceTitle.textContent = "Modo teste";
  practicePrompt.textContent =
    "Aqui você responde 5 perguntas seguidas sem ajuda prévia. No final, aparece a pontuação e um resumo dos erros.";
  practiceFeedback.className = "practice-feedback";
  practiceFeedback.textContent = "No modo teste, o objetivo é medir se você reconhece o enunciado sem apoio.";
  practiceProgress.textContent = "Pronto para avaliar";
  practiceStartButton.textContent = "Iniciar teste";
}

function syncScenarioToPage(scenario) {
  clearFocus();
  applySolverState(scenario.state);
}

function finishTestMode() {
  const misses = practiceState.answers.filter((answer) => !answer.correct);
  const summary = misses.length
    ? misses
        .map((answer) => `Você marcou ${answer.answer}, mas o esperado era ${answer.expected}.`)
        .join(" ")
    : "Sequência limpa. Você acertou todas as leituras de enunciado.";

  practiceTitle.textContent = "Resultado do teste";
  practicePrompt.textContent = "Você pode reiniciar para tentar outra sequência de 5 perguntas.";
  practiceFeedback.className = "practice-feedback is-success";
  practiceFeedback.textContent = "Teste encerrado. Revise os destaques do assistente para reforçar os pontos cobrados.";
  practiceProgress.textContent = "Teste finalizado";
  practiceScore.hidden = false;
  practiceScore.textContent = `Pontuação: ${practiceState.score}/${practiceState.indices.length}. ${summary}`;
  practiceNextButton.disabled = true;
  practiceNextButton.textContent = "Próximo";
  if (practiceViewRelatedButton) {
    practiceViewRelatedButton.disabled = false;
  }
}

function handlePracticeAnswer(button, key) {
  if (practiceState.answered) {
    return;
  }

  const scenario = getCurrentScenario();
  if (!scenario) {
    return;
  }

  practiceState.answered = true;
  const isCorrect = key === scenario.answer;

  Array.from(practiceOptions.children).forEach((item) => {
    const option = item;
    option.disabled = true;
    if (option.dataset.optionValue === scenario.answer) {
      option.classList.add("is-correct");
    } else if (option === button && !isCorrect) {
      option.classList.add("is-wrong");
    }
  });

  if (practiceState.mode === "test" && isCorrect) {
    practiceState.score += 1;
  }

  if (practiceState.mode === "test") {
    practiceState.answers.push({
      correct: isCorrect,
      answer: formulaLabelMap[key],
      expected: formulaLabelMap[scenario.answer],
    });
  }

  practiceFeedback.className = `practice-feedback ${isCorrect ? "is-success" : "is-error"}`;
  practiceFeedback.textContent = `${isCorrect ? "Certo." : "Quase."} ${scenario.explanation}`;
  if (practiceViewRelatedButton) {
    practiceViewRelatedButton.disabled = !getScenarioFocusNodeId(scenario);
  }

  syncScenarioToPage(scenario);

  if (practiceState.mode === "guided") {
    practiceNextButton.disabled = false;
    return;
  }

  const isLastQuestion = practiceState.current === practiceState.indices.length - 1;
  practiceNextButton.disabled = false;
  practiceNextButton.textContent = isLastQuestion ? "Ver resultado" : "Próximo";
}

function renderPracticeScenario(scenario) {
  practiceTitle.textContent =
    practiceState.mode === "guided"
      ? `${scenario.title}: escolha a distribuição`
      : `Pergunta ${practiceState.current + 1}: escolha a distribuição`;
  practicePrompt.textContent = scenario.prompt;
  paintTags(practiceTags, scenario.tags);
  practiceFeedback.className = "practice-feedback";
  practiceFeedback.textContent =
    practiceState.mode === "guided"
      ? "Escolha uma opção. Se acertar, o site mostra o raciocínio e sincroniza os destaques."
      : "Responda sem ajuda. O feedback entra logo depois da escolha.";
  practiceScore.hidden = true;
  practiceScore.textContent = "";
  practiceNextButton.disabled = true;
  practiceNextButton.textContent = "Próximo";
  if (practiceViewRelatedButton) {
    practiceViewRelatedButton.disabled = true;
  }

  if (practiceState.mode === "guided") {
    practiceProgress.textContent = "Aprendizado livre";
  } else {
    practiceProgress.textContent = `${practiceState.current + 1} de ${practiceState.indices.length}`;
  }

  renderOptionButtons(practiceOptions, scenario.options, handlePracticeAnswer);
}

function startPractice() {
  practiceState.active = true;
  practiceState.answered = false;

  if (practiceState.mode === "guided") {
    practiceState.index = pickRandomScenarioIndex();
    renderPracticeScenario(practiceScenarios[practiceState.index]);
    return;
  }

  practiceState.indices = shuffle(practiceScenarios.map((_, index) => index)).slice(0, 5);
  practiceState.current = 0;
  practiceState.score = 0;
  practiceState.answers = [];
  renderPracticeScenario(practiceScenarios[practiceState.indices[0]]);
}

function advancePractice() {
  if (!practiceState.active || !practiceState.answered) {
    return;
  }

  if (practiceState.mode === "guided") {
    practiceState.answered = false;
    practiceState.index = pickRandomScenarioIndex();
    renderPracticeScenario(practiceScenarios[practiceState.index]);
    return;
  }

  const isLastQuestion = practiceState.current === practiceState.indices.length - 1;
  if (isLastQuestion) {
    finishTestMode();
    return;
  }

  practiceState.answered = false;
  practiceState.current += 1;
  renderPracticeScenario(practiceScenarios[practiceState.indices[practiceState.current]]);
}

questionButtons.forEach((button) => {
  button.setAttribute("aria-pressed", "false");
  button.addEventListener("click", () => {
    const question = button.parentElement.dataset.question;
    const value = button.dataset.value;

    resetDependentState(question);
    solverState[question] = value;
    setSelectedButton(question, value);
    renderDecision();
  });
});

if (resetSolverButton) {
  resetSolverButton.addEventListener("click", resetSolver);
}

hubChips.forEach((chip) => {
  chip.setAttribute("aria-pressed", "false");
  chip.addEventListener("click", () => {
    const target = chip.dataset.hubTarget;
    resetDependentState("target");
    solverState.target = target;
    setSelectedButton("target", target);
    renderDecision();

    const nodeMap = {
      media: "medias",
      proporcao: "proporcoes",
      variancia: "distribuicoes",
      categoria: "qui-quadrado",
    };

    if (nodeMap[target]) {
      focusNodeById(nodeMap[target]);
    }
  });
});

caseCards.forEach((card) => {
  const actionButtons = Array.from(card.querySelectorAll(".case-button"));
  const applyButton = actionButtons.find((button) => !button.hasAttribute("data-case-explain"));
  const explainButton = card.querySelector("[data-case-explain]");
  const resolution = card.querySelector(".case-resolution");

  if (applyButton) {
    applyButton.addEventListener("click", () => {
      applySolverState({
        target: card.dataset.caseTarget || "",
        relation: card.dataset.caseRelation || "",
        varianceKnown: card.dataset.caseVarianceKnown || "",
        varianceEquality: card.dataset.caseVarianceEquality || "",
      });

      const focusId = card.dataset.caseFocus;
      if (focusId) {
        focusNodeById(focusId);
      }
    });
  }

  if (explainButton && resolution) {
    explainButton.addEventListener("click", () => {
      const isHidden = resolution.classList.toggle("is-hidden");
      explainButton.textContent = isHidden ? "Mostrar resolução" : "Ocultar resolução";
    });
  }
});

nodes.forEach((node) => {
  node.addEventListener("click", () => toggleNode(node));
  node.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      toggleNode(node);
    }
  });
});

practiceModeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    setPracticeMode(button.dataset.practiceMode);
  });
});

if (practiceStartButton) {
  practiceStartButton.addEventListener("click", startPractice);
}

if (practiceNextButton) {
  practiceNextButton.addEventListener("click", advancePractice);
}

if (practiceViewRelatedButton) {
  practiceViewRelatedButton.addEventListener("click", () => {
    const scenario = getCurrentScenario();
    const nodeId = getScenarioFocusNodeId(scenario);
    if (nodeId) {
      focusNodeById(nodeId);
      setFloatingReturnVisible(true);
    }
  });
}

if (floatingReturnButton) {
  floatingReturnButton.addEventListener("click", () => {
    if (practiceLab) {
      practiceLab.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    setFloatingReturnVisible(false);
    flashPracticeCard();
  });
}

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    clearFocus();
  }
});

document.addEventListener("DOMContentLoaded", () => {
  if (window.renderMathInElement) {
    window.renderMathInElement(document.body, {
      delimiters: [
        { left: "$$", right: "$$", display: true },
        { left: "\\(", right: "\\)", display: false },
      ],
      throwOnError: false,
    });
  }
});

setPracticeMode("guided");
setFloatingReturnVisible(false);
renderDecision();
