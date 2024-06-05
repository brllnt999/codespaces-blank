import { type Event } from "@/lib/db/schema/events";
import { type CheckinSection, type CompleteCheckinSection } from "@/lib/db/schema/checkinSections";
import { OptimisticAction } from "@/lib/utils";
import { useOptimistic } from "react";

export type TAddOptimistic = (action: OptimisticAction<CheckinSection>) => void;

export const useOptimisticCheckinSections = (
  checkinSections: CompleteCheckinSection[],
  events: Event[]
) => {
  const [optimisticCheckinSections, addOptimisticCheckinSection] = useOptimistic(
    checkinSections,
    (
      currentState: CompleteCheckinSection[],
      action: OptimisticAction<CheckinSection>,
    ): CompleteCheckinSection[] => {
      const { data } = action;

      const optimisticEvent = events.find(
        (event) => event.id === data.eventId,
      )!;

      const optimisticCheckinSection = {
        ...data,
        event: optimisticEvent,
        id: "optimistic",
      };

      switch (action.action) {
        case "create":
          return currentState.length === 0
            ? [optimisticCheckinSection]
            : [...currentState, optimisticCheckinSection];
        case "update":
          return currentState.map((item) =>
            item.id === data.id ? { ...item, ...optimisticCheckinSection } : item,
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

  return { addOptimisticCheckinSection, optimisticCheckinSections };
};
