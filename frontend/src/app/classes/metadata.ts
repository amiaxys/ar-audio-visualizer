export interface Metadata {
  type: string;
  time: {
    color: string | null;
    entities: string[];
  };
  freq: {
    color: string | null;
    entities: string[];
  };
}
