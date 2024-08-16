import { sql } from "drizzle-orm";
import { text, sqliteTable } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { checkinSections } from "./checkinSections"
import { groupOfTickets } from "./groupOfTickets"
import { type getTickets } from "@/lib/api/tickets/queries";

import { nanoid, timestamps } from "@/lib/utils";


export const tickets = sqliteTable('tickets', {
  id: text("id").primaryKey().$defaultFn(() => nanoid()),
  checkinSectionId: text("checkin_section_id").references(() => checkinSections.id, { onDelete: "cascade" }).notNull(),
  groupOfTicketId: text("group_of_ticket_id").references(() => groupOfTickets.id, { onDelete: "cascade" }).notNull(),
  name: text("name").notNull(),
  userEmail: text("user_email").notNull(),
  status: text("status").notNull(),
  userId: text("user_id").notNull(),
  
  createdAt: text("created_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),

});


// Schema for tickets - used to validate API requests
const baseSchema = createSelectSchema(tickets).omit(timestamps)

export const insertTicketSchema = createInsertSchema(tickets).omit(timestamps);
export const insertTicketParams = baseSchema.extend({
  checkinSectionId: z.coerce.string().min(1),
  groupOfTicketId: z.coerce.string().min(1)
}).omit({ 
  id: true,
  userId: true
});

export const updateTicketSchema = baseSchema;
export const updateTicketParams = baseSchema.extend({
  checkinSectionId: z.coerce.string().min(1),
  groupOfTicketId: z.coerce.string().min(1)
}).omit({ 
  userId: true
});
export const ticketIdSchema = baseSchema.pick({ id: true });

// Types for tickets - used to type API request params and within Components
export type Ticket = typeof tickets.$inferSelect;
export type NewTicket = z.infer<typeof insertTicketSchema>;
export type NewTicketParams = z.infer<typeof insertTicketParams>;
export type UpdateTicketParams = z.infer<typeof updateTicketParams>;
export type TicketId = z.infer<typeof ticketIdSchema>["id"];
    
// this type infers the return from getTickets() - meaning it will include any joins
export type CompleteTicket = Awaited<ReturnType<typeof getTickets>>["tickets"][number];

