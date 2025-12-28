import nodemailer from 'nodemailer';
import config from '../config/index.js';
const emailSender = async (email, html, subject) => {
    const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: {
            user: "kazifahim761@gmail.com",
            pass: config.email_pass
        },
        tls: {
            rejectUnauthorized: false
        }
    });
    const info = await transporter.sendMail({
        from: '" top-top" <kazifahim761@gmail.com>',
        to: email,
        subject: subject,
        html: html,
    });
    console.log("Message sent: %s", info.messageId);
};
export default emailSender;
//# sourceMappingURL=sendEmail.js.map