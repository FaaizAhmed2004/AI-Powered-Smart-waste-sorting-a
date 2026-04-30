import { useEffect, useMemo, useState } from "react";
import { MapPin, Navigation, Clock, Phone, ExternalLink, RefreshCw, Navigation2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  getRecyclingCenters,
  getNearestRecyclingCenters,
  getWasteTypes,
  type RecyclingCenter,
  type WasteType
} from "@/services/location";

const MAPTILER_KEY = "3ICfm0j8TB623KZhGyzd";

const buildMapTilerUrl = (lat: number, lng: number, zoom = 13) =>
  `https://api.maptiler.com/maps/hybrid-v4/?key=${MAPTILER_KEY}#${zoom}/${lat}/${lng}`;

const Location = () => {
  const [recyclingCenters, setRecyclingCenters] = useState<RecyclingCenter[]>([]);
  const [wasteTypes, setWasteTypes] = useState<WasteType[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [mapLoading, setMapLoading] = useState(false);
  const [selectedCenter, setSelectedCenter] = useState<RecyclingCenter | null>(null);

  const mapCenter = selectedCenter?.location || userLocation || { lat: 24.8607, lng: 67.0011 };

  const mapSrc = useMemo(
    () => buildMapTilerUrl(mapCenter.lat, mapCenter.lng, 12),
    [mapCenter.lat, mapCenter.lng]
  );

  useEffect(() => {
    loadLocationData();
  }, []);

  useEffect(() => {
    if (!selectedCenter && recyclingCenters.length > 0) {
      setSelectedCenter(recyclingCenters[0]);
    }
  }, [recyclingCenters, selectedCenter]);

  const loadLocationData = async () => {
    try {
      setLoading(true);

      const wasteTypesResponse = await getWasteTypes();
      if (wasteTypesResponse.success) {
        setWasteTypes(wasteTypesResponse.data);
      }

      const centersResponse = await getRecyclingCenters();
      if (centersResponse.success) {
        setRecyclingCenters(centersResponse.data.centers);
      }

      requestUserLocation();
    } catch (error) {
      console.error("Failed to load location data:", error);
      toast.error("Failed to load location data");
    } finally {
      setLoading(false);
    }
  };

  const requestUserLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }

    setMapLoading(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setUserLocation(location);

        try {
          const nearestResponse = await getNearestRecyclingCenters({
            latitude: location.lat,
            longitude: location.lng,
            radius: 10000,
          });

          if (nearestResponse.success) {
            setRecyclingCenters(nearestResponse.data);
            if (nearestResponse.data.length > 0) {
              setSelectedCenter(nearestResponse.data[0]);
            }
          }
        } catch (error) {
          console.error("Failed to load nearest centers:", error);
          toast.error("Unable to load nearest recycling centers.");
        } finally {
          setMapLoading(false);
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        let message = "Unable to get your location. Please allow location access.";
        if (error.code === error.PERMISSION_DENIED) {
          message = "Location access denied. Enable location permissions to find nearby recycling centers.";
        }
        toast.error(message);
        setMapLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
    );
  };

  const handleCenterSelect = (center: RecyclingCenter) => {
    setSelectedCenter(center);
  };

  const isMobileDevice = (): boolean => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  };

  const openNativeNavigation = (center: RecyclingCenter) => {
    if (!userLocation) {
      toast.error("Your location is not available. Please enable location access.");
      return;
    }

    const destLat = center.location.lat;
    const destLng = center.location.lng;
    const originLat = userLocation.lat;
    const originLng = userLocation.lng;

    // Detect iOS vs Android
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

    if (isIOS) {
      // Apple Maps URL scheme
      const mapsUrl = `maps://maps.apple.com/?saddr=${originLat},${originLng}&daddr=${destLat},${destLng}&dirflg=d`;
      window.location.href = mapsUrl;
    } else {
      // Google Maps URL scheme for Android
      const mapsUrl = `google.navigation:q=${destLat},${destLng}`;
      window.location.href = mapsUrl;
    }
  };

  const openGoogleMapsWeb = (center: RecyclingCenter) => {
    if (!userLocation) {
      toast.error("Your location is not available. Please enable location access.");
      return;
    }

    const destLat = center.location.lat;
    const destLng = center.location.lng;
    const originLat = userLocation.lat;
    const originLng = userLocation.lng;

    // Google Maps web URL with directions
    const mapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${originLat},${originLng}&destination=${destLat},${destLng}&travelmode=driving`;
    window.open(mapsUrl, "_blank", "noopener,noreferrer");
  };

  const handleOpenDirections = (center: RecyclingCenter) => {
    setSelectedCenter(center);
    
    if (isMobileDevice()) {
      // Try native navigation first
      openNativeNavigation(center);
    } else {
      // Fallback to Google Maps web on desktop
      openGoogleMapsWeb(center);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary/50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary/20 border-t-primary mx-auto mb-6"></div>
          <p className="text-muted-foreground text-lg font-medium">Loading recycling centers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Nearby Centers</h1>
          <p className="text-muted-foreground mt-1">Find recycling centers near you and get turn-by-turn directions.</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={requestUserLocation}
            disabled={mapLoading}
          >
            <RefreshCw className={`w-4 h-4 ${mapLoading ? 'animate-spin' : ''}`} />
            {mapLoading ? "Updating..." : "My Location"}
          </Button>
          {recyclingCenters.length > 0 && (
            <Button
              variant="default"
              size="sm"
              className="gap-2 bg-gradient-primary hover:shadow-glow text-white"
              onClick={() => handleOpenDirections(recyclingCenters[0])}
            >
              <Navigation2 className="w-4 h-4" />
              Navigate to Nearest
            </Button>
          )}
        </div>
      </div>

      <Card className="overflow-hidden rounded-3xl border border-border/50 shadow-lg">
        <div className="relative h-72 w-full">
          <iframe
            title="Recycling centers map"
            src={mapSrc}
            className="h-full w-full border-0"
            loading="lazy"
            referrerPolicy="no-referrer"
          />
          <div className="absolute right-4 top-4 rounded-full bg-background/90 px-3 py-2 text-xs font-medium text-foreground shadow-lg">
            {selectedCenter ? `Viewing: ${selectedCenter.name}` : "Map view"}
          </div>
        </div>
      </Card>

      <div>
        <h2 className="text-sm font-semibold text-foreground mb-3">Filter by Waste Type</h2>
        <div className="flex flex-wrap gap-2">
          {wasteTypes.map((item) => (
            <Badge
              key={item.type}
              variant="outline"
              className="cursor-pointer hover:bg-accent transition-colors"
            >
              <div className={`w-2 h-2 rounded-full ${item.color} mr-2`} />
              {item.type}
            </Badge>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Recycling Centers</h2>
        {recyclingCenters.length === 0 ? (
          <div className="rounded-2xl border border-border/50 bg-background p-6 text-sm text-muted-foreground">
            No recycling centers found yet. Allow location access or refresh to load centers.
          </div>
        ) : (
          recyclingCenters.map((center) => (
            <Card
              key={center.id}
              className={`overflow-hidden border ${selectedCenter?.id === center.id ? "border-primary bg-primary/5" : "border-border/30 bg-card"}`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <CardTitle className="text-lg flex flex-wrap items-center gap-2">
                      {center.name}
                      {center.isOpen ? (
                        <Badge variant="default" className="bg-green-600 text-white">
                          Open
                        </Badge>
                      ) : (
                        <Badge variant="secondary">Closed</Badge>
                      )}
                    </CardTitle>
                    <CardDescription className="mt-1 flex items-center gap-1 text-muted-foreground">
                      <MapPin className="w-3 h-3" />
                      {center.distance} away
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  <p>{center.address}</p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {center.types.map((type) => {
                    const typeColor = wasteTypes.find((t) => t.type === type)?.color || "bg-muted";
                    return (
                      <Badge key={type} variant="secondary" className="text-xs">
                        <div className={`w-2 h-2 rounded-full ${typeColor} mr-1.5`} />
                        {type}
                      </Badge>
                    );
                  })}
                </div>

                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {center.hours}
                  </div>
                  <div className="flex items-center gap-1">
                    <Phone className="w-4 h-4" />
                    {center.phone}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 pt-2">
                  <Button
                    variant="default"
                    className="flex-1 gap-2 bg-gradient-primary hover:shadow-glow text-white font-semibold"
                    size="sm"
                    onClick={() => handleOpenDirections(center)}
                  >
                    <Navigation2 className="w-4 h-4" />
                    Navigate Here
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    onClick={() => handleCenterSelect(center)}
                  >
                    <MapPin className="w-4 h-4" />
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default Location;
