import { LearningService } from "@/core/learning/application/learning-service";
import {
  PostgresBookmarkRepository,
  PostgresNotesRepository,
  PostgresProgressRepository,
} from "@/core/learning/infrastructure/postgres-learning-repositories";

export const learningService = new LearningService(
  new PostgresBookmarkRepository(),
  new PostgresProgressRepository(),
  new PostgresNotesRepository(),
);

