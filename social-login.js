/**
 * SOCIAL LOGIN — "Continuar com Google" — Paulo Cotrim
 * ============================================================================
 * Usa o Google Identity Services (a forma oficial e atual do Google para
 * "Sign in with Google"). Roda inteiramente no navegador do cliente —
 * não precisa de servidor/backend para capturar nome, e-mail e foto do lead.
 *
 * COMO ATIVAR (leva uns 3 minutos, é grátis, não precisa cartão):
 * 1. Acesse https://console.cloud.google.com/apis/credentials
 *    (entre com corretorpaulocotrim@gmail.com)
 * 2. Crie um projeto novo (ou use um existente), ex: "Site Paulo Cotrim"
 * 3. Clique em "Criar credenciais" → "ID do cliente OAuth"
 * 4. Tipo de aplicativo: "Aplicativo da Web"
 * 5. Em "Origens JavaScript autorizadas", adicione o domínio do site,
 *    ex: https://paulocotrim.com.br (e também https://www.paulocotrim.com.br
 *    se usar com www)
 * 6. Clique em "Criar" — vai aparecer um "ID do cliente" (Client ID),
 *    algo como 1234567890-abc123.apps.googleusercontent.com
 * 7. Cole esse ID abaixo, em GOOGLE_CLIENT_ID
 *
 * IMPORTANTE: por enquanto isso cobre só "Continuar com Google". Login com
 * Facebook e X (Twitter) pedem um app registrado em cada plataforma e, no
 * caso do X, praticamente exigem um servidor por trás — ficou de fora desta
 * rodada por ser um projeto à parte, como você mesmo definiu.
 * ============================================================================
 */
window.SOCIAL_LOGIN_CONFIG = {
  // Cole aqui o Client ID do Google (veja passo a passo acima)
  googleClientId: '',

  debug: false
};

(function () {
  function log() {
    if (window.SOCIAL_LOGIN_CONFIG.debug) console.log.apply(console, ['[SocialLogin]'].concat([].slice.call(arguments)));
  }

  // Decodifica o JWT (id_token) que o Google devolve — só a parte do meio,
  // sem precisar validar assinatura no cliente (a validação de verdade,
  // se um dia você tiver backend, deve ser feita lá).
  function decodeJwt(token) {
    try {
      var base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
      var json = decodeURIComponent(
        atob(base64).split('').map(function (c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join('')
      );
      return JSON.parse(json);
    } catch (e) {
      return null;
    }
  }

  function onGoogleCredential(response) {
    var perfil = decodeJwt(response.credential);
    if (!perfil) return;

    log('login recebido:', perfil.email);

    // Alimenta a mesma captura de lead já usada no resto do site
    if (window.leadCapture) {
      window.leadCapture('login_google', {
        nome: perfil.name || '',
        email: perfil.email || '',
        foto: perfil.picture || ''
      });
    }
    if (window.enviarLeadCRM) {
      window.enviarLeadCRM({
        nome: perfil.name || '',
        telefone: '',
        interesse: 'Login com Google',
        origem: 'social-login-google',
        extras: { email: perfil.email, foto: perfil.picture }
      });
    }

    document.dispatchEvent(new CustomEvent('googleLoginSucesso', { detail: perfil }));
  }

  function initGoogle() {
    var clientId = window.SOCIAL_LOGIN_CONFIG.googleClientId;
    if (!clientId) { log('googleClientId não configurado ainda.'); return; }
    if (!window.google || !window.google.accounts) { log('SDK do Google ainda não carregou.'); return; }

    google.accounts.id.initialize({
      client_id: clientId,
      callback: onGoogleCredential,
      auto_select: false
    });

    document.querySelectorAll('[data-google-login-btn]').forEach(function (el) {
      google.accounts.id.renderButton(el, {
        type: 'standard',
        theme: 'outline',
        size: 'large',
        text: 'continue_with',
        shape: 'pill',
        locale: 'pt-BR'
      });
    });
  }

  // Carrega o SDK do Google só se existir pelo menos um botão na página
  document.addEventListener('DOMContentLoaded', function () {
    if (!document.querySelector('[data-google-login-btn]')) return;
    if (!window.SOCIAL_LOGIN_CONFIG.googleClientId) { log('sem Client ID — botão não será exibido.'); return; }

    var s = document.createElement('script');
    s.src = 'https://accounts.google.com/gsi/client';
    s.async = true;
    s.defer = true;
    s.onload = initGoogle;
    document.head.appendChild(s);
  });
})();
