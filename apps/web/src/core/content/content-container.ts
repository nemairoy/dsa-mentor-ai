import { ContentService } from "@/core/content/application/content-service";
import { FileContentRepository } from "@/core/content/infrastructure/file-content-repository";

export const contentService = new ContentService(new FileContentRepository());

