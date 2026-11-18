const API_URL = 'http://localhost:3000/api';
let isLoginMode = true;

const authContainer = document.getElementById('auth-container');
const dashboardContainer = document.getElementById('dashboard-container');
const authCardBox = document.getElementById('auth-card-box');
const authForm = document.getElementById('auth-form');
const authTitle = document.getElementById('auth-title');
const authBtn = document.getElementById('auth-btn');
const switchText = document.getElementById('switch-text');
const switchBtn = document.getElementById('switch-btn');
const passwordLabel = document.getElementById('password-label');
const passwordInput = document.getElementById('password');
const confirmPasswordGroup = document.getElementById('confirm-password-group');
const confirmPasswordInput = document.getElementById('confirm-password');

const togglePasswordBtn = document.getElementById('toggle-password');
const toggleConfirmPasswordBtn = document.getElementById('toggle-confirm-password');

const logoutBtn = document.getElementById('logout-btn');
const userDisplay = document.getElementById('user-display');
const transactionForm = document.getElementById('transaction-form');
const transactionList = document.getElementById('transaction-list');

const totalBalanceEl = document.getElementById('total-balance');
const totalIncomeEl = document.getElementById('total-income');
const totalExpenseEl = document.getElementById('total-expense');


const closedEyeSvg = `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>`;
const openEyeSvg = `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>`;


togglePasswordBtn.addEventListener('click', () => {
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        togglePasswordBtn.innerHTML = openEyeSvg;
    } else {
        passwordInput.type = 'password';
        togglePasswordBtn.innerHTML = closedEyeSvg;
    }
});

toggleConfirmPasswordBtn.addEventListener('click', () => {
    if (confirmPasswordInput.type === 'password') {
        confirmPasswordInput.type = 'text';
        toggleConfirmPasswordBtn.innerHTML = openEyeSvg;
    } else {
        confirmPasswordInput.type = 'password';
        toggleConfirmPasswordBtn.innerHTML = closedEyeSvg;
    }
});


switchBtn.addEventListener('click', (e) => {
    e.preventDefault();
    
    authCardBox.classList.remove('turn-in');
    authCardBox.classList.add('turn-out');

    setTimeout(() => {
        isLoginMode = !isLoginMode;
        
        authTitle.textContent = isLoginMode ? 'Login' : 'Create Account';
        passwordLabel.textContent = isLoginMode ? 'Password' : 'New Password';
        authBtn.textContent = isLoginMode ? 'Login' : 'Register';
        switchText.textContent = isLoginMode ? "Don't have an account?" : "Already have an account?";
        switchBtn.textContent = isLoginMode ? 'Register' : 'Login';

        if (isLoginMode) {
            confirmPasswordGroup.classList.add('hidden');
            confirmPasswordInput.required = false;
            confirmPasswordInput.value = '';
        } else {
            confirmPasswordGroup.classList.remove('hidden');
            confirmPasswordInput.required = true;
        }

        authForm.reset();
        passwordInput.type = 'password';
        confirmPasswordInput.type = 'password';
        togglePasswordBtn.innerHTML = closedEyeSvg;
        toggleConfirmPasswordBtn.innerHTML = closedEyeSvg;

        authCardBox.classList.remove('turn-out');
        authCardBox.classList.add('turn-in');
    }, 500);
});


authForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;

    if (!isLoginMode && password !== confirmPassword) {
        alert('Passwords do not match! Please re-enter carefully.');
        return;
    }

    const endpoint = isLoginMode ? '/login' : '/register';

    try {
        const res = await fetch(API_URL + endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);

        if (isLoginMode) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('username', data.username);
            loadDashboard(data.username);
        } else {
            alert('Registration successful! Please login.');
            authForm.reset();
            switchBtn.click();
        }
    } catch (err) {
        alert(err.message);
    }
});


logoutBtn.addEventListener('click', () => {
    localStorage.clear();
    dashboardContainer.classList.add('hidden');
    authContainer.classList.remove('hidden');
});

function loadDashboard(username) {
    authContainer.classList.add('hidden');
    dashboardContainer.classList.remove('hidden');
    userDisplay.textContent = username;
    document.getElementById('date').valueAsDate = new Date();
    fetchTransactions();
}

async function fetchTransactions() {
    try {
        const res = await fetch(`${API_URL}/transactions`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (!res.ok) throw new Error('Failed to fetch transactions');
        const transactions = await res.json();
        renderTransactions(transactions);
    } catch (err) {
        console.error(err);
    }
}

transactionForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const newTx = {
        title: document.getElementById('title').value,
        amount: parseFloat(document.getElementById('amount').value),
        type: document.getElementById('type').value,
        category: document.getElementById('category').value,
        date: document.getElementById('date').value
    };

    try {
        const res = await fetch(`${API_URL}/transactions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(newTx)
        });
        if (!res.ok) throw new Error('Failed to add transaction');
        transactionForm.reset();
        document.getElementById('date').valueAsDate = new Date();
        fetchTransactions();
    } catch (err) {
        alert(err.message);
    }
});

async function deleteTransaction(id) {
    try {
        const res = await fetch(`${API_URL}/transactions/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (!res.ok) throw new Error('Failed to delete');
        fetchTransactions();
    } catch (err) {
        alert(err.message);
    }
}

function renderTransactions(transactions) {
    transactionList.innerHTML = '';
    let income = 0;
    let expense = 0;

    transactions.forEach(tx => {
        if (tx.type === 'income') income += tx.amount;
        else expense += tx.amount;

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${tx.date}</td>
            <td>${tx.title}</td>
            <td>${tx.category}</td>
            <td class="${tx.type === 'income' ? 'income-text' : 'expense-text'}">${tx.type.toUpperCase()}</td>
            <td class="${tx.type === 'income' ? 'income-text' : 'expense-text'}">${tx.type === 'income' ? '+' : '-'}₹${tx.amount.toFixed(2)}</td>
            <td><button class="btn btn-danger" onclick="deleteTransaction(${tx.id})">Delete</button></td>
        `;
        transactionList.appendChild(row);
    });

    const balance = income - expense;
    totalIncomeEl.textContent = `₹${income.toFixed(2)}`;
    totalExpenseEl.textContent = `₹${expense.toFixed(2)}`;
    totalBalanceEl.textContent = `₹${balance.toFixed(2)}`;
}

window.onload = () => {
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username');
    if (token && username) {
        loadDashboard(username);
    }
};