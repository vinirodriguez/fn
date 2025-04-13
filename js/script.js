const firebaseConfig = {
    apiKey: "AIzaSyBIfgDiQ9XnUqQY_7WxD7HoVWs7WCZ5AX8",
    authDomain: "gerenciamento-de-dividas.firebaseapp.com",
    databaseURL: "https://gerenciamento-de-dividas.firebaseio.com",
    projectId: "gerenciamento-de-dividas",
    storageBucket: "gerenciamento-de-dividas.firebasestorage.app",
    messagingSenderId: "308196623852",
    appId: "1:308196623852:web:2b05c48671f74a3b38acc9",
    measurementId: "G-4NB7X55M7R"
  };
  
  firebase.initializeApp(firebaseConfig);
  const auth = firebase.auth();
  
  firebase.auth().onAuthStateChanged(user => {
    if (user) {
      document.getElementById('login-container').style.display = 'none';
      document.getElementById('controle-container').style.display = 'block';
    }
  });
  
  function login() {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
  
    auth.signInWithEmailAndPassword(email, password)
      .then(() => {
        alert("Login realizado com sucesso!");
      })
      .catch(error => {
        alert("Erro ao fazer login: " + error.message);
      });
  }
  
  function cadastrarUsuario() {
    const email = document.getElementById('cadastro-email').value;
    const senha = document.getElementById('cadastro-senha').value;
  
    auth.createUserWithEmailAndPassword(email, senha)
      .then(() => {
        alert("Cadastro realizado com sucesso!");
        toggleToLogin();
      })
      .catch(error => {
        alert("Erro ao cadastrar: " + error.message);
      });
  }
  
  function toggleToCadastro() {
    document.getElementById('login-container').style.display = 'none';
    document.getElementById('cadastro-container').style.display = 'block';
  }
  
  function toggleToLogin() {
    document.getElementById('cadastro-container').style.display = 'none';
    document.getElementById('login-container').style.display = 'block';
  }
  
  function alternarTema() {
    document.body.classList.toggle('light-theme');
  }
  
  let dividas = [];
  let saldo = 0;
  
  function adicionarSaldo() {
    const novoSaldo = parseFloat(document.getElementById('saldoInicial').value);
    if (isNaN(novoSaldo) || novoSaldo <= 0) {
      alert('Digite um valor válido para o saldo.');
      return;
    }
  
    saldo += novoSaldo;
    document.getElementById('saldoRestante').textContent = saldo.toFixed(2);
  }
  
  function adicionarDivida() {
    const nomeDivida = document.getElementById('nome').value;
    const valorDivida = parseFloat(document.getElementById('valor').value);
  
    if (!nomeDivida || isNaN(valorDivida) || valorDivida <= 0) {
      alert('Insira um nome válido e um valor válido.');
      return;
    }
  
    dividas.push({ nome: nomeDivida, valor: valorDivida, paga: false });
    atualizarListaDividas();
    atualizarTotal();
    document.getElementById('nome').value = '';
    document.getElementById('valor').value = '';
  }
  
  function atualizarListaDividas() {
    const listaDividas = document.getElementById('listaDividas');
    listaDividas.innerHTML = '';
  
    dividas.forEach((divida, index) => {
      const div = document.createElement('div');
      div.classList.add('divida');
      if (divida.paga) div.classList.add('paga');
  
      div.innerHTML = `
        <span>${divida.nome} - R$ ${divida.valor.toFixed(2)}</span>
        <button class="small-button" onclick="marcarComoPaga(${index})">${divida.paga ? 'Paga' : 'Marcar como paga'}</button>
        <button class="small-button" onclick="editarDivida(${index})">Editar</button>
        <button class="small-button" onclick="excluirDivida(${index})">Excluir</button>
      `;
      listaDividas.appendChild(div);
    });
  }
  
  function editarDivida(index) {
    const divida = dividas[index];
    const novoNome = prompt("Editar nome da dívida", divida.nome);
    const novoValor = prompt("Editar valor da dívida", divida.valor);
  
    if (novoNome !== null && novoValor !== null) {
      dividas[index].nome = novoNome;
      dividas[index].valor = parseFloat(novoValor);
      atualizarListaDividas();
      atualizarTotal();
    }
  }
  
  function marcarComoPaga(index) {
    dividas[index].paga = true;
    atualizarListaDividas();
    atualizarTotal();
  }
  
  function excluirDivida(index) {
    dividas.splice(index, 1);
    atualizarListaDividas();
    atualizarTotal();
  }
  
  function atualizarTotal() {
    let totalDividas = dividas.reduce((total, divida) => total + (divida.paga ? 0 : divida.valor), 0);
    document.getElementById('total').textContent = totalDividas.toFixed(2);
    let saldoRestante = saldo - totalDividas;
    document.getElementById('saldoRestante').textContent = saldoRestante.toFixed(2);
  }
  
  function logout() {
    auth.signOut().then(() => {
      document.getElementById('controle-container').style.display = 'none';
      document.getElementById('login-container').style.display = 'block';
    });
  }
  
  function exportarParaPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    doc.text("Relatório de Dívidas - APC Finanças", 10, 10);
    let y = 20;
    dividas.forEach((divida, i) => {
      doc.text(`${i + 1}. ${divida.nome} - R$ ${divida.valor.toFixed(2)} - ${divida.paga ? 'Paga' : 'Pendente'}`, 10, y);
      y += 10;
    });
    doc.save("dividas.pdf");
  }
  
  function exportarParaExcel() {
    const wb = XLSX.utils.book_new();
    const ws_data = [["Nome", "Valor", "Status"]];
    dividas.forEach(divida => {
      ws_data.push([divida.nome, divida.valor, divida.paga ? "Paga" : "Pendente"]);
    });
    const ws = XLSX.utils.aoa_to_sheet(ws_data);
    XLSX.utils.book_append_sheet(wb, ws, "Dívidas");
    XLSX.writeFile(wb, "dividas.xlsx");
  }
  