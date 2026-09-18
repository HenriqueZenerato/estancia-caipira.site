import { cp, mkdir, rm } from "node:fs/promises";

const dist = new URL("../dist/", import.meta.url);
const vendor = new URL("../vendor/", import.meta.url);
await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });

for (const file of ["index.html", "styles.css", "script.js", "robots.txt"]) {
  await cp(new URL(`../${file}`, import.meta.url), new URL(file, dist));
}

await cp(new URL("../assets/", import.meta.url), new URL("assets/", dist), { recursive: true });
for (const directory of ["politica-de-privacidade", "termos-de-uso", "politica-de-seguranca"]) {
  await cp(new URL(`../${directory}/`, import.meta.url), new URL(`${directory}/`, dist), { recursive: true });
}
await mkdir(vendor, { recursive: true });
await cp(new URL("../node_modules/motion/dist/motion.js", import.meta.url), new URL("motion.js", vendor));
await cp(vendor, new URL("vendor/", dist), { recursive: true });

console.log("build: OK (dist)");
