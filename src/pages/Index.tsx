import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Bus, Users, Shield, ArrowRight, Clock, Bell, Route, TrendingUp } from 'lucide-react';

const Index = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && profile) {
      // Redirect based on role
      switch (profile.role) {
        case 'student':
          navigate('/student');
          break;
        case 'staff':
          navigate('/staff');
          break;
        case 'admin':
          navigate('/admin');
          break;
      }
    }
  }, [user, profile, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-university-light via-background to-university-light">
      {/* Header */}
      <header className="bg-primary text-primary-foreground shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">PU RideConnect</h1>
              <p className="text-primary-foreground/80">Smart University Transportation Management</p>
            </div>
            <Link to="/auth">
              <Button variant="secondary" className="flex items-center gap-2">
                Get Started
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold mb-6 bg-gradient-primary bg-clip-text text-transparent">
            Smart Transportation for Modern Universities
          </h2>
          <p className="text-xl text-muted-foreground max-w-4xl mx-auto mb-8 leading-relaxed">
            PU RideConnect is a smart university transportation management system that simplifies commuting 
            for students, staff, and administrators. By enhancing efficiency and communication, 
            PU RideConnect ensures a smoother, more reliable, and modernized transportation experience 
            for the university community.
          </p>
        </div>

        {/* Main Application Description */}
        <div className="mb-16">
          <Card className="shadow-card p-8 bg-gradient-to-r from-primary/5 to-secondary/5 border-0">
            <CardContent className="p-0">
              <div className="grid gap-8 md:grid-cols-2 items-center">
                <div>
                  <h3 className="text-3xl font-bold mb-4 text-primary">
                    What is PU RideConnect?
                  </h3>
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    PU RideConnect is a comprehensive transportation management platform designed specifically 
                    for universities. It streamlines the entire transportation ecosystem, from bus assignments 
                    to real-time communications, making daily commuting efficient and stress-free for everyone 
                    in the university community.
                  </p>
                </div>
                <div className="flex justify-center">
                  <div className="relative">
                    <div className="w-64 h-64 bg-gradient-primary rounded-full opacity-20 animate-pulse"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Bus className="h-32 w-32 text-primary" />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Key Features */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4 mb-16">
          <Card className="shadow-card hover:shadow-hover transition-all duration-300 border-0 bg-gradient-to-br from-blue-50 to-blue-100">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-4 p-3 bg-blue-500 rounded-full w-fit">
                <Users className="h-6 w-6 text-white" />
              </div>
              <CardTitle className="text-blue-800">Student Experience</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-sm text-blue-700">
                View assigned bus details and stay updated through timely announcements
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-card hover:shadow-hover transition-all duration-300 border-0 bg-gradient-to-br from-green-50 to-green-100">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-4 p-3 bg-green-500 rounded-full w-fit">
                <Route className="h-6 w-6 text-white" />
              </div>
              <CardTitle className="text-green-800">Staff Management</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-sm text-green-700">
                Manage bus assignments, schedules, and communications efficiently
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-card hover:shadow-hover transition-all duration-300 border-0 bg-gradient-to-br from-purple-50 to-purple-100">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-4 p-3 bg-purple-500 rounded-full w-fit">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <CardTitle className="text-purple-800">Admin Control</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-sm text-purple-700">
                Complete oversight of users, buses, and system-wide updates
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-card hover:shadow-hover transition-all duration-300 border-0 bg-gradient-to-br from-orange-50 to-orange-100">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-4 p-3 bg-orange-500 rounded-full w-fit">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <CardTitle className="text-orange-800">Smart Efficiency</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-sm text-orange-700">
                Enhanced efficiency and communication for reliable transportation
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Benefits Section */}
        <div className="grid gap-8 md:grid-cols-2 mb-16">
          <Card className="shadow-card hover:shadow-hover transition-all duration-300">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Clock className="h-5 w-5 text-green-600" />
                </div>
                <CardTitle>Time-Saving</CardTitle>
              </div>
              <CardDescription>
                Automated bus assignments and real-time updates save valuable time for students and staff
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="shadow-card hover:shadow-hover transition-all duration-300">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Bell className="h-5 w-5 text-blue-600" />
                </div>
                <CardTitle>Better Communication</CardTitle>
              </div>
              <CardDescription>
                Instant announcements and notifications keep everyone informed about schedule changes
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-primary text-primary-foreground py-8 mt-16">
        <div className="container mx-auto px-4 text-center">
          <p className="text-primary-foreground/80">
            © 2025 PU RideConnect. Smart University Transportation Management System.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
