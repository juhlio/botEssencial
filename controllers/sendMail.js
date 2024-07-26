const nodemailer = require("nodemailer");


async function sendMail(estadoConversa, brId) {
    const transporter = nodemailer.createTransport({
        host: "mail.essencialenergia.com.br",
        port: 465,
        secure: true,
        auth: {
            user: "bot@essencialenergia.com.br",
            pass: "senharelatorios",
        },
    });


  
        // Enviar o email
        try {
            const info = await transporter.sendMail({
                from: '"Essencial Energia" <bot@essencialenergia.com.br>', // Endereço do remetente
                to: 'julioramos.esporte@gmail.com, juan@essencialenergia.com', // Lista de destinatários
                subject: `A solicitação ${brId} foi criada`, // Assunto
                text: `Uma nova solicitação foi criada.`, // Corpo do texto
                html: `Uma nova solicitação foi criada, detalhes abaixo: <br>
                <b> Solicitado por:</br> ${estadoConversa.data[1]} <br> 
                <b> Departamento:</br> ${estadoConversa.data[2]} <br> 
                <b> Código Cliente:</br> ${estadoConversa.data[3]} <br> 
                <b> Tipo do Tanque:</br> ${estadoConversa.data[4]} <br> 
                <b> Capacidade do tanque:</br> ${estadoConversa.data[5]} l <br> 
                <b> Precisa contenção:</br> ${estadoConversa.data[6]} <br> 
                <b> Tipo Contenção:</br> ${estadoConversa.data[7]} <br> 
                <br>Medidas do local<br>
                <b> Altura:</br> ${estadoConversa.data[8]} m <br> 
                <b> Largura:</br> ${estadoConversa.data[9]} m <br> 
                <b> Comprimento:</br> ${estadoConversa.data[10]} m <br> 
                <br><b>Sobre a Tubulação:</b> ${estadoConversa.data[11]} <br>
                <b>Sobre as conexões: ${estadoConversa.data[12]}</b><br><br>
                Caso queira mais informações deste pedido, <a href="https://testepainel.essencialenergia.com.br/comercial/detalhe/${brId}"> Clique aqui </a>
                `, // Corpo do HTML
               /*  attachments: [
                    {
                        filename: `${job.auvoId}.pdf`, // Nome do arquivo
                        path: `./ups/${job.auvoId}.pdf`, // Caminho para o arquivo
                    },
                ],
                bcc: bccList.join(','), // Lista de destinatários em cópia oculta */
            });

            console.log("Message sent: %s", info.messageId);

        } catch (error) {
            console.error("Erro ao enviar email:", error);
        }
    }


module.exports = {
    sendMail,
};
