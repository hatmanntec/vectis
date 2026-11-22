"use client";

import { createContext, useContext, useTransition } from "react";

/**
 * A form that sends its fields to a server action WITHOUT clearing them.
 *
 * React normally empties a form after it is submitted to a server action,
 * even when the server answers "please correct this field". That would make
 * the administrator re-enter everything. This wrapper submits the same data
 * the same way, but leaves the fields exactly as they were.
 */

const PendingContext = createContext(false);

/** True while the surrounding ActionForm is being submitted. */
export const useActionFormPending = () => useContext(PendingContext);

export function ActionForm({
  action,
  children,
  ...props
}: Omit<React.ComponentProps<"form">, "action" | "onSubmit"> & {
  action: (formData: FormData) => void;
}) {
  const [pending, startTransition] = useTransition();
  return (
    <PendingContext.Provider value={pending}>
      <form
        {...props}
        onSubmit={(e) => {
          e.preventDefault();
          if (pending) return; // ignore double clicks
          const formData = new FormData(e.currentTarget);
          startTransition(() => action(formData));
        }}
      >
        {children}
      </form>
    </PendingContext.Provider>
  );
}
