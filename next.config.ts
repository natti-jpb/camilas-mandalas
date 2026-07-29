import type { NextConfig } from "next";

const basePath = "/mandalas";

const nextConfig: NextConfig = {
  // servido em joaobonatti.com/mandalas via rewrite no projeto do site
  basePath,
  // exposto ao cliente porque basePath nao alcanca fetch() — ver src/lib/basePath.ts
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
};

export default nextConfig;
