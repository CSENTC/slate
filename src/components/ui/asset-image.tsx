"use client";

import React, { useState } from "react";
import Image from "next/image";
import { ASSET_MANIFEST, AssetKey } from "@/lib/assets";

interface AssetImageProps {
  assetKey: AssetKey;
  priority?: boolean;
  className?: string;
  fallbackClassName?: string;
}

export function AssetImage({
  assetKey,
  priority = false,
  className = "",
  fallbackClassName = "",
}: AssetImageProps) {
  const asset = ASSET_MANIFEST[assetKey];
  const [hasError, setHasError] = useState(false);

  if (!asset) {
    return (
      <div className={`border border-dashed border-line p-4 text-xs font-mono text-muted ${fallbackClassName}`}>
        Asset key &quot;{assetKey}&quot; not found in manifest
      </div>
    );
  }

  // If the file errored or was not found, show the clean dashed placeholder frame
  if (hasError) {
    const aspectRatio = (asset.height / asset.width) * 100;
    return (
      <div
        className={`relative flex flex-col items-center justify-center border border-dashed border-line/60 bg-surface/30 p-4 text-center select-none ${className} ${fallbackClassName}`}
        style={{ minHeight: "140px", aspectRatio: `${asset.width} / ${asset.height}` }}
      >
        <div className="flex flex-col items-center gap-1.5 opacity-80">
          <div className="w-6 h-6 rounded border border-line flex items-center justify-center text-[10px] font-mono text-muted">
            IMG
          </div>
          <span className="font-mono text-[11px] text-ink font-medium tracking-tight">
            {asset.path.split("/").pop()}
          </span>
          <span className="font-mono text-[10px] text-muted">
            {asset.width} × {asset.height} px
          </span>
        </div>
      </div>
    );
  }

  return (
    <Image
      src={asset.path}
      alt={asset.alt}
      width={asset.width}
      height={asset.height}
      priority={priority}
      onError={() => setHasError(true)}
      className={`object-cover ${className}`}
      unoptimized={asset.isVector}
    />
  );
}

