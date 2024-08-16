import { db } from "@/lib/db/index";
import { eq, and } from "drizzle-orm";
import { getUserAuth } from "@/lib/auth/utils";
import { type TicketId, ticketIdSchema, tickets } from "@/lib/db/schema/tickets";
import { checkinSections } from "@/lib/db/schema/checkinSections";
import { groupOfTickets } from "@/lib/db/schema/groupOfTickets";

export const getTickets = async () => {
  const { session } = await getUserAuth();
  const rows = await db.select({ ticket: tickets, checkinSection: checkinSections, groupOfTicket: groupOfTickets }).from(tickets).leftJoin(checkinSections, eq(tickets.checkinSectionId, checkinSections.id)).leftJoin(groupOfTickets, eq(tickets.groupOfTicketId, groupOfTickets.id)).where(eq(tickets.userId, session?.user.id!));
  const t = rows .map((r) => ({ ...r.ticket, checkinSection: r.checkinSection, groupOfTicket: r.groupOfTicket})); 
  return { tickets: t };
};

export const getTicketById = async (id: TicketId) => {
  const { session } = await getUserAuth();
  const { id: ticketId } = ticketIdSchema.parse({ id });
  const [row] = await db.select({ ticket: tickets, checkinSection: checkinSections, groupOfTicket: groupOfTickets }).from(tickets).where(and(eq(tickets.id, ticketId), eq(tickets.userId, session?.user.id!))).leftJoin(checkinSections, eq(tickets.checkinSectionId, checkinSections.id)).leftJoin(groupOfTickets, eq(tickets.groupOfTicketId, groupOfTickets.id));
  if (row === undefined) return {};
  const t =  { ...row.ticket, checkinSection: row.checkinSection, groupOfTicket: row.groupOfTicket } ;
  return { ticket: t };
};


