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
const formulaCards = Array.from(document.querySelectorAll("[data-formula-key]"));
const hubChips = Array.from(document.querySelectorAll("[data-hub-target]"));
const caseCards = Array.from(document.querySelectorAll("[data-case-target]"));
const relationPanel = document.querySelector("[data-panel='relation']");
const varianceKnownPanel = document.querySelector("[data-panel='variance-known']");
const varianceEqualityPanel = document.querySelector("[data-panel='variance-equality']");
const resetSolverButton = document.querySelector("[data-reset-solver]");

function clearFocus() {
  mindmap.classList.remove("is-focused");
  nodes.forEach((node) => {
    node.classList.remove("is-active");
    node.setAttribute("aria-pressed", "false");
  });
}

function toggleNode(node) {
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
  if (!panel) {
    return;
  }

  panel.classList.toggle("is-hidden", !visible);
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
  const target = solverState.target;
  const relation = solverState.relation;
  const varianceKnown = solverState.varianceKnown;

  setPanelVisibility(relationPanel, target === "media");
  setPanelVisibility(
    varianceKnownPanel,
    target === "media" && relation === "independente"
  );
  setPanelVisibility(
    varianceEqualityPanel,
    target === "media" &&
      relation === "independente" &&
      varianceKnown === "nao"
  );
}

function paintTags(tags) {
  resultTags.innerHTML = "";

  tags.forEach((tag) => {
    const element = document.createElement("span");
    element.className = "result-tag";
    element.textContent = tag;
    resultTags.appendChild(element);
  });
}

function paintHubSelection() {
  hubChips.forEach((chip) => {
    const isSelected = chip.dataset.hubTarget === solverState.target;
    chip.classList.toggle("is-selected", isSelected);
    chip.setAttribute("aria-pressed", String(isSelected));
  });
}

function highlightFormula(keys) {
  formulaCards.forEach((card) => {
    const isMatch = keys.includes(card.dataset.formulaKey);
    card.classList.toggle("is-highlighted", isMatch);
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
      tags: ["Sem resposta ainda"],
      formulas: [],
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
      tags: ["Proporção", "Z", "IC e TH"],
      formulas: ["z-proportion"],
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
      tags: ["Categoria", "Qui-Quadrado", "Independência ou aderência"],
      formulas: ["chi-category", "chi-goodness"],
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
      tags: ["Variância", "χ² ou F", "Valores positivos"],
      formulas: ["f-variance", "chi-variance"],
    };
  }

  if (target === "media" && !relation) {
    return {
      title: "Agora decida se as amostras são independentes ou pareadas",
      summary: "Para médias, essa é a bifurcação mais importante antes da distribuição.",
      reason:
        "Mesmo grupo antes/depois vira pareado. Grupos diferentes, como turma A e turma B, são independentes.",
      reading:
        "Se a mesma pessoa aparece duas vezes no enunciado, quase sempre é pareado.",
      tags: ["Média", "Falta decidir o desenho"],
      formulas: [],
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
      tags: ["Média", "Pareada", "t", "μd = 0"],
      formulas: ["t-paired"],
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
      tags: ["Média", "Independentes", "Falta decidir σ²"],
      formulas: [],
    };
  }

  if (target === "media" && relation === "independente" && varianceKnown === "sim") {
    return {
      title: "Use Z para médias independentes",
      summary: "Duas médias com variâncias populacionais conhecidas puxam Z.",
      reason:
        "Esse é o caso mais direto para comparação de médias entre grupos independentes.",
      reading:
        "Leitura de prova: se o enunciado já traz σ²₁ e σ²₂, não invente t.",
      tags: ["Média", "Independentes", "σ² conhecida", "Z"],
      formulas: ["z-mean"],
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
      reading:
        "Leitura de prova: a frase “assuma variâncias iguais” muda o caminho.",
      tags: ["Média", "t", "Falta decidir igualdade"],
      formulas: [],
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
      reason:
        "Aqui você calcula a variância misturada S²p e segue com t de Student.",
      reading:
        "Leitura de prova: se o enunciado disser que as variâncias são iguais, esse é o caso clássico de pooled t.",
      tags: ["Média", "Independentes", "t", "S²p"],
      formulas: ["t-pooled"],
    };
  }

  return {
    title: "Use t com a lógica de Welch",
    summary: "Duas médias independentes, σ² desconhecida e variâncias diferentes.",
    reason:
      "Você continua no mundo da t, mas sem juntar variâncias. Os graus de liberdade ficam aproximados.",
    reading:
      "Leitura de prova: quando o enunciado aponta variâncias diferentes, pense em Welch.",
    tags: ["Média", "Independentes", "t", "Welch"],
    formulas: ["t-welch"],
  };
}

function renderDecision() {
  updateVisibleQuestions();

  const decision = getDecision();
  resultTitle.textContent = decision.title;
  resultSummary.textContent = decision.summary;
  resultReason.textContent = decision.reason;
  resultReading.textContent = decision.reading;
  paintTags(decision.tags);
  highlightFormula(decision.formulas);
  paintHubSelection();
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

  renderDecision();
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
  const trigger = card.querySelector(".case-button") || card;
  trigger.addEventListener("click", () => {
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

renderDecision();
