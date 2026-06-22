export interface CountryCity {
     id: number;
     city: string;
     slug: string;
     areas: string[];
}

export interface ICountry {
     countryCode: string;
     name: string;
     dialCode: string;
     currencyCode: string;
     merchantCountryCode: string;
     fixedTransactionFee: number;
     isActive: boolean;
     cities: CountryCity[];
}
