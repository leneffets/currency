let translations = {};

// Load user's preferred language
const userLanguage = navigator.language.startsWith("de") ? "de" : "en";

// Load localization file
async function loadLocale(lang) {
    try {
        const response = await fetch(`locales/${lang}.json`);
        translations = await response.json();
        localizePage();
    } catch (error) {
        console.error("Error loading locale file:", error);
    }
}

// Apply translations to the page
function localizePage() {
    document.getElementById("title").textContent = translations.title;
    document.getElementById("sourceLabel").textContent = translations.sourceLabel;
    document.getElementById("targetLabel").textContent = translations.targetLabel;
    document.getElementById("priceLabel").textContent = translations.priceLabel;
    document.getElementById("weightLabel").textContent = translations.weightLabel;
    document.getElementById("unitWeightLabel").textContent = translations.unitWeightLabel;
    document.getElementById("exchangeRateLabel").textContent = translations.exchangeRateLabel;
}

// Save currency settings to localStorage
function saveCurrencySettings() {
    const sourceCurrency = document.getElementById("sourceCurrency").value;
    const targetCurrency = document.getElementById("targetCurrency").value;
    localStorage.setItem("sourceCurrency", sourceCurrency);
    localStorage.setItem("targetCurrency", targetCurrency);
}

// Load saved currency settings from localStorage
function loadCurrencySettings() {
    const sourceCurrency = localStorage.getItem("sourceCurrency") || "PLN";
    const targetCurrency = localStorage.getItem("targetCurrency") || "EUR";
    document.getElementById("sourceCurrency").value = sourceCurrency;
    document.getElementById("targetCurrency").value = targetCurrency;
}

// Function to update exchange rate using a real API call
async function updateExchangeRate() {
    const sourceCurrency = document.getElementById("sourceCurrency").value;
    const targetCurrency = document.getElementById("targetCurrency").value;

    // replace labels with currency
    document.getElementById("priceLabel").textContent = translations.priceLabel.replace("{sourceCurrency}", `${sourceCurrency}`);
    document.getElementById("weightLabel").textContent = translations.weightLabel.replace("{sourceCurrency}", `${sourceCurrency}`);
    document.getElementById("unitWeightLabel").textContent = translations.unitWeightLabel.replace("{targetCurrency}", `${targetCurrency}`);

    try {
        const response = await fetch(`https://api.exchangerate-api.com/v4/latest/${sourceCurrency}`);
        if (!response.ok) throw new Error("Failed to fetch exchange rate");

        const data = await response.json();
        exchangeRate = data.rates[targetCurrency];
        const exchangeTimestamp = data.time_last_updated
                    ? new Date(data.time_last_updated * 1000).toLocaleString("de-DE", {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                        hour12: false
                    })
                    : 'Unknown';

        // Save to local storage
        localStorage.setItem('exchangeRate', JSON.stringify({ rate: exchangeRate, timestamp: exchangeTimestamp }));

        if (exchangeRate) {
            document.getElementById("exchangeRate").value = `1 ${sourceCurrency} = ${exchangeRate.toFixed(4)} ${targetCurrency}`;
            const lastUpdatedText = translations.lastUpdated.replace("{exchangeTimestamp}", exchangeTimestamp) || `Last updated: ${exchangeTimestamp}`;
            document.getElementById("exchangeInfo").textContent = lastUpdatedText;
            performCalculations(); // Recalculate based on the new rate
        }
    } catch (error) {
        console.error("Error updating exchange rate:", error);
        // Load from local storage
        const savedData = JSON.parse(localStorage.getItem('exchangeRate'));
        if (savedData) {
            exchangeRate = savedData.rate;
            const exchangeTimestamp = savedData.timestamp;
            document.getElementById("exchangeRate").value = `1 ${sourceCurrency} = ${exchangeRate.toFixed(4)} ${targetCurrency}`;
            const lastUpdatedText = translations.lastUpdated.replace("{exchangeTimestamp}", exchangeTimestamp) || `Last updated: ${exchangeTimestamp}`;
            document.getElementById("exchangeInfo").textContent = lastUpdatedText;
            performCalculations(); // Recalculate based on the saved rate
        } else {
            document.getElementById("exchangeRate").value = "Exchange rate data not available";
            document.getElementById("exchangeInfo").textContent = "Last updated: Unknown";
        }
    }
}

// Perform calculations
function performCalculations() {
    const price = parseFloat(document.getElementById("price").value) || 0;
    const weight = parseFloat(document.getElementById("weight").value) || 0;
    const unitWeight = parseFloat(document.getElementById("unitWeight").value) || 0;
    //const exchangeRate = parseFloat(document.getElementById("exchangeRate").value) || 1;
    const sourceCurrency = document.getElementById("sourceCurrency").value;
    const targetCurrency = document.getElementById("targetCurrency").value;

    let result = "";
    if (price && exchangeRate) {
        const convertedPrice = (price * exchangeRate).toFixed(2);
        result += `${translations.convertedPrice.replace("{sourceCurrency}", sourceCurrency)
                                             .replace("{targetCurrency}", targetCurrency)
                                             .replace("{price}", price)
                                             .replace("{convertedPrice}", convertedPrice)}<br>`;

        if (weight) {
            const pricePerKg = ((price / weight) * 1000 * exchangeRate).toFixed(2);
            result += `${translations.pricePerKg.replace("{pricePerKg}", pricePerKg)
                                                 .replace("{targetCurrency}", targetCurrency)}<br>`;
        }

        if (unitWeight) {
            const unitPrice = ((price / weight) * unitWeight * exchangeRate).toFixed(2);
            result += `${translations.unitPrice.replace("{unitWeight}", unitWeight)
                                               .replace("{unitPrice}", unitPrice)
                                               .replace("{targetCurrency}", targetCurrency)}<br>`;
        }
    }

    document.getElementById("output").innerHTML = result;
}

// Initialize the app
(async function initializeApp() {
await loadLocale(userLanguage);
loadCurrencySettings();
updateExchangeRate();
})();
