import { db } from "@/lib/db/index";
import { eq } from "drizzle-orm";
import { type EventId, eventIdSchema, events } from "@/lib/db/schema/events";
import { organizers } from "@/lib/db/schema/organizers";
import { groupOfTickets, type CompleteGroupOfTicket } from "@/lib/db/schema/groupOfTickets";
import { checkinSections, type CompleteCheckinSection } from "@/lib/db/schema/checkinSections";

export const getEvents = async () => {
  const rows = await db.select({ event: events, organizer: organizers }).from(events).leftJoin(organizers, eq(events.organizerId, organizers.id));
  const e = rows .map((r) => ({ ...r.event, organizer: r.organizer})); 
  return { events: e };
};

export const getEventById = async (id: EventId) => {
  const { id: eventId } = eventIdSchema.parse({ id });
  const [row] = await db.select({ event: events, organizer: organizers }).from(events).where(eq(events.id, eventId)).leftJoin(organizers, eq(events.organizerId, organizers.id));
  if (row === undefined) return {};
  const e =  { ...row.event, organizer: row.organizer } ;
  return { event: e };
};

export const getEventByIdWithGroupOfTicketsAndCheckinSections = async (id: EventId) => {
  const { id: eventId } = eventIdSchema.parse({ id });
  const rows = await db.select({ event: events, groupOfTicket: groupOfTickets, checkinSection: checkinSections }).from(events).where(eq(events.id, eventId)).leftJoin(groupOfTickets, eq(events.id, groupOfTickets.eventId)).leftJoin(checkinSections, eq(events.id, checkinSections.eventId));
  if (rows.length === 0) return {};
  const e = rows[0].event;
  const eg = rows.filter((r) => r.groupOfTicket !== null).map((g) => g.groupOfTicket) as CompleteGroupOfTicket[];
  const ec = rows.filter((r) => r.checkinSection !== null).map((c) => c.checkinSection) as CompleteCheckinSection[];

  return { event: e, groupOfTickets: eg, checkinSections: ec };
};

