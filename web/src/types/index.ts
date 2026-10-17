export type Connection = {
  id: string;
  ownerId: string;
  name: string;
  createdAt: Date | null;
  updatedAt: Date | null;
};

export type Contact = {
  id: string;
  ownerId: string;
  connectionId: string;
  name: string;
  /** E.164, ex.: +5511912345678 */
  phone: string;
  createdAt: Date | null;
  updatedAt: Date | null;
};

export type MessageStatus = 'scheduled' | 'sent';

export type MessageFilter = 'all' | MessageStatus;

export type Message = {
  id: string;
  ownerId: string;
  connectionId: string;
  contactIds: string[];
  content: string;
  status: MessageStatus;
  scheduledAt: Date | null;
  sentAt: Date | null;
  createdAt: Date | null;
  updatedAt: Date | null;
};

export type MessagePage = { items: Message[]; hasMore: boolean };

/** `scheduledAt: null` significa "enviar agora". */
export type MessageInput = {
  contactIds: string[];
  content: string;
  scheduledAt: Date | null;
};
