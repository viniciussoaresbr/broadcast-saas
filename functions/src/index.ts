import {initializeApp} from "firebase-admin/app";
import {Firestore, getFirestore} from "firebase-admin/firestore";
import {setGlobalOptions} from "firebase-functions";
import * as logger from "firebase-functions/logger";
import {
  CallableRequest,
  HttpsError,
  onCall,
} from "firebase-functions/v2/https";
import {onSchedule} from "firebase-functions/v2/scheduler";
import * as connections from "./connections";
import * as contacts from "./contacts";
import * as messages from "./messages";
import {processDueMessages} from "./scheduled-messages";

setGlobalOptions({maxInstances: 10});

initializeApp();
const db = getFirestore();

type Handler<T> = (db: Firestore, uid: string, data: unknown) => Promise<T>;

/**
 * Wraps a handler so it only runs for authenticated users and receives the
 * caller's UID from the verified Auth token (never from the payload).
 */
const authenticatedCall = <T>(handler: Handler<T>) =>
  onCall(async (request: CallableRequest) => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "Faça login para continuar.");
    }
    return handler(db, request.auth.uid, request.data);
  });

export const createContact = authenticatedCall(contacts.createContact);
export const updateContact = authenticatedCall(contacts.updateContact);
export const deleteContact = authenticatedCall(contacts.deleteContact);
export const deleteConnection = authenticatedCall(connections.deleteConnection);
export const createMessage = authenticatedCall(messages.createMessage);
export const updateMessage = authenticatedCall(messages.updateMessage);
export const deleteMessage = authenticatedCall(messages.deleteMessage);

export const processScheduledMessages = onSchedule(
  {schedule: "every 1 minutes", retryCount: 0},
  async () => {
    const result = await processDueMessages(db);
    logger.info("Scheduled messages processed", result);
  },
);
