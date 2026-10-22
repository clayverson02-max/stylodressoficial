export function scrollToSection(id: string, highlight = false) {
  const section = document.getElementById(id);
  if (!section) return;
  const offset = (document.querySelector(".top-bar")?.getBoundingClientRect().height ?? 65) + 18;
  const target = Math.max(0, section.getBoundingClientRect().top + window.scrollY - offset);
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  window.scrollTo({ top: target, behavior: reduced ? "auto" : "smooth" });
  if (!highlight) return;
  const start = performance.now();
  const flash = () => {
    const card = section.querySelector(".offer-card");
    card?.classList.remove("offer-highlight");
    requestAnimationFrame(() => {
      card?.classList.add("offer-highlight");
      window.setTimeout(() => card?.classList.remove("offer-highlight"), 1200);
    });
  };
  const check = () => {
    if (Math.abs(window.scrollY - target) < 6 || reduced) flash();
    else if (performance.now() - start < 2200) requestAnimationFrame(check);
  };
  requestAnimationFrame(check);
}
