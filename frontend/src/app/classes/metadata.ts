export interface Metadata {
  type: string;
  time: {
    color: string | null;
    opacity: number;
    entities: string[];
  };
  freq: {
    color: string | null;
    opacity: number;
    entities: string[];
  };
}
