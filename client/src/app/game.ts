export interface Game {
  _id: string;
  //prompt?: string;
  players?: string[];
  playerId?: number;
  responses?: string[];
  judge?: number;
  scores?: number[];
  winnerBecomesJudge?: boolean;
  pastResponses?: string[];
  connectedPlayers?: boolean[];
}


