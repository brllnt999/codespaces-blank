import { Suspense } from "react";

import Loading from "@/app/loading";
import EventList from "@/components/events/EventList";
import { getEvents } from "@/lib/api/events/queries";
import { getOrganizers } from "@/lib/api/organizers/queries";

export const revalidate = 0;

export default async function EventsPage() {
  return (
    <main>
      <div className="relative">
        <div className="flex justify-between">
          <h1 className="font-semibold text-2xl my-2">Events</h1>
        </div>
        <Events />
      </div>
    </main>
  );
}

const Events = async () => {
  
  const { events } = await getEvents();
  const { organizers } = await getOrganizers();
  return (
    <Suspense fallback={<Loading />}>
      <EventList events={events} organizers={organizers} />
    </Suspense>
  );
};
