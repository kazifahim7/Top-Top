import { z } from "zod";
export const categoryValidation = z.object({
    body: z.object({
        category: z.string({ message: "Category is required" }),
        subCategory: z.array(z.string()).default([])
    })
});
//# sourceMappingURL=category.zod.js.map