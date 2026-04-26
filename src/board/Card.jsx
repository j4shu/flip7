import React from "react";
import {
  ACTION_CARD_LABELS,
  FREEZE,
  FLIP3,
  SECOND_CHANCE,
} from "../game/constants.js";

const ACTION_CLASS = {
  [FREEZE]: "card--freeze",
  [FLIP3]: "card--flip3",
  [SECOND_CHANCE]: "card--second-chance",
};

export function Card({ value, isNew, isBust, isSaved }) {
  const isAction = typeof value === "string";

  let className = "card";
  if (isAction) className += ` card--action ${ACTION_CLASS[value] || ""}`;
  if (isNew) className += " card--new";
  if (isBust) className += " card--bust";
  if (isSaved) className += " card--saved";

  return (
    <div className={className}>
      {isAction ? ACTION_CARD_LABELS[value] : value}
    </div>
  );
}
