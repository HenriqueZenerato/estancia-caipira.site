import { readFile } from "node:fs/promises";

const mode = process.argv[2];
const legalPaths = [
  "../politica-de-privacidade/index.html",
  "../termos-de-uso/index.html",
  "../politica-de-seguranca/index.html"
];
const legalTitles = ["Política de Privacidade", "Termos de Uso", "Política de Segurança"];
const legalHeadingSets = [
  ["Objetivo e escopo", "Dados que podem ser tratados", "Como os dados podem ser obtidos", "Finalidades do tratamento", "Compartilhamento e serviços de terceiros", "WhatsApp, Instagram e Google Maps", "Cookies e tecnologias semelhantes", "Segurança", "Retenção", "Direitos dos titulares", "Atualizações desta política", "Identificação e contato"],
  ["Finalidade do site", "Natureza das informações", "Uso adequado", "Links e serviços de terceiros", "Propriedade intelectual", "Disponibilidade do site", "Atualizações", "Responsabilidade", "Contato", "Vigência"],
  ["Objetivo", "Escopo", "Compromisso com a segurança", "Proteção do conteúdo e da infraestrutura", "Atualizações e manutenção", "Tratamento de incidentes", "Comunicação responsável", "Limitações", "Atualizações desta política", "Contato"]
];

const [html, css, robots, ...legalDocuments] = await Promise.all([
  readFile(new URL("../index.html", import.meta.url), "utf8"),
  readFile(new URL("../styles.css", import.meta.url), "utf8"),
  readFile(new URL("../robots.txt", import.meta.url), "utf8"),
  ...legalPaths.map((path) => readFile(new URL(path, import.meta.url), "utf8"))
]);

const imageTags = [...html.matchAll(/<img\b[^>]*>/gi)].map((match) => match[0]);
const structuredDataMatch = html.match(/<script type="application\/ld\+json">\s*([\s\S]*?)\s*<\/script>/);
let structuredData;

try {
  structuredData = structuredDataMatch ? JSON.parse(structuredDataMatch[1]) : null;
} catch {
  structuredData = null;
}

const hasNoEmptyLink = (document) => !/href\s*=\s*["'](?:#|javascript:)\s*["']/i.test(document);
const hasLegalFooter = (document) => ["Política de Privacidade", "Termos de Uso", "Política de Segurança"].every((label) => document.includes(label));
const legalDocumentsAreAccessible = legalDocuments.every((document) =>
  /<html lang="pt-BR">/.test(document) &&
  /class="skip-link"/.test(document) &&
  /<main\b[^>]*id="conteudo"/.test(document) &&
  (document.match(/<h1\b/g) ?? []).length === 1 &&
  hasNoEmptyLink(document) &&
  hasLegalFooter(document)
);
const legalTitlesAreCorrect = legalDocuments.every((document, index) => document.includes(`<h1>${legalTitles[index]}</h1>`));
const legalContentIsStructured = legalDocuments.every((document, index) => legalHeadingSets[index].every((heading) => document.includes(heading)));
const legalDocumentsArePublicReady = legalDocuments.every((document) =>
  !/Pendência de configuração|Antes da publicação definitiva/i.test(document) &&
  /Última atualização:\s*<time datetime="2026-09-17">17 de setembro de 2026<\/time>/.test(document)
);

const checks = [
  ["documento em português", /<html lang="pt-BR">/],
  ["título presente", /<title>[^<]+<\/title>/],
  ["descrição presente", /<meta name="description"/],
  ["favicon presente", /<link rel="icon"/],
  ["metadados Open Graph", /<meta property="og:title"/],
  ["metadados Twitter", /<meta name="twitter:card"/],
  ["dados estruturados Restaurant", structuredData?.["@type"] === "Restaurant"],
  ["robots permite rastreamento", /User-agent:\s*\*\s*\r?\nAllow:\s*\//.test(robots)],
  ["um único h1", (html.match(/<h1\b/g) ?? []).length === 1],
  ["atalho de conteúdo", /class="skip-link"/],
  ["preferência de movimento reduzido", /prefers-reduced-motion/],
  ["foco de teclado", /:focus-visible/],
  ["sem imagem de referência publicada", !/images\.references/.test(html)],
  ["sem conteúdo fictício marcado como avaliação", !/depoimento|testimonial/i.test(html)],
  ["imagens com dimensões explícitas", imageTags.every((tag) => /\bwidth=/.test(tag) && /\bheight=/.test(tag))],
  ["imagens com alternativa textual", imageTags.every((tag) => /\balt=/.test(tag))],
  ["imagem principal com prioridade", /fetchpriority="high"/],
  ["imagens secundárias com carregamento tardio", /loading="lazy"/],
  ["WhatsApp oficial nos CTAs", (html.match(/https:\/\/wa\.me\/5517996688558/g) ?? []).length >= 2],
  ["Instagram oficial", /https:\/\/www\.instagram\.com\/estancia_caipira_sjriopreto\//],
  ["links legais no rodapé", /href="politica-de-privacidade\/"/.test(html) && /href="termos-de-uso\/"/.test(html) && /href="politica-de-seguranca\/"/.test(html)],
  ["páginas legais acessíveis", legalDocumentsAreAccessible],
  ["títulos legais corretos", legalTitlesAreCorrect],
  ["conteúdo legal estruturado", legalContentIsStructured],
  ["páginas legais sem pendências públicas", legalDocumentsArePublicReady],
  ["sem links vazios", hasNoEmptyLink(html)]
];

const failures = checks.filter(([, result]) => typeof result === "boolean" ? !result : !result.test(html + css));

if (failures.length) {
  for (const [label] of failures) console.error(`FALHA: ${label}`);
  process.exit(1);
}

if (mode === "test") {
  const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]);
  const duplicateIds = ids.filter((id, index) => ids.indexOf(id) !== index);
  const anchors = [...html.matchAll(/href="#([^"]+)"/g)].map((match) => match[1]);
  const missingTargets = anchors.filter((anchor) => !ids.includes(anchor));

  if (duplicateIds.length || missingTargets.length) {
    console.error(`IDs duplicados: ${duplicateIds.join(", ") || "nenhum"}`);
    console.error(`Âncoras sem destino: ${missingTargets.join(", ") || "nenhuma"}`);
    process.exit(1);
  }
}

console.log(`${mode}: OK (${checks.length} verificações)`);