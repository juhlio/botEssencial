const {
  setUserState,
  getUserState,
  deleteUserState,
  updateUserData,
  addDataToObject,
} = require("../stateManager");

async function inicioMenuComercial(client, msg, estadoConversa, user) {
  console.log(`Inicio menu comercial`);
  console.log(estadoConversa);

  if (msg.body.toLowerCase() === "inicio") {
    estadoConversa.step = "";
    estadoConversa.data = {}; // Limpa os dados anteriores
    estadoConversa.type = "menuPrincipal";
    await client.sendMessage(user, "Você voltou ao menu principal.");
    //menuPrincipal.menuPrincipal(client, msg, estadoConversa, user); // Chama a função do menu principal
  }

  switch (estadoConversa.step) {
    case "0":
      updateUserData(user, { step: "1" });
      await client.sendMessage(
        user,
        'Você escolheu equipe Comercial. Escolha a funcionalidade desejada: \n\n 1 - Visita Técnica \n 2 - Outros\n\n Ou digite "Inicio" para acessar o menu principal'
      );
      break;

    case "1":
      if (msg.body === "1") {
        updateUserData(user, { type: "visitaTecnica", step: "0" });
        /* estadoConversa.data.tipoOrcamento = 'Tanque';
                estadoConversa.type = 'orcamentoTanque' */
        estadoConversa.step = "0";
        await client.sendMessage(
          user,
          "Você será redirecionado para iniciar a  Visita Técnica. Confirma?"
        );
        break;
      } else if (msg.body === "2") {
        estadoConversa.data.tipoOrcamento = "Outros";
        estadoConversa.step = "2";
        break;
      } else {
        await client.sendMessage(
          user,
          'Opção inválida. Por favor, digite "1" para Tanques, "2" para Outros, ou "Inicio" para voltar ao menu principal.'
        );
        break;
      }

    case "2":
      estadoConversa.data.detalhes = msg.body;
      await client.sendMessage(
        user,
        `Recebemos os detalhes do seu orçamento: ${estadoConversa.data.detalhes}. Nossa equipe entrará em contato em breve.`
      );
      estadoConversa.step = "0"; // Reset para o início do fluxo
      estadoConversa.data = {}; // Limpa os dados após o processamento
      break;
    default:
      await client.sendMessage(
        user,
        'Algo deu errado. Por favor, digite "Inicio" para voltar ao menu principal.'
      );
      estadoConversa.step = "0";
      estadoConversa.data = {};
      break;
  }

  console.log(`Estado Conversa no arquivo orcamentos.js`);
  console.log(estadoConversa);
}

module.exports = {
  inicioMenuComercial,
};
