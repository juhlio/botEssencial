const { Client, LocalAuth } = require("whatsapp-web.js");
const express = require("express");
const { body, validationResult } = require("express-validator");
const socketIO = require("socket.io");
const qrcode = require("qrcode");
const http = require("http");
const fileUpload = require("express-fileupload");
const app = express();
const server = http.createServer(app);
const io = socketIO(server);
const { setUserState, getUserState } = require("./stateManager");
const { iniciar, handleOrcamentoConversation } = require("./flows/orcamentos");
const { handleSuporteTecnicoState } = require("./flows/suporteTecnico");
const { ConversationProfilesClient } = require("@google-cloud/dialogflow");

// PORTA ONDE O SERVIÇO SERÁ INICIADO
const port = 8000;
const idClient = "bot-zdg";

// SERVIÇO EXPRESS
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(fileUpload({ debug: true }));
app.use("/", express.static(__dirname + "/"));
app.get("/", (req, res) => {
  res.sendFile("index.html", { root: __dirname });
});

// PARÂMETROS DO CLIENT DO WPP
const client = new Client({
  authStrategy: new LocalAuth({ clientId: idClient }),
  puppeteer: {
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-accelerated-2d-canvas",
      "--no-first-run",
      "--no-zygote",
      "--single-process", // <- this one doesn't work in Windows
      "--disable-gpu",
    ],
  },
});

// INITIALIZE DO CLIENT DO WPP
client.initialize();

// EVENTOS DE CONEXÃO EXPORTADOS PARA O INDEX.HTML VIA SOCKET
io.on("connection", function (socket) {
  socket.emit("message", "© BOT-ZDG - Iniciado");
  socket.emit("qr", "./icon.svg");

  client.on("qr", (qr) => {
    console.log("QR RECEIVED", qr);
    qrcode.toDataURL(qr, (err, url) => {
      socket.emit("qr", url);
      socket.emit(
        "message",
        "© BOT-ZDG QRCode recebido, aponte a câmera do seu celular!"
      );
    });
  });

  client.on("ready", () => {
    socket.emit("ready", "© BOT-ZDG Dispositivo pronto!");
    socket.emit("message", "© BOT-ZDG Dispositivo pronto!");
    socket.emit("qr", "./check.svg");
    console.log("© BOT-ZDG Dispositivo pronto");
  });

  client.on("authenticated", () => {
    socket.emit("authenticated", "© BOT-ZDG Autenticado!");
    socket.emit("message", "© BOT-ZDG Autenticado!");
    console.log("© BOT-ZDG Autenticado");
  });

  client.on("auth_failure", function () {
    socket.emit("message", "© BOT-ZDG Falha na autenticação, reiniciando...");
    console.error("© BOT-ZDG Falha na autenticação");
  });

  client.on("change_state", (state) => {
    console.log("© BOT-ZDG Status de conexão: ", state);
  });

  client.on("disconnected", (reason) => {
    socket.emit("message", "© BOT-ZDG Cliente desconectado!");
    console.log("© BOT-ZDG Cliente desconectado", reason);
    client.initialize();
  });
});

// POST PARA ENVIO DE MENSAGEM
app.post(
  "/send-message",
  [body("number").notEmpty(), body("message").notEmpty()],
  async (req, res) => {
    const errors = validationResult(req).formatWith(({ msg }) => {
      return msg;
    });

    if (!errors.isEmpty()) {
      return res.status(422).json({
        status: false,
        message: errors.mapped(),
      });
    }

    const number = req.body.number.replace(/\D/g, "");
    const numberDDD = number.substr(0, 2);
    const numberUser = number.substr(-8, 8);
    const message = req.body.message;

    const numberZDG =
      numberDDD <= 30
        ? `55${numberDDD}9${numberUser}@c.us`
        : `55${numberDDD}${numberUser}@c.us`;

    client
      .sendMessage(numberZDG, message)
      .then((response) => {
        res.status(200).json({
          status: true,
          message: "BOT-ZDG Mensagem enviada",
          response: response,
        });
      })
      .catch((err) => {
        res.status(500).json({
          status: false,
          message: "BOT-ZDG Mensagem não enviada",
          response: err.text,
        });
      });
  }
);

// Função para lidar com os estados dos usuários
const handleUserState = (user, state, msg) => {
  if (state && state.type === 'orcamento') {
    handleOrcamentoConversation(client, msg);
  } else if (state && state.type.startsWith("suporte_tecnico")) {
    handleSuporteTecnicoState(user, state, msg, client);
  } else {
    // Caso não haja estado definido ou tipo desconhecido
    client.sendMessage(user, "Estado desconhecido ou não reconhecido.");
  }
};

// EVENTO DE ESCUTA/ENVIO DE MENSAGENS RECEBIDAS PELA API
client.on("message", async (msg) => {
  
  const user = msg.from;
  const state = getUserState(user);

  if (!state) {
    if (msg.body.toLowerCase() === "começar") {
      msg.reply(
        "Olá! Tudo bem? Escolha uma das opções abaixo: \n\n 1 - Orçamentos\n 2 - Suporte Técnico"
      );
      //setUserState(user, { type: 'menu_principal' });
    } else if (msg.body === "1") {
      client.sendMessage(user, "Você escolheu Orçamentos. Redirecionando para o fluxo:");
      setUserState(user, { type: 'orcamento', step: '0' });
      estado = getUserState(user)
      console.log(estado) 
      handleOrcamentoConversation(client, msg);
      
    } else if (msg.body === "2") {
      client.sendMessage(user, "Você escolheu Suporte Técnico. Por favor, descreva o problema:");
      setUserState(user, { type: 'suporte_tecnico_problema' });
    } else {
      client.sendMessage(user, "Opção inválida. Digite 'Começar' para iniciar.");
    }
  } else {
    handleUserState(user, state, msg);
  }
});

// INITIALIZE DO SERVIÇO
server.listen(port, function () {
  console.log("© Bot Essencial - Aplicativo rodando na porta *: " + port);
});
