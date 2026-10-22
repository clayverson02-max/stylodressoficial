/** User-confirmed mapping. Change sources and posters here to replace any video. */
export const sosMedia = {
  vsl: {
    src: "/videos/sos/vsl.mp4",
    poster: "/images/sos/vsl.webp",
    durationLabel: "1:12",
    aspectRatio: "9 / 16",
    original: "WhatsApp Video 2026-10-22 at 00.36.48.mp4",
  },
  situations: [
    { id: "choro", label: "Choro intenso", src: "/videos/sos/choro-intenso.mp4", poster: "/images/sos/choro-intenso.webp", caption: "Um olhar por dentro do conteúdo sobre choro intenso.", original: "WhatsApp Video 2026-10-22 at 00.44.54.mp4" },
    { id: "colica", label: "Cólica", src: "/videos/sos/colica.mp4", poster: "/images/sos/colica.webp", caption: "Veja como o conteúdo de apoio sobre cólica é apresentado.", original: "WhatsApp Video 2026-10-22 at 00.44.57.mp4" },
    { id: "gases", label: "Cocô, arroto e gases", src: "/videos/sos/coco-arroto-gases.mp4", poster: "/images/sos/coco-arroto-gases.webp", caption: "Uma prévia dos vídeos sobre cocô, arroto e gases.", original: "WhatsApp Video 2026-10-22 at 00.45.04.mp4" },
    { id: "imprevistos", label: "Imprevistos", src: "/videos/sos/imprevistos.mp4", poster: "/images/sos/imprevistos.webp", caption: "Conheça a organização do conteúdo sobre imprevistos.", original: "WhatsApp Video 2026-10-22 at 00.45.07.mp4" },
  ],
} as const;
