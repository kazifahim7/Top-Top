import twilio from "twilio";
const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
const SERVICE_SID = process.env.TWILIO_VERIFY_SERVICE_SID;
// ─── Validate Phone ───────────────────────────────────────────────────────────
/**
 * Phone number E.164 format validate করে
 * @param phone - e.g. +971501234567
 */
export function isValidPhone(phone) {
    const e164Regex = /^\+[1-9]\d{6,14}$/;
    return e164Regex.test(phone);
}
// ─── Send OTP ─────────────────────────────────────────────────────────────────
/**
 * OTP পাঠায় যেকোনো নম্বরে
 *
 * @param phone   - E.164 format (+971501234567)
 * @param options - channel: 'sms' | 'call' | 'whatsapp', locale: 'en'
 *
 * @example
 * const result = await sendOTP('+971501234567');
 * const result = await sendOTP('+971501234567', { channel: 'whatsapp' });
 */
export async function sendOTP(phone, options = {}) {
    const { channel = "sms", locale = "en" } = options;
    if (!isValidPhone(phone)) {
        return {
            success: false,
            status: "invalid_phone",
            error: "Invalid phone number. Use E.164 format e.g. +971501234567",
        };
    }
    try {
        const verification = await client.verify.v2
            .services(SERVICE_SID)
            .verifications.create({ to: phone, channel, locale });
        return {
            success: true,
            status: verification.status, // 'pending'
            channel: verification.channel,
            to: verification.to,
        };
    }
    catch (err) {
        return {
            success: false,
            status: "failed",
            error: err.message,
            code: err.code,
        };
    }
}
// ─── Verify OTP ───────────────────────────────────────────────────────────────
/**
 * User এর দেওয়া OTP verify করে
 *
 * @param phone - E.164 format (+971501234567)
 * @param code  - User এর দেওয়া OTP (e.g. '123456')
 *
 * @example
 * const result = await verifyOTP('+971501234567', '123456');
 * if (result.success) { // verified! }
 */
export async function verifyOTP(phone, code) {
    if (!isValidPhone(phone)) {
        return {
            success: false,
            status: "invalid_phone",
            error: "Invalid phone number format",
        };
    }
    if (!code?.trim()) {
        return {
            success: false,
            status: "invalid_code",
            error: "OTP code is required",
        };
    }
    try {
        const check = await client.verify.v2
            .services(SERVICE_SID)
            .verificationChecks.create({ to: phone, code: code.trim() });
        if (check.status === "approved") {
            return {
                success: true,
                status: "approved",
                message: "OTP verified successfully!",
            };
        }
        return {
            success: false,
            status: check.status,
            error: "Invalid OTP. Please try again.",
        };
    }
    catch (err) {
        return {
            success: false,
            status: "failed",
            error: err.message,
            code: err.code,
        };
    }
}
/**
 * @param phone   - E.164 format (+971501234567)
 * @param options - SendOtpOptions
 *
 * @example
 * const result = await resendOTP('+971501234567');
 */
export async function resendOTP(phone, options = {}) {
    return sendOTP(phone, options);
}
//# sourceMappingURL=twilio.js.map