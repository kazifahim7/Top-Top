import twilio from "twilio";
const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
export const sendOtpSMS = async (phone, otp) => {
    return await client.messages.create({
        body: `Your OTP is ${otp}. Do not share it with anyone.`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: phone,
    });
};
//# sourceMappingURL=twilio.js.map