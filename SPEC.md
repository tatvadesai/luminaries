# Specification: Luminaries (Chrome Extension)

## Overview
**Luminaries** is a Chrome extension designed to streamline researching individuals online. It provides a simple, fast workflow: highlight a name, right-click, and instantly launch a comprehensive AI-powered search via Perplexity while silently saving the name to a running list for future reference.

## Core Features

### 1. Context Menu Integration
*   **Action:** When a user highlights text (a person's name) and right-clicks, a new option is available in the context menu.
*   **Label:** "Research '[Highlighted Text]' with Perplexity"
*   **Functionality:** Clicking this triggers two actions simultaneously:
    1.  **Search:** Opens a new tab directed to Perplexity.ai with a specific pre-prompt.
    2.  **Save:** Saves the highlighted text to the extension's local storage.

### 2. Perplexity Integration (Pre-prompting)
*   **Mechanism:** The extension constructs a URL query for Perplexity, prepending a detailed instruction set to the highlighted name to ensure structured, comprehensive results.
*   **The Pre-prompt:** 
    > "Provide a comprehensive overview of [Highlighted Name]. Please include: 1. A brief summary of who they are and their current role. 2. Their career history and notable achievements. 3. Any significant projects, publications, or companies they are associated with. 4. Their general reputation or impact in their field. 5. Provide links to their official or confirmed social media profiles, specifically LinkedIn, Twitter (X), and YouTube, as well as their personal website or blog if they have one."
*   **URL Structure:** `https://www.perplexity.ai/search?q=[URL Encoded Pre-prompt]`

### 3. The "Luminaries" Log (Popup UI)
*   **Access:** Clicking the extension icon in the Chrome toolbar opens a clean popup interface.
*   **Display:** Presents a chronological list of all saved names.
*   **Actions:**
    *   **Copy:** A button/icon to copy a specific name to the clipboard.
    *   **Delete:** A button/icon to remove an individual entry from the list.
    *   **Clear All:** A global action to wipe the entire log.
*   **Empty State:** Displays a helpful message (e.g., "No luminaries saved yet. Highlight a name and right-click to research.") when the list is empty.

## Technical Architecture

### 1. `manifest.json` (Manifest V3)
*   **Permissions Required:**
    *   `contextMenus`: To add the right-click option.
    *   `storage`: To save the list of names (`chrome.storage.local`).
*   **Background Service Worker:** Registers the context menu and handles the click event (`background.js`).
*   **Action:** Defines the popup UI (`popup.html`).

### 2. `background.js`
*   Creates the context menu item on installation.
*   Listens for `chrome.contextMenus.onClicked`.
*   Retrieves the `selectionText`.
*   Constructs the Perplexity URL with the pre-prompt and opens a new tab (`chrome.tabs.create`).
*   Retrieves the current list from `chrome.storage.local`, appends the new name, and saves the updated list back to storage.

### 3. `popup.html` & `popup.js`
*   **HTML:** Minimal, modern structure. Includes a header, the list container (`<ul>` or `<div>`), and a "Clear All" button.
*   **JS:**
    *   Fetches saved names from `chrome.storage.local` on load and renders the list items.
    *   Attaches event listeners for "Copy", "Delete", and "Clear All" actions, updating the DOM and `chrome.storage.local` appropriately.

## Design & UX
*   **Aesthetic:** Clean, minimalist, and fast.
*   **Feedback:** Provide subtle visual feedback in the popup (e.g., a checkmark when a name is copied) to confirm actions.
