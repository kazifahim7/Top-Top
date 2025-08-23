import fs from 'fs';
import path from "path";
import multer from 'multer';
import config from '../config/index.js';


const UPLOAD_DIR = path.join(process.cwd(), 'uploads');

// ensure the upload dir exists
if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true })
}

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

export const upload = multer({ storage });

export const getLocalImageURL = (filename: string): string => {
    return `http://localhost:${config.port}/uploads/${filename}`
};
