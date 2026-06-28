document.addEventListener("DOMContentLoaded", () => {
  const luminaryList = document.getElementById("luminary-list");
  const emptyState = document.getElementById("empty-state");
  const noResults = document.getElementById("no-results");
  const clearAllBtn = document.getElementById("clear-all-btn");
  const exportCsvBtn = document.getElementById("export-csv-btn");
  const searchInput = document.getElementById("search-input");
  const countEl = document.getElementById("count");

  const PRE_PROMPT =
    "Provide a comprehensive overview of " +
    ". Please include: 1. A brief summary of who they are and their current role. 2. Their career history and notable achievements. 3. Any significant projects, publications, or companies they are associated with. 4. Their general reputation or impact in their field. 5. Provide links to their official or confirmed social media profiles, specifically LinkedIn, Twitter (X), and YouTube, as well as their personal website or blog if they have one.";

  function buildPerplexityUrl(name) {
    const prompt = PRE_PROMPT.replace(". ", " " + name + ". ");
    return `https://www.perplexity.ai/search?q=${encodeURIComponent(prompt)}`;
  }

  function formatDate(isoString) {
    if (!isoString) return "";
    const d = new Date(isoString);
    const now = new Date();
    const diffMs = now - d;
    const diffDays = Math.floor(diffMs / 86400000);
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return diffDays + "d ago";
    if (diffDays < 30) return Math.floor(diffDays / 7) + "w ago";
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }

  function renderLuminaries(filter = "") {
    chrome.storage.local.get({ luminaries: [] }, (result) => {
      let luminaries = result.luminaries;

      luminaries = luminaries.map((entry) => {
        if (typeof entry === "string") {
          return { name: entry, date: null, notes: "" };
        }
        return entry;
      });

      const filtered = filter
        ? luminaries.filter((e) =>
            e.name.toLowerCase().includes(filter.toLowerCase())
          )
        : luminaries;

      luminaryList.innerHTML = "";

      if (luminaries.length === 0) {
        emptyState.classList.remove("hidden");
        noResults.classList.add("hidden");
        clearAllBtn.disabled = true;
        exportCsvBtn.disabled = true;
        countEl.classList.add("hidden");
      } else {
        emptyState.classList.add("hidden");
        clearAllBtn.disabled = false;
        exportCsvBtn.disabled = false;
        countEl.textContent = luminaries.length;
        countEl.classList.remove("hidden");

        if (filtered.length === 0) {
          noResults.classList.remove("hidden");
        } else {
          noResults.classList.add("hidden");
        }

        filtered.forEach((luminary) => {
          const realIndex = luminaries.findIndex(
            (e) => e.name === luminary.name && e.date === luminary.date
          );
          const listItem = document.createElement("li");

          const row = document.createElement("div");
          row.className = "luminary-row";

          const nameSpan = document.createElement("span");
          nameSpan.className = "luminary-name";
          nameSpan.textContent = luminary.name;
          nameSpan.title = "Click to research " + luminary.name;
          nameSpan.setAttribute("role", "button");
          nameSpan.setAttribute("tabindex", "0");
          nameSpan.addEventListener("click", () => {
            chrome.tabs.create({ url: buildPerplexityUrl(luminary.name) });
          });
          nameSpan.addEventListener("keydown", (e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              chrome.tabs.create({ url: buildPerplexityUrl(luminary.name) });
            }
          });

          const dateSpan = document.createElement("span");
          dateSpan.className = "luminary-date";
          dateSpan.textContent = formatDate(luminary.date);

          const actionsDiv = document.createElement("div");
          actionsDiv.className = "luminary-actions";

          const copyBtn = document.createElement("button");
          copyBtn.className = "copy-btn";
          copyBtn.textContent = "Copy";
          copyBtn.setAttribute("aria-label", "Copy " + luminary.name);
          copyBtn.addEventListener("click", () => {
            navigator.clipboard.writeText(luminary.name).then(() => {
              copyBtn.textContent = "Copied!";
              copyBtn.classList.add("copied");
              setTimeout(() => {
                copyBtn.textContent = "Copy";
                copyBtn.classList.remove("copied");
              }, 1500);
            });
          });

          const deleteBtn = document.createElement("button");
          deleteBtn.className = "delete-btn";
          deleteBtn.textContent = "Delete";
          deleteBtn.setAttribute("aria-label", "Delete " + luminary.name);
          deleteBtn.addEventListener("click", () => {
            chrome.storage.local.get({ luminaries: [] }, (res) => {
              const updated = res.luminaries.map((e) =>
                typeof e === "string" ? { name: e, date: null, notes: "" } : e
              );
              updated.splice(realIndex, 1);
              chrome.storage.local.set({ luminaries: updated }, () => {
                renderLuminaries(searchInput.value);
              });
            });
          });

          actionsDiv.appendChild(copyBtn);
          actionsDiv.appendChild(deleteBtn);

          row.appendChild(nameSpan);
          row.appendChild(dateSpan);
          row.appendChild(actionsDiv);

          const noteRow = document.createElement("div");
          noteRow.className = "note-row";

          const noteToggle = document.createElement("button");
          noteToggle.className = "note-toggle";
          noteToggle.textContent = luminary.notes ? "edit note" : "+ note";
          noteToggle.setAttribute("aria-label", "Edit note for " + luminary.name);

          const noteInput = document.createElement("input");
          noteInput.type = "text";
          noteInput.className = "note-input hidden";
          noteInput.placeholder = "Add a note...";
          noteInput.value = luminary.notes || "";

          noteToggle.addEventListener("click", () => {
            noteInput.classList.toggle("hidden");
            if (!noteInput.classList.contains("hidden")) {
              noteInput.focus();
            }
          });

          noteInput.addEventListener("blur", () => {
            const newNote = noteInput.value.trim();
            chrome.storage.local.get({ luminaries: [] }, (res) => {
              const updated = res.luminaries.map((e) =>
                typeof e === "string" ? { name: e, date: null, notes: "" } : e
              );
              if (updated[realIndex]) {
                updated[realIndex].notes = newNote;
                chrome.storage.local.set({ luminaries: updated }, () => {
                  noteToggle.textContent = newNote ? "edit note" : "+ note";
                  if (!newNote) noteInput.classList.add("hidden");
                });
              }
            });
          });

          noteInput.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
              noteInput.blur();
            }
          });

          noteRow.appendChild(noteToggle);
          noteRow.appendChild(noteInput);

          listItem.appendChild(row);
          listItem.appendChild(noteRow);
          luminaryList.appendChild(listItem);
        });
      }
    });
  }

  renderLuminaries();

  searchInput.addEventListener("input", () => {
    renderLuminaries(searchInput.value);
  });

  clearAllBtn.addEventListener("click", () => {
    if (confirm("Are you sure you want to clear all saved luminaries?")) {
      chrome.storage.local.set({ luminaries: [] }, () => {
        searchInput.value = "";
        renderLuminaries();
      });
    }
  });

  exportCsvBtn.addEventListener("click", () => {
    chrome.storage.local.get({ luminaries: [] }, (result) => {
      const luminaries = result.luminaries.map((e) =>
        typeof e === "string" ? { name: e, date: "", notes: "" } : e
      );
      if (luminaries.length > 0) {
        const header = "Name,Date,Notes";
        const rows = luminaries.map((e) =>
          [
            '"' + e.name.replace(/"/g, '""') + '"',
            e.date || "",
            '"' + (e.notes || "").replace(/"/g, '""') + '"',
          ].join(",")
        );
        const csvContent =
          "data:text/csv;charset=utf-8," +
          header +
          "\n" +
          rows.join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "luminaries.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        alert("No luminaries to export!");
      }
    });
  });
});
