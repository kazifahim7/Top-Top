import rateLimit from "express-rate-limit";

// OTP Rate Limit
const otpLimiter = rateLimit({
     windowMs: 1 * 60 * 1000,
     max: 5,
     message: {
          success: false,
          message: "Too many OTP requests. Please try again after 1 minute.",
     },
     standardHeaders: true,
     legacyHeaders: false,
});

export default otpLimiter;