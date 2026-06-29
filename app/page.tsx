"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { Loader2, SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { FilterBar, type Filters } from "@/components/filter-bar";
import { ResultsCarousel } from "@/components/results-carousel";
import type { Pose } from "@/components/head-viewer";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

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
  const [headReady, setHeadReady] = useState(false);
  const [firstLoaded, setFirstLoaded] = useState(false);
  const ready = headReady && firstLoaded;

  const abortRef = useRef<AbortController | null>(null);
  const cacheRef = useRef<Map<string, string[]>>(new Map());

  // fallback so the page never gets stuck on the loader if the mesh/data stall
  useEffect(() => {
    const t = setTimeout(() => {
      setHeadReady(true);
      setFirstLoaded(true);
    }, 7000);
    return () => clearTimeout(t);
  }, []);

  const fetchResults = useCallback(async (p: Pose, f: Filters) => {
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
    const key = params.toString();

    // serve repeated angles instantly from cache (keeps the DB load low while
    // dragging back and forth)
    const cached = cacheRef.current.get(key);
    if (cached) {
      abortRef.current?.abort();
      setResults(cached);
      setLoading(false);
      setFirstLoaded(true);
      return;
    }

    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setLoading(true);
    try {
      const res = await fetch(`/api/facePoses?${key}`, { signal: ctrl.signal });
      const data: Array<{ src: string }> = await res.json();
      const srcs = Array.isArray(data) ? data.map((d) => d.src) : [];
      cacheRef.current.set(key, srcs);
      setResults(srcs);
    } catch (e) {
      if ((e as Error)?.name !== "AbortError") setResults([]);
    } finally {
      if (!ctrl.signal.aborted) {
        setLoading(false);
        setFirstLoaded(true);
      }
    }
  }, []);

  // refetch whenever the pose or filters change (small debounce; the viewer
  // already throttles pose emission during the drag)
  useEffect(() => {
    const t = setTimeout(() => fetchResults(pose, filters), 40);
    return () => clearTimeout(t);
  }, [pose, filters, fetchResults]);

  const onPoseChange = useCallback((p: Pose) => setPose(p), []);

  return (
    <>
      {!ready && (
        <div className="bg-background fixed inset-0 z-50 grid place-items-center">
          <Loader2 className="text-muted-foreground size-6 animate-spin" />
        </div>
      )}
      <main
        className={cn(
          "mx-auto min-h-screen max-w-6xl px-4 py-6 transition-opacity duration-300 sm:py-10",
          ready ? "opacity-100" : "opacity-0",
        )}
      >
      <header className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">
            Reference Angle
          </h1>
          <p className="text-muted-foreground text-sm">
            Rotate the head to find faces.
          </p>
        </div>
        {/* mobile: filters behind a button -> modal */}
        <div className="shrink-0 md:hidden">
          <Dialog>
            <DialogTrigger
              render={<Button variant="outline" className="gap-2" />}
            >
              <SlidersHorizontal className="size-4" />
              Filters
            </DialogTrigger>
            <DialogContent>
              <DialogTitle>Filters</DialogTitle>
              <div className="mt-2">
                <FilterBar filters={filters} onChange={setFilters} />
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      {/* desktop: filters inline across the top */}
      <div className="mb-6 hidden md:block">
        <FilterBar filters={filters} onChange={setFilters} />
      </div>

      <div className="flex flex-col gap-5 md:flex-row md:items-start md:gap-10">
        {/* head: small + on top on mobile, left column on desktop */}
        <div className="order-1 md:w-[300px] md:shrink-0">
          <div className="md:sticky md:top-6">
            <div className="mx-auto w-40 md:w-full">
              <HeadViewer
                onPoseChange={onPoseChange}
                onReady={() => setHeadReady(true)}
              />
            </div>
          </div>
        </div>

        <div className="order-2 min-w-0 flex-1 md:order-2">
          <ResultsCarousel results={results} loading={loading} />
        </div>
      </div>
      </main>
    </>
  );
}
