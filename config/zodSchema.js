import { z } from "zod";

const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+={[}\]|\\:;"'<>,.?/~`]).{8,128}$/;

export const zSchema = z.object({
  email: z
    .string()
    .nonempty({ message: "Email is required" }) 
    .email({ message: "Invalid email address" }),


  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters" })
    .max(128, { message: "Password must be at most 128 characters" })
    .regex(passwordRegex, {
      message:
        "Password must include uppercase, lowercase, number and special character",
    }),


	name: z
      .string()
      .nonempty("Name is required")
      .min(3, "Name must be at least 3 characters"),
});
