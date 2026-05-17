import multer from 'multer';
export declare const upload: multer.Multer;
export declare const uploadToS3: (file: Express.Multer.File) => Promise<string>;
export declare const getLocalImageURL: (filename: string) => string;
//# sourceMappingURL=multer.d.ts.map