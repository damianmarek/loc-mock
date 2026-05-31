import {
  useState,
  useEffect,
  useCallback,
  useRef,
  type KeyboardEvent,
} from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useDebounce } from "@/lib/use-debounce";
import type { Position } from "@/components/map-view";

const COORD_PATTERN = /^(-?\d+\.?\d*)\s*[,;\s]+\s*(-?\d+\.?\d*)$/;

interface NominatimResult {
  place_id: number;
  lat: string;
  lon: string;
  display_name: string;
}

interface Props {
  onResult: (pos: Position) => void;
}

export default function LocationControls({ onResult }: Props) {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<NominatimResult[]>([]);
  const [open, setOpen] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const debouncedQuery = useDebounce(query, 300);
  const blurTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch suggestions when debounced query changes
  useEffect(() => {
    if (
      !debouncedQuery ||
      debouncedQuery.length < 2 ||
      COORD_PATTERN.test(debouncedQuery)
    ) {
      setSuggestions([]);
      return;
    }

    const controller = new AbortController();

    fetch(
      `https://nominatim.openstreetmap.org/search?format=json&limit=5&q=${encodeURIComponent(debouncedQuery)}`,
      {
        signal: controller.signal,
        headers: { "User-Agent": "loc-mock/1.0" },
      },
    )
      .then((r) => r.json())
      .then((data: NominatimResult[]) => {
        setSuggestions(data);
        if (data.length > 0 && document.activeElement === inputRef.current) {
          setOpen(true);
        }
        setHighlightIndex(-1);
      })
      .catch(() => {});

    return () => controller.abort();
  }, [debouncedQuery]);

  const handleSelect = useCallback(
    (suggestion: NominatimResult) => {
      clearTimeout(blurTimer.current);
      onResult({
        lat: Number.parseFloat(suggestion.lat),
        lng: Number.parseFloat(suggestion.lon),
      });
      setQuery(suggestion.display_name.split(",")[0] ?? suggestion.display_name);
      setOpen(false);
    },
    [onResult],
  );

  const handleSearch = useCallback(async () => {
    const trimmed = query.trim();
    if (!trimmed) return;

    // If dropdown is open and an item is highlighted, select it
    if (open && highlightIndex >= 0 && suggestions[highlightIndex]) {
      handleSelect(suggestions[highlightIndex]);
      return;
    }

    // Check for raw coordinate input
    const coordMatch = trimmed.match(COORD_PATTERN);
    if (coordMatch) {
      const lat = Number.parseFloat(coordMatch[1]!);
      const lng = Number.parseFloat(coordMatch[2]!);
      if (Math.abs(lat) <= 90 && Math.abs(lng) <= 180) {
        onResult({ lat, lng });
        return;
      }
    }

    // Nominatim geocoding
    setLoading(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&limit=5&q=${encodeURIComponent(trimmed)}`,
        { headers: { "User-Agent": "loc-mock/1.0" } },
      );
      const data = (await res.json()) as NominatimResult[];
      if (data.length > 0) {
        const first = data[0]!;
        onResult({
          lat: Number.parseFloat(first.lat),
          lng: Number.parseFloat(first.lon),
        });
        setQuery(first.display_name.split(",")[0] ?? first.display_name);
      } else {
        toast.error("No results found");
      }
    } catch {
      toast.error("Search failed");
    } finally {
      setLoading(false);
    }
  }, [query, onResult, open, highlightIndex, suggestions, handleSelect]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (!open || suggestions.length === 0) {
        if (e.key === "Enter") handleSearch();
        return;
      }

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setHighlightIndex((prev) =>
            prev < suggestions.length - 1 ? prev + 1 : 0,
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          setHighlightIndex((prev) =>
            prev > 0 ? prev - 1 : suggestions.length - 1,
          );
          break;
        case "Enter":
          e.preventDefault();
          if (highlightIndex >= 0 && suggestions[highlightIndex]) {
            handleSelect(suggestions[highlightIndex]);
          } else {
            handleSearch();
          }
          break;
        case "Escape":
          setOpen(false);
          break;
      }
    },
    [open, suggestions, highlightIndex, handleSearch, handleSelect],
  );

  const handleBlur = useCallback(() => {
    blurTimer.current = setTimeout(() => setOpen(false), 150);
  }, []);

  const handleFocus = useCallback(() => {
    if (suggestions.length > 0) setOpen(true);
  }, [suggestions]);

  return (
    <div className="absolute left-4 top-4 z-10 flex gap-2">
      <div className="relative">
        <Input
          ref={inputRef}
          placeholder="Search location or lat, lng..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setHighlightIndex(-1);
          }}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          onBlur={handleBlur}
          className="w-72 bg-background/95 backdrop-blur"
        />
        {open && suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 z-20 max-h-60 overflow-y-auto rounded-md border bg-popover text-popover-foreground shadow-md">
            {suggestions.map((suggestion, i) => (
              <button
                key={suggestion.place_id}
                className={`w-full px-3 py-2 text-left text-sm ${
                  i === highlightIndex
                    ? "bg-accent text-accent-foreground"
                    : ""
                } hover:bg-accent hover:text-accent-foreground`}
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleSelect(suggestion);
                }}
                onMouseEnter={() => setHighlightIndex(i)}
              >
                {suggestion.display_name}
              </button>
            ))}
          </div>
        )}
      </div>
      <Button onClick={handleSearch} disabled={loading}>
        {loading ? "..." : "Search"}
      </Button>
    </div>
  );
}
