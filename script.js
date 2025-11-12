// Sistema CRM - JavaScript

// Estrutura de dados inicial
let crmData = {
    usuarios: [
        { id: 1, username: 'admin', password: 'admin', nome: 'Administrador' }
    ],
    clientes: [],
    negocios: [],
    tarefas: [],
    config: {
        usuarioLogado: null,
        ultimoBackup: null
    }
};

// Elementos DOM
const loginScreen = document.getElementById('login-screen');
const mainScreen = document.getElementById('main-screen');
const loginForm = document.getElementById('login-form');
const logoutBtn = document.getElementById('logout-btn');
const userName = document.getElementById('user-name');

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    carregarDados();
    inicializarEventos();
    verificarLogin();
});

// Carregar dados do LocalStorage
function carregarDados() {
    const dadosSalvos = localStorage.getItem('crmData');
    if (dadosSalvos) {
        crmData = JSON.parse(dadosSalvos);
    } else {
        salvarDados();
    }
}

// Salvar dados no LocalStorage
function salvarDados() {
    localStorage.setItem('crmData', JSON.stringify(crmData));
}

// Verificar se há usuário logado
function verificarLogin() {
    if (crmData.config.usuarioLogado) {
        mostrarSistema();
    } else {
        mostrarLogin();
    }
}

// Mostrar tela de login
function mostrarLogin() {
    loginScreen.classList.add('active');
    mainScreen.classList.remove('active');
}

// Mostrar sistema principal
function mostrarSistema() {
    loginScreen.classList.remove('active');
    mainScreen.classList.add('active');
    atualizarInterface();
}

// Inicializar eventos
function inicializarEventos() {
    // Login
    loginForm.addEventListener('submit', fazerLogin);
    logoutBtn.addEventListener('click', fazerLogout);
    
    // Navegação
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            mostrarSecao(this.dataset.section);
        });
    });
    
    // Clientes
    document.getElementById('add-cliente-btn').addEventListener('click', () => abrirModalCliente());
    document.getElementById('cliente-form').addEventListener('submit', salvarCliente);
    document.getElementById('cancel-cliente').addEventListener('click', fecharModalCliente);
    document.getElementById('search-cliente').addEventListener('input', filtrarClientes);
    document.getElementById('filter-categoria').addEventListener('change', filtrarClientes);
    document.getElementById('filter-cidade').addEventListener('change', filtrarClientes);
    
    // Negócios
    document.getElementById('add-negocio-btn').addEventListener('click', () => abrirModalNegocio());
    document.getElementById('negocio-form').addEventListener('submit', salvarNegocio);
    document.getElementById('cancel-negocio').addEventListener('click', fecharModalNegocio);
    
    // Tarefas
    document.getElementById('add-tarefa-btn').addEventListener('click', () => abrirModalTarefa());
    document.getElementById('tarefa-form').addEventListener('submit', salvarTarefa);
    document.getElementById('cancel-tarefa').addEventListener('click', fecharModalTarefa);
    
    // Configurações
    document.getElementById('export-data-btn').addEventListener('click', exportarDados);
    document.getElementById('import-data-btn').addEventListener('click', () => document.getElementById('import-file').click());
    document.getElementById('import-file').addEventListener('change', importarDados);
    document.getElementById('clear-data-btn').addEventListener('click', limparDados);
    
    // Fechar modais
    document.querySelectorAll('.close').forEach(close => {
        close.addEventListener('click', function() {
            this.closest('.modal').classList.remove('active');
        });
    });
    
    // Fechar modal ao clicar fora
    window.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            e.target.classList.remove('active');
        }
    });
}

// Funções de Login
function fazerLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    const usuario = crmData.usuarios.find(u => u.username === username && u.password === password);
    
    if (usuario) {
        crmData.config.usuarioLogado = usuario.id;
        salvarDados();
        mostrarSistema();
    } else {
        alert('Usuário ou senha incorretos!');
    }
}

function fazerLogout() {
    crmData.config.usuarioLogado = null;
    salvarDados();
    mostrarLogin();
}

// Navegação entre seções
function mostrarSecao(secao) {
    // Atualizar menu ativo
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    document.querySelector(`[data-section="${secao}"]`).classList.add('active');
    
    // Mostrar seção correspondente
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(secao).classList.add('active');
    
    // Atualizar dados específicos da seção
    switch(secao) {
        case 'dashboard':
            atualizarDashboard();
            break;
        case 'clientes':
            atualizarListaClientes();
            break;
        case 'negocios':
            atualizarFunilVendas();
            break;
        case 'tarefas':
            atualizarListaTarefas();
            break;
        case 'relatorios':
            atualizarRelatorios();
            break;
    }
}

// Atualizar interface geral
function atualizarInterface() {
    const usuario = crmData.usuarios.find(u => u.id === crmData.config.usuarioLogado);
    if (usuario) {
        userName.textContent = usuario.nome;
    }
    
    atualizarDashboard();
    atualizarListaClientes();
    atualizarFunilVendas();
    atualizarListaTarefas();
}

// ============================
// MÓDULO DE CLIENTES
// ============================

// Gerar ID único
function gerarId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Abrir modal de cliente
function abrirModalCliente(cliente = null) {
    const modal = document.getElementById('cliente-modal');
    const titulo = document.getElementById('cliente-modal-title');
    const form = document.getElementById('cliente-form');
    
    if (cliente) {
        titulo.textContent = 'Editar Cliente';
        preencherFormCliente(cliente);
    } else {
        titulo.textContent = 'Adicionar Cliente';
        form.reset();
        document.getElementById('cliente-id').value = '';
    }
    
    modal.classList.add('active');
}

// Fechar modal de cliente
function fecharModalCliente() {
    document.getElementById('cliente-modal').classList.remove('active');
}

// Preencher formulário de cliente
function preencherFormCliente(cliente) {
    document.getElementById('cliente-id').value = cliente.id;
    document.getElementById('cliente-nome').value = cliente.nome || '';
    document.getElementById('cliente-email').value = cliente.email || '';
    document.getElementById('cliente-telefone').value = cliente.telefone || '';
    document.getElementById('cliente-cnpj-cpf').value = cliente.cnpjCpf || '';
    document.getElementById('cliente-endereco').value = cliente.endereco || '';
    document.getElementById('cliente-cidade').value = cliente.cidade || '';
    document.getElementById('cliente-estado').value = cliente.estado || '';
    document.getElementById('cliente-categoria').value = cliente.categoria || 'ativo';
    document.getElementById('cliente-responsavel').value = cliente.responsavel || '';
    document.getElementById('cliente-observacoes').value = cliente.observacoes || '';
}

// Salvar cliente
function salvarCliente(e) {
    e.preventDefault();
    
    const id = document.getElementById('cliente-id').value;
    const cliente = {
        id: id || gerarId(),
        nome: document.getElementById('cliente-nome').value,
        email: document.getElementById('cliente-email').value,
        telefone: document.getElementById('cliente-telefone').value,
        cnpjCpf: document.getElementById('cliente-cnpj-cpf').value,
        endereco: document.getElementById('cliente-endereco').value,
        cidade: document.getElementById('cliente-cidade').value,
        estado: document.getElementById('cliente-estado').value,
        categoria: document.getElementById('cliente-categoria').value,
        responsavel: document.getElementById('cliente-responsavel').value,
        observacoes: document.getElementById('cliente-observacoes').value,
        dataCriacao: id ? crmData.clientes.find(c => c.id === id).dataCriacao : new Date().toISOString(),
        dataAtualizacao: new Date().toISOString()
    };
    
    if (id) {
        // Atualizar cliente existente
        const index = crmData.clientes.findIndex(c => c.id === id);
        if (index !== -1) {
            crmData.clientes[index] = cliente;
        }
    } else {
        // Adicionar novo cliente
        crmData.clientes.push(cliente);
    }
    
    salvarDados();
    fecharModalCliente();
    atualizarListaClientes();
    atualizarDashboard();
}

// Atualizar lista de clientes
function atualizarListaClientes() {
    const tbody = document.getElementById('clientes-list');
    tbody.innerHTML = '';
    
    // Atualizar filtro de cidades
    const cidades = [...new Set(crmData.clientes.map(c => c.cidade).filter(c => c))];
    const filterCidade = document.getElementById('filter-cidade');
    filterCidade.innerHTML = '<option value="">Todas as cidades</option>';
    cidades.forEach(cidade => {
        const option = document.createElement('option');
        option.value = cidade;
        option.textContent = cidade;
        filterCidade.appendChild(option);
    });
    
    // Filtrar clientes
    const clientesFiltrados = filtrarClientes();
    
    if (clientesFiltrados.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center;">Nenhum cliente encontrado</td></tr>';
        return;
    }
    
    clientesFiltrados.forEach(cliente => {
        const tr = document.createElement('tr');
        
        // Determinar classe da categoria
        let categoriaClass = '';
        switch(cliente.categoria) {
            case 'ativo': categoriaClass = 'ativo'; break;
            case 'potencial': categoriaClass = 'potencial'; break;
            case 'inativo': categoriaClass = 'inativo'; break;
        }
        
        tr.innerHTML = `
            <td>${cliente.nome}</td>
            <td>${cliente.email}</td>
            <td>${cliente.telefone || '-'}</td>
            <td><span class="categoria ${categoriaClass}">${cliente.categoria}</span></td>
            <td>${cliente.cidade || '-'}</td>
            <td class="acoes">
                <button class="btn-editar" data-id="${cliente.id}">Editar</button>
                <button class="btn-excluir" data-id="${cliente.id}">Excluir</button>
            </td>
        `;
        
        tbody.appendChild(tr);
    });
    
    // Adicionar eventos aos botões
    document.querySelectorAll('.btn-editar').forEach(btn => {
        btn.addEventListener('click', function() {
            const cliente = crmData.clientes.find(c => c.id === this.dataset.id);
            abrirModalCliente(cliente);
        });
    });
    
    document.querySelectorAll('.btn-excluir').forEach(btn => {
        btn.addEventListener('click', function() {
            if (confirm('Tem certeza que deseja excluir este cliente?')) {
                excluirCliente(this.dataset.id);
            }
        });
    });
}

// Filtrar clientes
function filtrarClientes() {
    const termo = document.getElementById('search-cliente').value.toLowerCase();
    const categoria = document.getElementById('filter-categoria').value;
    const cidade = document.getElementById('filter-cidade').value;
    
    let clientesFiltrados = crmData.clientes;
    
    if (termo) {
        clientesFiltrados = clientesFiltrados.filter(c => 
            c.nome.toLowerCase().includes(termo) || 
            c.email.toLowerCase().includes(termo)
        );
    }
    
    if (categoria) {
        clientesFiltrados = clientesFiltrados.filter(c => c.categoria === categoria);
    }
    
    if (cidade) {
        clientesFiltrados = clientesFiltrados.filter(c => c.cidade === cidade);
    }
    
    return clientesFiltrados;
}

// Excluir cliente
function excluirCliente(id) {
    crmData.clientes = crmData.clientes.filter(c => c.id !== id);
    
    // Remover negócios associados
    crmData.negocios = crmData.negocios.filter(n => n.clienteId !== id);
    
    // Remover tarefas associadas
    crmData.tarefas = crmData.tarefas.filter(t => t.clienteId !== id);
    
    salvarDados();
    atualizarListaClientes();
    atualizarDashboard();
    atualizarFunilVendas();
    atualizarListaTarefas();
}

// ============================
// MÓDULO DE NEGÓCIOS
// ============================

// Abrir modal de negócio
function abrirModalNegocio(negocio = null) {
    const modal = document.getElementById('negocio-modal');
    const titulo = document.getElementById('negocio-modal-title');
    const form = document.getElementById('negocio-form');
    const selectCliente = document.getElementById('negocio-cliente');
    
    // Preencher select de clientes
    selectCliente.innerHTML = '<option value="">Selecione um cliente</option>';
    crmData.clientes.forEach(cliente => {
        const option = document.createElement('option');
        option.value = cliente.id;
        option.textContent = cliente.nome;
        selectCliente.appendChild(option);
    });
    
    if (negocio) {
        titulo.textContent = 'Editar Negócio';
        preencherFormNegocio(negocio);
    } else {
        titulo.textContent = 'Adicionar Negócio';
        form.reset();
        document.getElementById('negocio-id').value = '';
        document.getElementById('negocio-data').valueAsDate = new Date();
        document.getElementById('negocio-probabilidade').value = 50;
    }
    
    modal.classList.add('active');
}

// Fechar modal de negócio
function fecharModalNegocio() {
    document.getElementById('negocio-modal').classList.remove('active');
}

// Preencher formulário de negócio
function preencherFormNegocio(negocio) {
    document.getElementById('negocio-id').value = negocio.id;
    document.getElementById('negocio-cliente').value = negocio.clienteId;
    document.getElementById('negocio-nome').value = negocio.nome;
    document.getElementById('negocio-valor').value = negocio.valor;
    document.getElementById('negocio-etapa').value = negocio.etapa;
    document.getElementById('negocio-probabilidade').value = negocio.probabilidade;
    document.getElementById('negocio-data').value = negocio.dataFechamento;
    document.getElementById('negocio-observacoes').value = negocio.observacoes || '';
}

// Salvar negócio
function salvarNegocio(e) {
    e.preventDefault();
    
    const id = document.getElementById('negocio-id').value;
    const negocio = {
        id: id || gerarId(),
        clienteId: document.getElementById('negocio-cliente').value,
        nome: document.getElementById('negocio-nome').value,
        valor: parseFloat(document.getElementById('negocio-valor').value),
        etapa: document.getElementById('negocio-etapa').value,
        probabilidade: parseInt(document.getElementById('negocio-probabilidade').value),
        dataFechamento: document.getElementById('negocio-data').value,
        observacoes: document.getElementById('negocio-observacoes').value,
        dataCriacao: id ? crmData.negocios.find(n => n.id === id).dataCriacao : new Date().toISOString(),
        dataAtualizacao: new Date().toISOString()
    };
    
    if (id) {
        // Atualizar negócio existente
        const index = crmData.negocios.findIndex(n => n.id === id);
        if (index !== -1) {
            crmData.negocios[index] = negocio;
        }
    } else {
        // Adicionar novo negócio
        crmData.negocios.push(negocio);
    }
    
    salvarDados();
    fecharModalNegocio();
    atualizarFunilVendas();
    atualizarDashboard();
}

// Atualizar funil de vendas
function atualizarFunilVendas() {
    const etapas = ['prospeccao', 'qualificacao', 'proposta', 'negociacao', 'fechamento'];
    
    etapas.forEach(etapa => {
        const container = document.querySelector(`.negocios-list[data-etapa="${etapa}"]`);
        container.innerHTML = '';
        
        const negociosEtapa = crmData.negocios.filter(n => n.etapa === etapa);
        
        if (negociosEtapa.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: #999; font-style: italic;">Nenhum negócio</p>';
            return;
        }
        
        negociosEtapa.forEach(negocio => {
            const cliente = crmData.clientes.find(c => c.id === negocio.clienteId);
            const card = document.createElement('div');
            card.className = 'negocio-card';
            card.draggable = true;
            card.dataset.id = negocio.id;
            
            card.innerHTML = `
                <h4>${negocio.nome}</h4>
                <p><strong>Cliente:</strong> ${cliente ? cliente.nome : 'N/A'}</p>
                <p><strong>Valor:</strong> R$ ${negocio.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                <p><strong>Probabilidade:</strong> ${negocio.probabilidade}%</p>
                <p><strong>Fechamento:</strong> ${formatarData(negocio.dataFechamento)}</p>
                <div class="negocio-actions">
                    <button class="btn-editar" data-id="${negocio.id}">Editar</button>
                    <button class="btn-excluir" data-id="${negocio.id}">Excluir</button>
                </div>
            `;
            
            container.appendChild(card);
        });
    });
    
    // Adicionar eventos de drag and drop
    document.querySelectorAll('.negocio-card').forEach(card => {
        card.addEventListener('dragstart', function(e) {
            e.dataTransfer.setData('text/plain', this.dataset.id);
        });
    });
    
    document.querySelectorAll('.negocios-list').forEach(container => {
        container.addEventListener('dragover', function(e) {
            e.preventDefault();
        });
        
        container.addEventListener('drop', function(e) {
            e.preventDefault();
            const negocioId = e.dataTransfer.getData('text/plain');
            const novaEtapa = this.dataset.etapa;
            
            moverNegocio(negocioId, novaEtapa);
        });
    });
    
    // Adicionar eventos aos botões
    document.querySelectorAll('.negocio-card .btn-editar').forEach(btn => {
        btn.addEventListener('click', function() {
            const negocio = crmData.negocios.find(n => n.id === this.dataset.id);
            abrirModalNegocio(negocio);
        });
    });
    
    document.querySelectorAll('.negocio-card .btn-excluir').forEach(btn => {
        btn.addEventListener('click', function() {
            if (confirm('Tem certeza que deseja excluir este negócio?')) {
                excluirNegocio(this.dataset.id);
            }
        });
    });
}

// Mover negócio entre etapas
function moverNegocio(id, novaEtapa) {
    const negocio = crmData.negocios.find(n => n.id === id);
    if (negocio) {
        negocio.etapa = novaEtapa;
        negocio.dataAtualizacao = new Date().toISOString();
        salvarDados();
        atualizarFunilVendas();
        atualizarDashboard();
    }
}

// Excluir negócio
function excluirNegocio(id) {
    crmData.negocios = crmData.negocios.filter(n => n.id !== id);
    salvarDados();
    atualizarFunilVendas();
    atualizarDashboard();
}

// ============================
// MÓDULO DE TAREFAS
// ============================

// Abrir modal de tarefa
function abrirModalTarefa(tarefa = null) {
    const modal = document.getElementById('tarefa-modal');
    const titulo = document.getElementById('tarefa-modal-title');
    const form = document.getElementById('tarefa-form');
    const selectCliente = document.getElementById('tarefa-cliente');
    
    // Preencher select de clientes
    selectCliente.innerHTML = '<option value="">Nenhum</option>';
    crmData.clientes.forEach(cliente => {
        const option = document.createElement('option');
        option.value = cliente.id;
        option.textContent = cliente.nome;
        selectCliente.appendChild(option);
    });
    
    if (tarefa) {
        titulo.textContent = 'Editar Tarefa';
        preencherFormTarefa(tarefa);
    } else {
        titulo.textContent = 'Adicionar Tarefa';
        form.reset();
        document.getElementById('tarefa-id').value = '';
        document.getElementById('tarefa-data').valueAsDate = new Date();
        document.getElementById('tarefa-hora').value = '09:00';
    }
    
    modal.classList.add('active');
}

// Fechar modal de tarefa
function fecharModalTarefa() {
    document.getElementById('tarefa-modal').classList.remove('active');
}

// Preencher formulário de tarefa
function preencherFormTarefa(tarefa) {
    document.getElementById('tarefa-id').value = tarefa.id;
    document.getElementById('tarefa-tipo').value = tarefa.tipo;
    document.getElementById('tarefa-cliente').value = tarefa.clienteId || '';
    document.getElementById('tarefa-data').value = tarefa.data;
    document.getElementById('tarefa-hora').value = tarefa.hora;
    document.getElementById('tarefa-descricao').value = tarefa.descricao;
}

// Salvar tarefa
function salvarTarefa(e) {
    e.preventDefault();
    
    const id = document.getElementById('tarefa-id').value;
    const tarefa = {
        id: id || gerarId(),
        tipo: document.getElementById('tarefa-tipo').value,
        clienteId: document.getElementById('tarefa-cliente').value || null,
        data: document.getElementById('tarefa-data').value,
        hora: document.getElementById('tarefa-hora').value,
        descricao: document.getElementById('tarefa-descricao').value,
        concluida: id ? crmData.tarefas.find(t => t.id === id).concluida : false,
        dataCriacao: id ? crmData.tarefas.find(t => t.id === id).dataCriacao : new Date().toISOString(),
        dataAtualizacao: new Date().toISOString()
    };
    
    if (id) {
        // Atualizar tarefa existente
        const index = crmData.tarefas.findIndex(t => t.id === id);
        if (index !== -1) {
            crmData.tarefas[index] = tarefa;
        }
    } else {
        // Adicionar nova tarefa
        crmData.tarefas.push(tarefa);
    }
    
    salvarDados();
    fecharModalTarefa();
    atualizarListaTarefas();
    atualizarDashboard();
}

// Atualizar lista de tarefas
function atualizarListaTarefas() {
    const pendentesContainer = document.getElementById('tarefas-pendentes-list');
    const concluidasContainer = document.getElementById('tarefas-concluidas-list');
    
    pendentesContainer.innerHTML = '';
    concluidasContainer.innerHTML = '';
    
    const tarefasPendentes = crmData.tarefas.filter(t => !t.concluida);
    const tarefasConcluidas = crmData.tarefas.filter(t => t.concluida);
    
    // Tarefas pendentes
    if (tarefasPendentes.length === 0) {
        pendentesContainer.innerHTML = '<p style="text-align: center; color: #999; font-style: italic;">Nenhuma tarefa pendente</p>';
    } else {
        tarefasPendentes.forEach(tarefa => {
            const cliente = tarefa.clienteId ? crmData.clientes.find(c => c.id === tarefa.clienteId) : null;
            const item = criarItemTarefa(tarefa, cliente, false);
            pendentesContainer.appendChild(item);
        });
    }
    
    // Tarefas concluídas
    if (tarefasConcluidas.length === 0) {
        concluidasContainer.innerHTML = '<p style="text-align: center; color: #999; font-style: italic;">Nenhuma tarefa concluída</p>';
    } else {
        tarefasConcluidas.forEach(tarefa => {
            const cliente = tarefa.clienteId ? crmData.clientes.find(c => c.id === tarefa.clienteId) : null;
            const item = criarItemTarefa(tarefa, cliente, true);
            concluidasContainer.appendChild(item);
        });
    }
}

// Criar item de tarefa
function criarItemTarefa(tarefa, cliente, concluida) {
    const item = document.createElement('div');
    item.className = `tarefa-item ${concluida ? 'concluida' : ''}`;
    
    // Verificar se está atrasada
    if (!concluida) {
        const dataTarefa = new Date(tarefa.data + 'T' + tarefa.hora);
        if (dataTarefa < new Date()) {
            item.classList.add('atrasada');
        }
    }
    
    item.innerHTML = `
        <div class="tarefa-info">
            <h4>${tarefa.descricao}</h4>
            <p><strong>Tipo:</strong> ${formatarTipoTarefa(tarefa.tipo)}</p>
            <p><strong>Data:</strong> ${formatarData(tarefa.data)} às ${tarefa.hora}</p>
            ${cliente ? `<p><strong>Cliente:</strong> ${cliente.nome}</p>` : ''}
        </div>
        <div class="tarefa-actions">
            ${!concluida ? `<button class="btn-concluir" data-id="${tarefa.id}">Concluir</button>` : ''}
            <button class="btn-editar" data-id="${tarefa.id}">Editar</button>
            <button class="btn-excluir" data-id="${tarefa.id}">Excluir</button>
        </div>
    `;
    
    // Adicionar eventos
    if (!concluida) {
        item.querySelector('.btn-concluir').addEventListener('click', function() {
            concluirTarefa(this.dataset.id);
        });
    }
    
    item.querySelector('.btn-editar').addEventListener('click', function() {
        const tarefa = crmData.tarefas.find(t => t.id === this.dataset.id);
        abrirModalTarefa(tarefa);
    });
    
    item.querySelector('.btn-excluir').addEventListener('click', function() {
        if (confirm('Tem certeza que deseja excluir esta tarefa?')) {
            excluirTarefa(this.dataset.id);
        }
    });
    
    return item;
}

// Formatar tipo de tarefa
function formatarTipoTarefa(tipo) {
    const tipos = {
        'ligacao': 'Ligação',
        'reuniao': 'Reunião',
        'follow-up': 'Follow-up',
        'visita': 'Visita',
        'outro': 'Outro'
    };
    
    return tipos[tipo] || tipo;
}

// Concluir tarefa
function concluirTarefa(id) {
    const tarefa = crmData.tarefas.find(t => t.id === id);
    if (tarefa) {
        tarefa.concluida = true;
        tarefa.dataAtualizacao = new Date().toISOString();
        salvarDados();
        atualizarListaTarefas();
        atualizarDashboard();
    }
}

// Excluir tarefa
function excluirTarefa(id) {
    crmData.tarefas = crmData.tarefas.filter(t => t.id !== id);
    salvarDados();
    atualizarListaTarefas();
    atualizarDashboard();
}

// ============================
// DASHBOARD E RELATÓRIOS
// ============================

// Atualizar dashboard
function atualizarDashboard() {
    // Estatísticas básicas
    const clientesAtivos = crmData.clientes.filter(c => c.categoria === 'ativo').length;
    const negociosAbertos = crmData.negocios.filter(n => n.etapa !== 'fechamento').length;
    const valorEstimado = crmData.negocios
        .filter(n => n.etapa !== 'fechamento')
        .reduce((total, n) => total + (n.valor * n.probabilidade / 100), 0);
    const tarefasPendentes = crmData.tarefas.filter(t => !t.concluida).length;
    
    document.getElementById('clientes-ativos').textContent = clientesAtivos;
    document.getElementById('negocios-abertos').textContent = negociosAbertos;
    document.getElementById('valor-estimado').textContent = `R$ ${valorEstimado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
    document.getElementById('tarefas-pendentes').textContent = tarefasPendentes;
    
    // Gráficos
    atualizarGraficoNegociosEtapa();
    atualizarGraficoClientesCategoria();
}

// Atualizar gráfico de negócios por etapa
function atualizarGraficoNegociosEtapa() {
    const container = document.getElementById('chart-negocios-etapa');
    container.innerHTML = '';
    
    const etapas = [
        { nome: 'Prospecção', valor: 'prospeccao', cor: '#3498db' },
        { nome: 'Qualificação', valor: 'qualificacao', cor: '#2ecc71' },
        { nome: 'Proposta', valor: 'proposta', cor: '#f39c12' },
        { nome: 'Negociação', valor: 'negociacao', cor: '#e74c3c' },
        { nome: 'Fechamento', valor: 'fechamento', cor: '#9b59b6' }
    ];
    
    const maxQuantidade = Math.max(...etapas.map(e => 
        crmData.negocios.filter(n => n.etapa === e.valor).length
    ));
    
    etapas.forEach(etapa => {
        const quantidade = crmData.negocios.filter(n => n.etapa === etapa.valor).length;
        const altura = maxQuantidade > 0 ? (quantidade / maxQuantidade) * 150 : 0;
        
        const bar = document.createElement('div');
        bar.className = 'bar';
        bar.style.height = `${altura}px`;
        bar.style.backgroundColor = etapa.cor;
        
        const label = document.createElement('div');
        label.className = 'bar-label';
        label.textContent = `${etapa.nome} (${quantidade})`;
        
        const barContainer = document.createElement('div');
        barContainer.style.display = 'flex';
        barContainer.style.flexDirection = 'column';
        barContainer.style.alignItems = 'center';
        barContainer.appendChild(bar);
        barContainer.appendChild(label);
        
        container.appendChild(barContainer);
    });
}

// Atualizar gráfico de clientes por categoria
function atualizarGraficoClientesCategoria() {
    const container = document.getElementById('chart-clientes-categoria');
    container.innerHTML = '';
    
    const categorias = [
        { nome: 'Ativo', valor: 'ativo', cor: '#2ecc71' },
        { nome: 'Potencial', valor: 'potencial', cor: '#f39c12' },
        { nome: 'Inativo', valor: 'inativo', cor: '#e74c3c' }
    ];
    
    const maxQuantidade = Math.max(...categorias.map(c => 
        crmData.clientes.filter(cli => cli.categoria === c.valor).length
    ));
    
    categorias.forEach(categoria => {
        const quantidade = crmData.clientes.filter(c => c.categoria === categoria.valor).length;
        const altura = maxQuantidade > 0 ? (quantidade / maxQuantidade) * 150 : 0;
        
        const bar = document.createElement('div');
        bar.className = 'bar';
        bar.style.height = `${altura}px`;
        bar.style.backgroundColor = categoria.cor;
        
        const label = document.createElement('div');
        label.className = 'bar-label';
        label.textContent = `${categoria.nome} (${quantidade})`;
        
        const barContainer = document.createElement('div');
        barContainer.style.display = 'flex';
        barContainer.style.flexDirection = 'column';
        barContainer.style.alignItems = 'center';
        barContainer.appendChild(bar);
        barContainer.appendChild(label);
        
        container.appendChild(barContainer);
    });
}

// Atualizar relatórios
function atualizarRelatorios() {
    atualizarRelatorioClientes();
    atualizarRelatorioNegocios();
    atualizarRelatorioAtividades();
}

// Relatório de clientes
function atualizarRelatorioClientes() {
    const container = document.getElementById('relatorio-clientes');
    
    const totalClientes = crmData.clientes.length;
    const clientesAtivos = crmData.clientes.filter(c => c.categoria === 'ativo').length;
    const clientesPotenciais = crmData.clientes.filter(c => c.categoria === 'potencial').length;
    const clientesInativos = crmData.clientes.filter(c => c.categoria === 'inativo').length;
    
    container.innerHTML = `
        <p><strong>Total de Clientes:</strong> ${totalClientes}</p>
        <p><strong>Clientes Ativos:</strong> ${clientesAtivos} (${totalClientes > 0 ? Math.round((clientesAtivos / totalClientes) * 100) : 0}%)</p>
        <p><strong>Clientes Potenciais:</strong> ${clientesPotenciais} (${totalClientes > 0 ? Math.round((clientesPotenciais / totalClientes) * 100) : 0}%)</p>
        <p><strong>Clientes Inativos:</strong> ${clientesInativos} (${totalClientes > 0 ? Math.round((clientesInativos / totalClientes) * 100) : 0}%)</p>
    `;
}

// Relatório de negócios
function atualizarRelatorioNegocios() {
    const container = document.getElementById('relatorio-negocios');
    
    const totalNegocios = crmData.negocios.length;
    const negociosFechados = crmData.negocios.filter(n => n.etapa === 'fechamento').length;
    const valorTotal = crmData.negocios.reduce((total, n) => total + n.valor, 0);
    const taxaConversao = totalNegocios > 0 ? (negociosFechados / totalNegocios) * 100 : 0;
    
    container.innerHTML = `
        <p><strong>Total de Negócios:</strong> ${totalNegocios}</p>
        <p><strong>Negócios Fechados:</strong> ${negociosFechados}</p>
        <p><strong>Valor Total:</strong> R$ ${valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
        <p><strong>Taxa de Conversão:</strong> ${taxaConversao.toFixed(2)}%</p>
    `;
}

// Relatório de atividades
function atualizarRelatorioAtividades() {
    const container = document.getElementById('relatorio-atividades');
    
    const totalTarefas = crmData.tarefas.length;
    const tarefasConcluidas = crmData.tarefas.filter(t => t.concluida).length;
    const tarefasPendentes = crmData.tarefas.filter(t => !t.concluida).length;
    const taxaConclusao = totalTarefas > 0 ? (tarefasConcluidas / totalTarefas) * 100 : 0;
    
    container.innerHTML = `
        <p><strong>Total de Tarefas:</strong> ${totalTarefas}</p>
        <p><strong>Tarefas Concluídas:</strong> ${tarefasConcluidas}</p>
        <p><strong>Tarefas Pendentes:</strong> ${tarefasPendentes}</p>
        <p><strong>Taxa de Conclusão:</strong> ${taxaConclusao.toFixed(2)}%</p>
    `;
}

// ============================
// BACKUP E CONFIGURAÇÕES
// ============================

// Exportar dados
function exportarDados() {
    const dados = {
        clientes: crmData.clientes,
        negocios: crmData.negocios,
        tarefas: crmData.tarefas,
        exportadoEm: new Date().toISOString()
    };
    
    const dadosStr = JSON.stringify(dados, null, 2);
    const blob = new Blob([dadosStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `crm-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    alert('Dados exportados com sucesso!');
}

// Importar dados
function importarDados(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const dados = JSON.parse(e.target.result);
            
            if (confirm('Esta ação substituirá todos os dados atuais. Continuar?')) {
                if (dados.clientes) crmData.clientes = dados.clientes;
                if (dados.negocios) crmData.negocios = dados.negocios;
                if (dados.tarefas) crmData.tarefas = dados.tarefas;
                
                salvarDados();
                atualizarInterface();
                
                alert('Dados importados com sucesso!');
            }
        } catch (error) {
            alert('Erro ao importar dados. Verifique se o arquivo é válido.');
            console.error(error);
        }
        
        // Limpar input
        e.target.value = '';
    };
    
    reader.readAsText(file);
}

// Limpar dados
function limparDados() {
    if (confirm('Tem certeza que deseja limpar todos os dados? Esta ação não pode ser desfeita.')) {
        crmData.clientes = [];
        crmData.negocios = [];
        crmData.tarefas = [];
        
        salvarDados();
        atualizarInterface();
        
        alert('Todos os dados foram removidos.');
    }
}

// ============================
// FUNÇÕES AUXILIARES
// ============================

// Formatar data
function formatarData(dataStr) {
    if (!dataStr) return '-';
    
    const data = new Date(dataStr);
    return data.toLocaleDateString('pt-BR');
}

// Adicionar estilos para categorias
const style = document.createElement('style');
style.textContent = `
    .categoria.ativo { color: #27ae60; font-weight: bold; }
    .categoria.potencial { color: #f39c12; font-weight: bold; }
    .categoria.inativo { color: #e74c3c; font-weight: bold; }
    
    .acoes button {
        padding: 0.25rem 0.5rem;
        margin: 0 0.125rem;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 0.8rem;
    }
    
    .btn-editar { background-color: #3498db; color: white; }
    .btn-excluir { background-color: #e74c3c; color: white; }
    .btn-concluir { background-color: #27ae60; color: white; }
    
    .negocio-actions button {
        padding: 0.25rem 0.5rem;
        margin: 0.125rem;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 0.7rem;
    }
`;
document.head.appendChild(style);