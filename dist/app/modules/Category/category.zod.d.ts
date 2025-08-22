import { z } from "zod";
export declare const categoryValidation: z.ZodObject<{
    body: z.ZodObject<{
        category: z.ZodString;
        subCategory: z.ZodDefault<z.ZodArray<z.ZodString>>;
    }, z.core.$strip>;
}, z.core.$strip>;
//# sourceMappingURL=category.zod.d.ts.map