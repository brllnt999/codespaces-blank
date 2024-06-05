import { text, integer, sqliteTable } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { organizers } from "./organizers"
import { type getEvents } from "@/lib/api/events/queries";

import { nanoid } from "@/lib/utils";


export const events = sqliteTable('events', {
  id: text("id").primaryKey().$defaultFn(() => nanoid()),
  eventName: text("event_name").notNull(),
  date: integer("date", { mode: "timestamp" }).notNull(),
  location: text("location").notNull(),
  descripti: text("descripti").notNull(),
  status: text("status").notNull(),
  organizerId: text("organizer_id").references(() => organizers.id, { onDelete: "cascade" }).notNull()
});


// Schema for events - used to validate API requests
const baseSchema = createSelectSchema(events)

export const insertEventSchema = createInsertSchema(events);
export const insertEventParams = baseSchema.extend({
  date: z.coerce.date(),
  organizerId: z.coerce.string().min(1)
}).omit({ 
  id: true
});

export const updateEventSchema = baseSchema;
export const updateEventParams = baseSchema.extend({
  date: z.coerce.date(),
  organizerId: z.coerce.string().min(1)
})
export const eventIdSchema = baseSchema.pick({ id: true });

// Types for events - used to type API request params and within Components
export type Event = typeof events.$inferSelect;
export type NewEvent = z.infer<typeof insertEventSchema>;
export type NewEventParams = z.infer<typeof insertEventParams>;
export type UpdateEventParams = z.infer<typeof updateEventParams>;
export type EventId = z.infer<typeof eventIdSchema>["id"];
    
// this type infers the return from getEvents() - meaning it will include any joins
export type CompleteEvent = Awaited<ReturnType<typeof getEvents>>["events"][number];

