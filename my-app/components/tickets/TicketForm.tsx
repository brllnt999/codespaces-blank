import { z } from "zod";

import { useState, useTransition } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useValidatedForm } from "@/lib/hooks/useValidatedForm";

import { type Action, cn } from "@/lib/utils";
import { type TAddOptimistic } from "@/app/(app)/tickets/useOptimisticTickets";

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


import { type Ticket, insertTicketParams } from "@/lib/db/schema/tickets";
import {
  createTicketAction,
  deleteTicketAction,
  updateTicketAction,
} from "@/lib/actions/tickets";
import { type CheckinSection, type CheckinSectionId } from "@/lib/db/schema/checkinSections";
import { type GroupOfTicket, type GroupOfTicketId } from "@/lib/db/schema/groupOfTickets";

const TicketForm = ({
  checkinSections,
  checkinSectionId,
  groupOfTickets,
  groupOfTicketId,
  ticket,
  openModal,
  closeModal,
  addOptimistic,
  postSuccess,
}: {
  ticket?: Ticket | null;
  checkinSections: CheckinSection[];
  checkinSectionId?: CheckinSectionId
  groupOfTickets: GroupOfTicket[];
  groupOfTicketId?: GroupOfTicketId
  openModal?: (ticket?: Ticket) => void;
  closeModal?: () => void;
  addOptimistic?: TAddOptimistic;
  postSuccess?: () => void;
}) => {
  const { errors, hasErrors, setErrors, handleChange } =
    useValidatedForm<Ticket>(insertTicketParams);
  const editing = !!ticket?.id;
  
  const [isDeleting, setIsDeleting] = useState(false);
  const [pending, startMutation] = useTransition();

  const router = useRouter();
  const backpath = useBackPath("tickets");


  const onSuccess = (
    action: Action,
    data?: { error: string; values: Ticket },
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
      toast.success(`Ticket ${action}d!`);
      if (action === "delete") router.push(backpath);
    }
  };

  const handleSubmit = async (data: FormData) => {
    setErrors(null);

    const payload = Object.fromEntries(data.entries());
    const ticketParsed = await insertTicketParams.safeParseAsync({ checkinSectionId,
  groupOfTicketId, ...payload });
    if (!ticketParsed.success) {
      setErrors(ticketParsed?.error.flatten().fieldErrors);
      return;
    }

    closeModal && closeModal();
    const values = ticketParsed.data;
    const pendingTicket: Ticket = {
      updatedAt: ticket?.updatedAt ?? new Date().toISOString().slice(0, 19).replace("T", " "),
      createdAt: ticket?.createdAt ?? new Date().toISOString().slice(0, 19).replace("T", " "),
      id: ticket?.id ?? "",
      userId: ticket?.userId ?? "",
      ...values,
    };
    try {
      startMutation(async () => {
        addOptimistic && addOptimistic({
          data: pendingTicket,
          action: editing ? "update" : "create",
        });

        const error = editing
          ? await updateTicketAction({ ...values, id: ticket.id })
          : await createTicketAction(values);

        const errorFormatted = {
          error: error ?? "Error",
          values: pendingTicket 
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
      
      {checkinSectionId ? null : <div>
        <Label
          className={cn(
            "mb-2 inline-block",
            errors?.checkinSectionId ? "text-destructive" : "",
          )}
        >
          CheckinSection
        </Label>
        <Select defaultValue={ticket?.checkinSectionId} name="checkinSectionId">
          <SelectTrigger
            className={cn(errors?.checkinSectionId ? "ring ring-destructive" : "")}
          >
            <SelectValue placeholder="Select a checkinSection" />
          </SelectTrigger>
          <SelectContent>
          {checkinSections?.map((checkinSection) => (
            <SelectItem key={checkinSection.id} value={checkinSection.id.toString()}>
              {checkinSection.id}{/* TODO: Replace with a field from the checkinSection model */}
            </SelectItem>
           ))}
          </SelectContent>
        </Select>
        {errors?.checkinSectionId ? (
          <p className="text-xs text-destructive mt-2">{errors.checkinSectionId[0]}</p>
        ) : (
          <div className="h-6" />
        )}
      </div> }

      {groupOfTicketId ? null : <div>
        <Label
          className={cn(
            "mb-2 inline-block",
            errors?.groupOfTicketId ? "text-destructive" : "",
          )}
        >
          GroupOfTicket
        </Label>
        <Select defaultValue={ticket?.groupOfTicketId} name="groupOfTicketId">
          <SelectTrigger
            className={cn(errors?.groupOfTicketId ? "ring ring-destructive" : "")}
          >
            <SelectValue placeholder="Select a groupOfTicket" />
          </SelectTrigger>
          <SelectContent>
          {groupOfTickets?.map((groupOfTicket) => (
            <SelectItem key={groupOfTicket.id} value={groupOfTicket.id.toString()}>
              {groupOfTicket.id}{/* TODO: Replace with a field from the groupOfTicket model */}
            </SelectItem>
           ))}
          </SelectContent>
        </Select>
        {errors?.groupOfTicketId ? (
          <p className="text-xs text-destructive mt-2">{errors.groupOfTicketId[0]}</p>
        ) : (
          <div className="h-6" />
        )}
      </div> }
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
          defaultValue={ticket?.name ?? ""}
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
            errors?.userEmail ? "text-destructive" : "",
          )}
        >
          User Email
        </Label>
        <Input
          type="text"
          name="userEmail"
          className={cn(errors?.userEmail ? "ring ring-destructive" : "")}
          defaultValue={ticket?.userEmail ?? ""}
        />
        {errors?.userEmail ? (
          <p className="text-xs text-destructive mt-2">{errors.userEmail[0]}</p>
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
          defaultValue={ticket?.status ?? ""}
        />
        {errors?.status ? (
          <p className="text-xs text-destructive mt-2">{errors.status[0]}</p>
        ) : (
          <div className="h-6" />
        )}
      </div>
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
              addOptimistic && addOptimistic({ action: "delete", data: ticket });
              const error = await deleteTicketAction(ticket.id);
              setIsDeleting(false);
              const errorFormatted = {
                error: error ?? "Error",
                values: ticket,
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

export default TicketForm;

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
