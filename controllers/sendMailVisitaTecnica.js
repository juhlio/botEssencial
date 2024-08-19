const nodemailer = require("nodemailer");


async function sendMailVisitaTecnica(estadoConversa, vrId) {
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
                subject: `A solicitação ${vrId} foi criada`, // Assunto
                text: `Nova Visita Tecnica Realizada.`, // Corpo do texto
                html: `Uma nova visita técnica foi realizada, detalhes abaixo: <br>
                <b> Cliente:</br> ${estadoConversa.data[1]} <br> 
                <b> Endereço:</br> ${estadoConversa.data[2]} <br> 
                <b> Acompanhado por:</br> ${estadoConversa.data[3]} <br> 
                <br><br>
                `, // Corpo do HTML
               attachments: [
                    {
                        filename: `relatoriovisita.pdf`, // Nome do arquivo
                        path: `./medias/output.pdf`, // Caminho para o arquivo
                    },
                ],
                //bcc: bccList.join(','), // Lista de destinatários em cópia oculta */
            });

            console.log("Message sent: %s", info.messageId);

        } catch (error) {
            console.error("Erro ao enviar email:", error);
        }
    }


module.exports = {
    sendMailVisitaTecnica,
};