import { text, integer, sqliteTable } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { events } from "./events"
import { type getCheckinSections } from "@/lib/api/checkinSections/queries";

import { nanoid } from "@/lib/utils";


export const checkinSections = sqliteTable('checkin_sections', {
  id: text("id").primaryKey().$defaultFn(() => nanoid()),
  name: text("name").notNull(),
  description: text("description").notNull(),
  checkinAt: integer("checkin_at", { mode: "timestamp_ms" }).notNull(),
  eventId: text("event_id").references(() => events.id, { onDelete: "cascade" }).notNull()
});


// Schema for checkinSections - used to validate API requests
const baseSchema = createSelectSchema(checkinSections)

export const insertCheckinSectionSchema = createInsertSchema(checkinSections);
export const insertCheckinSectionParams = baseSchema.extend({
  checkinAt: z.coerce.date(),
  eventId: z.coerce.string().min(1)
}).omit({ 
  id: true
});

export const updateCheckinSectionSchema = baseSchema;
export const updateCheckinSectionParams = baseSchema.extend({
  checkinAt: z.coerce.date(),
  eventId: z.coerce.string().min(1)
})
export const checkinSectionIdSchema = baseSchema.pick({ id: true });

// Types for checkinSections - used to type API request params and within Components
export type CheckinSection = typeof checkinSections.$inferSelect;
export type NewCheckinSection = z.infer<typeof insertCheckinSectionSchema>;
export type NewCheckinSectionParams = z.infer<typeof insertCheckinSectionParams>;
export type UpdateCheckinSectionParams = z.infer<typeof updateCheckinSectionParams>;
export type CheckinSectionId = z.infer<typeof checkinSectionIdSchema>["id"];
    
// this type infers the return from getCheckinSections() - meaning it will include any joins
export type CompleteCheckinSection = Awaited<ReturnType<typeof getCheckinSections>>["checkinSections"][number];

