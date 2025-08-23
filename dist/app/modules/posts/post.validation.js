import z from "zod";
export const productSchema = z.object({
    body: {
        title: z.string().min(1, "Title is required"),
        description: z.string().min(1, "Description is required"),
        category: z.string().min(1, "Category is required"),
        originalPrice: z.number().positive("Original price must be positive"),
        salesPrice: z.number().positive("Sales price must be positive"),
        images: z.array(z.string().url()).nonempty("At least one image URL is required"),
        video: z.string().url().optional().or(z.literal("")),
        carats: z.array(z.string()).optional(),
        size: z.array(z.string()).optional(),
    }
});
//# sourceMappingURL=post.validation.js.map