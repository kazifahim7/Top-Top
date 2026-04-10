import { UAE_AREAS } from "../../data/Areas.js";
export const getAllAreas = () => {
    return UAE_AREAS;
};
export const getCities = () => {
    return UAE_AREAS.map(({ id, city, slug }) => ({ id, city, slug }));
};
export const getAreasByCity = (slug) => {
    const found = UAE_AREAS.find((c) => c.slug === slug.toLowerCase());
    if (!found)
        return null;
    return found;
};
export const searchAreas = (query) => {
    const q = query.toLowerCase();
    const results = [];
    UAE_AREAS.forEach(({ city, areas }) => {
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