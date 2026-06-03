import rateLimit from "express-rate-limit";
export const placesLimiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 30,
    message: {
        success: false,
        message: "Too many location requests. Please try again after 1 minute.",
    },
    standardHeaders: true,
    legacyHeaders: false,
});
//# sourceMappingURL=placeLimiter.js.map