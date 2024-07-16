const fs = require('fs');
const path = require('path');

// Diretório onde os estados dos usuários serão armazenados
const userStateDirectory = path.join(__dirname, 'userStates');

// Verifica se o diretório existe, se não existir, cria o diretório
if (!fs.existsSync(userStateDirectory)) {
  fs.mkdirSync(userStateDirectory);
}

// Função para definir o estado de um usuário
const setUserState = (userId, state) => {
  const filePath = path.join(userStateDirectory, `${userId}.json`);
  fs.writeFileSync(filePath, JSON.stringify(state, null, 2));
};

// Função para obter o estado de um usuário
const getUserState = (userId) => {
  const filePath = path.join(userStateDirectory, `${userId}.json`);
  if (fs.existsSync(filePath)) {
    const state = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(state);
  } else {
    return null; // Retorna null se o estado do usuário não existir
  }
};

// Função para atualizar os dados do estado do usuário
const updateUserState = (userId, updateData) => {
  const currentState = getUserState(userId);
  if (!currentState) {
    console.error(`Não foi possível encontrar o estado do usuário com ID: ${userId}`);
    return;
  }

  const updatedState = { ...currentState, ...updateData }; // Merge de dados
  setUserState(userId, updatedState);
  console.log(`Estado do usuário com ID: ${userId} atualizado com sucesso.`);
};

// Função para excluir o estado de um usuário
const deleteUserState = (userId) => {
  const filePath = path.join(userStateDirectory, `${userId}.json`);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    console.log(`Estado do usuário com ID: ${userId} excluído com sucesso.`);
  } else {
    console.error(`Não foi possível encontrar o estado do usuário com ID: ${userId}`);
  }
};

// Função para atualizar os dados do usuário em um arquivo JSON
const updateUserData = (userId, updateData) => {
  const currentState = getUserState(userId);
  if (!currentState) {
    console.error(`Não foi possível encontrar o estado do usuário com ID: ${userId}`);
    return;
  }

  const updatedState = { ...currentState, ...updateData };
  setUserState(userId, updatedState);
  console.log(`Estado do usuário com ID: ${userId} atualizado com sucesso.`);
};

// Função para adicionar elementos ao objeto data em um arquivo JSON
const addDataToObject = (userId, dataToAdd) => {
  const filePath = path.join(userStateDirectory, `${userId}.json`);
  if (!fs.existsSync(filePath)) {
    console.error(`Arquivo JSON não encontrado: ${filePath}`);
    return;
  }

  try {
    const fileData = fs.readFileSync(filePath, 'utf-8');
    const jsonData = JSON.parse(fileData);

    if (!jsonData.data) {
      jsonData.data = {}; // Cria o objeto data se não existir
    }

    Object.assign(jsonData.data, dataToAdd); // Adiciona novos elementos ao objeto data

    fs.writeFileSync(filePath, JSON.stringify(jsonData, null, 2));
    console.log(`Elementos adicionados com sucesso ao arquivo JSON: ${filePath}`);
  } catch (error) {
    console.error(`Erro ao adicionar elementos ao arquivo JSON: ${filePath}. Erro: ${error.message}`);
  }
};

module.exports = {
  setUserState,
  getUserState,
  updateUserState,
  deleteUserState,
  updateUserData,
  addDataToObject,
};
