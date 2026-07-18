import { notFound, redirect } from "next/navigation";

import { AnimationPlayer } from "@/components/visualization/player/animation-player";
import { animationLoader } from "@/core/visualization/loader/animation-loader";
import { animationRegistry } from "@/core/visualization/registry/animation-registry";
import { profileService } from "@/core/profile/profile-container";
import { requireSession } from "@/lib/session";

type AnimationPageProps = {
  params: Promise<{
    animationId: string;
  }>;
};

export function generateStaticParams() {
  return animationRegistry.list().map((animation) => ({ animationId: animation.id }));
}

export default async function AnimationPage({ params }: AnimationPageProps) {
  const session = await requireSession();
  const profile = await profileService.getByUserId(session.user.id);

  if (!profile) {
    redirect("/profile-setup");
  }

  const { animationId } = await params;
  const definition = animationLoader.load(animationId);

  if (!definition) {
    notFound();
  }

  return <AnimationPlayer definition={definition} />;
}

