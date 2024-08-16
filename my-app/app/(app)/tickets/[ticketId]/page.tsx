import { Suspense } from "react";
import { notFound } from "next/navigation";

import { getTicketById } from "@/lib/api/tickets/queries";
import { getCheckinSections } from "@/lib/api/checkinSections/queries";
import { getGroupOfTickets } from "@/lib/api/groupOfTickets/queries";import OptimisticTicket from "./OptimisticTicket";
import { checkAuth } from "@/lib/auth/utils";


import { BackButton } from "@/components/shared/BackButton";
import Loading from "@/app/loading";


export const revalidate = 0;

export default async function TicketPage({
  params,
}: {
  params: { ticketId: string };
}) {

  return (
    <main className="overflow-auto">
      <Ticket id={params.ticketId} />
    </main>
  );
}

const Ticket = async ({ id }: { id: string }) => {
  await checkAuth();

  const { ticket } = await getTicketById(id);
  const { checkinSections } = await getCheckinSections();
  const { groupOfTickets } = await getGroupOfTickets();

  if (!ticket) notFound();
  return (
    <Suspense fallback={<Loading />}>
      <div className="relative">
        <BackButton currentResource="tickets" />
        <OptimisticTicket ticket={ticket} checkinSections={checkinSections} groupOfTickets={groupOfTickets} />
      </div>
    </Suspense>
  );
};
