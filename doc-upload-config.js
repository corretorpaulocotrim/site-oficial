/**
 * DOC UPLOAD CONFIG — Paulo Cotrim
 * Depois de implantar o Google Apps Script (veja
 * google-apps-script-upload-documentos.gs para o passo a passo),
 * cole aqui a URL do app da Web.
 */
window.DOC_UPLOAD_CONFIG = {
  // URL do Apps Script (ex: 'https://script.google.com/macros/s/AKfycb.../exec')
  uploadUrl: '',

  // Tamanho máximo por arquivo, em MB (e-mail/Drive lidam bem até uns 20-25MB)
  maxSizeMB: 15,

  // Ativar log no console (útil para testar)
  debug: false
};

/**
 * Envia uma lista de arquivos (File objects) para o Apps Script.
 * @param {Object} dados - {nome, telefone, origem}
 * @param {Array<{file: File, tipoDoc: string}>} itens
 * @returns {Promise<{ok: boolean, erro?: string}>}
 */
window.enviarDocumentos = async function (dados, itens) {
  const cfg = window.DOC_UPLOAD_CONFIG;

  if (!cfg.uploadUrl) {
    if (cfg.debug) console.warn('[DocUpload] uploadUrl não configurado ainda.');
    return { ok: false, erro: 'not_configured' };
  }

  const maxBytes = cfg.maxSizeMB * 1024 * 1024;
  const arquivos = [];

  for (const item of itens) {
    if (item.file.size > maxBytes) {
      return { ok: false, erro: 'arquivo_grande', arquivo: item.file.name };
    }
    const base64 = await fileParaBase64(item.file);
    arquivos.push({
      nomeArquivo: item.file.name,
      tipoDoc: item.tipoDoc,
      mimeType: item.file.type || 'application/octet-stream',
      base64: base64
    });
  }

  const payload = {
    nome: dados.nome || '',
    telefone: dados.telefone || '',
    origem: dados.origem || 'site',
    arquivos: arquivos
  };

  try {
    const res = await fetch(cfg.uploadUrl, {
      method: 'POST',
      // text/plain evita o preflight CORS do Apps Script — o script faz
      // JSON.parse(e.postData.contents) normalmente.
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload)
    });
    const json = await res.json();
    if (cfg.debug) console.log('[DocUpload] resposta:', json);
    return json;
  } catch (err) {
    if (cfg.debug) console.error('[DocUpload] erro:', err);
    return { ok: false, erro: String(err) };
  }
};

function fileParaBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
