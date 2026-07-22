import { z } from "zod";

export const profileSchema = z.object({
  fullName: z.string().trim().min(2, "Full name must be at least 2 characters").max(120),
  age: z.coerce.number().int().min(5, "Age must be at least 5").max(120, "Age must be realistic"),
  profilePictureUrl: z
    .string()
    .trim()
    .refine(
      (value) =>
        value === "" ||
        value.startsWith("/uploads/profile-pictures/") ||
        /^https?:\/\//i.test(value) ||
        /^data:image\/(jpeg|png|webp);base64,/i.test(value),
      "Enter a valid image URL",
    )
    .max(1_100_000)
    .optional()
    .or(z.literal("").transform(() => undefined)),
});

export type ProfileInput = z.infer<typeof profileSchema>;
export type ProfileFormValues = z.input<typeof profileSchema>;

export type UserProfile = {
  id: string;
  userId: string;
  fullName: string;
  age: number;
  profilePictureUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export interface ProfileRepository {
  findByUserId(userId: string): Promise<UserProfile | null>;
  upsert(userId: string, input: ProfileInput): Promise<UserProfile>;
}
