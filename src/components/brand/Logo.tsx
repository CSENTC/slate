"use client";

/**
 * Logo.tsx – Slate brand logo component (inline SVG, no <img>).
 * Themes automatically via CSS variables: --accent, --ink, --bg.
 * Hover animation on centre cell respects prefers-reduced-motion.
 */

import React, { useId } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

// ─── Props ────────────────────────────────────────────────────────────────────

interface LogoBaseProps {
  /** "mark" = tile only. "lockup" = tile + wordmark. Default: "mark" */
  variant?: "mark" | "lockup";
  /** Height in px for the tile. Wordmark scales proportionally. Default: 28 */
  size?: number;
  className?: string;
}

interface LogoLinkProps extends LogoBaseProps {
  /** If provided, wraps the logo in a Next.js Link. */
  href: string;
}

interface LogoStaticProps extends LogoBaseProps {
  href?: undefined;
}

type LogoProps = LogoLinkProps | LogoStaticProps;

// ─── Tile (3×3 grid mark) ────────────────────────────────────────────────────

function SlateMark({
  size,
  centreId,
  isLink,
}: {
  size: number;
  centreId: string;
  isLink: boolean;
}) {
  // All geometry is relative to the 96×96 viewBox.
  // Outer cells use --bg (cream / dark-bg), centre cell uses --ink.
  // Tile background uses --accent.
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 96 96"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      style={{ flexShrink: 0 }}
    >
      {/* Tile background */}
      <rect width="96" height="96" rx="22" fill="var(--accent)" />

      {/* Row 0 */}
      <rect x="12" y="12" width="20" height="20" rx="4" fill="var(--bg)" />
      <rect x="38" y="12" width="20" height="20" rx="4" fill="var(--bg)" />
      <rect x="64" y="12" width="20" height="20" rx="4" fill="var(--bg)" />

      {/* Row 1 – centre cell animates on hover */}
      <rect x="12" y="38" width="20" height="20" rx="4" fill="var(--bg)" />
      <rect
        id={centreId}
        x="38"
        y="38"
        width="20"
        height="20"
        rx="4"
        fill="var(--ink)"
        className={
          isLink
            ? "logo-centre-cell"
            : undefined
        }
      />
      <rect x="64" y="38" width="20" height="20" rx="4" fill="var(--bg)" />

      {/* Row 2 */}
      <rect x="12" y="64" width="20" height="20" rx="4" fill="var(--bg)" />
      <rect x="38" y="64" width="20" height="20" rx="4" fill="var(--bg)" />
      <rect x="64" y="64" width="20" height="20" rx="4" fill="var(--bg)" />
    </svg>
  );
}

// ─── Wordmark ─────────────────────────────────────────────────────────────────

function SlateWordmark({ tileSize }: { tileSize: number }) {
  const fontSize = tileSize * 1.0;

  return (
    <span
      style={{
        fontFamily: "var(--font-inter-tight), Inter, sans-serif",
        fontWeight: 800,
        fontSize: `${fontSize}px`,
        letterSpacing: "-0.05em",
        lineHeight: 1,
        color: "var(--ink)",
        display: "inline-flex",
        alignItems: "baseline",
        userSelect: "none",
      }}
    >
      Slate
      <span style={{ color: "var(--accent)" }}>.</span>
    </span>
  );
}

// ─── Inner logo layout ────────────────────────────────────────────────────────

function LogoInner({
  variant = "mark",
  size = 28,
  centreId,
  isLink,
}: {
  variant: "mark" | "lockup";
  size: number;
  centreId: string;
  isLink: boolean;
}) {
  const gap = Math.round(size * 0.45);

  if (variant === "mark") {
    return <SlateMark size={size} centreId={centreId} isLink={isLink} />;
  }

  return (
    <span
      aria-label="Slate"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: `${gap}px`,
      }}
    >
      <SlateMark size={size} centreId={centreId} isLink={isLink} />
      <SlateWordmark tileSize={size} />
    </span>
  );
}

// ─── Public component ─────────────────────────────────────────────────────────

export function Logo({
  variant = "mark",
  size = 28,
  className,
  href,
}: LogoProps) {
  const uid = useId();
  const centreId = `slate-centre-${uid.replace(/:/g, "")}`;
  const isLink = Boolean(href);

  const inner = (
    <LogoInner
      variant={variant}
      size={size}
      centreId={centreId}
      isLink={isLink}
    />
  );

  if (href) {
    return (
      <Link
        href={href}
        className={cn("logo-link inline-flex items-center", className)}
        aria-label={variant === "mark" ? "Slate – go to home" : undefined}
      >
        {inner}
      </Link>
    );
  }

  return (
    <span className={cn("inline-flex items-center", className)}>{inner}</span>
  );
}

