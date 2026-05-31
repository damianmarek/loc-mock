import { useState, useRef, useCallback } from "react";
import { Toaster } from "@/components/ui/sonner";
import MapView, { type Position, type MapViewHandle } from "@/components/map-view";
import LocationControls from "@/components/location-controls";
import InfoBar from "@/components/info-bar";

export default function App() {
  const mapRef = useRef<MapViewHandle>(null);
  const [marker, setMarker] = useState<Position | null>(null);

  const handleResult = useCallback((pos: Position) => {
    setMarker(pos);
    mapRef.current?.flyTo(pos);
  }, []);

  return (
    <div className="relative h-screen w-screen overflow-hidden">
      <MapView ref={mapRef} marker={marker} onSetMarker={setMarker} />
      <LocationControls onResult={handleResult} />
      <InfoBar marker={marker} />
      <Toaster position="bottom-right" offset="6rem" style={{ right: "1rem" }} />
    </div>
  );
}
