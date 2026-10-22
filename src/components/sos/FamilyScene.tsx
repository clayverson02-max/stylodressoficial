import { useId } from "react";

/** Original lightweight vector artwork; replace this component with a real photo if desired. */
export function FamilyScene({ variant = "hope" }: { variant?: "hope" | "night" | "community" | "confusion" | "morning" }) {
  const id = useId();
  const night = variant === "night";
  const morning = variant === "morning";
  const labels = { hope: "Mãe e pai acolhem o bebê enquanto consultam o celular. Uma onda de choro se transforma em uma linha calma.", night: "Ilustração de mãe cansada com bebê no colo, lua na janela e relógio na madrugada.", community: "Famílias diversas com seus bebês, reunidas em um círculo acolhedor.", confusion: "Mãe diante de um celular cercado por palpites contraditórios.", morning: "Mãe com bebê no colo em uma manhã de luz dourada, consultando seu guia no celular." };
  const adult = (x: number, y: number, skin: string, clothes: string, father = false) => <g transform={`translate(${x} ${y})`}><path d="M-65 155 Q-70 42 0 48 Q70 42 65 155Z" fill={clothes}/><rect x="-12" y="28" width="24" height="30" rx="10" fill={skin}/><ellipse cy="0" rx="36" ry="42" fill={skin}/><path d={father ? "M-36 0 Q-49-59 14-47 Q49-43 35-5 L24-25 Q-8-11-25-20Z" : "M-36 35 Q-66-35-25-49 Q35-75 44-5 L41 57 26 27 27-21 Q-6-6-27-23 L-27 37Z"} fill="#283146"/><path d="M-15 7l7 0m15 0l7 0" stroke="#283146" strokeWidth="3" strokeLinecap="round"/><path d={night ? "M-5 27 Q0 22 6 26" : "M-7 22 Q0 29 8 22"} fill="none" stroke="#8f4e3a" strokeWidth="2"/><path d="M-44 85 Q-15 125 43 102" fill="none" stroke={skin} strokeWidth="19" strokeLinecap="round"/></g>;
  return <svg viewBox="0 0 520 340" role="img" aria-labelledby={id} className={`family-scene scene-${variant}`}><title id={id}>{labels[variant]}</title>
    <rect x="12" y="12" width="496" height="316" rx="100" fill={night ? "#14295c" : morning ? "#fff0c8" : "#d9f2f6"}/>
    <circle cx="400" cy="92" r="62" fill={night ? "#233e73" : "#fff8ee"}/>
    {night ? <><path d="M428 53a37 37 0 1 0 15 64 36 36 0 0 1-15-64" fill="#ffc83d"/><text x="62" y="73" fill="#ffc83d" fontSize="26" fontWeight="800">03:40</text></> : <><circle cx="414" cy="76" r="26" fill="#ffc83d"/><path d="M62 275 Q250 210 470 278" stroke="#a6d9d0" strokeWidth="30" fill="none"/></>}
    {variant === "community" ? <>{adult(111,143,"#9b5b3f","#4db8ff")}{adult(260,119,"#e5aa81","#3ddbb0",true)}{adult(409,149,"#6b402e","#ffc83d")}</> : <>{adult(210,131,"#b67653",night ? "#638dd2" : "#3ddbb0")}{!night && !morning && variant !== "confusion" && adult(338,119,"#edbc97","#4db8ff",true)}
    <g transform="translate(236 222) rotate(-13)"><ellipse rx="57" ry="27" fill="#fff8ee"/><circle cx="-28" cy="-13" r="21" fill="#edbc97"/><path d="M-38-16l7 0m7 0l6 0" stroke="#283146" strokeWidth="2" strokeLinecap="round"/></g>
    {!night && <g transform="translate(351 184) rotate(12)"><rect width="54" height="87" rx="9" fill="#0b1b3f"/><rect x="5" y="7" width="44" height="70" rx="4" fill="#fff8ee"/><path d="M13 26h28M13 41h28M13 56h19" stroke="#16806b" strokeWidth="5" strokeLinecap="round"/></g>}</>}
    {variant === "hope" && <path className="sound-wave" d="M39 304h23l6-12 7 22 7-30 8 37 9-28 7 11h28q25-11 50 0t50 0q25-6 50 0t50 0h136" stroke="#1e9d88" strokeWidth="4" fill="none" strokeLinecap="round"/>}
    {variant === "confusion" && <>{[["Faz assim!",30,40],["Vi no TikTok…",310,39],["O grupo disse…",335,279]].map(([t,x,y]) => <g key={t}><rect x={Number(x)} y={Number(y)} width="150" height="39" rx="14" fill="#fff8ee"/><text x={Number(x)+12} y={Number(y)+25} fill="#0b1b3f" fontSize="16" fontWeight="800">{t}</text></g>)}</>}
    {variant === "community" && <path d="M244 278c-35-30-60 13 16 43 76-30 51-73 16-43l-16 13Z" fill="#ff5a5f"/>}
    {morning && <g><rect x="62" y="258" width="36" height="28" rx="7" fill="#fff"/><path d="M98 263q24 0 0 16" fill="none" stroke="#fff" strokeWidth="5"/></g>}
  </svg>;
}
