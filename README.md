# Currency and Weight Converter

1. **Currency Conversion**:
   - Convert prices from one currency to another.
   - Supports the following currencies:
     - PLN (Polish Zloty)
     - USD (US Dollar)
     - EUR (Euro)
     - JPY (Japanese Yen)
     - CHF (Swiss Franc)
     - GBP (British Pound)
     - CZK (Czech Koruna)
     - DKK (Danish Krone)
     - TRY (Turkish Lira)
     - SEK (Swedish Krona)
     - NOK (Norwegian Krone)

1. **Weight-Based Price Calculations**:
   - Calculate price per kilogram for a given weight.
   - Calculate price for a specific unit weight (e.g., 250g).
   - For example: compare prices in supermarket:
      * enter price for 200g in PLN
      * converts to kilogram price in EUR
      * converts to 250g price in EUR

1. **Localization**:
   - Automatically detects browser language and switches between English and German.
   - Localization data is stored in separate JSON files (`locales/en.json` and `locales/de.json`).

1. **Settings Persistence**:
   - Saves selected source and target currencies in the browser using `localStorage`.
   - Restores saved settings when the page is reloaded.

1. **Responsive Design**:
   - The application works seamlessly on both desktop and mobile devices.

## How to Use
1. Select the **current currency** and the **target currency**.
2. Enter the **price** in the current currency.
3. (Optional) Add the product's **weight** and a **custom unit weight** (e.g., 250g).
4. The app will calculate:
   - Price in the target currency.
   - Price per kilogram (if weight is provided).
   - Price for the specified unit in **target currency** (if unit weight is provided).
5. Click the 🔄 button to fetch the latest exchange rates.

Access the app directly from GitHub Pages:  
👉 [Currency and Weight Converter](https://leneffets.github.io/currency/)

## Screenshot
![image](https://github.com/user-attachments/assets/a1d71a72-45cc-4436-a050-f4c4cbb8373b)

## Development Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/leneffets/currency.git
   ```

## License
This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Feedback and Contributions
Feel free to open issues or submit pull requests to improve this project. Your contributions are welcome!
