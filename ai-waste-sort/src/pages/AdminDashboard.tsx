import { useState, useEffect } from "react";
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
  LogOut,
  Activity,
  Trash2,
  UserCheck,
  UserX,
} from "lucide-react";
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
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    type: "user" | "classification";
    id: string;
    name: string;
  }>({
    open: false,
    type: "user",
    id: "",
    name: "",
  });

  const navigate = useNavigate();
  const admin = getCurrentAdmin();

  const adminRoleTheme = admin?.role === "super_admin"
    ? {
        banner: "from-violet-500 via-fuchsia-500 to-pink-500",
        statCard: "from-violet-50 to-fuchsia-50",
        icon: "text-violet-500",
      }
    : {
        banner: "from-sky-500 via-cyan-500 to-emerald-500",
        statCard: "from-sky-50 to-cyan-50",
        icon: "text-sky-500",
      };

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

      // Try to load data from APIs, but don't crash if they fail
      try {
        const statsData = await getDashboardStats();
        setStats(statsData);
      } catch (error) {
        console.error("Failed to load stats:", error);
        // Set default stats if API fails
        setStats({
          overview: {
            totalUsers: 0,
            totalClassifications: 0,
            totalAdmins: 1,
            activeUsers: 0,
          },
          recentActivity: {
            recentUsers: [],
            recentClassifications: [],
          },
          analytics: {
            classificationsByCategory: [],
            userRegistrationsByMonth: [],
          },
        });
      }

      try {
        const usersData = await getAllUsers({ page: 1, limit: 10 });
        setUsers(usersData.users || []);
      } catch (error) {
        console.error("Failed to load users:", error);
        setUsers([]);
      }

      try {
        const classificationsData = await getAllClassifications({
          page: 1,
          limit: 10,
        });
        setClassifications(classificationsData.classifications || []);
      } catch (error) {
        console.error("Failed to load classifications:", error);
        setClassifications([]);
      }
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

  const handleUserStatusToggle = async (
    userId: string,
    currentStatus: boolean
  ) => {
    try {
      await updateUserStatus(userId, !currentStatus);
      setUsers((prev) =>
        prev.map((user) =>
          user._id === userId
            ? {
                ...user,
                accountConfimation: {
                  ...user.accountConfimation,
                  status: !currentStatus,
                },
              }
            : user
        )
      );
      toast.success(
        `User ${!currentStatus ? "activated" : "deactivated"} successfully`
      );
    } catch (error) {
      console.error("Failed to update user status:", error);
      toast.error("Failed to update user status");
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      if (deleteDialog.type === "user") {
        await deleteUser(deleteDialog.id);
        setUsers((prev) => prev.filter((user) => user._id !== deleteDialog.id));
        toast.success("User deleted successfully");
      } else {
        await deleteClassification(deleteDialog.id);
        setClassifications((prev) =>
          prev.filter((cls) => cls._id !== deleteDialog.id)
        );
        toast.success("Classification deleted successfully");
      }
      setDeleteDialog({ open: false, type: "user", id: "", name: "" });
    } catch (error) {
      console.error("Delete failed:", error);
      toast.error("Delete operation failed");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const displayStats = stats || {
    overview: {
      totalUsers: 0,
      totalClassifications: 0,
      totalAdmins: 1,
      activeUsers: 0,
    },
    recentActivity: {
      recentUsers: [],
      recentClassifications: [],
    },
    analytics: {
      classificationsByCategory: [],
      userRegistrationsByMonth: [],
    },
  };

  const statsCards = [
    {
      label: "Total Users",
      value: displayStats.overview.totalUsers,
      Icon: Users,
      border: "border-sky-500",
      iconClass: "text-sky-500",
      gradient: "from-sky-50 to-cyan-50",
    },
    {
      label: "Classifications",
      value: displayStats.overview.totalClassifications,
      Icon: FileImage,
      border: "border-emerald-500",
      iconClass: "text-emerald-500",
      gradient: "from-emerald-50 to-teal-50",
    },
    {
      label: "Active Users",
      value: displayStats.overview.activeUsers,
      Icon: Activity,
      border: "border-lime-500",
      iconClass: "text-lime-500",
      gradient: "from-lime-50 to-emerald-50",
    },
    {
      label: "Admins",
      value: displayStats.overview.totalAdmins,
      Icon: Shield,
      border: "border-violet-500",
      iconClass: "text-violet-500",
      gradient: "from-violet-50 to-fuchsia-50",
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary/20 border-t-primary mx-auto mb-6"></div>
          <p className="text-muted-foreground text-lg font-medium">
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className={`bg-gradient-to-r ${adminRoleTheme.banner} rounded-2xl p-8 border border-white/10 text-white`}>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-white">
              Admin Dashboard
            </h1>
            <p className="text-muted-foreground text-lg">
              Monitor and manage your waste sorting platform
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="text-right">
              <p className="text-sm text-white/80 font-medium">
                Welcome back
              </p>
              <p className="font-bold text-white text-lg">
                {admin?.firstName || admin?.lastName || admin?.email}
              </p>
              <Badge
                variant={
                  admin?.role === "super_admin" ? "default" : "secondary"
                }
                className="mt-2"
              >
                {admin?.role === "super_admin" ? "Super Admin" : "Admin"}
              </Badge>
            </div>
            <Button
              variant="outline"
              onClick={handleLogout}
              className="border-primary/30 text-primary hover:bg-primary/5"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((card) => (
          <Card
            key={card.label}
            className={`p-6 border-l-4 ${card.border} bg-gradient-to-br ${card.gradient}`}
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {card.value}
                </p>
                <p className="text-sm text-muted-foreground">{card.label}</p>
              </div>
              <card.Icon className={`w-8 h-8 ${card.iconClass} opacity-90`} />
            </div>
          </Card>
        ))}
      </div>

      {/* Tabs for Users and Classifications */}
      <Card className="p-6">
        <Tabs defaultValue="users" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="classifications">Classifications</TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-4">
            <div className="flex items-center gap-2">
              <Search className="w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1"
              />
            </div>

            {users.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No users found
              </div>
            ) : (
              <div className="space-y-2">
                {users.map((user) => (
                  <div
                    key={user._id}
                    className={`flex items-center justify-between p-4 border rounded-lg transition-colors ${user.accountConfimation?.status ? "bg-emerald-50 border-emerald-200 hover:bg-emerald-100" : "bg-rose-50 border-rose-200 hover:bg-rose-100"}`}
                  >
                    <div className="flex-1">
                      <p className="font-medium text-foreground">
                        {user.name || "Unknown"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {user.email}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Classifications: {user.classificationCount}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          user.accountConfimation?.status
                            ? "default"
                            : "secondary"
                        }
                      >
                        {user.accountConfimation?.status
                          ? "Active"
                          : "Inactive"}
                      </Badge>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() =>
                          handleUserStatusToggle(
                            user._id,
                            user.accountConfimation?.status || false
                          )
                        }
                      >
                        {user.accountConfimation?.status ? (
                          <UserX className="w-4 h-4" />
                        ) : (
                          <UserCheck className="w-4 h-4" />
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() =>
                          setDeleteDialog({
                            open: true,
                            type: "user",
                            id: user._id,
                            name: user.name || user.email,
                          })
                        }
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="classifications" className="space-y-4">
            {classifications.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No classifications found
              </div>
            ) : (
              <div className="space-y-2">
                {classifications.map((classification) => (
                  <div
                    key={classification._id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-secondary/50 transition-colors"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-foreground">
                        {classification.label}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {
                          classification.userId?.email ||
                          "Unknown User"
                        }
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Confidence:{" "}
                        {(classification.confidence * 100).toFixed(2)}%
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className={
                          classification.confidence >= 0.9
                            ? "bg-emerald-100 text-emerald-700"
                            : classification.confidence >= 0.75
                            ? "bg-sky-100 text-sky-700"
                            : "bg-amber-100 text-amber-700"
                        }
                      >
                        {formatDate(classification.createdAt)}
                      </Badge>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() =>
                          setDeleteDialog({
                            open: true,
                            type: "classification",
                            id: classification._id,
                            name: classification.label,
                          })
                        }
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialog.open} onOpenChange={(open) =>
        setDeleteDialog(prev => ({ ...prev, open }))
      }>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {deleteDialog.type}?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {deleteDialog.name}? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-red-500 hover:bg-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
