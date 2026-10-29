// Converts the owner's manual to Markdown (one heading per page) and indexes it in an OpenAI vector store.
// Needs poppler (pdftotext, pdfinfo). Run: node --env-file=.env.local scripts/manual-to-vector-store.mjs
import { execFileSync } from "node:child_process";
import { createReadStream, writeFileSync } from "node:fs";
import OpenAI from "openai";
import { toMarkdown } from "./manual/pages.mjs";

const PDF = "context/6-2015-manual-del-propietario.pdf";
const OUT = "context/manual.md";
const STORE_NAME = "pitstop-manual";

const info = execFileSync("pdfinfo", [PDF], { encoding: "utf8" });
const pageCount = Number(info.match(/^Pages:\s+(\d+)/m)[1]);

const pages = [];
for (let n = 1; n <= pageCount; n++) {
  pages.push(execFileSync("pdftotext", ["-layout", "-f", `${n}`, "-l", `${n}`, PDF, "-"], { encoding: "utf8" }));
}
writeFileSync(OUT, toMarkdown(pages));
console.log(`Wrote ${OUT}: ${pageCount} pages`);

const client = new OpenAI();

let store;
for await (const s of client.vectorStores.list()) {
  if (s.name === STORE_NAME) store = s;
}
store ??= await client.vectorStores.create({ name: STORE_NAME });

// Replace, never duplicate: drop whatever the store held before.
for await (const f of client.vectorStores.files.list(store.id)) {
  await client.vectorStores.files.delete(f.id, { vector_store_id: store.id });
  await client.files.delete(f.id).catch(() => {});
}

const file = await client.vectorStores.files.uploadAndPoll(store.id, createReadStream(OUT));
if (file.status !== "completed") throw new Error(`Indexing ${file.status}: ${file.last_error?.message ?? "unknown"}`);

console.log(`OPENAI_VECTOR_STORE_ID=${store.id}`);
