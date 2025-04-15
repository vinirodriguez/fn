// Firebase Config
const firebaseConfig = {
    apiKey: "AIzaSyBIfgDiQ9XnUqQY_7WxD7HoVWs7WCZ5AX8",
    authDomain: "gerenciamento-de-dividas.firebaseapp.com",
    databaseURL: "https://gerenciamento-de-dividas.firebaseio.com",
    projectId: "gerenciamento-de-dividas",
    storageBucket: "gerenciamento-de-dividas.appspot.com",
    messagingSenderId: "308196623852",
    appId: "1:308196623852:web:2b05c48671f74a3b38acc9",
    measurementId: "G-4NB7X55M7R"
  };
  
  firebase.initializeApp(firebaseConfig);
  const auth = firebase.auth();
  const database = firebase.database();
  
  let dividas = [];
  let saldo = 0;
  let uid = null;
  
  // Autenticação
  auth.onAuthStateChanged(user => {
    const loginContainer = document.getElementById('login-container');
    const cadastroContainer = document.getElementById('cadastro-container');
    const controleContainer = document.getElementById('controle-container');
  
    if (user) {
      uid = user.uid;
      loginContainer.style.display = 'none';
      cadastroContainer.style.display = 'none';
      controleContainer.style.display = 'block';
      carregarDadosUsuario();
    } else {
      uid = null;
      dividas = [];
      saldo = 0;
      atualizarListaDividas();
      atualizarTotal();
      loginContainer.style.display = 'block';
      cadastroContainer.style.display = 'none';
      controleContainer.style.display = 'none';
    }
  });
  
  // Carregar dados do Firebase
  function carregarDadosUsuario() {
    database.ref('usuarios/' + uid).once('value').then(snapshot => {
      const data = snapshot.val();
      if (data) {
        dividas = data.dividas || [];
        saldo = typeof data.saldo === "number" ? data.saldo : 0;
      } else {
        dividas = [];
        saldo = 0;
      }
      atualizarListaDividas();
      atualizarTotal();
      document.getElementById('saldoInicial').value = saldo.toFixed(2); // mostra o saldo atual
    });
  }
  
  
  // Salvar dados no Firebase
  function salvarDadosUsuario() {
    if (!uid) return;
    database.ref('usuarios/' + uid).set({
      dividas: dividas,
      saldo: saldo
    });
  }
  
  // Login
  function login() {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
  
    auth.signInWithEmailAndPassword(email, password)
      .then(() => {
        document.getElementById('login-email').value = '';
        document.getElementById('login-password').value = '';
        alert("Login realizado com sucesso!");
      })
      .catch(error => {
        alert("Erro ao fazer login: " + error.message);
      });
  }
  
  // Cadastro
  function cadastrarUsuario() {
    const email = document.getElementById('cadastro-email').value;
    const senha = document.getElementById('cadastro-senha').value;
  
    auth.createUserWithEmailAndPassword(email, senha)
      .then(() => {
        alert("Cadastro realizado com sucesso! Faça o login.");
        document.getElementById('cadastro-email').value = '';
        document.getElementById('cadastro-senha').value = '';
        auth.signOut();
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
  
  // Saldo
  function adicionarSaldo() {
    const novoSaldo = parseFloat(document.getElementById('saldoInicial').value);
    if (isNaN(novoSaldo) || novoSaldo <= 0) {
      alert('Digite um valor válido para o saldo.');
      return;
    }
  
    saldo = novoSaldo; // Define o saldo fixo, sem somar
    atualizarTotal();
    salvarDadosUsuario();
    document.getElementById('saldoInicial').value = '';
  }
  
  
  // Dívidas
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
    salvarDadosUsuario();
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
  
    if (novoNome !== null && novoValor !== null && !isNaN(parseFloat(novoValor))) {
      dividas[index].nome = novoNome;
      dividas[index].valor = parseFloat(novoValor);
      atualizarListaDividas();
      atualizarTotal();
      salvarDadosUsuario();
    }
  }
  
  function marcarComoPaga(index) {
    dividas[index].paga = true;
    atualizarListaDividas();
    atualizarTotal();
    salvarDadosUsuario();
  }
  
  function excluirDivida(index) {
    dividas.splice(index, 1);
    atualizarListaDividas();
    atualizarTotal();
    salvarDadosUsuario();
  }
  
  function atualizarTotal() {
    let totalDividas = dividas.reduce((total, divida) => total + (divida.paga ? 0 : divida.valor), 0);
    document.getElementById('total').textContent = totalDividas.toFixed(2);
  
    let saldoRestante = saldo - totalDividas;
    document.getElementById('saldoRestante').textContent = saldoRestante.toFixed(2);
  }
  
  // Logout
  function logout() {
    auth.signOut().then(() => {
      dividas = [];
      saldo = 0;
      uid = null;
      document.getElementById('controle-container').style.display = 'none';
      document.getElementById('login-container').style.display = 'block';
    });
  }