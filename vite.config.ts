import solid from "solid-start/vite";
import solidStartDeno from "solid-start-deno";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [solid({ ssr: 'streaming', adapter: solidStartDeno() })],
});
