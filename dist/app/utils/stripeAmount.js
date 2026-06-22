import AppError from "../Error/AppError.js";
import { CountryService } from "../modules/Country/country.service.js";
const ZERO_DECIMAL_CURRENCIES = new Set([
    "BIF",
    "CLP",
    "DJF",
    "GNF",
    "JPY",
    "KMF",
    "KRW",
    "MGA",
    "PYG",
    "RWF",
    "VND",
    "VUV",
    "XAF",
    "XOF",
    "XPF",
]);
export const stripeCurrencyCode = (currencyCode) => {
    return CountryService.normalizeCurrencyCode(currencyCode).toLowerCase();
};
export const stripeAmountFromPrice = (price, currencyCode) => {
    const numericPrice = typeof price === "number" ? price : Number(price);
    if (!Number.isFinite(numericPrice) || numericPrice < 0) {
        throw new AppError(400, "Payment price must be a valid positive number");
    }
    const normalizedCurrency = CountryService.normalizeCurrencyCode(currencyCode);
    const factor = ZERO_DECIMAL_CURRENCIES.has(normalizedCurrency) ? 1 : 100;
    return Math.round(numericPrice * factor);
};
export const roundCurrencyAmount = (price, currencyCode) => {
    const numericPrice = typeof price === "number" ? price : Number(price);
    if (!Number.isFinite(numericPrice) || numericPrice < 0) {
        throw new AppError(400, "Payment price must be a valid positive number");
    }
    const normalizedCurrency = CountryService.normalizeCurrencyCode(currencyCode);
    const factor = ZERO_DECIMAL_CURRENCIES.has(normalizedCurrency) ? 1 : 100;
    return Math.round(numericPrice * factor) / factor;
};
//# sourceMappingURL=stripeAmount.js.map