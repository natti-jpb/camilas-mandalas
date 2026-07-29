/**
 * basePath do Next prefixa assets, <Link> e router automaticamente, mas NAO
 * prefixa URL montada a mao. Sem isto, com o app servido em
 * joaobonatti.com/mandalas as chamadas de fetch iriam para /api/... na raiz
 * do dominio e voltariam 404.
 */
const BASE = process.env.NEXT_PUBLIC_BASE_PATH || "";

export const withBasePath = (path: string) => `${BASE}${path}`;
