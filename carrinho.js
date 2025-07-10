// Funções do Carrinho
function adicionarAoCarrinhoComVariacao(itemId, itemNome, botao) {
    try {
        // 1. Validação inicial
        if (!itemId || !itemNome) {
            throw new Error('ID ou nome do item inválido');
        }

        // 2. Obter container de variações
        const containerVariacoes = document.querySelector(`.variacoes-container[data-item-id="${itemId}"]`);
        if (!containerVariacoes) {
            throw new Error(`Container de variações não encontrado para o item: ${itemId}`);
        }

        // 3. Processar variações
        const isRequired = containerVariacoes.dataset.required === 'true';
        const variacoesSelecionadas = [];
        let precoAdicionalTotal = 0;

        // Coletar variações selecionadas
        containerVariacoes.querySelectorAll('input[type="checkbox"]:checked').forEach(checkbox => {
            const precoAdicional = parseFloat(checkbox.dataset.precoAdicional || 0);
            variacoesSelecionadas.push({
                nome: checkbox.value,
                preco: precoAdicional
            });
            precoAdicionalTotal += precoAdicional;
        });

        // Validar variações obrigatórias
        if (isRequired && variacoesSelecionadas.length === 0) {
            mostrarMensagem('Por favor, selecione pelo menos uma opção obrigatória', 'erro');
            return false;
        }

        // 4. Obter quantidade
        const quantidadeInput = document.querySelector(`.quantidade-input[data-item-id="${itemId}"]`);
        const quantidade = Math.max(1, parseInt(quantidadeInput?.value || 1));

        // 5. Calcular preço
        const precoBase = parseFloat(containerVariacoes.dataset.itemPreco || 0);
        const precoTotal = precoBase + precoAdicionalTotal;

        // 6. Criar objeto do item
        const novoItem = {
            id: `${itemId}-${Date.now()}`,
            originalId: itemId,
            nome: itemNome,
            precoUnitario: precoTotal,
            precoTotal: precoTotal * quantidade,
            quantidade: quantidade,
            variacoes: variacoesSelecionadas,
            observacao: ''
        };

        // 7. Adicionar ao carrinho no localStorage
        let carrinho = JSON.parse(localStorage.getItem('carrinho') || '[]');
        carrinho.push(novoItem);
        localStorage.setItem('carrinho', JSON.stringify(carrinho));

        // 8. Feedback visual
        if (botao) {
            botao.textContent = '✔ Adicionado';
            botao.classList.add('bg-green-500', 'text-white');
            setTimeout(() => {
                botao.textContent = 'Adicionar ao Carrinho';
                botao.classList.remove('bg-green-500', 'text-white');
            }, 2000);
        }

        // 9. Atualizar contador
        atualizarContadorCarrinho();

        return true;
    } catch (error) {
        console.error('Erro ao adicionar item:', error);
        mostrarMensagem('Erro ao adicionar item ao carrinho', 'erro');
        return false;
    }
}

// Função auxiliar para atualizar contador do carrinho
function atualizarContadorCarrinho() {
    const carrinho = JSON.parse(localStorage.getItem('carrinho') || '[]');
    const contador = document.getElementById('contador-carrinho');
    if (contador) {
        contador.textContent = carrinho.length;
        contador.classList.toggle('hidden', carrinho.length === 0);
    }
}

// Função auxiliar para mostrar mensagens
function mostrarMensagem(texto, tipo = 'sucesso') {
    // Implementação simplificada - pode ser expandida
    alert(`${tipo === 'erro' ? 'Erro:' : ''} ${texto}`);
}
