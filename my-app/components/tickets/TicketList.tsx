"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import { type Ticket, CompleteTicket } from "@/lib/db/schema/tickets";
import Modal from "@/components/shared/Modal";
import { type CheckinSection, type CheckinSectionId } from "@/lib/db/schema/checkinSections";
import { type GroupOfTicket, type GroupOfTicketId } from "@/lib/db/schema/groupOfTickets";
import { useOptimisticTickets } from "@/app/(app)/tickets/useOptimisticTickets";
import { Button } from "@/components/ui/button";
import TicketForm from "./TicketForm";
import { PlusIcon } from "lucide-react";

type TOpenModal = (ticket?: Ticket) => void;

export default function TicketList({
  tickets,
  checkinSections,
  checkinSectionId,
  groupOfTickets,
  groupOfTicketId 
}: {
  tickets: CompleteTicket[];
  checkinSections: CheckinSection[];
  checkinSectionId?: CheckinSectionId;
  groupOfTickets: GroupOfTicket[];
  groupOfTicketId?: GroupOfTicketId 
}) {
  const { optimisticTickets, addOptimisticTicket } = useOptimisticTickets(
    tickets,
    checkinSections,
  groupOfTickets 
  );
  const [open, setOpen] = useState(false);
  const [activeTicket, setActiveTicket] = useState<Ticket | null>(null);
  const openModal = (ticket?: Ticket) => {
    setOpen(true);
    ticket ? setActiveTicket(ticket) : setActiveTicket(null);
  };
  const closeModal = () => setOpen(false);

  return (
    <div>
      <Modal
        open={open}
        setOpen={setOpen}
        title={activeTicket ? "Edit Ticket" : "Create Ticket"}
      >
        <TicketForm
          ticket={activeTicket}
          addOptimistic={addOptimisticTicket}
          openModal={openModal}
          closeModal={closeModal}
          checkinSections={checkinSections}
        checkinSectionId={checkinSectionId}
        groupOfTickets={groupOfTickets}
        groupOfTicketId={groupOfTicketId}
        />
      </Modal>
      <div className="absolute right-0 top-0 ">
        <Button onClick={() => openModal()} variant={"outline"}>
          +
        </Button>
      </div>
      {optimisticTickets.length === 0 ? (
        <EmptyState openModal={openModal} />
      ) : (
        <ul>
          {optimisticTickets.map((ticket) => (
            <Ticket
              ticket={ticket}
              key={ticket.id}
              openModal={openModal}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

const Ticket = ({
  ticket,
  openModal,
}: {
  ticket: CompleteTicket;
  openModal: TOpenModal;
}) => {
  const optimistic = ticket.id === "optimistic";
  const deleting = ticket.id === "delete";
  const mutating = optimistic || deleting;
  const pathname = usePathname();
  const basePath = pathname.includes("tickets")
    ? pathname
    : pathname + "/tickets/";


  return (
    <li
      className={cn(
        "flex justify-between my-2",
        mutating ? "opacity-30 animate-pulse" : "",
        deleting ? "text-destructive" : "",
      )}
    >
      <div className="w-full">
        <div>{ticket.checkinSectionId}</div>
      </div>
      <Button variant={"link"} asChild>
        <Link href={ basePath + "/" + ticket.id }>
          Edit
        </Link>
      </Button>
    </li>
  );
};

const EmptyState = ({ openModal }: { openModal: TOpenModal }) => {
  return (
    <div className="text-center">
      <h3 className="mt-2 text-sm font-semibold text-secondary-foreground">
        No tickets
      </h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Get started by creating a new ticket.
      </p>
      <div className="mt-6">
        <Button onClick={() => openModal()}>
          <PlusIcon className="h-4" /> New Tickets </Button>
      </div>
    </div>
  );
};
