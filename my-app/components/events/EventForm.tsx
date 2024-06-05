import { z } from "zod";

import { useState, useTransition } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useValidatedForm } from "@/lib/hooks/useValidatedForm";

import { type Action, cn } from "@/lib/utils";
import { type TAddOptimistic } from "@/app/(app)/events/useOptimisticEvents";

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

import { type Event, insertEventParams } from "@/lib/db/schema/events";
import {
  createEventAction,
  deleteEventAction,
  updateEventAction,
} from "@/lib/actions/events";
import { type Organizer, type OrganizerId } from "@/lib/db/schema/organizers";

const EventForm = ({
  organizers,
  organizerId,
  event,
  openModal,
  closeModal,
  addOptimistic,
  postSuccess,
}: {
  event?: Event | null;
  organizers: Organizer[];
  organizerId?: OrganizerId
  openModal?: (event?: Event) => void;
  closeModal?: () => void;
  addOptimistic?: TAddOptimistic;
  postSuccess?: () => void;
}) => {
  const { errors, hasErrors, setErrors, handleChange } =
    useValidatedForm<Event>(insertEventParams);
  const editing = !!event?.id;
    const [date, setDate] = useState<Date | undefined>(
    event?.date,
  );

  const [isDeleting, setIsDeleting] = useState(false);
  const [pending, startMutation] = useTransition();

  const router = useRouter();
  const backpath = useBackPath("events");


  const onSuccess = (
    action: Action,
    data?: { error: string; values: Event },
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
      toast.success(`Event ${action}d!`);
      if (action === "delete") router.push(backpath);
    }
  };

  const handleSubmit = async (data: FormData) => {
    setErrors(null);

    const payload = Object.fromEntries(data.entries());
    const eventParsed = await insertEventParams.safeParseAsync({ organizerId, ...payload });
    if (!eventParsed.success) {
      setErrors(eventParsed?.error.flatten().fieldErrors);
      return;
    }

    closeModal && closeModal();
    const values = eventParsed.data;
    const pendingEvent: Event = {
      
      id: event?.id ?? "",
      ...values,
    };
    try {
      startMutation(async () => {
        addOptimistic && addOptimistic({
          data: pendingEvent,
          action: editing ? "update" : "create",
        });

        const error = editing
          ? await updateEventAction({ ...values, id: event.id })
          : await createEventAction(values);

        const errorFormatted = {
          error: error ?? "Error",
          values: pendingEvent 
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
            errors?.eventName ? "text-destructive" : "",
          )}
        >
          Event Name
        </Label>
        <Input
          type="text"
          name="eventName"
          className={cn(errors?.eventName ? "ring ring-destructive" : "")}
          defaultValue={event?.eventName ?? ""}
        />
        {errors?.eventName ? (
          <p className="text-xs text-destructive mt-2">{errors.eventName[0]}</p>
        ) : (
          <div className="h-6" />
        )}
      </div>
<div>
        <Label
          className={cn(
            "mb-2 inline-block",
            errors?.date ? "text-destructive" : "",
          )}
        >
          Date
        </Label>
        <br />
        <Popover>
          <Input
            name="date"
            onChange={() => {}}
            readOnly
            value={date?.toUTCString() ?? new Date().toUTCString()}
            className="hidden"
          />

          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-[240px] pl-3 text-left font-normal",
                !event?.date && "text-muted-foreground",
              )}
            >
              {date ? (
                <span>{format(date, "PPP")}</span>
              ) : (
                <span>Pick a date</span>
              )}
              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              onSelect={(e) => setDate(e)}
              selected={date}
              disabled={(date) =>
                date > new Date() || date < new Date("1900-01-01")
              }
              initialFocus
            />
          </PopoverContent>
        </Popover>
        {errors?.date ? (
          <p className="text-xs text-destructive mt-2">{errors.date[0]}</p>
        ) : (
          <div className="h-6" />
        )}
      </div>
        <div>
        <Label
          className={cn(
            "mb-2 inline-block",
            errors?.location ? "text-destructive" : "",
          )}
        >
          Location
        </Label>
        <Input
          type="text"
          name="location"
          className={cn(errors?.location ? "ring ring-destructive" : "")}
          defaultValue={event?.location ?? ""}
        />
        {errors?.location ? (
          <p className="text-xs text-destructive mt-2">{errors.location[0]}</p>
        ) : (
          <div className="h-6" />
        )}
      </div>
        <div>
        <Label
          className={cn(
            "mb-2 inline-block",
            errors?.descripti ? "text-destructive" : "",
          )}
        >
          Descripti
        </Label>
        <Input
          type="text"
          name="descripti"
          className={cn(errors?.descripti ? "ring ring-destructive" : "")}
          defaultValue={event?.descripti ?? ""}
        />
        {errors?.descripti ? (
          <p className="text-xs text-destructive mt-2">{errors.descripti[0]}</p>
        ) : (
          <div className="h-6" />
        )}
      </div>
        <div>
        <Label
          className={cn(
            "mb-2 inline-block",
            errors?.status ? "text-destructive" : "",
          )}
        >
          Status
        </Label>
        <Input
          type="text"
          name="status"
          className={cn(errors?.status ? "ring ring-destructive" : "")}
          defaultValue={event?.status ?? ""}
        />
        {errors?.status ? (
          <p className="text-xs text-destructive mt-2">{errors.status[0]}</p>
        ) : (
          <div className="h-6" />
        )}
      </div>

      {organizerId ? null : <div>
        <Label
          className={cn(
            "mb-2 inline-block",
            errors?.organizerId ? "text-destructive" : "",
          )}
        >
          Organizer
        </Label>
        <Select defaultValue={event?.organizerId} name="organizerId">
          <SelectTrigger
            className={cn(errors?.organizerId ? "ring ring-destructive" : "")}
          >
            <SelectValue placeholder="Select a organizer" />
          </SelectTrigger>
          <SelectContent>
          {organizers?.map((organizer) => (
            <SelectItem key={organizer.id} value={organizer.id.toString()}>
              {organizer.id}{/* TODO: Replace with a field from the organizer model */}
            </SelectItem>
           ))}
          </SelectContent>
        </Select>
        {errors?.organizerId ? (
          <p className="text-xs text-destructive mt-2">{errors.organizerId[0]}</p>
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
              addOptimistic && addOptimistic({ action: "delete", data: event });
              const error = await deleteEventAction(event.id);
              setIsDeleting(false);
              const errorFormatted = {
                error: error ?? "Error",
                values: event,
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

export default EventForm;

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
