      // Navegação de scroll vertical para menu desktop
      // Autor: Dante Testa - https://dantetesta.com.br
      // Esta função sincroniza o menu de filtros desktop com o scroll vertical das seções do cardápio.
      // Função removida pois agora o menu desktop é o mesmo que o mobile
      function setupDesktopScrollNavigation() {
        // Removida pois agora usamos o mesmo menu para desktop e mobile
              }

      // Aguarda o cardápio ser renderizado antes de inicializar
      document.addEventListener("DOMContentLoaded", () => {
        if (document.querySelector(".categoria-secao")) {
          setupDesktopScrollNavigation();
        } else {
          const observer = new MutationObserver((mutations, obs) => {
            if (document.querySelector(".categoria-secao")) {
              setupDesktopScrollNavigation();
              obs.disconnect();
            }
          });
          observer.observe(document.body, { childList: true, subtree: true });
        }
      });
