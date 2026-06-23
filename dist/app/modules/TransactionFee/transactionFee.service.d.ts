import type { TransactionFeeQuote } from "./transactionFee.interface.js";
export declare const TransactionFeeService: {
    getGlobalSetting: () => Promise<(import("mongoose").Document<unknown, {}, import("./transactionFee.interface.js").ITransactionFeeSetting, {}, {}> & import("./transactionFee.interface.js").ITransactionFeeSetting & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }) | null>;
    createGlobalSetting: (payload: Record<string, unknown>) => Promise<import("mongoose").Document<unknown, {}, import("./transactionFee.interface.js").ITransactionFeeSetting, {}, {}> & import("./transactionFee.interface.js").ITransactionFeeSetting & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }>;
    updateGlobalSetting: (payload: Record<string, unknown>) => Promise<import("mongoose").Document<unknown, {}, import("./transactionFee.interface.js").ITransactionFeeSetting, {}, {}> & import("./transactionFee.interface.js").ITransactionFeeSetting & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }>;
    getCountryFees: (includeInactive?: boolean) => Promise<(import("mongoose").Document<unknown, {}, import("../Country/country.interface.js").ICountry, {}, {}> & import("../Country/country.interface.js").ICountry & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    })[]>;
    updateCountryFixedFee: (countryCode: string, payload: Record<string, unknown>) => Promise<import("mongoose").Document<unknown, {}, import("../Country/country.interface.js").ICountry, {}, {}> & import("../Country/country.interface.js").ICountry & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }>;
    buildQuote: (payload: Record<string, unknown>) => Promise<TransactionFeeQuote>;
};
//# sourceMappingURL=transactionFee.service.d.ts.map