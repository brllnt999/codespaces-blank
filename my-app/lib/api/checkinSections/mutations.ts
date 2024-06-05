import { db } from "@/lib/db/index";
import { eq } from "drizzle-orm";
import { 
  CheckinSectionId, 
  NewCheckinSectionParams,
  UpdateCheckinSectionParams, 
  updateCheckinSectionSchema,
  insertCheckinSectionSchema, 
  checkinSections,
  checkinSectionIdSchema 
} from "@/lib/db/schema/checkinSections";

export const createCheckinSection = async (checkinSection: NewCheckinSectionParams) => {
  const newCheckinSection = insertCheckinSectionSchema.parse(checkinSection);
  try {
    const [c] =  await db.insert(checkinSections).values(newCheckinSection).returning();
    return { checkinSection: c };
  } catch (err) {
    const message = (err as Error).message ?? "Error, please try again";
    console.error(message);
    throw { error: message };
  }
};

export const updateCheckinSection = async (id: CheckinSectionId, checkinSection: UpdateCheckinSectionParams) => {
  const { id: checkinSectionId } = checkinSectionIdSchema.parse({ id });
  const newCheckinSection = updateCheckinSectionSchema.parse(checkinSection);
  try {
    const [c] =  await db
     .update(checkinSections)
     .set(newCheckinSection)
     .where(eq(checkinSections.id, checkinSectionId!))
     .returning();
    return { checkinSection: c };
  } catch (err) {
    const message = (err as Error).message ?? "Error, please try again";
    console.error(message);
    throw { error: message };
  }
};

export const deleteCheckinSection = async (id: CheckinSectionId) => {
  const { id: checkinSectionId } = checkinSectionIdSchema.parse({ id });
  try {
    const [c] =  await db.delete(checkinSections).where(eq(checkinSections.id, checkinSectionId!))
    .returning();
    return { checkinSection: c };
  } catch (err) {
    const message = (err as Error).message ?? "Error, please try again";
    console.error(message);
    throw { error: message };
  }
};

