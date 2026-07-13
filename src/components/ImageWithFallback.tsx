import { useState, type ImgHTMLAttributes } from "react";

interface ImageWithFallbackProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, "alt"> {
  alt?: string;
  fallbackSeed: string;
  fallbackOffset?: number;
  fallbackLabel?: string;
}

export function neutralTone(seed: string, offset = 0) {
  const hash = [...seed].reduce(
    (total, character, index) => total + character.charCodeAt(0) * (index + 1),
    0,
  );
  const lightness = 16 + ((hash + offset * 11) % 20);
  return `hsl(0 0% ${lightness}%)`;
}

/**
 * Keep remote image failures inside the card surface. The fallback tone is
 * derived from stable content so an offline render stays deterministic.
 */
export default function ImageWithFallback({
  alt = "",
  fallbackSeed,
  fallbackOffset = 0,
  fallbackLabel,
  onError,
  style,
  ...imageProps
}: ImageWithFallbackProps) {
  const [failedSource, setFailedSource] = useState<string | null>(null);
  const source = typeof imageProps.src === "string" ? imageProps.src : "";

  if (failedSource === source) {
    const accessibleLabel = fallbackLabel ?? alt;

    return (
      <span
        className={`block ${imageProps.className ?? ""}`.trim()}
        style={{ ...style, backgroundColor: neutralTone(fallbackSeed, fallbackOffset) }}
        role={accessibleLabel ? "img" : undefined}
        aria-label={accessibleLabel || undefined}
        aria-hidden={accessibleLabel ? undefined : true}
        data-image-state="fallback"
        data-image-fallback="true"
      />
    );
  }

  return (
    <img
      {...imageProps}
      alt={alt}
      style={style}
      onError={(event) => {
        setFailedSource(source);
        onError?.(event);
      }}
      data-image-state="remote"
    />
  );
}
