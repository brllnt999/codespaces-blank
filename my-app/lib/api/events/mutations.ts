import { db } from "@/lib/db/index";
import { eq } from "drizzle-orm";
import { 
  EventId, 
  NewEventParams,
  UpdateEventParams, 
  updateEventSchema,
  insertEventSchema, 
  events,
  eventIdSchema 
} from "@/lib/db/schema/events";

export const createEvent = async (event: NewEventParams) => {
  const newEvent = insertEventSchema.parse(event);
  try {
    const [e] =  await db.insert(events).values(newEvent).returning();
    return { event: e };
  } catch (err) {
    const message = (err as Error).message ?? "Error, please try again";
    console.error(message);
    throw { error: message };
  }
};

export const updateEvent = async (id: EventId, event: UpdateEventParams) => {
  const { id: eventId } = eventIdSchema.parse({ id });
  const newEvent = updateEventSchema.parse(event);
  try {
    const [e] =  await db
     .update(events)
     .set(newEvent)
     .where(eq(events.id, eventId!))
     .returning();
    return { event: e };
  } catch (err) {
    const message = (err as Error).message ?? "Error, please try again";
    console.error(message);
    throw { error: message };
  }
};

export const deleteEvent = async (id: EventId) => {
  const { id: eventId } = eventIdSchema.parse({ id });
  try {
    const [e] =  await db.delete(events).where(eq(events.id, eventId!))
    .returning();
    return { event: e };
  } catch (err) {
    const message = (err as Error).message ?? "Error, please try again";
    console.error(message);
    throw { error: message };
  }
};

