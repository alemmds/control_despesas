class GerenciadorGastos {
  constructor() {
    this.registros = JSON.parse(localStorage.getItem('registros')) || [];
    this.init();
  }

  init() {
    this.setupTabs();
    this.setupForm();
    this.setupFiltro();
    this.renderRegistros();
  }

  setupTabs() {
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        
        const target = tab.dataset.tab;
        document.querySelectorAll('.tab-content').forEach(content => {
          content.classList.remove('active');
        });
        document.getElementById(target).classList.add('active');
      });
    });
  }

  setupForm() {
    const form = document.getElementById('formulario');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.adicionarRegistro();
      form.reset();
    });
  }

  setupFiltro() {
    const filtro = document.getElementById('mes');
    filtro.addEventListener('change', () => {
      this.renderRegistros();
    });
  }

  adicionarRegistro() {
    const data = document.getElementById('data').value;
    if (!data) {
      alert('Por favor, insira uma data válida.');
      return;
    }

    const registro = {
      id: Date.now(),
      descricao: document.getElementById('descricao').value,
      destino: document.getElementById('destino').value,
      remetente: document.getElementById('remetente').value,
      valor: parseFloat(document.getElementById('valor').value),
      data: data,
      tipo: document.querySelector('input[name="tipo"]:checked').value
    };

    this.registros.push(registro);
    this.salvarRegistros();
    this.renderRegistros();
  }

  editarRegistro(id) {
    const registro = this.registros.find(r => r.id === id);
    if (registro) {
      document.getElementById('descricao').value = registro.descricao;
      document.getElementById('destino').value = registro.destino;
      document.getElementById('remetente').value = registro.remetente;
      document.getElementById('valor').value = registro.valor;
      document.getElementById('data').value = registro.data;
      document.querySelector(`input[name="tipo"][value="${registro.tipo}"]`).checked = true;
      
      this.registros = this.registros.filter(r => r.id !== id);
      this.salvarRegistros();
      this.renderRegistros();
    }
  }

  excluirRegistro(id) {
    this.registros = this.registros.filter(r => r.id !== id);
    this.salvarRegistros();
    this.renderRegistros();
  }

  salvarRegistros() {
    localStorage.setItem('registros', JSON.stringify(this.registros));
  }

  renderRegistros() {
    const lista = document.getElementById('lista-registros');
    const mesSelecionado = document.getElementById('mes').value;

    const registrosFiltrados = mesSelecionado
      ? this.registros.filter(r => r.data && r.data.startsWith(mesSelecionado))
      : this.registros;

    const registrosPorMes = registrosFiltrados.reduce((acc, registro) => {
      if (!registro.data) return acc; // Skip if data is undefined
      const mes = registro.data.substring(0, 7);
      if (!acc[mes]) {
        acc[mes] = [];
      }
      acc[mes].push(registro);
      return acc;
    }, {});

    lista.innerHTML = Object.entries(registrosPorMes).map(([mes, registros]) => {
      const totalGastos = registros
        .filter(r => r.tipo === 'Gasto')
        .reduce((sum, r) => sum + r.valor, 0);

      const totalDespesas = registros
        .filter(r => r.tipo === 'Despesa Fixa')
        .reduce((sum, r) => sum + r.valor, 0);

      return `
        <div class="mes-registro">
          <div class="mes-cabecalho">
            <span>${new Date(mes).toLocaleString('pt-BR', { month: 'long', year: 'numeric' })}</span>
            <span>Gastos: R$ ${totalGastos.toFixed(2)}</span>
            <span>Despesas Fixas: R$ ${totalDespesas.toFixed(2)}</span>
          </div>
          <div class="mes-conteudo">
            ${registros.map(registro => `
              <div class="registro">
                <div class="registro-cabecalho">
                  <span>${registro.descricao} - R$ ${registro.valor.toFixed(2)}</span>
                  <div class="acoes">
                    <button class="editar" onclick="gerenciador.editarRegistro(${registro.id})">Editar</button>
                    <button class="excluir" onclick="gerenciador.excluirRegistro(${registro.id})">Excluir</button>
                  </div>
                </div>
                <div class="registro-conteudo">
                  <p><strong>Destino:</strong> ${registro.destino}</p>
                  <p><strong>Remetente:</strong> ${registro.remetente}</p>
                  <p><strong>Tipo:</strong> ${registro.tipo}</p>
                  <p><strong>Data:</strong> ${new Date(registro.data).toLocaleDateString('pt-BR')}</p>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }).join('');

    document.querySelectorAll('.mes-cabecalho').forEach(cabecalho => {
      cabecalho.addEventListener('click', () => {
        const conteudo = cabecalho.nextElementSibling;
        conteudo.classList.toggle('active');
      });
    });

    document.querySelectorAll('.registro-cabecalho').forEach(cabecalho => {
      cabecalho.addEventListener('click', () => {
        const conteudo = cabecalho.nextElementSibling;
        conteudo.classList.toggle('active');
      });
    });
  }
}

const gerenciador = new GerenciadorGastos();
