import { z } from "zod";

export const createUserValidation = z.object({
     body: z.object({
          firstName: z.string({ message: "FirstName is Required" }),
          lastName: z.string({ message: "LastName is Required" }),
          email: z.string().email({ message: "Enter a valid mail" }),
          password: z.string({ message: "Name is Required" }),
          role: z.enum(["user","admin"]).default("user"),
          isBlocked: z.string().default("active"),

     })
})


export const loginUserValidation = z.object({
     body: z.object({
          email: z.string().email({ message: "Enter a valid mail" }),
          password: z.string({ message: "Name is Required" }),
     })
})
