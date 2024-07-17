const {
  setUserState,
  getUserState,
  updateUserData,
  addDataToObject,
  deleteUserState,
} = require("../stateManager");
const { Op } = require("sequelize");
const budgetRequest = require("../dbfiles/budgetRequests");
const budgetQuestions = require("../dbfiles/budgetQuestions");
const clientes = require("../dbfiles/clients");

// Função para processar a conversa
async function orcamentoTanque(client, msg, estadoConversa, user) {
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
      //estadoConversa.step = "1";
      await client.sendMessage(user, "Para começar, digite seu nome:");
      break;

    case "1":
      estadoConversa.step = "2";
      updateUserData(user, { step: "2"});
      addDataToObject(user, { nomeSolicitante: msg.body });
      //estadoConversa.data.nomeSolicitante = msg.body;
      await client.sendMessage(
        user,
        `${msg.body}, qual o seu departamento?`
      );
      break;
      
      case "2":
        updateUserData(user, { step: "3"});
        addDataToObject(user, {departamentoSolicitante: msg.body})
      /* estadoConversa.step = "3";
      estadoConversa.data.departamentoSolicitante = msg.body; */
      await client.sendMessage(
        user,
        "Certo, vamos buscar o cliente. Digite o nome do cliente que trarei algumas opções"
      );
      break;

    case "3":
      possiveisClientes = msg.body;
      await client.sendMessage(
        user,
        "Buscando clientes com o nome fornecido..."
      );

      try {
        // Busca todos os clientes cujo nome contém a string fornecida
        const clientesEncontrados = await clientes.findAll({
          where: {
            nome: {
              [Op.like]: `%${possiveisClientes}%`,
            },
          },
        });

        if (clientesEncontrados.length > 0) {
          // Transforme os clientes encontrados em uma string para enviar ao usuário
          console.log(clientesEncontrados);
          const listaClientes = clientesEncontrados
            .map((cliente) => `${cliente.id} - ${cliente.nome}`)
            .join(", ");
          await client.sendMessage(
            user,
            `Clientes encontrados: \n ${listaClientes}.\n Para prosseguir, digite o id referente ao cliente da solicitação, é o número que aparece a esquerda do nome`
          );
          updateUserData(user, { step: "4"});
          estadoConversa.step = "4";
          break;
        } else {
          await client.sendMessage(
            user,
            "Nenhum cliente encontrado com o nome fornecido. Tente novamente"
          );
          estadoConversa.step = "3";
          break;
        }
      } catch (error) {
        console.error("Erro ao buscar clientes:", error);
        await client.sendMessage(user, "Ocorreu um erro ao buscar clientes.");
        estadoConversa.step = "3";
        break;
      }

    case "4":
      updateUserData(user, { step: "5"});
      addDataToObject(user, {idCliente: msg.body})
      await client.sendMessage(
        user,
        "Digite o tipo do tanque a ser orçado: \n\n 1 - Horizontal \n 2 - Vertical"
      );
      break;

    case "5":
      if (msg.body === "1") {
        updateUserData(user, { step: "6"});
        addDataToObject(user, {tipoTanque: "Horizontal"})
        await client.sendMessage(
          user,
          "Qual a litragem do Tanque? Digite apelas o numero em litros"
        );
        break;
      } else if (msg.body === "2") {
        updateUserData(user, { step: "3"});
        addDataToObject(user, {tipoTanque: "Vertical"})
        await client.sendMessage(
          user,
          "Qual a litragem do Tanque? Digite apelas o numero em litros"
        );
        break;
      } else {
        await client.sendMessage(
          user,
          'Opção inválida. Por favor, digite "1" para Horizontal, "2" para Vertical, ou "Inicio" para voltar ao menu principal.'
        );
        break;
      }

    case "6":
      updateUserData(user, { step: "7"});
      addDataToObject(user, {litros: msg.body})
      await client.sendMessage(
        user,
        `Precisa de contenção? Digite 1 para "Sim" e 2 para "Não"`
      );
      /*  estadoConversa.step = '0'; // Reset para o início do fluxo
            estadoConversa.data = {}; // Limpa os dados após o processamento */
      break;
    default:
      await client.sendMessage(
        user,
        'Algo deu errado. Por favor, digite "Inicio" para voltar ao menu principal.'
      );
      break;

    case "7":
      if (msg.body === "1") {
        updateUserData(user, { step: "8"});
        addDataToObject(user, {contencao: "Sim"})
        await client.sendMessage(
          user,
          "Qual o tipo de contenção? \n\n 1 - Alvenaria \n 2 - Metalica"
        );
        break;
      } else if (msg.body === "2") {
        updateUserData(user, { step: "9"});
        addDataToObject(user, {contencao: "Não", tipoContencao: "N/A"})
        await client.sendMessage(
          user,
          "Vamos falar sobre a medida do local de instação do Tanque"
        );
        await client.sendMessage(
          user,
          'Qual a altura do local? Digite apenas os números em "Metros"'
        );
        break;
      } else {
        await client.sendMessage(
          user,
          'Opção inválida. Por favor, digite "1" para Sim, "2" para Não, ou "Inicio" para voltar ao menu principal.'
        );
        break;
      }

    case "8":
      if (msg.body === "1") {
        updateUserData(user, { step: "9"});
        addDataToObject(user, {tipoContencao: "Alvenaria"})
        await client.sendMessage(
          user,
          "Vamos falar sobre a medida do local de instação do Tanque"
        );
        await client.sendMessage(
          user,
          'Qual a altura do local? Digite apenas os números em "Metros"'
        );
        break;
      } else if (msg.body === "2") {
        updateUserData(user, { step: "9"});
        addDataToObject(user, {tipoContencao: 'Metalica'})
        await client.sendMessage(
          user,
          "Vamos falar sobre a medida do local de instação do Tanque"
        );
        await client.sendMessage(
          user,
          'Qual a altura do local? Digite apenas os números em "Metros"'
        );
        break;
      } else {
        await client.sendMessage(
          user,
          'Opção inválida. Por favor, digite "1" para Alveraria, "2" para Metalico, ou "Inicio" para voltar ao menu principal.'
        );
        break;
      }
    case "9":
      updateUserData(user, { step: "10"});
      addDataToObject(user, {alturaLocal: msg.body})
      await client.sendMessage(
        user,
        `Qual a largura do local? Digite apenas os números em "Metros"`
      );
      break;
    case "10":
      updateUserData(user, { step: "11"});
      addDataToObject(user, {larguraLocal: msg.body})
      await client.sendMessage(
        user,
        `Qual a comprimento do local? Digite apenas os números em "Metros"`
      );
      break;
    case "11":
      updateUserData(user, { step: "12"});
      addDataToObject(user, {comprimentoLocal: msg.body})
      await client.sendMessage(
        user,
        "Qual tipo de tubulação? Por favor, especifique os diametros internos e externos, modelos e quantidades necessárias para a instalação"
      );
      break;
    case "12":
      updateUserData(user, { step: "13"});
      addDataToObject(user, {tubulacao: msg.body})
      await client.sendMessage(
        user,
        "Qual tipo de conexão? Por favor, especifique os diametros internos e externos, modelos e quantidades necessárias para a instalação"
      );
      break;
    case "13":
      updateUserData(user, { step: "14"});
      addDataToObject(user, {conexao: msg.body})
      await client.sendMessage(
        user,
        `Informações Preenchidas! Revise seu pedido:\n
              Tipo do Tanque: *${estadoConversa.data.tipoTanque}* 
              Litragem: *${estadoConversa.data.litros}* 
              Precisa de Contenção: *${estadoConversa.data.contencao}* 
              Tipo de Contenção: *${estadoConversa.data.tipoContencao}* 

              Medidas do Local:  
              Altura - *${estadoConversa.data.alturaLocal}m* 
              Largura - *${estadoConversa.data.larguraLocal}m* 
              Comprimento - *${estadoConversa.data.comprimentoLocal}m*

              Sobre a tubulaçao: *${estadoConversa.data.tubulacao}*
              Sobre as conexões: *${msg.body}*\n
            
              Para confirmar as informações e enviar digite *"1"*
              `
      );

      break;
    case "14":
      await client.sendMessage(user, "Finalizando e enviando..");
      let newBudget = await budgetRequest.create({
        orcId: 1,
        clientId: 3,
        equipId: 2152016,
        typeId: 1,
        type: "Orcamento de Tanque",
        orcDate: "2024-07-15",
      });

      brId = newBudget.dataValues.id;

      for (const [key, value] of Object.entries(estadoConversa.data)) {
        await budgetQuestions.create({
          orcId: brId,
          equipId: 2152016,
          questionDescription: key,
          replyId: 8,
          reply: value,
        });
      }

      await client.sendMessage(
        user,
        `Pronto! A solicitação ${brId} foi enviada`
      );
      deleteUserState(user)

  }

  console.log(estadoConversa);
}

module.exports = {
  orcamentoTanque,
};
