import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import SalesPage from "./Quiz";
import { trackStandard } from "@/lib/metaPixel";

vi.mock("@/lib/metaPixel", () => ({ trackStandard: vi.fn(), trackInitiateCheckout: vi.fn() }));

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
    expect(trackStandard).toHaveBeenCalledWith("ViewContent", expect.objectContaining({value:4,currency:"USD"}));
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
    fireEvent.click(screen.getByRole("button", {name:"Cerrar aviso"}));
    fireEvent.mouseOut(document, {relatedTarget:null,clientY:0});
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
