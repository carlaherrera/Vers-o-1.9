      // URLs das planilhas (carregadas do arquivo config.js)
      const URLS = CONFIG_PLANILHAS;

      let dadosGlobais = {
        categorias: [],
        itens: [],
        config: {},
      };

      // Variáveis para o sistema de busca
      let todosItens = [];
      let searchTimeout;

      // Função utilitária para normalizar URLs de imagens, incluindo links de compartilhamento do Google Drive
      // Função removida conforme solicitado

      // Função para converter CSV em array de objetos com suporte a quebras de linha dentro de campos
      function csvToArray(csv) {
        // Pré-processamento para lidar com quebras de linha em campos entre aspas
        let processedCSV = "";
        let inQuotes = false;

        // Primeiro passo: transformar quebras de linha dentro de aspas em um marcador especial
        for (let i = 0; i < csv.length; i++) {
          const char = csv[i];

          if (char === '"') {
            inQuotes = !inQuotes;
            processedCSV += char;
          } else if (
            (char === "\n" ||
              char === "\r" ||
              (char === "\r" && csv[i + 1] === "\n")) &&
            inQuotes
          ) {
            // Substituir quebras de linha dentro de aspas por um marcador temporário
            processedCSV += "§§QUEBRALINHA§§";
            // Pular o \n adicional em sequências \r\n
            if (char === "\r" && csv[i + 1] === "\n") i++;
          } else {
            processedCSV += char;
          }
        }

        // Dividir em linhas usando quebras de linha reais
        const lines = processedCSV.trim().split(/\r?\n/);
        if (lines.length < 2) return [];

        // Processar cabeçalhos
        const headers = lines[0]
          .split(",")
          .map((h) => h.replace(/"/g, "").trim());

        // Processar linhas de dados
        return lines
          .slice(1)
          .map((line) => {
            const values = [];
            let current = "";
            inQuotes = false;

            for (let i = 0; i < line.length; i++) {
              const char = line[i];
              if (char === '"') {
                inQuotes = !inQuotes;
                // Manter as aspas nos valores para preservar formatação
                current += char;
              } else if (char === "," && !inQuotes) {
                // Limpar aspas extras e restaurar quebras de linha
                let processedValue = current
                  .trim()
                  .replace(/^"|"$/g, "") // Remover aspas no início e fim
                  .replace(/§§QUEBRALINHA§§/g, "\n"); // Restaurar quebras de linha

                values.push(processedValue);
                current = "";
              } else {
                current += char;
              }
            }

            // Processar o último valor da linha
            let processedValue = current
              .trim()
              .replace(/^"|"$/g, "") // Remover aspas no início e fim
              .replace(/§§QUEBRALINHA§§/g, "\n"); // Restaurar quebras de linha

            values.push(processedValue);

            // Criar objeto com os valores
            const obj = {};
            headers.forEach((header, index) => {
              obj[header] = values[index] !== undefined ? values[index] : "";
            });

            return obj;
          })
          .filter((obj) => Object.values(obj).some((val) => val !== ""));
      }

      // Função para aplicar cores dinâmicas da planilha
      function aplicarCoresDinamicas(config) {
        const root = document.documentElement;

        // Função auxiliar para converter cor hex para RGB
        function hexToRgb(hex) {
          // Remover o # se existir
          hex = hex.replace(/^#/, "");

          // Converter para valores RGB
          let r, g, b;
          if (hex.length === 3) {
            r = parseInt(hex.charAt(0) + hex.charAt(0), 16);
            g = parseInt(hex.charAt(1) + hex.charAt(1), 16);
            b = parseInt(hex.charAt(2) + hex.charAt(2), 16);
          } else {
            r = parseInt(hex.substring(0, 2), 16);
            g = parseInt(hex.substring(2, 4), 16);
            b = parseInt(hex.substring(4, 6), 16);
          }

          return `${r}, ${g}, ${b}`;
        }

        if (config["Cor Primária"]) {
          const corPrimaria = config["Cor Primária"];
          root.style.setProperty("--cor-primaria", corPrimaria);

          // Adicionar versão RGB para uso com transparência
          const rgbPrimaria = hexToRgb(corPrimaria);
          root.style.setProperty("--cor-primaria-rgb", rgbPrimaria);
        }

        if (config["Cor Secundária"]) {
          const corSecundaria = config["Cor Secundária"];
          root.style.setProperty("--cor-secundaria", corSecundaria);

          // Adicionar versão RGB para uso com transparência
          const rgbSecundaria = hexToRgb(corSecundaria);
          root.style.setProperty("--cor-secundaria-rgb", rgbSecundaria);
        }

        if (config["Cor de Fundo"]) {
          root.style.setProperty("--cor-fundo", config["Cor de Fundo"]);
          document.body.style.backgroundColor = config["Cor de Fundo"];
        }

        // Aplicar cor do texto
        if (config["Cor do Texto"]) {
          // Definir variável CSS
          root.style.setProperty("--cor-texto", config["Cor do Texto"]);

          // Aplicar a cor diretamente aos elementos de texto principais
          document
            .querySelectorAll(
              ".descricao-item, .nome-item, p:not(.text-primary-dynamic):not(.text-secondary-dynamic):not(.text-white):not(.link-color-dynamic):not(.text-rodape-dynamic)"
            )
            .forEach((el) => {
              el.classList.add("text-color-dynamic");
            });

          // Aplicar ao texto do cabeçalho que não tem cores específicas
          document.querySelectorAll("#slogan").forEach((el) => {
            el.classList.add("text-color-dynamic");
          });
        }

        // Aplicar cor do texto do rodapé
        if (config["Cor do Texto Rodapé"]) {
          // Definir variável CSS
          root.style.setProperty(
            "--cor-texto-rodape",
            config["Cor do Texto Rodapé"]
          );

          // Aplicar a cor aos elementos de texto do rodapé
          document
            .querySelectorAll(
              "#footer-dynamic p, #footer-dynamic .text-sm, #footer-dynamic .text-xs"
            )
            .forEach((el) => {
              el.classList.remove("text-color-dynamic"); // Remover classe de cor de texto geral se existir
              el.classList.add("text-rodape-dynamic");
            });
        }

        // Aplicar cor dos links
        if (config["Cor dos Links"]) {
          // Definir variável CSS
          root.style.setProperty("--cor-links", config["Cor dos Links"]);

          // Aplicar a cor diretamente aos links que não têm outras classes de cor
          // e que não estão no rodapé de créditos
          document
            .querySelectorAll(
              "a:not(.bg-primary-dynamic):not(.text-white):not(.text-primary-dynamic):not(.text-secondary-dynamic):not(.text-gray-500)"
            )
            .forEach((el) => {
              // Verificar se o link não está no rodapé de créditos
              if (!el.closest(".bg-gray-50")) {
                el.classList.add("link-color-dynamic");
              }
            });
        }

        const footer = document.getElementById("footer-dynamic");
        if (config["Cor Primária"] && config["Cor Secundária"]) {
          footer.style.background = `linear-gradient(135deg, ${config["Cor Primária"]} 0%, ${config["Cor Secundária"]} 100%)`;
        }

              }

      // Função para carregar dados das planilhas
      async function carregarDados() {
        try {
          
          const [categoriasRes, itensRes, configRes] = await Promise.all([
            fetch(URLS.categorias),
            fetch(URLS.itens),
            fetch(URLS.config),
          ]);

          const [categoriasCsv, itensCsv, configCsv] = await Promise.all([
            categoriasRes.text(),
            itensRes.text(),
            configRes.text(),
          ]);

          dadosGlobais.categorias = csvToArray(categoriasCsv);
          dadosGlobais.itens = csvToArray(itensCsv);

          // Debug: Verificar a estrutura dos dados da categoria
          if (dadosGlobais.categorias && dadosGlobais.categorias.length > 0) {
                                  }

          const configArray = csvToArray(configCsv);
          dadosGlobais.config = {};
          configArray.forEach((item) => {
            if (item.Campo && item.Valor) {
              dadosGlobais.config[item.Campo] = item.Valor;
            }
          });

          // Preparar dados para busca
          prepararDadosBusca();

          aplicarCoresDinamicas(dadosGlobais.config);
          aplicarConfiguracoes();
          renderizarCardapio();

          // Salvar a âncora atual para navegação após renderização completa
          if (window.location.hash) {
            window.ancoraPendente = window.location.hash.substring(1);
                      }
        } catch (error) {
          console.error("Erro ao carregar dados:", error);
          document.getElementById("loading").innerHTML =
            '<div class="text-center"><p class="text-red-600 text-xl">Erro ao carregar cardápio. Verifique sua conexão.</p></div>';
        }
      }

      // Função para preparar dados para busca
      function prepararDadosBusca() {
        todosItens = dadosGlobais.itens
          .filter((item) => item.Disponível === "Sim")
          .map((item) => {
            // Encontrar categoria do item
            const categoria = dadosGlobais.categorias.find(
              (cat) => cat.Nome_Categoria === item.Categoria
            );

            return {
              ...item,
              categoriaTitulo: categoria
                ? categoria.Título_Exibição
                : item.Categoria,
              searchText: `${item.Item} ${item.Descrição} ${item.Categoria} ${
                categoria ? categoria.Título_Exibição : ""
              } ${item.Classificação_Adicional || ""}`.toLowerCase(),
            };
          });
              }

      // Função de busca
      function realizarBusca(termo) {
        if (!termo || termo.length < 2) {
          mostrarEstadoVazio();
          return;
        }

        const termoLower = termo.toLowerCase();
        const resultados = todosItens.filter((item) =>
          item.searchText.includes(termoLower)
        );

        if (resultados.length === 0) {
          mostrarSemResultados();
        } else {
          mostrarResultados(resultados, termo);
        }
      }

      // Função para destacar texto
      function destacarTexto(texto, termo) {
        if (!termo || termo.length < 2) return texto;

        const regex = new RegExp(`(${termo})`, "gi");
        return texto.replace(regex, '<span class="highlight">$1</span>');
      }

      // Função para mostrar resultados
      function mostrarResultados(resultados, termo) {
        const searchEmpty = document.getElementById("search-empty");
        const searchItems = document.getElementById("search-items");
        const noResults = document.getElementById("no-results");

        searchEmpty.classList.add("hidden");
        noResults.classList.add("hidden");
        searchItems.classList.remove("hidden");

        searchItems.innerHTML = resultados
          .map(
            (item) => `
        <div class="search-item p-4 border border-gray-200 rounded-xl cursor-pointer" onclick="irParaItem('${
          item.Categoria
        }', '${item.Item}')">
            <div class="flex items-start space-x-4">
                ${
                  item.Foto_URL
                    ? `
                    <img src="${processarURLImagem(item.Foto_URL)}" alt="${
                        item.Item
                      }" class="w-16 h-16 object-cover rounded-lg flex-shrink-0">
                `
                    : `
                    <div class="w-16 h-16 bg-gray-200 rounded-lg flex-shrink-0 flex items-center justify-center">
                        <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                        </svg>
                    </div>
                `
                }
                <div class="flex-1 min-w-0">
                    <h4 class="font-semibold text-gray-900 mb-1">${destacarTexto(
                      item.Item,
                      termo
                    )}</h4>
                    <p class="text-sm text-gray-600 mb-2">${destacarTexto(
                      item.Descrição || "",
                      termo
                    )}</p>
                    <!-- Layout melhorado para mobile: categoria e preço em linhas separadas -->
                    <div class="flex flex-col space-y-2">
                        <div class="w-full overflow-hidden">
                            <span class="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full inline-block truncate max-w-full">${
                              item.categoriaTitulo
                            }</span>
                        </div>
                        <div class="w-full flex justify-between items-center">
                            <span class="font-bold text-primary-dynamic text-right w-full">${
                              item.Preço || "Consulte"
                            }</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `
          )
          .join("");
      }

      // Função para mostrar estado vazio
      function mostrarEstadoVazio() {
        const searchEmpty = document.getElementById("search-empty");
        const searchItems = document.getElementById("search-items");
        const noResults = document.getElementById("no-results");

        searchEmpty.classList.remove("hidden");
        searchItems.classList.add("hidden");
        noResults.classList.add("hidden");
      }

      // Função para mostrar sem resultados
      function mostrarSemResultados() {
        const searchEmpty = document.getElementById("search-empty");
        const searchItems = document.getElementById("search-items");
        const noResults = document.getElementById("no-results");

        searchEmpty.classList.add("hidden");
        searchItems.classList.add("hidden");
        noResults.classList.remove("hidden");
      }

      // Função para ir para item específico
      function irParaItem(categoria, nomeItem) {
        // Fechar busca
        fecharBusca();

        // Filtrar por categoria
        filtrarPorCategoria(categoria);

        // Scroll para o item específico
        setTimeout(() => {
          const elementos = document.querySelectorAll(".menu-item h3");
          for (let elemento of elementos) {
            if (elemento.textContent.trim() === nomeItem) {
              // Calcular posição com offset para menu fixo
              const menuItem = elemento.closest(".menu-item");
              const headerOffset =
                document.getElementById("unified-header").offsetHeight;
              const scrollOffset = Math.max(headerOffset, 170);

              // Usar scrollTo em vez de scrollIntoView para aplicar offset personalizado
              const itemTop =
                menuItem.getBoundingClientRect().top + window.pageYOffset;
              window.scrollTo({
                top: itemTop - scrollOffset,
                behavior: "smooth",
              });

              // Destacar temporariamente o item
              const card = elemento.closest(".menu-item");
              card.style.boxShadow = "0 0 0 3px var(--cor-primaria)";
              card.style.transition = "box-shadow 0.3s ease";

              setTimeout(() => {
                card.style.boxShadow = "";
              }, 2000);
              break;
            }
          }
        }, 300);
      }

      // Funções para controlar a busca
      function abrirBusca() {
        const overlay = document.getElementById("search-overlay");
        const container = document.getElementById("search-container");
        const input = document.getElementById("search-input");

        overlay.classList.remove("hidden");
        document.body.style.overflow = "hidden";

        setTimeout(() => {
          container.classList.add("active");
          input.focus();
        }, 50);
      }

      function fecharBusca() {
        const overlay = document.getElementById("search-overlay");
        const container = document.getElementById("search-container");
        const input = document.getElementById("search-input");

        container.classList.remove("active");
        document.body.style.overflow = "";

        setTimeout(() => {
          overlay.classList.add("hidden");
          input.value = "";
          mostrarEstadoVazio();
        }, 300);
      }

      // Aplicar configurações do site
      function aplicarConfiguracoes() {
        const config = dadosGlobais.config;

        // Título e identificação básica
        document.title = config["Título da Página"] || "Cardápio Online";
        document.getElementById("nome-empresa").textContent =
          config["Nome da Empresa"] || "Cafeteria";

        // Nome da empresa no rodapé
        const nomeEmpresaElement = document.getElementById(
          "footer-nome-empresa"
        );
        const nomeEmpresa = config["Nome da Empresa"] || "Cafeteria";
        nomeEmpresaElement.textContent = nomeEmpresa;
        nomeEmpresaElement.classList.add("text-rodape-dynamic");
        nomeEmpresaElement.classList.remove("text-color-dynamic");

        // Texto da taxa de delivery
        const textoTaxaDelivery = document.getElementById(
          "texto-taxa-delivery"
        );
        if (textoTaxaDelivery) {
          textoTaxaDelivery.textContent =
            config["Step-2-taxa-delivery"] ||
            "Consulte Taxa de Entrega para sua Região";
        }

        // Preencher as iniciais do nome da empresa no logo de texto mobile
        const logoTextMobile = document.getElementById("logo-text-mobile");
        if (logoTextMobile) {
          // Extrair as iniciais do nome da empresa (até 2 caracteres)
          const palavras = nomeEmpresa.split(" ");
          let iniciais = "";

          // Pegar a primeira letra de cada palavra, até 2 letras
          for (let i = 0; i < Math.min(2, palavras.length); i++) {
            if (palavras[i].length > 0) {
              iniciais += palavras[i][0].toUpperCase();
            }
          }

          // Se só tiver uma palavra, usar as duas primeiras letras
          if (iniciais.length === 1 && nomeEmpresa.length > 1) {
            iniciais += nomeEmpresa[1].toUpperCase();
          }

          logoTextMobile.textContent = iniciais;
        }

        // Configurações de SEO - usando os IDs para garantir que as meta tags sejam preenchidas corretamente
        // Descrição
        if (config["Descrição SEO"]) {
          document
            .getElementById("meta-description")
            .setAttribute("content", config["Descrição SEO"]);
          document
            .getElementById("og-description")
            .setAttribute("content", config["Descrição SEO"]);
          document
            .getElementById("twitter-description")
            .setAttribute("content", config["Descrição SEO"]);
        } else {
          const descricaoPadrao = `Cardápio online de ${
            config["Nome da Empresa"] || "Cafeteria"
          }`;
          document
            .getElementById("meta-description")
            .setAttribute("content", descricaoPadrao);
          document
            .getElementById("og-description")
            .setAttribute("content", descricaoPadrao);
          document
            .getElementById("twitter-description")
            .setAttribute("content", descricaoPadrao);
        }

        // Palavras-chave
        if (config["Palavras-chave"]) {
          document
            .getElementById("meta-keywords")
            .setAttribute("content", config["Palavras-chave"]);
        } else {
          document
            .getElementById("meta-keywords")
            .setAttribute("content", "cardápio, comida, restaurante");
        }

        // Idioma
        if (config["Idioma"]) {
          document.documentElement.lang = config["Idioma"];
        }

        // Título para compartilhamento
        const tituloPagina = config["Título da Página"] || "Cardápio Online";
        document
          .getElementById("og-title")
          .setAttribute("content", tituloPagina);
        document
          .getElementById("twitter-title")
          .setAttribute("content", tituloPagina);

        // URL e imagem para compartilhamento
        const urlAtual = window.location.href;
        document.getElementById("og-url").setAttribute("content", urlAtual);

        // Imagem para compartilhamento já definida diretamente no HTML
        // A URL da imagem é: https://jaguariunaonline.com.br/pipoca-gourmet-jaguariuna/img/amo-pipoca-gourmet.jpg

        // Configurar favicon
        if (config["Favicon URL"]) {
          document
            .querySelector('link[rel="icon"]')
            .setAttribute("href", processarURLImagem(config["Favicon URL"]));
        }

        // Imagem para compartilhamento social definida diretamente no HTML
        // Não é mais necessário configurar via JavaScript

        const sloganElement = document.getElementById("slogan");
        if (config["Slogan"]) {
          sloganElement.textContent = config["Slogan"];
          sloganElement.classList.remove("hidden");
        }

        // Logo para desktop
        if (config["Logo URL"]) {
          const logo = document.getElementById("logo");
          logo.src = processarURLImagem(config["Logo URL"]); // Processar URL para suportar Dropbox
          logo.classList.remove("hidden");
        }

        // Carregar opções de entrega da planilha
        carregarOpcoesEntrega(config);

        // Logo para mobile
        if (config["Logo Mobile URL"]) {
          const logoMobile = document.getElementById("logo-mobile");
          logoMobile.src = processarURLImagem(config["Logo Mobile URL"]); // Processar URL para suportar Dropbox
          logoMobile.classList.remove("hidden");
          logoMobile.classList.remove("rounded-full");
          logoMobile.classList.add(
            "w-3/4",
            "h-auto",
            "max-h-16",
            "object-contain",
            "rounded-lg"
          );
          document.getElementById("logo-text-mobile").style.display = "none";
        } else if (config["Logo URL"]) {
          const logoMobile = document.getElementById("logo-mobile");
          logoMobile.src = processarURLImagem(config["Logo URL"]); // Processar URL para suportar Dropbox
          logoMobile.classList.remove("hidden");
          logoMobile.classList.add(
            "w-3/4",
            "h-auto",
            "max-h-16",
            "object-contain",
            "rounded-lg"
          );
          document.getElementById("logo-text-mobile").style.display = "none";
        }

        // Informações de contato - ocultar seção inteira se não houver dados
        const temContato =
          config["Endereço Completo"] || config["Telefone"] || config["Email"];

        if (temContato) {
          document.getElementById("footer-contato").style.display = "block";

          // Mostrar ou ocultar cada campo individualmente
          if (config["Endereço Completo"]) {
            document.getElementById("endereco-estabelecimento").textContent =
              config["Endereço Completo"];
            document.getElementById("endereco-estabelecimento").style.display =
              "block";
            document
              .getElementById("endereco-estabelecimento")
              .classList.add("text-rodape-dynamic");
            document
              .getElementById("endereco-estabelecimento")
              .classList.remove("text-color-dynamic");
          } else {
            document.getElementById("endereco-estabelecimento").style.display =
              "none";
          }

          if (config["Telefone"]) {
            document.getElementById("telefone").textContent =
              config["Telefone"];
            document.getElementById("telefone").style.display = "block";
            document
              .getElementById("telefone")
              .classList.add("text-rodape-dynamic");
            document
              .getElementById("telefone")
              .classList.remove("text-color-dynamic");
          } else {
            document.getElementById("telefone").style.display = "none";
          }

          if (config["Email"]) {
            document.getElementById("email").textContent = config["Email"];
            document.getElementById("email").style.display = "block";
            document
              .getElementById("email")
              .classList.add("text-rodape-dynamic");
            document
              .getElementById("email")
              .classList.remove("text-color-dynamic");
          } else {
            document.getElementById("email").style.display = "none";
          }
        } else {
          // Ocultar toda a seção de contato
          document.getElementById("footer-contato").style.display = "none";
        }

        // Horários - ocultar seção inteira se não houver dados
        const temHorarios =
          config["Segunda a Sexta"] || config["Sábado"] || config["Domingo"];

        // Verificar se existe o campo Horários na planilha
        if (config["Horários"]) {
          // Exibir a seção de horários
          document.getElementById("footer-horario").style.display = "block";

          // Exibir o texto dos horários com quebras de linha preservadas
          const horariosElement = document.getElementById("horarios");
          horariosElement.textContent = config["Horários"];
          horariosElement.classList.add("text-rodape-dynamic");

          // Garantir que o texto seja exibido
          horariosElement.style.display = "block";
        } else {
          // Verificar os campos antigos para compatibilidade
          if (
            config["Segunda a Sexta"] ||
            config["Sábado"] ||
            config["Domingo"]
          ) {
            // Exibir a seção de horários
            document.getElementById("footer-horario").style.display = "block";

            // Construir o texto dos horários a partir dos campos antigos
            let textoHorarios = "";

            if (config["Segunda a Sexta"]) {
              textoHorarios += `Seg-Sex: ${config["Segunda a Sexta"]}\n`;
            }

            if (config["Sábado"]) {
              textoHorarios += `Sábado: ${config["Sábado"]}\n`;
            }

            if (config["Domingo"]) {
              textoHorarios += `Domingo: ${config["Domingo"]}`;
            }

            // Exibir o texto dos horários
            const horariosElement = document.getElementById("horarios");
            horariosElement.textContent = textoHorarios;
            horariosElement.classList.add("text-rodape-dynamic");
            horariosElement.style.display = "block";
          } else {
            // Ocultar toda a seção de horários se não houver dados
            document.getElementById("footer-horario").style.display = "none";
          }
        }

        // Links sociais dinâmicos baseados na planilha - ocultar seção inteira se não houver dados
        const linkInstagram = document.getElementById("link-instagram");
        const linkFacebook = document.getElementById("link-facebook");
        const linkWhatsapp = document.getElementById("link-whatsapp");

        const temRedesSociais =
          config["Instagram URL"] ||
          config["Facebook URL"] ||
          config["WhatsApp"];

        if (temRedesSociais) {
          document.getElementById("footer-redes").style.display = "block";

          // Mostrar ou ocultar cada rede social individualmente
          if (config["Instagram URL"]) {
            linkInstagram.href = config["Instagram URL"];
            linkInstagram.style.display = "block";
          } else {
            linkInstagram.style.display = "none";
          }

          if (config["Facebook URL"]) {
            linkFacebook.href = config["Facebook URL"];
            linkFacebook.style.display = "block";
          } else {
            linkFacebook.style.display = "none";
          }

          if (config["WhatsApp"]) {
            const whatsapp = config["WhatsApp"].replace(/\D/g, "");
            linkWhatsapp.href = `https://wa.me/${whatsapp}`;
            linkWhatsapp.style.display = "block";
          } else {
            linkWhatsapp.style.display = "none";
          }
        } else {
          // Ocultar toda a seção de redes sociais
          document.getElementById("footer-redes").style.display = "none";
        }

        // Configuração do Google Meu Negócio - ocultar seção inteira se não houver URL
        if (config["Google Meu Negócio URL"]) {
          document.getElementById("avaliacao-section").style.display = "block";
          document.getElementById("btn-avaliar").href =
            config["Google Meu Negócio URL"];
          document.getElementById("btn-avaliar").style.display = "inline-flex";
        } else {
          document.getElementById("avaliacao-section").style.display = "none";
        }

        if (config["Moeda"]) {
          window.moedaSite = config["Moeda"];
        }

        // Verificar configuração de modo de checkout
        const checkoutMode = config["Checkout-Mode"] || "Sim";
        
        // Controlar visibilidade do carrinho flutuante e controles de quantidade
        if (
          checkoutMode.toLowerCase() === "não" ||
          checkoutMode.toLowerCase() === "nao" ||
          checkoutMode.toLowerCase() === "no"
        ) {
          // Ocultar carrinho flutuante
          const carrinhoFlutuante =
            document.getElementById("carrinho-flutuante");
          if (carrinhoFlutuante) {
            carrinhoFlutuante.style.display = "none";
          }

          // Ocultar controles de quantidade e botões de adicionar ao carrinho
          // Esta configuração será aplicada quando o cardápio for renderizado
          window.ocultarControlesCarrinho = true;
        } else {
          // Mostrar carrinho flutuante
          const carrinhoFlutuante =
            document.getElementById("carrinho-flutuante");
          if (carrinhoFlutuante) {
            carrinhoFlutuante.style.display = "block";
          }

          // Mostrar controles de quantidade e botões de adicionar ao carrinho
          window.ocultarControlesCarrinho = false;
        }

              }

      // Função para processar URLs de imagens (Dropbox, Google Drive e outras fontes)
      function processarURLImagem(url) {
        if (!url) return "";

        // Converter URLs do Dropbox para formato raw
        if (url.includes("dropbox.com") && !url.includes("raw=1")) {
          // Se já tem parâmetros na URL, adiciona &raw=1, senão adiciona ?raw=1
          return url.includes("?") ? `${url}&raw=1` : `${url}?raw=1`;
        }

        // Processar URLs do Google Drive e Google Docs
        if (
          url.includes("drive.google.com") ||
          url.includes("docs.google.com")
        ) {
          // Extrair o ID da imagem do link do Google Drive
          let fileId = "";
          let originalUrl = url;

          try {
            
            // Padrão para links de compartilhamento: https://drive.google.com/file/d/ID_DA_IMAGEM/view?usp=drive_link ou usp=sharing
            if (url.includes("/file/d/")) {
              // Captura o ID entre /file/d/ e /view ou o final da string
              const match = url.match(/\/file\/d\/([^\/]+)(?:\/|$)/);
              if (match && match[1]) {
                fileId = match[1];
                              }
            }
            // Padrão para links de visualização direta: https://drive.google.com/uc?id=ID_DA_IMAGEM
            else if (url.includes("id=")) {
              const match = url.match(/id=([^&]+)/);
              if (match && match[1]) {
                fileId = match[1];
                              }
            }
            // Padrão para links de compartilhamento aberto: https://drive.google.com/open?id=ID_DA_IMAGEM
            else if (url.includes("/open?")) {
              const match = url.match(/open\?id=([^&]+)/);
              if (match && match[1]) {
                fileId = match[1];
                              }
            }
            // Padrão para links de visualização: https://docs.google.com/uc?export=view&id=ID_DA_IMAGEM
            else if (url.includes("export=view")) {
              const match = url.match(/id=([^&]+)/);
              if (match && match[1]) {
                fileId = match[1];
                              }
            }
            // Padrão para links compartilhados diretamente da interface do Google Drive
            else if (url.includes("sharing")) {
              try {
                const urlObj = new URL(url);
                const urlParams = new URLSearchParams(urlObj.search);
                const idParam = urlParams.get("id");
                if (idParam) {
                  fileId = idParam;
                                  }
              } catch (e) {
                console.warn("Erro ao analisar URL de compartilhamento:", e);
              }
            }
            // Padrão para links diretos do Google Drive
            else {
              // Tentar extrair o ID de qualquer parte da URL
              const idMatches = url.match(/[-\w]{25,}/);
              if (idMatches && idMatches[0]) {
                fileId = idMatches[0];
                              }
            }

            // Limpar o ID (remover qualquer parâmetro adicional)
            if (fileId) {
              fileId = fileId.split("&")[0];
              fileId = fileId.split("#")[0];
              fileId = fileId.split("?")[0];
              fileId = fileId.split("/")[0]; // Remover qualquer caminho após o ID

              // Verificar se o ID parece válido (geralmente tem entre 25-35 caracteres)
              if (fileId.length < 25 || fileId.length > 100) {
                console.warn(
                  "ID do Google Drive parece inválido (tamanho incorreto):",
                  fileId
                );
                // Tentar extrair novamente com uma expressão mais específica
                const betterMatch = originalUrl.match(/[-\w]{25,}/);
                if (
                  betterMatch &&
                  betterMatch[0] &&
                  betterMatch[0].length >= 25
                ) {
                  fileId = betterMatch[0];
                                  }
              }
            }

            // Se encontrou o ID, retorna a URL formatada para exibição da imagem
            if (fileId) {
                            // Usar o formato de thumbnail para melhor performance
              // sz=w400 define a largura máxima como 400px, mantendo a proporção
              const thumbnailUrl = `https://drive.google.com/thumbnail?id=${fileId}&sz=w400`;

              // Verificar se a URL está acessível (opção 1)
              // Retornar a URL formatada e deixar o navegador lidar com a verificação
              return thumbnailUrl;
            } else {
              console.warn(
                "Não foi possível extrair o ID da imagem do Google Drive:",
                url
              );
            }
          } catch (e) {
            console.error("Erro ao processar URL do Google Drive:", e, url);
          }
        }

        return url; // Retorna a URL original para outras fontes
      }

      // Função para aplicar cores aos elementos criados dinamicamente
      function aplicarCoresDinamicasAosElementos(elemento) {
        // Aplicar cor de texto aos elementos de texto
        const elementosTexto = elemento.querySelectorAll(
          ".descricao-item, .nome-item, p:not(.text-primary-dynamic):not(.text-secondary-dynamic):not(.text-white):not(.link-color-dynamic):not(.text-rodape-dynamic)"
        );
        elementosTexto.forEach((el) => {
          el.classList.add("text-color-dynamic");
        });

        // Aplicar cor de texto do rodapé aos elementos do rodapé
        if (elemento.closest("#footer-dynamic")) {
          const elementosTextoRodape = elemento.querySelectorAll(
            "p, .text-sm, .text-xs"
          );
          elementosTextoRodape.forEach((el) => {
            el.classList.remove("text-color-dynamic"); // Remover classe de cor de texto geral se existir
            el.classList.add("text-rodape-dynamic");
          });
        }

        // Aplicar cor de links aos links (exceto os do rodapé de créditos)
        const elementosLinks = elemento.querySelectorAll(
          "a:not(.bg-primary-dynamic):not(.text-white):not(.text-primary-dynamic):not(.text-secondary-dynamic):not(.text-gray-500)"
        );
        elementosLinks.forEach((el) => {
          // Verificar se o link não está no rodapé de créditos
          if (!el.closest(".bg-gray-50")) {
            el.classList.add("link-color-dynamic");
          }
        });
      }

      // Função para atualizar o preço do produto com base nas variações selecionadas
      function atualizarPrecoComVariacoes(checkbox, itemId) {
        try {
          // Buscar o container de variações
          const container = checkbox.closest(".variacoes-container");
          if (!container) {
            console.error("Container de variações não encontrado");
            return;
          }

          // Encontrar o card do produto - necessário para encontrar e atualizar o elemento de preço
          const cardItem = container.closest(".menu-item");
          if (!cardItem) {
            console.error("Card do produto não encontrado");
            return;
          }

          // Encontrar o elemento de preço no card
          const priceHighlight = cardItem.querySelector(".price-highlight");
          if (!priceHighlight) {
            console.error("Elemento .price-highlight não encontrado no card");
            return;
          }

          // Encontrar o span dentro do price-highlight onde o preço é exibido
          let precoElement = priceHighlight.querySelector("span");
          if (!precoElement) {
            console.error(
              "Elemento span dentro de .price-highlight não encontrado"
            );
            // Criar o elemento span se não existir
            precoElement = document.createElement("span");
            precoElement.className = "font-bold";
            priceHighlight.appendChild(precoElement);
            return;
          }

          // Encontrar o elemento de preço na visualização mobile
          const precoMobileElement = cardItem.querySelector(
            ".menu-item-mobile-price"
          );
          if (!precoMobileElement) {
                      }

          // Obter o preço base do produto
          // Primeiro tentamos obter do data-attribute, que deve conter apenas o valor numérico
          let precoBaseStr = container.getAttribute("data-item-preco");

          // Se não encontramos no data-attribute, tentamos extrair do texto visível
          if (!precoBaseStr || precoBaseStr === "0" || precoBaseStr === "") {
            // Pegamos o texto do preço exibido e extraímos o valor numérico
            const precoVisivel = precoElement.textContent.trim();
            
            // Extrair apenas números, ponto e vírgula (removendo R$, etc)
            precoBaseStr = precoVisivel.replace(/[^0-9,]/g, "");

            // Atualizar o data-attribute com o valor extraído para uso futuro
            container.setAttribute(
              "data-item-preco",
              precoBaseStr.replace(",", ".")
            );
          }

          // Garantir que o preço base esteja em formato numérico correto para cálculos
          precoBaseStr = precoBaseStr.replace(",", ".");

          // Converter para número
          const precoBase = parseFloat(precoBaseStr);
          if (isNaN(precoBase)) {
            console.error("Preço base inválido após conversão:", precoBaseStr);
            return;
          }

          
          // Buscar todas as variações selecionadas
          const checkboxesSelecionados = container.querySelectorAll(
            'input[type="checkbox"]:checked'
          );

          // Calcular o preço total com as variações
          let precoTotal = precoBase;
          let variacoesTexto = [];

          // Processar cada variação selecionada
          checkboxesSelecionados.forEach((cb) => {
            // Obter o preço adicional da variação
            const precoAdicionalStr = cb.getAttribute("data-preco-adicional");

            // Debug: Mostrar cada variação e seu preço adicional
            
            // Converter para número garantindo que temos um valor válido
            let precoAdicional = 0;
            if (precoAdicionalStr && precoAdicionalStr !== "") {
              precoAdicional = parseFloat(
                precoAdicionalStr.toString().replace(",", ".")
              );
            }

            // Debug: Mostrar o preço adicional convertido
            
            if (!isNaN(precoAdicional) && precoAdicional > 0) {
              // Somar ao preço total
              precoTotal += precoAdicional;
              variacoesTexto.push(
                `${cb.value} (+R$${precoAdicional
                  .toFixed(2)
                  .replace(".", ",")})`
              );
            } else {
              variacoesTexto.push(cb.value);
            }
          });

          // Debug: Mostrar o preço total calculado
          
          // Formatar o preço total para exibição (com duas casas decimais e vírgula)
          const precoFormatado = `R$${precoTotal.toFixed(2).replace(".", ",")}`;

          // Atualizar o texto do preço com destaque visual
          precoElement.textContent = precoFormatado;

          // Atualizar também o preço no card mobile, se existir
          if (precoMobileElement) {
            precoMobileElement.textContent = precoFormatado;
            precoMobileElement.classList.add("price-updated");
            setTimeout(() => {
              precoMobileElement.classList.remove("price-updated");
            }, 1000);
          }

          // Adicionar animação para destacar a mudança de preço
          precoElement.classList.add("price-updated");
          setTimeout(() => {
            precoElement.classList.remove("price-updated");
          }, 1000);

          // Verificar se há variações selecionadas com valor adicional
          let temVariacoesComValor = false;
          checkboxesSelecionados.forEach((cb) => {
            const precoAdicionalStr = cb.getAttribute("data-preco-adicional");
            if (
              precoAdicionalStr &&
              parseFloat(precoAdicionalStr.replace(",", ".")) > 0
            ) {
              temVariacoesComValor = true;
            }
          });

          // Atualizar o estilo para destacar que o preço é total (base + variações)
          if (checkboxesSelecionados.length > 0) {
            // Verificar se há variações com valor adicional para aplicar o estilo verde
            if (temVariacoesComValor) {
              // Preço com variações que têm valor adicional
              priceHighlight.classList.add("bg-green-100", "border-green-300");
              priceHighlight.classList.remove(
                "bg-primary-dynamic/10",
                "border-primary-dynamic/20"
              );
              precoElement.classList.add("text-green-700", "font-bold");

              // Indicador visual de que o preço tem adições (seta verde apontando para esquerda)
              if (!priceHighlight.querySelector(".variacao-badge")) {
                const badgeElement = document.createElement("span");
                badgeElement.className =
                  "variacao-badge text-green-500 inline-block";
                badgeElement.style.marginLeft = "3px";
                badgeElement.style.verticalAlign = "middle";
                badgeElement.style.transform = "translateY(-1px)";
                badgeElement.innerHTML =
                  '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H6M12 5l-7 7 7 7"/></svg>';
                badgeElement.title = "Preço com adições selecionadas";
                precoElement.appendChild(badgeElement);
              }
            } else {
              // Variações selecionadas mas sem valor adicional - estilo normal
              priceHighlight.classList.remove(
                "bg-green-100",
                "border-green-300"
              );
              priceHighlight.classList.add(
                "bg-primary-dynamic/10",
                "border-primary-dynamic/20"
              );
              precoElement.classList.remove("text-green-700");

              // Remover badge de variação se existir
              const badge = priceHighlight.querySelector(".variacao-badge");
              if (badge) {
                badge.remove();
              }
            }
          } else {
            // Preço base sem variações
            priceHighlight.classList.remove("bg-green-100", "border-green-300");
            priceHighlight.classList.add(
              "bg-primary-dynamic/10",
              "border-primary-dynamic/20"
            );
            precoElement.classList.remove("text-green-700");

            // Remover badge de variação se existir
            const badge = priceHighlight.querySelector(".variacao-badge");
            if (badge) {
              badge.remove();
            }
          }

          // Efeito sutil de destaque para a mudança
          precoElement.classList.add("highlight-price-change");

          // Adicionar o estilo da animação se não existir
          if (!document.getElementById("price-highlight-animation")) {
            const styleElement = document.createElement("style");
            styleElement.id = "price-highlight-animation";
            styleElement.textContent = `
                @keyframes highlightPriceChange {
                    0% { transform: scale(1); }
                    50% { transform: scale(1.1); }
                    100% { transform: scale(1); }
                }
                .highlight-price-change {
                    animation: highlightPriceChange 0.5s ease;
                }
                @keyframes priceUpdated {
                    0% { color: var(--primary-color); }
                    30% { color: #22c55e; font-weight: bold; }
                    100% { color: var(--primary-color); }
                }
                .price-updated {
                    animation: priceUpdated 1s ease;
                    font-weight: bold;
                }
            `;
            document.head.appendChild(styleElement);
          }

          // Remover a classe de destaque após a animação
          setTimeout(() => {
            precoElement.classList.remove("highlight-price-change");
          }, 500);

          // Registrar sucesso da operação
          
          // Adicionar tooltip detalhado com informações sobre o preço
          if (variacoesTexto.length > 0) {
            // Criar tooltip detalhado mostrando o preço base e cada variação adicionada
            const tooltipContent = `Preço base: R$${precoBase
              .toFixed(2)
              .replace(".", ",")}
Variações: ${variacoesTexto.join(", ")}`;
            priceHighlight.setAttribute("data-tooltip", tooltipContent);
            priceHighlight.title = tooltipContent.replace("\n", " - ");
          } else {
            // Sem variações, remover tooltip
            priceHighlight.removeAttribute("data-tooltip");
            priceHighlight.title = "";
          }

          // Atualizar estilo visual dos botões de variação
          const variacaoBtns = container.querySelectorAll(".variacao-btn");
          variacaoBtns.forEach((btn) => {
            const input = btn.parentElement.querySelector("input");
            if (input && input.checked) {
              btn.classList.remove("bg-white", "text-gray-700");
              btn.classList.add(
                "bg-primary-dynamic",
                "text-white",
                "border-primary-dynamic"
              );
            } else {
              btn.classList.remove(
                "bg-primary-dynamic",
                "text-white",
                "border-primary-dynamic"
              );
              btn.classList.add("bg-white", "text-gray-700");
            }
          });
        } catch (e) {
          console.error("Erro ao atualizar preço:", e);
        }
      }

      // Função para adicionar ao carrinho com variação

      // Função para adicionar ao carrinho com variação
      function adicionarAoCarrinhoComVariacao(itemId, itemTitulo, button) {
        try {
          // Encontrar o container do produto
          const produtoContainer = button.closest(".menu-item");
          if (!produtoContainer) {
            console.error("Container do produto não encontrado");
            return;
          }

          // Usar os parâmetros recebidos ou buscar informações do produto se necessário
          const titulo =
            itemTitulo ||
            (produtoContainer.querySelector(".menu-item-title")
              ? produtoContainer
                  .querySelector(".menu-item-title")
                  .textContent.trim()
              : "Produto");
          // Já recebemos o itemId como parâmetro, mas garantimos que ele exista
          itemId =
            itemId ||
            produtoContainer.getAttribute("data-item-id") ||
            produtoContainer.id ||
            `item-${Date.now()}`;

          // Encontrar o container de variações (mobile/desktop)
          const variacoesContainers = produtoContainer.querySelectorAll(
            ".variacoes-container"
          );
          let variacoesContainer = Array.from(variacoesContainers).find(
            (c) => c.offsetParent !== null
          );

          // Se nenhum container visível for encontrado, usar o primeiro
          if (!variacoesContainer) {
            variacoesContainer = variacoesContainers[0];
          }

          if (!variacoesContainer) {
            // Se não houver variações, adicionar normalmente com os parâmetros corretos
            adicionarAoCarrinhoSimples(itemId, titulo, button, 0);
            return;
          }

          // Verificar se é uma seleção obrigatória
          const isRequired =
            variacoesContainer.getAttribute("data-required") === "true";

          // Buscar checkboxes selecionados
          const checkboxesSelecionados = variacoesContainer.querySelectorAll(
            'input[type="checkbox"]:checked'
          );

          // Se for obrigatório e nenhuma opção estiver selecionada, destacar as variações
          if (isRequired && checkboxesSelecionados.length === 0) {
            // Destacar o container de variações apenas após a tentativa de adicionar
            variacoesContainer.classList.add(
              "erro-obrigatorio",
              "animate__animated",
              "animate__headShake"
            );

            // Piscar o container das variações para chamar atenção
            setTimeout(() => {
              variacoesContainer.classList.remove("animate__headShake");
            }, 1000);

            // Remover o destaque após 3 segundos
            setTimeout(() => {
              variacoesContainer.classList.remove(
                "erro-obrigatorio",
                "animate__animated"
              );
              variacoesContainer.classList.add("border", "border-gray-200"); // Voltar para uma borda sutil normal
            }, 3000);

            return;
          }

          // Inicializar variáveis
          let tituloFinal = titulo;
          let precoAdicionalTotal = 0;

          // Se temos variações selecionadas
          if (checkboxesSelecionados.length > 0) {
            // Coletar todas as variações selecionadas e seus preços adicionais
            const variacoes = [];

            checkboxesSelecionados.forEach((cb) => {
              // Obter valor e preço adicional de cada variação
              const valorVariacao = cb.value;
              const precoAdicional = parseFloat(
                cb.getAttribute("data-preco-adicional") || "0"
              );

              // Formatar o preço adicional para exibição
              const precoAdicionalFormatado = precoAdicional
                .toFixed(2)
                .replace(".", ",");

              // Adicionar ao array com formato "Nome +R$XX,XX"
              if (!isNaN(precoAdicional) && precoAdicional > 0) {
                variacoes.push(
                  `${valorVariacao} +R$${precoAdicionalFormatado}`
                );
              } else {
                variacoes.push(valorVariacao);
              }

              // Adicionar o preço adicional ao total
              if (!isNaN(precoAdicional)) {
                precoAdicionalTotal += precoAdicional;
              }
            });

            // Concatenar o título com as variações selecionadas incluindo os preços
            tituloFinal = `${titulo} (${variacoes.join(", ")})`;
                                  } else {
            // Nenhuma variação selecionada, mantenha o título original
                      }

          // Chamar a função para adicionar ao carrinho
          adicionarAoCarrinhoSimples(
            itemId,
            tituloFinal,
            button,
            precoAdicionalTotal
          );
        } catch (error) {
          console.error(
            "Erro ao adicionar item com variação ao carrinho:",
            error
          );
          alert(
            "Ocorreu um erro ao adicionar o item ao carrinho. Por favor, tente novamente."
          );
        }
      }

      // Renderizar cardápio
      function renderizarCardapio() {
        
        const cardapioContainer = document.getElementById("cardapio");
        const categoryScrollMobile = document.getElementById("category-scroll");

        // Limpar containers
        cardapioContainer.innerHTML = "";
        categoryScrollMobile.innerHTML = ""; // Remove os placeholders de carregamento

        const categoriasAtivas = dadosGlobais.categorias
          .filter((cat) => cat.Ativa === "Sim")
          .sort(
            (a, b) =>
              parseInt(a.Ordem_Exibição || 0) - parseInt(b.Ordem_Exibição || 0)
          );

        if (categoriasAtivas.length === 0) {
          cardapioContainer.innerHTML =
            '<div class="text-center text-gray-600 text-xl">Nenhuma categoria encontrada</div>';
          document.getElementById("loading").style.display = "none";
          return;
        }

        // Criar botão "Todos" para mobile (transformado em link âncora)
        const btnTodosMobile = document.createElement("a");
        btnTodosMobile.className =
          "category-item active flex-shrink-0 px-4 py-2 bg-primary-dynamic text-white rounded-full text-sm font-semibold whitespace-nowrap min-w-[80px] text-center";
        btnTodosMobile.textContent = "✨ Todos";
        btnTodosMobile.dataset.categoria = "";
        btnTodosMobile.setAttribute("data-target", "categoria-todos");
        btnTodosMobile.href = "#categoria-todos";
        btnTodosMobile.style.textDecoration = "none";
        categoryScrollMobile.appendChild(btnTodosMobile);

        // Criar filtros para todas as plataformas
        categoriasAtivas.forEach((categoria) => {
          // Filtro scroll horizontal (transformado em link âncora)
          const btnMobile = document.createElement("a");
          btnMobile.className =
            "category-item flex-shrink-0 px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm font-semibold whitespace-nowrap hover-primary-dynamic transition-all min-w-[80px] text-center";
          btnMobile.textContent =
            categoria.Título_Exibição || categoria.Nome_Categoria;
          btnMobile.dataset.categoria = categoria.Nome_Categoria;
          const targetId = `categoria-${categoria.Nome_Categoria.toLowerCase().replace(
            /\s+/g,
            "-"
          )}`;
          btnMobile.setAttribute("data-target", targetId);
          btnMobile.href = `#${targetId}`;
          btnMobile.style.textDecoration = "none";
          categoryScrollMobile.appendChild(btnMobile);
        });

        // Adicionar a seção "Todos" com ID para âncora
        const todosSection = document.createElement("section");
        todosSection.id = "categoria-todos";
        todosSection.className = "categoria-secao fade-in";
        todosSection.innerHTML = `
        <div class="mb-8 pt-[30px]">
            <div class="text-center mb-8">
                <h2 class="text-3xl md:text-4xl font-bold text-primary-dynamic mb-4">✨ Todos os Produtos</h2>
                <p class="text-gray-600 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
                    Veja todos os nossos produtos disponíveis
                </p>
            </div>
        </div>
    `;
        cardapioContainer.appendChild(todosSection);

        // Aplicar cores dinâmicas ao elemento "Todos os Produtos"
        aplicarCoresDinamicasAosElementos(todosSection);

        // Renderizar seções de categoria
        categoriasAtivas.forEach((categoria) => {
          const itensCategoria = dadosGlobais.itens.filter((item) => {
            // Verifica se o item está disponível
            const disponivel = item.Disponível ? item.Disponível.trim() : "";
            if (disponivel !== "Sim") return false;

            // Processa categoria do filtro atual
            const categoriaFiltro = categoria.Nome_Categoria
              ? categoria.Nome_Categoria.trim()
              : "";

            // Processa categorias do item (pode conter múltiplas categorias separadas por vírgula)
            const categoriaItem = item.Categoria ? item.Categoria.trim() : "";

            // Se o item não tem categoria, não mostrar em nenhuma categoria
            if (!categoriaItem) return false;

            // Divide as categorias do item em um array, removendo espaços extras
            const categoriasDoItem = categoriaItem
              .split(",")
              .map((cat) => cat.trim());

            // Verifica se a categoria atual está entre as categorias do item
            return categoriasDoItem.includes(categoriaFiltro);
          });

          if (itensCategoria.length === 0) return;

          // Verificar e logar informações sobre a categoria e sua imagem para depuração
                    
          // Com base na planilha compartilhada, vamos tentar todos os possíveis campos para URL da imagem
          // O campo correto é 'E' na planilha que pode ser mapeado para diferentes nomes
          const imagemURLOriginal =
            categoria.E ||
            categoria.Foto_URL ||
            categoria.Foto_Categoria ||
            categoria.Imagem ||
            "";
          // Processar URL para suportar Dropbox e outras fontes externas
          const imagemURL = processarURLImagem(imagemURLOriginal);

          // Criar ID da seção para a âncora de navegação
          const targetId = `categoria-${categoria.Nome_Categoria.toLowerCase().replace(
            /\s+/g,
            "-"
          )}`;

          const secaoHtml = `
            <section id="${targetId}" class="categoria-secao fade-in" data-categoria="${
            categoria.Nome_Categoria
          }">
                <div class="mb-8 pt-[30px]">
                    ${
                      imagemURL
                        ? `
                        <img src="${imagemURL}" alt="${categoria.Título_Exibição}" 
                             class="w-full h-40 md:h-56 object-cover rounded-3xl mb-6 shadow-lg">
                    `
                        : ""
                    }
                    <div class="text-center mb-8">
                        <h2 class="text-3xl md:text-4xl font-bold text-primary-dynamic mb-4">
                            ${
                              categoria.Título_Exibição ||
                              categoria.Nome_Categoria
                            }
                        </h2>
                        <p class="text-gray-600 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
                            ${categoria.Descrição_Seção || ""}
                        </p>
                    </div>
                </div>
                
                <!-- Grid ajustado: 1 coluna no mobile, 2 colunas no desktop -->
                <div class="grid grid-cols-1 md:grid-cols-2 md:gap-6 gap-0">
                    ${itensCategoria
                      .map(function (item) {
                        const itemId =
                          item.ID ||
                          `id-${item.Item?.replace(/\s+/g, "-").toLowerCase()}`;
                        return `
                        <div class="menu-item bg-white shadow-md overflow-hidden card-hover menu-item-mobile-spacing border-b border-gray-100" data-item-id="${itemId}" onclick="toggleItemExpansion(this)">
                            <!-- Visualização mobile (estilo iFood) -->
                            <div class="menu-item-mobile-view md:hidden">
                                <div class="image-container">
                                    <img 
                                        src="${
                                          processarURLImagem(item.Foto_URL) ||
                                          "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiB2aWV3Qm94PSIwIDAgMjQgMjQiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2NjY2NjYyIgc3Ryb2tlLXdpZHRoPSIxIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjxyZWN0IHg9IjMiIHk9IjMiIHdpZHRoPSIxOCIgaGVpZ2h0PSIxOCIgcng9IjIiIHJ5PSIyIj48L3JlY3Q+PGNpcmNsZSBjeD0iOC41IiBjeT0iOC41IiByPSIxLjUiPjwvY2lyY2xlPjxwb2x5bGluZSBwb2ludHM9IjIxIDE1IDE2IDEwIDUgMjEiPjwvcG9seWxpbmU+PC9zdmc+"
                                        }" 
                                        alt="${item.Item}" 
                                        class="menu-item-mobile-image"
                                        onerror="this.onerror=null; this.src='data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiB2aWV3Qm94PSIwIDAgMjQgMjQiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2NjY2NjYyIgc3Ryb2tlLXdpZHRoPSIxIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjxyZWN0IHg9IjMiIHk9IjMiIHdpZHRoPSIxOCIgaGVpZ2h0PSIxOCIgcng9IjIiIHJ5PSIyIj48L3JlY3Q+PGNpcmNsZSBjeD0iOC41IiBjeT0iOC41IiByPSIxLjUiPjwvY2lyY2xlPjxwb2x5bGluZSBwb2ludHM9IjIxIDE1IDE2IDEwIDUgMjEiPjwvcG9seWxpbmU+PC9zdmc+'; this.classList.add('placeholder-img');" 
                                        loading="lazy"
                                        data-full-img="${
                                          processarURLImagem(item.Foto_URL) ||
                                          ""
                                        }"
                                    >
                                    <div class="zoom-icon" onclick="abrirModalImagem(event, '${
                                      processarURLImagem(item.Foto_URL) || ""
                                    }', '${item.Item}')">
                                        <i class="fas fa-search-plus"></i>
                                    </div>
                                </div>
                                <div class="menu-item-mobile-info">
                                    <h3 class="menu-item-mobile-title">${
                                      item.Item || "Item sem nome"
                                    }</h3>
                                    <p class="menu-item-mobile-description">${
                                      item.Descrição || ""
                                    }</p>
                                    <div class="menu-item-mobile-price">${
                                      item.Preço || "Consulte"
                                    }</div>
                                </div>
                                <div class="menu-item-mobile-expand-icon p-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16" class="text-primary-dynamic drop-shadow-sm">
                                        <path fill-rule="evenodd" d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z"/>
                                    </svg>
                                </div>
                            </div>
                            
                            <!-- Detalhes expandidos para mobile -->
                            <div class="menu-item-mobile-details md:hidden">
                                <div class="menu-item-mobile-details-inner">
                                    <p class="text-gray-600 text-sm mb-4" style="white-space: pre-line;">
                                        ${item.Descrição || ""}
                                    </p>
                                    
                                    ${
                                      item.Classificação_Adicional &&
                                      item.Classificação_Adicional.trim() !== ""
                                        ? item.Classificação_Adicional.trim().startsWith(
                                            "#Var:"
                                          ) ||
                                          item.Classificação_Adicional.trim().startsWith(
                                            "Var:"
                                          )
                                          ? `
                                            <div class="variacoes-container mb-3 mt-2" 
                                                data-item-id="${itemId}" 
                                                data-required="${item.Classificação_Adicional.trim().startsWith(
                                                  "#Var:"
                                                )}" 
                                                data-item-preco="${
                                                  item.Preço
                                                    ? item.Preço.replace(
                                                        /[^0-9,]/g,
                                                        ""
                                                      ).replace(",", ".")
                                                    : "0"
                                                }">
                                                <p class="text-sm font-medium mb-2 ${
                                                  item.Classificação_Adicional.trim().startsWith(
                                                    "#Var:"
                                                  )
                                                    ? "text-red-600 flex items-center"
                                                    : "text-gray-700"
                                                }">
                                                    ${
                                                      item.Classificação_Adicional.trim().startsWith(
                                                        "#Var:"
                                                      )
                                                        ? `
                                                        <span class="mr-1">
                                                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                                            </svg>
                                                        </span>
                                                        <strong>Selecione pelo menos 1 opção:</strong>
                                                    `
                                                        : "Selecione as opções (opcional):"
                                                    }
                                                </p>
                                                <div class="flex flex-wrap gap-2">
                                                    ${(item.Classificação_Adicional.trim().startsWith(
                                                      "#Var:"
                                                    )
                                                      ? item.Classificação_Adicional.substring(
                                                          5
                                                        )
                                                      : item.Classificação_Adicional.substring(
                                                          4
                                                        )
                                                    )
                                                      .split("/")
                                                      .map(
                                                        (variacao, index) => {
                                                          const variacaoTrim =
                                                            variacao.trim();
                                                          const precoMatch =
                                                            variacaoTrim.match(
                                                              /\+R\$\s*([0-9]+[,.]?[0-9]*)/
                                                            );
                                                          let precoAdicional = 0;
                                                          let nomeSemPreco =
                                                            variacaoTrim;

                                                          if (precoMatch) {
                                                            precoAdicional =
                                                              parseFloat(
                                                                precoMatch[1].replace(
                                                                  ",",
                                                                  "."
                                                                )
                                                              );
                                                            nomeSemPreco =
                                                              variacaoTrim
                                                                .replace(
                                                                  /\+R\$\s*([0-9]+[,.]?[0-9]*)/,
                                                                  ""
                                                                )
                                                                .trim();
                                                          }

                                                          return `
                                                                <label class="variacao-radio-label inline-flex items-center">
                                                                    <input type="checkbox" 
    name="variacao-${itemId}" 
    value="${nomeSemPreco}" 
    class="variacao-checkbox sr-only"
    data-preco-adicional="${precoAdicional}"
    onclick="atualizarPrecoComVariacoes(this, '${itemId}'); event.stopPropagation();"
>
                                                                    <span class="variacao-btn py-1 px-3 rounded-full border border-gray-300 text-sm cursor-pointer transition-all bg-white text-gray-700 hover:bg-gray-100">
                                                                        ${variacaoTrim}
                                                                    </span>
                                                                </label>
                                                            `;
                                                        }
                                                      )
                                                      .join("")}
                                                </div>
                                            </div>
                                        `
                                          : `
                                            <div class="flex flex-wrap gap-1 mb-3">
                                                ${item.Classificação_Adicional.split(
                                                  "/"
                                                )
                                                  .map(
                                                    (tag) => `
                                                    <span class="menu-item-pill bg-secondary-dynamic/10 text-secondary-dynamic border border-secondary-dynamic/20">
                                                        ${tag.trim()}
                                                    </span>
                                                `
                                                  )
                                                  .join("")}
                                            </div>
                                        `
                                        : ""
                                    }
                                    
                                    ${
                                      item.Observações
                                        ? `
                                        <p class="text-sm text-gray-500 italic border-t pt-3 mb-3">
                                            💡 ${item.Observações}
                                        </p>
                                    `
                                        : ""
                                    }
                                    
                                    <!-- Controles de quantidade e botão "Adicionar ao Carrinho" -->
                                    <div class="mt-3 flex items-center justify-between ${
                                      window.ocultarControlesCarrinho
                                        ? "hidden"
                                        : ""
                                    }" onclick="event.stopPropagation();">
                                        <div class="flex items-center space-x-1" role="group" aria-label="Controle de quantidade para ${
                                          item.Item
                                        }">
                                            <button 
                                                type="button"
                                                class="quantidade-decremento flex items-center justify-center w-8 h-8 rounded-md bg-primary-dynamic text-white hover:bg-opacity-90 transition-all duration-200 focus:outline-none" 
                                                data-item-id="${itemId}"
                                                aria-label="Diminuir quantidade"
                                                onclick="decrementarQuantidadeCard(this); event.stopPropagation();"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-4 h-4">
                                                    <path stroke-linecap="round" stroke-linejoin="round" d="M5 12h14" />
                                                </svg>
                                            </button>
                                            <input 
                                                type="number" 
                                                min="1" 
                                                value="1" 
                                                class="quantidade-input w-8 h-8 text-center border-0 bg-transparent focus:outline-none focus:ring-0 font-medium text-gray-700" 
                                                data-item-id="${itemId}"
                                                aria-label="Quantidade de ${
                                                  item.Item
                                                }"
                                                onclick="event.stopPropagation();"
                                            >
                                            <button 
                                                type="button"
                                                class="quantidade-incremento flex items-center justify-center w-8 h-8 rounded-md bg-primary-dynamic text-white hover:bg-opacity-90 transition-all duration-200 focus:outline-none"
                                                data-item-id="${itemId}"
                                                aria-label="Aumentar quantidade"
                                                onclick="incrementarQuantidadeCard(this); event.stopPropagation();"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-4 h-4">
                                                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                                </svg>
                                            </button>
                                        </div>
                                        
                                        <button 
                                            type="button" 
                                            class="adicionar-ao-carrinho bg-primary-dynamic text-white py-2 px-4 rounded-lg text-base font-medium hover:bg-primary-dynamic/90 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-dynamic flex items-center justify-center gap-2" 
                                            data-item-id="${itemId}" 
                                            data-item-titulo="${
                                              item.Item || "Item sem nome"
                                            }" 
                                            aria-label="Adicionar ${
                                              item.Item || "Item sem nome"
                                            } ao carrinho de compras" 
                                            onclick="adicionarAoCarrinhoComVariacao('${itemId}', '${item.Item || "Item sem nome"}', this); event.stopPropagation();"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                            </svg>
                                            <span>Adicionar</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Visualização desktop (mantém o layout original) -->
                            <div class="menu-item-container h-full hidden md:block">
                                <div class="flex flex-col md:flex-row">
                                    <div class="menu-item-image-wrapper w-full md:w-2/5 ${
                                      !item.Foto_URL ? "hidden" : ""
                                    }">
                                        <div class="image-skeleton w-full h-48 md:h-full aspect-square">
                                            <img 
                                                src="${
                                                  processarURLImagem(
                                                    item.Foto_URL
                                                  ) ||
                                                  "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiB2aWV3Qm94PSIwIDAgMjQgMjQiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2NjY2NjYyIgc3Ryb2tlLXdpZHRoPSIxIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjxyZWN0IHg9IjMiIHk9IjMiIHdpZHRoPSIxOCIgaGVpZ2h0PSIxOCIgcng9IjIiIHJ5PSIyIj48L3JlY3Q+PGNpcmNsZSBjeD0iOC41IiBjeT0iOC41IiByPSIxLjUiPjwvY2lyY2xlPjxwb2x5bGluZSBwb2ludHM9IjIxIDE1IDE2IDEwIDUgMjEiPjwvcG9seWxpbmU+PC9zdmc+"
                                                }" 
                                                alt="${item.Item}" 
                                                class="w-full h-48 md:h-full object-cover aspect-square transition-all duration-300 hover:scale-105 img-loading"
                                                onerror="this.onerror=null; this.src='data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiB2aWV3Qm94PSIwIDAgMjQgMjQiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2NjY2NjYyIgc3Ryb2tlLXdpZHRoPSIxIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjxyZWN0IHg9IjMiIHk9IjMiIHdpZHRoPSIxOCIgaGVpZ2h0PSIxOCIgcng9IjIiIHJ5PSIyIj48L3JlY3Q+PGNpcmNsZSBjeD0iOC41IiBjeT0iOC41IiByPSIxLjUiPjwvY2lyY2xlPjxwb2x5bGluZSBwb2ludHM9IjIxIDE1IDE2IDEwIDUgMjEiPjwvcG9seWxpbmU+PC9zdmc+'; this.classList.add('placeholder-img');" 
                                                loading="lazy"
                                                onload="this.classList.remove('img-loading'); this.classList.add('img-loaded');"
                                            >
                                        </div>
                                    </div>
                                    
                                    <div class="menu-item-content p-4 w-full md:${
                                      item.Foto_URL ? "w-3/5" : "w-full"
                                    }">
                                        <div>
                                            <div class="menu-item-title-price mb-3">
                                                <h3 class="font-bold text-lg text-gray-800 leading-tight truncate">
                                                    ${
                                                      item.Item ||
                                                      "Item sem nome"
                                                    }
                                                </h3>
                                                <div class="menu-item-pill price-highlight bg-primary-dynamic/10 text-primary-dynamic border border-primary-dynamic/20">
                                                    <span class="font-bold">${
                                                      item.Preço || "Consulte"
                                                    }</span>
                                                </div>
                                            </div>
                                            
                                            <p class="text-gray-600 leading-snug text-sm md:text-sm mb-[15px] line-clamp-6" style="margin-bottom: 15px; white-space: pre-line;">
                                                ${item.Descrição || ""}
                                            </p>
                                        </div>
                                        
                                        <div>
                                            ${
                                              item.Classificação_Adicional &&
                                              item.Classificação_Adicional.trim() !==
                                                ""
                                                ? item.Classificação_Adicional.trim().startsWith(
                                                    "#Var:"
                                                  ) ||
                                                  item.Classificação_Adicional.trim().startsWith(
                                                    "Var:"
                                                  )
                                                  ? `
                                                    <div class="variacoes-container mb-3 mt-2" 
                                                        data-item-id="${
                                                          item.ID ||
                                                          `id-${item.Item?.replace(
                                                            /\s+/g,
                                                            "-"
                                                          ).toLowerCase()}`
                                                        }" 
                                                        data-required="${item.Classificação_Adicional.trim().startsWith(
                                                          "#Var:"
                                                        )}" 
                                                        data-item-preco="${
                                                          item.Preço
                                                            ? item.Preço.replace(
                                                                /[^0-9,]/g,
                                                                ""
                                                              ).replace(
                                                                ",",
                                                                "."
                                                              )
                                                            : "0"
                                                        }" 
                                                        style="margin-top: 10px; margin-bottom: 15px;">
                                                        <p class="text-sm font-medium mb-2 ${
                                                          item.Classificação_Adicional.trim().startsWith(
                                                            "#Var:"
                                                          )
                                                            ? "text-red-600 flex items-center"
                                                            : "text-gray-700"
                                                        }">
                                                            ${
                                                              item.Classificação_Adicional.trim().startsWith(
                                                                "#Var:"
                                                              )
                                                                ? `
                                                                <span class="mr-1">
                                                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                                                    </svg>
                                                                </span>
                                                                <strong>Selecione pelo menos 1 opção:</strong>
                                                            `
                                                                : "Selecione as opções (opcional):"
                                                            }
                                                        </p>
                                                        <div class="flex flex-wrap gap-2">
                                                            ${(item.Classificação_Adicional.trim().startsWith(
                                                              "#Var:"
                                                            )
                                                              ? item.Classificação_Adicional.substring(
                                                                  5
                                                                )
                                                              : item.Classificação_Adicional.substring(
                                                                  4
                                                                )
                                                            )
                                                              .split("/")
                                                              .map(
                                                                (
                                                                  variacao,
                                                                  index
                                                                ) => {
                                                                  const variacaoTrim =
                                                                    variacao.trim();
                                                                  // Extrair preço adicional se existir (formato: "+R$X,XX" ou "+R$ X,XX")
                                                                  const precoMatch =
                                                                    variacaoTrim.match(
                                                                      /\+R\$\s*([0-9]+[,.]?[0-9]*)/
                                                                    );
                                                                  let precoAdicional = 0;
                                                                  let nomeSemPreco =
                                                                    variacaoTrim;

                                                                  if (
                                                                    precoMatch
                                                                  ) {
                                                                    // Converter para número (substituindo vírgula por ponto)
                                                                    precoAdicional =
                                                                      parseFloat(
                                                                        precoMatch[1].replace(
                                                                          ",",
                                                                          "."
                                                                        )
                                                                      );
                                                                    // Remover a parte do preço do nome da variação
                                                                    nomeSemPreco =
                                                                      variacaoTrim
                                                                        .replace(
                                                                          /\+R\$\s*([0-9]+[,.]?[0-9]*)/,
                                                                          ""
                                                                        )
                                                                        .trim();
                                                                  }

                                                                  return `
                                                                        <label class="variacao-radio-label inline-flex items-center">
                                                                            <input type="checkbox" 
                                                                                name="variacao-${
                                                                                  item.ID ||
                                                                                  `id-${item.Item?.replace(
                                                                                    /\s+/g,
                                                                                    "-"
                                                                                  ).toLowerCase()}`
                                                                                }" 
                                                                                value="${nomeSemPreco}" 
                                                                                class="variacao-checkbox sr-only"
                                                                                data-preco-adicional="${precoAdicional}"
                                                                                onclick="atualizarPrecoComVariacoes(this, '${
                                                                                  item.ID ||
                                                                                  `id-${item.Item?.replace(
                                                                                    /\s+/g,
                                                                                    "-"
                                                                                  ).toLowerCase()}`
                                                                                }')"
                                                                            >
                                                                            <span class="variacao-btn py-1 px-3 rounded-full border border-gray-300 text-sm cursor-pointer transition-all bg-white text-gray-700 hover:bg-gray-100">
                                                                                ${variacaoTrim}
                                                                            </span>
                                                                        </label>
                                                                    `;
                                                                }
                                                              )
                                                              .join("")}
                                                        </div>
                                                    </div>
                                                `
                                                  : `
                                                    <div class="flex flex-wrap gap-1 mb-2 mt-2" style="margin-top: 10px; margin-bottom: 10px;">
                                                        ${item.Classificação_Adicional.split(
                                                          "/"
                                                        )
                                                          .map(
                                                            (tag) => `
                                                            <span class="menu-item-pill bg-secondary-dynamic/10 text-secondary-dynamic border border-secondary-dynamic/20">
                                                                ${tag.trim()}
                                                            </span>
                                                        `
                                                          )
                                                          .join("")}
                                                    </div>
                                                `
                                                : ""
                                            }
                                            
                                            ${
                                              item.Observações
                                                ? `
                                                <p class="text-sm text-gray-500 italic border-t" style="padding-top: 10px !important;">
                                                    💡 ${item.Observações}
                                                </p>
                                            `
                                                : ""
                                            }
                                            
                                            <!-- Controles de quantidade e botão "Adicionar ao Carrinho" com atributos de acessibilidade -->
                                            <div class="mt-2 md:mt-1 py-1 md:py-1 flex items-center justify-between ${
                                              window.ocultarControlesCarrinho
                                                ? "hidden"
                                                : ""
                                            }">
                                                <div class="flex items-center space-x-1" role="group" aria-label="Controle de quantidade para ${
                                                  item.Item
                                                }">
                                                    <button 
                                                        type="button"
                                                        class="quantidade-decremento flex items-center justify-center w-8 h-8 rounded-md bg-primary-dynamic text-white hover:bg-opacity-90 transition-all duration-200 focus:outline-none" 
                                                        data-item-id="${
                                                          item.ID ||
                                                          `id-${item.Item?.replace(
                                                            /\s+/g,
                                                            "-"
                                                          ).toLowerCase()}`
                                                        }"
                                                        aria-label="Diminuir quantidade"
                                                        onclick="decrementarQuantidadeCard(this); event.stopPropagation();"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-4 h-4">
                                                            <path stroke-linecap="round" stroke-linejoin="round" d="M5 12h14" />
                                                        </svg>
                                                    </button>
                                                    <input 
                                                        type="number" 
                                                        min="1" 
                                                        value="1" 
                                                        class="quantidade-input w-8 h-8 text-center border-0 bg-transparent focus:outline-none focus:ring-0 font-medium text-gray-700" 
                                                        data-item-id="${
                                                          item.ID ||
                                                          `id-${item.Item?.replace(
                                                            /\s+/g,
                                                            "-"
                                                          ).toLowerCase()}`
                                                        }"
                                                        aria-label="Quantidade de ${
                                                          item.Item
                                                        }"
                                                    >
                                                    <button 
                                                        type="button"
                                                        class="quantidade-incremento flex items-center justify-center w-8 h-8 rounded-md bg-primary-dynamic text-white hover:bg-opacity-90 transition-all duration-200 focus:outline-none"
                                                        data-item-id="${
                                                          item.ID ||
                                                          `id-${item.Item?.replace(
                                                            /\s+/g,
                                                            "-"
                                                          ).toLowerCase()}`
                                                        }"
                                                        aria-label="Aumentar quantidade"
                                                        onclick="incrementarQuantidadeCard(this); event.stopPropagation();"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-4 h-4">
                                                            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                                        </svg>
                                                    </button>
                                                </div>
                                                
                                                <button 
                                                    type="button" 
                                                    class="adicionar-ao-carrinho bg-primary-dynamic text-white py-2 px-4 rounded-lg text-base font-medium hover:bg-primary-dynamic/90 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-dynamic flex items-center justify-center gap-2" 
                                                    data-item-id="${
                                                      item.ID ||
                                                      `id-${item.Item?.replace(
                                                        /\s+/g,
                                                        "-"
                                                      ).toLowerCase()}`
                                                    }" 
                                                    data-item-titulo="${
                                                      item.Item ||
                                                      "Item sem nome"
                                                    }" 
                                                    aria-label="Adicionar ${
                                                      item.Item ||
                                                      "Item sem nome"
                                                    } ao carrinho de compras" 
                                                    onclick="adicionarAoCarrinhoComVariacao('${
                                                      item.ID ||
                                                      `id-${item.Item?.replace(
                                                        /\s+/g,
                                                        "-"
                                                      ).toLowerCase()}`
                                                    }', '${item.Item || "Item sem nome"}', this)"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                                    </svg>
                                                    <span>Adicionar</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;
                      })
                      .join("")}
                </div>
            </section>
        `;

          cardapioContainer.innerHTML += secaoHtml;
        });

        document.getElementById("loading").style.display = "none";
      }

      // Função para alternar a expansão dos itens no estilo sanfona para mobile
      function toggleItemExpansion(element) {
        // Verificar se estamos em um dispositivo móvel
        if (window.innerWidth <= 767) {
          // Verificar se o clique foi em um elemento interativo dentro do card
          const target = event.target;
          const isInteractiveElement =
            target.tagName === "BUTTON" ||
            target.tagName === "INPUT" ||
            target.closest("button") ||
            target.closest("input") ||
            target.closest(".variacao-radio-label");

          // Se o clique foi em um elemento interativo, não expandir/recolher
          if (isInteractiveElement) {
            return;
          }

          // Alternar a classe 'expanded' para mostrar/esconder detalhes
          element.classList.toggle("expanded");

          // Adicionar efeito de ripple ao clicar
          const ripple = document.createElement("div");
          ripple.classList.add("ripple-effect");
          element.appendChild(ripple);

          // Remover o efeito após a animação
          setTimeout(() => {
            ripple.remove();
          }, 500);
        }
      }

      // Configurações de compartilhamento agora são estáticas no HTML

      // Event listeners
      document.addEventListener("DOMContentLoaded", function () {
        // Inicializar carregamento de dados
        carregarDados();

        // Adicionar evento de click nos logos para reload
        const logoMobile = document.getElementById("logo-mobile");
        const logoDesktop = document.getElementById("logo");
        const logoTextMobile = document.getElementById("logo-text-mobile");

        // Função para tratar a seleção de variações
        document.addEventListener("click", function (event) {
          const target = event.target;

          // Verificar se clicou em um botão de variação ou no texto dentro dele
          if (target.closest(".variacao-btn")) {
            event.preventDefault(); // Impedir comportamento padrão
            event.stopPropagation(); // Parar propagação do evento

            const label = target.closest(".variacao-radio-label");
            if (!label) return;

            const input = label.querySelector('input[type="checkbox"]');
            if (!input) return;

            // Forçar a alternância manual do estado de seleção
            input.checked = !input.checked;
            
            // Atualizar estilo do botão atual
            const btn = label.querySelector(".variacao-btn");
            if (input.checked) {
              btn.classList.add("bg-primary-dynamic", "text-white");
              btn.classList.remove(
                "bg-white",
                "text-gray-700",
                "hover:bg-gray-100"
              );
            } else {
              btn.classList.remove("bg-primary-dynamic", "text-white");
              btn.classList.add(
                "bg-white",
                "text-gray-700",
                "hover:bg-gray-100"
              );
            }

            // Chamar a função para atualizar o preço
            const itemId = input.name.replace("variacao-", "");
            atualizarPrecoComVariacoes(input, itemId);
          }
        });

        // Inicializar os eventos de variação para todos os checkboxes
        document
          .querySelectorAll('.variacoes-container input[type="checkbox"]')
          .forEach((checkbox) => {
            // Verificar se o checkbox já está marcado e atualizar o estilo do botão
            if (checkbox.checked) {
              const label = checkbox.closest(".variacao-radio-label");
              if (label) {
                const btn = label.querySelector(".variacao-btn");
                if (btn) {
                  btn.classList.add("bg-primary-dynamic", "text-white");
                  btn.classList.remove("bg-white", "text-gray-700");
                }
              }

              // Atualizar o preço inicial se houver variações já selecionadas
              const itemId = checkbox.name.replace("variacao-", "");
              atualizarPrecoComVariacoes(checkbox, itemId);
            }
          });

        // Função para recarregar e manter no topo
        function recarregarEManterNoTopo(e) {
          e.preventDefault(); // Previne o comportamento padrão

          // Adiciona um parâmetro à URL para forçar o navegador a ir para o topo
          const separador = window.location.href.includes("?") ? "&" : "?";
          const novaUrl =
            window.location.href.split("#")[0] + separador + "scrollTop=0";

          // Redireciona para a nova URL, forçando um reload
          window.location.href = novaUrl;
        }

        // Adicionar event listeners aos logos para recarregar e manter no topo
        if (logoMobile) {
          logoMobile.addEventListener("click", recarregarEManterNoTopo);
          logoMobile.style.cursor = "pointer";
        }

        // Logo desktop
        if (logoDesktop) {
          logoDesktop.addEventListener("click", recarregarEManterNoTopo);
          logoDesktop.style.cursor = "pointer";
        }

        if (logoTextMobile) {
          logoTextMobile.addEventListener("click", recarregarEManterNoTopo);
          logoTextMobile.style.cursor = "pointer";
        }

        // Botões de busca
        document
          .getElementById("search-btn-mobile")
          .addEventListener("click", abrirBusca);
        document
          .getElementById("search-btn-desktop")
          .addEventListener("click", abrirBusca);

        // Fechar busca
        document
          .getElementById("close-search")
          .addEventListener("click", fecharBusca);
        document
          .getElementById("search-overlay")
          .addEventListener("click", function (e) {
            if (e.target === this) {
              fecharBusca();
            }
          });

        // Campo de busca
        document
          .getElementById("search-input")
          .addEventListener("input", function (e) {
            const termo = e.target.value.trim();

            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
              realizarBusca(termo);
            }, 300);
          });

        // Tecla ESC para fechar busca
        document.addEventListener("keydown", function (e) {
          if (e.key === "Escape") {
            fecharBusca();
          }
        });

        // Filtros desktop
        document.addEventListener("click", function (e) {
          if (e.target.classList.contains("filtro-btn")) {
            document.querySelectorAll(".filtro-btn").forEach((btn) => {
              btn.classList.remove(
                "active",
                "bg-primary-dynamic",
                "text-white"
              );
              btn.classList.add("bg-gray-100", "text-gray-700");
            });

            e.target.classList.add(
              "active",
              "bg-primary-dynamic",
              "text-white"
            );
            e.target.classList.remove("bg-gray-100", "text-gray-700");

            filtrarPorCategoria(e.target.dataset.categoria);
          }
        });

        // Filtros scroll horizontal mobile
        document.addEventListener("click", function (e) {
          if (e.target.classList.contains("category-item")) {
            document.querySelectorAll(".category-item").forEach((btn) => {
              btn.classList.remove(
                "active",
                "bg-primary-dynamic",
                "text-white"
              );
              btn.classList.add("bg-gray-100", "text-gray-700");
            });

            e.target.classList.add(
              "active",
              "bg-primary-dynamic",
              "text-white"
            );
            e.target.classList.remove("bg-gray-100", "text-gray-700");

            // Scroll suave para centralizar o item ativo
            const categoryScroll = document.getElementById("category-scroll");
            const itemLeft = e.target.offsetLeft;
            const itemWidth = e.target.offsetWidth;
            const containerWidth = categoryScroll.offsetWidth;

            const targetScroll = itemLeft - containerWidth / 2 + itemWidth / 2;

            categoryScroll.scrollTo({
              left: Math.max(0, targetScroll),
              behavior: "smooth",
            });

            filtrarPorCategoria(e.target.dataset.categoria);
          }
        });

        carregarDados();
      });

      function filtrarPorCategoria(categoria) {
        // Em vez de ocultar seções, navegamos para a âncora correspondente
        if (!categoria) {
          // Se não tem categoria, volta ao topo
          window.scrollTo({
            top: 0,
            behavior: "smooth",
          });
          return;
        }

        // Encontrar a seção correspondente à categoria
        const targetId = `categoria-${categoria
          .toLowerCase()
          .replace(/\s+/g, "-")}`;
        const targetSection = document.getElementById(targetId);

        if (targetSection) {
          // Calcular offset do cabeçalho unificado
          const headerOffset =
            document.getElementById("unified-header").offsetHeight;

          // Navegar para a seção com offset maior (170px)
          // Usamos o maior valor entre o headerOffset e 170px para garantir compatibilidade
          const scrollOffset = Math.max(headerOffset, 170);

          window.scrollTo({
            top: targetSection.offsetTop - scrollOffset,
            behavior: "smooth",
          });

          // Atualizar URL sem recarregar a página
          history.pushState(null, null, `#${targetId}`);
        }
      }
