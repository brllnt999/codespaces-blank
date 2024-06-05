import { z } from "zod";

import { useState, useTransition } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useValidatedForm } from "@/lib/hooks/useValidatedForm";

import { type Action, cn } from "@/lib/utils";
import { type TAddOptimistic } from "@/app/(app)/group-of-tickets/useOptimisticGroupOfTickets";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useBackPath } from "@/components/shared/BackButton";



import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { type GroupOfTicket, insertGroupOfTicketParams } from "@/lib/db/schema/groupOfTickets";
import {
  createGroupOfTicketAction,
  deleteGroupOfTicketAction,
  updateGroupOfTicketAction,
} from "@/lib/actions/groupOfTickets";
import { type Event, type EventId } from "@/lib/db/schema/events";

const GroupOfTicketForm = ({
  events,
  eventId,
  groupOfTicket,
  openModal,
  closeModal,
  addOptimistic,
  postSuccess,
}: {
  groupOfTicket?: GroupOfTicket | null;
  events: Event[];
  eventId?: EventId
  openModal?: (groupOfTicket?: GroupOfTicket) => void;
  closeModal?: () => void;
  addOptimistic?: TAddOptimistic;
  postSuccess?: () => void;
}) => {
  const { errors, hasErrors, setErrors, handleChange } =
    useValidatedForm<GroupOfTicket>(insertGroupOfTicketParams);
  const editing = !!groupOfTicket?.id;
  
  const [isDeleting, setIsDeleting] = useState(false);
  const [pending, startMutation] = useTransition();

  const router = useRouter();
  const backpath = useBackPath("group-of-tickets");


  const onSuccess = (
    action: Action,
    data?: { error: string; values: GroupOfTicket },
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
      toast.success(`GroupOfTicket ${action}d!`);
      if (action === "delete") router.push(backpath);
    }
  };

  const handleSubmit = async (data: FormData) => {
    setErrors(null);

    const payload = Object.fromEntries(data.entries());
    const groupOfTicketParsed = await insertGroupOfTicketParams.safeParseAsync({ eventId, ...payload });
    if (!groupOfTicketParsed.success) {
      setErrors(groupOfTicketParsed?.error.flatten().fieldErrors);
      return;
    }

    closeModal && closeModal();
    const values = groupOfTicketParsed.data;
    const pendingGroupOfTicket: GroupOfTicket = {
      
      id: groupOfTicket?.id ?? "",
      ...values,
    };
    try {
      startMutation(async () => {
        addOptimistic && addOptimistic({
          data: pendingGroupOfTicket,
          action: editing ? "update" : "create",
        });

        const error = editing
          ? await updateGroupOfTicketAction({ ...values, id: groupOfTicket.id })
          : await createGroupOfTicketAction(values);

        const errorFormatted = {
          error: error ?? "Error",
          values: pendingGroupOfTicket 
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
          defaultValue={groupOfTicket?.name ?? ""}
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
            errors?.type ? "text-destructive" : "",
          )}
        >
          Type
        </Label>
        <Input
          type="text"
          name="type"
          className={cn(errors?.type ? "ring ring-destructive" : "")}
          defaultValue={groupOfTicket?.type ?? ""}
        />
        {errors?.type ? (
          <p className="text-xs text-destructive mt-2">{errors.type[0]}</p>
        ) : (
          <div className="h-6" />
        )}
      </div>
        <div>
        <Label
          className={cn(
            "mb-2 inline-block",
            errors?.quantityAvailable ? "text-destructive" : "",
          )}
        >
          Quantity Available
        </Label>
        <Input
          type="text"
          name="quantityAvailable"
          className={cn(errors?.quantityAvailable ? "ring ring-destructive" : "")}
          defaultValue={groupOfTicket?.quantityAvailable ?? ""}
        />
        {errors?.quantityAvailable ? (
          <p className="text-xs text-destructive mt-2">{errors.quantityAvailable[0]}</p>
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
        <Select defaultValue={groupOfTicket?.eventId} name="eventId">
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
              addOptimistic && addOptimistic({ action: "delete", data: groupOfTicket });
              const error = await deleteGroupOfTicketAction(groupOfTicket.id);
              setIsDeleting(false);
              const errorFormatted = {
                error: error ?? "Error",
                values: groupOfTicket,
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

export default GroupOfTicketForm;

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
