const PDFDocument = require("pdfkit");
const fs = require("fs");

async function geraPdf() {
  const doc = new PDFDocument();

  doc.pipe(fs.createWriteStream("output.pdf"));

  // Cabeçalho
  doc.rect(0, 0, doc.page.width, 150).fill("#f0f0f0"); // Fundo do cabeçalho
  doc
    .fillColor("#000000")
    .fontSize(24)
    .text("Essencial Energia", { align: "center", valign: "center" });

  // Espaço para o logo à esquerda
  doc.rect(20, 25, 100, 100).stroke(); // Placeholder para o logo

  // Data à direita
  doc
    .fontSize(8)
    .text(new Date().toLocaleDateString("pt-BR"), doc.page.width - 120, 40);

  // Seção de Introdução
  doc.moveDown(6);
  doc
    .fontSize(20)
    .text("VISITA TÉCNICA - DIMENSIONAMENTO", { align: "center" });

  doc.moveDown(2);
  doc.fontSize(14).text(`Consultor: `, { align: "left" });
  doc.text(`Cliente: `, { align: "left" });
  doc.text(`Endereço: `, { align: "left" });
  doc.text(`Contato: `, { align: "left" });
  doc.text(`Tipo de Cliente: `, { align: "left" });

  doc.end();
  
}

module.exports = {
  geraPdf: geraPdf,
};
