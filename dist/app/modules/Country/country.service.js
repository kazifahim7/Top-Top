import AppError from "../../Error/AppError.js";
import { UAE_AREAS } from "../../data/Areas.js";
import { CountryModel } from "./country.model.js";
export const DEFAULT_COUNTRY_CODE = "AE";
export const DEFAULT_CURRENCY_CODE = "AED";
const DEFAULT_COUNTRY = {
    countryCode: DEFAULT_COUNTRY_CODE,
    name: "United Arab Emirates",
    dialCode: "+971",
    currencyCode: DEFAULT_CURRENCY_CODE,
    merchantCountryCode: DEFAULT_COUNTRY_CODE,
    fixedTransactionFee: 0,
    isActive: true,
    cities: UAE_AREAS,
};
const normalizeCountryCode = (value) => {
    if (typeof value !== "string")
        return DEFAULT_COUNTRY_CODE;
    const normalized = value.trim().toUpperCase();
    return normalized || DEFAULT_COUNTRY_CODE;
};
const normalizeCurrencyCode = (value) => {
    if (typeof value !== "string")
        return DEFAULT_CURRENCY_CODE;
    const normalized = value.trim().toUpperCase();
    return normalized || DEFAULT_CURRENCY_CODE;
};
const normalizeDialCode = (value) => {
    if (typeof value !== "string")
        return "";
    const normalized = value.trim();
    if (!normalized)
        return "";
    return normalized.startsWith("+") ? normalized : `+${normalized}`;
};
const normalizeMoneyAmount = (value) => {
    if (value === undefined || value === null || value === "")
        return 0;
    const numericValue = typeof value === "number" ? value : Number(value);
    if (!Number.isFinite(numericValue) || numericValue < 0) {
        throw new AppError(400, "fixedTransactionFee must be a non-negative number");
    }
    return numericValue;
};
const normalizeCities = (value) => {
    if (!Array.isArray(value))
        return [];
    return value
        .map((item, index) => {
        if (!item || typeof item !== "object")
            return null;
        const raw = item;
        const city = typeof raw.city === "string" ? raw.city.trim() : "";
        const slug = typeof raw.slug === "string"
            ? raw.slug.trim().toLowerCase()
            : city.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
        const areas = Array.isArray(raw.areas)
            ? raw.areas.map((area) => typeof area === "string" ? area.trim() : "").filter(Boolean)
            : [];
        if (!city || !slug)
            return null;
        return {
            id: typeof raw.id === "number" ? raw.id : index + 1,
            city,
            slug,
            areas,
        };
    })
        .filter((item) => item !== null);
};
const ensureDefaultCountry = async () => {
    await CountryModel.updateOne({ countryCode: DEFAULT_COUNTRY_CODE }, { $setOnInsert: DEFAULT_COUNTRY }, { upsert: true });
};
const getCountries = async (includeInactive = false) => {
    await ensureDefaultCountry();
    return CountryModel.find(includeInactive ? {} : { isActive: true }).sort({ name: 1 });
};
const getCountryByCode = async (countryCode, includeInactive = false) => {
    await ensureDefaultCountry();
    const normalizedCode = normalizeCountryCode(countryCode);
    const query = { countryCode: normalizedCode };
    if (!includeInactive)
        query.isActive = true;
    return CountryModel.findOne(query);
};
const assertActiveCountry = async (countryCode) => {
    const normalizedCode = normalizeCountryCode(countryCode);
    const country = await getCountryByCode(normalizedCode, false);
    if (!country) {
        throw new AppError(400, `Country ${normalizedCode} is not active or not supported`);
    }
    return country;
};
const buildCountryPayload = (payload) => {
    const countryCode = normalizeCountryCode(payload.countryCode);
    const name = typeof payload.name === "string" ? payload.name.trim() : "";
    const dialCode = normalizeDialCode(payload.dialCode);
    const currencyCode = normalizeCurrencyCode(payload.currencyCode);
    const merchantCountryCode = normalizeCountryCode(payload.merchantCountryCode ?? countryCode);
    if (!/^[A-Z]{2}$/.test(countryCode)) {
        throw new AppError(400, "countryCode must be an ISO-2 country code");
    }
    if (!name)
        throw new AppError(400, "Country name is required");
    if (!dialCode)
        throw new AppError(400, "Dial code is required");
    if (!/^[A-Z]{3}$/.test(currencyCode)) {
        throw new AppError(400, "currencyCode must be an ISO-4217 currency code");
    }
    return {
        countryCode,
        name,
        dialCode,
        currencyCode,
        merchantCountryCode,
        fixedTransactionFee: normalizeMoneyAmount(payload.fixedTransactionFee),
        isActive: typeof payload.isActive === "boolean" ? payload.isActive : true,
        cities: normalizeCities(payload.cities),
    };
};
const createCountry = async (payload) => {
    await ensureDefaultCountry();
    const data = buildCountryPayload(payload);
    const existing = await CountryModel.findOne({ countryCode: data.countryCode });
    if (existing)
        throw new AppError(409, "Country already exists");
    return CountryModel.create(data);
};
const updateCountry = async (countryCode, payload) => {
    await ensureDefaultCountry();
    const normalizedCode = normalizeCountryCode(countryCode);
    const update = {};
    if (typeof payload.name === "string")
        update.name = payload.name.trim();
    if (typeof payload.dialCode === "string")
        update.dialCode = normalizeDialCode(payload.dialCode);
    if (typeof payload.currencyCode === "string")
        update.currencyCode = normalizeCurrencyCode(payload.currencyCode);
    if (typeof payload.merchantCountryCode === "string")
        update.merchantCountryCode = normalizeCountryCode(payload.merchantCountryCode);
    if (Object.prototype.hasOwnProperty.call(payload, "fixedTransactionFee"))
        update.fixedTransactionFee = normalizeMoneyAmount(payload.fixedTransactionFee);
    if (typeof payload.isActive === "boolean")
        update.isActive = payload.isActive;
    if (Object.prototype.hasOwnProperty.call(payload, "cities"))
        update.cities = normalizeCities(payload.cities);
    const result = await CountryModel.findOneAndUpdate({ countryCode: normalizedCode }, update, { new: true, runValidators: true });
    if (!result)
        throw new AppError(404, "Country not found");
    return result;
};
const deactivateCountry = async (countryCode) => {
    if (normalizeCountryCode(countryCode) === DEFAULT_COUNTRY_CODE) {
        throw new AppError(400, "Default UAE country cannot be removed");
    }
    const result = await CountryModel.findOneAndUpdate({ countryCode: normalizeCountryCode(countryCode) }, { isActive: false }, { new: true });
    if (!result)
        throw new AppError(404, "Country not found");
    return result;
};
const getAreasForCountry = async (countryCode) => {
    const country = await assertActiveCountry(countryCode);
    return country.cities;
};
const buildLegacyCountryFilter = (countryCode) => {
    const normalizedCode = normalizeCountryCode(countryCode);
    if (normalizedCode === DEFAULT_COUNTRY_CODE) {
        return {
            $or: [
                { countryCode: DEFAULT_COUNTRY_CODE },
                { countryCode: { $exists: false } },
                { countryCode: null },
                { countryCode: "" },
            ],
        };
    }
    return { countryCode: normalizedCode };
};
export const CountryService = {
    DEFAULT_COUNTRY_CODE,
    DEFAULT_CURRENCY_CODE,
    normalizeCountryCode,
    normalizeCurrencyCode,
    normalizeMoneyAmount,
    ensureDefaultCountry,
    getCountries,
    getCountryByCode,
    assertActiveCountry,
    createCountry,
    updateCountry,
    deactivateCountry,
    getAreasForCountry,
    buildLegacyCountryFilter,
};
//# sourceMappingURL=country.service.js.map