      // Verificar se há parâmetro scrollTop na URL
      if (window.location.href.includes("scrollTop=0")) {
        // Forçar rolagem para o topo
        window.scrollTo(0, 0);

        // Remover o parâmetro da URL para não acumular parâmetros
        const urlSemParam = window.location.href.replace(
          /[?&]scrollTop=0(&|$)/,
          "$1"
        );
        const urlLimpa =
          urlSemParam.endsWith("?") || urlSemParam.endsWith("&")
            ? urlSemParam.slice(0, -1)
            : urlSemParam;

        // Atualizar a URL sem recarregar a página
        if (urlLimpa !== window.location.href) {
          history.replaceState(null, "", urlLimpa);
        }
      }
