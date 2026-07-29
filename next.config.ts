import type { NextConfig } from "next";

const basePath = "/mandalas";

const nextConfig: NextConfig = {
  // servido em joaobonatti.com/mandalas via rewrite no projeto do site
  basePath,
  // exposto ao cliente porque basePath nao alcanca fetch() — ver src/lib/basePath.ts
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
  // com basePath ativo a raiz passa a dar 404, quebrando quem tem o link antigo.
  // basePath: false impede o Next de prefixar o source, senao a regra viraria
  // /mandalas -> /mandalas e nunca casaria com a raiz.
  async redirects() {
    return [{ source: "/", destination: basePath, permanent: false, basePath: false }];
  },
};

export default nextConfig;
