"use server";

import { revalidatePath } from "next/cache";
import {
  createCheckinSection,
  deleteCheckinSection,
  updateCheckinSection,
} from "@/lib/api/checkinSections/mutations";
import {
  CheckinSectionId,
  NewCheckinSectionParams,
  UpdateCheckinSectionParams,
  checkinSectionIdSchema,
  insertCheckinSectionParams,
  updateCheckinSectionParams,
} from "@/lib/db/schema/checkinSections";

const handleErrors = (e: unknown) => {
  const errMsg = "Error, please try again.";
  if (e instanceof Error) return e.message.length > 0 ? e.message : errMsg;
  if (e && typeof e === "object" && "error" in e) {
    const errAsStr = e.error as string;
    return errAsStr.length > 0 ? errAsStr : errMsg;
  }
  return errMsg;
};

const revalidateCheckinSections = () => revalidatePath("/checkin-sections");

export const createCheckinSectionAction = async (input: NewCheckinSectionParams) => {
  try {
    const payload = insertCheckinSectionParams.parse(input);
    await createCheckinSection(payload);
    revalidateCheckinSections();
  } catch (e) {
    return handleErrors(e);
  }
};

export const updateCheckinSectionAction = async (input: UpdateCheckinSectionParams) => {
  try {
    const payload = updateCheckinSectionParams.parse(input);
    await updateCheckinSection(payload.id, payload);
    revalidateCheckinSections();
  } catch (e) {
    return handleErrors(e);
  }
};

export const deleteCheckinSectionAction = async (input: CheckinSectionId) => {
  try {
    const payload = checkinSectionIdSchema.parse({ id: input });
    await deleteCheckinSection(payload.id);
    revalidateCheckinSections();
  } catch (e) {
    return handleErrors(e);
  }
};