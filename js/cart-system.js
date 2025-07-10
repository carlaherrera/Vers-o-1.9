      /**
       * Sistema de Carrinho de Compras
       *
       * Implementa um sistema completo de carrinho de compras com:
       * - Controles de quantidade em cada card de produto
       * - Persistência de dados via localStorage
       * - Botão flutuante com contador de itens
       * - Modal de checkout com navegação em etapas (steps)
       * - Montagem de mensagem para WhatsApp
       *
       * A implementação utiliza uma abordagem Mobile First com design responsivo
       * e tecnologias web modernas (ES6+, Tailwind CSS)
       *
       * @author Dante Testa (https://dantetesta.com.br)
       */
      const Carrinho = {
        // Itens no carrinho
        itens: [],

        /**
         * Inicializa o sistema de carrinho
         * - Carrega dados salvos do localStorage
         * - Configura eventos de interface
         * - Atualiza contadores visuais
         */
        inicializar: function () {
                    this.carregarDoLocalStorage();
          this.atualizarContadorCarrinho();
          this.atualizarBotaoFlutuante();
          this.configurarEventos();
          this.configurarMensagemDestacada();
        },

        /**
         * Carrega o carrinho do localStorage
         */
        carregarDoLocalStorage: function () {
          const carrinhoSalvo = localStorage.getItem("carrinho");
          if (carrinhoSalvo) {
            try {
              this.itens = JSON.parse(carrinhoSalvo);
            } catch (e) {
              console.error("Erro ao carregar carrinho do localStorage:", e);
              this.itens = [];
              localStorage.removeItem("carrinho");
            }
          }
        },

        // Salva o carrinho no localStorage
        salvarNoLocalStorage: function () {
          localStorage.setItem("carrinho", JSON.stringify(this.itens));
        },

        // Limpa o carrinho
        limpar: function () {
          this.itens = [];
          this.salvarNoLocalStorage();
          this.atualizarContadorCarrinho();
          renderizarItensCarrinho();

          // Atualizar o contador no título do carrinho
          const totalItensCarrinho = document.getElementById(
            "total-itens-carrinho"
          );
          if (totalItensCarrinho) {
            totalItensCarrinho.textContent = "0";
                      }
        },

        /**
         * Adiciona um item ao carrinho de compras
         * @param {string} id - ID único do item
         * @param {string} titulo - Nome/título do produto
         * @param {number} quantidade - Quantidade desejada do produto
         * @param {string} observacao - Observação opcional sobre o item (padrão vazio)
         * @description Adiciona um novo item ao carrinho de compras ou atualiza a quantidade de um item existente.
         *              Salva o carrinho no localStorage e atualiza a exibição do carrinho.
         */
        adicionar: function (id, titulo, quantidade, observacao = "") {
                    // Validar quantidade
          quantidade = parseInt(quantidade) || 1;
          if (quantidade < 1) quantidade = 1;

          // Verificar se o item já está no carrinho
          const itemExistente = this.itens.find((item) => item.id === id);

          if (itemExistente) {
            // Se existir, atualiza a quantidade
            itemExistente.quantidade = quantidade;
          } else {
            // Se não existir, adiciona como novo item
            this.itens.push({
              id: id,
              titulo: titulo,
              quantidade: quantidade,
              observacao: "",
            });
          }

          this.salvarNoLocalStorage();
          this.atualizarContadorCarrinho();
          this.atualizarBotaoFlutuante();
          renderizarItensCarrinho();

          // Atualizar o contador total de itens no título do carrinho
          const totalItensCarrinho = document.getElementById(
            "total-itens-carrinho"
          );
          if (totalItensCarrinho) {
            // Calcular o total de itens somando todas as quantidades
            const totalItens = this.itens.reduce(
              (acc, item) => acc + item.quantidade,
              0
            );
            totalItensCarrinho.textContent = totalItens;
                      }

          // Atualiza estado visual do botão
          this.atualizarEstadoBotaoAdicionar(id);

          return true;
        },

        // Remove um item do carrinho
        remover: function (id) {
          // Encontrar o item antes de remover para obter sua quantidade
          const itemRemovido = this.itens.find((item) => item.id === id);
          const quantidadeRemovida = itemRemovido ? itemRemovido.quantidade : 0;

          // Remover o item
          this.itens = this.itens.filter((item) => item.id !== id);
          this.salvarNoLocalStorage();
          this.atualizarContadorCarrinho();
          renderizarItensCarrinho();
          this.atualizarBotaoFlutuante();

          // Atualizar o contador no título do carrinho
          const totalItensCarrinho = document.getElementById(
            "total-itens-carrinho"
          );
          if (totalItensCarrinho) {
            // Calcular o total de itens somando todas as quantidades
            const totalItens = this.itens.reduce(
              (acc, item) => acc + item.quantidade,
              0
            );
            totalItensCarrinho.textContent = totalItens;
                      }

          // Resetar estado visual do botão
          const botao = document.querySelector(
            `.adicionar-ao-carrinho[data-item-id="${id}"]`
          );
          if (botao) {
            botao.textContent = "Adicionar ao Carrinho";
            botao.classList.remove("bg-green-600", "hover:bg-green-700");
            botao.classList.add(
              "bg-primary-dynamic",
              "hover:bg-primary-dynamic/90"
            );
          }

          // Resetar campo de quantidade
          const input = document.querySelector(
            `.quantidade-input[data-item-id="${id}"]`
          );
          if (input) {
            input.value = 1;
          }
        },

        // Atualiza a observação de um item
        atualizarObservacao: function (id, observacao) {
          const item = this.itens.find((item) => item.id === id);
          if (item) {
            item.observacao = observacao;
            this.salvarNoLocalStorage();
          }
        },

        // Atualiza contador do carrinho
        atualizarContadorCarrinho: function () {
          const totalItens = this.itens.reduce(
            (acc, item) => acc + item.quantidade,
            0
          );
          const contador = document.getElementById("contador-carrinho");
          if (contador) {
            contador.textContent = totalItens;
          }

          // Atualizar também o contador no título do carrinho
          const totalItensCarrinho = document.getElementById(
            "total-itens-carrinho"
          );
          if (totalItensCarrinho) {
            // Usar totalItens para mostrar a quantidade total de itens, não apenas o número de itens diferentes
            totalItensCarrinho.textContent = totalItens;
          }

                  },

        /**
         * Atualiza a visibilidade do botão flutuante do carrinho
         * - Mostra o botão quando há itens no carrinho
         * - Esconde o botão quando o carrinho está vazio
         */
        atualizarBotaoFlutuante: function () {
          // ID correto do botão é 'botao-carrinho', não 'carrinho-flutuante'
          const botaoFlutuante = document.getElementById("botao-carrinho");
          
          if (!botaoFlutuante) {
            console.error("Botão do carrinho não encontrado no DOM!");
            return;
          }

          // Forçar exibir para depuração
          if (this.itens && this.itens.length > 0) {
            // Exibir botão
            botaoFlutuante.classList.remove("hidden");
            botaoFlutuante.style.display = "flex"; // Usando 'flex' conforme definido no HTML
            botaoFlutuante.style.opacity = "1";
            botaoFlutuante.style.pointerEvents = "auto";

            // Garantir que o onclick está definido
            if (
              !botaoFlutuante.hasAttribute("onclick") ||
              !botaoFlutuante.getAttribute("onclick")
            ) {
              botaoFlutuante.setAttribute("onclick", "abrirModal();");
                          }

            // Atualizar contador do carrinho
            const contadorCarrinho =
              botaoFlutuante.querySelector("#carrinho-contador");
            if (contadorCarrinho) {
              const totalItens = this.itens.reduce(
                (acc, item) => acc + item.quantidade,
                0
              );
              contadorCarrinho.textContent = totalItens;
              contadorCarrinho.classList.remove("hidden");
            }
          } else {
            // Manter botão visível mesmo com carrinho vazio
            botaoFlutuante.classList.remove("hidden");
            botaoFlutuante.style.display = "flex";
            botaoFlutuante.style.opacity = "1"; // Opacidade total - sempre bem visível conforme solicitado
            botaoFlutuante.style.pointerEvents = "auto";

            // Garantir que o onclick está definido
            if (
              !botaoFlutuante.hasAttribute("onclick") ||
              !botaoFlutuante.getAttribute("onclick")
            ) {
              botaoFlutuante.setAttribute("onclick", "abrirModal();");
            }

            // Atualizar contador do carrinho para zero
            const contadorCarrinho =
              botaoFlutuante.querySelector("#carrinho-contador");
            if (contadorCarrinho) {
              contadorCarrinho.textContent = "0";
              contadorCarrinho.classList.remove("hidden");
            }
          }
        },

        /**
         * Renderiza os itens do carrinho no modal de checkout
         * - Atualiza a lista de itens no step 1
         * - Mostra mensagem de carrinho vazio se não houver itens
         */
        renderizarItensCarrinho: function () {
                    const containerItens = document.getElementById("carrinho-itens");
          const carrinhoVazio = document.getElementById("carrinho-vazio");

          if (!containerItens) {
            console.error("Container de itens do carrinho não encontrado");
            return;
          }

          // Limpar itens existentes (exceto a mensagem de carrinho vazio)
          const itensAtuais = containerItens.querySelectorAll(".item-carrinho");
          itensAtuais.forEach((item) => item.remove());

          // Mostrar/esconder mensagem de carrinho vazio e o resumo do carrinho
          const resumoCarrinho = document.getElementById("resumo-carrinho");
          const valorTotalCarrinho = document.getElementById(
            "valor-total-carrinho"
          );

          if (this.itens.length === 0) {
            if (carrinhoVazio) carrinhoVazio.classList.remove("hidden");
            if (resumoCarrinho) resumoCarrinho.classList.add("hidden");
          } else {
            if (carrinhoVazio) carrinhoVazio.classList.add("hidden");
            if (resumoCarrinho) resumoCarrinho.classList.remove("hidden");

            // Calcular o valor total do carrinho
            let valorTotal = 0;
            this.itens.forEach((item) => {
              const precoBase = item.precoBase || 0;
              const precoAdicional = item.precoAdicional || 0;
              const precoTotalItem = precoBase + precoAdicional;
              valorTotal += precoTotalItem * item.quantidade;
            });

            // Atualizar o valor total exibido
            if (valorTotalCarrinho) {
              valorTotalCarrinho.textContent = `R$ ${valorTotal
                .toFixed(2)
                .replace(".", ",")}`;
            }

            // Renderizar cada item do carrinho
            this.itens.forEach((item, index) => {
              // Calcular o preço total do item (preço base + preço adicional)
              const precoBase = item.precoBase || 0;
              const precoAdicional = item.precoAdicional || 0;
              const precoTotalItem = precoBase + precoAdicional;
              const precoFormatado = `R$ ${precoTotalItem
                .toFixed(2)
                .replace(".", ",")}`;

              const itemHtml = `
                            <div class="item-carrinho bg-white rounded-lg shadow-sm p-3 border border-gray-200 flex flex-col">
                                <div class="flex justify-between items-start gap-3">
                                    <!-- Imagem do item ou placeholder -->
                                    <div class="item-imagem">
                                        ${
                                          item.imagem
                                            ? `<img src="${processarURLImagem(
                                                item.imagem
                                              )}" alt="${
                                                item.titulo
                                              }" onerror="this.onerror=null; this.src='data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'64\' height=\'64\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%23cccccc\' stroke-width=\'1\' stroke-linecap=\'round\' stroke-linejoin=\'round\'><rect x=\'3\' y=\'3\' width=\'18\' height=\'18\' rx=\'2\' ry=\'2\'></rect><circle cx=\'8.5\' cy=\'8.5\' r=\'1.5\'></circle><polyline points=\'21 15 16 10 5 21\'></polyline></svg>';">
`
                                            : `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#cccccc" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>`
                                        }
                                    </div>
                                    
                                    <!-- Informações do item -->
                                    <div class="flex-1">
                                        <h4 class="font-medium text-gray-900">${
                                          item.titulo
                                        }</h4>
                                        <div class="flex items-center mt-1">
                                            <span class="text-sm font-medium text-primary-dynamic">${precoFormatado}</span>
                                            <span class="text-sm text-gray-500 ml-2">Qtd: ${
                                              item.quantidade
                                            }</span>
                                        </div>
                                        ${
                                          item.precoAdicional > 0
                                            ? `<span class="text-xs text-gray-500">(inclui adicional de variação: +R$ ${item.precoAdicional
                                                .toFixed(2)
                                                .replace(".", ",")})</span>`
                                            : ""
                                        }
                                        ${
                                          item.observacao
                                            ? `<p class="text-xs text-gray-500 mt-1">${item.observacao}</p>`
                                            : ""
                                        }
                                    </div>
                                    
                                    <!-- Botão remover -->
                                    <button 
                                        type="button" 
                                        class="remover-item ml-2 text-gray-400 hover:text-red-500 focus:outline-none"
                                        data-item-id="${item.id}"
                                        aria-label="Remover ${
                                          item.titulo
                                        } do carrinho"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        `;

              // Inserir antes da mensagem de carrinho vazio
              if (carrinhoVazio) {
                carrinhoVazio.insertAdjacentHTML("beforebegin", itemHtml);
              } else {
                containerItens.insertAdjacentHTML("beforeend", itemHtml);
              }
            });

            // Reconfigurar eventos para os botões de remover
            this.configurarEventos();
          }
        },

        // Configura eventos
        /**
         * Configura todos os eventos de interatividade do sistema de carrinho
         * - Controles de quantidade nos cards de produtos
         * - Botões de adicionar ao carrinho
         * - Navegação entre as etapas do checkout
         * - Validação e envio de pedido
         */
        configurarEventos: function () {
          // Configurar eventos para os inputs de quantidade (alteração manual)
          const self = this;
          document.addEventListener("change", function (event) {
            if (event.target.matches(".quantidade-input")) {
              const input = event.target;
              const id = input.dataset.itemId;
              const novaQuantidade = parseInt(input.value) || 1;

              // Se estiver no modal de checkout, atualizar o carrinho
              if (input.closest("#carrinho-itens")) {
                atualizarQuantidadeInput(id, novaQuantidade);
              }
            }
          });

          // Configurar eventos para os controles de quantidade
          document.addEventListener("click", function (event) {
            // Incremento de quantidade
            if (event.target.closest(".quantidade-incremento")) {
              const btn = event.target.closest(".quantidade-incremento");
              if (!btn || !btn.dataset || !btn.dataset.itemId) {
                console.error("Botão de incremento inválido ou sem ID");
                return;
              }
              const id = btn.dataset.itemId;
              const input = document.querySelector(
                `.quantidade-input[data-item-id="${id}"]`
              );
              if (!input) {
                console.error(
                  `Input de quantidade não encontrado para o item ${id}`
                );
                return;
              }
              let quantidade = parseInt(input.value) || 1;
              quantidade++;
              if (quantidade > 99) quantidade = 99; // Limita a quantidade máxima a 99
              input.value = quantidade;

              // Atualizar o item no carrinho se estiver no modal de checkout
              const carrinhoElement = btn.closest("#carrinho-itens");
              if (carrinhoElement) {
                try {
                  // Obter o carrinho do localStorage
                  let carrinho = JSON.parse(
                    localStorage.getItem("carrinho") || "[]"
                  );

                  // Encontrar o item no carrinho
                  const itemIndex = carrinho.findIndex(
                    (item) => item && item.id === id
                  );
                  if (itemIndex !== -1) {
                    // Atualizar a quantidade
                    carrinho[itemIndex].quantidade = quantidade;

                    // Salvar no localStorage
                    localStorage.setItem("carrinho", JSON.stringify(carrinho));

                    // Atualizar interface usando função global
                    if (typeof atualizarContadorCarrinho === "function") {
                      atualizarContadorCarrinho();
                    }

                    // Atualizar o contador no título do carrinho
                    const totalItensCarrinho = document.getElementById(
                      "total-itens-carrinho"
                    );
                    if (totalItensCarrinho) {
                      const totalItens = carrinho.reduce(
                        (acc, item) => acc + (item ? item.quantidade : 0),
                        0
                      );
                      totalItensCarrinho.textContent = totalItens;
                    }

                    // Habilitar o botão de decremento se quantidade > 1
                    const btnDecremento = document.querySelector(
                      `.quantidade-decremento[data-item-id="${id}"]`
                    );
                    if (btnDecremento) {
                      btnDecremento.disabled = false;
                      btnDecremento.classList.remove("opacity-50");
                    }
                  }
                } catch (error) {
                  console.error(
                    "Erro ao atualizar quantidade no carrinho:",
                    error
                  );
                }
              }
            }

            // Decremento de quantidade
            if (event.target.closest(".quantidade-decremento")) {
              const btn = event.target.closest(".quantidade-decremento");
              if (!btn || !btn.dataset || !btn.dataset.itemId) {
                console.error("Botão de decremento inválido ou sem ID");
                return;
              }
              const id = btn.dataset.itemId;
              const input = document.querySelector(
                `.quantidade-input[data-item-id="${id}"]`
              );
              if (!input) {
                console.error(
                  `Input de quantidade não encontrado para o item ${id}`
                );
                return;
              }
              let quantidade = parseInt(input.value) || 1;
              quantidade = Math.max(1, quantidade - 1); // Não permite valor menor que 1
              input.value = quantidade;

              // Atualizar o item no carrinho se estiver no modal de checkout
              const carrinhoElement = btn.closest("#carrinho-itens");
              if (carrinhoElement) {
                try {
                  // Obter o carrinho do localStorage
                  let carrinho = JSON.parse(
                    localStorage.getItem("carrinho") || "[]"
                  );

                  // Encontrar o item no carrinho
                  const itemIndex = carrinho.findIndex(
                    (item) => item && item.id === id
                  );
                  if (itemIndex !== -1) {
                    // Atualizar a quantidade
                    carrinho[itemIndex].quantidade = quantidade;

                    // Salvar no localStorage
                    localStorage.setItem("carrinho", JSON.stringify(carrinho));

                    // Atualizar interface usando função global
                    if (typeof atualizarContadorCarrinho === "function") {
                      atualizarContadorCarrinho();
                    }

                    // Atualizar o contador no título do carrinho
                    const totalItensCarrinho = document.getElementById(
                      "total-itens-carrinho"
                    );
                    if (totalItensCarrinho) {
                      const totalItens = carrinho.reduce(
                        (acc, item) => acc + (item ? item.quantidade : 0),
                        0
                      );
                      totalItensCarrinho.textContent = totalItens;
                    }

                    // Desabilitar o botão de decremento se quantidade <= 1
                    if (quantidade <= 1) {
                      btn.disabled = true;
                      btn.classList.add("opacity-50");
                    }
                  }
                } catch (error) {
                  console.error(
                    "Erro ao atualizar quantidade no carrinho:",
                    error
                  );
                }
              }
            }

            // Adicionar ao carrinho - REMOVIDO (comentado)
            // O código que estava aqui foi removido porque estava causando duplicação de itens
            // A adição ao carrinho agora é feita exclusivamente pela função adicionarAoCarrinhoSimples
            // que é chamada diretamente pelo atributo onclick nos botões

            // Remover item do carrinho
            if (event.target.closest(".remover-item-carrinho")) {
              const btn = event.target.closest(".remover-item-carrinho");
              if (!btn || !btn.dataset || !btn.dataset.itemId) {
                console.error("Botão de remoção inválido ou sem ID");
                return;
              }

              const id = btn.dataset.itemId;

              try {
                // Obter carrinho atual
                let carrinho = JSON.parse(
                  localStorage.getItem("carrinho") || "[]"
                );

                // Encontrar o índice do item a ser removido
                const itemIndex = carrinho.findIndex(
                  (item) => item && item.id === id
                );

                if (itemIndex !== -1) {
                  // Remover o item do array
                  carrinho.splice(itemIndex, 1);

                  // Salvar carrinho atualizado
                  localStorage.setItem("carrinho", JSON.stringify(carrinho));

                  // Atualizar interface do carrinho
                  if (typeof renderizarItensCarrinho === "function") {
                    renderizarItensCarrinho();
                  }

                  // Atualizar contador do carrinho
                  if (typeof atualizarContadorCarrinho === "function") {
                    atualizarContadorCarrinho();
                  }

                  // Remover o elemento do DOM se existir
                  const itemElement = document.querySelector(
                    `#item-carrinho-${id}`
                  );
                  if (itemElement) {
                    itemElement.remove();
                  }

                                  }
              } catch (error) {
                console.error("Erro ao remover item do carrinho:", error);
              }
            }

            // Limpar carrinho
            if (event.target.closest("#botao-limpar")) {
              try {
                // Limpar o carrinho no localStorage
                localStorage.setItem("carrinho", JSON.stringify([]));

                // Limpar a exibição do carrinho
                const carrinhoItens = document.getElementById("carrinho-itens");
                if (carrinhoItens) {
                  carrinhoItens.innerHTML =
                    '<p class="p-4 text-gray-500 text-center italic">Seu carrinho está vazio</p>';
                }

                // Atualizar contador do carrinho
                if (typeof atualizarContadorCarrinho === "function") {
                  atualizarContadorCarrinho();
                }

                // Atualizar botão flutuante
                if (typeof atualizarBotaoFlutuante === "function") {
                  atualizarBotaoFlutuante();
                }

                // Resetar para step 1 se estiver no modal de checkout
                const step1 = document.getElementById("checkout-step-1");
                const step2 = document.getElementById("checkout-step-2");
                const step3 = document.getElementById("checkout-step-3");

                if (step1 && step2 && step3) {
                  step1.classList.remove("hidden");
                  step2.classList.add("hidden");
                  step3.classList.add("hidden");
                }

                              } catch (error) {
                console.error("Erro ao limpar carrinho:", error);
              }
            }

            // Abrir modal
            if (event.target.closest("#botao-carrinho")) {
              try {
                // Renderizar itens do carrinho com tratamento de erro
                if (typeof renderizarItensCarrinho === "function") {
                  renderizarItensCarrinho();
                } else {
                  console.warn("Função renderizarItensCarrinho não encontrada");
                }

                // Mostrar o modal com verificação de elementos
                const modalOverlay = document.getElementById("modal-overlay");
                if (modalOverlay) {
                  modalOverlay.classList.remove("hidden");
                }

                if (document.body) {
                  document.body.classList.add("overflow-hidden");
                }
              } catch (error) {
                console.error("Erro ao abrir modal do carrinho:", error);
              }
            }

            // Fechar modal
            if (
              event.target.closest("#fechar-modal") ||
              (event.target.id === "modal-overlay" &&
                !event.target.closest("#modal-checkout"))
            ) {
              document.getElementById("modal-overlay").classList.add("hidden");
              // Chamar a função fecharModal para garantir que o scroll seja restaurado corretamente
              fecharModal();
            }

            // Removido manipulador duplicado do botão continuar
            // O botão já tem um onclick="avançarStep()" que cuida da navegação

            // Removido manipulador duplicado do botão voltar
            // O botão já tem um onclick="voltarStep()" que cuida da navegação
            // A duplicidade estava causando conflitos e erros ao voltar para steps anteriores

            // Enviar pedido
            if (event.target.closest("#botao-enviar")) {
              try {
                // Verificar se o objeto Carrinho existe e chamar o método correto
                if (
                  typeof Carrinho === "object" &&
                  typeof Carrinho.validarEEnviarPedido === "function"
                ) {
                  Carrinho.validarEEnviarPedido();
                } else {
                  console.error(
                    "Objeto Carrinho ou método validarEEnviarPedido não encontrado"
                  );
                  alert("Não foi possível enviar o pedido. Tente novamente.");
                }
              } catch (error) {
                console.error("Erro ao enviar pedido:", error);
              }
            }
          });

          // Validação de inputs numéricos (somente números e quantidade mínima 1)
          document.addEventListener("input", (event) => {
            if (event.target.classList.contains("quantidade-input")) {
              // Remover caracteres não numéricos
              event.target.value = event.target.value.replace(/[^0-9]/g, "");

              // Garantir valor mínimo 1
              const valor = parseInt(event.target.value) || 0;
              if (valor < 1) event.target.value = 1;
            }

            // Atualizar observação de item quando o textarea é alterado
            if (event.target.classList.contains("observacao-item")) {
              const id = event.target.dataset.itemId;
              this.atualizarObservacao(id, event.target.value);
            }
          });
        },

        // Atualiza estado visual do botão Adicionar ao Carrinho
        atualizarEstadoBotaoAdicionar: function (id) {
          const botao = document.querySelector(
            `.adicionar-ao-carrinho[data-item-id="${id}"]`
          );
          if (botao) {
            botao.textContent = "Adicionado";
            botao.classList.remove(
              "bg-primary-dynamic",
              "hover:bg-primary-dynamic/90"
            );
            botao.classList.add("bg-green-600", "hover:bg-green-700");
          }
        },

        // Configura a mensagem destacada com o label de retirada
        configurarMensagemDestacada: function () {
          const labelRetirada = dadosGlobais.config["Label de Retirada"];
          if (labelRetirada) {
            const mensagemDestacada =
              document.getElementById("mensagem-destacada");
            mensagemDestacada.innerHTML = `<strong>Informação Importante:</strong> ${labelRetirada}`;
            mensagemDestacada.classList.remove("hidden");
          }
        },

        // Atualiza a exibição dos itens no carrinho
        atualizarExibicaoCarrinho: function () {
          const carrinhoItens = document.getElementById("carrinho-itens");
          const carrinhoVazio = document.getElementById("carrinho-vazio");
          const totalItensCarrinho = document.getElementById(
            "total-itens-carrinho"
          );

          // Atualizar o contador de itens no título
          if (totalItensCarrinho) {
            // Calcular o total de itens somando as quantidades
            const totalItens = this.itens.reduce(
              (acc, item) => acc + item.quantidade,
              0
            );
            totalItensCarrinho.textContent = totalItens;
                      }

          // Remover todos os itens, exceto a mensagem de carrinho vazio
          Array.from(carrinhoItens.children).forEach((child) => {
            if (child.id !== "carrinho-vazio") {
              child.remove();
            }
          });

          if (this.itens.length === 0) {
            // Mostrar mensagem de carrinho vazio
            carrinhoVazio.classList.remove("hidden");
            // Desabilitar botão continuar
            document
              .getElementById("botao-continuar")
              .classList.add("opacity-50", "cursor-not-allowed");
          } else {
            // Esconder mensagem de carrinho vazio
            carrinhoVazio.classList.add("hidden");
            // Habilitar botão continuar
            document
              .getElementById("botao-continuar")
              .classList.remove("opacity-50", "cursor-not-allowed");

            // Adicionar itens ao carrinho
            this.itens.forEach((item) => {
              const itemElement = document.createElement("div");
              itemElement.className =
                "bg-white border rounded-lg p-4 shadow-sm";
              itemElement.innerHTML = `
                            <div class="flex justify-between items-start mb-2">
                                <h4 class="font-medium text-gray-800">${
                                  item.titulo
                                }</h4>
                                          placeholder="Alguma observação sobre este item?" 
                                          rows="2"
                                          data-item-id="${item.id}">${
                item.observacao || ""
              }</textarea>
                            </div>
                        `;
              carrinhoItens.insertBefore(itemElement, carrinhoVazio);
            });
          }
        },

        // Configuração do step 2: Métodos de envio
        configurarStep2: function () {
          const metodoContainer = document.getElementById("metodos-envio");
          metodoContainer.innerHTML = "";

          // Opções de método de envio configuradas na planilha
          const opc1 =
            dadosGlobais.config["Step-2-opc-1"] || "Consumo no Local";
          const opc2 =
            dadosGlobais.config["Step-2-opc-2"] ||
            "Pedido para Retirada no Local";
          const opc3 =
            dadosGlobais.config["Step-2-opc-3"] ||
            "Pedido para Entrega (Delivery)";

          // Criar opções de métodos de envio
          const metodos = [
            { id: "consumo-local", nome: opc1, valor: "consumo" },
            { id: "retirada", nome: opc2, valor: "retirada" },
            { id: "delivery", nome: opc3, valor: "delivery" },
          ];

          metodos.forEach((metodo) => {
            const metodoElement = document.createElement("div");
            metodoElement.className =
              "flex items-center space-x-3 p-3 border rounded-lg bg-gray-50 cursor-pointer hover:bg-gray-100";
            metodoElement.innerHTML = `
                        <input type="radio" id="${metodo.id}" name="metodo-envio" value="${metodo.valor}" class="h-5 w-5 text-primary-dynamic focus:ring-primary-dynamic">
                        <label for="${metodo.id}" class="cursor-pointer flex-1">
                            <span class="font-medium text-gray-800">${metodo.nome}</span>
                        </label>
                    `;
            metodoContainer.appendChild(metodoElement);

            // Adicionar evento de click ao elemento div para selecionar o radio
            metodoElement.addEventListener("click", function () {
              document.getElementById(metodo.id).checked = true;
            });
          });
        },

        // Configuração do step 3 com base na opção selecionada
        configurarStep3: function () {
          const formCliente = document.getElementById("form-cliente");
          formCliente.innerHTML = "";

          // Campo Nome (comum a todos os métodos)
          const campoNome = document.createElement("div");
          campoNome.className = "mb-4";
          campoNome.innerHTML = `
                    <label for="cliente-nome" class="block mb-1 text-sm font-medium text-gray-700">Nome</label>
                    <input type="text" id="cliente-nome" name="nome" class="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-800 focus:outline-none focus:ring-1 focus:ring-primary-dynamic focus:border-primary-dynamic" required>
                `;
          formCliente.appendChild(campoNome);

          // Sempre adicionar os campos específicos de acordo com a opção de entrega selecionada
          // Removida verificação de opcaoEntregaPadrao que estava causando bugs
          switch (opcaoEntregaSelecionada) {
            case "local":
              // Campo Mesa/Comanda (sempre exibir quando a opção for 'local')
              // A configuração Step-3-mesa-comanda está definida como Sim na planilha
                            const campoMesa = document.createElement("div");
              campoMesa.className = "mb-4";
              campoMesa.innerHTML = `
                            <label for="cliente-mesa" class="block mb-1 text-sm font-medium text-gray-700">Mesa/Comanda</label>
                            <input type="text" id="cliente-mesa" name="mesa" class="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-800 focus:outline-none focus:ring-1 focus:ring-primary-dynamic focus:border-primary-dynamic" required>
                        `;
              formCliente.appendChild(campoMesa);
              break;

            case "delivery":
              // Campo Endereço para delivery
              const campoEndereco = document.createElement("div");
              campoEndereco.className = "mb-4";
              campoEndereco.innerHTML = `
                            <label for="cliente-endereco" class="block mb-1 text-sm font-medium text-gray-700">Endereço Completo</label>
                            <textarea id="cliente-endereco" name="endereco" class="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-800 focus:outline-none focus:ring-1 focus:ring-primary-dynamic focus:border-primary-dynamic" rows="3" required></textarea>
                        `;
              formCliente.appendChild(campoEndereco);

              // Exibir taxa de delivery
              const taxaDelivery = dadosGlobais.config["Step-2-taxa-delivery"];
              if (taxaDelivery) {
                const mensagemTaxa = document.createElement("div");
                mensagemTaxa.className =
                  "mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm font-medium text-yellow-800";
                mensagemTaxa.innerHTML = `<strong>Taxa de Entrega:</strong> ${taxaDelivery}`;
                formCliente.appendChild(mensagemTaxa);
              }
              break;

            case "retirada":
              // Campo Horário de Retirada (se configurado)
              if (dadosGlobais.config["Step-3-horario-retirada"] === "Sim") {
                const campoHorario = document.createElement("div");
                campoHorario.className = "mb-4";
                campoHorario.innerHTML = `
                                <label for="cliente-horario" class="block mb-1 text-sm font-medium text-gray-700">Horário de Retirada</label>
                                <input type="time" id="cliente-horario" name="horario" class="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-800 focus:outline-none focus:ring-1 focus:ring-primary-dynamic focus:border-primary-dynamic">
                            `;
                formCliente.appendChild(campoHorario);
              }
              break;
          }

          // Campo Forma de Pagamento (para todas as opções exceto a 4/padrão)
          const campoFormaPagamento = document.createElement("div");
          campoFormaPagamento.className = "mb-4";
          campoFormaPagamento.innerHTML = `
                    <label for="cliente-pagamento" class="block mb-1 text-sm font-medium text-gray-700">Forma de Pagamento</label>
                    <select id="cliente-pagamento" name="pagamento" class="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-800 focus:outline-none focus:ring-1 focus:ring-primary-dynamic focus:border-primary-dynamic" required>
                        <option value="" disabled selected>Selecione a forma de pagamento</option>
                        <!-- Opções serão preenchidas dinamicamente -->
                    </select>
                `;
          formCliente.appendChild(campoFormaPagamento);

          // Preencher opções de pagamento
          const selectPagamento = document.getElementById("cliente-pagamento");
          popularFormasPagamento(selectPagamento);

          // Campo de Observações Gerais (comum a todos os métodos)
          const campoObs = document.createElement("div");
          campoObs.className = "mb-4";
          campoObs.innerHTML = `
                    <label for="cliente-obs" class="block mb-1 text-sm font-medium text-gray-700">Observações Gerais</label>
                    <textarea id="cliente-obs" name="observacoes" class="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-800 focus:outline-none focus:ring-1 focus:ring-primary-dynamic focus:border-primary-dynamic" rows="3"></textarea>
                `;
          formCliente.appendChild(campoObs);
        },

        // Navegação entre os steps
        mostrarStep: function (step) {
          // Ocultar todos os steps
          document.querySelectorAll(".step").forEach((el) => {
            el.classList.add("hidden");
          });

          // Mostrar o step solicitado
          document.getElementById(`step-${step}`).classList.remove("hidden");

          // Configurar botões de acordo com o step atual
          const botaoVoltar = document.getElementById("botao-voltar");
          const botaoContinuar = document.getElementById("botao-continuar");
          const botaoEnviar = document.getElementById("botao-enviar");

          if (step === 1) {
            botaoVoltar.classList.add("hidden");
            botaoContinuar.classList.remove("hidden");
            botaoEnviar.classList.add("hidden");
          } else if (step === 2) {
            this.configurarStep2();
            botaoVoltar.classList.remove("hidden");
            botaoContinuar.classList.remove("hidden");
            botaoEnviar.classList.add("hidden");
          } else if (step === 3) {
            botaoVoltar.classList.remove("hidden");
            botaoContinuar.classList.add("hidden");
            botaoEnviar.classList.remove("hidden");
          }
        },

        // Validação e envio do pedido via WhatsApp
        /**
         * Valida os campos do formulário e envia o pedido via WhatsApp
         * - Verifica campos obrigatórios de acordo com o método de envio selecionado
         * - Monta mensagem formatada com os itens, quantidades e observações
         * - Abre WhatsApp Web com a mensagem pré-preenchida
         * - Limpa o carrinho após o envio bem-sucedido
         */
        validarEEnviarPedido: function () {
          // Validar campos obrigatórios
          const nome = document.getElementById("cliente-nome");
          if (!nome.value.trim()) {
            alert("Por favor, informe seu nome.");
            nome.focus();
            return;
          }

          // Verificar método de envio selecionado
          let metodoEnvio = "";
          const exibirStep2 = dadosGlobais.config["Step-2-checkout"] === "Sim";
          if (exibirStep2) {
            const metodoSelecionado = document.querySelector(
              'input[name="metodo-envio"]:checked'
            );
            if (metodoSelecionado) {
              metodoEnvio = metodoSelecionado.value;

              // Validações específicas por método
              // Padronizando o uso de 'local' em vez de 'consumo' para consistência
              if (metodoEnvio === "local") {
                const mesaComandaAtivado =
                  dadosGlobais.config["Step-3-mesa-comanda"] === "Sim";
                if (mesaComandaAtivado) {
                  const mesa = document.getElementById("cliente-mesa");
                  if (!mesa || !mesa.value.trim()) {
                    alert("Por favor, informe o número da mesa/comanda.");
                    mesa.focus();
                    return;
                  }
                }
              } else if (metodoEnvio === "delivery") {
                const endereco = document.getElementById("cliente-endereco");
                if (!endereco || !endereco.value.trim()) {
                  alert("Por favor, informe seu endereço completo.");
                  endereco.focus();
                  return;
                }
              }
            }
          }

          // Monta a mensagem para o WhatsApp com emojis e melhor formatação
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
          mensagem += `➡️ *Nome*: ${nome.value.trim()}\n`;

          // Forma de pagamento
          const formaPagamento = document.getElementById("cliente-pagamento");
          if (
            formaPagamento &&
            formaPagamento.value &&
            formaPagamento.value !== ""
          ) {
            const formaPagamentoTexto =
              formaPagamento.options[formaPagamento.selectedIndex].text;
            mensagem += `💳 *Pagamento*: ${formaPagamentoTexto}\n`;
          }

          // Método de envio e dados específicos
          if (exibirStep2) {
            const metodoLabel = document
              .querySelector(`input[value="${metodoEnvio}"]`)
              ?.parentElement?.querySelector("label")?.innerText;

            if (metodoEnvio === "local") {
              mensagem += `🍽️ *Consumo no Local*\n`;
              // Verificar se o campo cliente-mesa existe e está preenchido
              const mesa = document.getElementById("cliente-mesa");
              if (mesa && mesa.value.trim()) {
                mensagem += `📌 *Mesa/Comanda*: ${mesa.value.trim()}\n`;
              } else if (document.getElementById("mesa-comanda")) {
                const mesaComanda = document
                  .getElementById("mesa-comanda")
                  .value.trim();
                if (mesaComanda) {
                  mensagem += `📌 *Mesa/Comanda*: ${mesaComanda}\n`;
                }
              }
            } else if (metodoEnvio === "delivery") {
              mensagem += `🚗 *Entrega - Delivery*\n`;
              const endereco = document.getElementById("cliente-endereco");
              if (endereco && endereco.value.trim()) {
                mensagem += `🏠 *Endereço*: ${endereco.value.trim()}\n`;
              }
              // Removida a mensagem de taxa de entrega conforme solicitado
            } else if (metodoEnvio === "retirada") {
              mensagem += `🛍️ *Cliente vai Retirar no Local*\n`;
            }
          }

          // Observações gerais
          const obsGerais = document.getElementById("cliente-obs");
          if (obsGerais && obsGerais.value.trim()) {
            mensagem += `\n💬 *OBSERVAÇÕES*\n${obsGerais.value.trim()}\n`;
          }

          // Lista de itens
          mensagem += `\n🛒 *ITENS DO PEDIDO*\n`;
          let valorTotal = 0;

          this.itens.forEach((item, index) => {
            // Calcular preço individual e total do item
            const precoBase = item.precoBase || 0;
            const precoAdicional = item.precoAdicional || 0;
            const precoTotalItem = precoBase + precoAdicional;
            const precoTotalComQuantidade = precoTotalItem * item.quantidade;

            // Adicionar ao valor total do pedido
            valorTotal += precoTotalComQuantidade;

            // Formatar preços para exibição
            const precoFormatado = `R$ ${precoTotalItem
              .toFixed(2)
              .replace(".", ",")}`;
            const precoTotalFormatado = `R$ ${precoTotalComQuantidade
              .toFixed(2)
              .replace(".", ",")}`;

            // Adicionar informações do item à mensagem
            mensagem += `\n${index + 1}. ${item.titulo} (${
              item.quantidade
            }x) - ${precoFormatado}/un`;
            if (item.quantidade > 1)
              mensagem += ` - Total: ${precoTotalFormatado}`;
            if (item.precoAdicional > 0)
              mensagem += `\n   ℹ️ Com adição de R$ ${item.precoAdicional
                .toFixed(2)
                .replace(".", ",")}`;
            if (item.observacao) mensagem += `\n   ➡️ _${item.observacao}_`;
            mensagem += `\n`;
          });

          // Adicionar valor total do pedido à mensagem
          const valorTotalFormatado = `R$ ${valorTotal
            .toFixed(2)
            .replace(".", ",")}`;
          mensagem += `\n💰 *VALOR TOTAL:* ${valorTotalFormatado}\n`;

          mensagem += `\n✅ *Pedido Finalizado* - Aguardando confirmação do estabelecimento\n`;
          mensagem += `\n👍 Obrigado pela preferência!`;

          // Codificar mensagem para URL
          const mensagemCodificada = encodeURIComponent(mensagem);

          // Número de WhatsApp do estabelecimento da planilha
          const whatsappNumero = dadosGlobais.config["WhatsApp"];
          if (!whatsappNumero) {
            alert("Número de WhatsApp não configurado na planilha.");
            return;
          }

          // Remover caracteres não numéricos do número
          const numeroLimpo = whatsappNumero.replace(/\D/g, "");

          // Detectar o dispositivo e enviar o pedido de forma adequada
          enviarPedidoWhatsApp(numeroLimpo, mensagemCodificada);

          // Criar função para limpar tudo após um pequeno delay (para garantir que o WhatsApp foi aberto)
          const limparTudoEResetar = () => {
            // Limpar o carrinho (isto remove os itens da memória)
            this.limpar();

            // Remover completamente do localStorage (para garantir reset completo)
            localStorage.removeItem("carrinho");

            // Resetar todos os inputs do formulário
            document
              .querySelectorAll(
                'input[type="text"], input[type="tel"], textarea'
              )
              .forEach((input) => {
                input.value = "";
              });

            document.querySelectorAll("select").forEach((select) => {
              if (select.options.length > 0) {
                select.selectedIndex = 0;
              }
            });

            // Resetar opções de entrega
            document
              .querySelectorAll('input[name="metodo-envio"]')
              .forEach((radio) => {
                radio.checked = false;
              });

            // Fechar o modal e restaurar a rolagem
            fecharModal();

            // Garantir que a rolagem está habilitada
            document.body.classList.remove("overflow-hidden");
            document.documentElement.classList.remove("overflow-hidden");

            // Voltar para o step 1 para futuros pedidos
            Carrinho.mostrarStep(1);

            // Atualizar o contador do carrinho e botão flutuante
            atualizarContadorCarrinho();

            // Remover quaisquer classes ou estados que possam causar travamento
            document.querySelectorAll(".modal-fixed").forEach((modal) => {
              modal.style.position = "";
            });

                      };

          // Executar a limpeza após um pequeno delay para garantir que o WhatsApp foi aberto
          setTimeout(limparTudoEResetar, 500);
        },
      };

      // Carrega o sistema de carrinho após o cardápio ser renderizado
      document.addEventListener("DOMContentLoaded", function () {
        // Inicialização imediata para garantir que o objeto esteja disponível
        Carrinho.inicializar();

        // Observa quando o cardápio é renderizado para configurar todos os eventos novamente
        const observer = new MutationObserver(function (mutations, observer) {
          if (document.querySelector("#cardapio .categoria-secao")) {
                        // Reconfigurar eventos para os novos elementos adicionados ao DOM
            Carrinho.configurarEventos();
            observer.disconnect();
          }
        });

        observer.observe(document.body, {
          childList: true,
          subtree: true,
        });
      });

      // Garantir que o objeto Carrinho esteja acessível globalmente
      window.Carrinho = Carrinho;

      /**
       * Funcionalidade de Compartilhamento
       * Desenvolvido por Dante Testa (https://dantetesta.com.br)
       */

      // Função para compartilhar URL usando a API Web Share
      async function compartilharURL(url, titulo = document.title) {
        // Verificar se a API Web Share está disponível
        if (navigator.share) {
          try {
            await navigator.share({
              title: titulo,
              url: url,
            });
            mostrarFeedback("Compartilhado com sucesso!");
          } catch (error) {
            console.error("Erro ao compartilhar:", error);
            // Se o usuário cancelou o compartilhamento, não mostrar erro
            if (error.name !== "AbortError") {
              copiarParaClipboard(url);
            }
          }
        } else {
          // Fallback para navegadores que não suportam a API Web Share
          copiarParaClipboard(url);
        }
      }

      // Função para compartilhar a URL geral do site
      function compartilharSite() {
        const url = window.location.origin + window.location.pathname;
        const titulo = document.title;
        compartilharURL(url, titulo);
      }

      // Função para compartilhar uma categoria específica
      function compartilharCategoria(categoriaId, categoriaNome) {
        const url =
          window.location.origin + window.location.pathname + "#" + categoriaId;
        const titulo = categoriaNome + " - " + document.title;
        compartilharURL(url, titulo);
      }

      // Função para copiar URL para a área de transferência (fallback)
      function copiarParaClipboard(url) {
        // Criar um elemento temporário
        const input = document.createElement("input");
        input.value = url;
        document.body.appendChild(input);
        input.select();

        try {
          // Copiar para a área de transferência
          document.execCommand("copy");
          mostrarFeedback("Link copiado para a área de transferência!");
        } catch (err) {
          console.error("Erro ao copiar:", err);
          mostrarFeedback("Não foi possível copiar o link");
        }

        document.body.removeChild(input);
      }

      // Função para mostrar feedback visual ao usuário
      function mostrarFeedback(mensagem) {
        // Verificar se o elemento de feedback já existe
        let feedback = document.querySelector(".compartilhamento-feedback");

        // Se não existir, criar um novo
        if (!feedback) {
          feedback = document.createElement("div");
          feedback.className = "compartilhamento-feedback";
          document.body.appendChild(feedback);
        }

        // Definir a mensagem e mostrar o feedback
        feedback.textContent = mensagem;
        feedback.classList.add("ativo");

        // Remover após 2 segundos
        setTimeout(() => {
          feedback.classList.remove("ativo");
        }, 2000);
      }

      // Adicionar botão flutuante de compartilhamento geral após o carregamento do DOM
      document.addEventListener("DOMContentLoaded", function () {
        
        // Criar o botão flutuante para compartilhar o site
        const botaoCompartilharGeral = document.createElement("button");
        botaoCompartilharGeral.className = "btn-compartilhar-geral";
        botaoCompartilharGeral.setAttribute(
          "aria-label",
          "Compartilhar este cardápio"
        );
        botaoCompartilharGeral.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="18" cy="5" r="3"></circle>
            <circle cx="6" cy="12" r="3"></circle>
            <circle cx="18" cy="19" r="3"></circle>
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
        </svg>
    `;
        botaoCompartilharGeral.onclick = compartilharSite;
        document.body.appendChild(botaoCompartilharGeral);

        // Verificar se o cardápio já está carregado
        if (document.querySelector(".categoria-secao")) {
                    setTimeout(adicionarBotoesCompartilharCategorias, 500); // Pequeno delay para garantir que as imagens estão carregadas
        }

        // Observar o cardápio para adicionar botões de compartilhamento às categorias
        const observerCardapio = new MutationObserver(function (mutations) {
          for (const mutation of mutations) {
            if (
              mutation.type === "childList" &&
              document.querySelector(".categoria-secao")
            ) {
                            // Adicionar botões de compartilhamento nas imagens das categorias com um pequeno delay
              // para garantir que as imagens estão completamente carregadas
              setTimeout(adicionarBotoesCompartilharCategorias, 500);
              // Desconectar o observer após adicionar os botões
              observerCardapio.disconnect();
                            break;
            }
          }
        });

        // Iniciar a observação do cardápio
        const cardapioElement = document.getElementById("cardapio");
        if (cardapioElement) {
                    observerCardapio.observe(cardapioElement, {
            childList: true,
            subtree: true,
          });
        } else {
          console.error(
            "Elemento #cardapio não encontrado - Impossível observar mutações"
          );
        }

        // Adicionar um listener para o evento de carregamento completo da página
        window.addEventListener("load", function () {
                    // Verificar se os botões já foram adicionados, caso contrário adicionar
          if (!document.querySelector(".btn-compartilhar-categoria")) {
                        setTimeout(adicionarBotoesCompartilharCategorias, 500);
          }
        });
      });

      // Adicionar botões de compartilhamento nas categorias
      function adicionarBotoesCompartilharCategorias() {
        
        // Selecionar todas as seções de categorias
        const categorias = document.querySelectorAll(".categoria-secao");
        
        categorias.forEach((categoria, index) => {
          // Encontrar a imagem da categoria diretamente dentro da div mb-8
          const divContainer = categoria.querySelector(".mb-8");
          const imagemContainer = divContainer
            ? divContainer.querySelector("img")
            : null;

          
          if (imagemContainer) {
            // Verificar se a imagem já está dentro de um container
            const parentElement = imagemContainer.parentElement;
            let container;

            // Verificar se o container já existe
            if (
              parentElement.classList.contains("categoria-imagem-container")
            ) {
                            container = parentElement;
              // Remover botão existente se houver
              const botaoExistente = container.querySelector(
                ".btn-compartilhar-categoria"
              );
              if (botaoExistente) {
                container.removeChild(botaoExistente);
              }
            } else {
              // Criar container para posicionamento relativo
              container = document.createElement("div");
              container.className = "categoria-imagem-container";

              // Mover a imagem para o novo container
              parentElement.insertBefore(container, imagemContainer);
              container.appendChild(imagemContainer);
                          }

            // Garantir que o container tenha position: relative
            container.style.position = "relative";
            container.style.width = "100%";

            // Criar botão de compartilhamento com estilo inline para garantir visibilidade
            const botaoCompartilhar = document.createElement("button");
            botaoCompartilhar.className = "btn-compartilhar-categoria";
            botaoCompartilhar.setAttribute(
              "aria-label",
              "Compartilhar esta categoria"
            );

            // Aplicar estilos inline para garantir visibilidade
            botaoCompartilhar.style.position = "absolute";
            botaoCompartilhar.style.top = "10px";
            botaoCompartilhar.style.right = "10px";
            botaoCompartilhar.style.width = "36px";
            botaoCompartilhar.style.height = "36px";
            botaoCompartilhar.style.borderRadius = "50%";
            botaoCompartilhar.style.backgroundColor =
              "rgba(255, 255, 255, 0.9)";
            botaoCompartilhar.style.color = "var(--primary-color)";
            botaoCompartilhar.style.display = "flex";
            botaoCompartilhar.style.alignItems = "center";
            botaoCompartilhar.style.justifyContent = "center";
            botaoCompartilhar.style.boxShadow = "0 2px 4px rgba(0, 0, 0, 0.2)";
            botaoCompartilhar.style.border = "none";
            botaoCompartilhar.style.cursor = "pointer";
            botaoCompartilhar.style.transition = "all 0.2s ease";
            botaoCompartilhar.style.zIndex = "10";

            botaoCompartilhar.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 20px; height: 20px;">
                    <circle cx="18" cy="5" r="3"></circle>
                    <circle cx="6" cy="12" r="3"></circle>
                    <circle cx="18" cy="19" r="3"></circle>
                    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
                </svg>
            `;

            // Obter o ID da categoria para a âncora
            const categoriaId = categoria.id;
            const tituloElement = categoria.querySelector("h2");
            const categoriaNome = tituloElement
              ? tituloElement.textContent.trim()
              : "Categoria";

            // Adicionar evento de clique para compartilhar esta categoria específica
            botaoCompartilhar.onclick = function (e) {
              e.preventDefault();
              e.stopPropagation();
              compartilharCategoria(categoriaId, categoriaNome);
            };

            // Adicionar o botão ao container
            container.appendChild(botaoCompartilhar);
                      }
        });
      }
