import { type CheckinSection } from "@/lib/db/schema/checkinSections";
import { type GroupOfTicket } from "@/lib/db/schema/groupOfTickets";
import { type Ticket, type CompleteTicket } from "@/lib/db/schema/tickets";
import { OptimisticAction } from "@/lib/utils";
import { useOptimistic } from "react";

export type TAddOptimistic = (action: OptimisticAction<Ticket>) => void;

export const useOptimisticTickets = (
  tickets: CompleteTicket[],
  checkinSections: CheckinSection[],
  groupOfTickets: GroupOfTicket[]
) => {
  const [optimisticTickets, addOptimisticTicket] = useOptimistic(
    tickets,
    (
      currentState: CompleteTicket[],
      action: OptimisticAction<Ticket>,
    ): CompleteTicket[] => {
      const { data } = action;

      const optimisticCheckinSection = checkinSections.find(
        (checkinSection) => checkinSection.id === data.checkinSectionId,
      )!;

      const optimisticGroupOfTicket = groupOfTickets.find(
        (groupOfTicket) => groupOfTicket.id === data.groupOfTicketId,
      )!;

      const optimisticTicket = {
        ...data,
        checkinSection: optimisticCheckinSection,
       groupOfTicket: optimisticGroupOfTicket,
        id: "optimistic",
      };

      switch (action.action) {
        case "create":
          return currentState.length === 0
            ? [optimisticTicket]
            : [...currentState, optimisticTicket];
        case "update":
          return currentState.map((item) =>
            item.id === data.id ? { ...item, ...optimisticTicket } : item,
          );
        case "delete":
          return currentState.map((item) =>
            item.id === data.id ? { ...item, id: "delete" } : item,
          );
        default:
          return currentState;
      }
    },
  );

  return { addOptimisticTicket, optimisticTickets };
};
