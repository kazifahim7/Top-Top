import fs from 'fs';
import path from "path";
import multer from 'multer';
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import config from '../config/index.js'; 
import dotenv from 'dotenv';

dotenv.config();

// ---------- Local Upload Directory ----------
const UPLOAD_DIR = path.join(process.cwd(), 'uploads');

// ensure upload folder exists
if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// ---------- Multer disk storage ----------
const storage = multer.diskStorage({
    destination(req, file, cb) {
        cb(null, UPLOAD_DIR);
    },
    filename: (_req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname);
        cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
    }
});

// Export multer upload
export const upload = multer({ storage });

// ---------- AWS S3 CLIENT ----------
const s3 = new S3Client({
    region: process.env.AWS_REGION!,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    }
});

// ---------- Upload to AWS + Delete Local ----------
export const uploadToS3 = async (file: any) => {
    if (!file) throw new Error("No file provided");

    const filePath = file.path;
    const fileContent = fs.readFileSync(filePath);

    const params = {
        Bucket: process.env.AWS_BUCKET_NAME!,
        Key: file.filename,
        Body: fileContent,
        ContentType: file.mimetype,
        // ACL removed
    };

    try {
        // Upload to S3
        await s3.send(new PutObjectCommand(params));

        // Delete local file after successful upload
        fs.unlink(filePath, (err) => {
            if (err) console.error("Local file delete failed:", err);
        });

        return `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${file.filename}`;
    } catch (err) {
        console.error("S3 Upload failed:", err);
        throw err; // prevent returning a broken URL
    }
};
// ---------- Local URL fallback (optional) ----------
export const getLocalImageURL = (filename:string) => {
    return `https://predeficient-walton-rotatively.ngrok-free.dev/uploads/${filename}`;
};
