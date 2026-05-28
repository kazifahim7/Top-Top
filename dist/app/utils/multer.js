import fs from 'fs';
import path from "path";
import multer from 'multer';
import sharp from 'sharp';
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import config from '../config/index.js';
import dotenv from 'dotenv';
import AppError from '../Error/AppError.js';
dotenv.config();
const UPLOAD_DIR = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}
// ✅ সব common image MIME type allow
const ALLOWED_MIME_TYPES = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/gif",
    "image/avif",
    "image/heic",
    "image/heif",
    "image/tiff",
    "image/bmp",
    "image/svg+xml",
];
// ✅ Magic bytes — MIME spoofing বন্ধ করতে
const MAGIC_BYTES = {
    "image/jpeg": [Buffer.from([0xff, 0xd8, 0xff])],
    "image/jpg": [Buffer.from([0xff, 0xd8, 0xff])],
    "image/png": [Buffer.from([0x89, 0x50, 0x4e, 0x47])],
    "image/webp": [Buffer.from([0x52, 0x49, 0x46, 0x46])],
    "image/gif": [Buffer.from([0x47, 0x49, 0x46, 0x38])],
    "image/avif": [Buffer.from([0x00, 0x00, 0x00])], // ftyp box — first 3 bytes
    "image/bmp": [Buffer.from([0x42, 0x4d])],
    "image/tiff": [
        Buffer.from([0x49, 0x49, 0x2a, 0x00]), // little-endian
        Buffer.from([0x4d, 0x4d, 0x00, 0x2a]), // big-endian
    ],
    // SVG এবং HEIC/HEIF magic bytes reliable না, তাই MIME চেক-ই যথেষ্ট
    "image/svg+xml": [],
    "image/heic": [],
    "image/heif": [],
};
const validateMagicBytes = (filePath, mimetype) => {
    // Magic bytes নেই এমন type গুলো skip করো (SVG, HEIC)
    const signatures = MAGIC_BYTES[mimetype];
    if (!signatures || signatures.length === 0)
        return true;
    const buffer = Buffer.alloc(4);
    const fd = fs.openSync(filePath, "r");
    fs.readSync(fd, buffer, 0, 4, 0);
    fs.closeSync(fd);
    return signatures.some(sig => buffer.slice(0, sig.length).equals(sig));
};
const storage = multer.diskStorage({
    destination(_req, _file, cb) {
        cb(null, UPLOAD_DIR);
    },
    filename(_req, file, cb) {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, `images-${uniqueSuffix}.jpg`);
    }
});
export const upload = multer({
    storage,
    limits: {
        fileSize: 50 * 1024 * 1024, // 50MB
        files: 6,
    },
    // ✅ Broadened fileFilter — সব image/* allow, non-image reject
    fileFilter(_req, file, cb) {
        const isAllowed = ALLOWED_MIME_TYPES.includes(file.mimetype) ||
            file.mimetype.startsWith("image/"); // fallback: যেকোনো image subtype
        if (!isAllowed) {
            return cb(new AppError(400, "Only image files are allowed"), false);
        }
        cb(null, true);
    }
});
// ---------- AWS S3 CLIENT ----------
const s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    }
});
// ---------- Upload to S3 ----------
export const uploadToS3 = async (file) => {
    if (!file)
        throw new AppError(400, "No file provided");
    // ✅ Magic bytes validation
    const isMagicValid = validateMagicBytes(file.path, file.mimetype);
    if (!isMagicValid) {
        fs.unlink(file.path, () => { });
        throw new AppError(400, "File content does not match its declared type");
    }
    // ✅ Sharp দিয়ে যেকোনো format থেকে safe JPEG বানাও
    // SVG বা অচেনা format হলে sharp এ ধরা পড়বে, error throw হবে
    let safeImageBuffer;
    try {
        safeImageBuffer = await sharp(file.path)
            .resize({ width: 1920, height: 1920, fit: "inside", withoutEnlargement: true })
            .jpeg({ quality: 85 })
            .toBuffer();
    }
    catch (sharpErr) {
        fs.unlink(file.path, () => { });
        throw new AppError(400, "Invalid or unsupported image file");
    }
    // ✅ Local file মুছে ফেলো
    fs.unlink(file.path, (err) => {
        if (err)
            console.error("Local file delete failed:", err);
    });
    const s3Key = `images-${Date.now()}-${Math.round(Math.random() * 1e9)}.jpg`;
    const params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: s3Key,
        Body: safeImageBuffer,
        ContentType: "image/jpeg",
        ContentDisposition: "inline",
    };
    try {
        await s3.send(new PutObjectCommand(params));
        return `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${s3Key}`;
    }
    catch (err) {
        console.error("S3 Upload failed:", err);
        throw new AppError(500, "File upload failed");
    }
};
export const getLocalImageURL = (filename) => {
    return `https://predeficient-walton-rotatively.ngrok-free.dev/uploads/${filename}`;
};
//# sourceMappingURL=multer.js.map