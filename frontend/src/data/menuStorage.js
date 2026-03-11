// src/data/menuStorage.js
import seedMenu from "./menu"; // your static 100-item menu array

const MENU_KEY = "qb_menu";

// read menu from localStorage, seed from menu.js if missing or invalid
export function readMenu() {
  try {
    const raw = localStorage.getItem(MENU_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      // if parsed is a valid array with items, return it; else reseed
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
    // seed and return
    localStorage.setItem(MENU_KEY, JSON.stringify(seedMenu));
    return seedMenu;
  } catch (e) {
    console.warn("readMenu fallback:", e);
    localStorage.setItem(MENU_KEY, JSON.stringify(seedMenu));
    return seedMenu;
  }
}

// write menu to localStorage and broadcast an update event
export function writeMenu(menu) {
  try {
    localStorage.setItem(MENU_KEY, JSON.stringify(menu));
    window.dispatchEvent(new Event("qb_menu_updated"));
  } catch (e) {
    console.error("writeMenu error:", e);
  }
}

// reset menu to the original 100-item seed
export function resetMenuToSeed() {
  try {
    localStorage.setItem(MENU_KEY, JSON.stringify(seedMenu));
    window.dispatchEvent(new Event("qb_menu_updated"));
    return seedMenu;
  } catch (e) {
    console.error("resetMenuToSeed error:", e);
    return seedMenu;
  }
}
