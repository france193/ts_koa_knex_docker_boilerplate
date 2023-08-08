// event.ts

export interface Event {
  id?: number;
  name: string;
  payload: object;
  created_at: Date;
}
