"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { AssetImage } from "@/components/ui/asset-image";

export function ClosingCta() {
  return (
    <section className="relative overflow-hidden bg-[#121210] text-[#F3F1EA] py-28 px-6 md:px-12 border-t border-line">
      {/* Background blueprint subtle graphic image */}
      <div className="absolute inset-0 opacity-15 pointer-events-none overflow-hidden">
        <AssetImage assetKey="cta-bg" className="w-full h-full object-cover" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto flex flex-col items-center text-center">
        <span className="font-mono text-xs uppercase tracking-widest text-[#FF5A1F] font-semibold mb-4">
          Ready for zero scheduling friction?
        </span>

        <h2 className="text-4xl md:text-7xl font-extrabold tracking-tight max-w-3xl leading-[1.05]">
          Your faculty and students deserve a harmonious week.
        </h2>

        <p className="mt-6 text-[#98958A] text-base md:text-lg max-w-xl">
          Construct custom departments, audit constraints with instant visual feedback, and generate publications in seconds.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/builder"
            className="group flex items-center gap-2 px-8 py-4 rounded-xl bg-[#FF5A1F] text-white font-semibold text-sm hover:bg-[#FF6A33] transition-all duration-200 shadow-lg hover:shadow-[#FF5A1F]/20"
          >
            <span>Launch Slate Workspace</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            href="/settings"
            className="px-8 py-4 rounded-xl border border-[#2A2926] bg-[#161614] text-[#F3F1EA] font-semibold text-sm hover:border-[#98958A] transition-colors"
          >
            Review Setup Specs
          </Link>
        </div>
      </div>

      {/* Cropped Slate Wordmark at bottom */}
      <div className="relative mt-20 -mb-24 flex justify-center pointer-events-none select-none overflow-hidden">
        <span className="font-sans font-black text-[clamp(6rem,22vw,22rem)] tracking-tighter leading-none text-[#FF5A1F]/15 uppercase">
          SLATE
        </span>
      </div>
    </section>
  );
}
