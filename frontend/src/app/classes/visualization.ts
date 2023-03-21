import { Metadata } from "./metadata";

export interface Visualization {
  id: string;
  title: string;
  audio: JSON;
  metadata: Metadata;
  UserId: string;
}
