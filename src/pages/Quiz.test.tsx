import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import SalesPage from "./Quiz";
import { trackStandard } from "@/lib/metaPixel";

vi.mock("@/lib/metaPixel", () => ({ trackStandard: vi.fn(), trackInitiateCheckout: vi.fn(), trackCustom: vi.fn() }));

beforeEach(() => {
  vi.spyOn(HTMLMediaElement.prototype, "play").mockResolvedValue();
  vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(() => {});
  vi.stubGlobal("scrollTo", vi.fn());
});

describe("reading and exit-intent behavior", () => {
  beforeEach(() => { sessionStorage.clear(); vi.mocked(trackStandard).mockClear(); });
  afterEach(() => { cleanup(); vi.unstubAllGlobals(); vi.restoreAllMocks(); });

  it("fires ViewContent once after halfway through the scrollable page", () => {
    let queued: FrameRequestCallback | undefined;
    vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => { queued = callback; return 1; });
    vi.spyOn(document.documentElement, "scrollHeight", "get").mockReturnValue(2000);
    vi.stubGlobal("innerHeight", 600);
    vi.stubGlobal("scrollY", 0);
    render(<SalesPage />);
    expect(trackStandard).not.toHaveBeenCalled();
    vi.stubGlobal("scrollY", 699);
    act(() => { fireEvent.scroll(window); queued?.(0); });
    expect(trackStandard).not.toHaveBeenCalled();
    vi.stubGlobal("scrollY", 700);
    act(() => { fireEvent.scroll(window); queued?.(1); });
    expect(trackStandard).toHaveBeenCalledWith("ViewContent", expect.objectContaining({value:17.90,currency:"BRL"}));
    act(() => { fireEvent.scroll(window); queued?.(2); });
    expect(trackStandard).toHaveBeenCalledOnce();
  });

  it("does not show an exit popup on touch/mobile layouts", () => {
    render(<SalesPage />);
    fireEvent.mouseOut(document, {relatedTarget:null,clientY:0});
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("shows the desktop exit popup only once per session", () => {
    vi.stubGlobal("matchMedia", () => ({matches:true,addEventListener:vi.fn(),removeEventListener:vi.fn()}));
    render(<SalesPage />);
    fireEvent.mouseOut(document, {relatedTarget:null,clientY:0});
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", {name:"Fechar aviso"}));
    fireEvent.mouseOut(document, {relatedTarget:null,clientY:0});
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});

describe("SOS Bebê interactions", () => {
  afterEach(() => cleanup());
  it("keeps every purchase link on Cakto and removes the previous offer", () => {
    render(<SalesPage />);
    const links = document.querySelectorAll<HTMLAnchorElement>("[data-checkout-cta]");
    expect(links.length).toBe(1);
    expect(links[0].closest(".offer-card")).not.toBeNull();
    expect(document.querySelectorAll("[data-offer-scroll]")).toHaveLength(4);
    links.forEach(link => expect(link.href).toBe("https://pay.cakto.com.br/gwvroes_1229714"));
    expect(document.body.textContent).not.toMatch(/Hotmart|US\$|dilatación|gestación/);
  });
  it("updates the checklist without collecting personal data", () => {
    render(<SalesPage />);
    fireEvent.click(screen.getAllByRole("checkbox")[0]);
    expect(screen.getByText("Você marcou 1 de 6")).toBeInTheDocument();
    expect(document.querySelector('[data-checkout-cta="checklist"]')).not.toBeInTheDocument();
    fireEvent.click(screen.getAllByRole("checkbox")[0]);
    expect(screen.getByText("Você marcou 0 de 6")).toBeInTheDocument();
    expect(document.querySelector('[data-checkout-cta="checklist"]')).not.toBeInTheDocument();
  });
  it("selects a situation and supports keyboard navigation", () => {
    render(<SalesPage />);
    fireEvent.click(screen.getByRole("tab",{name:"Cólica"}));
    expect(screen.getByRole("tabpanel")).toHaveAccessibleName("Cólica");
    fireEvent.keyDown(screen.getByRole("tab",{name:"Cólica"}),{key:"ArrowRight"});
    expect(screen.getByRole("tabpanel")).toHaveAccessibleName("Cocô, arroto e gases");
  });
});
