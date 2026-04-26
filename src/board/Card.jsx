export function Card({ value, isNew, isBust }) {
  let className = "card";
  if (isNew) className += " card--new";
  if (isBust) className += " card--bust";

  return (
    <div className={className}>
      {value}
    </div>
  );
}
