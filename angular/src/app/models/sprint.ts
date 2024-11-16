import {Team} from "./team";

export interface Sprint {
  id: number;
  majorVersion: string;
  startDate: string; // Date in ISO format
  endDate: string; // Date in ISO format
  regressionStart: string; // Date in ISO format
  regressionEnd: string; // Date in ISO format
  team: Team;
}
