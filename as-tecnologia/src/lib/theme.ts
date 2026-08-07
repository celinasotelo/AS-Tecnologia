export type Theme = "light" | "dark";

// Clave de localStorage con la elección del usuario. Si no existe, el tema
// sigue al sistema operativo. La usan el script de abajo y el ThemeToggle.
export const THEME_STORAGE_KEY = "as-theme";

/**
 * Script que decide el tema ANTES de que el navegador pinte la página.
 *
 * El HTML sale del servidor sin saber qué tema querés: si esperáramos a que
 * React hidrate, se vería un flash del tema equivocado en cada carga. Por eso
 * este código se inyecta inline y síncrono en el layout: el navegador frena,
 * lo ejecuta y recién ahí sigue. Un <script src="..."> no serviría porque
 * cargaría en paralelo y llegaría tarde.
 *
 * Deja en el <html> un data-theme ya resuelto ("light" o "dark"), así el CSS
 * sólo necesita la regla [data-theme="light"] y no duplica la paleta dentro de
 * un @media. El try/catch cubre navegadores que bloquean localStorage (modo
 * incógnito con cookies de terceros deshabilitadas): ahí cae a oscuro.
 */
export const THEME_INIT_SCRIPT = `(function(){try{var t=localStorage.getItem("${THEME_STORAGE_KEY}");if(t!=="light"&&t!=="dark"){t=window.matchMedia("(prefers-color-scheme: light)").matches?"light":"dark";}document.documentElement.dataset.theme=t;}catch(e){document.documentElement.dataset.theme="dark";}})();`;
