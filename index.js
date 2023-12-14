const { Client } = require("whatsapp-web.js");
const express = require("express");
const qrcode = require("qrcode");
const http = require("http");
const puppeteer = require("puppeteer");

const app = express();
const server = http.createServer(app);
const io = require("socket.io")(server);

app.use(express.static("public"));

const client = new Client();
let browser;

client.on("qr", (qr) => {
  qrcode.toDataURL(qr, (err, url) => {
    io.emit("qr", url);
  });
});

client.on("authenticated", (session) => {
  console.log("Autenticado");
});

client.on("auth_failure", (msg) => {
  console.error("Error de autenticación:", msg);
});

client.on("ready", async () => {
  console.log("Cliente listo");
  browser = await puppeteer.launch({ args: ["--no-sandbox"] });
});

client.on("message", (message) => {
  console.log("Mensaje recibido:", message.body);
});

client.initialize();

server.listen(3000, () => {
  console.log("Servidor en http://localhost:3000");
});

// Manejar el cierre adecuado
process.on("SIGINT", async () => {
  await browser.close();
  process.exit();
});
