// stateManager.js

const userState = {}; // Objeto para armazenar o estado de cada usuário

// Função para definir o estado de um usuário
const setUserState = (user, state) => {
  userState[user] = state;
};

// Função para obter o estado de um usuário
const getUserState = (user) => {
  return userState[user];
};

module.exports = {
  setUserState,
  getUserState
};
