import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, act } from "@testing-library/react";
import { ThemeProvider, useTheme, THEMES } from "../ThemeContext";

// ── helpers ───────────────────────────────────────────────────────────────────

const Consumer = ({ onRender }) => {
  const ctx = useTheme();
  onRender(ctx);
  return null;
};

function renderWithProvider(initialStorage = null) {
  if (initialStorage) {
    localStorage.setItem("visual-theme", initialStorage);
  } else {
    localStorage.removeItem("visual-theme");
  }

  let captured = {};
  render(
    <ThemeProvider>
      <Consumer onRender={(ctx) => { captured = ctx; }} />
    </ThemeProvider>
  );
  return () => captured;
}

beforeEach(() => {
  localStorage.clear();
  document.documentElement.removeAttribute("data-theme");
});

// ── THEMES constant ───────────────────────────────────────────────────────────

describe("THEMES", () => {
  it("contains exactly 5 entries", () => {
    expect(THEMES).toHaveLength(5);
  });

  it("includes default, brutalism, futurism, retro, terminal", () => {
    expect(THEMES).toEqual(
      expect.arrayContaining(["default", "brutalism", "futurism", "retro", "terminal"])
    );
  });
});

// ── ThemeProvider initial state ───────────────────────────────────────────────

describe("ThemeProvider — initial state", () => {
  it("defaults to 'default' when localStorage is empty", () => {
    const getCtx = renderWithProvider();
    expect(getCtx().theme).toBe("default");
  });

  it("reads persisted theme from localStorage on mount", () => {
    const getCtx = renderWithProvider("terminal");
    expect(getCtx().theme).toBe("terminal");
  });

  it("sets data-theme attribute on <html> after mount", () => {
    renderWithProvider();
    expect(document.documentElement.getAttribute("data-theme")).toBe("default");
  });

  it("sets data-theme to the stored theme on mount", () => {
    renderWithProvider("brutalism");
    expect(document.documentElement.getAttribute("data-theme")).toBe("brutalism");
  });
});

// ── setTheme ──────────────────────────────────────────────────────────────────

describe("ThemeProvider — setTheme", () => {
  it("updates theme in context", () => {
    const getCtx = renderWithProvider();
    act(() => { getCtx().setTheme("futurism"); });
    expect(getCtx().theme).toBe("futurism");
  });

  it("persists theme in localStorage", () => {
    const getCtx = renderWithProvider();
    act(() => { getCtx().setTheme("retro"); });
    expect(localStorage.getItem("visual-theme")).toBe("retro");
  });

  it("updates data-theme attribute on <html>", () => {
    const getCtx = renderWithProvider();
    act(() => { getCtx().setTheme("terminal"); });
    expect(document.documentElement.getAttribute("data-theme")).toBe("terminal");
  });

  it("can cycle through all 5 themes", () => {
    const getCtx = renderWithProvider();
    for (const t of THEMES) {
      act(() => { getCtx().setTheme(t); });
      expect(getCtx().theme).toBe(t);
      expect(document.documentElement.getAttribute("data-theme")).toBe(t);
      expect(localStorage.getItem("visual-theme")).toBe(t);
    }
  });

  it("does NOT touch the .dark class when switching themes", () => {
    document.documentElement.classList.add("dark");
    const getCtx = renderWithProvider();
    act(() => { getCtx().setTheme("brutalism"); });
    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });
});

// ── useTheme ──────────────────────────────────────────────────────────────────

describe("useTheme", () => {
  it("exposes { theme, setTheme } shape", () => {
    const getCtx = renderWithProvider();
    expect(typeof getCtx().theme).toBe("string");
    expect(typeof getCtx().setTheme).toBe("function");
  });
});
