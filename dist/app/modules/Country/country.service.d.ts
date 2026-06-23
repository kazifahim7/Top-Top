import type { CountryCity, ICountry } from "./country.interface.js";
export declare const DEFAULT_COUNTRY_CODE = "AE";
export declare const DEFAULT_CURRENCY_CODE = "AED";
export declare const CountryService: {
    DEFAULT_COUNTRY_CODE: string;
    DEFAULT_CURRENCY_CODE: string;
    normalizeCountryCode: (value: unknown) => string;
    normalizeCurrencyCode: (value: unknown) => string;
    normalizeMoneyAmount: (value: unknown) => number;
    ensureDefaultCountry: () => Promise<void>;
    getCountries: (includeInactive?: boolean) => Promise<(import("mongoose").Document<unknown, {}, ICountry, {}, {}> & ICountry & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    })[]>;
    getCountryByCode: (countryCode: unknown, includeInactive?: boolean) => Promise<(import("mongoose").Document<unknown, {}, ICountry, {}, {}> & ICountry & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }) | null>;
    assertActiveCountry: (countryCode: unknown) => Promise<import("mongoose").Document<unknown, {}, ICountry, {}, {}> & ICountry & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }>;
    createCountry: (payload: Record<string, unknown>) => Promise<import("mongoose").Document<unknown, {}, ICountry, {}, {}> & ICountry & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }>;
    updateCountry: (countryCode: string, payload: Record<string, unknown>) => Promise<import("mongoose").Document<unknown, {}, ICountry, {}, {}> & ICountry & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }>;
    deactivateCountry: (countryCode: string) => Promise<import("mongoose").Document<unknown, {}, ICountry, {}, {}> & ICountry & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }>;
    getAreasForCountry: (countryCode: unknown) => Promise<CountryCity[]>;
    buildLegacyCountryFilter: (countryCode: unknown) => {
        $or: ({
            countryCode: string;
        } | {
            countryCode: {
                $exists: boolean;
            };
        } | {
            countryCode: null;
        })[];
        countryCode?: never;
    } | {
        countryCode: string;
        $or?: never;
    };
};
//# sourceMappingURL=country.service.d.ts.map