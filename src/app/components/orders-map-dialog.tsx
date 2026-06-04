// Orders → View on Map dialog.
// -----------------------------------------------------------------
// Renders an embedded Leaflet + OpenStreetMap view of the customer
// locations for a set of selected orders. Replaces the previous
// "open Google Maps in a new tab" flow with an in-app modal so the
// distributor stays inside the seller portal while planning their
// delivery route.
//
// • Tiles come from OpenStreetMap — no API key, no quotas.
// • react-leaflet-cluster groups nearby pins into a single round
//   badge with the child count, matching the design reference.
// • Markers are styled as blue/orange rounded teardrops via
//   L.divIcon so we don't ship the raster sprite that ships with
//   the default Leaflet bundle.
// • The header summarises the selected set: order count, distinct
//   location count, total value, and an Online/Offline legend that
//   matches the per-marker colouring.
import { useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import { MapPin, ShoppingBag, X, IndianRupee } from "lucide-react";
import type { Order } from "../lib/orders-data";

// Custom marker shape — blue/orange rounded teardrop with a small
// white center dot. Inline HTML keeps us off the default Leaflet
// raster sprite (which 404s under most bundlers without extra wiring).
function buildOrderIcon(connectivity: "Online" | "Offline" | undefined): L.DivIcon {
  const color = connectivity === "Offline" ? "#f97316" : "#2563eb"; // orange-500 / blue-600
  return L.divIcon({
    className: "qwipo-order-marker",
    html: `
      <div style="
        width: 28px; height: 28px;
        background: ${color};
        border: 3px solid #ffffff;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        box-shadow: 0 2px 6px rgba(0,0,0,0.30);
        display: flex; align-items: center; justify-content: center;
      ">
        <div style="
          transform: rotate(45deg);
          width: 6px; height: 6px;
          background: #ffffff;
          border-radius: 50%;
        "></div>
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 28],
    popupAnchor: [0, -28],
  });
}

// Cluster icon factory — same rounded-teardrop shape with the child
// count rendered in white. Receives a cluster object from
// react-leaflet-cluster (typed loosely because the library doesn't
// ship a tight type for the callback parameter).
const buildClusterIcon = (cluster: { getChildCount: () => number }) => {
  const count = cluster.getChildCount();
  // Slightly bigger for clusters of 5+, gives more visual weight to
  // the heavier locations on the map.
  const size = count >= 5 ? 40 : 34;
  return L.divIcon({
    className: "qwipo-cluster-marker",
    html: `
      <div style="
        width: ${size}px; height: ${size}px;
        background: #2563eb;
        border: 3px solid #ffffff;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        box-shadow: 0 2px 8px rgba(0,0,0,0.35);
        display: flex; align-items: center; justify-content: center;
        color: white;
      ">
        <span style="
          transform: rotate(45deg);
          font-weight: 700;
          font-size: ${count >= 100 ? 11 : 13}px;
          font-family: ui-sans-serif, system-ui, sans-serif;
        ">${count}</span>
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
  });
};

const HYDERABAD_CENTER: [number, number] = [17.385, 78.486];

export interface OrdersMapDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** The orders the seller selected from the list (any subset). */
  orders: Order[];
  /** Short context label rendered under the title — typically the
   *  tab the seller is operating from ("Ready for Planning",
   *  "Confirmed Deliveries", etc.). */
  contextLabel: string;
}

export function OrdersMapDialog({
  open,
  onOpenChange,
  orders,
  contextLabel,
}: OrdersMapDialogProps) {
  // Keep only orders we can actually pin on the map.
  const mappable = useMemo(
    () =>
      orders.filter(
        (o) =>
          typeof o.buyerLat === "number" &&
          typeof o.buyerLng === "number",
      ),
    [orders],
  );

  // Distinct lat/lng pairs (rounded to 3 dp ≈ 110 m) — same notion
  // the screenshot uses ("10 locations" for 27 orders).
  const locationCount = useMemo(() => {
    const set = new Set<string>();
    for (const o of mappable) {
      set.add(`${o.buyerLat!.toFixed(3)},${o.buyerLng!.toFixed(3)}`);
    }
    return set.size;
  }, [mappable]);

  const totalValue = useMemo(
    () => mappable.reduce((s, o) => s + (o.orderValue || 0), 0),
    [mappable],
  );

  // Centre the map on the centroid of the pinned orders so the
  // initial view always frames the data. Fall back to Hyderabad
  // when nothing is pinnable.
  const center = useMemo<[number, number]>(() => {
    if (mappable.length === 0) return HYDERABAD_CENTER;
    const lat =
      mappable.reduce((s, o) => s + (o.buyerLat ?? 0), 0) / mappable.length;
    const lng =
      mappable.reduce((s, o) => s + (o.buyerLng ?? 0), 0) / mappable.length;
    return [lat, lng];
  }, [mappable]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="!max-w-[min(1200px,calc(100vw-2rem))] p-0 overflow-hidden h-[80vh] flex flex-col gap-0"
      >
        {/* Header — title + context on the left, legend / counts /
            close on the right. Matches the reference screenshot. */}
        <div className="flex items-center justify-between gap-4 px-4 py-3 bg-white border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="bg-blue-600 p-2 rounded-lg flex-shrink-0">
              <MapPin className="h-5 w-5 text-white" />
            </div>
            <div className="min-w-0">
              <DialogTitle className="text-base font-semibold text-gray-900 leading-tight truncate">
                Orders Map View
              </DialogTitle>
              <DialogDescription className="text-xs text-gray-500 truncate">
                {contextLabel}
              </DialogDescription>
            </div>
          </div>
          <div className="flex items-center gap-5 text-sm flex-shrink-0">
            <div className="inline-flex items-center gap-1.5 text-gray-700">
              <ShoppingBag className="h-4 w-4 text-blue-600" />
              <span className="font-semibold tabular-nums">{mappable.length}</span>
              <span className="text-gray-500">orders</span>
            </div>
            <div className="inline-flex items-center gap-1.5 text-gray-700">
              <MapPin className="h-4 w-4 text-blue-600" />
              <span className="font-semibold tabular-nums">{locationCount}</span>
              <span className="text-gray-500">locations</span>
            </div>
            <div className="inline-flex items-center gap-1.5 text-gray-700">
              <IndianRupee className="h-4 w-4 text-blue-600" />
              <span className="font-semibold tabular-nums">
                {totalValue.toLocaleString("en-IN")}
              </span>
              <span className="text-gray-500">total value</span>
            </div>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="ml-1 text-gray-400 hover:text-gray-700 transition-colors"
              aria-label="Close map view"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Map body */}
        <div className="flex-1 relative bg-gray-100">
          {mappable.length === 0 ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-center px-6">
              <MapPin className="h-8 w-8 text-gray-300" />
              <p className="text-sm font-medium text-gray-600">
                No buyer locations to display
              </p>
              <p className="text-xs text-gray-500 max-w-sm">
                None of the selected orders has a recorded customer location.
                Coordinates are captured by the buyer app when an order is
                placed.
              </p>
            </div>
          ) : (
            <MapContainer
              center={center}
              zoom={11}
              scrollWheelZoom
              className="h-full w-full"
              style={{ zIndex: 0 }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <MarkerClusterGroup
                iconCreateFunction={buildClusterIcon}
                showCoverageOnHover={false}
                maxClusterRadius={50}
                spiderfyOnMaxZoom
              >
                {mappable.map((o) => (
                  <Marker
                    key={o.id}
                    position={[o.buyerLat!, o.buyerLng!]}
                    icon={buildOrderIcon(o.connectivity)}
                  >
                    <Popup>
                      <div className="space-y-1 text-xs">
                        <p className="font-semibold text-gray-900 leading-tight">
                          {o.retailerName}
                        </p>
                        <p className="text-gray-500 font-mono">{o.id}</p>
                        <p className="text-gray-700">
                          ₹{(o.orderValue || 0).toLocaleString("en-IN")} · {o.paymentMode}
                        </p>
                        {o.buyerAddress && (
                          <p className="text-gray-600 max-w-[220px]">
                            {o.buyerAddress}
                          </p>
                        )}
                        {o.connectivity && (
                          <p className="text-[10px] uppercase tracking-wide font-semibold text-gray-500">
                            {o.connectivity}
                          </p>
                        )}
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MarkerClusterGroup>
            </MapContainer>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
