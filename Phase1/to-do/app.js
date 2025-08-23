// ---- Simple To‑Do Pro (Vanilla JS + localStorage) ----

const $ = (sel, parent = document) => parent.querySelector(sel);
const $$ = (sel, parent = document) => Array.from(parent.querySelectorAll(sel));

// ----- State -----
const STORAGE_KEY = "todo_pro_tasks_v1";
const STORAGE_META = "todo_pro_meta_v1"; // lists & tags

let tasks = [];
let meta = { lists: ["Personal", "Work"], tags: ["Tag 1", "Tag 2", "Tag 3"] };
let activeFilter = { type: "today-only", value: null }; // default view

// ----- Utilities -----
const uid = () => Math.random().toString(36).slice(2, 10);
const todayISO = () => new Date().toISOString().slice(0, 10);
const inFuture = (date) => new Date(date) > new Date(todayISO());
const isToday = (date) => date === todayISO();
const fmt = (d) => new Date(d).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: '2-digit' });

function load() {
  tasks = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  const savedMeta = JSON.parse(localStorage.getItem(STORAGE_META) || "null");
  if (savedMeta) meta = savedMeta;

  if (tasks.length === 0) {
    // Seed sample tasks
    tasks = [
      { id: uid(), title: "Research content ideas", description: "", list: "Work", dueDate: todayISO(), tags: ["Tag 1"], subtasks: [], completed: false, sticky: false },
      { id: uid(), title: "Renew driver's license", description: "", list: "Personal", dueDate: todayISO(), tags: ["Tag 2"], subtasks: [{ id: uid(), text: "Find docs", completed: false }], completed: false, sticky: false },
      { id: uid(), title: "Print business card", description: "", list: "Work", dueDate: "2025-12-31", tags: ["Tag 3"], subtasks: [], completed: false, sticky: false },
    ];
    save();
  }
}

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  localStorage.setItem(STORAGE_META, JSON.stringify(meta));
}

// ----- Rendering -----
function render() {
  renderSidebar();
  renderTaskList();
  renderDetailsVisibility(false);
}

function renderSidebar() {
  // counts
  const todayCount = tasks.filter(t => isToday(t.dueDate) && !t.completed).length;
  const upcomingCount = tasks.filter(t => inFuture(t.dueDate) && !t.completed).length;
  $("#todayCount").textContent = todayCount;
  $("#upcomingCount").textContent = upcomingCount;

  // lists
  const listsContainer = $("#listsContainer");
  listsContainer.innerHTML = "";
  meta.lists.forEach(list => {
    const count = tasks.filter(t => t.list === list && !t.completed).length;
    const chip = document.createElement("div");
    chip.className = "chip";
    chip.textContent = `${list} (${count})`;
    chip.addEventListener("click", () => setFilter({ type: "list", value: list }));
    listsContainer.appendChild(chip);
  });

  // tags
  const tagsContainer = $("#tagsContainer");
  tagsContainer.innerHTML = "";
  meta.tags.forEach((tag, idx) => {
    const count = tasks.filter(t => t.tags?.includes(tag) && !t.completed).length;
    const chip = document.createElement("div");
    chip.className = "chip";
    chip.textContent = `${tag} (${count})`;
    chip.style.background = ["#eef2ff", "#e0f2fe", "#fef3c7", "#fce7f3"][idx % 4];
    chip.addEventListener("click", () => setFilter({ type: "tag", value: tag }));
    tagsContainer.appendChild(chip);
  });
}

function renderTaskList() {
  const container = $("#taskList");
  container.innerHTML = "";

  const filtered = getFilteredTasks();
  $("#currentCount").textContent = filtered.length;
  const viewTitle = {
    "today-only": "Today",
    "today": "Upcoming",
    "calendar": "Calendar",
    "sticky": "Sticky Wall",
    "list": activeFilter.value || "List",
    "tag": `#${activeFilter.value}`
  }
  [activeFilter.type] || "Tasks";
  $("#viewTitle").textContent = viewTitle;

  if (activeFilter.type === "calendar") {
    // Group by date
    const groups = {};
    filtered.forEach(t => {
      const key = t.dueDate || "No date";
      groups[key] = groups[key] || [];
      groups[key].push(t);
    });
    Object.keys(groups).sort().forEach(dateKey => {
      const header = document.createElement("div");
      header.className = "section-title";
      header.style.marginTop = "14px";
      header.textContent = dateKey === "No date" ? "No date" : fmt(dateKey);
      container.appendChild(header);
      groups[dateKey].forEach(t => container.appendChild(taskRow(t)));
    });
  } else {
    filtered
      .sort((a, b) => (a.dueDate || "9999") > (b.dueDate || "9999") ? 1 : -1)
      .forEach(t => container.appendChild(taskRow(t)));
  }
}

function taskRow(task) {
  const el = document.createElement("div");
  el.className = "task";
  el.innerHTML = `
    <div class="task-left">
      <input type="checkbox" ${task.completed ? "checked" : ""} data-role="complete">
      <div>
        <div class="task-title">${task.title}</div>
        <div class="task-meta">
          ${task.dueDate ? `<span class="meta-pill">${fmt(task.dueDate)}</span>` : ""}
          ${task.list ? `<span class="meta-pill">${task.list}</span>` : ""}
          ${task.tags?.map((tg, i) => `<span class="meta-pill tag" data-color="${(i % 3) + 1}">${tg}</span>`).join("") || ""}
          ${task.subtasks?.length ? `<span class="meta-pill">${task.subtasks.filter(s => s.completed).length}/${task.subtasks.length} subtasks</span>` : ""}
        </div>
      </div>
    </div>
    <div class="task-right">
      <button class="btn">Edit</button>
    </div>
  `;

  // Complete toggle
  $("input[type='checkbox'][data-role='complete']", el).addEventListener("change", (e) => {
    task.completed = e.target.checked;
    save(); render();
  });

  // Edit -> open details
  $(".btn", el).addEventListener("click", () => openDetails(task.id));

  // Click anywhere also edit
  el.addEventListener("click", (e) => {
    if (e.target.closest(".btn") || e.target.type === "checkbox") return;
    openDetails(task.id);
  });

  return el;
}

function getFilteredTasks() {
  const q = $("#search-input").value?.toLowerCase() || "";
  let arr = tasks.filter(t => t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q));
  switch (activeFilter.type) {
    case "today-only":
      arr = arr.filter(t => isToday(t.dueDate) && !t.completed);
      break;
    case "today":
      arr = arr.filter(t => (isToday(t.dueDate) || inFuture(t.dueDate)) && !t.completed);
      break;
    case "calendar":
      // all tasks visible in calendar
      break;
    case "sticky":
      arr = arr.filter(t => t.sticky);
      break;
    case "list":
      arr = arr.filter(t => t.list === activeFilter.value && !t.completed);
      break;
    case "tag":
      arr = arr.filter(t => t.tags?.includes(activeFilter.value) && !t.completed);
      break;
  }
  return arr;
}

function setFilter(f) {
  activeFilter = f;
  renderTaskList();
}

// ----- Details panel -----
function renderDetailsVisibility(show) {
  const panel = $("#detailsPanel");
  panel.setAttribute("aria-hidden", show ? "false" : "true");
  if (!show) $("#taskForm").reset();
}

function openDetails(id) {
  const t = tasks.find(x => x.id === id);
  populateForm(t);
  renderDetailsVisibility(true);
}

function populateForm(task) {
  $("#taskId").value = task?.id || "";
  $("#title").value = task?.title || "";
  $("#description").value = task?.description || "";
  $("#dueDate").value = task?.dueDate || "";

  // lists
  const listSelect = $("#listSelect");
  listSelect.innerHTML = meta.lists.map(l => `<option value="${l}">${l}</option>`).join("");
  listSelect.value = task?.list || meta.lists[0] || "";

  // tags picker
  const tp = $("#tagsPicker");
  tp.innerHTML = "";
  meta.tags.forEach(tg => {
    const pill = document.createElement("div");
    pill.className = "tag-pill";
    pill.textContent = tg;
    if (task?.tags?.includes(tg)) pill.classList.add("active");
    pill.addEventListener("click", () => {
      pill.classList.toggle("active");
    });
    tp.appendChild(pill);
  });

  // subtasks
  const cont = $("#subtasksContainer");
  cont.innerHTML = "";
  (task?.subtasks || []).forEach(sub => cont.appendChild(subtaskRow(sub)));
}

function subtaskRow(sub) {
  const row = document.createElement("div");
  row.className = "subtask";
  row.innerHTML = `
    <input type="checkbox" ${sub.completed ? "checked" : ""}>
    <input type="text" value="${sub.text}" placeholder="Subtask">
    <button class="icon-btn" title="Remove">
    <i class="fa-solid fa-xmark close-icon"></i></button>
  `;
  $("input[type='checkbox']", row).addEventListener("change", e => sub.completed = e.target.checked);
  $("input[type='text']", row).addEventListener("input", e => sub.text = e.target.value);
  $(".icon-btn", row).addEventListener("click", () => {
    const formId = $("#taskId").value;
    if (formId) {
      const t = tasks.find(x => x.id === formId);
      t.subtasks = t.subtasks.filter(s => s.id !== sub.id);
    }
    row.remove();
  });
  return row;
}

// ----- Event listeners -----
function initEvents() {
  // Sidebar filters
  $$(".nav-item").forEach(btn => {
    btn.addEventListener("click", () => {
      const f = btn.dataset.filter;
      if (f === "today") setFilter({ type: "today" });
      else if (f === "today-only") setFilter({ type: "today-only" });
      else if (f === "calendar") setFilter({ type: "calendar" });
      else if (f === "sticky") setFilter({ type: "sticky" });
      renderTaskList();
    });
  });

  // Add task
  $("#addTaskBtn").addEventListener("click", () => {
    populateForm({ id: "", title: "", description: "", list: meta.lists[0] || "", dueDate: todayISO(), tags: [], subtasks: [] });
    renderDetailsVisibility(true);
  });

  // Close details
  $("#closeDetails").addEventListener("click", () => renderDetailsVisibility(false));

  // Search
  $("#search-input").addEventListener("input", renderTaskList);

  // Add list
  $("#addListBtn").addEventListener("click", () => {
    const name = prompt("New list name?");
    if (!name) return;
    if (!meta.lists.includes(name)) meta.lists.push(name);
    save(); render();
  });

  // Add tag
  $("#addTagBtn").addEventListener("click", () => {
    const name = prompt("New tag name?");
    if (!name) return;
    if (!meta.tags.includes(name)) meta.tags.push(name);
    save(); render();
  });

  // Add subtask field (for new or existing task)
  $("#addSubtaskBtn").addEventListener("click", () => {
    const text = $("#newSubtaskInput").value.trim();
    if (!text) return;
    const id = $("#taskId").value;
    let target = null;
    if (id) target = tasks.find(x => x.id === id);
    if (target) {
      const s = { id: uid(), text, completed: false };
      target.subtasks.push(s);
      $("#subtasksContainer").appendChild(subtaskRow(s));
      $("#newSubtaskInput").value = "";
      save(); render();
    } else {
      // Not yet saved -> attach to DOM only; will be collected on save
      const s = { id: uid(), text, completed: false };
      $("#subtasksContainer").appendChild(subtaskRow(s));
      $("#newSubtaskInput").value = "";
    }
  });

  // Delete task
  $("#deleteTaskBtn").addEventListener("click", () => {
    const id = $("#taskId").value;
    if (!id) { renderDetailsVisibility(false); return; }
    tasks = tasks.filter(t => t.id !== id);
    save(); render();
  });

  // Save task
  $("#taskForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const id = $("#taskId").value || uid();
    const title = $("#title").value.trim();
    if (!title) { alert("Title required"); return; }
    const description = $("#description").value.trim();
    const list = $("#listSelect").value;
    const dueDate = $("#dueDate").value || null;
    const tags = $$(".tag-pill.active").map(p => p.textContent);
    const subtasks = $$("#subtasksContainer .subtask").map(row => ({
      id: uid(),
      text: $("input[type='text']", row).value,
      completed: $("input[type='checkbox']", row).checked
    }));

    const existing = tasks.find(t => t.id === id);
    const payload =
      { id, title, description, list, dueDate, tags, subtasks, completed: existing?.completed || false, sticky: existing?.sticky || false };

    if (existing) {
      Object.assign(existing, payload);
    } else {
      tasks.push(payload);
    }
    save(); render();
  });
}

function main() {
  load();
  render();
  initEvents();
}

document.addEventListener("DOMContentLoaded", main);
