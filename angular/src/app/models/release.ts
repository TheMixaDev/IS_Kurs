import {Sprint} from "./sprint";

export interface Release {
  id: number;
  version: string;
  releaseDate: string; // Date in ISO format
  description: string | null;
  sprint: Sprint | null;
}
