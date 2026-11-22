/**
 * What every CMS save/delete action returns to the screen, and how database
 * errors are turned into messages an administrator can act on.
 */

export type ActionResult =
  | { ok: true; message?: string }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

type DbError = { code?: string; message?: string; details?: string | null; hint?: string | null } | null;

/**
 * Translate a database error into plain English.
 * `uniqueFields` maps a database column to how it should be described,
 * e.g. { slug: "web address", name: "name" }.
 */
export function describeDbError(
  error: DbError,
  uniqueFields: Record<string, string> = {},
): { error: string; fieldErrors?: Record<string, string> } {
  if (!error) return { error: "Something went wrong. Please try again." };
  const text = `${error.message ?? ""} ${error.details ?? ""}`;

  switch (error.code) {
    case "23505": {
      // Duplicate value: find which column from the database's own message.
      for (const [column, label] of Object.entries(uniqueFields)) {
        if (text.includes(`(${column})`) || text.includes(`_${column}_key`)) {
          return {
            error: `Another record already uses this ${label}.`,
            fieldErrors: { [column]: `Already used by another record. Choose a different ${label}.` },
          };
        }
      }
      return { error: "Another record already uses one of these values." };
    }
    case "23503":
      return {
        error:
          "This can't be done because other records still refer to it. " +
          "Remove or reassign those first, or archive this record instead.",
      };
    case "23514":
    case "22001":
      return { error: "One of the values isn't allowed (too long or the wrong format)." };
    case "42501":
      return { error: "You don't have permission to do this. Try signing in again." };
    case "P0001":
      // Rules raised by the database itself carry a readable message.
      return { error: error.message ?? "This change isn't allowed." };
    default:
      return { error: "Something went wrong while saving. Please try again." };
  }
}
