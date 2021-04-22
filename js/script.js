// Local Storage
const Storage = {
    get() {
        return JSON.parse(localStorage.getItem("dev.finances:transactions")) || [];
    },
    set(transactions) {
        localStorage.setItem("dev.finances:transactions", JSON.stringify(transactions));
    }
}
// Transactions -------- executa as transações de incomes, expenses & total
const Transaction = {
    all: Storage.get(),

    add(transaction){
        Transaction.all.push(transaction)

        App.reload()
    },

    remove(index) {
        Transaction.all.splice(index, 1)

        App.reload()
    },

    incomes () {
        let income = 0;
        Transaction.all.forEach(transaction => {
            if (transaction.amount > 0) {
                income += transaction.amount;
            }
        })
        return income;
    },  

    expenses() {
        let expense = 0;
        Transaction.all.forEach(transaction => {
            if (transaction.amount < 0) {
                expense += transaction.amount;
            }
        })
        return expense;
    },

    total () {
        return Transaction.incomes() + Transaction.expenses();
    },
}
// Modal ------------ abre e fecha a caixa modal
const Modal = {
    open(){
        document.querySelector('.modal-overlay').classList.add('active');
    },
    close() {
        document.querySelector('.modal-overlay').classList.remove('active');
    }
}
// Substituir dados do HTML pelos do JS
const DOM = {
    // Define transactionsContainer como o <tbody></tbody> contido em data-table
    transactionsContainer: document.querySelector('#data-table tbody'),

    addTransaction (transaction, index) {
        // Cosnt tr = createElement <tr></tr>
        const tr = document.createElement('tr');
        // Adiciona à constante "tr" (<tr></tr>) a constante "html"(<td></td>) retornada da função innerHTMLTransaction
        tr.innerHTML = DOM.innerHTMLTransaction(transaction, index)
        tr.dataset.index = index

        // Adiciona o elemento filho <tr></tr> ao this.transactionsContainer (<tbody></tbody>)
        DOM.transactionsContainer.appendChild(tr)
    },

    innerHTMLTransaction(transaction, index) {

        // Se o valor do amount for > 0, cssClass = "income", senão = "expense"
        const cssClass = transaction.amount > 0 ? "income" : "expense";
        
        // Variavel amount é = ao valor do amount formatado pela função formatCurrency do obj Utils
        const amount = Utils.formatCurrency(transaction.amount); 
        
        // Cosntante que representa a table data a ser adicionada
        const html = `
        <td class="description">${transaction.description}</td>
        <td class="${cssClass}">${amount}</td>
        <td class="date">${transaction.date}</td>
        <td>
            <img onclick="Transaction.remove(${index})" src="./img/minus.svg" alt="Remover Transação">
        </td>
        `
        // Retorna essa table data( que é usada na função acima(this.addTransaction))
        return html
    },

    // Atualiza o Balanço a partir das funções do objeto Transaction
    updateBalance() {
        document.getElementById('incomeDisplay').innerHTML = Utils.formatCurrency(Transaction.incomes());
        document.getElementById('expenseDisplay').innerHTML = Utils.formatCurrency(Transaction.expenses());
        document.getElementById('totalDisplay').innerHTML = Utils.formatCurrency(Transaction.total());
    },

    clearTransactions() {
        DOM.transactionsContainer.innerHTML = ""
    }
}
// Funções que formatam valores
const Utils = {
    formatAmount (value) {
        value = Number(value) * 100

        return value
    },

    formatDate (date) {
        const splittedDate = date.split("-")
        return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`
    },

    // Trata o parametro
    formatCurrency(value) {
        const signal = Number(value) < 0 ? "-" : "";

        value = String(value).replace(/\D/g, "")

        value = Number(value) / 100;

        value = value.toLocaleString("pt-BR",{
            style: "currency",
            currency: "BRL"
        })

        // Retorna o respectivo sinal + valor numeral formatado
        return signal + value
    }
}
// Tratamento do Formulário
const Form = {
    description: document.querySelector('input#description'),
    amount : document.querySelector('input#amount'),
    date: document.querySelector('input#date'),

    getValues() {
        return {
            description: Form.description.value,
            amount: Form.amount.value,
            date: Form.date.value
        }
    },

    formatValues () {
        let {description, amount, date} = Form.getValues()
        amount = Utils.formatAmount(amount)

        date = Utils.formatDate(date)

        return {
            description,
            amount,
            date
        }
    },

    validateFields() {
        const {description, amount, date} = Form.getValues()

        if(
            description.trim() === "" || 
            amount.trim() === "" ||
            date.trim() === "") {
                throw new Error("Por favor, preencha todos os campos")
        }
    },

    saveTransaction(transaction) {
        Transaction.add(transaction)
    },

    clearFields() {
        Form.description.value = ""
        Form.amount.value = ""
        Form.date.value = ""
    },
    
    submit(event) {
        event.preventDefault()

        try {
            // Verificar se todas as informações foram preenchidas
            Form.validateFields()
            // Formatar os dados para salvar
            const transaction = Form.formatValues()
            // salvar
            Form.saveTransaction(transaction)
            // apagar dados do form
            Form.clearFields()
            // fechar modal
            Modal.close()
            // Atualizar o app(Transaction.add ja efetua o reload)
        } catch (error) {
            alert(error.message)
        }
    }   
}
// Tratar acionamento das funções de nova transação
const App = {
    
    init() {
        // Para cada item do array transactions executa a função anonima com o parametro transaction que faz executar a função addTransaction do obj DOM
        Transaction.all.forEach(DOM.addTransaction)

        // Chama a função que atualiza o balanço
        DOM.updateBalance()

        Storage.set(Transaction.all)

    },
    reload() {
        DOM.clearTransactions()
        App.init()
    },
}
// Iniciar adição de novas transações e atualizar
App.init()

