const PDFDocument = require("pdfkit-table");
const fs = require("fs");
const path = require("path");

function generatePDF(
  outputPath,
  consultor,
  cliente,
  endereco,
  contato,
  tipoCliente,
  salasApartamentos,
  torres,
  bombas,
  equips,
  rn,
  sn,
  tn,
  rs,
  st,
  tr,
  imagePaths
) {
  const doc = new PDFDocument({
    margins: { top: 180, bottom: 20, left: 50, right: 50 },
  });

  const logoPath = path.resolve(__dirname, "../pdfmedias/logo-1200x1200.png");

  doc.pipe(fs.createWriteStream(outputPath));

  // Faixa laranja vertical
  doc.rect(0, 0, 20, doc.page.height).fill("#FFA500"); // Cor laranja

  // Dimensões do logo
  const logoWidth = 400;
  const logoHeight = 400;

  // Texto do título
  const title = "VISITA TÉCNICA - DIMENSIONAMENTO";

  // Calcule a altura total necessária para o logo e o título juntos
  const totalHeight = logoHeight + 30 + 30; // 30 é o espaçamento entre o logo e o título

  // Calcula a posição Y inicial para centralizar verticalmente, subindo 100px
  const startY = (doc.page.height - totalHeight) / 2 - 100;

  // Centraliza e desenha o logo
  doc.image(logoPath, (doc.page.width - logoWidth) / 2, startY, {
    width: logoWidth,
    height: logoHeight,
  });

  // Centraliza e desenha o título logo abaixo do logo
  doc
    .fontSize(20)
    .fillColor("#333333")
    .text(title, 0, startY + logoHeight + 30, { align: "center" });

  // Quebra de página
  doc.addPage();

  // Cabeçalho na nova página com o logo centralizado
  doc.image(logoPath, (doc.page.width - 100) / 2, 20, {
    width: 75,
    height: 75,
  });

  // Espaço antes da tabela
  doc.moveDown(2);

  // Dados iniciais na segunda página em tabela
  const tableData = [
    ["Consultor", consultor],
    ["Cliente", cliente],
    ["Endereço", endereco],
    ["Contato", contato],
    ["Tipo de Cliente", tipoCliente],
  ];

  // Largura da tabela
  const tableWidth =
    doc.page.width - doc.page.margins.left - doc.page.margins.right;
  const tableLeft = doc.page.margins.left;
  const tableHeight = 20; // Altura das células
  const yStart = 100; // Posição inicial Y para a tabela

  // Desenhando a tabela
  doc.fontSize(12).fillColor("#000000");
  tableData.forEach((row, index) => {
    const y = yStart + index * tableHeight; // Ajuste a posição Y
    row.forEach((cell, cellIndex) => {
      const x = tableLeft + cellIndex * (tableWidth / 2);
      doc.rect(x, y, tableWidth / 2, tableHeight).stroke(); // Adiciona as bordas
      doc.text(cell, x + 5, y + 5, { width: tableWidth / 2 - 10 }); // Adiciona o texto
    });
  });

  // Adiciona um espaço antes da próxima seção
  doc.moveDown(4);

  const tableWidthContent = doc.page.width / 2.5; // Define a largura das tabelas
  const leftColumnX = doc.page.margins.left;
  const rightColumnX = doc.page.width / 2 + doc.page.margins.left / 2; // Coordenada X para a segunda tabela
  const yPosition = doc.y; // Coordenada Y comum para as tabelas

  doc.fontSize(12).fillColor("#000000");

  // Tabela Estrutura
  doc.text("ESTRUTURA", leftColumnX, yPosition);
  doc.moveDown(0.5);
  const structureTable = {
    headers: ["ITEM", "QUANTIDADE"],
    rows: [
      ["APARTAMENTOS", salasApartamentos],
      ["TORRES", torres],
      ["BOMBAS", bombas],
    ],
  };

  doc.table(structureTable, {
    prepareHeader: () => doc.fontSize(12).fillColor("#000000"),
    prepareRow: (row, i) => doc.fontSize(10).fillColor("#000000"),
    width: tableWidthContent,
    x: leftColumnX,
    y: yPosition + 20, // Define a posição Y para alinhar corretamente
  });

  // Espaço antes da nova tabela
  doc.moveDown(2);

  // Espaço antes da nova tabela
  doc.moveDown(2);

  // Título da tabela
  doc.text("EQUIPAMENTOS", leftColumnX, doc.y);
  doc.moveDown(0.5);

  // Constrói as linhas da tabela dinamicamente com base no array equips
  const equipmentsTable = {
    headers: ["TIPO", "PICO", "OPERAÇÃO"],
    rows: equips.map((equip) => [equip.type, equip.pico, equip.operacao]),
  };

  doc.table(equipmentsTable, {
    prepareHeader: () => doc.fontSize(12).fillColor("#000000"),
    prepareRow: (row, i) => doc.fontSize(10).fillColor("#000000"),
    width: tableWidthContent,
    x: leftColumnX,
  });

  // Adiciona uma nova página se a tabela tiver entre 7 e 12 linhas
  if (equips.length >= 6 && equips.length <= 12) {
    doc.addPage();
  }

  // Fases
  doc.text("FASES", leftColumnX, doc.y); // Insere o texto "FASES" na posição correta
  doc.moveDown(2);

  // Define a largura da tabela para ocupar toda a largura da página
  const fullWidth =
    doc.page.width - doc.page.margins.left - doc.page.margins.right;
  const phasesTable = {
    headers: ["RN", "SN", "TN", "RS", "ST", "TR"],
    rows: [[rn, sn, tn, rs, st, tr]],
  };

  doc.table(phasesTable, {
    prepareHeader: () => doc.fontSize(12).fillColor("#000000"),
    prepareRow: (row, i) => doc.fontSize(10).fillColor("#000000"),
    width: fullWidth, // Ajusta a largura da tabela
    x: doc.page.margins.left, // Alinha à esquerda, respeitando a margem
  });

  doc.addPage();

  // Seção de Imagens
  doc.fontSize(12).text("FOTOS", leftColumnX, 50);

  const maxPortraitHeight = 300; // Altura máxima para imagens em formato retrato
  const imageWidth = (doc.page.width - doc.page.margins.left * 2 - 30) / 2; // Largura de cada imagem
  const imageHeight = 200; // Altura base para imagens em paisagem
  const imagesPerRow = 2; // Número de imagens por linha

  // Adiciona até 16 imagens, distribuídas em duas páginas, com legendas
  for (let i = 0; i < 16; i++) {
    // Verifica se é necessário criar uma nova página após 4 imagens
    if (i === 4 || i === 8 || i === 12) {
      doc.addPage(); // Cria uma nova página
      doc.fontSize(12).text("FOTOS (Continuação)", leftColumnX, 50); // Título na nova página
    }

    const x = leftColumnX + (i % imagesPerRow) * (imageWidth + 20);
    const y =
      70 + Math.floor((i % 4) / imagesPerRow) * (maxPortraitHeight + 60); // Espaço para a legenda

    if (imagePaths[i]) {
      // Ajuste o caminho da imagem para a pasta 'medias'
      const imagePath = path.resolve(__dirname, "../medias", imagePaths[i]);

      // Carrega a imagem para obter as dimensões
      const img = doc.openImage(imagePath);

      const originalWidth = img.width;
      const originalHeight = img.height;

      // Determina se a imagem é retrato ou paisagem
      const isPortrait = originalHeight > originalWidth;

      let adjustedWidth;
      let adjustedHeight;

      if (isPortrait) {
        // Ajusta a imagem para retrato
        adjustedHeight = maxPortraitHeight; // Altura máxima para retrato
        adjustedWidth = (adjustedHeight / originalHeight) * originalWidth; // Ajusta a largura proporcionalmente
        doc.image(imagePath, x, y, {
          width: adjustedWidth,
          height: adjustedHeight,
        });
      } else {
        // Ajusta a imagem para paisagem
        adjustedWidth = imageWidth;
        adjustedHeight = imageHeight;
        doc.image(imagePath, x, y, { width: adjustedWidth, height: adjustedHeight });
      }

      doc.fontSize(10).text(`Foto ${i + 1}`, x, y + adjustedHeight + 5, {
        width: adjustedWidth,
        align: "center",
      });
    }
  }

  doc.end();
}

module.exports = {
  generatePDF: generatePDF,
};
