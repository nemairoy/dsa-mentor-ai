import { TopicRoadmap } from "@/components/learn/topic-roadmap";
import { PageHeader } from "@/components/layout/page-header";

import { contentService } from "@/core/content/content-container";

export default async function LearnPage() {
  const roadmap = await contentService.getRoadmap();

  return (
    <>
      <PageHeader
        title="Learn DSA with AI"
        description="Choose any DSA topic and start from its introduction with visual explanations and AI support."
      />
      <div className="mt-6">
        <TopicRoadmap chapters={roadmap} />
      </div>
    </>
  );
}
