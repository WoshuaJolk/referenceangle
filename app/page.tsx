"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { FilterBar, type Filters } from "@/components/filter-bar";
import { ResultsCarousel } from "@/components/results-carousel";
import type { Pose } from "@/components/head-viewer";

// the 3D viewer is client-only (WebGL)
const HeadViewer = dynamic(
  () => import("@/components/head-viewer").then((m) => m.HeadViewer),
  { ssr: false },
);

const DEFAULT_FILTERS: Filters = {
  emotion: "any",
  gender: "any",
  ageLow: 5,
  ageHigh: 90,
  must: [],
};

export default function Home() {
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [pose, setPose] = useState<Pose>({ pitch: 0, yaw: 0, roll: 0 });
  const [results, setResults] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const abortRef = useRef<AbortController | null>(null);

  const fetchResults = useCallback(async (p: Pose, f: Filters) => {
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    const params = new URLSearchParams({
      pitch: String(p.pitch),
      yaw: String(p.yaw),
      roll: String(p.roll),
      ageLow: String(f.ageLow),
      ageHigh: String(f.ageHigh),
      gender: f.gender,
      emotion: f.emotion,
      must: f.must.join(","),
    });
    setLoading(true);
    try {
      const res = await fetch(`/api/facePoses?${params}`, {
        signal: ctrl.signal,
      });
      const data: Array<{ src: string }> = await res.json();
      setResults(Array.isArray(data) ? data.map((d) => d.src) : []);
    } catch (e) {
      if ((e as Error)?.name !== "AbortError") setResults([]);
    } finally {
      if (!ctrl.signal.aborted) setLoading(false);
    }
  }, []);

  // refetch whenever the pose or filters change (debounced)
  useEffect(() => {
    const t = setTimeout(() => fetchResults(pose, filters), 100);
    return () => clearTimeout(t);
  }, [pose, filters, fetchResults]);

  const onPoseChange = useCallback((p: Pose) => setPose(p), []);

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-4 py-6 sm:py-10">
      <header className="mb-6">
        <h1 className="text-xl font-semibold tracking-tight">Reference Angle</h1>
        <p className="text-muted-foreground text-sm">
          Rotate the head to find faces at that angle.
        </p>
      </header>

      <div className="mb-6">
        <FilterBar filters={filters} onChange={setFilters} />
      </div>

      {/* mobile: results on top, head below. desktop: head left, results right. */}
      <div className="flex flex-col gap-8 md:flex-row md:items-start md:gap-10">
        <div className="order-2 md:order-1 md:w-[300px] md:shrink-0">
          <div className="md:sticky md:top-6">
            <HeadViewer onPoseChange={onPoseChange} />
            <p className="text-muted-foreground mt-2 text-center text-xs tabular-nums">
              yaw {pose.yaw}° · pitch {pose.pitch}°
            </p>
          </div>
        </div>

        <div className="order-1 min-w-0 flex-1 md:order-2">
          <ResultsCarousel results={results} loading={loading} />
        </div>
      </div>
    </main>
  );
}
