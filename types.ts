
export interface Variable {
  id: string;
  address: string;
  symbol: string;
  type: string;
  comment: string;
}

export interface LadderElement {
  type: string;
  descriptor: string;
  symbol: string;
  row: number;
  column: number;
  connection: string;
}

export interface Rung {
  name: string;
  comment: string;
  elements: LadderElement[];
  instructionLines: string[];
}

export interface PLCLogicResponse {
  description: string;
  variables: Variable[];
  rungs: Rung[];
  instructionList: string; // Keep for quick preview
  ladderLogicSteps: string[];
}
