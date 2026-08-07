export interface MeasuredRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** Keys GameBoard measures for tutorial spotlights. */
export type TutorialTargetRef =
  | "table"
  | "bidChrome"
  | "humanPanel"
  | "gameStatus"
  | "bidPanel"
  | "actionControls"
  | "roundResult"
  | "opponentPanels";
