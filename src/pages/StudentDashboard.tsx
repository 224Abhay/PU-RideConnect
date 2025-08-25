import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bus, MapPin, Bell, User, LogOut } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

interface BusAssignment {
  id: string;
  assigned_at: string;
  buses: {
    bus_number: string;
    route_name: string;
    capacity: number;
  };
}

interface Announcement {
  id: string;
  title: string;
  message: string;
  created_at: string;
  profiles: {
    name: string;
    role: string;
  };
}

export default function StudentDashboard() {
  const { profile, signOut } = useAuth();
  const [busAssignment, setBusAssignment] = useState<BusAssignment | null>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchStudentData();
  }, [profile]);

  const fetchStudentData = async () => {
    try {
      // Fetch bus assignment
      const { data: assignment, error: assignmentError } = await supabase
        .from('bus_assignments')
        .select(`
          id,
          assigned_at,
          buses (
            bus_number,
            route_name,
            capacity
          )
        `)
        .eq('student_id', profile?.id)
        .maybeSingle();

      if (assignmentError) {
        console.error('Error fetching bus assignment:', assignmentError);
      } else {
        setBusAssignment(assignment);
      }

      // Fetch announcements
      const { data: announcementsData, error: announcementsError } = await supabase
        .from('announcements')
        .select(`
          id,
          title,
          message,
          created_at,
          profiles!created_by (
            name,
            role
          )
        `)
        .order('created_at', { ascending: false })
        .limit(10);

      if (announcementsError) {
        console.error('Error fetching announcements:', announcementsError);
      } else {
        setAnnouncements(announcementsData || []);
      }
    } catch (error) {
      console.error('Error fetching student data:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load dashboard data"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: "Signed out",
      description: "You have been signed out successfully."
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-university-light to-background">
      {/* Header */}
      <header className="bg-primary text-primary-foreground shadow-lg">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">PU RideConnect</h1>
            <p className="text-primary-foreground/80">Student Dashboard</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="font-medium">{profile?.name}</p>
              <Badge variant="secondary" className="text-xs">
                {profile?.role}
              </Badge>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleSignOut}
              className="flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Bus Assignment Card */}
          <Card className="shadow-card hover:shadow-hover transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bus className="h-5 w-5 text-primary" />
                Your Bus Assignment
              </CardTitle>
              <CardDescription>
                Current transportation details
              </CardDescription>
            </CardHeader>
            <CardContent>
              {busAssignment ? (
                <div className="space-y-4">
                  <div className="bg-gradient-primary p-4 rounded-lg">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-bold text-lg">
                          Bus {busAssignment.buses.bus_number}
                        </h3>
                        <p className="flex items-center gap-1 mt-1">
                          <MapPin className="h-4 w-4" />
                          {busAssignment.buses.route_name}
                        </p>
                      </div>
                      <Badge variant="secondary">
                        Capacity: {busAssignment.buses.capacity}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Assigned on: {new Date(busAssignment.assigned_at).toLocaleDateString()}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Bus className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No bus assigned yet</p>
                  <p className="text-sm">Contact staff for bus assignment</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Profile Card */}
          <Card className="shadow-card hover:shadow-hover transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Your Profile
              </CardTitle>
              <CardDescription>
                Student information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Name</Label>
                  <p className="font-medium">{profile?.name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Email</Label>
                  <p className="font-medium">{profile?.email}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Role</Label>
                  <Badge variant="outline">{profile?.role}</Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Member Since</Label>
                  <p className="text-sm">{new Date(profile?.created_at || '').toLocaleDateString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Announcements */}
        <Card className="mt-6 shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              Recent Announcements
            </CardTitle>
            <CardDescription>
              Latest updates from university staff
            </CardDescription>
          </CardHeader>
          <CardContent>
            {announcements.length > 0 ? (
              <div className="space-y-4">
                {announcements.map((announcement) => (
                  <div
                    key={announcement.id}
                    className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold">{announcement.title}</h4>
                      <div className="text-right">
                        <Badge variant="outline" className="text-xs">
                          {announcement.profiles.role}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(announcement.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <p className="text-muted-foreground mb-2">{announcement.message}</p>
                    <p className="text-sm text-muted-foreground">
                      By {announcement.profiles.name}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No announcements yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}