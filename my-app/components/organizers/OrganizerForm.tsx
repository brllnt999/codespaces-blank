import { z } from "zod";

import { useState, useTransition } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useValidatedForm } from "@/lib/hooks/useValidatedForm";

import { type Action, cn } from "@/lib/utils";
import { type TAddOptimistic } from "@/app/(app)/organizers/useOptimisticOrganizers";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useBackPath } from "@/components/shared/BackButton";



import { type Organizer, insertOrganizerParams } from "@/lib/db/schema/organizers";
import {
  createOrganizerAction,
  deleteOrganizerAction,
  updateOrganizerAction,
} from "@/lib/actions/organizers";


const OrganizerForm = ({
  
  organizer,
  openModal,
  closeModal,
  addOptimistic,
  postSuccess,
}: {
  organizer?: Organizer | null;
  
  openModal?: (organizer?: Organizer) => void;
  closeModal?: () => void;
  addOptimistic?: TAddOptimistic;
  postSuccess?: () => void;
}) => {
  const { errors, hasErrors, setErrors, handleChange } =
    useValidatedForm<Organizer>(insertOrganizerParams);
  const editing = !!organizer?.id;
  
  const [isDeleting, setIsDeleting] = useState(false);
  const [pending, startMutation] = useTransition();

  const router = useRouter();
  const backpath = useBackPath("organizers");


  const onSuccess = (
    action: Action,
    data?: { error: string; values: Organizer },
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
      toast.success(`Organizer ${action}d!`);
      if (action === "delete") router.push(backpath);
    }
  };

  const handleSubmit = async (data: FormData) => {
    setErrors(null);

    const payload = Object.fromEntries(data.entries());
    const organizerParsed = await insertOrganizerParams.safeParseAsync({  ...payload });
    if (!organizerParsed.success) {
      setErrors(organizerParsed?.error.flatten().fieldErrors);
      return;
    }

    closeModal && closeModal();
    const values = organizerParsed.data;
    const pendingOrganizer: Organizer = {
      
      id: organizer?.id ?? "",
      userId: organizer?.userId ?? "",
      ...values,
    };
    try {
      startMutation(async () => {
        addOptimistic && addOptimistic({
          data: pendingOrganizer,
          action: editing ? "update" : "create",
        });

        const error = editing
          ? await updateOrganizerAction({ ...values, id: organizer.id })
          : await createOrganizerAction(values);

        const errorFormatted = {
          error: error ?? "Error",
          values: pendingOrganizer 
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
            errors?.organizerName ? "text-destructive" : "",
          )}
        >
          Organizer Name
        </Label>
        <Input
          type="text"
          name="organizerName"
          className={cn(errors?.organizerName ? "ring ring-destructive" : "")}
          defaultValue={organizer?.organizerName ?? ""}
        />
        {errors?.organizerName ? (
          <p className="text-xs text-destructive mt-2">{errors.organizerName[0]}</p>
        ) : (
          <div className="h-6" />
        )}
      </div>
        <div>
        <Label
          className={cn(
            "mb-2 inline-block",
            errors?.trustedContact ? "text-destructive" : "",
          )}
        >
          Trusted Contact
        </Label>
        <Input
          type="text"
          name="trustedContact"
          className={cn(errors?.trustedContact ? "ring ring-destructive" : "")}
          defaultValue={organizer?.trustedContact ?? ""}
        />
        {errors?.trustedContact ? (
          <p className="text-xs text-destructive mt-2">{errors.trustedContact[0]}</p>
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
          defaultValue={organizer?.status ?? ""}
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
              addOptimistic && addOptimistic({ action: "delete", data: organizer });
              const error = await deleteOrganizerAction(organizer.id);
              setIsDeleting(false);
              const errorFormatted = {
                error: error ?? "Error",
                values: organizer,
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

export default OrganizerForm;

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
