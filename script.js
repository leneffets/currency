let translations = {};
// current exchange rate (null when not loaded)
let exchangeRate = null;

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
    document.getElementById("sourceLabel").textContent = translations.sourceLabel;
    document.getElementById("targetLabel").textContent = translations.targetLabel;
    document.getElementById("priceLabel").textContent = translations.priceLabel;
    document.getElementById("weightLabel").textContent = translations.weightLabel;
    document.getElementById("unitWeightLabel").textContent = translations.unitWeightLabel;
    document.getElementById("exchangeRateLabel").textContent = translations.exchangeRateLabel;

    // initialize optional summary label (static title)
    const optionalSummary = document.getElementById("optionalSummary");
    if (optionalSummary && translations.optionalSummaryTitle) {
        optionalSummary.textContent = translations.optionalSummaryTitle;
    }

    // localize reset button tooltip / aria-label if present
    const resetBtn = document.getElementById('resetButton');
    if (resetBtn && translations.resetTooltip) {
        resetBtn.title = translations.resetTooltip;
        resetBtn.setAttribute('aria-label', translations.resetTooltip);
    }

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

// Internal function that actually fetches and applies the exchange rate
async function fetchAndApplyExchangeRate() {
    const sourceCurrency = document.getElementById("sourceCurrency").value;
    const targetCurrency = document.getElementById("targetCurrency").value;

    // replace labels with currency (safely)
    const priceLabelEl = document.getElementById("priceLabel");
    const weightLabelEl = document.getElementById("weightLabel");
    const unitWeightLabelEl = document.getElementById("unitWeightLabel");
    if (priceLabelEl) priceLabelEl.textContent = translations.priceLabel.replace("{sourceCurrency}", `${sourceCurrency}`);
    if (weightLabelEl) weightLabelEl.textContent = translations.weightLabel.replace("{sourceCurrency}", `${sourceCurrency}`);
    if (unitWeightLabelEl) unitWeightLabelEl.textContent = translations.unitWeightLabel.replace("{targetCurrency}", `${targetCurrency}`);

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

        const exchangeRateEl = document.getElementById("exchangeRate");
        const exchangeInfoEl = document.getElementById("exchangeInfo");
        if (exchangeRate && exchangeRateEl) {
            exchangeRateEl.value = `1 ${sourceCurrency} = ${exchangeRate.toFixed(4)} ${targetCurrency}`;
        }
        if (exchangeInfoEl) {
            const lastUpdatedText = translations.lastUpdated ? translations.lastUpdated.replace("{exchangeTimestamp}", exchangeTimestamp) : `Last updated: ${exchangeTimestamp}`;
            exchangeInfoEl.textContent = lastUpdatedText;
        }

        performCalculations(); // Recalculate based on the new rate
    } catch (error) {
        console.error("Error updating exchange rate:", error);
        // Load from local storage
        const savedData = JSON.parse(localStorage.getItem('exchangeRate'));
        const exchangeRateEl = document.getElementById("exchangeRate");
        const exchangeInfoEl = document.getElementById("exchangeInfo");
        if (savedData) {
            exchangeRate = savedData.rate;
            const exchangeTimestamp = savedData.timestamp;
            if (exchangeRateEl) exchangeRateEl.value = `1 ${sourceCurrency} = ${exchangeRate.toFixed(4)} ${targetCurrency}`;
            if (exchangeInfoEl) {
                const lastUpdatedText = translations.lastUpdated ? translations.lastUpdated.replace("{exchangeTimestamp}", exchangeTimestamp) : `Last updated: ${exchangeTimestamp}`;
                exchangeInfoEl.textContent = lastUpdatedText;
            }
            performCalculations(); // Recalculate based on the saved rate
        } else {
            if (exchangeRateEl) exchangeRateEl.value = "Exchange rate data not available";
            if (exchangeInfoEl) exchangeInfoEl.textContent = "Last updated: Unknown";
        }
    }
}

// Debounced wrapper to avoid rapid repeated API calls from UI events
function updateExchangeRate() {
    if (updateExchangeRate._timer) clearTimeout(updateExchangeRate._timer);
    // schedule actual fetch after a short delay (coalesce rapid calls)
    updateExchangeRate._timer = setTimeout(() => {
        fetchAndApplyExchangeRate().catch(err => console.error(err));
        updateExchangeRate._timer = null;
    }, 50);
}

// Perform calculations
function performCalculations() {
    // normalize numeric input (allow comma as decimal separator)
    function parseNumberInput(elId) {
        const el = document.getElementById(elId);
        if (!el) return 0;
        const raw = (el.value || '').toString().trim();
        if (!raw) return 0;
        // replace comma with dot for parseFloat
        const normalized = raw.replace(',', '.');
        const n = parseFloat(normalized);
        return Number.isFinite(n) ? n : 0;
    }

    const price = parseNumberInput('price');
    const weight = parseNumberInput('weight');
    const unitWeight = parseNumberInput('unitWeight');
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

// Update the collapsed optional summary text based on current optional inputs
// Note: dynamic optional summary removed; the <summary> shows a static localized title and native
// expand/collapse behavior is used.

function onOptionalInput() {
    performCalculations();
}

// Reset only user inputs (price, weight, unitWeight) but keep currency settings
function resetInputs() {
    const priceEl = document.getElementById('price');
    const weightEl = document.getElementById('weight');
    const unitWeightEl = document.getElementById('unitWeight');
    const outputEl = document.getElementById('output');

    if (priceEl) priceEl.value = '';
    if (weightEl) weightEl.value = '';
    if (unitWeightEl) unitWeightEl.value = '';
    if (outputEl) outputEl.innerHTML = '';

    // keep currency settings in localStorage unchanged
    performCalculations();
}

// Initialize the app (wait for DOM ready before touching DOM)
(async function initializeApp() {
    if (document.readyState === 'loading') {
        await new Promise(resolve => document.addEventListener('DOMContentLoaded', resolve));
    }

    await loadLocale(userLanguage);
    loadCurrencySettings();
    
    // initial exchange rate fetch (debounced wrapper)
    updateExchangeRate();
})();
