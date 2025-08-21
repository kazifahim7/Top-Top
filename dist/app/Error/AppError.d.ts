declare class AppError extends Error {
    statusCode: number;
    constructor(statusCode: number, message: string, stack?: string);
}
export default AppError;
//# sourceMappingURL=AppError.d.ts.map