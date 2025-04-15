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

// Controle de autenticação
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
    document.getElementById('saldoInicial').value = saldo.toFixed(2);
  });
}

// Salvar dados no Firebase
function salvarDadosUsuario() {
  if (!uid) return;
  database.ref('usuarios/' + uid).set({
    dividas: dividas,
    saldo: saldo
  }).then(() => {
    console.log("Dados salvos com sucesso.");
  }).catch(error => {
    console.error("Erro ao salvar dados:", error);
  });
}

// Função login
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

// Função cadastrar usuário
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

// Funções para alternar entre login e cadastro
function toggleToCadastro() {
  document.getElementById('login-container').style.display = 'none';
  document.getElementById('cadastro-container').style.display = 'block';
}

function toggleToLogin() {
  document.getElementById('cadastro-container').style.display = 'none';
  document.getElementById('login-container').style.display = 'block';
}

// Função para adicionar saldo
function adicionarSaldo() {
  const novoSaldo = parseFloat(document.getElementById('saldoInicial').value);
  if (isNaN(novoSaldo) || novoSaldo <= 0) {
    alert('Digite um valor válido para o saldo.');
    return;
  }

  saldo = novoSaldo;
  atualizarTotal();
  salvarDadosUsuario();
  document.getElementById('saldoInicial').value = '';
}

// Função para adicionar dívida
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

// Função para atualizar a lista de dívidas
function atualizarListaDividas() {
  const listaDividas = document.getElementById('listaDividas');
  listaDividas.innerHTML = '';

  dividas.forEach((divida, index) => {
    const div = document.createElement('div');
    div.classList.add('divida');
    if (divida.paga) div.classList.add('paga');

    div.innerHTML = `
      <span>${divida.nome} - R$ ${divida.valor.toFixed(2)}</span>
      <button onclick="marcarComoPaga(${index})">${divida.paga ? 'Paga' : 'Marcar como paga'}</button>
      <button onclick="editarDivida(${index})">Editar</button>
      <button onclick="excluirDivida(${index})">Excluir</button>
    `;
    listaDividas.appendChild(div);
  });
}

// Função para editar dívida
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

// Função para marcar dívida como paga
function marcarComoPaga(index) {
  dividas[index].paga = true;
  atualizarListaDividas();
  atualizarTotal();
  salvarDadosUsuario();
}

// Função para excluir dívida
function excluirDivida(index) {
  dividas.splice(index, 1);
  atualizarListaDividas();
  atualizarTotal();
  salvarDadosUsuario();
}

// Função para atualizar o total
function atualizarTotal 
