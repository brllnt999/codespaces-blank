import { Suspense } from "react";
import { notFound } from "next/navigation";

import { getCheckinSectionById } from "@/lib/api/checkinSections/queries";
import { getEvents } from "@/lib/api/events/queries";import OptimisticCheckinSection from "@/app/(app)/checkin-sections/[checkinSectionId]/OptimisticCheckinSection";


import { BackButton } from "@/components/shared/BackButton";
import Loading from "@/app/loading";


export const revalidate = 0;

export default async function CheckinSectionPage({
  params,
}: {
  params: { checkinSectionId: string };
}) {

  return (
    <main className="overflow-auto">
      <CheckinSection id={params.checkinSectionId} />
    </main>
  );
}

const CheckinSection = async ({ id }: { id: string }) => {
  
  const { checkinSection } = await getCheckinSectionById(id);
  const { events } = await getEvents();

  if (!checkinSection) notFound();
  return (
    <Suspense fallback={<Loading />}>
      <div className="relative">
        <BackButton currentResource="checkin-sections" />
        <OptimisticCheckinSection checkinSection={checkinSection} events={events} />
      </div>
    </Suspense>
  );
};
