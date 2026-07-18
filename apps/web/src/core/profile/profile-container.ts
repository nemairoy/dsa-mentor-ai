import { ProfileService } from "@/core/profile/application/profile-service";
import { PostgresProfileRepository } from "@/core/profile/infrastructure/postgres-profile-repository";

export const profileService = new ProfileService(new PostgresProfileRepository());

