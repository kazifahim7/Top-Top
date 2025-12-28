import nodemailer from 'nodemailer';
import config from '../config/index.js';
const emailSender = async (email, subject, html) => {
    const transporter = nodemailer.createTransport({
        host: `${config.SES_HOST}`,
        port: 587,
        secure: false,
        auth: {
<<<<<<< HEAD
            user: "kazifahim761@gmail.com",
            pass: config.email_pass
=======
            user: `${config.SES_USER}`,
            pass: `${config.SES_PASS}`,
>>>>>>> b8fb58bb1cd248c11ae87b374230ff7dc6122728
        },
        tls: { rejectUnauthorized: false }
    });
    const info = await transporter.sendMail({
<<<<<<< HEAD
        from: '" top-top" <kazifahim761@gmail.com>',
=======
        from: `"Top Top" <${config.SES_FROM}>`,
>>>>>>> b8fb58bb1cd248c11ae87b374230ff7dc6122728
        to: email,
        subject: subject,
        html: html,
    });
    console.log("Message sent: %s", info.messageId);
};
export default emailSender;
//# sourceMappingURL=sendEmail.js.map