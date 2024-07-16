// suporteTecnico.js

const { setUserState } = require('../stateManager');

const handleSuporteTecnicoState = (user, state, msg, client) => {
  if (state === 'suporte_tecnico_problema') {
    const problema = msg.body;
    client.sendMessage(user, `Obrigado por relatar o problema: ${problema}. Nossa equipe de suporte entrará em contato em breve.`);
    setUserState(user, null); // Reseta o estado do usuário após o fluxo de suporte técnico
  }
};

module.exports = {
  handleSuporteTecnicoState
};
