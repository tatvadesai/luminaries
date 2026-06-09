chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "perplexityResearch",
    title: " Research '%s' with Perplexity",
    contexts: ["selection"]
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "perplexityResearch" && info.selectionText) {
    const selectedText = info.selectionText;

    // The pre-prompt for Perplexity
    const prePrompt = "Provide a comprehensive overview of " + selectedText + ". Please include: 1. A brief summary of who they are and their current role. 2. Their career history and notable achievements. 3. Any significant projects, publications, or companies they are associated with. 4. Their general reputation or impact in their field. 5. Provide links to their official or confirmed social media profiles, specifically LinkedIn, Twitter (X), and YouTube, as well as their personal website or blog if they have one.";
    
    const perplexityUrl = `https://www.perplexity.ai/search?q=${encodeURIComponent(prePrompt)}`;

    // Open a new tab with the Perplexity search
    chrome.tabs.create({ url: perplexityUrl });

    // Save the selected text to local storage
    chrome.storage.local.get({ luminaries: [] }, (result) => {
      const luminaries = result.luminaries;
      if (!luminaries.includes(selectedText)) {
        luminaries.unshift(selectedText); // Add to the beginning of the list
        chrome.storage.local.set({ luminaries: luminaries }, () => {
          if (chrome.runtime.lastError) {
            console.error("Error saving luminary:", chrome.runtime.lastError);
          } else {
            console.log("Luminary saved:", selectedText);
          }
        });
      }
    });
  }
});
