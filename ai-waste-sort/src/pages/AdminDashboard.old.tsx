import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Users,
  FileImage,
  Shield,
  Search,
  MoreHorizontal,
  Trash2,
  UserX,
  UserCheck,
  LogOut,
  Activity,
  TrendingUp,
  BarChart3,
  PieChart,
  Calendar,
  Eye,
  Download,
  RefreshCw,
  MapPin,
  Navigation
} from "lucide-react";

declare global {
  interface Window {
    initAdminMap?: () => void;
    google?: any;
  }
}

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import {
  getCurrentAdmin,
  isAdminAuthenticated,
  adminLogout,
  getDashboardStats,
  getAllUsers,
  getAllClassifications,
  updateUserStatus,
  deleteUser,
  deleteClassification,
  type DashboardStats,
  type UserWithStats,
  type ClassificationWithUser
} from "@/services/admin";

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [users, setUsers] = useState<UserWithStats[]>([]);
  const [classifications, setClassifications] = useState<ClassificationWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; type: 'user' | 'classification'; id: string; name: string }>({
    open: false,
    type: 'user',
    id: '',
    name: ''
  });
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [nearestCenters, setNearestCenters] = useState<Array<{ id: string; name: string; address: string; rating: number; location: { lat: number; lng: number } }>>([]);
  const [selectedCenterId, setSelectedCenterId] = useState<string | null>(null);
  const [mapLoading, setMapLoading] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<any>(null);
  const importMeta = import.meta as unknown as { env?: { VITE_GOOGLE_MAPS_API_KEY?: string } };
  const googleMapsApiKey = importMeta.env?.VITE_GOOGLE_MAPS_API_KEY || "AIzaSyAOVYRIgupAurZup5y1PRh8Ismb1A3lLao";

  const navigate = useNavigate();
  const admin = getCurrentAdmin();

  useEffect(() => {
    if (!isAdminAuthenticated()) {
      navigate("/admin/login");
      return;
    }
    loadDashboardData();
  }, [navigate]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Load data with individual error handling
      let statsData = null;
      let usersData = { users: [], pagination: { currentPage: 1, totalPages: 0, totalUsers: 0, hasNext: false, hasPrev: false } };
      let classificationsData = { classifications: [], pagination: { currentPage: 1, totalPages: 0, totalClassifications: 0, hasNext: false, hasPrev: false } };

      try {
        statsData = await getDashboardStats();
        setStats(statsData);
      } catch (error) {
        console.error("Failed to load stats:", error);
        toast.error("Failed to load dashboard statistics");
      }

      try {
        usersData = await getAllUsers({ page: 1, limit: 10 });
        setUsers(usersData.users || []);
      } catch (error) {
        console.error("Failed to load users:", error);
        toast.error("Failed to load users data");
      }

      try {
        classificationsData = await getAllClassifications({ page: 1, limit: 10 });
        setClassifications(classificationsData.classifications || []);
      } catch (error) {
        console.error("Failed to load classifications:", error);
        toast.error("Failed to load classifications data");
      }

    } catch (error) {
      console.error("Failed to load dashboard data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await adminLogout();
      toast.success("Logged out successfully");
      navigate("/admin/login");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Logout failed");
    }
  };

  const calculateDistance = (from: { lat: number; lng: number }, to: { lat: number; lng: number }) => {
    const toRadians = (value: number) => (value * Math.PI) / 180;
    const earthRadius = 6371;
    const dLat = toRadians(to.lat - from.lat);
    const dLng = toRadians(to.lng - from.lng);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRadians(from.lat)) * Math.cos(toRadians(to.lat)) * Math.sin(dLng / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return earthRadius * c;
  };

  const loadGoogleMapsScript = (location: { lat: number; lng: number }) => {
    const googleWindow = window;

    if (googleWindow.google && googleWindow.google.maps) {
      initializeMap(location);
      return;
    }

    if (document.getElementById("googleMapsAdmin")) {
      return;
    }

    googleWindow.initAdminMap = () => initializeMap(location);
    const script = document.createElement("script");
    script.id = "googleMapsAdmin";
    script.src = `https://maps.googleapis.com/maps/api/js?key=${googleMapsApiKey}&libraries=places&callback=initAdminMap`;
    script.async = true;
    script.defer = true;
    script.onerror = () => {
      console.error("Failed to load Google Maps API");
      setMapError("Unable to load Google Maps API. Please check your API key and network.");
      setMapLoading(false);
    };
    document.body.appendChild(script);
  };

  const initializeMap = (location: { lat: number; lng: number }) => {
    const googleWindow = window;
    const google = googleWindow.google;

    if (!mapRef.current || !google?.maps) {
      setMapError("Google Maps is not available yet.");
      setMapLoading(false);
      return;
    }

    try {
      const map = new google.maps.Map(mapRef.current, {
        center: location,
        zoom: 12,
        mapTypeControl: false,
        fullscreenControl: false,
      });

      mapInstanceRef.current = map;

      new google.maps.Marker({
        position: location,
        map,
        title: "Your current location",
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          fillColor: "#0f766e",
          fillOpacity: 1,
          strokeColor: "#ffffff",
          strokeWeight: 2,
          scale: 7,
        },
      });

      refreshNearestCenters(map, location);
    } catch (error) {
      console.error("Error initializing map:", error);
      setMapError("Failed to initialize map. Please try again.");
      setMapLoading(false);
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const refreshNearestCenters = (map: any, location: { lat: number; lng: number }) => {
    const googleWindow = window;
    const google = googleWindow.google;
    if (!google?.maps?.places) {
      setMapError("Places library is not available.");
      setMapLoading(false);
      return;
    }

    try {
      const service = new google.maps.places.PlacesService(map);
      service.nearbySearch(
        {
          location,
          radius: 15000,
          keyword: "recycling center",
          type: ["establishment"],
        },
        (results: any[], status: string) => {
          setMapLoading(false);
          if (status !== google.maps.places.PlacesServiceStatus.OK || !results) {
            setMapError("No live recycling centers were found nearby.");
            return;
          }

          const centers = results.slice(0, 5).map((result) => ({
            id: result.place_id,
            name: result.name,
            address: result.vicinity || result.formatted_address || "Address unavailable",
            rating: result.rating || 0,
            location: {
              lat: result.geometry.location.lat(),
              lng: result.geometry.location.lng(),
            },
          }));

          setNearestCenters(centers);
          setSelectedCenterId(centers[0]?.id || null);

          centers.forEach((center) => {
            try {
              new google.maps.Marker({
                position: center.location,
                map,
                title: center.name,
              });
            } catch (markerError) {
              console.error("Error creating marker:", markerError);
            }
          });
        }
      );
    } catch (error) {
      console.error("Error in refreshNearestCenters:", error);
      setMapError("Failed to search for recycling centers.");
      setMapLoading(false);
    }
  };
  const requestUserLocation = () => {
    if (!navigator.geolocation) {
      setMapError("Geolocation is not supported by your browser.");
      return;
    }

    setMapLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setUserLocation(location);
        setMapError(null); // Clear any previous errors
      },
      (error) => {
        console.error("Geolocation error:", error);
        let errorMessage = "Unable to get your location.";
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Location access denied. Please allow location access to see recycling centers.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location information is unavailable.";
            break;
          case error.TIMEOUT:
            errorMessage = "Location request timed out.";
            break;
        }
        setMapError(errorMessage);
        setMapLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
    );
  };

  const handleRecenterToNearest = () => {
    if (!mapInstanceRef.current || !selectedCenterId || !nearestCenters.length) return;
    const center = nearestCenters.find((item) => item.id === selectedCenterId);
    if (center) {
      mapInstanceRef.current.panTo(center.location);
      mapInstanceRef.current.setZoom(14);
    }
  };

  useEffect(() => {
    if (userLocation) {
      loadGoogleMapsScript(userLocation);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userLocation]);

  useEffect(() => {
    if (!loading && !userLocation) {
      requestUserLocation();
    }
  }, [loading, userLocation]);

  const handleUserStatusToggle = async (userId: string, currentStatus: boolean) => {
    try {
      await updateUserStatus(userId, !currentStatus);
      setUsers(prev => prev.map(user =>
        user._id === userId ? {
          ...user,
          accountConfimation: {
            ...user.accountConfimation,
            status: !currentStatus
          }
        } : user
      ));
      toast.success(`User ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
    } catch (error) {
      console.error("Failed to update user status:", error);
      toast.error("Failed to update user status");
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      if (deleteDialog.type === 'user') {
        await deleteUser(deleteDialog.id);
        setUsers(prev => prev.filter(user => user._id !== deleteDialog.id));
        toast.success("User deleted successfully");
      } else {
        await deleteClassification(deleteDialog.id);
        setClassifications(prev => prev.filter(cls => cls._id !== deleteDialog.id));
        toast.success("Classification deleted successfully");
      }
      setDeleteDialog({ open: false, type: 'user', id: '', name: '' });
    } catch (error) {
      console.error("Delete failed:", error);
      toast.error("Delete operation failed");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary/50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary/20 border-t-primary mx-auto mb-6"></div>
          <p className="text-muted-foreground text-lg font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Provide default test data if stats is null
  const displayStats = stats || {
    overview: {
      totalUsers: 0,
      totalClassifications: 0,
      totalAdmins: 1,
      activeUsers: 0
    },
    recentActivity: {
      recentUsers: [],
      recentClassifications: []
    },
    analytics: {
      classificationsByCategory: [],
      userRegistrationsByMonth: []
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/50">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Welcome Header */}
        <div className="bg-gradient-hero rounded-2xl p-8 text-foreground shadow-xl border border-border/20">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Admin Dashboard
              </h1>
              <p className="text-muted-foreground text-lg">
                Monitor and manage your waste sorting platform
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <div className="text-right">
                <p className="text-sm text-muted-foreground font-medium">Welcome back</p>
                <p className="font-bold text-foreground text-lg">{admin?.firstName || admin?.lastName || admin?.email}</p>
                <Badge variant={admin?.role === 'super_admin' ? 'default' : 'secondary'} className="mt-2">
                  {admin?.role === 'super_admin' ? 'Super Admin' : 'Admin'}
                </Badge>
              </div>
              <Button
                variant="outline"
                onClick={handleLogout}
                className="border-primary/30 text-primary hover:bg-primary/5 hover:border-primary font-semibold shadow-sm"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-6 bg-gradient-card border border-border/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] group">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center shadow-md group-hover:shadow-glow transition-shadow">
                <Users className="w-6 h-6 text-primary-foreground" />
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-foreground">{displayStats?.overview?.totalUsers || 0}</p>
                <p className="text-sm text-muted-foreground font-medium">Total Users</p>
              </div>
            </div>
            <div className="w-full bg-secondary/50 rounded-full h-2">
              <div className="bg-gradient-primary h-2 rounded-full" style={{width: '100%'}}></div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-card border border-border/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] group">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-accent rounded-xl flex items-center justify-center shadow-md group-hover:shadow-glow transition-shadow">
                <FileImage className="w-6 h-6 text-accent-foreground" />
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-foreground">{displayStats?.overview?.totalClassifications || 0}</p>
                <p className="text-sm text-muted-foreground font-medium">Classifications</p>
              </div>
            </div>
            <div className="w-full bg-secondary/50 rounded-full h-2">
              <div className="bg-gradient-accent h-2 rounded-full" style={{width: '100%'}}></div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-card border border-border/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] group">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-success to-success/80 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-glow transition-shadow">
                <Activity className="w-6 h-6 text-success-foreground" />
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-foreground">{displayStats?.overview?.activeUsers || 0}</p>
                <p className="text-sm text-muted-foreground font-medium">Active Users</p>
              </div>
            </div>
            <div className="w-full bg-secondary/50 rounded-full h-2">
              <div className="bg-success/50 h-2 rounded-full" style={{width: `${displayStats?.overview?.totalUsers ? ((displayStats.overview.activeUsers || 0) / displayStats.overview.totalUsers) * 100 : 0}%`}}></div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-card border border-border/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] group">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-warning to-warning/80 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-glow transition-shadow">
                <Shield className="w-6 h-6 text-warning-foreground" />
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-foreground">{displayStats?.overview?.totalAdmins || 0}</p>
                <p className="text-sm text-muted-foreground font-medium">Admins</p>
              </div>
            </div>
            <div className="w-full bg-secondary/50 rounded-full h-2">
              <div className="bg-warning/50 h-2 rounded-full" style={{width: '100%'}}></div>
            </div>
          </Card>
        </div>

        {/* Analytics Charts Placeholder */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6 bg-gradient-card border border-border/50 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-foreground">Waste Categories</h3>
              <BarChart3 className="w-6 h-6 text-muted-foreground" />
            </div>
            <div className="space-y-4">
              {stats?.analytics?.classificationsByCategory?.slice(0, 5).map((category, index) => (
                <div key={category._id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${
                      index === 0 ? 'bg-info' :
                      index === 1 ? 'bg-accent' :
                      index === 2 ? 'bg-warning' :
                      index === 3 ? 'bg-earth-brown' : 'bg-success'
                    }`}></div>
                    <span className="text-sm font-medium text-foreground capitalize">{category._id}</span>
                  </div>
                  <span className="text-sm font-bold text-muted-foreground">{category.count}</span>
                </div>
              )) || (
                <p className="text-muted-foreground text-center py-8">No classification data available</p>
              )}
            </div>
          </Card>

          <Card className="p-6 bg-gradient-card border border-border/50 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-foreground">User Registrations</h3>
              <TrendingUp className="w-6 h-6 text-muted-foreground" />
            </div>
            <div className="space-y-4">
              {stats?.analytics?.userRegistrationsByMonth?.slice(0, 5).map((month, index) => (
                <div key={`${month._id.year}-${month._id.month}`} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-foreground">
                      {new Date(month._id.year, month._id.month - 1).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                  <span className="text-sm font-bold text-muted-foreground">{month.count}</span>
                </div>
              )) || (
                <p className="text-muted-foreground text-center py-8">No registration data available</p>
              )}
            </div>
          </Card>
        </div>

        {/* Live Map & Nearest Recycling Centers */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 p-6 bg-gradient-card border border-border/50 shadow-lg">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
              <div>
                <h3 className="text-xl font-bold text-foreground">Live Recycling Center Map</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Use live Google Maps data to locate the nearest recycling centers from your current position.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button
                  variant="outline"
                  onClick={requestUserLocation}
                  className="border-primary/30 text-primary hover:bg-primary/5"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh Location
                </Button>
                <Button
                  variant="secondary"
                  onClick={handleRecenterToNearest}
                  disabled={!selectedCenterId}
                >
                  <Navigation className="w-4 h-4 mr-2" />
                  Recenter to Nearest
                </Button>
              </div>
            </div>
            <div className="rounded-3xl overflow-hidden border border-border/50 bg-card">
              <div ref={mapRef} className="h-[420px] w-full bg-slate-100" />
            </div>
            {(mapLoading || !userLocation) && (
              <div className="mt-4 rounded-2xl border border-border/50 bg-secondary/50 p-4 text-sm text-muted-foreground">
                {mapLoading ? "Loading live map and nearest centers..." : "Allow location access to load the live map."}
              </div>
            )}
            {mapError && (
              <div className="mt-4 rounded-2xl border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
                {mapError}
              </div>
            )}
          </Card>

          <Card className="p-6 bg-gradient-card border border-border/50 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-foreground">Nearest Centers</h3>
                <p className="text-sm text-muted-foreground mt-1">Live nearest recycling centers from your current location.</p>
              </div>
              <MapPin className="w-5 h-5 text-primary" />
            </div>
            <div className="space-y-4">
              {nearestCenters.length === 0 ? (
                <div className="rounded-2xl border border-border/50 bg-background p-4 text-sm text-muted-foreground">
                  Grant location access and refresh to discover live recycling centers nearby.
                </div>
              ) : nearestCenters.map((center) => (
                <button
                  type="button"
                  key={center.id}
                  onClick={() => setSelectedCenterId(center.id)}
                  className={`w-full text-left rounded-2xl border p-4 transition-all ${selectedCenterId === center.id ? 'border-primary bg-primary/5' : 'border-border/30 bg-background hover:border-primary/50 hover:bg-secondary/60'}`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h4 className="font-semibold text-foreground">{center.name}</h4>
                      <p className="text-sm text-muted-foreground mt-1">{center.address}</p>
                    </div>
                    <span className="text-sm font-semibold text-foreground">{center.rating.toFixed(1)} ★</span>
                  </div>
                  {userLocation && (
                    <p className="mt-3 text-sm text-muted-foreground">
                      {Math.round(calculateDistance(userLocation, center.location) * 100) / 100} km away
                    </p>
                  )}
                </button>
              ))}
            </div>
          </Card>
        </div>

        {/* Management Tabs */}
        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:w-auto lg:grid-cols-2 bg-secondary/50 p-1">
            <TabsTrigger value="users" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Users className="w-4 h-4 mr-2" />
              User Management
            </TabsTrigger>
            <TabsTrigger value="classifications" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <FileImage className="w-4 h-4 mr-2" />
              Classifications
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-6">
            <Card className="p-6 bg-gradient-card border border-border/50 shadow-lg">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <h3 className="text-xl font-bold text-foreground">User Management</h3>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      placeholder="Search users..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-full sm:w-64"
                    />
                  </div>
                  <Button
                    onClick={loadDashboardData}
                    variant="outline"
                    className="border-primary/30 text-primary hover:bg-primary/5"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh
                  </Button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border/50">
                      <th className="text-left py-3 px-4 font-semibold text-foreground">User</th>
                      <th className="text-left py-3 px-4 font-semibold text-foreground">Email</th>
                      <th className="text-left py-3 px-4 font-semibold text-foreground">Status</th>
                      <th className="text-left py-3 px-4 font-semibold text-foreground">Classifications</th>
                      <th className="text-left py-3 px-4 font-semibold text-foreground">Joined</th>
                      <th className="text-left py-3 px-4 font-semibold text-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.filter(user =>
                      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      user.email.toLowerCase().includes(searchTerm.toLowerCase())
                    ).map((user) => (
                      <tr key={user._id} className="border-b border-border/30 hover:bg-secondary/30 transition-colors">
                        <td className="py-4 px-4">
                          <div className="font-medium text-foreground">{user.name}</div>
                        </td>
                        <td className="py-4 px-4 text-muted-foreground">{user.email}</td>
                        <td className="py-4 px-4">
                          <Badge variant={user.accountConfimation.status ? "default" : "secondary"}>
                            {user.accountConfimation.status ? "Active" : "Inactive"}
                          </Badge>
                        </td>
                        <td className="py-4 px-4 text-muted-foreground">{user.classificationCount}</td>
                        <td className="py-4 px-4 text-muted-foreground text-sm">{formatDate(user.createdAt)}</td>
                        <td className="py-4 px-4">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => handleUserStatusToggle(user._id, user.accountConfimation.status)}
                                className="cursor-pointer"
                              >
                                {user.accountConfimation.status ? (
                                  <>
                                    <UserX className="w-4 h-4 mr-2" />
                                    Deactivate
                                  </>
                                ) : (
                                  <>
                                    <UserCheck className="w-4 h-4 mr-2" />
                                    Activate
                                  </>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => setDeleteDialog({
                                  open: true,
                                  type: 'user',
                                  id: user._id,
                                  name: user.name
                                })}
                                className="cursor-pointer text-destructive focus:text-destructive"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete User
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {users.length === 0 && (
                  <div className="text-center py-12">
                    <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No users found</p>
                  </div>
                )}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="classifications" className="space-y-6">
            <Card className="p-6 bg-gradient-card border border-border/50 shadow-lg">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <h3 className="text-xl font-bold text-foreground">Classification Management</h3>
                <Button
                  onClick={loadDashboardData}
                  variant="outline"
                  className="border-primary/30 text-primary hover:bg-primary/5"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border/50">
                      <th className="text-left py-3 px-4 font-semibold text-foreground">User</th>
                      <th className="text-left py-3 px-4 font-semibold text-foreground">Category</th>
                      <th className="text-left py-3 px-4 font-semibold text-foreground">Confidence</th>
                      <th className="text-left py-3 px-4 font-semibold text-foreground">Date</th>
                      <th className="text-left py-3 px-4 font-semibold text-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {classifications.map((classification) => (
                      <tr key={classification._id} className="border-b border-border/30 hover:bg-secondary/30 transition-colors">
                        <td className="py-4 px-4">
                          <div className="font-medium text-foreground">{classification.userId.name}</div>
                          <div className="text-sm text-muted-foreground">{classification.userId.email}</div>
                        </td>
                        <td className="py-4 px-4">
                          <Badge variant="outline" className="capitalize">
                            {classification.label}
                          </Badge>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-secondary/50 rounded-full h-2">
                              <div
                                className="bg-gradient-primary h-2 rounded-full"
                                style={{width: `${classification.confidence * 100}%`}}
                              ></div>
                            </div>
                            <span className="text-sm text-muted-foreground">
                              {Math.round(classification.confidence * 100)}%
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-muted-foreground text-sm">{formatDate(classification.createdAt)}</td>
                        <td className="py-4 px-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeleteDialog({
                              open: true,
                              type: 'classification',
                              id: classification._id,
                              name: `${classification.userId.name}'s ${classification.label} classification`
                            })}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {classifications.length === 0 && (
                  <div className="text-center py-12">
                    <FileImage className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No classifications found</p>
                  </div>
                )}
              </div>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialog.open} onOpenChange={(open) =>
          setDeleteDialog({ open, type: 'user', id: '', name: '' })
        }>
          <AlertDialogContent className="bg-card border border-border/50">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-foreground">Confirm Deletion</AlertDialogTitle>
              <AlertDialogDescription className="text-muted-foreground">
                Are you sure you want to delete {deleteDialog.name}? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="border-border/50">Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteConfirm}
                className="bg-destructive hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}