import http from "node:http";
import fs from "node:fs";
import path from "node:path";

const exportsDir = path.resolve("exports");
const allowedOrigin = process.env.ALLOWED_ORIGIN || "*";

http
  .createServer((req, res) => {
    res.setHeader("Access-Control-Allow-Origin", allowedOrigin);
    res.setHeader("Access-Control-Allow-Private-Network", "true");
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");

    if (req.method === "OPTIONS") {
      res.writeHead(204);
      return res.end();
    }

    const name = path.basename(new URL(req.url, "http://localhost").pathname);
    const file = path.join(exportsDir, name);

    if (!name.endsWith(".csv") || !fs.existsSync(file)) {
      res.writeHead(404);
      return res.end("not found");
    }

    res.writeHead(200, { "Content-Type": "text/csv; charset=utf-8" });
    fs.createReadStream(file).pipe(res);
  })
  .listen(4000, "127.0.0.1", () => {
    console.log("Local CSV server listening at http://127.0.0.1:4000 (serving exports/)");
  });
