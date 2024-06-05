"use client";

import { useOptimistic, useState } from "react";
import { TAddOptimistic } from "@/app/(app)/checkin-sections/useOptimisticCheckinSections";
import { type CheckinSection } from "@/lib/db/schema/checkinSections";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import Modal from "@/components/shared/Modal";
import CheckinSectionForm from "@/components/checkinSections/CheckinSectionForm";
import { type Event, type EventId } from "@/lib/db/schema/events";

export default function OptimisticCheckinSection({ 
  checkinSection,
  events,
  eventId 
}: { 
  checkinSection: CheckinSection; 
  
  events: Event[];
  eventId?: EventId
}) {
  const [open, setOpen] = useState(false);
  const openModal = (_?: CheckinSection) => {
    setOpen(true);
  };
  const closeModal = () => setOpen(false);
  const [optimisticCheckinSection, setOptimisticCheckinSection] = useOptimistic(checkinSection);
  const updateCheckinSection: TAddOptimistic = (input) =>
    setOptimisticCheckinSection({ ...input.data });

  return (
    <div className="m-4">
      <Modal open={open} setOpen={setOpen}>
        <CheckinSectionForm
          checkinSection={optimisticCheckinSection}
          events={events}
        eventId={eventId}
          closeModal={closeModal}
          openModal={openModal}
          addOptimistic={updateCheckinSection}
        />
      </Modal>
      <div className="flex justify-between items-end mb-4">
        <h1 className="font-semibold text-2xl">{optimisticCheckinSection.name}</h1>
        <Button className="" onClick={() => setOpen(true)}>
          Edit
        </Button>
      </div>
      <pre
        className={cn(
          "bg-secondary p-4 rounded-lg break-all text-wrap",
          optimisticCheckinSection.id === "optimistic" ? "animate-pulse" : "",
        )}
      >
        {JSON.stringify(optimisticCheckinSection, null, 2)}
      </pre>
    </div>
  );
}
