"use client";

import { useCallback, useEffect, useState } from "react";
import {
  type CarouselApi,
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

// A thumbnail that keeps showing its current image while a new one (from a new
// search) loads, then swaps once the incoming image is decoded — so moving the
// head never flashes empty/white cells.
function Thumb({
  src,
  onOpen,
}: {
  src: string;
  onOpen: (s: string) => void;
}) {
  const [shown, setShown] = useState(src);
  useEffect(() => {
    if (src === shown) return;
    let cancelled = false;
    const img = new window.Image();
    img.src = src;
    const swap = () => {
      if (!cancelled) setShown(src);
    };
    if (img.decode) img.decode().then(swap).catch(swap);
    else img.onload = swap;
    return () => {
      cancelled = true;
    };
  }, [src, shown]);
  return (
    <button
      type="button"
      onClick={() => onOpen(shown)}
      className="group relative block aspect-square cursor-pointer overflow-hidden rounded-lg border bg-neutral-100"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={shown}
        alt=""
        decoding="async"
        className="size-full object-cover transition duration-300 group-hover:scale-105"
      />
    </button>
  );
}

// desktop: 2x3 grid (6 per slide). mobile: 2x2 grid (4 per slide).
function useSlideSize() {
  const [size, setSize] = useState(6);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const update = () => setSize(mq.matches ? 6 : 4);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return size;
}

export function ResultsCarousel({
  results,
  loading,
}: {
  results: string[];
  loading: boolean;
}) {
  const slideSize = useSlideSize();
  // cap the number shown so the dot row stays reasonable (and never forces the
  // grid wider than the window on mobile)
  const slides = chunk(results.slice(0, 48), slideSize);

  const [api, setApi] = useState<CarouselApi>();
  const [snaps, setSnaps] = useState<number[]>([]);
  const [selected, setSelected] = useState(0);
  const [lightbox, setLightbox] = useState<string | null>(null);

  const onUpdate = useCallback((api: CarouselApi) => {
    if (!api) return;
    setSnaps(api.scrollSnapList());
    setSelected(api.selectedScrollSnap());
  }, []);

  useEffect(() => {
    if (!api) return;
    onUpdate(api);
    api.on("select", onUpdate);
    api.on("reInit", onUpdate);
    return () => {
      api.off("select", onUpdate);
      api.off("reInit", onUpdate);
    };
  }, [api, onUpdate]);

  if (!loading && results.length === 0) {
    return (
      <div className="text-muted-foreground flex h-full min-h-[300px] items-center justify-center text-sm">
        No faces match these filters. Try a different combination.
      </div>
    );
  }

  return (
    <>
    <Carousel setApi={setApi} opts={{ align: "start" }} className="w-full">
      <CarouselContent>
        {slides.map((slide, i) => (
          <CarouselItem key={i}>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
              {slide.map((src, j) => (
                <Thumb key={`${i}-${j}`} src={src} onOpen={setLightbox} />
              ))}
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      {snaps.length > 1 && (
        <div className="mt-4 flex max-w-full flex-wrap justify-center gap-2">
          {snaps.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Go to slide ${i + 1}`}
              aria-current={i === selected}
              onClick={() => api?.scrollTo(i)}
              className={cn(
                "size-2 rounded-full transition-colors",
                i === selected
                  ? "bg-black"
                  : "bg-neutral-300 hover:bg-neutral-400"
              )}
            />
          ))}
        </div>
      )}
    </Carousel>
    <Dialog
      open={!!lightbox}
      onOpenChange={(o) => {
        if (!o) setLightbox(null);
      }}
    >
      <DialogContent className="max-w-[92vw] border-0 bg-transparent p-0 shadow-none sm:max-w-xl">
        <DialogTitle className="sr-only">Face</DialogTitle>
        {lightbox && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            // grid uses 256px; the lightbox loads the larger 512px on demand
            src={lightbox.replace("/images/", "/images/512/")}
            alt=""
            className="aspect-square w-full rounded-xl object-cover shadow-2xl"
          />
        )}
      </DialogContent>
    </Dialog>
    </>
  );
}
