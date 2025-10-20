// State
let ideas = JSON.parse(localStorage.getItem("ideas") || "[]");
let orders = JSON.parse(localStorage.getItem("orders") || "[]");
let settings = JSON.parse(localStorage.getItem("settings") || "{}");
let aiConfig = JSON.parse(localStorage.getItem("aiConfig") || "{}");

// elements
const sections = document.querySelectorAll(".section");
const navItems = document.querySelectorAll(".nav-item");

// navigation
navItems.forEach(btn => {
  btn.addEventListener("click", () => {
    navItems.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    sections.forEach(s => s.classList.remove("active"));
    document.getElementById(btn.dataset.section).classList.add("active");
  });
});

// dashboard metrics
function renderDashboard() {
  const profitToday = orders.reduce((sum, o) => sum + (Number(o.revenue) - Number(o.cost)), 0);
  document.getElementById("profitToday").textContent = `$${profitToday.toFixed(2)}`;
  document.getElementById("ideasCount").textContent = ideas.length;
  document.getElementById("ordersCount").textContent = orders.length;

  const grid = document.getElementById("activityGrid");
  grid.innerHTML = "";
  for (let i = 0; i < 96; i++) {
    const block = document.createElement("div");
    block.className = "activity-block";
    if (Math.random() > 0.7) block.classList.add("active");
    grid.appendChild(block);
  }
}

// Ideas
const ideaForm = document.getElementById("ideaForm");
const ideaList = document.getElementById("ideaList");

ideaForm.addEventListener("submit", e => {
  e.preventDefault();
  const title = document.getElementById("ideaTitle").value;
  const cost = parseFloat(document.getElementById("ideaCost").value);
  const price = Number((cost * 2.5).toFixed(2));
  const margin = Number((price - cost).toFixed(2));
  ideas.unshift({ id: crypto.randomUUID(), title, cost, price, margin, createdAt: Date.now() });
  localStorage.setItem("ideas", JSON.stringify(ideas));
  renderIdeas();
  renderDashboard();
  ideaForm.reset();
});

function renderIdeas() {
  ideaList.innerHTML = "";
  ideas.forEach(i => {
    const row = document.createElement("div");
    row.className = "table-row";
    row.innerHTML = `
      <span>${i.title}</span>
      <span>$${i.cost.toFixed(2)}</span>
      <span>$${i.price.toFixed(2)}</span>
      <span>$${i.margin.toFixed(2)}</span>
      <span>
        <button class="btn" data-act="del" data-id="${i.id}">Supprimer</button>
      </span>`;
    ideaList.appendChild(row);
  });
  ideaList.querySelectorAll("button[data-act='del']").forEach(btn => {
    btn.addEventListener("click", () => {
      ideas = ideas.filter(x => x.id !== btn.dataset.id);
      localStorage.setItem("ideas", JSON.stringify(ideas));
      renderIdeas();
      renderDashboard();
    });
  });
}

// Orders
const orderForm = document.getElementById("orderForm");
const orderList = document.getElementById("orderList");

orderForm.addEventListener("submit", e => {
  e.preventDefault();
  const product = document.getElementById("orderProduct").value;
  const revenue = parseFloat(document.getElementById("orderRevenue").value);
  const cost = parseFloat(document.getElementById("orderCost").value);
  const profit = Number((revenue - cost).toFixed(2));
  orders.unshift({ id: crypto.randomUUID(), product, revenue, cost, profit, createdAt: Date.now() });
  localStorage.setItem("orders", JSON.stringify(orders));
  renderOrders();
  renderDashboard();
  orderForm.reset();
});

function renderOrders() {
  orderList.innerHTML = "";
  orders.forEach(o => {
    const row = document.createElement("div");
    row.className = "table-row";
    row.innerHTML = `
      <span>${o.product}</span>
      <span>$${o.revenue.toFixed(2)}</span>
      <span>$${o.cost.toFixed(2)}</span>
      <span>$${o.profit.toFixed(2)}</span>
      <span>
        <button class="btn" data-act="del" data-id="${o.id}">Supprimer</button>
      </span>`;
    orderList.appendChild(row);
  });
  orderList.querySelectorAll("button[data-act='del']").forEach(btn => {
    btn.addEventListener("click", () => {
      orders = orders.filter(x => x.id !== btn.dataset.id);
      localStorage.setItem("orders", JSON.stringify(orders));
      renderOrders();
      renderDashboard();
    });
  });
}

// Settings le theme
const themeSelect = document.getElementById("themeSelect");
const accentColor = document.getElementById("accentColor");
const radiusRange = document.getElementById("radiusRange");
const blurRange = document.getElementById("blurRange");
const contrastRange = document.getElementById("contrastRange");
const resetThemeBtn = document.getElementById("resetThemeBtn");

function applyTheme() {
  const root = document.documentElement;
  root.style.setProperty("--accent", settings.accent || "#7C85FF");
  root.style.setProperty("--radius", `${settings.radius ?? 16}px`);
  root.style.setProperty("--blur", `${settings.blur ?? 6}px`);
  root.style.setProperty("--contrast", `${settings.contrast ?? 1.0}`);
  document.body.classList.remove("theme-amoled", "theme-carbon", "theme-minimal");
  if (settings.theme === "amoled") document.body.classList.add("theme-amoled");
  if (settings.theme === "carbon") document.body.classList.add("theme-carbon");
  if (settings.theme === "minimal") document.body.classList.add("theme-minimal");
}

function loadSettings() {
  themeSelect.value = settings.theme || "dark";
  accentColor.value = settings.accent || "#7C85FF";
  radiusRange.value = settings.radius ?? 16;
  blurRange.value = settings.blur ?? 6;
  contrastRange.value = settings.contrast ?? 1.0;
  applyTheme();
}

function saveSettings() {
  settings = {
    theme: themeSelect.value,
    accent: accentColor.value,
    radius: Number(radiusRange.value),
    blur: Number(blurRange.value),
    contrast: Number(contrastRange.value)
  };
  localStorage.setItem("settings", JSON.stringify(settings));
  applyTheme();
}

themeSelect.addEventListener("change", saveSettings);
accentColor.addEventListener("input", saveSettings);
radiusRange.addEventListener("input", saveSettings);
blurRange.addEventListener("input", saveSettings);
contrastRange.addEventListener("input", saveSettings);
resetThemeBtn.addEventListener("click", () => { 
  localStorage.removeItem("settings");
  loadSettings();
});

// configuration de l'ai an js
const aiProvider = document.getElementById("aiProvider");
const aiModel = document.getElementById("aiModel");
const apiKeyInput = document.getElementById("apiKey");
const saveKeyBtn = document.getElementById("saveKeyBtn");
const testKeyBtn = document.getElementById("testKeyBtn");

const providerSummary = document.getElementById("providerSummary");
const modelSummary = document.getElementById("modelSummary");
const keySummary = document.getElementById("keySummary");

const chatBox = document.getElementById("chatBox");
const chatForm = document.getElementById("chatForm");
const chatInput = document.getElementById("chatInput");
const clearChatBtn = document.getElementById("clearChatBtn");


const PROVIDERS = {
  sambanova: [
    "Meta-Llama-3.1-8B-Instruct",
    "Meta-Llama-3.1-70B-Instruct",
    "Qwen2-72B-Instruct"
  ],
  openai: [
    "gpt-3.5-turbo",
    "gpt-4o-mini",
    "gpt-4o"
  ]
};

function populateModels() {
  const list = PROVIDERS[aiProvider.value] || [];
  aiModel.innerHTML = "";
  list.forEach(m => {
    const opt = document.createElement("option");
    opt.value = m;
    opt.textContent = m;
    aiModel.appendChild(opt);
  });
  if (aiConfig.model && list.includes(aiConfig.model)) {
    aiModel.value = aiConfig.model;
  }
}

// demarrer sambanova
function loadAI() {
  aiProvider.value = aiConfig.provider || "sambanova";
  apiKeyInput.value = aiConfig.key || "";
  populateModels();
  providerSummary.textContent = aiProvider.value || "—";
  modelSummary.textContent = aiModel.value || "—";
  keySummary.textContent = apiKeyInput.value ? "Configurée" : "Non configurée";
}

aiProvider.addEventListener("change", () => {
  populateModels();
  saveAI();
});
aiModel.addEventListener("change", saveAI);
saveKeyBtn.addEventListener("click", () => {
  saveAI();
  alert("Clé enregistrée localement.");
});
testKeyBtn.addEventListener("click", async () => {
  try {
    await callAI("Ping");
    alert("Clé et modèle OK.");
  } catch (e) {
    alert("Erreur: " + e.message);
  }
});

function saveAI() {
  aiConfig = {
    provider: aiProvider.value,
    model: aiModel.value,
    key: apiKeyInput.value.trim()
  };
  localStorage.setItem("aiConfig", JSON.stringify(aiConfig));
  providerSummary.textContent = aiConfig.provider || "—";
  modelSummary.textContent = aiConfig.model || "—";
  keySummary.textContent = aiConfig.key ? "Configurée" : "Non configurée";
}

// rendre message chat
function pushMessage(role, text) {
  const row = document.createElement("div");
  row.className = `msg ${role}`;
  const avatar = document.createElement("div");
  avatar.className = "avatar";
  avatar.textContent = role === "ai" ? "AI" : "U";
  const bubble = document.createElement("div");
  bubble.className = "bubble";
  const meta = document.createElement("div");
  meta.className = "meta";
  const ts = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  meta.innerHTML = `<span>${role === "ai" ? "Assistant" : "Toi"}</span><span>${ts}</span>`;
  const content = document.createElement("div");
  content.className = "content";
  content.textContent = text;
  bubble.appendChild(meta);
  bubble.appendChild(content);
  row.appendChild(avatar);
  row.appendChild(bubble);
  chatBox.appendChild(row);
  chatBox.scrollTop = chatBox.scrollHeight;
}

// appeler ai
async function callAI(userMsg) {
  if (!aiConfig.key) throw new Error("Clé API manquante.");
  if (!aiConfig.model || !aiConfig.provider) throw new Error("Modèle/fournisseur manquant.");
  if (aiConfig.provider === "sambanova") {
    const res = await fetch("https://api.sambanova.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + aiConfig.key
      },
      body: JSON.stringify({
        model: aiConfig.model,
        messages: [{ role: "user", content: userMsg }],
        temperature: 0.7
      })
    });
    if (!res.ok) throw new Error(`SambaNova: ${res.status} ${await res.text()}`);
    const data = await res.json();
    return data.choices?.[0]?.message?.content || "Réponse vide.";
  } else if (aiConfig.provider === "openai") {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + aiConfig.key
      },
      body: JSON.stringify({
        model: aiConfig.model,
        messages: [{ role: "user", content: userMsg }],
        temperature: 0.7
      })
    });
    if (!res.ok) throw new Error(`OpenAI: ${res.status} ${await res.text()}`);
    const data = await res.json();
    return data.choices?.[0]?.message?.content || "Réponse vide.";
  } else {
    throw new Error("Fournisseur inconnu.");
  }
}


chatForm.addEventListener("submit", async e => {
  e.preventDefault();
  const text = chatInput.value.trim();
  if (!text) return;
  pushMessage("user", text);
  chatInput.value = "";
  try {
    const reply = await callAI(text);
    pushMessage("ai", reply);
    saveConversation(text, reply);
  } catch (err) {
    pushMessage("ai", "Erreur: " + err.message);
  }
});

clearChatBtn.addEventListener("click", () => {
  chatBox.innerHTML = "";
  localStorage.removeItem("chatHistory");
});


function saveConversation(user, ai) {
  const history = JSON.parse(localStorage.getItem("chatHistory") || "[]");
  history.push({ user, ai, at: Date.now() });
  localStorage.setItem("chatHistory", JSON.stringify(history));
}


document.getElementById("exportBtn").addEventListener("click", () => {
  const blob = new Blob([JSON.stringify({
    ideas, orders, settings, aiConfig,
    chat: JSON.parse(localStorage.getItem("chatHistory") || "[]")
  }, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = `nomad-dashboard-${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
});


document.getElementById("newIdeaBtn").addEventListener("click", () => {
  const title = prompt("Titre du produit");
  const cost = Number(prompt("Coût de base (ex: 9.99)") || "0");
  if (!title || !cost) return;
  const price = Number((cost * 2.5).toFixed(2));
  const margin = Number((price - cost).toFixed(2));
  ideas.unshift({ id: crypto.randomUUID(), title, cost, price, margin, createdAt: Date.now() });
  localStorage.setItem("ideas", JSON.stringify(ideas));
  renderIdeas(); renderDashboard();
});

// Global search
document.getElementById("globalSearch").addEventListener("input", (e) => {
  const q = e.target.value.toLowerCase();
  document.querySelectorAll("#ideaList .table-row").forEach(row => {
    row.style.display = row.textContent.toLowerCase().includes(q) ? "" : "none";
  });
  document.querySelectorAll("#orderList .table-row").forEach(row => {
    row.style.display = row.textContent.toLowerCase().includes(q) ? "" : "none";
  });
});

// Init
function init() {
  loadSettings();
  loadAI();
  renderIdeas();
  renderOrders();
  renderDashboard();
}
init();