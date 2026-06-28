"use client";

import { Check, ChevronsUpDown } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { ATTRIBUTES } from "@/lib/query";
import { cn } from "@/lib/utils";

export interface Filters {
  emotion: string;
  gender: string;
  ageLow: number;
  ageHigh: number;
  must: string[];
}

const EMOTIONS = [
  "any",
  "happy",
  "sad",
  "angry",
  "confused",
  "disgusted",
  "surprised",
  "calm",
];

export function FilterBar({
  filters,
  onChange,
}: {
  filters: Filters;
  onChange: (next: Filters) => void;
}) {
  const set = (patch: Partial<Filters>) => onChange({ ...filters, ...patch });

  const toggleAttr = (key: string) => {
    const has = filters.must.includes(key);
    set({
      must: has
        ? filters.must.filter((k) => k !== key)
        : [...filters.must, key],
    });
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Emotion */}
      <Select
        value={filters.emotion}
        onValueChange={(v) => set({ emotion: v ?? "any" })}
      >
        <SelectTrigger className="h-9 w-[130px]">
          <SelectValue placeholder="Emotion">
            {(v: string) =>
              v && v !== "any" ? (
                <span className="capitalize">{v}</span>
              ) : (
                "Any emotion"
              )
            }
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {EMOTIONS.map((e) => (
            <SelectItem key={e} value={e} className="capitalize">
              {e === "any" ? "Any emotion" : e}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Gender */}
      <Select
        value={filters.gender}
        onValueChange={(v) => set({ gender: v ?? "any" })}
      >
        <SelectTrigger className="h-9 w-[120px]">
          <SelectValue placeholder="Gender">
            {(v: string) =>
              v && v !== "any" ? (
                <span className="capitalize">{v}</span>
              ) : (
                "Any gender"
              )
            }
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="any">Any gender</SelectItem>
          <SelectItem value="male">Male</SelectItem>
          <SelectItem value="female">Female</SelectItem>
        </SelectContent>
      </Select>

      {/* Age range */}
      <div className="bg-background flex h-9 items-center gap-3 rounded-md border px-3">
        <span className="text-muted-foreground shrink-0 text-xs font-medium">
          Age
        </span>
        <Slider
          value={[filters.ageLow, filters.ageHigh]}
          min={5}
          max={90}
          step={1}
          minStepsBetweenValues={1}
          onValueChange={(val) => {
            const [low, high] = val as number[];
            set({ ageLow: low, ageHigh: high });
          }}
          className="w-32"
        />
        <span className="text-foreground/80 w-11 shrink-0 text-right text-xs tabular-nums">
          {filters.ageLow}–{filters.ageHigh}
        </span>
      </div>

      {/* Boolean attributes combo box */}
      <Popover>
        <PopoverTrigger
          render={
            <Button
              variant="outline"
              className="h-9 justify-between gap-2 font-normal"
            />
          }
        >
          {filters.must.length > 0 ? (
            <span className="flex items-center gap-1">
              Attributes
              <Badge variant="secondary" className="rounded-sm px-1">
                {filters.must.length}
              </Badge>
            </span>
          ) : (
            <span className="text-muted-foreground">Attributes</span>
          )}
          <ChevronsUpDown className="size-4 opacity-50" />
        </PopoverTrigger>
        <PopoverContent className="w-56 p-0" align="start">
          <Command>
            <CommandList>
              <CommandEmpty>No attribute.</CommandEmpty>
              <CommandGroup>
                {ATTRIBUTES.map((attr) => {
                  const active = filters.must.includes(attr.key);
                  return (
                    <CommandItem
                      key={attr.key}
                      value={attr.label}
                      onSelect={() => toggleAttr(attr.key)}
                    >
                      <div
                        className={cn(
                          "border-primary mr-2 flex size-4 items-center justify-center rounded-sm border",
                          active
                            ? "bg-primary text-primary-foreground"
                            : "opacity-50",
                        )}
                      >
                        {active && <Check className="size-3" />}
                      </div>
                      {attr.label}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {filters.must.length > 0 && (
        <Button
          variant="ghost"
          className="text-muted-foreground h-9 px-2 text-xs"
          onClick={() => set({ must: [] })}
        >
          Clear
        </Button>
      )}
    </div>
  );
}
