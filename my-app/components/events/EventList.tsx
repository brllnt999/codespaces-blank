"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import { type Event, CompleteEvent } from "@/lib/db/schema/events";
import Modal from "@/components/shared/Modal";
import { type Organizer, type OrganizerId } from "@/lib/db/schema/organizers";
import { useOptimisticEvents } from "@/app/(app)/events/useOptimisticEvents";
import { Button } from "@/components/ui/button";
import EventForm from "./EventForm";
import { PlusIcon } from "lucide-react";

type TOpenModal = (event?: Event) => void;

export default function EventList({
  events,
  organizers,
  organizerId 
}: {
  events: CompleteEvent[];
  organizers: Organizer[];
  organizerId?: OrganizerId 
}) {
  const { optimisticEvents, addOptimisticEvent } = useOptimisticEvents(
    events,
    organizers 
  );
  const [open, setOpen] = useState(false);
  const [activeEvent, setActiveEvent] = useState<Event | null>(null);
  const openModal = (event?: Event) => {
    setOpen(true);
    event ? setActiveEvent(event) : setActiveEvent(null);
  };
  const closeModal = () => setOpen(false);

  return (
    <div>
      <Modal
        open={open}
        setOpen={setOpen}
        title={activeEvent ? "Edit Event" : "Create Event"}
      >
        <EventForm
          event={activeEvent}
          addOptimistic={addOptimisticEvent}
          openModal={openModal}
          closeModal={closeModal}
          organizers={organizers}
        organizerId={organizerId}
        />
      </Modal>
      <div className="absolute right-0 top-0 ">
        <Button onClick={() => openModal()} variant={"outline"}>
          +
        </Button>
      </div>
      {optimisticEvents.length === 0 ? (
        <EmptyState openModal={openModal} />
      ) : (
        <ul>
          {optimisticEvents.map((event) => (
            <Event
              event={event}
              key={event.id}
              openModal={openModal}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

const Event = ({
  event,
  openModal,
}: {
  event: CompleteEvent;
  openModal: TOpenModal;
}) => {
  const optimistic = event.id === "optimistic";
  const deleting = event.id === "delete";
  const mutating = optimistic || deleting;
  const pathname = usePathname();
  const basePath = pathname.includes("events")
    ? pathname
    : pathname + "/events/";


  return (
    <li
      className={cn(
        "flex justify-between my-2",
        mutating ? "opacity-30 animate-pulse" : "",
        deleting ? "text-destructive" : "",
      )}
    >
      <div className="w-full">
        <div>{event.eventName}</div>
      </div>
      <Button variant={"link"} asChild>
        <Link href={ basePath + "/" + event.id }>
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
        No events
      </h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Get started by creating a new event.
      </p>
      <div className="mt-6">
        <Button onClick={() => openModal()}>
          <PlusIcon className="h-4" /> New Events </Button>
      </div>
    </div>
  );
};
