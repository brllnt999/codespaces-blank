import { Suspense } from "react";

import Loading from "@/app/loading";
import CheckinSectionList from "@/components/checkinSections/CheckinSectionList";
import { getCheckinSections } from "@/lib/api/checkinSections/queries";
import { getEvents } from "@/lib/api/events/queries";

export const revalidate = 0;

export default async function CheckinSectionsPage() {
  return (
    <main>
      <div className="relative">
        <div className="flex justify-between">
          <h1 className="font-semibold text-2xl my-2">Checkin Sections</h1>
        </div>
        <CheckinSections />
      </div>
    </main>
  );
}

const CheckinSections = async () => {
  
  const { checkinSections } = await getCheckinSections();
  const { events } = await getEvents();
  return (
    <Suspense fallback={<Loading />}>
      <CheckinSectionList checkinSections={checkinSections} events={events} />
    </Suspense>
  );
};
