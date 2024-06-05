import { Suspense } from "react";
import { notFound } from "next/navigation";

import { getEventByIdWithGroupOfTicketsAndCheckinSections } from "@/lib/api/events/queries";
import { getOrganizers } from "@/lib/api/organizers/queries";import OptimisticEvent from "@/app/(app)/events/[eventId]/OptimisticEvent";
import GroupOfTicketList from "@/components/groupOfTickets/GroupOfTicketList";
import CheckinSectionList from "@/components/checkinSections/CheckinSectionList";

import { BackButton } from "@/components/shared/BackButton";
import Loading from "@/app/loading";


export const revalidate = 0;

export default async function EventPage({
  params,
}: {
  params: { eventId: string };
}) {

  return (
    <main className="overflow-auto">
      <Event id={params.eventId} />
    </main>
  );
}

const Event = async ({ id }: { id: string }) => {
  
  const { event, groupOfTickets, checkinSections } = await getEventByIdWithGroupOfTicketsAndCheckinSections(id);
  const { organizers } = await getOrganizers();

  if (!event) notFound();
  return (
    <Suspense fallback={<Loading />}>
      <div className="relative">
        <BackButton currentResource="events" />
        <OptimisticEvent event={event} organizers={organizers}
        organizerId={event.organizerId} />
      </div>
      <div className="relative mt-8 mx-4">
        <h3 className="text-xl font-medium mb-4">{event.eventName}&apos;s Group Of Tickets</h3>
        <GroupOfTicketList
          events={[]}
          eventId={event.id}
          groupOfTickets={groupOfTickets}
        />
      </div>
      <div className="relative mt-8 mx-4">
        <h3 className="text-xl font-medium mb-4">{event.eventName}&apos;s Checkin Sections</h3>
        <CheckinSectionList
          events={[]}
          eventId={event.id}
          checkinSections={checkinSections}
        />
      </div>
    </Suspense>
  );
};
