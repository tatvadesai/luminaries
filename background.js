function createContextMenus() {
  chrome.contextMenus.create({
    id: "perplexityResearch",
    title: " Dive Deeper on '%s' with Luminaries",
    contexts: ["selection"],
  });
}

chrome.runtime.onInstalled.addListener(() => {
  createContextMenus();
  migrateStorage();
});

chrome.runtime.onStartup.addListener(() => {
  createContextMenus();
});

function migrateStorage() {
  chrome.storage.local.get({ luminaries: [] }, (result) => {
    const migrated = result.luminaries.map((entry) => {
      if (typeof entry === "string") {
        return { name: entry, date: null, notes: "" };
      }
      return entry;
    });
    chrome.storage.local.set({ luminaries: migrated });
  });
}

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "perplexityResearch" && info.selectionText) {
    const selectedText = info.selectionText;

    const prePrompt =
      "Provide a comprehensive overview of " +
      selectedText +
      ". Please include: 1. A brief summary of who they are and their current role. 2. Their career history and notable achievements. 3. Any significant projects, publications, or companies they are associated with. 4. Their general reputation or impact in their field. 5. Provide links to their official or confirmed social media profiles, specifically LinkedIn, Twitter (X), and YouTube, as well as their personal website or blog if they have one.";

    const perplexityUrl = `https://www.perplexity.ai/search?q=${encodeURIComponent(prePrompt)}`;

    chrome.tabs.create({ url: perplexityUrl });

    chrome.storage.local.get({ luminaries: [] }, (result) => {
      const luminaries = result.luminaries;
      const normalizedName = selectedText.toLowerCase().trim();
      const isDuplicate = luminaries.some((entry) => {
        const existing = typeof entry === "string" ? entry : entry.name;
        return existing.toLowerCase().trim() === normalizedName;
      });

      if (!isDuplicate) {
        luminaries.unshift({
          name: selectedText,
          date: new Date().toISOString(),
          notes: "",
        });
        chrome.storage.local.set({ luminaries: luminaries }, () => {
          if (chrome.runtime.lastError) {
            console.error("Error saving luminary:", chrome.runtime.lastError);
          }
        });
      }
    });
  }
});
