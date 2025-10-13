// Chave para indentificar os dados salvos no localStorage
const STORAGE_KEY = "prompts_storage_data";

// Estado para carregar os dados e exibir
const state = {
  prompts: [],
  selectedId: null,
};

// Seleção dos elementos por id
const elements = {
  promptTitle: document.getElementById("prompt-title"),
  promptContent: document.getElementById("prompt-content"),
  titleWrapper: document.getElementById("title-wrapper"),
  contentWrapper: document.getElementById("content-wrapper"),
  btnOpen: document.getElementById("btn-open"),
  btnCollapse: document.getElementById("btn-collapse"),
  sidebar: document.querySelector("aside.sidebar"),
  btnSave: document.getElementById("btn-save"),
  promptList: document.getElementById("prompt-list"),
  searchInput: document.getElementById("search-input"),
  btnNew: document.getElementById("btn-new"),
  btnCopy: document.getElementById("btn-copy"),
};

// Atualiza o estado de um wrapper conforme o conteúdo do elemento
function updateEditableWrapperState(element, wrapper) {
  const hasText = element.textContent.trim().length > 0;
  wrapper.classList.toggle("is-empty", !hasText);
}

// Atualiza o estado de todos os elementos editáveis
function updateAllEditableStates() {
  updateEditableWrapperState(elements.promptTitle, elements.titleWrapper);
  updateEditableWrapperState(elements.promptContent, elements.contentWrapper);
}

// Adiciona ouvintes de input para atualizar wrappers em tempo real
function attachAllEditableHandlers() {
  elements.promptTitle.addEventListener("input", function () {
    updateEditableWrapperState(elements.promptTitle, elements.titleWrapper);
  });
  elements.promptContent.addEventListener("input", function () {
    updateEditableWrapperState(elements.promptContent, elements.contentWrapper);
  });
  // Atualiza estado inicial
  updateAllEditableStates();
}

function openSidebar() {
  elements.sidebar.classList.add("open");
  elements.sidebar.classList.remove("collapsed");
}

function closeSidebar() {
  elements.sidebar.classList.remove("open");
  elements.sidebar.classList.add("collapsed");
}

function save() {
  const title = elements.promptTitle.textContent.trim();
  const content = elements.promptContent.innerHTML.trim();
  const hasContent = elements.promptContent.textContent.trim();

  if (!title || !hasContent) {
    alert(
      "Por favor, preencha tanto o título quanto o conteúdo do prompt antes de salvar."
    );
    return;
  }

  if (state.selectedId) {
    const existingPrompt = state.prompts.find((p) => p.id === state.selectedId);
    if (existingPrompt) {
      existingPrompt.title = title || "Sem título";
      existingPrompt.content = content || "Sem conteúdo";
    }
  } else {
    const newPrompt = {
      id: Date.now().toString(36),
      title,
      content,
    };
    state.prompts.unshift(newPrompt);
    state.selectedId = newPrompt.id;
  }

  renderPromptList(elements.searchInput.value);
  persist();
  alert("Prompt salvo com sucesso!");
}

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.prompts));
  } catch (error) {
    console.error("Erro ao salvar os dados no localStorage:", error);
  }
}

function load() {
  try {
    const storage = localStorage.getItem(STORAGE_KEY);
    state.prompts = storage ? JSON.parse(storage) : [];
    state.selectedId = null;
  } catch (error) {
    console.error("Erro ao carregar os dados do localStorage:", error);
  }
}

function createPromptItem(prompt) {
  return `
    <li class="prompt-item" data-id="${prompt.id}" data-action="select">
      <div class="prompt-item-content">
        <span class="prompt-item-title">${prompt.title}</span>
        <span class="prompt-item-description">${prompt.content}</span>
      </div>

      <button class="btn-icon" title="Remover" data-action="remove">
        <img
          src="assets/remove.svg"
          alt="Remover"
          class="icon icon-trash"
        />
      </button>
    </li>
  `;
}

function renderPromptList(filterText = "") {
  const filteredPrompts = state.prompts
    .filter((prompt) =>
      prompt.title.toLowerCase().includes(filterText.toLowerCase().trim())
    )
    .map((p) => createPromptItem(p))
    .join("");
  elements.promptList.innerHTML = filteredPrompts;
}

function newPrompt() {
  state.selectedId = null;
  elements.promptTitle.textContent = "";
  elements.promptContent.innerHTML = "";
  updateAllEditableStates();
  elements.promptTitle.focus();
}

function copyToClipboard(text) {
  try {
    const content = elements.promptContent;

    if (!navigator.clipboard) {
      alert("A API de Clipboard não é suportada neste navegador.");
      return;
    }

    navigator.clipboard.writeText(content.innerText);
    alert("Conteúdo copiado para a área de transferência!");
  } catch (error) {
    console.error("Erro ao copiar para a área de transferência:", error);
  }
}

// Eventos
elements.btnSave.addEventListener("click", save);
elements.btnNew.addEventListener("click", newPrompt);
elements.btnCopy.addEventListener("click", copyToClipboard);

elements.searchInput.addEventListener("input", (e) => {
  renderPromptList(e.target.value);
});

elements.promptList.addEventListener("click", (e) => {
  const removeBtn = e.target.closest("[data-action='remove']");
  const item = e.target.closest("[data-id]");

  if (!item) return;

  const id = item.getAttribute("data-id");
  state.selectedId = id;

  if (removeBtn) {
    state.prompts = state.prompts.filter((p) => p.id !== id);
    renderPromptList(elements.searchInput.value);
    persist();
    return;
  }

  if (e.target.closest("[data-action='select']")) {
    const prompt = state.prompts.find((p) => p.id === id);
    if (prompt) {
      elements.promptTitle.textContent = prompt.title;
      elements.promptContent.innerHTML = prompt.content;
      updateAllEditableStates();
    }
  }
});

// Função de inicialização
function init() {
  load();
  renderPromptList("");
  attachAllEditableHandlers();

  elements.sidebar.classList.add("open");
  elements.sidebar.classList.remove("collapsed");

  elements.btnOpen.addEventListener("click", openSidebar);
  elements.btnCollapse.addEventListener("click", closeSidebar);
}

// Executa a inicialização ao carregar o script
init();
