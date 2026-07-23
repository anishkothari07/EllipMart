import { prisma } from '@/lib/prisma/client';
import { cacheService } from '@/lib/cache/cache.service';

export interface FeatureEvaluationContext {
  userId?: string;
  country?: string;
  role?: string;
}

class FeatureFlagEngine {
  public async isEnabled(
    flagKey: string,
    context?: FeatureEvaluationContext
  ): Promise<boolean> {
    const cacheKey = `feature_flag:${flagKey}`;

    return cacheService.remember(cacheKey, 60, async () => {
      try {
        const flag = await prisma.featureFlag.findUnique({
          where: { key: flagKey },
        });

        if (!flag) return false;
        if (!flag.enabled) return false;

        // Rollout percentage evaluation based on userId hash if context provided
        if (flag.rolloutPct < 100 && context?.userId) {
          const hash = this.simpleHash(`${flagKey}:${context.userId}`);
          const userBucket = hash % 100;
          return userBucket < flag.rolloutPct;
        }

        return flag.enabled;
      } catch (err) {
        // Fallback default false on database error
        return false;
      }
    });
  }

  private simpleHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash);
  }
}

export const featureFlags = new FeatureFlagEngine();
