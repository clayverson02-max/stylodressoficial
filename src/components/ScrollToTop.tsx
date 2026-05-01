import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Garante que toda mudança de rota inicia no topo da página,
 * mantendo o foco do cliente no começo do próximo passo.
 */
export const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [pathname]);

  return null;
};
