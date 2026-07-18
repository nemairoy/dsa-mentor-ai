import { AdminService } from "@/core/admin/application/admin-service";
import { PostgresAdminRepository } from "@/core/admin/infrastructure/postgres-admin-repository";
import { contentService } from "@/core/content/content-container";

export const adminService = new AdminService(new PostgresAdminRepository(), contentService);

