import nodemailer from 'nodemailer';
import config from '../config/index.js';
const emailSender = async (email, subject, html) => {
    const transporter = nodemailer.createTransport({
        host: `${config.SES_HOST}`,
        port: 587,
        secure: false,
        auth: {
            user: `${config.SES_USER}`,
            pass: `${config.SES_PASS}`,
        },
        tls: { rejectUnauthorized: false }
    });
    const info = await transporter.sendMail({
        from: `"Top Top" <${config.SES_FROM}>`,
        to: email,
        subject: subject,
        html: html,
    });
    console.log("Message sent: %s", info.messageId);
};
export default emailSender;
//# sourceMappingURL=sendEmail.js.map