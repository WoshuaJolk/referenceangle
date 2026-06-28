"use client";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

export function ResultsCarousel({
  results,
  loading,
}: {
  results: string[];
  loading: boolean;
}) {
  const slides = chunk(results, 4);

  if (!loading && results.length === 0) {
    return (
      <div className="text-muted-foreground flex h-full min-h-[300px] items-center justify-center text-sm">
        No faces match these filters. Try a different combination.
      </div>
    );
  }

  return (
    <Carousel
      opts={{ align: "start" }}
      className="w-full"
    >
      <CarouselContent>
        {slides.map((slide, i) => (
          <CarouselItem key={i}>
            <div className="grid grid-cols-2 gap-3">
              {slide.map((src) => (
                <a
                  key={src}
                  href={src}
                  target="_blank"
                  rel="noreferrer"
                  className="group relative block aspect-square overflow-hidden rounded-lg border bg-neutral-100"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={src}
                    alt=""
                    loading="lazy"
                    className="size-full object-cover transition duration-300 group-hover:scale-105"
                  />
                </a>
              ))}
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="hidden sm:flex" />
      <CarouselNext className="hidden sm:flex" />
    </Carousel>
  );
}
