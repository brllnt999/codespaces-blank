import { db } from "@/lib/db/index";
import { eq } from "drizzle-orm";
import { type CheckinSectionId, checkinSectionIdSchema, checkinSections } from "@/lib/db/schema/checkinSections";
import { events } from "@/lib/db/schema/events";

export const getCheckinSections = async () => {
  const rows = await db.select({ checkinSection: checkinSections, event: events }).from(checkinSections).leftJoin(events, eq(checkinSections.eventId, events.id));
  const c = rows .map((r) => ({ ...r.checkinSection, event: r.event})); 
  return { checkinSections: c };
};

export const getCheckinSectionById = async (id: CheckinSectionId) => {
  const { id: checkinSectionId } = checkinSectionIdSchema.parse({ id });
  const [row] = await db.select({ checkinSection: checkinSections, event: events }).from(checkinSections).where(eq(checkinSections.id, checkinSectionId)).leftJoin(events, eq(checkinSections.eventId, events.id));
  if (row === undefined) return {};
  const c =  { ...row.checkinSection, event: row.event } ;
  return { checkinSection: c };
};


