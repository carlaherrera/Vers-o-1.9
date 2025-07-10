      // Função para inicializar o carregamento de imagens
      function inicializarCarregamentoImagens() {
                // Selecionar todas as imagens dentro de containers de skeleton
        document.querySelectorAll(".image-skeleton img").forEach((img) => {
          // Verificar se a imagem já está carregada (pode acontecer com cache)
          if (img.complete) {
            img.classList.remove("img-loading");
            img.classList.add("img-loaded");
          } else {
            // Configurar evento de carregamento
            img.addEventListener("load", function () {
              this.classList.remove("img-loading");
              this.classList.add("img-loaded");
            });

            // Configurar evento de erro
            img.addEventListener("error", function () {
              // A imagem já tem um onerror que substitui por um placeholder
              this.classList.remove("img-loading");
              this.classList.add("img-loaded");
            });
          }
        });
      }

      // Inicializar o sistema de carregamento de imagens quando o DOM estiver pronto
      document.addEventListener("DOMContentLoaded", function () {
        // Observar mudanças no cardápio para inicializar o carregamento de imagens
        const observerCardapio = new MutationObserver(function (mutations) {
          mutations.forEach(function (mutation) {
            if (mutation.addedNodes.length) {
              // Verificar se o cardápio foi renderizado
              if (document.querySelector("#cardapio .categoria-secao")) {
                inicializarCarregamentoImagens();
                // Desconectar o observer após inicializar
                observerCardapio.disconnect();
              }
            }
          });
        });

        // Observar mudanças no cardápio
        const cardapioElement = document.getElementById("cardapio");
        if (cardapioElement) {
          observerCardapio.observe(cardapioElement, {
            childList: true,
            subtree: true,
          });
        }

        // Também inicializar diretamente caso o cardápio já esteja renderizado
        if (document.querySelector("#cardapio .categoria-secao")) {
          inicializarCarregamentoImagens();
        }
      });
