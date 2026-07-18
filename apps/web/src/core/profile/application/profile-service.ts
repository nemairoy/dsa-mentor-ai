import { profileSchema, type ProfileInput, type ProfileRepository, type UserProfile } from "@/core/profile/domain/profile";

type ProfileCacheEntry = {
  expiresAt: number;
  value: Promise<UserProfile | null>;
};

export class ProfileService {
  private cache = new Map<string, ProfileCacheEntry>();

  constructor(private readonly profiles: ProfileRepository) {}

  getByUserId(userId: string): Promise<UserProfile | null> {
    const cached = this.cache.get(userId);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.value;
    }

    const value = this.profiles.findByUserId(userId);
    this.cache.set(userId, { expiresAt: Date.now() + 10_000, value });
    value.catch(() => this.cache.delete(userId));
    return value;
  }

  async save(userId: string, input: ProfileInput): Promise<UserProfile> {
    const profile = profileSchema.parse(input);
    this.cache.delete(userId);
    const saved = await this.profiles.upsert(userId, profile);
    this.cache.set(userId, { expiresAt: Date.now() + 10_000, value: Promise.resolve(saved) });
    return saved;
  }
}
