// Configuração Firebase
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

let uid = null;
let dividas = [];
let saldo = 0;

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

// Login
function login() {
  const email = document.getElementById('login-email').value;
  const senha = document.getElementById('login-password').value;

  auth.signInWithEmailAndPassword(email, senha)
    .then((userCredential) => {
      uid = userCredential.user.uid;
      carregarDadosUsuario();
      document.getElementById('login-email').value = '';
      document.getElementById('login-password').value = '';
      alert('Login realizado com sucesso!');
    })
    .catch(error => {
      alert('Erro ao fazer login: ' + error.message);
    });
}

// Cadastro
function cadastrarUsuario() {
  const email = document.getElementById('cadastro-email').value;
  const senha = document.getElementById('cadastro-senha').value;

  auth.createUserWithEmailAndPassword(email, senha)
    .then(() => {
      alert('Cadastro realizado com sucesso! Faça login.');
      document.getElementById('cadastro-email').value = '';
      document.getElementById('cadastro-senha').value = '';
      auth.signOut();
      toggleToLogin();
    })
    .catch(error => {
      alert('Erro ao cadastrar: ' + error.message);
    });
}

// Alternar entre login e cadastro
function toggleToCadastro() {
  document.getElementById('login-container').style.display = 'none';
  document.getElementById('cadastro-container').style.display = 'block';
}

function toggleToLogin() {
  document.getElementById('cadastro-container').style.display = 'none';
  document.getElementById('login-container').style.display = 'block';
}

// Salvar dados no Firebase
function salvarDadosUsuario() {
  if (!uid) return;

  database.ref('usuarios/' + uid).set({
    dividas,
    saldo
  });
}

// Carregar dados do Firebase
function carregarDadosUsuario() {
  if (!uid) return;

  database.ref('usuarios/' + uid).once('value')
    .then(snapshot => {
      const data = snapshot.val();
      dividas = data?.dividas || [];
      saldo = typeof data?.saldo === 'number' ? data.saldo : 0;

      atualizarListaDividas();
      atualizarTotal();
      document.getElementById('saldoInicial').value = saldo.toFixed(2);
    });
}

// Adicionar saldo
function adicionarSaldo() {
  const novoSaldo = parseFloat(document.getElementById('saldoInicial').value);
  if (isNaN(novoSaldo) || novoSaldo < 0) {
    alert('Digite um valor válido para o saldo.');
    return;
  }

  saldo = novoSaldo;
  atualizarTotal();
  salvarDadosUsuario();
  document.getElementById('saldoInicial').value = '';
}

// Adicionar dívida
function adicionarDivida() {
  const nome = document.getElementById('nome').value;
  const valor = parseFloat(document.getElementById('valor').value);

  if (!nome || isNaN(valor) || valor <= 0) {
    alert('Insira um nome e um valor válido.');
    return;
  }

  dividas.push({ nome, valor, paga: false });
  atualizarListaDividas();
  atualizarTotal();
  salvarDadosUsuario();

  document.getElementById('nome').value = '';
  document.getElementById('valor').value = '';
}

// Atualizar lista de dívidas
function atualizarListaDividas() {
  const lista = document.getElementById('listaDividas');
  lista.innerHTML = '';

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

    lista.appendChild(div);
  });
}

// Marcar como paga
function marcarComoPaga(index) {
  dividas[index].paga = true;
  atualizarListaDividas();
  atualizarTotal();
  salvarDadosUsuario();
}

// Editar dívida
function editarDivida(index) {
  const novaDesc = prompt('Editar nome da dívida', dividas[index].nome);
  const novoValor = parseFloat(prompt('Editar valor da dívida', dividas[index].valor));

  if (novaDesc !== null && !isNaN(novoValor)) {
    dividas[index].nome = novaDesc;
    dividas[index].valor = novoValor;
    atualizarListaDividas();
    atualizarTotal();
    salvarDadosUsuario();
  }
}

// Excluir dívida
function excluirDivida(index) {
  dividas.splice(index, 1);
  atualizarListaDividas();
  atualizarTotal();
  salvarDadosUsuario();
}

// Atualizar total
function atualizarTotal() {
  const total = dividas.reduce((acc, d) => acc + (d.paga ? 0 : d.valor), 0);
  document.getElementById('total').textContent = total.toFixed(2);

  const restante = saldo - total;
  document.getElementById('saldoRestante').textContent = restante.toFixed(2);
}

// Logout
function logout() {
  salvarDadosUsuario();
  auth.signOut();
}

// Exportar PDF
function exportarPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  doc.text('Controle de Dívidas', 20, 20);
  doc.text(`Saldo Inicial: R$ ${saldo.toFixed(2)}`, 20, 30);

  let y = 40;
  dividas.forEach(d => {
    doc.text(`${d.nome} - R$ ${d.valor.toFixed(2)} - ${d.paga ? 'Paga' : 'Pendente'}`, 20, y);
    y += 10;
  });

  doc.save('controle_de_dividas.pdf');
}

// Exportar Excel
function exportarExcel() {
  const ws = XLSX.utils.aoa_to_sheet([['Nome', 'Valor', 'Status']]);
  dividas.forEach(d => {
    XLSX.utils.sheet_add_aoa(ws, [[d.nome, d.valor.toFixed(2), d.paga ? 'Paga' : 'Pendente']], { origin: -1 });
  });

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Dívidas');
  XLSX.writeFile(wb, 'controle_de_dividas.xlsx');
}
