// Admin Panel — Paulo Cotrim · v1
// Ativar: Ctrl+Alt+P
// Login: paulocotrim / 102030
(function(){
  'use strict';
  var AK='pc_adm_v1', NK='pc_adm_notes', PK='pc_adm_photo';
  function isLogged(){ return localStorage.getItem(AK)==='1'; }

  /* CSS */
  var s=document.createElement('style');
  s.id='pc-adm-style';
  s.textContent=
    '#pc-adm-wrap{position:fixed;right:0;top:50%;transform:translateY(-50%);z-index:8000;display:flex;align-items:stretch;pointer-events:auto}'+
    '#pc-adm-tab{width:30px;min-height:120px;background:rgba(6,15,30,.88);border-radius:12px 0 0 12px;border:1px solid rgba(201,153,58,.3);border-right:none;color:rgba(201,153,58,.85);font-size:10px;font-weight:800;letter-spacing:.12em;cursor:pointer;font-family:inherit;display:flex;align-items:center;justify-content:center;writing-mode:vertical-rl;transform:rotate(180deg);padding:14px 0;transition:background .2s;user-select:none}'+
    '#pc-adm-tab:hover{background:rgba(13,32,64,.97);color:#e8b84b}'+
    '#pc-adm-panel{width:268px;background:rgba(6,15,30,.9);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);border:1px solid rgba(201,153,58,.25);border-right:none;border-radius:14px 0 0 14px;display:flex;flex-direction:column;overflow:hidden;transition:width .28s cubic-bezier(.4,0,.2,1),opacity .28s}'+
    '#pc-adm-panel.hidden{width:0;opacity:0;border:none;pointer-events:none}'+
    '#pc-adm-hdr{padding:12px 14px 10px;border-bottom:1px solid rgba(255,255,255,.07);display:flex;align-items:center;justify-content:space-between;gap:8px;flex-shrink:0}'+
    '#pc-adm-hdr-title{color:#e8b84b;font-size:11px;font-weight:800;letter-spacing:.1em;text-transform:uppercase}'+
    '#pc-adm-logout{background:none;border:none;color:rgba(255,255,255,.28);cursor:pointer;font-size:11px;font-family:inherit;transition:color .2s;padding:4px 6px;border-radius:4px}'+
    '#pc-adm-logout:hover{color:#f87171;background:rgba(248,113,113,.1)}'+
    '#pc-adm-body{flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:16px;scrollbar-width:thin;scrollbar-color:rgba(201,153,58,.2) transparent}'+
    '#pc-adm-photo-area{width:104px;height:104px;border-radius:50%;overflow:hidden;cursor:pointer;border:2.5px solid rgba(201,153,58,.45);background:rgba(255,255,255,.04);display:flex;align-items:center;justify-content:center;margin:0 auto;transition:border-color .25s;flex-shrink:0}'+
    '#pc-adm-photo-area:hover{border-color:#e8b84b}'+
    '#pc-adm-photo-area img{width:100%;height:100%;object-fit:cover;object-position:top center;display:block}'+
    '.pc-adm-ph{text-align:center;color:rgba(255,255,255,.3);font-size:10px;line-height:1.45}'+
    '.pc-adm-ph span{display:block;font-size:26px;margin-bottom:4px;opacity:.6}'+
    '#pc-adm-photo-hint{font-size:9px;color:rgba(255,255,255,.25);text-align:center;margin-top:4px;letter-spacing:.05em}'+
    '#pc-adm-notes-lbl{font-size:9px;font-weight:700;letter-spacing:.12em;color:rgba(255,255,255,.3);text-transform:uppercase;margin-bottom:5px}'+
    '#pc-adm-notes{width:100%;min-height:200px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.1);border-radius:8px;padding:10px 12px;color:rgba(255,255,255,.88);font-size:12px;font-family:inherit;line-height:1.6;resize:vertical;outline:none;transition:border-color .2s}'+
    '#pc-adm-notes::placeholder{color:rgba(255,255,255,.22)}'+
    '#pc-adm-notes:focus{border-color:rgba(201,153,58,.45)}'+
    /* login */
    '#pc-login-ov{position:fixed;inset:0;z-index:9500;background:rgba(0,0,0,.72);display:flex;align-items:center;justify-content:center;backdrop-filter:blur(5px)}'+
    '#pc-login-box{background:#0d2040;border:1px solid rgba(201,153,58,.3);border-radius:18px;padding:32px 28px;width:310px;display:flex;flex-direction:column;gap:13px;box-shadow:0 24px 64px rgba(0,0,0,.65)}'+
    '#pc-login-ico{font-size:32px;text-align:center}'+
    '#pc-login-ttl{color:#e8b84b;font-size:17px;font-weight:900;text-align:center;letter-spacing:-.01em}'+
    '.pc-inp{background:rgba(255,255,255,.06);border:1.5px solid rgba(255,255,255,.12);border-radius:9px;padding:12px 14px;color:#fff;font-size:14px;font-family:inherit;outline:none;width:100%;transition:border-color .2s}'+
    '.pc-inp:focus{border-color:rgba(201,153,58,.6)}'+
    '#pc-login-err{color:#f87171;font-size:12px;text-align:center;min-height:14px}'+
    '#pc-login-btn{background:#c9993a;color:#060f1e;border:none;padding:13px;border-radius:10px;font-size:14px;font-weight:900;cursor:pointer;font-family:inherit;transition:background .2s}'+
    '#pc-login-btn:hover{background:#e8b84b}'+
    '#pc-login-cancel{background:none;border:none;color:rgba(255,255,255,.35);font-size:12px;cursor:pointer;font-family:inherit;text-align:center;transition:color .2s}'+
    '#pc-login-cancel:hover{color:rgba(255,255,255,.7)}'+
    '@media(max-width:540px){#pc-adm-panel{width:220px}#pc-adm-notes{min-height:140px}}';
  document.head.appendChild(s);

  /* BUILD PANEL */
  function buildPanel(){
    if(document.getElementById('pc-adm-wrap')) return;
    var ph=localStorage.getItem(PK)||'';
    var nt=localStorage.getItem(NK)||'';
    var wrap=document.createElement('div');
    wrap.id='pc-adm-wrap';
    wrap.innerHTML=
      '<button id="pc-adm-tab">PAULO</button>'+
      '<div id="pc-adm-panel">'+
        '<div id="pc-adm-hdr">'+
          '<span id="pc-adm-hdr-title">Painel Paulo</span>'+
          '<button id="pc-adm-logout" title="Sair">Sair ×</button>'+
        '</div>'+
        '<div id="pc-adm-body">'+
          '<div>'+
            '<div id="pc-adm-photo-area">'+
              (ph?'<img src="'+ph+'" alt="Minha foto"/>'
                 :'<div class="pc-adm-ph"><span><svg viewBox="0 0 24 24" style="width:16px;height:16px;stroke:currentColor;fill:none;stroke-width:1.8"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></svg></span>Minha foto</div>')+
            '</div>'+
            '<div id="pc-adm-photo-hint">Clique para adicionar foto</div>'+
            '<input type="file" id="pc-adm-ph-input" accept="image/*" style="display:none"/>'+
          '</div>'+
          '<div>'+
            '<div id="pc-adm-notes-lbl">Anotações</div>'+
            '<textarea id="pc-adm-notes" placeholder="Anote leads, preços, observações...\n\nAutossalvo automaticamente.">'+nt+'</textarea>'+
          '</div>'+
        '</div>'+
      '</div>';
    document.body.appendChild(wrap);

    var panel=document.getElementById('pc-adm-panel');
    var tab=document.getElementById('pc-adm-tab');

    /* toggle */
    tab.addEventListener('click',function(){
      var h=panel.classList.toggle('hidden');
      tab.textContent=h?'PAULO':'PAULO';
    });

    /* logout */
    document.getElementById('pc-adm-logout').addEventListener('click',function(){
      if(confirm('Sair do painel?')){ localStorage.removeItem(AK); wrap.remove(); }
    });

    /* photo upload */
    document.getElementById('pc-adm-photo-area').addEventListener('click',function(){
      document.getElementById('pc-adm-ph-input').click();
    });
    document.getElementById('pc-adm-ph-input').addEventListener('change',function(){
      var f=this.files[0]; if(!f) return;
      var r=new FileReader();
      r.onload=function(e){
        var src=e.target.result;
        localStorage.setItem(PK,src);
        localStorage.setItem('pc_foto_paulo',src);
        document.getElementById('pc-adm-photo-area').innerHTML='<img src="'+src+'" alt="Minha foto"/>';
      };
      r.readAsDataURL(f);
    });

    /* notes autosave */
    document.getElementById('pc-adm-notes').addEventListener('input',function(){
      localStorage.setItem(NK,this.value);
    });
  }

  /* BUILD LOGIN */
  function buildLogin(){
    if(document.getElementById('pc-login-ov')) return;
    var ov=document.createElement('div');
    ov.id='pc-login-ov';
    ov.innerHTML=
      '<div id="pc-login-box">'+
        '<div id="pc-login-ico"><svg viewBox="0 0 24 24" style="width:36px;height:36px;stroke:currentColor;fill:none;stroke-width:1.6"><path d="M19 11H5a2 2 0 00-2 2v7a2 2 0 002 2h14a2 2 0 002-2v-7a2 2 0 00-2-2z"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg></div>'+
        '<div id="pc-login-ttl">Acesso Restrito</div>'+
        '<input id="pc-login-user" class="pc-inp" type="text" placeholder="Usuário" autocomplete="username"/>'+
        '<input id="pc-login-pass" class="pc-inp" type="password" placeholder="Senha" autocomplete="current-password"/>'+
        '<div id="pc-login-err"></div>'+
        '<button id="pc-login-btn">Entrar</button>'+
        '<button id="pc-login-cancel">Cancelar</button>'+
      '</div>';
    document.body.appendChild(ov);
    setTimeout(function(){ document.getElementById('pc-login-user').focus(); },60);

    function tryLogin(){
      var u=document.getElementById('pc-login-user').value.trim();
      var p=document.getElementById('pc-login-pass').value;
      if(u==='paulocotrim'&&p==='102030'){
        localStorage.setItem(AK,'1');
        ov.remove(); buildPanel();
      } else {
        document.getElementById('pc-login-err').textContent='Usuário ou senha incorretos.';
        document.getElementById('pc-login-pass').value='';
        document.getElementById('pc-login-pass').focus();
      }
    }
    document.getElementById('pc-login-btn').addEventListener('click',tryLogin);
    document.getElementById('pc-login-pass').addEventListener('keydown',function(e){ if(e.key==='Enter') tryLogin(); });
    document.getElementById('pc-login-cancel').addEventListener('click',function(){ ov.remove(); });
    ov.addEventListener('click',function(e){ if(e.target===this) ov.remove(); });
  }

  /* INIT */
  document.addEventListener('DOMContentLoaded',function(){ if(isLogged()) buildPanel(); });
  document.addEventListener('keydown',function(e){
    if(e.ctrlKey&&e.altKey&&(e.key==='p'||e.key==='P')){
      e.preventDefault();
      isLogged()
        ? (document.getElementById('pc-adm-wrap')||buildPanel())
        : buildLogin();
    }
  });
})();
