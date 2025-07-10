      // Carregar carrinho ao iniciar a página
      document.addEventListener("DOMContentLoaded", function () {
                atualizarContadorCarrinho();
      });

      // Função para atualizar o contador do carrinho
      function atualizarContadorCarrinho() {
        // Sempre buscar do localStorage para garantir dados atualizados
        const carrinho = JSON.parse(localStorage.getItem("carrinho") || "[]");
        const totalItens = carrinho.reduce(
          (total, item) => total + item.quantidade,
          0
        );

        
        // Container do carrinho flutuante
        const carrinhoFlutuante = document.getElementById("carrinho-flutuante");
        // Botão do carrinho dentro do container
        const botaoCarrinho = document.getElementById("botao-carrinho");

        // Atualizar contador no botão
        const contador = document.getElementById("carrinho-contador");
        if (contador) {
          contador.textContent = totalItens;

          // Adicionar classe de destaque se houver itens
          if (totalItens > 0) {
            contador.classList.add("animate-pulse");
            contador.classList.remove("hidden");
            setTimeout(() => contador.classList.remove("animate-pulse"), 500);
          } else {
            contador.classList.add("hidden");
          }
        }

        // Atualizar o contador no título do carrinho
        const totalItensCarrinho = document.getElementById(
          "total-itens-carrinho"
        );
        if (totalItensCarrinho) {
          totalItensCarrinho.textContent = totalItens;
                  }

        // Mostrar/esconder carrinho flutuante e garantir que o botão seja clicável
        if (carrinhoFlutuante && botaoCarrinho) {
          if (totalItens > 0) {
            // Exibir o container
            carrinhoFlutuante.style.display = "block";
            carrinhoFlutuante.style.opacity = "1";
            carrinhoFlutuante.classList.remove("hidden");

            // Garantir que o botão esteja clicável
            botaoCarrinho.style.display = "flex";
            botaoCarrinho.style.pointerEvents = "auto";

            // Garantir que o onclick está definido
            if (
              !botaoCarrinho.hasAttribute("onclick") ||
              !botaoCarrinho.getAttribute("onclick")
            ) {
              botaoCarrinho.setAttribute("onclick", "abrirModal();");
                          }
          } else {
            carrinhoFlutuante.style.opacity = "0.5";
            carrinhoFlutuante.classList.add("hidden");
          }
        } else {
          console.error("Elementos do carrinho não encontrados:", {
            carrinhoFlutuante,
            botaoCarrinho,
          });
        }

        // Atualizar estado dos botões de limpar carrinho
        const btnLimparCarrinho = document.getElementById("limpar-carrinho");
        const botaoLimpar = document.getElementById("botao-limpar");

        if (totalItens === 0) {
          // Esconder/desabilitar botões quando o carrinho estiver vazio
          if (btnLimparCarrinho) {
            btnLimparCarrinho.classList.add("hidden");
          }

          if (botaoLimpar) {
            botaoLimpar.disabled = true;
            botaoLimpar.classList.add("opacity-50", "cursor-not-allowed");
          }
        } else {
          // Mostrar/habilitar botões quando houver itens no carrinho
          if (btnLimparCarrinho) {
            btnLimparCarrinho.classList.remove("hidden");
          }

          if (botaoLimpar) {
            botaoLimpar.disabled = false;
            botaoLimpar.classList.remove("opacity-50", "cursor-not-allowed");
          }
        }
      }

      // Funções para controlar o modal de checkout
      function abrirModal() {
                const modal = document.getElementById("modal-checkout");
        if (modal) {
          // Bloquear o scroll da página antes de exibir o modal
          document.body.style.overflow = "hidden";

          modal.classList.remove("hidden");
          modal.style.display = "block";
          modal.setAttribute("aria-hidden", "false");
          // Atualizar conteúdo do carrinho no modal
          renderizarItensCarrinho();

          // Atualizar o contador total de itens no título do carrinho
          const totalItensCarrinho = document.getElementById(
            "total-itens-carrinho"
          );
          if (totalItensCarrinho) {
            // Obter carrinho do localStorage
            let carrinho = JSON.parse(localStorage.getItem("carrinho") || "[]");
            // Calcular o total de itens somando todas as quantidades
            const totalItens = carrinho.reduce(
              (acc, item) => acc + item.quantidade,
              0
            );
            totalItensCarrinho.textContent = totalItens;
                      }
        }
      }

      function fecharModal() {
                const modal = document.getElementById("modal-checkout");
        if (modal) {
          modal.classList.add("hidden");
          modal.style.display = "none";
          modal.setAttribute("aria-hidden", "true");

          // Restaurar o scroll da página
          document.body.style.overflow = "";
          document.body.classList.remove("overflow-hidden");
                  }
      }

      // Variável para evitar chamadas recursivas
      let isRenderizandoCarrinho = false;

      // Função para renderizar itens do carrinho no modal
      function renderizarItensCarrinho() {
        try {
          // Evitar chamadas recursivas
          if (isRenderizandoCarrinho) {
                        return;
          }

          isRenderizandoCarrinho = true;
                    const containerItens = document.getElementById("carrinho-itens");

          if (!containerItens) {
            console.error("Container de itens do carrinho não encontrado");
            isRenderizandoCarrinho = false;
            return;
          }

          // Obter carrinho do localStorage (sempre buscar do localStorage para garantir dados atualizados)
          let carrinho = JSON.parse(localStorage.getItem("carrinho") || "[]");

          // Atualizar variável global do carrinho para garantir sincronização
          window.carrinho = carrinho;

          // Limpar todo o conteúdo do container
          containerItens.innerHTML = "";

          // Verificar se o carrinho está vazio
          if (carrinho.length === 0) {
            // Exibir mensagem de carrinho vazio
            const carrinhoVazioHtml = `
                    <div class="text-center text-gray-500 py-8" id="carrinho-vazio">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto mb-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <p class="text-lg">Seu carrinho está vazio</p>
                        <p class="mt-2">Adicione itens do cardápio para continuar</p>
                    </div>
                `;
            containerItens.innerHTML = carrinhoVazioHtml;

            // Desabilitar botão de continuar
            const botaoContinuar = document.getElementById("botao-continuar");
            if (botaoContinuar) {
              botaoContinuar.disabled = true;
              botaoContinuar.classList.add("opacity-50", "cursor-not-allowed");
            }

            // Esconder botão limpar carrinho no step 1
            const btnLimparCarrinho =
              document.getElementById("limpar-carrinho");
            if (btnLimparCarrinho) {
              btnLimparCarrinho.classList.add("hidden");
              btnLimparCarrinho.setAttribute("aria-hidden", "true");
            }

            // Atualizar botão limpar no rodapé
            const botaoLimpar = document.getElementById("botao-limpar");
            if (botaoLimpar) {
              botaoLimpar.disabled = true;
              botaoLimpar.classList.add("opacity-50", "cursor-not-allowed");
              botaoLimpar.setAttribute("aria-disabled", "true");
            }
          } else {
            // Habilitar botão de continuar
            const botaoContinuar = document.getElementById("botao-continuar");
            if (botaoContinuar) {
              botaoContinuar.disabled = false;
              botaoContinuar.classList.remove(
                "opacity-50",
                "cursor-not-allowed"
              );
            }

            // Mostrar botão limpar carrinho no step 1
            const btnLimparCarrinho =
              document.getElementById("limpar-carrinho");
            if (btnLimparCarrinho) {
              btnLimparCarrinho.classList.remove("hidden");
              btnLimparCarrinho.setAttribute("aria-hidden", "false");
            }

            // Habilitar botão limpar no rodapé
            const botaoLimpar = document.getElementById("botao-limpar");
            if (botaoLimpar) {
              botaoLimpar.disabled = false;
              botaoLimpar.classList.remove("opacity-50", "cursor-not-allowed");
              botaoLimpar.setAttribute("aria-disabled", "false");
            }

            // Renderizar cada item do carrinho
            carrinho.forEach((item, index) => {
              // Usar a imagem armazenada no objeto do carrinho ou tentar encontrar no DOM
              let imagemSrc = item.imagem || "";

              // Se não tiver imagem armazenada, tenta buscar no DOM como fallback
              if (!imagemSrc) {
                try {
                  // Usar o ID original do produto para buscar a imagem no DOM
                  const idBusca = item.originalId || item.id;
                  const cardItem = document.querySelector(
                    `[data-item-id="${idBusca}"]`
                  );
                  if (cardItem) {
                    const card = cardItem.closest(".card");
                    if (card) {
                      const img = card.querySelector("img");
                      if (img) {
                        // Tentar obter a URL completa da imagem
                        if (img.currentSrc) {
                          imagemSrc = img.currentSrc;
                        } else if (img.src) {
                          imagemSrc = img.src;
                        } else {
                          imagemSrc = img.getAttribute("src") || "";
                        }

                                              }
                    }
                  }
                } catch (e) {
                  console.error("Erro ao buscar imagem do item:", e);
                }
              }

              const itemHtml = `
                        <div class="item-carrinho bg-white rounded-lg shadow-sm p-3 border border-gray-200 mb-3">
                            <div class="flex items-start gap-3">
                                <!-- Imagem do item ou placeholder -->
                                <div class="item-imagem flex-shrink-0 w-[60px] h-[60px] rounded-md border border-gray-200 overflow-hidden">
                                    ${
                                      imagemSrc
                                        ? `<img src="${imagemSrc}" alt="${item.titulo}" class="w-full h-full object-cover" onerror="this.onerror=null; this.src='data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%23cccccc\'><path stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'1\' d=\'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z\' /></svg>';">`
                                        : `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="#cccccc" class="w-full h-full p-2"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>`
                                    }
                                </div>
                                <div class="flex-1">
                                    <div class="flex justify-between items-center mb-1">
                                        <h4 class="font-medium text-gray-900">${
                                          item.titulo
                                        }</h4>
                                        <button 
                                            type="button" 
                                            class="remover-item text-gray-400 hover:text-red-500 focus:outline-none"
                                            data-item-id="${item.id}"
                                            aria-label="Remover ${
                                              item.titulo
                                            } do carrinho"
                                            onclick="removerItemDoCarrinho('${
                                              item.id
                                            }')"
                                        >
                                            <i class="fas fa-trash-alt" style="font-size: 18px; color: #f87171;"></i>
                                        </button>
                                    </div>
                                     <!-- Controles de quantidade com botões de incremento/decremento -->
                                    <div class="flex items-center mb-2">
                                        <div class="flex items-center" role="group" aria-label="Controle de quantidade para ${
                                          item.titulo
                                        }">
                                            <button 
                                                type="button"
                                                class="quantidade-decremento flex items-center justify-center w-7 h-7 rounded-md bg-primary-dynamic text-white hover:bg-opacity-90 transition-all duration-200 focus:outline-none"
                                                data-item-id="${item.id}"
                                                aria-label="Diminuir quantidade"
                                                onclick="alterarQuantidadeItem('${
                                                  item.id
                                                }', -1); event.stopPropagation();"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-4 h-4">
                                                    <path stroke-linecap="round" stroke-linejoin="round" d="M5 12h14" />
                                                </svg>
                                            </button>
                                            <input 
                                                type="number" 
                                                min="1" 
                                                max="99" 
                                                value="${item.quantidade}" 
                                                class="quantidade-input mx-2 w-10 h-8 text-center border-0 bg-transparent focus:outline-none focus:ring-0 font-medium text-gray-700" 
                                                data-item-id="${item.id}" 
                                                aria-label="Quantidade de ${
                                                  item.titulo
                                                }"
                                                onchange="atualizarQuantidadeInput('${
                                                  item.id
                                                }', this.value); event.stopPropagation();"
                                            >
                                            <button 
                                                type="button"
                                                class="quantidade-incremento flex items-center justify-center w-7 h-7 rounded-md bg-primary-dynamic text-white hover:bg-opacity-90 transition-all duration-200 focus:outline-none"
                                                data-item-id="${item.id}"
                                                aria-label="Aumentar quantidade"
                                                onclick="alterarQuantidadeItem('${
                                                  item.id
                                                }', 1); event.stopPropagation();"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-4 h-4">
                                                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                    ${
                                      dadosGlobais.config[
                                        "Step-1-itens-obs"
                                      ] === "Sim"
                                        ? `
                                    <div class="mt-1">
                                        <label for="obs-${
                                          item.id
                                        }" class="block text-xs text-gray-600 mb-1">Observação:</label>
                                        <textarea 
                                            id="obs-${item.id}" 
                                            class="w-full text-sm border border-gray-300 rounded-md p-2 focus:ring-primary-dynamic focus:border-primary-dynamic" 
                                            placeholder="Ex: Sem cebola, bem passado, etc."
                                            rows="1"
                                            onchange="salvarObservacaoItem('${
                                              item.id
                                            }', this.value)"
                                        >${item.observacao || ""}</textarea>
                                    </div>
                                    `
                                        : ""
                                    }
                                </div>
                            </div>
                        </div>
                    `;

              // Adicionar ao container
              containerItens.insertAdjacentHTML("beforeend", itemHtml);
            });
          }

          // Liberar a variável de controle ao final da execução
          isRenderizandoCarrinho = false;
        } catch (error) {
          console.error("Erro ao renderizar itens do carrinho:", error);

          // Tentar recuperar de forma elegante
          try {
            // Exibir mensagem de erro genérica
            const containerItens = document.getElementById("carrinho-itens");
            if (containerItens) {
              containerItens.innerHTML = `
                            <div class="p-4 bg-red-50 border border-red-200 rounded-lg">
                                <p class="text-red-600 text-center">Não foi possível carregar os itens do seu carrinho.</p>
                                <p class="text-red-500 text-center text-sm mt-2">Tente novamente mais tarde ou entre em contato conosco.</p>
                            </div>
                        `;
            }
          } catch (innerError) {
            console.error("Erro ao criar mensagem de recuperação:", innerError);
          }

          // Garantir liberação da variável mesmo em caso de erro
          isRenderizandoCarrinho = false;
        }
      }

      // Função para salvar observação de um item
      function salvarObservacaoItem(id, observacao) {
        // Verificar se o campo de observação está habilitado na configuração
        if (dadosGlobais.config["Step-1-itens-obs"] !== "Sim") {
                    return;
        }

        
        // Obter carrinho do localStorage
        let carrinho = JSON.parse(localStorage.getItem("carrinho") || "[]");

        // Encontrar o item no carrinho
        const itemIndex = carrinho.findIndex((item) => item.id === id);

        if (itemIndex !== -1) {
          // Verificar se o item tem a propriedade observacao
          if ("observacao" in carrinho[itemIndex]) {
            // Atualizar a observação do item
            carrinho[itemIndex].observacao = observacao;

            // Salvar no localStorage
            localStorage.setItem("carrinho", JSON.stringify(carrinho));
                      } else {
                      }
        }
      }

      // Função para remover um item do carrinho
      function removerItemDoCarrinho(id) {
        
        try {
          let carrinho = JSON.parse(localStorage.getItem("carrinho") || "[]");

          // Encontrar o item para exibir mensagem e guardar sua quantidade
          const itemRemovido = carrinho.find((item) => item.id === id);
          const nomeItem = itemRemovido ? itemRemovido.titulo : "Item";
          const quantidadeRemovida = itemRemovido ? itemRemovido.quantidade : 0;

          // Remover item
          carrinho = carrinho.filter((item) => item.id !== id);

          // Atualizar variável global
          window.carrinho = carrinho;

          // Salvar no localStorage
          localStorage.setItem("carrinho", JSON.stringify(carrinho));

          // Verificar se o carrinho ficou vazio
          if (carrinho.length === 0) {
            // Se o carrinho ficou vazio, resetar o formulário
            resetarFormulario();

            // Voltar para o step 1
            mostrarStep(1);
          }

          // Atualizar interface
          atualizarContadorCarrinho();
          renderizarItensCarrinho();

          // Resetar estado visual do botão
          const botao = document.querySelector(
            `.adicionar-ao-carrinho[data-item-id="${id}"]`
          );
          if (botao) {
            botao.textContent = "Adicionar ao Carrinho";
            botao.classList.remove("adicionado");
          }

          // Atualizar o contador no título do carrinho
          const totalItensCarrinho = document.getElementById(
            "total-itens-carrinho"
          );
          if (totalItensCarrinho) {
            // Calcular o total de itens somando todas as quantidades
            const totalItens = carrinho.reduce(
              (acc, item) => acc + item.quantidade,
              0
            );
            totalItensCarrinho.textContent = totalItens;
                      }

          // Exibir mensagem de feedback
          const mensagem = document.createElement("div");
          mensagem.className =
            "fixed bottom-4 right-4 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded shadow-lg z-50 animate-fade-in-out";
          mensagem.innerHTML = `<p><strong>${nomeItem}</strong> removido do carrinho</p>`;
          document.body.appendChild(mensagem);

          // Remover mensagem após 2 segundos
          setTimeout(() => {
            mensagem.classList.add("animate-fade-out");
            setTimeout(() => mensagem.remove(), 500);
          }, 2000);
        } catch (error) {
          console.error("Erro ao remover item do carrinho:", error);
          alert(
            "Ocorreu um erro ao remover o item do carrinho. Por favor, tente novamente."
          );
        }
      }

      // Função para alterar a quantidade de um item no carrinho
      function alterarQuantidadeItem(id, delta) {
        
        try {
          // Obter carrinho do localStorage
          let carrinho = JSON.parse(localStorage.getItem("carrinho") || "[]");

          // Encontrar o item no carrinho
          const itemIndex = carrinho.findIndex((item) => item.id === id);

          if (itemIndex === -1) {
            console.error("Item não encontrado no carrinho");
            return;
          }

          // Alterar quantidade
          carrinho[itemIndex].quantidade += delta;

          // Garantir que a quantidade esteja entre 1 e 99
          if (carrinho[itemIndex].quantidade < 1) {
            carrinho[itemIndex].quantidade = 1;
          } else if (carrinho[itemIndex].quantidade > 99) {
            carrinho[itemIndex].quantidade = 99;
          }

          // Atualizar variável global e localStorage
          window.carrinho = carrinho;
          localStorage.setItem("carrinho", JSON.stringify(carrinho));

          // Atualizar interface
          atualizarContadorCarrinho();

          // Atualizar diretamente os campos de entrada de quantidade
          const quantidadeInputs = document.querySelectorAll(
            `.quantidade-input[data-item-id="${id}"]`
          );
          quantidadeInputs.forEach((input) => {
            input.value = carrinho[itemIndex].quantidade;
          });

          // Atualizar o contador no título do carrinho
          const totalItensCarrinho = document.getElementById(
            "total-itens-carrinho"
          );
          if (totalItensCarrinho) {
            // Calcular o total de itens somando todas as quantidades
            const totalItens = carrinho.reduce(
              (acc, item) => acc + item.quantidade,
              0
            );
            totalItensCarrinho.textContent = totalItens;
                      }

          // Feedback visual temporário
          const mensagem = document.createElement("div");
          mensagem.className =
            "fixed bottom-4 right-4 bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 rounded shadow-lg z-50 animate-fade-in-out";
          mensagem.innerHTML = `<p>Quantidade de <strong>${carrinho[itemIndex].titulo}</strong> atualizada para ${carrinho[itemIndex].quantidade}</p>`;
          document.body.appendChild(mensagem);
          setTimeout(() => {
            mensagem.classList.add("animate-fade-out");
            setTimeout(() => mensagem.remove(), 500);
          }, 2000);
        } catch (error) {
          console.error("Erro ao alterar quantidade do item:", error);
          alert(
            "Ocorreu um erro ao alterar a quantidade. Por favor, tente novamente."
          );
        }
      }

      // Função para atualizar a quantidade a partir do campo de entrada
      function atualizarQuantidadeInput(id, novaQuantidade) {
        
        try {
          // Converter para número e validar
          let quantidade = parseInt(novaQuantidade);

          // Validar quantidade
          if (isNaN(quantidade) || quantidade < 1) {
            quantidade = 1;
          } else if (quantidade > 99) {
            quantidade = 99;
          }

          // Obter carrinho do localStorage
          let carrinho = JSON.parse(localStorage.getItem("carrinho") || "[]");

          // Encontrar o item no carrinho
          const itemIndex = carrinho.findIndex((item) => item.id === id);

          if (itemIndex === -1) {
            console.error("Item não encontrado no carrinho");
            return;
          }

          // Atualizar quantidade
          carrinho[itemIndex].quantidade = quantidade;

          // Atualizar variável global
          window.carrinho = carrinho;

          // Salvar no localStorage
          localStorage.setItem("carrinho", JSON.stringify(carrinho));

          // Atualizar interface
          atualizarContadorCarrinho();

          // Atualizar diretamente os campos de entrada de quantidade
          const quantidadeInputs = document.querySelectorAll(
            `.quantidade-input[data-item-id="${id}"]`
          );
          quantidadeInputs.forEach((input) => {
            input.value = quantidade;
          });

          // Atualizar o contador no título do carrinho
          const totalItensCarrinho = document.getElementById(
            "total-itens-carrinho"
          );
          if (totalItensCarrinho) {
            // Calcular o total de itens somando todas as quantidades
            const totalItens = carrinho.reduce(
              (acc, item) => acc + item.quantidade,
              0
            );
            totalItensCarrinho.textContent = totalItens;
                      }

          // Atualizar estado dos botões de decremento
          const decrementoButtons = document.querySelectorAll(
            `.quantidade-decremento[data-item-id="${id}"]`
          );
          decrementoButtons.forEach((btn) => {
            if (quantidade <= 1) {
              btn.setAttribute("disabled", "");
              btn.classList.add("opacity-50", "cursor-not-allowed");
            } else {
              btn.removeAttribute("disabled");
              btn.classList.remove("opacity-50", "cursor-not-allowed");
            }
          });

          // Exibir mensagem de feedback
          const mensagem = document.createElement("div");
          mensagem.className =
            "fixed bottom-4 right-4 bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 rounded shadow-lg z-50 animate-fade-in-out";
          mensagem.innerHTML = `<p>Quantidade de <strong>${carrinho[itemIndex].titulo}</strong> atualizada para ${quantidade}</p>`;
          document.body.appendChild(mensagem);

          // Remover mensagem após 2 segundos
          setTimeout(() => {
            mensagem.classList.add("animate-fade-out");
            setTimeout(() => mensagem.remove(), 500);
          }, 2000);
        } catch (error) {
          console.error("Erro ao atualizar quantidade do item:", error);
          alert(
            "Ocorreu um erro ao atualizar a quantidade. Por favor, tente novamente."
          );
        }
      }

      // Função para incrementar a quantidade no card do item
      function incrementarQuantidadeCard(button) {
        const itemId = button.getAttribute("data-item-id");
        const inputElement = button.parentNode.querySelector(
          `.quantidade-input[data-item-id="${itemId}"]`
        );

        if (!inputElement) {
          console.error("Elemento de input não encontrado");
          return;
        }

        let quantidade = parseInt(inputElement.value || 1);
        if (isNaN(quantidade)) quantidade = 1;

        // Incrementar quantidade
        quantidade = Math.min(quantidade + 1, 99);
        inputElement.value = quantidade;
      }

      // Função para decrementar a quantidade no card do item
      function decrementarQuantidadeCard(button) {
        const itemId = button.getAttribute("data-item-id");
        const inputElement = button.parentNode.querySelector(
          `.quantidade-input[data-item-id="${itemId}"]`
        );
        if (!inputElement) {
          console.error("Elemento de input não encontrado");
          return;
        }

        let quantidade = parseInt(inputElement.value || 1);
        if (isNaN(quantidade)) quantidade = 1;

        // Limitar a quantidade mínima a 1
        quantidade = Math.max(quantidade - 1, 1);
        inputElement.value = quantidade;

        // Botão de decremento sempre habilitado
        // Removemos a desabilitação quando quantidade = 1
      }

      // Função para limpar todo o carrinho
      function limparCarrinho() {
        
        // Confirmar com o usuário
        if (
          confirm("Tem certeza que deseja remover todos os itens do carrinho?")
        ) {
          try {
            // Limpar o carrinho usando o objeto Carrinho se disponível
            if (typeof Carrinho === "object" && Carrinho.limpar) {
              Carrinho.limpar();
                          } else {
              // Fallback: limpar localStorage diretamente
              localStorage.removeItem("carrinho");
                          }

            // Garantir que o carrinho global seja limpo
            window.carrinho = [];

            // Resetar formulário e opções
            resetarFormulario();

            // Atualizar contador e interface
            atualizarContadorCarrinho();

            // Atualizar o contador no título do carrinho
            const totalItensCarrinho = document.getElementById(
              "total-itens-carrinho"
            );
            if (totalItensCarrinho) {
              totalItensCarrinho.textContent = "0";
                          }

            // Renderizar o carrinho vazio (isso vai criar a mensagem de carrinho vazio)
            renderizarItensCarrinho();

            // Manter o botão do carrinho visível, mas atualizar sua aparência
            const botaoCarrinho = document.getElementById("botao-carrinho");
            if (botaoCarrinho) {
              const contadorCarrinho =
                botaoCarrinho.querySelector("#carrinho-contador");
              if (contadorCarrinho) {
                contadorCarrinho.textContent = "0";
              }
              botaoCarrinho.style.opacity = "1"; // Sempre opacidade total
              botaoCarrinho.style.display = "flex";
              botaoCarrinho.classList.remove("hidden");
            }

            // Exibir mensagem de feedback
            const mensagem = document.createElement("div");
            mensagem.className =
              "fixed top-4 right-4 bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded shadow-lg z-50 animate-fade-in-out";
            mensagem.innerHTML = `<p class="flex items-center"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg><strong>Carrinho limpo com sucesso!</strong></p>`;
            document.body.appendChild(mensagem);

            // Remover mensagem após 2 segundos
            setTimeout(() => {
              mensagem.classList.add("animate-fade-out");
              setTimeout(() => mensagem.remove(), 500);
            }, 2000);

            // Voltar para o step 1
            mostrarStep(1);

            // Garantir que o scroll da página continue funcionando
            document.body.style.overflow = "";
            document.body.classList.remove("overflow-hidden");

                      } catch (error) {
            console.error("Erro ao limpar o carrinho:", error);
            alert(
              "Ocorreu um erro ao limpar o carrinho. Por favor, tente novamente."
            );
          }
        }
      }

      // Variável para controlar o step atual
      let stepAtual = 1;

      // Variável para armazenar a forma de pagamento selecionada
      let formaPagamentoSelecionada = "";

      // Função para mostrar um step específico
      function mostrarStep(numero) {
        try {
          // Validar se o número do step é válido (1, 2 ou 3)
          if (!numero || isNaN(numero) || numero < 1 || numero > 3) {
            console.error(
              `Número de step inválido: ${numero}, usando step 1 como fallback`
            );
            numero = 1; // Valor padrão seguro
          }

                    stepAtual = numero; // Atualizar variável global

          // Esconder todos os steps
          document.querySelectorAll(".step").forEach((step) => {
            step.classList.add("hidden");
          });

          // Mostrar o step solicitado
          const stepAtualElement = document.getElementById(`step-${numero}`);
          if (stepAtualElement) {
            stepAtualElement.classList.remove("hidden");
          } else {
            console.error(`Elemento step-${numero} não encontrado`);
          }

          // Atualizar indicadores de progresso
          atualizarIndicadoresProgresso(numero);

          // Atualizar botões de navegação
          const botaoVoltar = document.getElementById("botao-voltar");
          const botaoContinuar = document.getElementById("botao-continuar");
          const botaoEnviar = document.getElementById("botao-enviar");

          if (botaoVoltar && botaoContinuar && botaoEnviar) {
            // Step 1: Mostrar apenas botão Continuar
            if (numero === 1) {
              botaoVoltar.classList.add("hidden");
              botaoContinuar.classList.remove("hidden");
              botaoEnviar.classList.add("hidden");

              try {
                // Verificar se há itens no carrinho para habilitar/desabilitar o botão continuar
                const carrinho = JSON.parse(
                  localStorage.getItem("carrinho") || "[]"
                );
                if (carrinho.length > 0) {
                  botaoContinuar.disabled = false;
                  botaoContinuar.classList.remove(
                    "opacity-50",
                    "cursor-not-allowed"
                  );
                } else {
                  botaoContinuar.disabled = true;
                  botaoContinuar.classList.add(
                    "opacity-50",
                    "cursor-not-allowed"
                  );
                }
              } catch (e) {
                console.error("Erro ao verificar carrinho no mostrarStep:", e);
              }
            }
            // Step 2: Mostrar botão Voltar e Continuar (desabilitado até selecionar opção)
            else if (numero === 2) {
              botaoVoltar.classList.remove("hidden");
              botaoContinuar.classList.remove("hidden");
              botaoEnviar.classList.add("hidden");

              // Desabilitar botão continuar até que uma opção seja selecionada
              botaoContinuar.disabled = !opcaoEntregaSelecionada;
              if (!opcaoEntregaSelecionada) {
                botaoContinuar.classList.add(
                  "opacity-50",
                  "cursor-not-allowed"
                );
              } else {
                botaoContinuar.classList.remove(
                  "opacity-50",
                  "cursor-not-allowed"
                );
              }
            }
            // Step 3: Mostrar botão Voltar e Enviar
            else if (numero === 3) {
              botaoVoltar.classList.remove("hidden");
              botaoContinuar.classList.add("hidden");
              botaoEnviar.classList.remove("hidden");

              // Mostrar campos específicos baseados na opção selecionada
              mostrarCamposEspecificos();
            }
          }
        } catch (e) {
          console.error("Erro ao mostrar step:", e);
          // Garantir uma recuperação segura em caso de erro
          stepAtual = 1;
          document
            .querySelectorAll(".step")
            .forEach((step) => step.classList.add("hidden"));
          const step1 = document.getElementById("step-1");
          if (step1) step1.classList.remove("hidden");
        }
      }

      // Função para atualizar os indicadores de progresso
      function atualizarIndicadoresProgresso(stepAtual) {
        // Resetar todos os indicadores
        for (let i = 1; i <= 3; i++) {
          const indicator = document.getElementById(`step-indicator-${i}`);
          if (indicator) {
            // Se for o step atual ou anterior, marcar como concluído
            if (i <= stepAtual) {
              indicator.classList.remove("bg-gray-200", "text-gray-500");
              indicator.classList.add("bg-primary-dynamic", "text-white");
            } else {
              indicator.classList.add("bg-gray-200", "text-gray-500");
              indicator.classList.remove("bg-primary-dynamic", "text-white");
            }
          }
        }

        // Atualizar as linhas de progresso
        for (let i = 1; i <= 2; i++) {
          const progressLine = document.getElementById(`progress-line-${i}`);
          if (progressLine) {
            if (stepAtual > i) {
              // Se já passou deste step, preencher 100%
              progressLine.style.width = "100%";
            } else if (stepAtual === i) {
              // Se está neste step, preencher 50%
              progressLine.style.width = "50%";
            } else {
              // Se ainda não chegou neste step, preencher 0%
              progressLine.style.width = "0%";
            }
          }
        }
      }

      // Função para avançar para o próximo step
      function avancarStep() {
        
        // Verificar se há itens no carrinho
        const carrinho = JSON.parse(localStorage.getItem("carrinho") || "[]");
        if (carrinho.length === 0) {
          alert("Adicione itens ao carrinho para continuar.");
          return;
        }

        // Validações específicas para o step 2
        if (stepAtual === 2 && !opcaoEntregaSelecionada) {
          alert("Selecione uma opção de entrega para continuar.");
          return;
        }

        // Avançar para o próximo step sequencialmente
        stepAtual++;
        mostrarStep(stepAtual);

        // Se avançou para o step 3, configurar os campos específicos
        if (stepAtual === 3) {
          // Popular o formulário de forma de pagamento
          const formaPagamentoSelect =
            document.getElementById("forma-pagamento");
          if (formaPagamentoSelect) {
            popularFormasPagamento(formaPagamentoSelect);
          }

          // Mostrar campos específicos baseados na opção selecionada
          mostrarCamposEspecificos();
        }
      }

      // Função para voltar ao step anterior
      function voltarStep() {
        try {
          
          // Verificar se estamos no primeiro step
          if (stepAtual <= 1) {
            stepAtual = 1; // Garantir que não seja menor que 1
          } else {
            stepAtual--;
          }

          // Mostrar o step correto
          mostrarStep(stepAtual);

          // Verificar se há itens no carrinho para habilitar o botão continuar
          if (stepAtual === 1) {
            try {
              const carrinho = JSON.parse(
                localStorage.getItem("carrinho") || "[]"
              );
              const botaoContinuar = document.getElementById("botao-continuar");

              if (botaoContinuar) {
                if (carrinho.length > 0) {
                  // Habilitar botão se houver itens no carrinho
                  botaoContinuar.disabled = false;
                  botaoContinuar.classList.remove(
                    "opacity-50",
                    "cursor-not-allowed"
                  );
                } else {
                  // Desabilitar botão se o carrinho estiver vazio
                  botaoContinuar.disabled = true;
                  botaoContinuar.classList.add(
                    "opacity-50",
                    "cursor-not-allowed"
                  );
                }
              }
            } catch (e) {
              console.error("Erro ao verificar carrinho:", e);
            }
          }
        } catch (e) {
          console.error("Erro ao voltar para o step anterior:", e);
        }
      }

      // Função para resetar o formulário
      function resetarFormulario() {
        
        // Limpar campos do formulário
        const formCliente = document.getElementById("form-cliente");
        if (formCliente) {
          formCliente.reset();
        }

        // Limpar observações dos itens
        const textareas = document.querySelectorAll('textarea[id^="obs-"]');
        textareas.forEach((textarea) => {
          textarea.value = "";
        });

        // Resetar opção de entrega selecionada
        opcaoEntregaSelecionada = "";

        // Resetar a forma de pagamento selecionada
        formaPagamentoSelecionada = "";

        // Resetar visual dos radio buttons
        document.querySelectorAll(".radio-circle").forEach((radio) => {
          radio.classList.remove("selected");
        });

        // Desabilitar botão continuar no step 2
        const botaoContinuar = document.getElementById("botao-continuar");
        if (botaoContinuar) {
          botaoContinuar.disabled = true;
          botaoContinuar.classList.add("opacity-50", "cursor-not-allowed");
        }
      }

      // Variável para armazenar a opção de entrega selecionada
      let opcaoEntregaSelecionada = "";

      // Função para selecionar opção de entrega
      // Função para carregar opções de entrega da planilha
      function carregarOpcoesEntrega(config) {
        const opcoesEntregaContainer =
          document.getElementById("opcoes-entrega");
        if (!opcoesEntregaContainer) return;

        // Limpar opções existentes
        opcoesEntregaContainer.innerHTML = "";

        // Ícones para cada tipo de opção
        const icones = {
          local: "fa-utensils",
          retirada: "fa-shopping-bag",
          delivery: "fa-motorcycle",
          padrao: "fa-box",
        };

        // Tipos de opções e seus IDs
        const opcoesConfig = [
          { campo: "Step-2-opc-1", id: "local" },
          { campo: "Step-2-opc-2", id: "retirada" },
          { campo: "Step-2-opc-3", id: "delivery" },
          { campo: "Step-2-opc-4", id: "padrao" },
        ];

        // Processar cada opção
        opcoesConfig.forEach((opcao) => {
          const valorConfig = config[opcao.campo];
          if (!valorConfig) return;

          // Dividir o valor em partes (Sim/Não, Label Principal, Label Secundário)
          const partes = valorConfig.split("/");
          if (partes.length < 2) return;

          const disponivel = partes[0].trim().toLowerCase() === "sim";
          if (!disponivel) return; // Pular se não estiver disponível

          const labelPrincipal = partes[1].trim();
          const labelSecundario = partes.length > 2 ? partes[2].trim() : "";

          // Criar elemento da opção
          const divOpcao = document.createElement("div");
          divOpcao.className =
            "opcao-entrega border border-gray-300 rounded-lg p-4 cursor-pointer hover:bg-gray-50 transition-colors";
          divOpcao.onclick = function () {
            selecionarOpcaoEntrega(opcao.id);
          };

          divOpcao.innerHTML = `
                    <div class="flex items-center">
                        <div class="flex-shrink-0 mr-3">
                            <i class="fas ${
                              icones[opcao.id]
                            } h-6 w-6 text-primary-dynamic"></i>
                        </div>
                        <div>
                            <h5 class="font-medium">${labelPrincipal}</h5>
                            <p class="text-sm text-gray-600 text-color-dynamic">${labelSecundario}</p>
                        </div>
                        <div class="ml-auto">
                            <div class="radio-circle" id="radio-${
                              opcao.id
                            }"></div>
                        </div>
                    </div>
                `;

          opcoesEntregaContainer.appendChild(divOpcao);
        });

        // Se não houver opções, mostrar mensagem
        if (opcoesEntregaContainer.children.length === 0) {
          opcoesEntregaContainer.innerHTML = `
                    <div class="text-center text-gray-500 py-8">
                        <p class="text-lg">Nenhuma opção de entrega disponível</p>
                        <p class="mt-2">Entre em contato com o estabelecimento</p>
                    </div>
                `;
        }
      }

      // Variável para armazenar se a opção 4 foi selecionada
      let opcaoEntregaPadrao = false;

      function selecionarOpcaoEntrega(opcao) {
                opcaoEntregaSelecionada = opcao;

        // Verificar se é a opção 4 (padrão)
        opcaoEntregaPadrao = opcao === "padrao";

        // Resetar todos os radio buttons
        document.querySelectorAll(".radio-circle").forEach((radio) => {
          radio.classList.remove("selected");
        });

        // Marcar o radio button selecionado
        document.getElementById(`radio-${opcao}`).classList.add("selected");

        // Habilitar botão continuar
        document.getElementById("botao-continuar").disabled = false;
        document
          .getElementById("botao-continuar")
          .classList.remove("opacity-50", "cursor-not-allowed");

        // Mostrar ou esconder a mensagem de taxa de entrega
        const mensagemTaxaEntrega = document.getElementById(
          "mensagem-taxa-entrega"
        );
        if (opcao === "delivery") {
          mensagemTaxaEntrega.classList.remove("hidden");
        } else {
          mensagemTaxaEntrega.classList.add("hidden");
        }
      }

      // Função para popular o campo de formas de pagamento
      function popularFormasPagamento(selectElement) {
        // Usar o elemento passado como parâmetro ou buscar o elemento padrão
        const selectFormaPagamento =
          selectElement || document.getElementById("forma-pagamento");
        if (!selectFormaPagamento) return;

        // Salvar o valor atual antes de limpar (se houver)
        const valorAtual =
          selectFormaPagamento.value || formaPagamentoSelecionada;

        // Limpar opções existentes, mantendo apenas a opção padrão
        while (selectFormaPagamento.options.length > 1) {
          selectFormaPagamento.remove(1);
        }

        // Obter as formas de pagamento da configuração
        const formasPagamentoConfig =
          dadosGlobais.config["Step-3-formas-de-pag"];
        if (formasPagamentoConfig) {
          // Dividir a string por vírgulas e remover espaços em branco
          const formasPagamento = formasPagamentoConfig
            .split(",")
            .map((forma) => forma.trim());

          // Adicionar cada forma de pagamento como uma opção
          formasPagamento.forEach((forma) => {
            const option = document.createElement("option");
            option.value = forma.toLowerCase().replace(/\s+/g, "-"); // Converter para slug
            option.textContent = forma;
            selectFormaPagamento.appendChild(option);
          });

                  } else {
          console.warn("Configuração de formas de pagamento não encontrada");

          // Adicionar opções padrão caso não haja configuração
          const formasPadrao = [
            "Dinheiro",
            "Pix",
            "Cartão de Crédito",
            "Cartão de Débito",
          ];
          formasPadrao.forEach((forma) => {
            const option = document.createElement("option");
            option.value = forma.toLowerCase().replace(/\s+/g, "-");
            option.textContent = forma;
            selectFormaPagamento.appendChild(option);
          });
        }

        // Adicionar evento change para salvar a seleção atual
        if (!selectFormaPagamento.hasAttribute("data-event-attached")) {
          selectFormaPagamento.addEventListener("change", function () {
            formaPagamentoSelecionada = this.value;
                      });
          selectFormaPagamento.setAttribute("data-event-attached", "true");
        }

        // Restaurar o valor selecionado anteriormente, se existir
        if (valorAtual && valorAtual !== "") {
          // Verificar se o valor existe nas opções
          let valorExiste = false;
          for (let i = 0; i < selectFormaPagamento.options.length; i++) {
            if (selectFormaPagamento.options[i].value === valorAtual) {
              valorExiste = true;
              break;
            }
          }

          if (valorExiste) {
            selectFormaPagamento.value = valorAtual;
                      } else {
            console.warn(
              "Valor anterior não encontrado nas opções atuais:",
              valorAtual
            );
          }
        }
      }

      // Função para validar que o campo mesa-comanda só aceite números
      function configurarCampoMesaComanda() {
        const inputMesaComanda = document.getElementById("mesa-comanda");
        if (inputMesaComanda) {
          // Remove qualquer listener anterior para evitar duplicidades
          const novoInput = inputMesaComanda.cloneNode(true);
          inputMesaComanda.parentNode.replaceChild(novoInput, inputMesaComanda);

          // Adiciona evento para filtrar entrada de texto e permitir apenas números
          novoInput.addEventListener("input", function (e) {
            // Remove qualquer caractere que não seja número
            this.value = this.value.replace(/[^0-9]/g, "");
          });

          // Impedir cole de texto não numérico
          novoInput.addEventListener("paste", function (e) {
            // Captura o texto colado
            let paste = (e.clipboardData || window.clipboardData).getData(
              "text"
            );
            // Verifica se contém apenas números
            if (!/^\d+$/.test(paste)) {
              e.preventDefault();
                          }
          });

                  }
      }

      // Função para mostrar campos específicos no step 3
      function mostrarCamposEspecificos() {
        
        try {
          // Esconder todos os campos específicos
          document.querySelectorAll(".campos-opcao").forEach((campo) => {
            campo.classList.add("hidden");
          });

          // Verificar se existe opcaoEntregaSelecionada válida
          if (!opcaoEntregaSelecionada) {
            console.warn("Nenhuma opção de entrega selecionada!");
            return;
          }

          // Mostrar campos específicos para a opção selecionada
          if (opcaoEntregaSelecionada === "local") {
            const camposLocal = document.getElementById("campos-local");
            if (camposLocal) {
              camposLocal.classList.remove("hidden");
            }

            // Verificar se o campo Mesa/Comanda deve ser exibido
            const containerMesaComanda = document.getElementById(
              "container-mesa-comanda"
            );
            if (containerMesaComanda) {
              // Verificar se dados globais estão disponíveis
              let mesaComandaAtivado = true; // valor padrão se configuração não estiver disponível

              if (
                window.dadosGlobais &&
                dadosGlobais.config &&
                dadosGlobais.config["Step-3-mesa-comanda"]
              ) {
                mesaComandaAtivado =
                  dadosGlobais.config["Step-3-mesa-comanda"] === "Sim";
              }

              containerMesaComanda.style.display = mesaComandaAtivado
                ? "block"
                : "none";

              // Se o campo estiver desativado, remover o atributo required
              const inputMesaComanda = document.getElementById("mesa-comanda");
              if (inputMesaComanda) {
                if (mesaComandaAtivado) {
                  inputMesaComanda.setAttribute("required", "");
                  // Configurar campo para aceitar apenas números
                  try {
                    configurarCampoMesaComanda();
                  } catch (err) {
                    console.error(
                      "Erro ao configurar campo mesa-comanda:",
                      err
                    );
                  }
                } else {
                  inputMesaComanda.removeAttribute("required");
                }
              }
            }
          } else if (opcaoEntregaSelecionada === "delivery") {
            const camposDelivery = document.getElementById("campos-delivery");
            if (camposDelivery) {
              camposDelivery.classList.remove("hidden");

              // Configurar os campos de endereço
              const inputCep = document.getElementById("cep");
              const btnBuscarCep = document.getElementById("buscar-cep");
              const inputNumero = document.getElementById("numero");
              const inputComplemento = document.getElementById("complemento");

              // Remover os event listeners anteriores para evitar duplicação
              function resetEventListeners(element, events) {
                if (!element) return;

                // Clonar o elemento para remover todos os event listeners
                const newElement = element.cloneNode(true);
                element.parentNode.replaceChild(newElement, element);
                return newElement;
              }

              // Resetar e reconfigurar o input CEP
              if (inputCep) {
                const newInputCep = resetEventListeners(inputCep);

                // Configurar formatação do CEP
                newInputCep.addEventListener("input", function () {
                  formatarCep(this);
                });

                // Buscar CEP ao sair do campo
                newInputCep.addEventListener("blur", function () {
                  if (this.value.replace(/\D/g, "").length === 8) {
                    buscarCep(this.value);
                  }
                });
              }

              // Resetar e reconfigurar o botão de buscar CEP
              if (btnBuscarCep) {
                const newBtnBuscarCep = resetEventListeners(btnBuscarCep);

                newBtnBuscarCep.addEventListener("click", function () {
                  const cep = document.getElementById("cep").value;
                  if (cep) {
                    buscarCep(cep);
                  } else {
                    mostrarFeedbackCep("Por favor, informe um CEP", "erro");
                  }
                });
              }

              // Adicionar eventos para atualizar o endereço completo quando os campos forem alterados
              const camposEndereco = [
                "endereco",
                "numero",
                "complemento",
                "bairro",
                "cidade",
                "estado",
              ];
              camposEndereco.forEach((campo) => {
                const input = document.getElementById(campo);
                if (input) {
                  // Remover listeners antigos e adicionar novos
                  const newInput = resetEventListeners(input);
                  if (newInput) {
                    newInput.addEventListener(
                      "input",
                      atualizarEnderecoCompleto
                    );
                    newInput.addEventListener(
                      "change",
                      atualizarEnderecoCompleto
                    );
                  }
                }
              });

              // Inicializar o campo oculto de endereço completo
              // Com um pequeno delay para garantir que todos os campos estejam prontos
              setTimeout(atualizarEnderecoCompleto, 100);
            }
          }
          // Para 'retirada' não há campos específicos, apenas os comuns

          // Verificar se o campo de formas de pagamento deve ser exibido
          const containerFormaPagamento = document.getElementById(
            "container-forma-pagamento"
          );
          if (containerFormaPagamento) {
            // Verificar se dados globais estão disponíveis
            let mostrarFormaPagamento = true; // valor padrão se configuração não estiver disponível

            // Primeiro verificar se é a opção "Consumo no Local"
            if (opcaoEntregaSelecionada === "local") {
              // Se for "Consumo no Local", NUNCA mostrar o campo de forma de pagamento
              mostrarFormaPagamento = false;
              
              // Ocultar também os campos relacionados ao troco
              const containerTroco = document.getElementById("container-troco");
              const campoValorTroco =
                document.getElementById("campo-valor-troco");

              if (containerTroco) {
                containerTroco.classList.add("hidden");
              }

              if (campoValorTroco) {
                campoValorTroco.classList.add("hidden");
              }

                          } else {
              // Para as outras opções (delivery/retirada), verificar a configuração da planilha
              if (
                window.dadosGlobais &&
                dadosGlobais.config &&
                dadosGlobais.config["Step-3-show-formas-de-pag"]
              ) {
                mostrarFormaPagamento =
                  dadosGlobais.config["Step-3-show-formas-de-pag"] === "Sim";
              }

              // Caso as outras opções mostrem forma de pagamento, precisamos atualizar o status do campo de troco
              // mas apenas se a forma de pagamento for exibida
              if (mostrarFormaPagamento) {
                try {
                  // Atualiza o campo de troco baseado na forma de pagamento atual
                  verificarFormaPagamento();
                } catch (err) {
                  console.error("Erro ao verificar forma de pagamento:", err);
                }
              }
            }
            containerFormaPagamento.style.display = mostrarFormaPagamento
              ? "block"
              : "none";

            // Se o campo estiver visível, popular as opções
            const formaPagamentoSelect =
              document.getElementById("forma-pagamento");
            if (formaPagamentoSelect) {
              // Remover ou adicionar o atributo required conforme visibilidade
              if (mostrarFormaPagamento) {
                formaPagamentoSelect.setAttribute("required", "");
                try {
                  popularFormasPagamento(formaPagamentoSelect);

                  // Configurar evento para verificar forma de pagamento
                  formaPagamentoSelect.addEventListener(
                    "change",
                    verificarFormaPagamento
                  );

                  // Inicializar campos de troco
                  verificarFormaPagamento();

                  // Configurar eventos para os radio buttons de troco
                  const radioSim = document.querySelector(
                    'input[name="precisa-troco"][value="sim"]'
                  );
                  const radioNao = document.querySelector(
                    'input[name="precisa-troco"][value="nao"]'
                  );
                  if (radioSim && radioNao) {
                    radioSim.addEventListener("change", function () {
                      mostrarCampoTroco(true);
                    });
                    radioNao.addEventListener("change", function () {
                      mostrarCampoTroco(false);
                    });

                    // Inicializar o campo de valor do troco baseado na seleção atual
                    if (radioSim.checked) {
                      mostrarCampoTroco(true);
                    } else {
                      mostrarCampoTroco(false);
                    }
                  }
                } catch (e) {
                  console.error("Erro ao popular formas de pagamento:", e);
                }
              } else {
                formaPagamentoSelect.removeAttribute("required");
              }
            }
          }
        } catch (e) {
          console.error("Erro ao mostrar campos específicos:", e);
        }
      }

      // Função para finalizar o pedido
      function finalizarPedido() {
        
        // Obter dados do formulário
        const nomeCliente = document
          .getElementById("nome-cliente")
          .value.trim();
        const observacaoGeral = document
          .getElementById("observacao-geral")
          .value.trim();

        // Obter dados específicos conforme opção selecionada
        let mesaComanda = "";
        let enderecoEntrega = "";

        if (opcaoEntregaSelecionada === "local") {
          mesaComanda = document.getElementById("mesa-comanda").value.trim();
        } else if (opcaoEntregaSelecionada === "delivery") {
          enderecoEntrega = document
            .getElementById("endereco-entrega")
            .value.trim();

          // Validar endereço para delivery
          if (!enderecoEntrega) {
            alert("Por favor, informe o endereço de entrega para continuar.");
            document.getElementById("endereco-entrega").focus();
            return;
          }
        }

        // Validar nome do cliente (obrigatório)
        if (!nomeCliente) {
          alert("Por favor, informe seu nome para continuar.");
          document.getElementById("nome-cliente").focus();
          return;
        }

        // Obter itens do carrinho
        const carrinho = JSON.parse(localStorage.getItem("carrinho") || "[]");
        if (carrinho.length === 0) {
          alert(
            "Seu carrinho está vazio. Adicione itens para fazer um pedido."
          );
          mostrarStep(1);
          return;
        }

        // Montar mensagem do pedido com emojis e melhor formatação
        let mensagem = `🔔 *NOVO PEDIDO* 🔔\n\n`;

        // Data e hora do pedido
        const agora = new Date();
        const dataFormatada = agora.toLocaleDateString("pt-BR");
        const horaFormatada = agora.toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
        });
        mensagem += `📅 *Data*: ${dataFormatada}\n⏰ *Hora*: ${horaFormatada}\n\n`;

        // Dados do cliente
        mensagem += `👤 *DADOS DO CLIENTE*\n`;
        mensagem += `➡️ *Nome*: ${nomeCliente}\n`;

        // Verificar se o campo de formas de pagamento deve ser exibido
        let mostrarFormaPagamento =
          dadosGlobais.config["Step-3-show-formas-de-pag"] === "Sim";

        // Verificar se Step-2-opc-1 é "Sim" e se a opção selecionada é "local" (Consumo no Local)
        if (
          opcaoEntregaSelecionada === "local" &&
          dadosGlobais.config["Step-2-opc-1"] === "Sim"
        ) {
          mostrarFormaPagamento = false;
        }

        if (mostrarFormaPagamento) {
          const formaPagamento = document.getElementById("forma-pagamento");
          if (
            formaPagamento &&
            formaPagamento.value &&
            formaPagamento.value !== ""
          ) {
            const formaPagamentoTexto =
              formaPagamento.options[formaPagamento.selectedIndex].text;
            mensagem += `💳 *Pagamento*: ${formaPagamentoTexto}\n`;

            // Verificar se é pagamento em dinheiro e se precisa de troco
            if (formaPagamento.value.toLowerCase() === "dinheiro") {
              const precisaTroco = document.querySelector(
                'input[name="precisa-troco"]:checked'
              );
              if (precisaTroco && precisaTroco.value === "sim") {
                const valorTroco = document.getElementById("valor-troco");
                if (valorTroco && valorTroco.value.trim()) {
                  mensagem += `💰 *Troco para*: R$ ${valorTroco.value.trim()}\n`;
                } else {
                  mensagem += `💰 *Precisa de troco*: Sim\n`;
                }
              } else if (precisaTroco) {
                mensagem += `💰 *Precisa de troco*: Não\n`;
              }
            }
          }
        }

        // Método de envio e dados específicos
        if (opcaoEntregaSelecionada === "local") {
          mensagem += `\n🍽️ *Consumo no Local*\n`;
          // Verificar se o campo mesa-comanda existe e está preenchido
          const inputMesaComanda = document.getElementById("mesa-comanda");
          if (inputMesaComanda && inputMesaComanda.value.trim()) {
            mensagem += `📌 *Mesa/Comanda*: ${inputMesaComanda.value.trim()}\n`;
          } else if (mesaComanda) {
            // Usar o valor já capturado no início da função
            mensagem += `📌 *Mesa/Comanda*: ${mesaComanda}\n`;
          }
        } else if (opcaoEntregaSelecionada === "delivery") {
          mensagem += `\n🚗 *Entrega - Delivery*\n`;
          if (enderecoEntrega) {
            mensagem += `🏠 *Endereço*: ${enderecoEntrega}\n`;
          }
          // Removida a mensagem de taxa de entrega conforme solicitado
        } else if (opcaoEntregaSelecionada === "retirada") {
          mensagem += `\n🛍️ *Cliente vai Retirar no Local*\n`;
        }

        // Observações gerais
        if (observacaoGeral) {
          mensagem += `\n💬 *OBSERVAÇÕES*\n${observacaoGeral}\n`;
        }

        // Lista de itens
        mensagem += `\n🛒 *ITENS DO PEDIDO*\n`;

        // Adicionar itens do carrinho
        carrinho.forEach((item, index) => {
          mensagem += `\n${index + 1}. ${item.titulo} (${item.quantidade}x)`;
          if (item.observacao) mensagem += `\n   ➡️ _${item.observacao}_`;
          mensagem += `\n`;
        });

        mensagem += `\n✅ *Pedido Finalizado* - Aguardando confirmação do estabelecimento\n`;
        mensagem += `\n👍 Obrigado pela preferência!`;

        // Codificar mensagem para URL
        const mensagemCodificada = encodeURIComponent(mensagem);

        // Abrir WhatsApp com a mensagem
        // Obter o número de WhatsApp da planilha de configurações
        const numeroWhatsApp = dadosGlobais.config["WhatsApp"];
        if (!numeroWhatsApp) {
          alert("Número de WhatsApp não configurado na planilha.");
          return;
        }

        // Remover caracteres não numéricos do número
        const numeroLimpo = numeroWhatsApp.replace(/\D/g, "");

        // Enviar pedido sem confirmação
        // Limpar carrinho após envio
        localStorage.removeItem("carrinho");
        atualizarContadorCarrinho();
        resetarFormulario();

        // Fechar modal
        fecharModal();

        // Detectar o dispositivo e enviar o pedido de forma adequada
        enviarPedidoWhatsApp(numeroLimpo, mensagemCodificada);
      }

      // Função auxiliar para obter texto do tipo de entrega
      function getTextoTipoEntrega(tipo) {
        switch (tipo) {
          case "delivery":
            return "Delivery";
          case "retirada":
            return "Retirada no Local";
          case "consumo":
            return "Consumo no Local";
          default:
            return "Não especificado";
        }
      }

      /**
       * Função para enviar pedido via WhatsApp de acordo com o dispositivo
       * Trata diferentes plataformas e dispositivos para garantir compatibilidade
       * @param {string} numero - Número de telefone limpo (apenas dígitos)
       * @param {string} mensagem - Mensagem codificada para URL
       */
      function enviarPedidoWhatsApp(numero, mensagem) {
        // Garantir que o número e a mensagem sejam válidos
        if (!numero || numero.length < 8) {
          console.error("Número de telefone inválido:", numero);
          alert(
            "Número de telefone inválido. Por favor, verifique as configurações."
          );
          return false;
        }

        if (!mensagem) {
          console.error("Mensagem vazia");
          alert("Não foi possível construir a mensagem do pedido.");
          return false;
        }

        // Detectar dispositivo e navegador
        const isMobile =
          /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
            navigator.userAgent
          );
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        const isMac = /Mac/i.test(navigator.userAgent);
        const isWindows = /Windows/i.test(navigator.userAgent);
        const isDesktop = !isMobile;

                
        try {
          // Verificar o formato do número e adicionar prefixo se necessário
          if (numero.length === 11 || numero.length === 10) {
            // Adicionar código do país Brasil
            numero = "55" + numero;
          }

          // Método simplificado que funciona em todos os dispositivos
          const webUrl = `https://api.whatsapp.com/send?phone=${numero}&text=${mensagem}`;

          // Registro de log para depuração
          
          // Abrir em nova janela com fallback para mesma janela
          try {
            const newWindow = window.open(webUrl, "_blank");
            if (
              !newWindow ||
              newWindow.closed ||
              typeof newWindow.closed === "undefined"
            ) {
              // Se falhar ao abrir em nova janela, tentar na mesma janela
                            window.location.href = webUrl;
            }
            return true;
          } catch (innerError) {
            console.error("Erro ao abrir janela:", innerError);
            window.location.href = webUrl;
            return true;
          }
        } catch (error) {
          console.error("Erro ao enviar mensagem para WhatsApp:", error);

          // Tentar método alternativo wa.me
          try {
            const waUrl = `https://wa.me/${numero}?text=${mensagem}`;
                        alert("Usando método alternativo para abrir o WhatsApp.");
            window.location.href = waUrl;
            return true;
          } catch (fallbackError) {
            console.error("Falha no método alternativo:", fallbackError);
            alert(
              "Não foi possível abrir o WhatsApp. Por favor, tente novamente mais tarde."
            );
            return false;
          }
        }
      }

      /**
       * Função simplificada para adicionar itens ao carrinho
       * Esta função não depende do objeto Carrinho complexo
       * @param {string} id - ID do item
       * @param {string} titulo - Título do item
       * @param {HTMLElement} botao - O botão que foi clicado
       */
      function adicionarAoCarrinhoSimples(
        id,
        titulo,
        botao,
        precoAdicional = 0
      ) {
        
        // Obter quantidade do input associado
        const input = document.querySelector(
          `.quantidade-input[data-item-id="${id}"]`
        );
        const quantidade = input ? parseInt(input.value) || 1 : 1;

        // Carrinho no localStorage
        let carrinho = JSON.parse(localStorage.getItem("carrinho") || "[]");

        // Tentar obter a URL da imagem do item
        let imagemURL = "";
        try {
          // Primeiro tenta encontrar a imagem no card do menu-item
          const menuItem = botao.closest(".menu-item");
          if (menuItem) {
            // Procurar pela imagem na estrutura do card
            const img =
              menuItem.querySelector(".item-image img") ||
              menuItem.querySelector("img");
            if (img) {
              // Capturar a URL completa da imagem
              if (img.currentSrc) {
                // currentSrc retorna a URL completa da imagem carregada
                imagemURL = img.currentSrc;
              } else if (img.src) {
                // Fallback para src se currentSrc não estiver disponível
                imagemURL = img.src;
              } else {
                // Último recurso: tentar obter o atributo src
                imagemURL = img.getAttribute("src") || "";
              }

              // Garantir que a URL seja absoluta
              if (
                imagemURL &&
                !imagemURL.startsWith("http") &&
                !imagemURL.startsWith("data:")
              ) {
                // Converter URL relativa para absoluta
                const base = window.location.origin;
                imagemURL = new URL(imagemURL, base).href;
              }
            }
          } else {
            // Tenta encontrar em outras estruturas possíveis
            const card = botao.closest(".card") || botao.closest(".item-card");
            if (card) {
              const img = card.querySelector("img");
              if (img) {
                imagemURL =
                  img.currentSrc || img.src || img.getAttribute("src") || "";

                // Garantir que a URL seja absoluta
                if (
                  imagemURL &&
                  !imagemURL.startsWith("http") &&
                  !imagemURL.startsWith("data:")
                ) {
                  const base = window.location.origin;
                  imagemURL = new URL(imagemURL, base).href;
                }
              }
            }
          }

          // Verificar se a URL é válida
          if (imagemURL) {
            // Processar a URL da imagem para suportar Google Drive
            imagemURL = processarURLImagem(imagemURL);
                      } else {
                      }
        } catch (e) {
          console.error("Erro ao obter imagem do item:", e);
        }

        // Gerar um ID único para cada item adicionado ao carrinho
        // Isso permite que o mesmo produto seja adicionado várias vezes com personalizações independentes
        const uniqueId = `${id}_${Date.now()}_${Math.floor(
          Math.random() * 1000
        )}`;

        // Verificar se o campo de observação deve ser incluído
        const incluirObservacao =
          dadosGlobais.config["Step-1-itens-obs"] === "Sim";

        // Verificar se o item já existe no carrinho pelo ID original e adicionar apenas a quantidade
        // Comentando essa parte para que cada clique represente apenas 1 adição independente
        // Isso permite que o usuário adicione o mesmo produto várias vezes conforme necessário

        // Obter o preço base do produto na card
        let precoBase = 0;
        try {
          const card = botao.closest(".menu-item");
          if (card) {
            const precoElement = card.querySelector(".price-highlight span");
            if (precoElement) {
              // Extrair valor numérico do preço exibido (removendo "R$ " e substituindo vírgula por ponto)
              const precoTexto = precoElement.textContent
                .replace("R$ ", "")
                .replace(",", ".");
              precoBase = parseFloat(precoTexto);
            }
          }
        } catch (e) {
          console.error("Erro ao obter preço base do card:", e);
        }

        // Adicionar item com a quantidade selecionada pelo usuário
        carrinho.push({
          id: uniqueId, // ID único para este item específico no carrinho
          originalId: id, // ID original do produto para referência
          titulo,
          quantidade: quantidade, // Usar a quantidade que o usuário selecionou
          imagem: imagemURL,
          precoBase: precoBase, // Preço base do produto
          precoAdicional: precoAdicional || 0, // Preço adicional das variações
          precoTotal: precoBase + (precoAdicional || 0), // Preço total com as variações
          ...(incluirObservacao ? { observacao: "" } : {}),
        });

        
        // Salvar no localStorage
        localStorage.setItem("carrinho", JSON.stringify(carrinho));

        // Atualizar interface
        atualizarContadorCarrinho();

        // Atualizar o contador no título do carrinho
        const totalItensCarrinho = document.getElementById(
          "total-itens-carrinho"
        );
        if (totalItensCarrinho) {
          // Calcular o total de itens somando todas as quantidades
          const totalItens = carrinho.reduce(
            (acc, item) => acc + item.quantidade,
            0
          );
          totalItensCarrinho.textContent = totalItens;
                  }

        // Feedback visual
        const textoSpan = botao.querySelector("span");
        const iconeCarrinho = botao.querySelector("svg");

        if (textoSpan) {
          textoSpan.textContent = "Adicionado";
        }

        // Substituir o ícone de carrinho por um ícone de check
        if (iconeCarrinho) {
          iconeCarrinho.innerHTML =
            '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />';
        }

        botao.classList.add("bg-green-600");

        setTimeout(() => {
          if (textoSpan) {
            textoSpan.textContent = "Adicionar";
          }

          // Restaurar o ícone de carrinho
          if (iconeCarrinho) {
            iconeCarrinho.innerHTML =
              '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />';
          }

          botao.classList.remove("bg-green-600");
        }, 1500);
      }
