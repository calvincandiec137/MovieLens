const localBase = "http://localhost:4000";
const bundledBase = "/data";

export async function loadCsv(name) {
  try {
    const response = await fetch(`${localBase}/${name}`);
    if (response.ok) {
      const text = await response.text();
      return { text, source: "LOCAL" };
    }
  } catch (error) {}

  const fallback = await fetch(`${bundledBase}/${name}`);
  if (!fallback.ok) {
    throw new Error(`Missing ${name}. Run sync-data.ps1.`);
  }
  const text = await fallback.text();
  return { text, source: "BUNDLED" };
}
