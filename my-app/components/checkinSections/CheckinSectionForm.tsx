import { z } from "zod";

import { useState, useTransition } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useValidatedForm } from "@/lib/hooks/useValidatedForm";

import { type Action, cn } from "@/lib/utils";
import { type TAddOptimistic } from "@/app/(app)/checkin-sections/useOptimisticCheckinSections";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useBackPath } from "@/components/shared/BackButton";


import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { type CheckinSection, insertCheckinSectionParams } from "@/lib/db/schema/checkinSections";
import {
  createCheckinSectionAction,
  deleteCheckinSectionAction,
  updateCheckinSectionAction,
} from "@/lib/actions/checkinSections";
import { type Event, type EventId } from "@/lib/db/schema/events";

const CheckinSectionForm = ({
  events,
  eventId,
  checkinSection,
  openModal,
  closeModal,
  addOptimistic,
  postSuccess,
}: {
  checkinSection?: CheckinSection | null;
  events: Event[];
  eventId?: EventId
  openModal?: (checkinSection?: CheckinSection) => void;
  closeModal?: () => void;
  addOptimistic?: TAddOptimistic;
  postSuccess?: () => void;
}) => {
  const { errors, hasErrors, setErrors, handleChange } =
    useValidatedForm<CheckinSection>(insertCheckinSectionParams);
  const editing = !!checkinSection?.id;
    const [checkinAt, setCheckinAt] = useState<Date | undefined>(
    checkinSection?.checkinAt,
  );

  const [isDeleting, setIsDeleting] = useState(false);
  const [pending, startMutation] = useTransition();

  const router = useRouter();
  const backpath = useBackPath("checkin-sections");


  const onSuccess = (
    action: Action,
    data?: { error: string; values: CheckinSection },
  ) => {
    const failed = Boolean(data?.error);
    if (failed) {
      openModal && openModal(data?.values);
      toast.error(`Failed to ${action}`, {
        description: data?.error ?? "Error",
      });
    } else {
      router.refresh();
      postSuccess && postSuccess();
      toast.success(`CheckinSection ${action}d!`);
      if (action === "delete") router.push(backpath);
    }
  };

  const handleSubmit = async (data: FormData) => {
    setErrors(null);

    const payload = Object.fromEntries(data.entries());
    const checkinSectionParsed = await insertCheckinSectionParams.safeParseAsync({ eventId, ...payload });
    if (!checkinSectionParsed.success) {
      setErrors(checkinSectionParsed?.error.flatten().fieldErrors);
      return;
    }

    closeModal && closeModal();
    const values = checkinSectionParsed.data;
    const pendingCheckinSection: CheckinSection = {
      
      id: checkinSection?.id ?? "",
      ...values,
    };
    try {
      startMutation(async () => {
        addOptimistic && addOptimistic({
          data: pendingCheckinSection,
          action: editing ? "update" : "create",
        });

        const error = editing
          ? await updateCheckinSectionAction({ ...values, id: checkinSection.id })
          : await createCheckinSectionAction(values);

        const errorFormatted = {
          error: error ?? "Error",
          values: pendingCheckinSection 
        };
        onSuccess(
          editing ? "update" : "create",
          error ? errorFormatted : undefined,
        );
      });
    } catch (e) {
      if (e instanceof z.ZodError) {
        setErrors(e.flatten().fieldErrors);
      }
    }
  };

  return (
    <form action={handleSubmit} onChange={handleChange} className={"space-y-8"}>
      {/* Schema fields start */}
              <div>
        <Label
          className={cn(
            "mb-2 inline-block",
            errors?.name ? "text-destructive" : "",
          )}
        >
          Name
        </Label>
        <Input
          type="text"
          name="name"
          className={cn(errors?.name ? "ring ring-destructive" : "")}
          defaultValue={checkinSection?.name ?? ""}
        />
        {errors?.name ? (
          <p className="text-xs text-destructive mt-2">{errors.name[0]}</p>
        ) : (
          <div className="h-6" />
        )}
      </div>
        <div>
        <Label
          className={cn(
            "mb-2 inline-block",
            errors?.description ? "text-destructive" : "",
          )}
        >
          Description
        </Label>
        <Input
          type="text"
          name="description"
          className={cn(errors?.description ? "ring ring-destructive" : "")}
          defaultValue={checkinSection?.description ?? ""}
        />
        {errors?.description ? (
          <p className="text-xs text-destructive mt-2">{errors.description[0]}</p>
        ) : (
          <div className="h-6" />
        )}
      </div>
<div>
        <Label
          className={cn(
            "mb-2 inline-block",
            errors?.checkinAt ? "text-destructive" : "",
          )}
        >
          Checkin At
        </Label>
        <br />
        <Popover>
          <Input
            name="checkinAt"
            onChange={() => {}}
            readOnly
            value={checkinAt?.toUTCString() ?? new Date().toUTCString()}
            className="hidden"
          />

          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-[240px] pl-3 text-left font-normal",
                !checkinSection?.checkinAt && "text-muted-foreground",
              )}
            >
              {checkinAt ? (
                <span>{format(checkinAt, "PPP")}</span>
              ) : (
                <span>Pick a date</span>
              )}
              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              onSelect={(e) => setCheckinAt(e)}
              selected={checkinAt}
              disabled={(date) =>
                date > new Date() || date < new Date("1900-01-01")
              }
              initialFocus
            />
          </PopoverContent>
        </Popover>
        {errors?.checkinAt ? (
          <p className="text-xs text-destructive mt-2">{errors.checkinAt[0]}</p>
        ) : (
          <div className="h-6" />
        )}
      </div>

      {eventId ? null : <div>
        <Label
          className={cn(
            "mb-2 inline-block",
            errors?.eventId ? "text-destructive" : "",
          )}
        >
          Event
        </Label>
        <Select defaultValue={checkinSection?.eventId} name="eventId">
          <SelectTrigger
            className={cn(errors?.eventId ? "ring ring-destructive" : "")}
          >
            <SelectValue placeholder="Select a event" />
          </SelectTrigger>
          <SelectContent>
          {events?.map((event) => (
            <SelectItem key={event.id} value={event.id.toString()}>
              {event.id}{/* TODO: Replace with a field from the event model */}
            </SelectItem>
           ))}
          </SelectContent>
        </Select>
        {errors?.eventId ? (
          <p className="text-xs text-destructive mt-2">{errors.eventId[0]}</p>
        ) : (
          <div className="h-6" />
        )}
      </div> }
      {/* Schema fields end */}

      {/* Save Button */}
      <SaveButton errors={hasErrors} editing={editing} />

      {/* Delete Button */}
      {editing ? (
        <Button
          type="button"
          disabled={isDeleting || pending || hasErrors}
          variant={"destructive"}
          onClick={() => {
            setIsDeleting(true);
            closeModal && closeModal();
            startMutation(async () => {
              addOptimistic && addOptimistic({ action: "delete", data: checkinSection });
              const error = await deleteCheckinSectionAction(checkinSection.id);
              setIsDeleting(false);
              const errorFormatted = {
                error: error ?? "Error",
                values: checkinSection,
              };

              onSuccess("delete", error ? errorFormatted : undefined);
            });
          }}
        >
          Delet{isDeleting ? "ing..." : "e"}
        </Button>
      ) : null}
    </form>
  );
};

export default CheckinSectionForm;

const SaveButton = ({
  editing,
  errors,
}: {
  editing: Boolean;
  errors: boolean;
}) => {
  const { pending } = useFormStatus();
  const isCreating = pending && editing === false;
  const isUpdating = pending && editing === true;
  return (
    <Button
      type="submit"
      className="mr-2"
      disabled={isCreating || isUpdating || errors}
      aria-disabled={isCreating || isUpdating || errors}
    >
      {editing
        ? `Sav${isUpdating ? "ing..." : "e"}`
        : `Creat${isCreating ? "ing..." : "e"}`}
    </Button>
  );
};
