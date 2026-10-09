/* feed.js — lê atualizações (WhatsApp/construtoras) do Apps Script. Público: ?action=news. Privado: ?action=feed&token= */
(function(){
  var cfg=function(){return window.CRM_CONFIG||{};};
  window.PCFeed={
    tipos:{lancamento:'Lançamento',evento:'Evento',comissao:'Comissão',premiacao:'Premiação',tabela:'Tabela/Preço',mercado:'Mercado',aviso:'Aviso'},
    load:function(privado,cred){
      var u=cfg().webhookUrl; if(!u) return Promise.resolve({ok:false,itens:[],reason:'sem_backend'});
      var url=u+(u.indexOf('?')<0?'?':'&')+'action='+(privado?'feed&usuario='+encodeURIComponent((cred&&cred.u)||'')+'&senha='+encodeURIComponent((cred&&cred.p)||''):'news');
      var ck='pc_feed_'+(privado?'p':'n');
      return fetch(url).then(function(r){return r.json();}).then(function(j){
        if(j&&j.ok){try{localStorage.setItem(ck,JSON.stringify({t:Date.now(),itens:j.itens}));}catch(e){} return j;}
        return j||{ok:false,itens:[]};
      }).catch(function(){
        try{var c=JSON.parse(localStorage.getItem(ck)||'null'); if(c) return {ok:true,itens:c.itens,cache:true};}catch(e){}
        return {ok:false,itens:[],reason:'offline'};
      });
    },
    fmt:function(d){try{var x=new Date(d);return isNaN(x)?'':x.toLocaleDateString('pt-BR');}catch(e){return '';}},
    esc:function(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});},
    // roteiro de carrossel (8 lâminas) para o agente/Paulo levarem à pasta MKTPHC
    carrossel:function(it){
      var t=window.PCFeed.tipos[it.tipo]||'Novidade';
      return ['CARROSSEL — '+t+': '+(it.titulo||''),
        '1 CAPA: '+(it.titulo||'')+(it.construtora?' | '+it.construtora:''),
        '2 O QUE É: '+(it.texto||''),
        '3 PARA QUEM: (perfil de cliente — preencher)',
        '4 VANTAGEM FINANCEIRA: (condição/entrada/parcela — usar só dados confirmados)',
        '5 PRAZO: '+(it.prazo||'Consulte'),
        '6 POR QUE AGORA: urgência real (prazo/unidades) — sem inventar escassez',
        '7 COMO FINANCIAR: simulação Caixa/FGTS',
        '8 CTA: Chame o Paulo no WhatsApp','',
        'LEGENDA: '+(it.titulo||'')+' — fale comigo no WhatsApp. CRECI-RJ 77677-F',
        '(Comissão NÃO aparece em nenhuma lâmina.)'].join('\n');
    }
  };
})();
