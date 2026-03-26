import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import multer from "multer";
import mammoth from "mammoth";
import * as pdfImport from "pdf-parse";
const pdf = (pdfImport as any).default || pdfImport;
import * as xlsx from "xlsx";
import * as cheerio from "cheerio";
import axios from "axios";
import fs from "fs";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const upload = multer({ dest: 'uploads/' });

async function parseFile(file: any) {
  const filePath = file.path;
  const mimeType = file.mimetype;
  let content = "";

  try {
    if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      const result = await mammoth.extractRawText({ path: filePath });
      content = result.value;
    } else if (mimeType === 'application/pdf') {
      const dataBuffer = fs.readFileSync(filePath);
      const data = await pdf(dataBuffer);
      content = data.text;
    } else if (mimeType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || mimeType === 'text/csv') {
      const workbook = xlsx.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      content = xlsx.utils.sheet_to_txt(worksheet);
    } else if (mimeType === 'text/html') {
      const html = fs.readFileSync(filePath, 'utf8');
      const $ = cheerio.load(html);
      content = $('body').text();
    } else {
      content = fs.readFileSync(filePath, 'utf8');
    }
  } catch (error) {
    console.error(`Error parsing file ${file.originalname}:`, error);
    content = `[Error parsing file: ${file.originalname}]`;
  } finally {
    // Clean up temp file
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }

  return content;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));

  // API routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.post("/api/upload", upload.array('files'), async (req: any, res) => {
    const files = req.files as any[];
    if (!files || files.length === 0) {
      return res.status(400).json({ error: "No files uploaded" });
    }

    try {
      const parsedFiles = await Promise.all(files.map(async (file) => {
        const content = await parseFile(file);
        return {
          name: file.originalname,
          type: file.mimetype.split('/')[1].toUpperCase(),
          content: content
        };
      }));

      res.json({ files: parsedFiles });
    } catch (error) {
      console.error("Upload processing error:", error);
      res.status(500).json({ error: "Failed to process files" });
    }
  });

  app.post("/api/scrape", async (req, res) => {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: "URL is required" });

    try {
      const response = await axios.get(url);
      const $ = cheerio.load(response.data);
      const content = $('body').text().replace(/\s+/g, ' ').trim();
      res.json({ content });
    } catch (error) {
      console.error("Scraping error:", error);
      res.status(500).json({ error: "Failed to scrape URL" });
    }
  });

  app.post("/api/patents", async (req, res) => {
    const { q, page = 0 } = req.body;
    const apiKey = process.env.SERP_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: "SERP_API_KEY is not configured on the server." });
    }

    try {
      const response = await axios.get("https://serpapi.com/search.json", {
        params: {
          engine: "google_patents",
          q: q,
          start: page * 10,
          api_key: apiKey
        }
      });
      res.json(response.data);
    } catch (error) {
      console.error("SerpApi error:", error);
      res.status(500).json({ error: "Failed to search patents via SerpApi" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
