export declare const getAllAreas: () => {
    id: number;
    city: string;
    slug: string;
    areas: string[];
}[];
export declare const getCities: () => {
    id: number;
    city: string;
    slug: string;
}[];
export declare const getAreasByCity: (slug: string) => {
    id: number;
    city: string;
    slug: string;
    areas: string[];
} | null;
export declare const searchAreas: (query: string) => {
    city: string;
    area: string;
}[];
export declare const AreaService: {
    getCities: () => {
        id: number;
        city: string;
        slug: string;
    }[];
    getAreasByCity: (slug: string) => {
        id: number;
        city: string;
        slug: string;
        areas: string[];
    } | null;
    searchAreas: (query: string) => {
        city: string;
        area: string;
    }[];
    getAllAreas: () => {
        id: number;
        city: string;
        slug: string;
        areas: string[];
    }[];
};
//# sourceMappingURL=Area.service.d.ts.map