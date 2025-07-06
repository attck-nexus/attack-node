import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Shield, 
  Play, 
  Square, 
  Settings, 
  ExternalLink, 
  Target, 
  Bug,
  Activity,
  Database,
  FileText,
  Zap,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3
} from "lucide-react";

export default function BurpSuite() {
  const [isScanning, setIsScanning] = useState(false);
  const [targetUrl, setTargetUrl] = useState("");
  const [showProjectDialog, setShowProjectDialog] = useState(false);

  // Mock data for demonstration - would integrate with actual Burp Suite API
  const scanResults = [
    {
      id: 1,
      severity: "High",
      title: "SQL Injection in login form",
      url: "https://example.com/login",
      confidence: "Certain",
      status: "New"
    },
    {
      id: 2,
      severity: "Medium",
      title: "Cross-Site Scripting (XSS)",
      url: "https://example.com/search",
      confidence: "Firm",
      status: "Fixed"
    },
    {
      id: 3,
      severity: "Low",
      title: "Missing Security Headers",
      url: "https://example.com/",
      confidence: "Certain",
      status: "Acknowledged"
    }
  ];

  const projects = [
    {
      id: 1,
      name: "Main Application Scan",
      target: "https://app.example.com",
      status: "Active",
      lastScan: "2024-01-07T10:30:00Z",
      findings: 12
    },
    {
      id: 2,
      name: "API Security Assessment",
      target: "https://api.example.com",
      status: "Completed",
      lastScan: "2024-01-06T15:45:00Z",
      findings: 5
    }
  ];

  const handleStartScan = () => {
    if (targetUrl) {
      setIsScanning(true);
      // Here we would integrate with Burp Suite API to start a scan
      setTimeout(() => setIsScanning(false), 5000); // Simulate scan completion
    }
  };

  const handleStopScan = () => {
    setIsScanning(false);
    // Here we would stop the scan via Burp Suite API
  };

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'high':
        return 'bg-error/10 text-error';
      case 'medium':
        return 'bg-warning/10 text-warning';
      case 'low':
        return 'bg-success/10 text-success';
      default:
        return 'bg-gray-500/10 text-gray-500';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'new':
        return 'bg-error/10 text-error';
      case 'fixed':
        return 'bg-success/10 text-success';
      case 'acknowledged':
        return 'bg-warning/10 text-warning';
      default:
        return 'bg-gray-500/10 text-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-dark">
      {/* Header */}
      <header className="bg-surface border-b border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-100">Burp Suite Integration</h2>
            <p className="text-gray-400 mt-1">Advanced web application security testing</p>
          </div>
          <div className="flex items-center space-x-4">
            <Badge className={isScanning ? "bg-warning/10 text-warning" : "bg-success/10 text-success"}>
              {isScanning ? "Scanning" : "Ready"}
            </Badge>
            <Dialog open={showProjectDialog} onOpenChange={setShowProjectDialog}>
              <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary/90 text-white">
                  <Target className="h-4 w-4 mr-2" />
                  New Project
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md bg-surface border-gray-700">
                <DialogHeader>
                  <DialogTitle className="text-gray-100">Create New Project</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-300 mb-2 block">Project Name</label>
                    <Input
                      placeholder="Enter project name"
                      className="bg-card border-gray-600 text-gray-100"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-300 mb-2 block">Target URL</label>
                    <Input
                      placeholder="https://example.com"
                      className="bg-card border-gray-600 text-gray-100"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-300 mb-2 block">Description</label>
                    <Textarea
                      placeholder="Project description..."
                      className="bg-card border-gray-600 text-gray-100"
                    />
                  </div>
                  <Button className="w-full bg-primary hover:bg-primary/90">
                    Create Project
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">
        {/* Quick Scan Panel */}
        <Card className="bg-surface border-gray-700 mb-8">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-100">Quick Scan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <Input
                  placeholder="Enter target URL (e.g., https://example.com)"
                  value={targetUrl}
                  onChange={(e) => setTargetUrl(e.target.value)}
                  className="bg-card border-gray-600 text-gray-100"
                />
              </div>
              {!isScanning ? (
                <Button 
                  onClick={handleStartScan}
                  disabled={!targetUrl}
                  className="bg-primary hover:bg-primary/90"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Start Scan
                </Button>
              ) : (
                <Button 
                  onClick={handleStopScan}
                  variant="destructive"
                >
                  <Square className="h-4 w-4 mr-2" />
                  Stop Scan
                </Button>
              )}
            </div>
            {isScanning && (
              <div className="mt-4 p-3 bg-warning/10 border border-warning/20 rounded-lg">
                <div className="flex items-center">
                  <Activity className="h-4 w-4 text-warning mr-2 animate-pulse" />
                  <span className="text-warning">Scanning in progress...</span>
                </div>
                <div className="mt-2 w-full bg-gray-700 rounded-full h-2">
                  <div className="bg-warning h-2 rounded-full animate-pulse" style={{ width: "45%" }} />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-surface border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Findings</p>
                  <p className="text-2xl font-bold text-gray-100 mt-2">17</p>
                </div>
                <div className="bg-primary/10 p-3 rounded-lg">
                  <Bug className="text-primary h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-surface border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">High Severity</p>
                  <p className="text-2xl font-bold text-error mt-2">3</p>
                </div>
                <div className="bg-error/10 p-3 rounded-lg">
                  <AlertTriangle className="text-error h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-surface border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Fixed Issues</p>
                  <p className="text-2xl font-bold text-success mt-2">8</p>
                </div>
                <div className="bg-success/10 p-3 rounded-lg">
                  <CheckCircle className="text-success h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-surface border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Scan Time</p>
                  <p className="text-2xl font-bold text-gray-100 mt-2">2.3h</p>
                </div>
                <div className="bg-secondary/10 p-3 rounded-lg">
                  <Clock className="text-secondary h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Dashboard */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Recent Findings */}
          <Card className="bg-surface border-gray-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold text-gray-100">Recent Findings</CardTitle>
                <Button variant="link" className="text-primary hover:text-primary/80 p-0">
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {scanResults.map((result) => (
                  <div key={result.id} className="border border-gray-700 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4 className="text-gray-100 font-medium">{result.title}</h4>
                        <p className="text-gray-400 text-sm mt-1">{result.url}</p>
                      </div>
                      <div className="flex flex-col items-end space-y-1">
                        <Badge className={getSeverityColor(result.severity)}>
                          {result.severity}
                        </Badge>
                        <Badge className={getStatusColor(result.status)} variant="outline">
                          {result.status}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Confidence: {result.confidence}</span>
                      <Button size="sm" variant="outline" className="border-gray-600 text-gray-300">
                        <ExternalLink className="h-3 w-3 mr-1" />
                        Details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Active Projects */}
          <Card className="bg-surface border-gray-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold text-gray-100">Active Projects</CardTitle>
                <Button variant="link" className="text-primary hover:text-primary/80 p-0">
                  Manage
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {projects.map((project) => (
                  <div key={project.id} className="border border-gray-700 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="text-gray-100 font-medium">{project.name}</h4>
                        <p className="text-gray-400 text-sm">{project.target}</p>
                      </div>
                      <Badge className={project.status === 'Active' ? 'bg-success/10 text-success' : 'bg-gray-500/10 text-gray-500'}>
                        {project.status}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">{project.findings} findings</span>
                      <span className="text-gray-400">
                        {new Date(project.lastScan).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Burp Suite Configuration */}
        <Card className="bg-surface border-gray-700">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-100">Burp Suite Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-300 mb-2 block">Burp Suite Endpoint</label>
                  <Input
                    defaultValue="http://localhost:1337"
                    className="bg-card border-gray-600 text-gray-100"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-300 mb-2 block">API Key</label>
                  <Input
                    type="password"
                    placeholder="Enter Burp Suite API key"
                    className="bg-card border-gray-600 text-gray-100"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-300 mb-2 block">Project Path</label>
                  <Input
                    defaultValue="/home/kali/burp-projects"
                    className="bg-card border-gray-600 text-gray-100"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-card p-4 rounded-lg">
                  <h4 className="text-gray-100 font-medium mb-2">Connection Status</h4>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Burp Suite Professional</span>
                    <Badge className="bg-success/10 text-success">Connected</Badge>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-gray-400">Version</span>
                    <span className="text-gray-300">2023.12.1</span>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-gray-400">License</span>
                    <span className="text-gray-300">Professional</span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button className="bg-primary hover:bg-primary/90 flex-1">
                    <Settings className="h-4 w-4 mr-2" />
                    Test Connection
                  </Button>
                  <Button variant="outline" className="border-gray-600 text-gray-300 flex-1">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Open Burp
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}