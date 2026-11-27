export type NotificationType = 'budget' | 'goal' | 'spending';

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  data: Record<string, unknown>;
  read: boolean;
  createdAt: number;
}

export interface SendPushInput {
  type: NotificationType;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  url?: string;
  dedupeKey: string;
}
