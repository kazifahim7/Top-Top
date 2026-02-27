export type OtpChannel = "sms" | "call" | "whatsapp";
export interface SendOtpOptions {
    channel?: OtpChannel;
    locale?: string;
}
export interface OtpSuccessResponse {
    success: true;
    status: string;
    channel?: string;
    to?: string;
    message?: string;
}
export interface OtpErrorResponse {
    success: false;
    status: string;
    error: string;
    code?: number;
}
export type OtpResponse = OtpSuccessResponse | OtpErrorResponse;
/**
 * Phone number E.164 format validate করে
 * @param phone - e.g. +971501234567
 */
export declare function isValidPhone(phone: string): boolean;
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
export declare function sendOTP(phone: string, options?: SendOtpOptions): Promise<OtpResponse>;
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
export declare function verifyOTP(phone: string, code: string): Promise<OtpResponse>;
/**
 * @param phone   - E.164 format (+971501234567)
 * @param options - SendOtpOptions
 *
 * @example
 * const result = await resendOTP('+971501234567');
 */
export declare function resendOTP(phone: string, options?: SendOtpOptions): Promise<OtpResponse>;
//# sourceMappingURL=twilio.d.ts.map