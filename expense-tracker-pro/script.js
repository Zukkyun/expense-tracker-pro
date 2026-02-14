let transactions = JSON.parse(localStorage.getItem("transactions")) || [];
const form = document.getElementById("transactionForm");
const list = document.getElementById("transactionList");
const totalIncomeEl = document.getElementById("totalIncome");
const totalExpenseEl = document.getElementById("totalExpense");
const balanceEl = document.getElementById("balance");
const monthFilter = document.getElementById("monthFilter");
const exportBtn = document.getElementById("exportBtn");

let chart;

function saveData() {
    localStorage.setItem("transactions", JSON.stringify(transactions));
}

function populateMonths() {
    monthFilter.innerHTML = `<option value="all">All Months</option>`;
    const months = [...new Set(transactions.map(t => t.date.slice(0,7)))];
    months.forEach(m => {
        monthFilter.innerHTML += `<option value="${m}">${m}</option>`;
    });
}

function render() {
    list.innerHTML = "";
    const filter = monthFilter.value;

    let filtered = transactions;
    if (filter !== "all") {
        filtered = transactions.filter(t => t.date.startsWith(filter));
    }

    let income = 0;
    let expense = 0;

    filtered.forEach(t => {
        const row = `
            <tr>
                <td>${t.date}</td>
                <td>${t.description}</td>
                <td>${t.type}</td>
                <td>${t.amount}</td>
            </tr>
        `;
        list.innerHTML += row;

        if (t.type === "income") income += t.amount;
        else expense += t.amount;
    });

    totalIncomeEl.textContent = income;
    totalExpenseEl.textContent = expense;
    balanceEl.textContent = income - expense;

    updateChart(income, expense);
}

function updateChart(income, expense) {
    const ctx = document.getElementById("chart");

    if (chart) chart.destroy();

    chart = new Chart(ctx, {
        type: "pie",
        data: {
            labels: ["Income", "Expense"],
            datasets: [{
                data: [income, expense]
            }]
        }
    });
}

form.addEventListener("submit", e => {
    e.preventDefault();

    const newTransaction = {
        date: document.getElementById("date").value,
        description: document.getElementById("description").value,
        type: document.getElementById("type").value,
        amount: parseFloat(document.getElementById("amount").value)
    };

    transactions.push(newTransaction);
    saveData();
    populateMonths();
    render();
    form.reset();
});

monthFilter.addEventListener("change", render);

exportBtn.addEventListener("click", () => {
    let csv = "Date,Description,Type,Amount\n";
    transactions.forEach(t => {
        csv += `${t.date},${t.description},${t.type},${t.amount}\n`;
    });

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "transactions.csv";
    a.click();
});

populateMonths();
render();
