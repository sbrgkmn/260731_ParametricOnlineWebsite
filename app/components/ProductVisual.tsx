type ProductVisualProps = {
  variant: string;
  label: string;
  compact?: boolean;
};

export function ProductVisual({ variant, label, compact }: ProductVisualProps) {
  return (
    <div
      className={`product-visual ${compact ? "product-visual-compact" : ""}`}
      data-visual={variant}
      role="img"
      aria-label={`Abstract technical preview for ${label}`}
    >
      <span className="visual-axis axis-x" />
      <span className="visual-axis axis-y" />
      <span className="visual-object object-a" />
      <span className="visual-object object-b" />
      <span className="visual-object object-c" />
      <span className="visual-index">{variant.replace("-", " / ")}</span>
    </div>
  );
}

