/**
 * google-apps-script-upload-documentos.gs
 * ------------------------------------------------------------------
 * Recebe os documentos enviados pelo site (Aprovação Expressa e
 * simuladores) e salva no Google Drive de Paulo Cotrim, organizados
 * por lead, além de enviar um e-mail de aviso.
 *
 * NÃO precisa editar nada neste arquivo. Basta colar ele inteiro no
 * Google Apps Script e publicar (passo a passo no final deste arquivo,
 * em comentário).
 * ------------------------------------------------------------------
 */

// Pasta raiz no Google Drive onde tudo será organizado (uma subpasta por lead).
// Pode trocar o nome se quiser, mas não precisa.
var PASTA_RAIZ_NOME = 'Site - Documentos Recebidos';

// E-mail que recebe o aviso a cada novo envio.
var EMAIL_AVISO = 'corretorpaulocotrim@gmail.com';

function doPost(e) {
  try {
    var dados = JSON.parse(e.postData.contents);
    var nome = (dados.nome || 'sem-nome').trim();
    var telefone = (dados.telefone || 'sem-telefone').trim();
    var origem = dados.origem || 'site';
    var arquivos = dados.arquivos || [];

    if (!arquivos.length) {
      return respostaJSON({ ok: false, erro: 'nenhum_arquivo' });
    }

    var pastaRaiz = pegarOuCriarPasta(PASTA_RAIZ_NOME, DriveApp.getRootFolder());
    var carimbo = Utilities.formatDate(new Date(), 'GMT-3', 'dd-MM-yyyy HH-mm');
    var nomePastaLead = nome + ' - ' + telefone + ' - ' + carimbo;
    var pastaLead = pastaRaiz.createFolder(nomePastaLead);

    var linksArquivos = [];
    for (var i = 0; i < arquivos.length; i++) {
      var item = arquivos[i];
      var bytes = Utilities.base64Decode(item.base64);
      var blob = Utilities.newBlob(bytes, item.mimeType || 'application/octet-stream', item.nomeArquivo || ('documento-' + i));
      var arquivoSalvo = pastaLead.createFile(blob);
      // deixa o arquivo visível para quem tiver o link (não é público na busca)
      arquivoSalvo.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      linksArquivos.push('- ' + (item.tipoDoc || 'documento') + ': ' + arquivoSalvo.getUrl());
    }

    enviarEmailAviso(nome, telefone, origem, pastaLead.getUrl(), linksArquivos);

    return respostaJSON({ ok: true, pasta: pastaLead.getUrl() });
  } catch (erro) {
    return respostaJSON({ ok: false, erro: String(erro) });
  }
}

function pegarOuCriarPasta(nome, pastaPai) {
  var existentes = pastaPai.getFoldersByName(nome);
  if (existentes.hasNext()) return existentes.next();
  return pastaPai.createFolder(nome);
}

function enviarEmailAviso(nome, telefone, origem, urlPasta, linksArquivos) {
  var assunto = 'Novos documentos recebidos — ' + nome;
  var corpo = 'Nome: ' + nome + '\n'
    + 'WhatsApp: ' + telefone + '\n'
    + 'Origem: ' + origem + '\n\n'
    + 'Pasta com todos os arquivos:\n' + urlPasta + '\n\n'
    + 'Arquivos enviados:\n' + linksArquivos.join('\n');
  MailApp.sendEmail(EMAIL_AVISO, assunto, corpo);
}

function respostaJSON(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * ==================================================================
 * COMO PUBLICAR (só precisa fazer isso UMA VEZ):
 * ==================================================================
 * 1. Acesse https://script.google.com (com a mesma conta Google que
 *    você quer usar para receber os documentos no Drive/e-mail).
 * 2. Clique em "Novo projeto".
 * 3. Apague o conteúdo padrão (function myFunction(){}) e cole TODO
 *    o conteúdo deste arquivo no lugar.
 * 4. Dê um nome ao projeto, por exemplo "Upload Documentos Site".
 * 5. Clique em "Implantar" (Deploy) → "Nova implantação" (New deployment).
 * 6. Em "Selecionar tipo", clique na engrenagem e escolha "App da Web"
 *    (Web app).
 * 7. Em "Executar como" (Execute as), deixe "Eu" (sua conta).
 * 8. Em "Quem pode acessar" (Who has access), escolha "Qualquer pessoa"
 *    (Anyone) — isso é necessário para o site conseguir enviar os
 *    arquivos, mesmo sem login.
 * 9. Clique em "Implantar" (Deploy). Na primeira vez, o Google vai
 *    pedir para autorizar o script — clique em "Autorizar acesso",
 *    escolha sua conta, e se aparecer um aviso de "app não verificado",
 *    clique em "Avançado" → "Acessar Upload Documentos Site (não seguro)".
 *    É seguro — é o seu próprio script, feito para você.
 * 10. Copie a "URL do app da Web" (Web app URL) que aparece — algo como
 *     https://script.google.com/macros/s/AKfycb.../exec
 * 11. Cole essa URL no arquivo doc-upload-config.js do site, no campo
 *     uploadUrl (Claude faz esse passo pra você — só precisa colar a
 *     URL na conversa).
 *
 * PRONTO — depois desse passo único, todo envio de documento no site
 * (Aprovação Expressa e simuladores) vai salvar automaticamente numa
 * pasta do seu Google Drive chamada "Site - Documentos Recebidos",
 * organizada por lead, e te avisar por e-mail a cada novo envio.
 *
 * Esse passo NÃO precisa ser refeito depois — mesmo quando o site for
 * atualizado de novo, essa URL continua funcionando normalmente.
 * ==================================================================
 */
