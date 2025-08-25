import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, Bus, Plus, Search, Bell, LogOut, UserPlus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface Student {
  id: string;
  name: string;
  email: string;
}

interface Bus {
  id: string;
  bus_number: string;
  route_name: string;
  capacity: number;
}

interface Assignment {
  id: string;
  student_id: string;
  bus_id: string;
  assigned_at: string;
  profiles: {
    name: string;
    email: string;
  };
  buses: {
    bus_number: string;
    route_name: string;
  };
}

export default function StaffDashboard() {
  const { profile, signOut } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [buses, setBuses] = useState<Bus[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [selectedBus, setSelectedBus] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [announcementTitle, setAnnouncementTitle] = useState('');
  const [announcementMessage, setAnnouncementMessage] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch students
      const { data: studentsData } = await supabase
        .from('profiles')
        .select('id, name, email')
        .eq('role', 'student')
        .order('name');

      // Fetch buses
      const { data: busesData } = await supabase
        .from('buses')
        .select('*')
        .order('bus_number');

      // Fetch assignments
      const { data: assignmentsData } = await supabase
        .from('bus_assignments')
        .select(`
          id,
          student_id,
          bus_id,
          assigned_at,
          profiles!student_id (name, email),
          buses (bus_number, route_name)
        `)
        .order('assigned_at', { ascending: false });

      setStudents(studentsData || []);
      setBuses(busesData || []);
      setAssignments(assignmentsData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load dashboard data"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAssignStudent = async () => {
    if (!selectedStudent || !selectedBus) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select both student and bus"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('bus_assignments')
        .insert({
          student_id: selectedStudent,
          bus_id: selectedBus,
          assigned_by: profile?.id
        });

      if (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: error.message
        });
      } else {
        toast({
          title: "Success",
          description: "Student assigned to bus successfully"
        });
        setSelectedStudent('');
        setSelectedBus('');
        fetchData();
      }
    } catch (error) {
      console.error('Error assigning student:', error);
    }
  };

  const handleCreateAnnouncement = async () => {
    if (!announcementTitle.trim() || !announcementMessage.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please fill in both title and message"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('announcements')
        .insert({
          title: announcementTitle,
          message: announcementMessage,
          created_by: profile?.id
        });

      if (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: error.message
        });
      } else {
        toast({
          title: "Success",
          description: "Announcement created successfully"
        });
        setAnnouncementTitle('');
        setAnnouncementMessage('');
      }
    } catch (error) {
      console.error('Error creating announcement:', error);
    }
  };

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredAssignments = assignments.filter(assignment =>
    assignment.profiles.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    assignment.buses.bus_number.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
            <p className="text-primary-foreground/80">Staff Dashboard</p>
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
              onClick={signOut}
              className="flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Assignment Management */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-primary" />
                Assign Students to Buses
              </CardTitle>
              <CardDescription>
                Manage student bus assignments
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Select Student</Label>
                <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a student" />
                  </SelectTrigger>
                  <SelectContent>
                    {students.map((student) => (
                      <SelectItem key={student.id} value={student.id}>
                        {student.name} ({student.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Select Bus</Label>
                <Select value={selectedBus} onValueChange={setSelectedBus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a bus" />
                  </SelectTrigger>
                  <SelectContent>
                    {buses.map((bus) => (
                      <SelectItem key={bus.id} value={bus.id}>
                        Bus {bus.bus_number} - {bus.route_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleAssignStudent} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Assign Student
              </Button>
            </CardContent>
          </Card>

          {/* Create Announcement */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-primary" />
                Create Announcement
              </CardTitle>
              <CardDescription>
                Send updates to all students
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Title</Label>
                <Input
                  value={announcementTitle}
                  onChange={(e) => setAnnouncementTitle(e.target.value)}
                  placeholder="Announcement title"
                />
              </div>
              <div>
                <Label>Message</Label>
                <Textarea
                  value={announcementMessage}
                  onChange={(e) => setAnnouncementMessage(e.target.value)}
                  placeholder="Announcement message"
                  rows={4}
                />
              </div>
              <Button onClick={handleCreateAnnouncement} className="w-full">
                <Bell className="h-4 w-4 mr-2" />
                Create Announcement
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Current Assignments */}
        <Card className="mt-6 shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Current Assignments
            </CardTitle>
            <CardDescription>
              All active student bus assignments
            </CardDescription>
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search students or buses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
          </CardHeader>
          <CardContent>
            {filteredAssignments.length > 0 ? (
              <div className="space-y-4">
                {filteredAssignments.map((assignment) => (
                  <div
                    key={assignment.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div>
                      <h4 className="font-semibold">{assignment.profiles.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {assignment.profiles.email}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline">
                        Bus {assignment.buses.bus_number}
                      </Badge>
                      <p className="text-sm text-muted-foreground mt-1">
                        {assignment.buses.route_name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Assigned: {new Date(assignment.assigned_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No assignments found</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}