"use client";

import { useOptimistic, useState } from "react";
import { TAddOptimistic } from "@/app/(app)/tickets/useOptimisticTickets";
import { type Ticket } from "@/lib/db/schema/tickets";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import Modal from "@/components/shared/Modal";
import TicketForm from "@/components/tickets/TicketForm";
import { type CheckinSection, type CheckinSectionId } from "@/lib/db/schema/checkinSections";
import { type GroupOfTicket, type GroupOfTicketId } from "@/lib/db/schema/groupOfTickets";

export default function OptimisticTicket({ 
  ticket,
  checkinSections,
  checkinSectionId,
  groupOfTickets,
  groupOfTicketId 
}: { 
  ticket: Ticket; 
  
  checkinSections: CheckinSection[];
  checkinSectionId?: CheckinSectionId
  groupOfTickets: GroupOfTicket[];
  groupOfTicketId?: GroupOfTicketId
}) {
  const [open, setOpen] = useState(false);
  const openModal = (_?: Ticket) => {
    setOpen(true);
  };
  const closeModal = () => setOpen(false);
  const [optimisticTicket, setOptimisticTicket] = useOptimistic(ticket);
  const updateTicket: TAddOptimistic = (input) =>
    setOptimisticTicket({ ...input.data });

  return (
    <div className="m-4">
      <Modal open={open} setOpen={setOpen}>
        <TicketForm
          ticket={optimisticTicket}
          checkinSections={checkinSections}
        checkinSectionId={checkinSectionId}
        groupOfTickets={groupOfTickets}
        groupOfTicketId={groupOfTicketId}
          closeModal={closeModal}
          openModal={openModal}
          addOptimistic={updateTicket}
        />
      </Modal>
      <div className="flex justify-between items-end mb-4">
        <h1 className="font-semibold text-2xl">{optimisticTicket.checkinSectionId}</h1>
        <Button className="" onClick={() => setOpen(true)}>
          Edit
        </Button>
      </div>
      <pre
        className={cn(
          "bg-secondary p-4 rounded-lg break-all text-wrap",
          optimisticTicket.id === "optimistic" ? "animate-pulse" : "",
        )}
      >
        {JSON.stringify(optimisticTicket, null, 2)}
      </pre>
    </div>
  );
}
