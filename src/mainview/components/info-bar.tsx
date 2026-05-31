import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { rpc } from "@/lib/rpc";
import type { Position } from "@/components/map-view";

interface Props {
  marker: Position | null;
}

export default function InfoBar({ marker }: Props) {
  const [setting, setSetting] = useState(false);

  const handleSet = useCallback(async () => {
    if (!marker) return;
    setSetting(true);
    try {
      const res = await rpc.request.setLocation({
        lat: marker.lat,
        lng: marker.lng,
      });
      if (res.success) {
        toast.success(res.message);
      } else {
        toast.error(res.message);
      }
    } catch {
      toast.error("Failed to set location");
    } finally {
      setSetting(false);
    }
  }, [marker]);

  const handleClear = useCallback(async () => {
    try {
      const res = await rpc.request.clearLocation({});
      if (res.success) {
        toast.success(res.message);
      } else {
        toast.error(res.message);
      }
    } catch {
      toast.error("Failed to clear location");
    }
  }, []);

  return (
    <div className="absolute bottom-4 left-4 right-4 z-10 flex items-center justify-between rounded-lg border bg-background/95 px-4 py-3 backdrop-blur">
      <span className="text-sm text-muted-foreground">
        {marker
          ? `Lat: ${marker.lat.toFixed(6)}, Lng: ${marker.lng.toFixed(6)}`
          : "Click the map or search for a location"}
      </span>
      <div className="flex gap-2">
        <Button onClick={handleSet} disabled={!marker || setting}>
          Set Location
        </Button>
        <Button variant="destructive" onClick={handleClear}>
          Clear Location
        </Button>
      </div>
    </div>
  );
}
