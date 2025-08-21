import { ZodError } from 'zod';
declare const handleZodError: (err: ZodError) => {
    statusCode: number;
    message: string;
    errorSources: {
        path: PropertyKey | undefined;
        message: string;
    }[];
};
export default handleZodError;
//# sourceMappingURL=ZodError.d.ts.map