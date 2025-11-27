import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.join(process.cwd(), ".env") });
export default {
    node_env: process.env.NODE_ENV,
    port: process.env.PORT,
    dataBase_url: process.env.DATABASE_URL,
    salt_round: process.env.SALT_ROUND,
    jwt_secret: process.env.JWT_SECRET,
    email_pass: process.env.EMAIL_PASS,
    sk_key: process.env.SK_KEY,
    google_api_key: process.env.GOOGLE_API,
    SES_HOST: process.env.SES_HOST,
    SES_PORT: process.env.SES_PORT,
    SES_USER: process.env.SES_USER,
    SES_PASS: process.env.SES_PASS,
    SES_FROM: process.env.SES_FROM
};
//# sourceMappingURL=index.js.map