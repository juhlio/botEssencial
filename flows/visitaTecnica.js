const {
  setUserState,
  getUserState,
  updateUserData,
  addDataToObject,
  deleteUserState,
  addTempEquipToObject,
  transferTempEquipToEquips,
} = require("../stateManager");
const { Op } = require("sequelize");
const generatePDF = require("../controllers/geraPdf")
const commercialVisitsRequests = require("../dbfiles/commercialVisitsRequests");
const commercialVisitsQuestions = require("../dbfiles/commercialVisitsQuestions");
const commercialVisitsImages = require("../dbfiles/commercialVisitsImages");
const commercialVisitsEquipaments = require("../dbfiles/commercialVisitsEquipaments");
const sendMailVisitasTecnicas = require("../controllers/sendMailVisitaTecnica");
const clientes = require("../dbfiles/clients");
const fs = require("fs");
const path = require("path");
const mime = require("mime-types");
const fetch = require("node-fetch");
const { ConversationProfilesClient } = require("@google-cloud/dialogflow");

// Função para processar a conversa
async function visitaTecnica(client, msg, estadoConversa, user) {
  if (
    msg.body.toLowerCase() === "inicio" ||
    msg.body.toLowerCase === "início"
  ) {
    deleteUserState(user);
    await client.sendMessage(user, "Voltando ao menu principal...");
    //menuPrincipal.menuPrincipal(client, msg, estadoConversa, user); // Chama a função do menu principal
  }

  switch (estadoConversa.step) {
    case "0":
      updateUserData(user, { step: "1" });
      //estadoConversa.step = "1";
      await client.sendMessage(user, "Para começar, digite o cliente:");
      break;

    case "1":
      updateUserData(user, { step: "2" });
      addDataToObject(user, { 1: msg.body });
      estadoConversa.data.nomeSolicitante = msg.body;
      await client.sendMessage(user, `E qual o endereço?`);
      break;

    case "2":
      updateUserData(user, { step: "3" });
      addDataToObject(user, { 2: msg.body });
      await client.sendMessage(user, `Quem acompanhou a visita?`);

      break;

    case "3":
      updateUserData(user, { step: "4" });
      addDataToObject(user, { 3: msg.body });
      await client.sendMessage(
        user,
        `Digite o tipo do cliente? Digite apenas o número correspondente: \n\n *1* - Condomínio Residencial \n *2* - Condomínio Comercial \n *3* - Industria/Empresa`
      );

    case "4":
      if (msg.body === "1") {
        updateUserData(user, { step: "5" });
        addDataToObject(user, { 4: "Condomínio Residencial" });
        await client.sendMessage(
          user,
          `Vamos falar da estrutura do Condomínio`
        );

        await client.sendMessage(user, `São quantos apartamentos?`);
        break;
      } else if (msg.body === "2") {
        updateUserData(user, { step: "5" });
        addDataToObject(user, { 4: "Condomínio Comercial" });
        await client.sendMessage(
          user,
          `Vamos falar da estrutura do Condomínio`
        );

        await client.sendMessage(user, `São quantas salas?`);
        break;
      }

      break;

    case "5":
      updateUserData(user, { step: "6" });
      addDataToObject(user, { 5: msg.body });
      await client.sendMessage(user, `E são quantas torres?`);
      break;

    case "6":
      updateUserData(user, { step: "7" });
      addDataToObject(user, { 6: msg.body });
      await client.sendMessage(user, `Qual a quantidade de bombas?`);
      break;

    case "7":
      updateUserData(user, { step: "8" });

      addDataToObject(user, { 7: msg.body });
      await client.sendMessage(
        user,
        `Agora começaremos a adicionar os Equipamentos do Local:`
      );
      await client.sendMessage(
        user,
        "Qual o tipo do equipamento? Ex: Elevador de serviço, Elevador Social, Bomba de Recalque..."
      );
      break;

    case "8":
      updateUserData(user, { step: "9" });
      addTempEquipToObject(user, { type: msg.body });

      //equipObj.type = msg.body; // Armazena o tipo do equipamento
      await client.sendMessage(user, `Qual a corrente do equipamento em pico?`);
      break;

    case "9":
      updateUserData(user, { step: "10" });
      addTempEquipToObject(user, { pico: msg.body });
      await client.sendMessage(user, `E em operação:`);
      break;

    case "10":
      updateUserData(user, { step: "11" });

      addTempEquipToObject(user, { operacao: msg.body });
      await transferTempEquipToEquips(user);

      await client.sendMessage(
        user,
        `Deseja adicionar outro equipamento? \n 1 - Sim \n 2 - Não`
      );
      break;

    case "11":
      if (msg.body === "1") {
        updateUserData(user, { step: "8" });
        await client.sendMessage(
          user,
          "Qual o tipo do equipamento? Ex: Elevador de serviço, Elevador Social, Bomba de Recalque..."
        );
        break;
      } else if (msg.body === "2") {
        updateUserData(user, { step: "14" });
        await client.sendMessage(user, `Agora vamos às aferições de tensão...`);
        await client.sendMessage(user, `RN`);
        break;
      } else {
        await client.sendMessage(user, "Comando inválido, tente novamente.");
      }
      break;

    /*   updateUserData(user, { step: "12" });
      addDataToObject(user, { 11: msg.body });
      await client.sendMessage(user, "E em operação?");
      break;
    case "12":
      updateUserData(user, { step: "13" });
      addDataToObject(user, { 12: msg.body });
      await client.sendMessage(user, `Agora vamos falar das bombas...`);
      await client.sendMessage(
        user,
        `Especifique as bombas e sua devidas aferições e corrente em pico e em operação`
      );
      break;
    case "13":
      updateUserData(user, { step: "14" });
      addDataToObject(user, { 13: msg.body });
      await client.sendMessage(user, `Agora vamos as aferições de tensão...`);
      await client.sendMessage(user, `RN`);
      break; */
    case "14":
      updateUserData(user, { step: "15" });
      addDataToObject(user, { 14: msg.body });
      await client.sendMessage(user, `SN`);
      break;

    case "15":
      updateUserData(user, { step: "16" });
      addDataToObject(user, { 15: msg.body });
      await client.sendMessage(user, `TN`);
      break;

    case "16":
      updateUserData(user, { step: "17" });
      addDataToObject(user, { 16: msg.body });
      await client.sendMessage(user, `RS`);
      break;
    case "17":
      updateUserData(user, { step: "18" });
      addDataToObject(user, { 17: msg.body });
      await client.sendMessage(user, `ST`);
      break;
    case "18":
      updateUserData(user, { step: "19" });
      addDataToObject(user, { 18: msg.body });
      await client.sendMessage(user, `TR`);
      break;

    case "19":
      updateUserData(user, { step: "20" });
      addDataToObject(user, { 19: msg.body });
      await client.sendMessage(
        user,
        `Agora vamos anexar as imagens ao nosso relatório`
      );
      await client.sendMessage(
        user,
        `Começando pelas fotos do QGBT do cliente. Serão *2* imagens, envie a primeira.`
      );
      break;

    case "20":
      if (msg.hasMedia) {
        const media = await msg.downloadMedia();
        const extension = mime.extension(media.mimetype);
        const fileName = media.filename
          ? media.filename
          : `media_${Date.now()}.${extension}`;

        // Usando path.resolve para subir um nível
        const mediaPath = path.resolve(__dirname, "..", "medias", fileName);

        fs.writeFile(mediaPath, media.data, "base64", (err) => {
          if (err) {
            console.error("Erro ao salvar o arquivo de mídia:", err);
            client.sendMessage(
              user,
              "Não consegui gravar a imagem anterior, tente novamente por favor"
            );
          } else {
            addDataToObject(user, { 20: fileName });
            console.log("Arquivo de mídia salvo com sucesso:", mediaPath);
            updateUserData(user, { step: "21" });
            client.sendMessage(user, "Pronto! Agora envie a segunda imagem:");
          }
        });
      } else {
        await client.sendMessage(
          user,
          "Você não enviou a imagem. Tente novamente"
        );
      }
      break;

    case "21":
      if (msg.hasMedia) {
        const media = await msg.downloadMedia();
        const extension = mime.extension(media.mimetype);
        const fileName = media.filename
          ? media.filename
          : `media_${Date.now()}.${extension}`;

        // Usando path.resolve para subir um nível
        const mediaPath = path.resolve(__dirname, "..", "medias", fileName);

        fs.writeFile(mediaPath, media.data, "base64", (err) => {
          if (err) {
            console.error("Erro ao salvar o arquivo de mídia:", err);
            client.sendMessage(
              user,
              "Não consegui gravar a segunda imagem, tente novamente por favor"
            );
          } else {
            addDataToObject(user, { 21: fileName });
            console.log("Arquivo de mídia salvo com sucesso:", mediaPath);
            updateUserData(user, { step: "22" });
            client.sendMessage(
              user,
              "Agora envie as imagens do local destinado ao QGBT. São *2* fotos, envie a primeira."
            );
          }
        });
      } else {
        await client.sendMessage(
          user,
          "Você não enviou a segunda imagem. Tente novamente"
        );
      }
      break;

    case "22":
      if (msg.hasMedia) {
        const media = await msg.downloadMedia();
        const extension = mime.extension(media.mimetype);
        const fileName = media.filename
          ? media.filename
          : `media_${Date.now()}.${extension}`;

        // Usando path.resolve para subir um nível
        const mediaPath = path.resolve(__dirname, "..", "medias", fileName);

        fs.writeFile(mediaPath, media.data, "base64", (err) => {
          if (err) {
            console.error("Erro ao salvar o arquivo de mídia:", err);
            client.sendMessage(
              user,
              "Não consegui gravar a imagem, tente novamente por favor"
            );
          } else {
            addDataToObject(user, { 22: fileName });
            console.log("Arquivo de mídia salvo com sucesso:", mediaPath);
            updateUserData(user, { step: "23" });
            client.sendMessage(user, "Pronto! Agora envie a segunda imagem:");
          }
        });
      } else {
        await client.sendMessage(
          user,
          "Você não enviou a imagem. Tente novamente"
        );
      }
      break;

    case "23":
      if (msg.hasMedia) {
        const media = await msg.downloadMedia();
        const extension = mime.extension(media.mimetype);
        const fileName = media.filename
          ? media.filename
          : `media_${Date.now()}.${extension}`;

        // Usando path.resolve para subir um nível
        const mediaPath = path.resolve(__dirname, "..", "medias", fileName);

        fs.writeFile(mediaPath, media.data, "base64", (err) => {
          if (err) {
            console.error("Erro ao salvar o arquivo de mídia:", err);
            client.sendMessage(
              user,
              "Não consegui gravar a segunda imagem, tente novamente por favor"
            );
          } else {
            addDataToObject(user, { 23: fileName });
            console.log("Foto local QGBT 2 salva com sucesso:", mediaPath);
            updateUserData(user, { step: "24" });
            client.sendMessage(
              user,
              "Agora envie as fotos do trajeto de infra e passagens de cabo. São *4* imagens. Envie a primeira"
            );
          }
        });
      } else {
        await client.sendMessage(
          user,
          "Você não enviou a segunda imagem. Tente novamente"
        );
      }
      break;

    case "24":
      if (msg.hasMedia) {
        const media = await msg.downloadMedia();
        const extension = mime.extension(media.mimetype);
        const fileName = media.filename
          ? media.filename
          : `media_${Date.now()}.${extension}`;

        // Usando path.resolve para subir um nível
        const mediaPath = path.resolve(__dirname, "..", "medias", fileName);

        fs.writeFile(mediaPath, media.data, "base64", (err) => {
          if (err) {
            console.error("Erro ao salvar o arquivo de mídia:", err);
            client.sendMessage(
              user,
              "Não consegui gravar a imagem anterior, tente novamente por favor"
            );
          } else {
            addDataToObject(user, { 24: fileName });
            console.log(
              "Primeira imagem trajeto salva com sucesso:",
              mediaPath
            );
            updateUserData(user, { step: "25" });
            client.sendMessage(user, "Hora da segunda foto");
          }
        });
      } else {
        await client.sendMessage(
          user,
          "Você não enviou a imagem. Tente novamente"
        );
      }
      break;

    case "25":
      if (msg.hasMedia) {
        const media = await msg.downloadMedia();
        const extension = mime.extension(media.mimetype);
        const fileName = media.filename
          ? media.filename
          : `media_${Date.now()}.${extension}`;

        // Usando path.resolve para subir um nível
        const mediaPath = path.resolve(__dirname, "..", "medias", fileName);

        fs.writeFile(mediaPath, media.data, "base64", (err) => {
          if (err) {
            console.error("Erro ao salvar o arquivo de mídia:", err);
            client.sendMessage(
              user,
              "Não consegui gravar a segunda imagem, tente novamente por favor"
            );
          } else {
            addDataToObject(user, { 25: fileName });
            console.log(
              "Segunda imagem trajeto salva com sucesso::",
              mediaPath
            );
            updateUserData(user, { step: "26" });
            client.sendMessage(user, "Agora a 3ª foto");
          }
        });
      } else {
        await client.sendMessage(
          user,
          "Você não enviou a segunda imagem. Tente novamente"
        );
      }
      break;

    case "26":
      if (msg.hasMedia) {
        const media = await msg.downloadMedia();
        const extension = mime.extension(media.mimetype);
        const fileName = media.filename
          ? media.filename
          : `media_${Date.now()}.${extension}`;

        // Usando path.resolve para subir um nível
        const mediaPath = path.resolve(__dirname, "..", "medias", fileName);

        fs.writeFile(mediaPath, media.data, "base64", (err) => {
          if (err) {
            console.error("Erro ao salvar o arquivo de mídia:", err);
            client.sendMessage(
              user,
              "Não consegui gravar a terceira imagem, tente novamente por favor"
            );
          } else {
            addDataToObject(user, { 26: fileName });
            console.log(
              "Terceira imagem trajeto salva com sucesso:",
              mediaPath
            );
            updateUserData(user, { step: "27" });
            client.sendMessage(user, "Certo! Envie a ultima imagem:");
          }
        });
      } else {
        await client.sendMessage(
          user,
          "Você não enviou a terceira imagem. Tente novamente"
        );
      }
      break;

    case "27":
      if (msg.hasMedia) {
        const media = await msg.downloadMedia();
        const extension = mime.extension(media.mimetype);
        const fileName = media.filename
          ? media.filename
          : `media_${Date.now()}.${extension}`;

        // Usando path.resolve para subir um nível
        const mediaPath = path.resolve(__dirname, "..", "medias", fileName);

        fs.writeFile(mediaPath, media.data, "base64", (err) => {
          if (err) {
            console.error("Erro ao salvar o arquivo de mídia:", err);
            client.sendMessage(
              user,
              "Não consegui gravar a imagem anterior, tente novamente por favor"
            );
          } else {
            addDataToObject(user, { 27: fileName });
            console.log("Quarta imagem trajeto salva com sucesso:", mediaPath);
            updateUserData(user, { step: "28" });
            client.sendMessage(
              user,
              "Agora são as fotos do local destinado ao gerador. São *3* imagens. Envie a primeira"
            );
          }
        });
      } else {
        await client.sendMessage(
          user,
          "Você não enviou a quarta imagem. Tente novamente"
        );
      }
      break;

    case "28":
      if (msg.hasMedia) {
        const media = await msg.downloadMedia();
        const extension = mime.extension(media.mimetype);
        const fileName = media.filename
          ? media.filename
          : `media_${Date.now()}.${extension}`;

        // Usando path.resolve para subir um nível
        const mediaPath = path.resolve(__dirname, "..", "medias", fileName);

        fs.writeFile(mediaPath, media.data, "base64", (err) => {
          if (err) {
            console.error("Erro ao salvar o arquivo de mídia:", err);
            client.sendMessage(
              user,
              "Não consegui gravar a imagem anterior, tente novamente por favor"
            );
          } else {
            addDataToObject(user, { 28: fileName });
            console.log("Quarta imagem trajeto salva com sucesso:", mediaPath);
            updateUserData(user, { step: "29" });
            client.sendMessage(user, "Envie a segunda imagem");
          }
        });
      } else {
        await client.sendMessage(
          user,
          "Você não enviou a imagem. Tente novamente"
        );
      }
      break;

    case "29":
      if (msg.hasMedia) {
        const media = await msg.downloadMedia();
        const extension = mime.extension(media.mimetype);
        const fileName = media.filename
          ? media.filename
          : `media_${Date.now()}.${extension}`;

        // Usando path.resolve para subir um nível
        const mediaPath = path.resolve(__dirname, "..", "medias", fileName);

        fs.writeFile(mediaPath, media.data, "base64", (err) => {
          if (err) {
            console.error("Erro ao salvar o arquivo de mídia:", err);
            client.sendMessage(
              user,
              "Não consegui gravar a imagem anterior, tente novamente por favor"
            );
          } else {
            addDataToObject(user, { 29: fileName });
            console.log("Quarta imagem trajeto salva com sucesso:", mediaPath);
            updateUserData(user, { step: "30" });
            client.sendMessage(user, "Envie a última imagem");
          }
        });
      } else {
        await client.sendMessage(
          user,
          "Você não enviou a segunda imagem. Tente novamente"
        );
      }
      break;

    case "30":
      if (msg.hasMedia) {
        const media = await msg.downloadMedia();
        const extension = mime.extension(media.mimetype);
        const fileName = media.filename
          ? media.filename
          : `media_${Date.now()}.${extension}`;

        // Usando path.resolve para subir um nível
        const mediaPath = path.resolve(__dirname, "..", "medias", fileName);

        fs.writeFile(mediaPath, media.data, "base64", (err) => {
          if (err) {
            console.error("Erro ao salvar o arquivo de mídia:", err);
            client.sendMessage(
              user,
              "Não consegui gravar a imagem anterior, tente novamente por favor"
            );
          } else {
            addDataToObject(user, { 30: fileName });
            console.log("Quarta imagem trajeto salva com sucesso:", mediaPath);
            updateUserData(user, { step: "31" });
            client.sendMessage(
              user,
              "Agora fotos do trajeto para exaustão (Escapamento). São *2* imagens. Envie a primeira"
            );
          }
        });
      } else {
        await client.sendMessage(
          user,
          "Você não enviou a terceira imagem. Tente novamente"
        );
      }
      break;

    case "31":
      if (msg.hasMedia) {
        const media = await msg.downloadMedia();
        const extension = mime.extension(media.mimetype);
        const fileName = media.filename
          ? media.filename
          : `media_${Date.now()}.${extension}`;

        // Usando path.resolve para subir um nível
        const mediaPath = path.resolve(__dirname, "..", "medias", fileName);

        fs.writeFile(mediaPath, media.data, "base64", (err) => {
          if (err) {
            console.error("Erro ao salvar o arquivo de mídia:", err);
            client.sendMessage(
              user,
              "Não consegui gravar a imagem anterior, tente novamente por favor"
            );
          } else {
            addDataToObject(user, { 31: fileName });
            console.log("Quarta imagem trajeto salva com sucesso:", mediaPath);
            updateUserData(user, { step: "32" });
            client.sendMessage(
              user,
              "Agora a segunda e última foto do escapamento."
            );
          }
        });
      } else {
        await client.sendMessage(
          user,
          "Você não enviou a terceira imagem. Tente novamente"
        );
      }
      break;

    case "32":
      if (msg.hasMedia) {
        const media = await msg.downloadMedia();
        const extension = mime.extension(media.mimetype);
        const fileName = media.filename
          ? media.filename
          : `media_${Date.now()}.${extension}`;

        // Usando path.resolve para subir um nível
        const mediaPath = path.resolve(__dirname, "..", "medias", fileName);

        fs.writeFile(mediaPath, media.data, "base64", (err) => {
          if (err) {
            console.error("Erro ao salvar o arquivo de mídia:", err);
            client.sendMessage(
              user,
              "Não consegui gravar a imagem anterior, tente novamente por favor"
            );
          } else {
            addDataToObject(user, { 32: fileName });
            console.log("Quarta imagem trajeto salva com sucesso:", mediaPath);
            updateUserData(user, { step: "33" });
            client.sendMessage(
              user,
              "Agora é possivel enviar imagens de informações adicionais.\n Você pode enviar até *3*.\n Caso não queira enviar essas imagens, basta digitar *Seguir*."
            );
          }
        });
      } else {
        await client.sendMessage(
          user,
          "Você não enviou a terceira imagem. Tente novamente"
        );
      }
      break;

    case "33":
      if (msg.hasMedia) {
        const media = await msg.downloadMedia();
        const extension = mime.extension(media.mimetype);
        const fileName = media.filename
          ? media.filename
          : `media_${Date.now()}.${extension}`;

        // Usando path.resolve para subir um nível
        const mediaPath = path.resolve(__dirname, "..", "medias", fileName);

        fs.writeFile(mediaPath, media.data, "base64", (err) => {
          if (err) {
            console.error("Erro ao salvar o arquivo de mídia:", err);
            client.sendMessage(
              user,
              "Não consegui gravar a imagem anterior, tente novamente por favor"
            );
          } else {
            addDataToObject(user, { 33: fileName });
            console.log("Quarta imagem trajeto salva com sucesso:", mediaPath);
            updateUserData(user, { step: "34" });
            /*  client.sendMessage(user, "Agora é possivel enviar mais *3* imagens de informações adicionais. Caso não queira enviar essas imagens, basta digitar *Seguir*."); */
          }
        });
        break;
      } else {
        /* await client.sendMessage(
          user,
          "Você não enviou a terceira imagem. Tente novamente"
        ); */
      }

    case "34":
      if (msg.hasMedia) {
        const media = await msg.downloadMedia();
        const extension = mime.extension(media.mimetype);
        const fileName = media.filename
          ? media.filename
          : `media_${Date.now()}.${extension}`;

        // Usando path.resolve para subir um nível
        const mediaPath = path.resolve(__dirname, "..", "medias", fileName);

        fs.writeFile(mediaPath, media.data, "base64", (err) => {
          if (err) {
            console.error("Erro ao salvar o arquivo de mídia:", err);
            client.sendMessage(
              user,
              "Não consegui gravar a imagem anterior, tente novamente por favor"
            );
          } else {
            addDataToObject(user, { 34: fileName });
            console.log("Quarta imagem trajeto salva com sucesso:", mediaPath);
            updateUserData(user, { step: "35" });
            /*  client.sendMessage(user, "Agora é possivel enviar mais *3* imagens de informações adicionais. Caso não queira enviar essas imagens, basta digitar *Seguir*."); */
          }
        });
        break;
      } else {
        /* await client.sendMessage(
          user,
          "Você não enviou a terceira imagem. Tente novamente"
        ); */
      }

    case "35":
      if (msg.hasMedia) {
        const media = await msg.downloadMedia();
        const extension = mime.extension(media.mimetype);
        const fileName = media.filename
          ? media.filename
          : `media_${Date.now()}.${extension}`;

        // Usando path.resolve para subir um nível
        const mediaPath = path.resolve(__dirname, "..", "medias", fileName);

        fs.writeFile(mediaPath, media.data, "base64", (err) => {
          if (err) {
            console.error("Erro ao salvar o arquivo de mídia:", err);
            client.sendMessage(
              user,
              "Não consegui gravar a imagem anterior, tente novamente por favor"
            );
          } else {
            addDataToObject(user, { 35: fileName });
            console.log("Quarta imagem trajeto salva com sucesso:", mediaPath);
            //updateUserData(user, { step: "35" });
            /*  client.sendMessage(user, "Agora é possivel enviar mais *3* imagens de informações adicionais. Caso não queira enviar essas imagens, basta digitar *Seguir*."); */
          }
        });
        //break;
      } else {
        /* await client.sendMessage(
          user,
          "Você não enviou a terceira imagem. Tente novamente"
        ); */
      }

      updateUserData(user, { step: "36" });
      await client.sendMessage(
        user,
        `
              Cliente: *${estadoConversa.data[1]}*
              Endereço: *${estadoConversa.data[2]}*
              Quem Acompanhou: *${estadoConversa.data[3]}*
              Tipo de Cliente: *${estadoConversa.data[4]}*

              Estrura:  
              Apartamentos/Salas: *${estadoConversa.data[5]}m*
              Elevadores: *${estadoConversa.data[6]}m*
              Torres: *${estadoConversa.data[7]}m*

              Medições:
              QGBT: *${estadoConversa.data[8]}*
              Elevador de Serviço (Pico): *${estadoConversa.data[9]}*
              Elevador de Serviço (Operação): *${estadoConversa.data[10]}*
              Elevador Social (Pico): *${estadoConversa.data[11]}*
              Elevador Social (Operação): *${estadoConversa.data[12]}*
             
              Bombas: *${estadoConversa.data[13]}*

              Tensões de Fases:
              RN: *${estadoConversa.data[14]}*
              SN: *${estadoConversa.data[15]}*
              TN: *${estadoConversa.data[16]}*
              RS: *${estadoConversa.data[17]}*
              ST: *${estadoConversa.data[18]}*
              TR: *${estadoConversa.data[19]}*
             
              `
      );
      client.sendMessage(user, `Vamos enviar as informações?`);
      break;

    case "36":
      await client.sendMessage(user, "Finalizando e enviando..");

      // Criando a visita no banco de dados
      let newVisit = await commercialVisitsRequests.create({
        type: estadoConversa.type,
        phoneNumber: estadoConversa.user,
      });

      vrId = newVisit.dataValues.id;

      // Enviando as perguntas e respostas ao banco de dados
      for (const [key, value] of Object.entries(estadoConversa.data)) {
        await commercialVisitsQuestions.create({
          visitId: vrId,
          questionId: key,
          reply: value,
        });

        // Caso seja foto, enviando para a tabela correta
        if (key >= 20 && key <= 35) {
          await commercialVisitsImages.create({
            visitId: vrId,
            imageName: value,
            status: false,
          });
        }
      }

      // Enviando os equipamentos aferidos para a tabela correspondente
      for (const equip of estadoConversa.equips) {
        await commercialVisitsEquipaments.create({
          visitId: vrId,
          type: equip.type,
          corrente_pico: equip.pico,
          corrente_operacao: equip.operacao,
        });
      }

          // Exemplo de uso
     await  generatePDF.generatePDF(
      "medias/output.pdf",
      "Julio Ramos", // Consultor
      estadoConversa.data[1], // Cliente
      estadoConversa.data[2], // Endereço
      estadoConversa.data[3], // Contato
      estadoConversa.data[4], // Tipo de Cliente
      estadoConversa.data[5], //quantidade salas|apartamentos
      estadoConversa.data[6], //quantidade Torres
      estadoConversa.data[7], //quantidade bombas
      estadoConversa.equips, //equipamentos
      estadoConversa.data[14],//RN
      estadoConversa.data[15],//SN
      estadoConversa.data[16],//TN
      estadoConversa.data[17],//RS
      estadoConversa.data[18],//ST
      estadoConversa.data[19],//TR
      [
        estadoConversa.data[20],
        estadoConversa.data[21],
        estadoConversa.data[22],
        estadoConversa.data[23],
        estadoConversa.data[24],
        estadoConversa.data[25],
        estadoConversa.data[26],
        estadoConversa.data[27],
        estadoConversa.data[28],
        estadoConversa.data[29],
        estadoConversa.data[30],
        estadoConversa.data[31],
        estadoConversa.data[32],
      ] // Caminhos para as 16 imagens
    );

    await sendMailVisitasTecnicas.sendMailVisitaTecnica(estadoConversa, vrId);


      const apiUrl =
        "http://localhost/painelessencial/public/comercial/visitastecnicas/baixar/fotos";

      // Chamada para a API
      const response = await fetch(apiUrl, {
        method: "GET", // Ou 'POST', conforme necessário
        headers: {
          "Content-Type": "application/json",
          // Adicione outros cabeçalhos se necessário
        },
      });

   /*    // Iterando sobre as fotos para excluir cada uma
      for (const value of Object.values(estadoConversa.data)) {
        const filePath = path.join(__dirname, "..", "medias", value);

        // Excluir o arquivo
        fs.unlink(filePath, (err) => {
          if (err) {
            console.error(`Erro ao excluir o arquivo ${value}:`, err);
          } else {
            console.log(`Arquivo ${value} excluído com sucesso.`);
          }
        });
      } */

  
      await client.sendMessage(
        user,
        `Pronto! A solicitação ${vrId} foi enviada`
      );

      deleteUserState(user);
      break;
  }

  console.log(estadoConversa);
}

module.exports = {
  visitaTecnica,
};
