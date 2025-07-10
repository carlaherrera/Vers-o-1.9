      // Função para abrir o modal de imagem
      function abrirModalImagem(event, imagemUrl, titulo) {
        // Impedir que o clique propague para o card e acione o toggleItemExpansion
        event.stopPropagation();

        const modal = document.getElementById("imageModal");
        const modalImg = document.getElementById("modalImage");

        // Se não houver URL de imagem válida, não abrir o modal
        if (!imagemUrl || imagemUrl === "") {
                    return;
        }

        // Definir a imagem no modal
        modalImg.src = imagemUrl;
        modalImg.alt = titulo || "Imagem ampliada";

        // Exibir o modal com animação
        modal.classList.add("active");

        // Impedir o scroll da página enquanto o modal estiver aberto
        document.body.style.overflow = "hidden";

        // Adicionar listener para fechar o modal ao clicar fora da imagem
        modal.addEventListener("click", function (e) {
          if (e.target === modal) {
            fecharModalImagem();
          }
        });

        // Adicionar listener para fechar o modal com a tecla ESC
        document.addEventListener("keydown", fecharModalComEsc);
      }

      // Função para fechar o modal de imagem
      function fecharModalImagem() {
        const modal = document.getElementById("imageModal");

        // Remover classe active para iniciar a animação de saída
        modal.classList.remove("active");

        // Restaurar o scroll da página
        document.body.style.overflow = "";

        // Remover listener de tecla ESC
        document.removeEventListener("keydown", fecharModalComEsc);
      }

      // Função para fechar o modal com a tecla ESC
      function fecharModalComEsc(e) {
        if (e.key === "Escape") {
          fecharModalImagem();
        }
      }
