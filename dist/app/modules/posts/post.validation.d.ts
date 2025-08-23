import z from "zod";
export declare const productSchema: z.ZodObject<{
    body: {
        title: z.ZodString;
        description: z.ZodString;
        category: z.ZodString;
        originalPrice: z.ZodNumber;
        salesPrice: z.ZodNumber;
        images: z.ZodArray<z.ZodString>;
        video: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
        carats: z.ZodOptional<z.ZodArray<z.ZodString>>;
        size: z.ZodOptional<z.ZodArray<z.ZodString>>;
    };
}, z.z.core.$strip>;
//# sourceMappingURL=post.validation.d.ts.map