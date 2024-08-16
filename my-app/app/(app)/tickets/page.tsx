import { Suspense } from "react";

import Loading from "@/app/loading";
import TicketList from "@/components/tickets/TicketList";
import { getTickets } from "@/lib/api/tickets/queries";
import { getCheckinSections } from "@/lib/api/checkinSections/queries";
import { getGroupOfTickets } from "@/lib/api/groupOfTickets/queries";
import { checkAuth } from "@/lib/auth/utils";

export const revalidate = 0;

export default async function TicketsPage() {
  return (
    <main>
      <div className="relative">
        <div className="flex justify-between">
          <h1 className="font-semibold text-2xl my-2">Tickets</h1>
        </div>
        <Tickets />
      </div>
    </main>
  );
}

const Tickets = async () => {
  await checkAuth();

  const { tickets } = await getTickets();
  const { checkinSections } = await getCheckinSections();
  const { groupOfTickets } = await getGroupOfTickets();
  return (
    <Suspense fallback={<Loading />}>
      <TicketList tickets={tickets} checkinSections={checkinSections} groupOfTickets={groupOfTickets} />
    </Suspense>
  );
};
