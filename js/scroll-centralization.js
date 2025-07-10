      // Função para centralizar o item do menu mobile ao fazer scroll (comportamento iFood)
      function setupScrollCentralization() {
        const categoryMenu = document.getElementById("category-scroll");
        const categoryItems = document.querySelectorAll(".category-item");

        // Verificar se existe o menu de categorias
        if (!categoryMenu || categoryItems.length === 0) return;

        // Coletar IDs das seções de categoria e configurar navegação por âncoras
        let sections = [];
        categoryItems.forEach((item) => {
          const targetId = item.getAttribute("data-target");
          if (targetId) {
            const section = document.getElementById(targetId);
            if (section) {
              // Configurar âncora de navegação
              item.href = `#${targetId}`;

              // Adicionar ao array de seções para rastreamento
              sections.push({
                id: targetId,
                menuItem: item,
                section: section,
                top: 0, // Será calculado depois
                bottom: 0, // Será calculado depois
              });
            }
          }
        });

        // Função otimizada para atualizar as posições das seções durante o scroll
        function atualizarPosicoesSecoes() {
          // Atualizar as posições absolutas de cada seção no documento
          sections.forEach((secInfo) => {
            if (!secInfo.section) return;

            const rect = secInfo.section.getBoundingClientRect();

            // Converter posições relativas à viewport para posições absolutas no documento
            secInfo.top = window.scrollY + rect.top;
            secInfo.bottom = window.scrollY + rect.bottom;
            secInfo.height = rect.height;

            // Guardar também as posições relativas para cálculos mais precisos
            secInfo.topRelative = rect.top;
            secInfo.bottomRelative = rect.bottom;
          });

          // Ordenar seções do topo para o fim da página para navegação consistente
          sections.sort((a, b) => a.top - b.top);
        }

        // Função para centralizar item do menu com animação suave
        function centralizarItemMenu(menuItem, comportamento = "smooth") {
          if (!categoryMenu || !menuItem) return;

          const menuRect = categoryMenu.getBoundingClientRect();
          const itemRect = menuItem.getBoundingClientRect();

          // Calcular o deslocamento para centralizar o item
          const menuCenterX = menuRect.width / 2;

          // Posição do item em relação ao menu de categorias (não ao viewport)
          // Usar offsetLeft para posicionamento correto em relação ao container
          let targetScrollLeft =
            menuItem.offsetLeft - menuCenterX + itemRect.width / 2;

          // Garantir que não ultrapasse os limites
          targetScrollLeft = Math.max(
            0,
            Math.min(
              targetScrollLeft,
              categoryMenu.scrollWidth - menuRect.width
            )
          );

          // Aplicar scroll com comportamento especificado (suave ou instant)
          categoryMenu.scrollTo({
            left: targetScrollLeft,
            behavior: comportamento,
          });

          // Adicionar classe visual para destacar o item centralizado
          menuItem.classList.add("centered-item");
        }

        // Disponibilizar função globalmente para uso em outras rotinas
        window.centralizarItemMenu = centralizarItemMenu;

        // Função melhorada para encontrar a seção ativa com base no scroll atual (comportamento estilo iFood)
        function encontrarSecaoAtiva() {
          // Obter posição de scroll e dimensões da viewport
          const scrollPosition = window.scrollY;
          const viewportHeight = window.innerHeight;

          // Calcular tamanho do header fixo para compensar na detecção
          const unifiedHeader = document.getElementById("unified-header");
          const headerTotalHeight = unifiedHeader
            ? unifiedHeader.offsetHeight
            : 0;

          // O ponto de detecção é no topo da viewport visível + um pequeno offset
          // Isso garante que a categoria seja ativada quando entrar na área visível
          const topVisibleArea = scrollPosition + headerTotalHeight + 50; // 50px de offset

          
          // Se estiver no topo da página, selecionar a primeira seção
          if (scrollPosition < 50) {
            return sections[0];
          }

          // Verificar cada seção para ver qual está na área visível
          for (const secInfo of sections) {
            // Uma seção está na área visível se:
            // 1. O topo da seção está acima do ponto de detecção E
            // 2. O fundo da seção está abaixo do ponto de detecção
            if (
              secInfo.top <= topVisibleArea &&
              secInfo.bottom >= topVisibleArea
            ) {
              return secInfo;
            }
          }

          // Se nenhuma seção estiver diretamente visível, encontrar a mais próxima
          let closest = sections[0];
          let closestDistance = Infinity;

          sections.forEach((secInfo) => {
            // Se a seção está abaixo do ponto de detecção
            if (secInfo.top > topVisibleArea) {
              const distance = secInfo.top - topVisibleArea;
              if (distance < closestDistance) {
                closestDistance = distance;
                closest = secInfo;
              }
            }
            // Se a seção está acima do ponto de detecção
            else if (secInfo.bottom < topVisibleArea) {
              const distance = topVisibleArea - secInfo.bottom;
              if (distance < closestDistance) {
                closestDistance = distance;
                closest = secInfo;
              }
            }
          });

          return closest;
        }

        // Função principal aprimorada para controlar o scroll e atualizar o menu (comportamento iFood)
        function handleScroll() {
          // Atualizar as posições das seções a cada scroll
          atualizarPosicoesSecoes();

          // Encontrar a seção ativa baseada na posição do scroll
          const secaoAtiva = encontrarSecaoAtiva();

          
          if (secaoAtiva && secaoAtiva.menuItem) {
            // Variante anterior ativa para comparar mudanças
            const previousActive = document.querySelector(
              ".category-item.active"
            );
            const isNewActive = previousActive !== secaoAtiva.menuItem;

            // Remover classe de centralização de todos os itens
            categoryItems.forEach((item) =>
              item.classList.remove("centered-item")
            );

            // Atualizar classe ativa sempre para garantir que funcione
            // Remover classe ativa de todos os itens
            categoryItems.forEach((item) => item.classList.remove("active"));

            // Adicionar classe ativa ao item atual
            secaoAtiva.menuItem.classList.add("active");

            // Centralizar o item do menu no modo suave quando há mudança de categoria
            centralizarItemMenu(secaoAtiva.menuItem, "smooth");

            // Atualizar a URL sem recarregar a página (para manter histórico de navegação)
            const targetId = secaoAtiva.id;
            if (targetId) {
              history.replaceState(null, null, `#${targetId}`);
            }

            if (isNewActive) {
                          }
          }
        }

        // Configurar a detecção de scroll otimizada para garantir centralização suave durante o scroll
        let lastScrollTime = 0;
        const scrollThrottle = 50; // milisegundos entre atualizações (reduzido para maior suavidade)

        window.addEventListener(
          "scroll",
          function (e) {
            const now = Date.now();

            // Usar throttling para limitar o número de atualizações
            if (now - lastScrollTime >= scrollThrottle) {
              // Usar requestAnimationFrame para sincronizar com o ciclo de renderização
              window.requestAnimationFrame(function () {
                handleScroll();
              });

              lastScrollTime = now;
            }
          },
          { passive: true }
        );

        // Verificar se há um hash na URL ao carregar a página para navegação direta
        window.addEventListener("load", function () {
          if (window.location.hash) {
            const targetId = window.location.hash.substring(1);
            const targetSection = document.getElementById(targetId);
            if (targetSection) {
              const targetMenuItem = document.querySelector(
                `.category-item[data-target="${targetId}"]`
              );
              if (targetMenuItem) {
                // Remover classe ativa de todos os itens
                categoryItems.forEach((item) =>
                  item.classList.remove("active")
                );
                // Adicionar classe ativa ao item alvo
                targetMenuItem.classList.add("active");
                // Centralizar item no menu
                centralizarItemMenu(targetMenuItem);

                // Scroll para a seção com offset após um pequeno atraso
                setTimeout(() => {
                  const unifiedHeader =
                    document.getElementById("unified-header");
                  const headerOffset = unifiedHeader
                    ? unifiedHeader.offsetHeight
                    : 0;
                  const elementPosition =
                    targetSection.getBoundingClientRect().top;
                  const offsetPosition =
                    elementPosition + window.pageYOffset - headerOffset - 20;
                  window.scrollTo({
                    top: offsetPosition,
                    behavior: "smooth",
                  });
                }, 300);
              }
            }
          }
        });

        // Inicializar as posições das seções e configurar estado inicial
        window.addEventListener("load", function () {
          setTimeout(() => {
            atualizarPosicoesSecoes();
            handleScroll();
          }, 500);
        });

        // Adicionar event listeners para os cliques nos itens do menu
        categoryItems.forEach((item) => {
          item.addEventListener("click", function (e) {
            // Impedir comportamento padrão para controlar a navegação manualmente
            e.preventDefault();

            // Remover classe ativa de todos os itens
            categoryItems.forEach((item) => item.classList.remove("active"));

            // Adicionar classe ativa a este item
            this.classList.add("active");

            // Centralizar o item imediatamente
            centralizarItemMenu(this);

            // Navegação para a seção correspondente
            const targetId = this.getAttribute("data-target");
            if (targetId) {
              const targetSection = document.getElementById(targetId);
              if (targetSection) {
                // Calcular posição com offset para o header
                const unifiedHeader = document.getElementById("unified-header");
                const headerOffset = unifiedHeader
                  ? unifiedHeader.offsetHeight
                  : 0;
                const elementPosition =
                  targetSection.getBoundingClientRect().top;
                const offsetPosition =
                  elementPosition + window.pageYOffset - headerOffset - 20;

                // Scroll suave para a posição
                window.scrollTo({
                  top: offsetPosition,
                  behavior: "smooth",
                });

                // Atualizar URL sem recarregar a página (para manter estado da âncora)
                history.pushState(null, null, `#${targetId}`);
              }
            }

            // Pequeno atraso para centralizar novamente após o scroll para a seção
            setTimeout(() => {
              centralizarItemMenu(this);
            }, 600);
          });
        });

        // Inicialização imediata
        atualizarPosicoesSecoes();
        handleScroll();
      }

      // Função para verificar a forma de pagamento e mostrar/ocultar o campo de troco
      function verificarFormaPagamento() {
        const formaPagamento = document.getElementById("forma-pagamento");
        const containerTroco = document.getElementById("container-troco");

        if (formaPagamento && containerTroco) {
          // Verificar se a forma de pagamento é dinheiro
          if (formaPagamento.value.toLowerCase() === "dinheiro") {
            containerTroco.classList.remove("hidden");
          } else {
            containerTroco.classList.add("hidden");
          }
        }
      }

      // Função para mostrar/ocultar o campo de valor do troco
      function mostrarCampoTroco(mostrar) {
        const campoValorTroco = document.getElementById("campo-valor-troco");
        if (campoValorTroco) {
          if (mostrar) {
            campoValorTroco.classList.remove("hidden");
          } else {
            campoValorTroco.classList.add("hidden");
          }
        }
      }

      // Função para formatar o campo de valor do troco como moeda brasileira (R$ 1.000,00)
      function formatarMoeda(campo) {
        // Remover tudo que não for número
        let valor = campo.value.replace(/\D/g, "");

        // Tratar caso especial de valor vazio ou zero
        if (!valor || valor === "0") {
          campo.value = "";
          return;
        }

        // Converter para número e dividir por 100 para considerar os centavos
        valor = (parseInt(valor, 10) / 100).toFixed(2);

        // Substituir ponto por vírgula e adicionar separador de milhar
        valor = valor.replace(".", ",");
        if (valor.length > 6) {
          // Adicionar separador de milhar
          valor = valor.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
        }

        // Adicionar prefixo R$
        campo.value = `R$ ${valor}`;

        // Posicionar o cursor no final do campo
        setTimeout(() => {
          campo.selectionStart = campo.value.length;
          campo.selectionEnd = campo.value.length;
        }, 0);
      }

      /**
       * Função para formatar o CEP enquanto o usuário digita
       * @param {HTMLInputElement} input - O elemento input do CEP
       */
      function formatarCep(input) {
        let cep = input.value.replace(/\D/g, ""); // Remove caracteres não numéricos

        if (cep.length > 5) {
          cep = cep.substring(0, 5) + "-" + cep.substring(5, 8);
        }

        input.value = cep;
      }

      /**
       * Função para buscar o endereço pelo CEP utilizando a API ViaCEP
       * @param {string} cep - O CEP a ser consultado
       */
      function buscarCep(cep) {
        
        // Remove caracteres não numéricos
        cep = cep.replace(/\D/g, "");

        // Verifica se o CEP tem 8 dígitos
        if (cep.length !== 8) {
          mostrarFeedbackCep(
            "CEP inválido. Por favor, informe um CEP com 8 dígitos.",
            "erro"
          );
          return;
        }

        // Mostra feedback de carregamento
        mostrarFeedbackCep("Buscando endereço...", "carregando");

        // Faz a requisição para a API ViaCEP
        fetch(`https://viacep.com.br/ws/${cep}/json/`)
          .then((response) => {
            if (!response.ok) {
              throw new Error("Erro ao consultar o CEP");
            }
            return response.json();
          })
          .then((data) => {
            
            if (data.erro) {
              // CEP não encontrado
              mostrarFeedbackCep(
                "CEP não encontrado. Verifique o número informado.",
                "erro"
              );
              limparCamposEndereco();
            } else {
              // Preenche os campos com os dados retornados
              const inputEndereco = document.getElementById("endereco");
              const inputBairro = document.getElementById("bairro");
              const inputCidade = document.getElementById("cidade");
              const inputEstado = document.getElementById("estado");

              if (inputEndereco) inputEndereco.value = data.logradouro || "";
              if (inputBairro) inputBairro.value = data.bairro || "";
              if (inputCidade) inputCidade.value = data.localidade || "";
              if (inputEstado)
                inputEstado.value = data.uf ? data.uf.toUpperCase() : "";

              // Foca no campo número se o endereço foi encontrado
              const inputNumero = document.getElementById("numero");
              if (inputNumero) inputNumero.focus();

              // Mostra feedback de sucesso
              mostrarFeedbackCep("Endereço encontrado com sucesso!", "sucesso");

              // Atualiza o campo oculto com o endereço completo
              setTimeout(() => atualizarEnderecoCompleto(), 100);
            }
          })
          .catch((error) => {
            console.error("Erro ao buscar CEP:", error);
            mostrarFeedbackCep(
              "Erro ao consultar o CEP. Tente novamente.",
              "erro"
            );
          });
      }

      /**
       * Função para mostrar feedback da busca de CEP
       * @param {string} mensagem - A mensagem de feedback
       * @param {string} tipo - O tipo de feedback (sucesso, erro, carregando)
       */
      function mostrarFeedbackCep(mensagem, tipo) {
        const feedbackElement = document.getElementById("cep-feedback");

        // Define a cor do texto baseada no tipo de feedback
        let corClasse = "";
        switch (tipo) {
          case "sucesso":
            corClasse = "text-green-600";
            break;
          case "erro":
            corClasse = "text-red-600";
            break;
          case "carregando":
            corClasse = "text-blue-600";
            break;
          default:
            corClasse = "text-gray-600";
        }

        // Remove classes anteriores e adiciona a nova
        feedbackElement.className = "mt-1 text-sm " + corClasse;

        // Define a mensagem
        feedbackElement.textContent = mensagem;

        // Mostra o elemento
        feedbackElement.classList.remove("hidden");

        // Se for sucesso, oculta após 3 segundos
        if (tipo === "sucesso") {
          setTimeout(() => {
            feedbackElement.classList.add("hidden");
          }, 3000);
        }
      }

      /**
       * Função para limpar os campos de endereço
       */
      function limparCamposEndereco() {
        document.getElementById("endereco").value = "";
        document.getElementById("bairro").value = "";
        document.getElementById("cidade").value = "";
        document.getElementById("estado").value = "";
        document.getElementById("numero").value = "";
        document.getElementById("complemento").value = "";
      }

      /**
       * Função para atualizar o campo oculto com o endereço completo formatado
       */
      function atualizarEnderecoCompleto() {
        const endereco = document.getElementById("endereco").value;
        const numero = document.getElementById("numero").value;
        const complemento = document.getElementById("complemento").value;
        const bairro = document.getElementById("bairro").value;
        const cidade = document.getElementById("cidade").value;
        const estado = document.getElementById("estado").value;

        let enderecoCompleto = "";

        // Monta o endereço completo
        if (endereco) enderecoCompleto += endereco;
        if (numero) enderecoCompleto += `, ${numero}`;
        if (complemento) enderecoCompleto += `, ${complemento}`;
        if (bairro) enderecoCompleto += ` - ${bairro}`;
        if (cidade) enderecoCompleto += `, ${cidade}`;
        if (estado) enderecoCompleto += `/${estado}`;

        // Atualiza o campo oculto
        document.getElementById("endereco-entrega").value = enderecoCompleto;
      }

      /**
       * Função para navegar automaticamente para a âncora após carregamento
       * Esta função verifica se existe uma âncora pendente e rola a página até ela
       */
      function navegarParaAncoraPendente() {
        // Verificar se existe uma âncora pendente salva durante o carregamento ou na URL atual
        const ancoraPendente =
          window.ancoraPendente ||
          (window.location.hash ? window.location.hash.substring(1) : null);

        if (ancoraPendente) {
          
          // Buscar o elemento correspondente à âncora
          const elemento = document.getElementById(ancoraPendente);

          if (elemento) {
            
            // Pequeno atraso para garantir que todos os elementos estejam renderizados
            // e que o layout esteja estável
            setTimeout(() => {
              // Rolar suavemente até o elemento com offset para o menu fixo
              const headerOffset =
                document.getElementById("unified-header").offsetHeight;
              const scrollOffset = Math.max(headerOffset, 170);

              // Usar scrollTo em vez de scrollIntoView para aplicar offset personalizado
              const elementoTop =
                elemento.getBoundingClientRect().top + window.pageYOffset;
              window.scrollTo({
                top: elementoTop - scrollOffset,
                behavior: "smooth",
              });

              // Centralizar o item correspondente no menu de categorias
              const menuItem = document.querySelector(
                `.category-item[href="#${ancoraPendente}"]`
              );
              if (menuItem) {
                centralizarItemMenu(menuItem);
              }

              // Limpar a âncora pendente após a navegação
              window.ancoraPendente = null;

              // Adicionar um log de sucesso
                          }, 300); // Aumentado para 300ms para garantir que todos os elementos estejam estáveis
          } else {
                        // Tentar novamente após um tempo maior, caso o elemento ainda não tenha sido criado
            setTimeout(() => {
              const elementoRetentativa =
                document.getElementById(ancoraPendente);
              if (elementoRetentativa) {
                                // Rolar suavemente até o elemento com offset para o menu fixo
                const headerOffset =
                  document.getElementById("unified-header").offsetHeight;
                const scrollOffset = Math.max(headerOffset, 170);

                // Usar scrollTo em vez de scrollIntoView para aplicar offset personalizado
                const elementoTop =
                  elementoRetentativa.getBoundingClientRect().top +
                  window.pageYOffset;
                window.scrollTo({
                  top: elementoTop - scrollOffset,
                  behavior: "smooth",
                });

                // Centralizar o item correspondente no menu de categorias
                const menuItem = document.querySelector(
                  `.category-item[href="#${ancoraPendente}"]`
                );
                if (menuItem) {
                  centralizarItemMenu(menuItem);
                }
              }
              window.ancoraPendente = null;
            }, 800);
          }
        }
      }

      // Executar a configuração após o carregamento do cardápio
      document.addEventListener("DOMContentLoaded", function () {
        
        // Função para tentar inicializar o scroll
        function inicializarScroll() {
          // Verificar se o cardápio já foi carregado
          if (document.querySelector("#cardapio .categoria-secao")) {
                        setupScrollCentralization();
            navegarParaAncoraPendente(); // Tentar navegar para âncora se existir
            return true;
          }
          return false;
        }

        // Tentar inicializar imediatamente
        if (!inicializarScroll()) {
                    // Se não, esperar até que o cardápio seja renderizado
          const observer = new MutationObserver(function (mutations, observer) {
            if (inicializarScroll()) {
                            observer.disconnect();
            }
          });

          observer.observe(document.body, {
            childList: true,
            subtree: true,
          });

          // Fallback com timeout para garantir que a inicialização ocorra
          setTimeout(() => {
            if (document.querySelector("#cardapio .categoria-secao")) {
                            setupScrollCentralization();
              observer.disconnect();
            }
          }, 2000);
        }
      });

      // Adicionar evento de scroll global para garantir que a função seja chamada
      window.addEventListener(
        "scroll",
        function () {
          // Verificar se o menu de categorias existe e tem itens
          const categoryMenu = document.getElementById("category-scroll");
          const categoryItems = document.querySelectorAll(".category-item");

          // Se existir e não houver nenhum item ativo, inicializar
          if (
            categoryMenu &&
            categoryItems.length > 0 &&
            !document.querySelector(".category-item.active")
          ) {
                        setupScrollCentralization();
          }
        },
        { passive: true }
      );
