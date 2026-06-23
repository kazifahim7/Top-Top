import { CountryService, DEFAULT_COUNTRY_CODE } from "../Country/country.service.js";
export const getAllAreas = async (countryCode = DEFAULT_COUNTRY_CODE) => {
    return CountryService.getAreasForCountry(countryCode);
};
export const getCities = async (countryCode = DEFAULT_COUNTRY_CODE) => {
    const cities = await CountryService.getAreasForCountry(countryCode);
    return cities.map(({ id, city, slug }) => ({ id, city, slug }));
};
export const getAreasByCity = async (slug, countryCode = DEFAULT_COUNTRY_CODE) => {
    const cities = await CountryService.getAreasForCountry(countryCode);
    const found = cities.find((c) => c.slug === slug.toLowerCase());
    if (!found)
        return null;
    return found;
};
export const searchAreas = async (query, countryCode = DEFAULT_COUNTRY_CODE) => {
    const q = query.toLowerCase();
    const results = [];
    const cities = await CountryService.getAreasForCountry(countryCode);
    cities.forEach(({ city, areas }) => {
        areas.forEach((area) => {
            if (area.toLowerCase().includes(q)) {
                results.push({ city, area });
            }
        });
    });
    return results;
};
export const AreaService = {
    getCities,
    getAreasByCity,
    searchAreas,
    getAllAreas
};
//# sourceMappingURL=Area.service.js.map