import { IntelligenceService } from "@/core/intelligence/application/intelligence-service";
import { PostgresIntelligenceRepository } from "@/core/intelligence/infrastructure/postgres-intelligence-repository";

export const intelligenceService = new IntelligenceService(new PostgresIntelligenceRepository());

