import { z } from "zod";
export declare const createUserValidation: z.ZodObject<{
    body: z.ZodObject<{
        name: z.ZodString;
        email: z.ZodString;
        password: z.ZodString;
        role: z.ZodDefault<z.ZodEnum<{
            user: "user";
            admin: "admin";
        }>>;
        isBlocked: z.ZodDefault<z.ZodString>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const loginUserValidation: z.ZodObject<{
    body: z.ZodObject<{
        email: z.ZodString;
        password: z.ZodString;
    }, z.core.$strip>;
}, z.core.$strip>;
//# sourceMappingURL=auth.zod.d.ts.map