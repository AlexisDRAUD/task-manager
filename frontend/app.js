"""Database configuration"""

const HTTP_NO_CONTENT = 204;
const DEFAULT_API_URL = "http://127.0.0.1:8000";

// Change this if your API runs elsewhere (CI, container, remote)
globalThis.API_URL = localStorage.getItem("API_URL") || DEFAULT_API_URL;
document.getElementById("apiUrlLabel").textContent = globalThis.API_URL;

async function api(path, options = {}) {
  const res = await fetch(`${globalThis.API_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (res.status === HTTP_NO_CONTENT) return null;

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail || `HTTP ${res.status}`);
  }

  return res.json();
}

function taskCard(task) {
  const div = document.createElement("div");
  div.className = "task";

  div.innerHTML = `
    <div class="row">
      <h3>${escapeHtml(task.title)}</h3>
      <span class="badge">${task.status}</span>
    </div>
    <p>${task.description ?? "<em>Pas de description</em>"}</p>
    <small>id=${task.id} • créé=${new Date(task.created_at).toLocaleString()}</small>
    <div class="actions">
      <select data-role="status">
        <option value="TODO" ${task.status === "TODO" ? "selected" : ""}>TODO</option>
        <option value="DOING" ${task.status === "DOING" ? "selected" : ""}>DOING</option>
        <option value="DONE" ${task.status === "DONE" ? "selected" : ""}>DONE</option>
      </select>
      <button class="secondary" data-role="save">Mettre à jour</button>
      <button data-role="delete">Supprimer</button>
    </div>
  `;

  div.querySelector('[data-role="save"]').addEventListener("click", async () => {
    const status = div.querySelector('[data-role="status"]').value;
    await api(`/tasks/${task.id}`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    });
    await refresh();
  });

  div.querySelector('[data-role="delete"]').addEventListener("click", async () => {
    const shouldDelete = await confirmDelete("Supprimer cette tâche ?");
    if (!shouldDelete) {
      return;
    }

    await api(`/tasks/${task.id}`, { method: "DELETE" });
    await refresh();
  });

  return div;
}

async function confirmDelete(message) {
  return Promise.resolve(globalThis.confirm(message));
}

function escapeHtml(s) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

async function refresh() {
  const container = document.getElementById("tasks");
  container.innerHTML = "";

  try {
    const tasks = await api("/tasks");

    if (tasks.length === 0) {
      container.innerHTML = "<p><em>Aucune tâche pour l’instant.</em></p>";
      return;
    }

    for (const task of tasks) {
      container.appendChild(taskCard(task));
    }
  } catch (e) {
    container.innerHTML = `
      <p style="color:#b00020">
        <strong>Erreur :</strong> ${escapeHtml(e.message)}
      </p>
      <p>Vérifie que l’API tourne sur <code>${globalThis.API_URL}</code>.</p>
    `;
  }
}

document.getElementById("refreshBtn").addEventListener("click", refresh);

document.getElementById("createForm").addEventListener("submit", async ev => {
  ev.preventDefault();

  const title = document.getElementById("title").value.trim();
  const description = document.getElementById("description").value.trim() || null;

  await api("/tasks", {
    method: "POST",
    body: JSON.stringify({ title, description }),
  });

  document.getElementById("title").value = "";
  document.getElementById("description").value = "";

  await refresh();
});

await refresh();
