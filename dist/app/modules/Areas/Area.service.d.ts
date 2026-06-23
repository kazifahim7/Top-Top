export declare const getAllAreas: (countryCode?: unknown) => Promise<import("../Country/country.interface.js").CountryCity[]>;
export declare const getCities: (countryCode?: unknown) => Promise<{
    id: number;
    city: string;
    slug: string;
}[]>;
export declare const getAreasByCity: (slug: string, countryCode?: unknown) => Promise<import("../Country/country.interface.js").CountryCity | null>;
export declare const searchAreas: (query: string, countryCode?: unknown) => Promise<{
    city: string;
    area: string;
}[]>;
export declare const AreaService: {
    getCities: (countryCode?: unknown) => Promise<{
        id: number;
        city: string;
        slug: string;
    }[]>;
    getAreasByCity: (slug: string, countryCode?: unknown) => Promise<import("../Country/country.interface.js").CountryCity | null>;
    searchAreas: (query: string, countryCode?: unknown) => Promise<{
        city: string;
        area: string;
    }[]>;
    getAllAreas: (countryCode?: unknown) => Promise<import("../Country/country.interface.js").CountryCity[]>;
};
//# sourceMappingURL=Area.service.d.ts.map