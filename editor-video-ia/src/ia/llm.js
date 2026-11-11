// Adaptador OPCIONAL do Claude (Anthropic) para o roteirista. Sem ANTHROPIC_API_KEY o app usa o roteirista local por regras.
const cfg = require('../config');

const disponivel = () => !!cfg.ANTHROPIC_API_KEY;
let _cli = null;
function cliente() {
  if (!_cli) { const Anthropic = require('@anthropic-ai/sdk'); _cli = new Anthropic({ apiKey: cfg.ANTHROPIC_API_KEY }); }
  return _cli;
}

// Recebe o roteiro-base (gerado por regras, com midias e fontes) e devolve textos melhores no MESMO formato
async function refinarRoteiro(base, contexto) {
  const schema = {
    type: 'object', additionalProperties: false, required: ['gancho', 'cenas', 'cta', 'legendaPost'],
    properties: {
      gancho: { type: 'string' }, cta: { type: 'string' }, legendaPost: { type: 'string' },
      cenas: { type: 'array', items: { type: 'object', additionalProperties: false, required: ['ordem', 'fala', 'textoTela'], properties: { ordem: { type: 'integer' }, fala: { type: 'string' }, textoTela: { type: 'string' } } } }
    }
  };
  const system = `Você é roteirista e diretor de vídeos imobiliários do corretor Paulo Cotrim (Rio de Janeiro, CRECI-RJ 77677-F).
Posicionamento da marca: "${contexto.slogan}". Tom: consultivo, claro, elegante; nunca apelativo.
Regras obrigatórias:
- Use SOMENTE os fatos fornecidos. Não invente preço, desconto, escassez, rentabilidade, valorização, prazo ou benefício.
- Fato marcado "confirmar" só pode aparecer se for redigido como algo a confirmar, ou deve ser omitido.
- Português do Brasil. Frases curtas, faladas naturalmente. textoTela com no máximo 6 palavras.
- Mantenha a mesma quantidade e ordem de cenas do roteiro-base; reescreva apenas fala e textoTela.
- O gancho deve prender nos primeiros 3 segundos sem prometer o que os fatos não sustentam.`;
  const resp = await cliente().beta.messages.create({
    model: cfg.ANTHROPIC_MODELO,
    max_tokens: 16000,
    betas: ['server-side-fallback-2026-07-01'],
    fallbacks: 'default',
    output_config: { effort: 'medium', format: { type: 'json_schema', schema } },
    system,
    messages: [{ role: 'user', content: `Contexto (JSON):\n${JSON.stringify(contexto)}\n\nRoteiro-base (JSON):\n${JSON.stringify({ gancho: base.gancho, cta: base.cta, legendaPost: base.legendaPost, cenas: base.cenas.map(c => ({ ordem: c.ordem, categoria: c.categoria, fala: c.fala, textoTela: c.textoTela, fonte: c.fonte })) })}` }]
  });
  if (resp.stop_reason === 'refusal') throw new Error('O modelo recusou a solicitação; mantido o roteiro local.');
  const txt = resp.content.filter(b => b.type === 'text').map(b => b.text).join('');
  const r = JSON.parse(txt);
  const out = { ...base, origem: 'claude', gancho: r.gancho || base.gancho, cta: r.cta || base.cta, legendaPost: r.legendaPost || base.legendaPost };
  out.cenas = base.cenas.map(c => { const n = (r.cenas || []).find(x => x.ordem === c.ordem); return n ? { ...c, fala: n.fala, textoTela: n.textoTela } : c; });
  return out;
}
module.exports = { disponivel, refinarRoteiro };
