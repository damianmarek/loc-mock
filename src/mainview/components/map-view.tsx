import { forwardRef, useCallback, useImperativeHandle, useRef } from "react";
import Map, { Marker, type MapRef } from "react-map-gl/maplibre";
import type {
  MapLayerMouseEvent,
  MarkerDragEvent,
} from "react-map-gl/maplibre";

const MAP_STYLE = {
  version: 8 as const,
  sources: {
    "osm-raster": {
      type: "raster" as const,
      tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
      tileSize: 256,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    },
  },
  layers: [
    {
      id: "osm-tiles",
      type: "raster" as const,
      source: "osm-raster",
    },
  ],
};

export interface Position {
  lat: number;
  lng: number;
}

export interface MapViewHandle {
  flyTo: (pos: Position) => void;
}

interface Props {
  marker: Position | null;
  onSetMarker: (pos: Position) => void;
}

const MapView = forwardRef<MapViewHandle, Props>(({ marker, onSetMarker }, ref) => {
  const mapRef = useRef<MapRef>(null);

  useImperativeHandle(
    ref,
    () => ({
      flyTo: (pos: Position) => {
        mapRef.current?.flyTo({
          center: [pos.lng, pos.lat],
          zoom: 10,
          duration: 300,
        });
      },
    }),
    [],
  );

  const handleMapClick = useCallback(
    (e: MapLayerMouseEvent) => {
      onSetMarker({ lat: e.lngLat.lat, lng: e.lngLat.lng });
    },
    [onSetMarker],
  );

  const handleDragEnd = useCallback(
    (e: MarkerDragEvent) => {
      onSetMarker({ lat: e.lngLat.lat, lng: e.lngLat.lng });
    },
    [onSetMarker],
  );

  return (
    <Map
      ref={mapRef}
      mapStyle={MAP_STYLE}
      initialViewState={{
        longitude: 19.0,
        latitude: 52.0,
        zoom: 6,
      }}
      onClick={handleMapClick}
      style={{ width: "100%", height: "100%" }}
    >
      {marker && (
        <Marker
          longitude={marker.lng}
          latitude={marker.lat}
          draggable
          onDragEnd={handleDragEnd}
          color="#e11d48"
        />
      )}
    </Map>
  );
});

export default MapView;
