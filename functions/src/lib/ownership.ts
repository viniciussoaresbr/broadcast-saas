import {
  DocumentData,
  DocumentSnapshot,
  Firestore,
  Transaction,
} from "firebase-admin/firestore";
import {HttpsError} from "firebase-functions/v2/https";

/**
 * Documents owned by someone else are reported as "not found", so a client
 * cannot probe whether an ID exists in another tenant.
 */
export const assertOwned = (
  snapshot: DocumentSnapshot,
  uid: string,
  notFoundMessage: string,
): DocumentData => {
  const data = snapshot.data();
  if (!snapshot.exists || !data || data.ownerId !== uid) {
    throw new HttpsError("not-found", notFoundMessage);
  }
  return data;
};

export const getOwnedConnection = async (
  db: Firestore,
  tx: Transaction,
  uid: string,
  connectionId: string,
) =>
  assertOwned(
    await tx.get(db.collection("connections").doc(connectionId)),
    uid,
    "Conexão não encontrada.",
  );

/**
 * Ensures every recipient exists, belongs to the client and to the given
 * connection.
 */
export const assertContactsInConnection = async (
  db: Firestore,
  tx: Transaction,
  uid: string,
  connectionId: string,
  contactIds: string[],
): Promise<void> => {
  const refs = contactIds.map((id) => db.collection("contacts").doc(id));
  const snapshots = await tx.getAll(...refs);
  const allValid = snapshots.every((snapshot) => {
    const data = snapshot.data();
    return (
      snapshot.exists &&
      data?.ownerId === uid &&
      data?.connectionId === connectionId
    );
  });
  if (!allValid) {
    throw new HttpsError(
      "invalid-argument",
      "Um ou mais contatos não pertencem a esta conexão.",
    );
  }
};
