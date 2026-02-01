export const roundRating = (value) => {
    const integer = Math.floor(value);
    const decimal = value - integer;
    if (decimal < 0.25)
        return integer;
    if (decimal < 0.75)
        return integer + 0.5;
    return integer + 1;
};
//# sourceMappingURL=roundRating.js.map