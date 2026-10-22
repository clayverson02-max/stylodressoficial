import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MiniVsl } from "./MiniVsl";
import { SituationVideos } from "./SituationVideos";
import { OfferLink } from "./OfferLink";
import { trackCustom, trackInitiateCheckout } from "@/lib/metaPixel";

vi.mock("@/lib/metaPixel", () => ({trackCustom:vi.fn(),trackInitiateCheckout:vi.fn()}));
beforeEach(() => {
  sessionStorage.clear();
  vi.mocked(trackCustom).mockClear();
  vi.mocked(trackInitiateCheckout).mockClear();
  vi.spyOn(HTMLMediaElement.prototype,"play").mockResolvedValue();
  vi.spyOn(HTMLMediaElement.prototype,"pause").mockImplementation(()=>{});
  vi.spyOn(document,"hidden","get").mockReturnValue(false);
  vi.stubGlobal("scrollTo",vi.fn());
});
afterEach(()=>{cleanup();vi.restoreAllMocks();vi.unstubAllGlobals();vi.useRealTimers();});
const open = () => { render(<MiniVsl/>);fireEvent.click(screen.getByRole("button",{name:/Assistir agora/}));return screen.getByLabelText("Vídeo de apresentação SOS Bebê") as HTMLVideoElement; };

describe("VSL safety and measurement",()=>{
  it("opens an unmuted inline video without native controls and exposes safety exit after 8s",()=>{
    vi.useFakeTimers();
    const video=open();
    expect(screen.getByRole("dialog")).toHaveAttribute("aria-modal","true");
    expect(video).not.toHaveAttribute("controls");
    expect(video).toHaveAttribute("playsinline");
    expect(video.muted).toBe(false);
    expect(screen.queryByRole("button",{name:"Fechar vídeo"})).not.toBeInTheDocument();
    act(()=>vi.advanceTimersByTime(8000));
    expect(screen.getByRole("button",{name:"Fechar vídeo"})).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button",{name:"Fechar vídeo"}));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
  it("tracks milestones once and unlocks an end screen and later session exits",()=>{
    const video=open();
    Object.defineProperty(video,"duration",{value:72,configurable:true});
    fireEvent.play(video);fireEvent.play(video);
    for(const time of [18,36,54,55]){video.currentTime=time;fireEvent.timeUpdate(video);}
    fireEvent.ended(video);
    for(const event of ["VSL_Play","VSL_25","VSL_50","VSL_75","VSL_Complete"]){
      expect(vi.mocked(trackCustom).mock.calls.filter(args=>args[0]===event)).toHaveLength(1);
    }
    expect(sessionStorage.getItem("sos-vsl-complete-v1")).toBe("1");
    expect(screen.getByRole("link",{name:"VER A OFERTA"})).toHaveAttribute("href","#oferta");
    fireEvent.click(screen.getByRole("button",{name:"Fechar vídeo"}));
    fireEvent.click(screen.getByRole("button",{name:/Assistir agora/}));
    expect(screen.getByRole("button",{name:"Fechar vídeo"})).toBeInTheDocument();
  });
  it("rejects a seek beyond the last watched point and exposes exit immediately on error",()=>{
    const video=open();
    Object.defineProperty(video,"duration",{value:72,configurable:true});
    video.currentTime=10;fireEvent.timeUpdate(video);
    video.currentTime=40;fireEvent.seeking(video);
    expect(video.currentTime).toBe(10);
    fireEvent.error(video);
    expect(screen.getByRole("button",{name:"Fechar vídeo"})).toBeInTheDocument();
  });
});

describe("preview and scroll funnel",()=>{
  it("mounts only one preview, advances when untouched and stops advancing after chip interaction",()=>{
    render(<SituationVideos/>);
    let video=document.querySelector(".clip-phone video")!;
    expect(document.querySelectorAll(".clip-phone video")).toHaveLength(1);
    expect(video).toHaveAttribute("preload","none");
    fireEvent.ended(video);
    expect(screen.getByRole("tabpanel")).toHaveAccessibleName("Cólica");
    fireEvent.click(screen.getByRole("tab",{name:"Imprevistos"}));
    video=document.querySelector(".clip-phone video")!;
    fireEvent.ended(video);
    expect(screen.getByRole("tabpanel")).toHaveAccessibleName("Imprevistos");
    expect(video).toHaveAttribute("src","/videos/sos/imprevistos.mp4");
  });
  it("scroll links fire their own custom event, never InitiateCheckout",()=>{
    render(<OfferLink location="after-hero"/>);
    fireEvent.click(screen.getByRole("link"));
    expect(trackCustom).toHaveBeenCalledWith("ClickParaOferta",{local:"after-hero"});
    expect(trackInitiateCheckout).not.toHaveBeenCalled();
    expect(screen.getByRole("link")).toHaveAttribute("href","#oferta");
  });
});


it("keeps the offer scroll scheduled after the overlay link unmounts",()=>{
  vi.useFakeTimers();
  const section=document.createElement("section");section.id="oferta";document.body.appendChild(section);
  const view=render(<OfferLink location="vsl-complete"/>);
  fireEvent.click(screen.getByRole("link"));
  view.unmount();
  act(()=>vi.advanceTimersByTime(100));
  expect(window.scrollTo).toHaveBeenCalledWith(expect.objectContaining({top:0}));
  section.remove();
});
