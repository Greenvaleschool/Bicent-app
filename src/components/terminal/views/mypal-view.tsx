
"use client";

import { MyPalPanel } from "@/components/dashboard/my-pal-panel";
import { Asset } from "@/app/lib/mock-data";

interface MyPalViewProps {
  selectedAsset: Asset;
  language: string;
  t: (key: string) => string;
}

export function MyPalView({ selectedAsset, language, t }: MyPalViewProps) {
  return (
    <div className="flex-1 flex flex-col gap-4 min-w-0">
      <MyPalPanel symbol={selectedAsset.symbol} language={language} t={t} />
    </div>
  );
}
