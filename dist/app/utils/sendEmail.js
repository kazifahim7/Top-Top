var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import nodemailer from 'nodemailer';
import config from '../config/index.js';
const emailSender = (email, html, subject) => __awaiter(void 0, void 0, void 0, function* () {
    const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: {
            user: "kazifahim661@gmail.com",
            pass: config.email_pass
        },
        tls: {
            rejectUnauthorized: false
        }
    });
    const info = yield transporter.sendMail({
        from: '" Gem Jewelers Co ." <kazifahim661@gmail.com>',
        to: email,
        subject: subject,
        html: html,
    });
    console.log("Message sent: %s", info.messageId);
});
export default emailSender;
//# sourceMappingURL=sendEmail.js.map