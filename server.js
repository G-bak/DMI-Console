const express = require("express");
const path = require("path");

const app = express();
const PORT = 5500;

// 정적 파일 제공 (index.html, assets/* 등)
app.use(express.static(__dirname));

// 루트("/")와 "/console" 모두 index.html로 매핑
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.get("/console", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// /work-standards → work-standards.html
app.get("/work-standards", (req, res) => {
  res.sendFile(path.join(__dirname, "work-standards.html"));
});

// /work-standards/R-17 같은 경로도 work-standards.html로
app.get("/work-standards/:unit", (req, res) => {
  res.sendFile(path.join(__dirname, "work-standards.html"));
});

// 404 fallback
app.use((req, res) => res.status(404).send("404 Not Found"));

app.listen(PORT, () => {
  console.log(`✅ Server running at: http://127.0.0.1:${PORT}`);
});
