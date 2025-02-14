const apiKey = "API_KEY"; // Replace key

const countryCurrencyAPI = "https://restcountries.com/v3.1/all"; 
const exchangeRateAPI = "https://open.er-api.com/v6/latest/";

let countryData = {};

document.addEventListener("DOMContentLoaded", () => {
    fetchCountries();
});

async function fetchCountries() {
  try {
      const response = await fetch("https://restcountries.com/v3.1/all");
      const countries = await response.json();
      
      countries.forEach(country => {
          if (country.currencies) {
              const currencyCode = Object.keys(country.currencies)[0];
              const currencyName = country.currencies[currencyCode].name;
              const countryName = country.name.common;
              let flagUrl = country.flags.svg;

              if (currencyCode === "USD") {
                  flagUrl = "https://upload.wikimedia.org/wikipedia/en/a/a4/Flag_of_the_United_States.svg";
              }

              countryData[currencyCode] = { 
                  fullName: `${currencyCode} - ${currencyName}`, 
                  flag: flagUrl 
              };
          }
      });

      populateDropdowns();
  } catch (error) {
      console.error("Error fetching countries:", error);
  }
}


function populateDropdowns() {
    const fromCurrency = document.getElementById("fromCurrency");
    const toCurrency = document.getElementById("toCurrency");

    const sortedCurrencies = Object.keys(countryData)
        .map(code => ({ code, ...countryData[code] }))
        .sort((a, b) => a.fullName.localeCompare(b.fullName));

    sortedCurrencies.forEach(({ code, fullName, flag }) => {
        let option1 = document.createElement("option");
        option1.value = code;
        option1.textContent = fullName;
        option1.setAttribute("data-flag", flag);
        fromCurrency.appendChild(option1);

        let option2 = document.createElement("option");
        option2.value = code;
        option2.textContent = fullName;
        option2.setAttribute("data-flag", flag);
        toCurrency.appendChild(option2);
    });

    fromCurrency.value = "USD";
    toCurrency.value = "INR";
    updateFlag("fromCurrency", "fromFlag");
    updateFlag("toCurrency", "toFlag");
}

document.getElementById("fromCurrency").addEventListener("change", () => updateFlag("fromCurrency", "fromFlag"));
document.getElementById("toCurrency").addEventListener("change", () => updateFlag("toCurrency", "toFlag"));

function updateFlag(selectId, flagId) {
    const selectedCurrency = document.getElementById(selectId).value;
    document.getElementById(flagId).src = countryData[selectedCurrency].flag;
}

function convertCurrency() {
    const amount = document.getElementById("amount").value;
    const fromCurrency = document.getElementById("fromCurrency").value;
    const toCurrency = document.getElementById("toCurrency").value;

    if (amount === "" || amount <= 0) {
        alert("Enter a valid amount");
        return;
    }

    fetch(`${exchangeRateAPI}${fromCurrency}?apikey=${apiKey}`)
        .then(response => response.json())
        .then(data => {
            const rate = data.rates[toCurrency];
            const result = (amount * rate).toFixed(2);
            document.getElementById("result").textContent = 
                `${amount} ${fromCurrency} = ${result} ${toCurrency}`;
        })
        .catch(error => console.error("Error fetching exchange rate:", error));
}
