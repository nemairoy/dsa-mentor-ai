import type { ContentService } from "@/core/content/application/content-service";
import { aiAuthoringSchema, contentDraftSchema, type AdminPrincipal, type AiAuthoringInput, type ContentDraftInput } from "@/core/admin/domain/admin";
import { PostgresAdminRepository } from "@/core/admin/infrastructure/postgres-admin-repository";
import { animationRegistry } from "@/core/visualization/registry/animation-registry";

export class AdminAccessError extends Error {}

type PrincipalCacheEntry = {
  expiresAt: number;
  value: Promise<AdminPrincipal | null>;
};

export class AdminService {
  private principalCache = new Map<string, PrincipalCacheEntry>();

  constructor(
    private readonly repository: PostgresAdminRepository,
    private readonly contentService: ContentService,
  ) {}

  async requireAdmin(userId: string, permission?: string): Promise<AdminPrincipal> {
    const principal = await this.getPrincipal(userId);
    if (!principal || principal.role === "student") {
      throw new AdminAccessError("Admin access is required");
    }

    if (permission && !this.hasPermission(principal, permission)) {
      throw new AdminAccessError("Missing required permission");
    }

    return principal;
  }

  getPrincipal(userId: string) {
    const cached = this.principalCache.get(userId);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.value;
    }
    if (cached) this.principalCache.delete(userId);
    this.prunePrincipalCache();

    const value = this.repository.getPrincipal(userId);
    this.principalCache.set(userId, { expiresAt: Date.now() + 60_000, value });
    value.catch(() => this.principalCache.delete(userId));
    return value;
  }

  async getPrincipalSafe(userId: string): Promise<AdminPrincipal | null> {
    try {
      return await withTimeout(this.getPrincipal(userId), 2_500);
    } catch (error) {
      console.warn("[AdminService] Failed to resolve admin principal", error);
      this.principalCache.delete(userId);
      return null;
    }
  }

  async overview(ragStats: { chunks: number; indexedLessons: number }) {
    const roadmap = await this.contentService.getRoadmap();
    return this.repository.overview(
      {
        chapters: roadmap.length,
        lessons: roadmap.reduce((total, chapter) => total + chapter.lessons.length, 0),
        animations: animationRegistry.list().length,
      },
      ragStats,
    );
  }

  listUsers() {
    return this.repository.listUsers();
  }

  async assignRole(actorUserId: string, userId: string, roleId: string) {
    await this.repository.assignRole(actorUserId, userId, roleId);
    this.principalCache.delete(userId);
  }

  listDrafts() {
    return this.repository.listDrafts();
  }

  saveDraft(userId: string, input: ContentDraftInput) {
    return this.repository.saveDraft(userId, contentDraftSchema.parse(input));
  }

  saveAiAuthoring(userId: string, input: AiAuthoringInput, output: string) {
    const validated = aiAuthoringSchema.parse(input);
    return this.repository.saveAiAuthoring(userId, validated.feature, validated.prompt, output);
  }

  private hasPermission(principal: AdminPrincipal, permission: string) {
    return (
      principal.permissions.includes("*") ||
      principal.permissions.includes(permission) ||
      principal.permissions.some((item) => item.endsWith(":*") && permission.startsWith(item.replace("*", "")))
    );
  }

  private prunePrincipalCache() {
    const now = Date.now();
    for (const [key, entry] of this.principalCache) {
      if (entry.expiresAt <= now) this.principalCache.delete(key);
    }
    while (this.principalCache.size >= 250) {
      const oldestKey = this.principalCache.keys().next().value as string | undefined;
      if (!oldestKey) break;
      this.principalCache.delete(oldestKey);
    }
  }
}

function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error(`Operation timed out after ${timeoutMs}ms`)), timeoutMs);

    promise.then(
      (value) => {
        clearTimeout(timeout);
        resolve(value);
      },
      (error) => {
        clearTimeout(timeout);
        reject(error);
      },
    );
  });
}
