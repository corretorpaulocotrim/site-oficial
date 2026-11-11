// Ambiente isolado de teste: pasta de dados temporaria + midias geradas (sem dados pessoais)
const fs = require('fs');
const os = require('os');
const path = require('path');
const DADOS = fs.mkdtempSync(path.join(os.tmpdir(), 'pcstudio-teste-'));
process.env.DADOS_DIR = DADOS; process.env.NO_OPEN = '1';
const { ff } = require('../src/midia');
const FIX = path.join(DADOS, 'fixtures'); fs.mkdirSync(FIX, { recursive: true });

// PDF minimo valido (2 paginas de texto + 1 tabela vencida), escrito a mao
function pdfTeste(arq) {
  const pags = [
    ['Planta tipo 2 quartos com varanda', 'Area privativa 45,50 m\\262 e 62,10 m\\262', 'Living, cozinha e suite'],
    ['Lazer completo: piscina, academia, churrasqueira', 'Salao de festas e playground', 'Rua das Flores, 123 - a 5 min do metro'],
    ['Tabela de vendas', 'Validade da tabela: 01/01/2025 a 31/01/2025', 'Unidade 101 R$ 350.000,00  Unidade 102 R$ 365.000,00', 'Entrada e parcelas mensais']
  ];
  const obj = []; const add = s => { obj.push(s); return obj.length; };
  const fonte = add('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>');
  const kids = [];
  const pagesId = obj.length + 1 + pags.length * 2; // reservado
  for (const linhas of pags) {
    const conteudo = 'BT /F1 22 Tf 60 740 Td 28 TL ' + linhas.map(l => `(${l}) Tj T*`).join(' ') + ' ET';
    const c = add(`<< /Length ${conteudo.length} >>\nstream\n${conteudo}\nendstream`);
    kids.push(add(`<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 ${fonte} 0 R >> >> /Contents ${c} 0 R >>`));
  }
  add(`<< /Type /Pages /Kids [${kids.map(k => k + ' 0 R').join(' ')}] /Count ${kids.length} >>`);
  const cat = add(`<< /Type /Catalog /Pages ${pagesId} 0 R >>`);
  let out = '%PDF-1.4\n'; const offs = [];
  obj.forEach((o, i) => { offs.push(Buffer.byteLength(out, 'latin1')); out += `${i + 1} 0 obj\n${o}\nendobj\n`; });
  const x = Buffer.byteLength(out, 'latin1');
  out += `xref\n0 ${obj.length + 1}\n0000000000 65535 f \n${offs.map(o => String(o).padStart(10, '0') + ' 00000 n \n').join('')}trailer\n<< /Size ${obj.length + 1} /Root ${cat} 0 R >>\nstartxref\n${x}\n%%EOF\n`;
  fs.writeFileSync(arq, Buffer.from(out, 'latin1'));
}

let pronto = null;
function fixtures() {
  if (pronto) return pronto;
  pronto = (async () => {
    const f = { video: path.join(FIX, 'fala.mp4'), foto: path.join(FIX, 'sala.jpg'), pdf: path.join(FIX, 'book.pdf'), musica: path.join(FIX, 'trilha.mp3') };
    // video vertical 8s com "fala" (tom) e 3 pausas de 0,9s — para testar o corte de pausas
    await ff(['-f', 'lavfi', '-i', 'testsrc2=s=720x1280:r=30:d=8', '-f', 'lavfi', '-i', "aevalsrc='0.5*sin(2*PI*220*t)*lt(mod(t,2),1.1)':s=48000:d=8", '-c:v', 'libx264', '-preset', 'ultrafast', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-shortest', f.video]);
    await ff(['-f', 'lavfi', '-i', 'testsrc2=s=1600x900', '-frames:v', '1', f.foto]);
    await ff(['-f', 'lavfi', '-i', 'sine=f=330:d=12', '-c:a', 'libmp3lame', f.musica]);
    pdfTeste(f.pdf);
    return f;
  })();
  return pronto;
}
module.exports = { DADOS, fixtures };
