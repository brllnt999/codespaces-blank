"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import { type CheckinSection, CompleteCheckinSection } from "@/lib/db/schema/checkinSections";
import Modal from "@/components/shared/Modal";
import { type Event, type EventId } from "@/lib/db/schema/events";
import { useOptimisticCheckinSections } from "@/app/(app)/checkin-sections/useOptimisticCheckinSections";
import { Button } from "@/components/ui/button";
import CheckinSectionForm from "./CheckinSectionForm";
import { PlusIcon } from "lucide-react";

type TOpenModal = (checkinSection?: CheckinSection) => void;

export default function CheckinSectionList({
  checkinSections,
  events,
  eventId 
}: {
  checkinSections: CompleteCheckinSection[];
  events: Event[];
  eventId?: EventId 
}) {
  const { optimisticCheckinSections, addOptimisticCheckinSection } = useOptimisticCheckinSections(
    checkinSections,
    events 
  );
  const [open, setOpen] = useState(false);
  const [activeCheckinSection, setActiveCheckinSection] = useState<CheckinSection | null>(null);
  const openModal = (checkinSection?: CheckinSection) => {
    setOpen(true);
    checkinSection ? setActiveCheckinSection(checkinSection) : setActiveCheckinSection(null);
  };
  const closeModal = () => setOpen(false);

  return (
    <div>
      <Modal
        open={open}
        setOpen={setOpen}
        title={activeCheckinSection ? "Edit CheckinSection" : "Create Checkin Section"}
      >
        <CheckinSectionForm
          checkinSection={activeCheckinSection}
          addOptimistic={addOptimisticCheckinSection}
          openModal={openModal}
          closeModal={closeModal}
          events={events}
        eventId={eventId}
        />
      </Modal>
      <div className="absolute right-0 top-0 ">
        <Button onClick={() => openModal()} variant={"outline"}>
          +
        </Button>
      </div>
      {optimisticCheckinSections.length === 0 ? (
        <EmptyState openModal={openModal} />
      ) : (
        <ul>
          {optimisticCheckinSections.map((checkinSection) => (
            <CheckinSection
              checkinSection={checkinSection}
              key={checkinSection.id}
              openModal={openModal}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

const CheckinSection = ({
  checkinSection,
  openModal,
}: {
  checkinSection: CompleteCheckinSection;
  openModal: TOpenModal;
}) => {
  const optimistic = checkinSection.id === "optimistic";
  const deleting = checkinSection.id === "delete";
  const mutating = optimistic || deleting;
  const pathname = usePathname();
  const basePath = pathname.includes("checkin-sections")
    ? pathname
    : pathname + "/checkin-sections/";


  return (
    <li
      className={cn(
        "flex justify-between my-2",
        mutating ? "opacity-30 animate-pulse" : "",
        deleting ? "text-destructive" : "",
      )}
    >
      <div className="w-full">
        <div>{checkinSection.name}</div>
      </div>
      <Button variant={"link"} asChild>
        <Link href={ basePath + "/" + checkinSection.id }>
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
        No checkin sections
      </h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Get started by creating a new checkin section.
      </p>
      <div className="mt-6">
        <Button onClick={() => openModal()}>
          <PlusIcon className="h-4" /> New Checkin Sections </Button>
      </div>
    </div>
  );
};
