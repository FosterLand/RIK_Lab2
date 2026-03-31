const modeEl = document.getElementById('mode');
const principalEl = document.getElementById('principal');
const rateEl = document.getElementById('rate');
const yearsEl = document.getElementById('years');
const monthlyEl = document.getElementById('monthly');
const calculateBtn = document.getElementById('calculateBtn');
const saveBtn = document.getElementById('saveBtn');
const resultEl = document.getElementById('result');
const messageEl = document.getElementById('message');

let lastResultText = '';

function displayMessage(text, isError = false) {
  messageEl.textContent = text;
  messageEl.className = isError ? 'message error' : 'message';
}

function formatCurrency(value) {
  return Number(value).toLocaleString('uk-UA', { style: 'currency', currency: 'UAH' });
}

function calculate() {
  const mode = modeEl.value;
  const principal = parseFloat(principalEl.value);
  const rate = parseFloat(rateEl.value);
  const years = parseFloat(yearsEl.value);
  const monthlyInput = parseFloat(monthlyEl.value);

  if (!principal || principal <= 0 || !rate || rate < 0 || !years || years <= 0) {
    displayMessage('Будь ласка, введіть дійсні значення суми, ставки та терміну.', true);
    saveBtn.disabled = true;
    resultEl.textContent = '';
    return;
  }

  const months = Math.round(years * 12);
  const monthlyRate = rate / 100 / 12;

  let output = `Тип розрахунку: ${mode === 'credit' ? 'Кредит' : 'Депозит'}\n`;
  output += `Сума початкова: ${formatCurrency(principal)}\n`;
  output += `Ставка: ${rate.toFixed(2)}% річна\n`;
  output += `Термін: ${years.toFixed(2)} рік(и) (${months} місяців)\n`;

  if (mode === 'credit') {
    const monthlyPayment = monthlyRate > 0
      ? (principal * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -months))
      : principal / months;

    const totalPaid = monthlyPayment * months;
    const totalInterest = totalPaid - principal;

    output += `Щомісячний платіж: ${formatCurrency(monthlyPayment)}\n`;
    output += `Загальна сума виплат: ${formatCurrency(totalPaid)}\n`;
    output += `Загальні витрати по відсотках: ${formatCurrency(totalInterest)}\n`;
  } else {
    const monthlyContribution = !isNaN(monthlyInput) && monthlyInput >= 0 ? monthlyInput : 0;
    let finalAmount;
    if (monthlyRate > 0) {
      const accumulation = Math.pow(1 + monthlyRate, months);
      finalAmount = principal * accumulation + monthlyContribution * ((accumulation - 1) / monthlyRate);
    } else {
      finalAmount = principal + monthlyContribution * months;
    }

    const totalContributions = principal + monthlyContribution * months;
    const interestIncome = finalAmount - totalContributions;

    output += `Щомісячний внесок: ${formatCurrency(monthlyContribution)}\n`;
    output += `Загальна сума з урахуванням відсотків: ${formatCurrency(finalAmount)}\n`;
    output += `Загальний дохід від відсотків: ${formatCurrency(interestIncome)}\n`;
  }

  resultEl.textContent = output;
  lastResultText = output;
  displayMessage('Розрахунок виконано. Тепер можна зберегти результат у файл.');
  saveBtn.disabled = false;
}

calculateBtn.addEventListener('click', calculate);

saveBtn.addEventListener('click', async () => {
  if (!lastResultText) {
    displayMessage('Спочатку виконайте розрахунок.', true);
    return;
  }

  const response = await window.electronAPI.saveResultFile(lastResultText);
  displayMessage(response.message, !response.saved);
});
