export type TCreateUser = {
     firstName: string,
     lastName:string,
     email: string,
     password: string,
     role: "admin" | "user",
     isBlocked: "active" | "block",
     address?: string
}