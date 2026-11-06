import type { PublicSelection32 } from "../../shared/publicEstimate32";
import { buildPublicEstimateLead, buildPublicEstimateNotification, type PublicEstimateContact, type PublicEstimateQuote } from "./publicEstimateLead";

type LeadRecord = ReturnType<typeof buildPublicEstimateLead>["record"];
type NotificationPayload = ReturnType<typeof buildPublicEstimateNotification>;

/**
 * Submission workflow with injectable external effects.
 *
 * In production the adapters call the existing server-quote API, Firestore,
 * and Kakao notification API. Tests replace every adapter, never writing to
 * production Firebase or contacting Kakao.
 *
 * Only a successful Firestore write counts as an accepted consultation.
 * Notification failure is non-fatal and must never suggest re-submitting.
 */
export async function completePublicEstimateSubmission(
  selection: PublicSelection32,
  contact: PublicEstimateContact,
  isPreview: boolean,
  adapters: {
    fetchQuote: (selection: PublicSelection32) => Promise<PublicEstimateQuote>;
    saveLead: (record: LeadRecord) => Promise<{ path: string }>;
    notify: (notification: NotificationPayload) => Promise<boolean>;
    trackSubmitted: (sessionId: string) => void | Promise<void>;
    getSessionId: () => string;
    createdAt: () => string;
    onSaved: () => void;
  },
) {
  const serverQuote = await adapters.fetchQuote(selection);
  const { payload, record } = buildPublicEstimateLead(
    selection, serverQuote, contact, adapters.getSessionId(), isPreview,
  );
  // If saving fails, no success state, submitted conversion, or Kakao call.
  const doc = await adapters.saveLead(record);
  adapters.onSaved();
  // Analytics must not block a successfully saved consultation.
  try {
    void Promise.resolve(adapters.trackSubmitted(record.sessionId)).catch(() => {});
  } catch { /* Analytics unavailable */ }

  let notified = false;
  try {
    notified = await adapters.notify(
      buildPublicEstimateNotification(payload, doc.path, adapters.createdAt()),
    );
  } catch { /* Saving already succeeded; report notification delay only. */ }
  return { saved: true as const, notified, docPath: doc.path, record };
}
