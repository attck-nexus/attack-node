import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Monitor, 
  Play, 
  Square, 
  Settings, 
  ExternalLink, 
  Shield, 
  Code, 
  Database,
  Download,
  Upload,
  Power,
  PowerOff,
  Activity,
  RefreshCw,
  Terminal,
  Zap,
  Globe,
  Search
} from "lucide-react";

interface IntegrationApp {
  id: string;
  name: string;
  description: string;
  icon: any;
  dockerImage: string;
  port: number;
  status: "running" | "stopped" | "installing";
  category: "security" | "development" | "analysis";
  fileRequired?: string;
  licenseRequired?: boolean;
}

export default function Integrations() {
  const [selectedApp, setSelectedApp] = useState<IntegrationApp | null>(null);
  const [showConfigDialog, setShowConfigDialog] = useState(false);

  const integrationApps: IntegrationApp[] = [
    {
      id: "burpsuite",
      name: "Burp Suite Professional",
      description: "Advanced web application security testing",
      icon: Shield,
      dockerImage: "custom/burpsuite-kasmweb",
      port: 6901,
      status: "stopped",
      category: "security",
      fileRequired: "burpsuite_pro.jar",
      licenseRequired: true
    },
    {
      id: "maltego",
      name: "Maltego",
      description: "Open source intelligence and forensics application",
      icon: Search,
      dockerImage: "kasmweb/maltego:1.17.0",
      port: 6902,
      status: "stopped",
      category: "analysis"
    },
    {
      id: "vscode",
      name: "Visual Studio Code",
      description: "Code editor with integrated development environment",
      icon: Code,
      dockerImage: "kasmweb/vs-code:1.17.0",
      port: 6903,
      status: "running",
      category: "development"
    },
    {
      id: "owasp-zap",
      name: "OWASP ZAP",
      description: "Web application security scanner",
      icon: Zap,
      dockerImage: "kasmweb/owasp-zap:1.17.0",
      port: 6904,
      status: "stopped",
      category: "security"
    },
    {
      id: "wireshark",
      name: "Wireshark",
      description: "Network protocol analyzer",
      icon: Activity,
      dockerImage: "kasmweb/wireshark:1.17.0",
      port: 6905,
      status: "stopped",
      category: "analysis"
    },
    {
      id: "metasploit",
      name: "Metasploit Framework",
      description: "Penetration testing framework",
      icon: Terminal,
      dockerImage: "kasmweb/metasploit:1.17.0",
      port: 6906,
      status: "stopped",
      category: "security"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running':
        return 'bg-success/10 text-success';
      case 'stopped':
        return 'bg-error/10 text-error';
      case 'installing':
        return 'bg-warning/10 text-warning';
      default:
        return 'bg-gray-500/10 text-gray-500';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'security':
        return 'bg-error/10 text-error';
      case 'development':
        return 'bg-primary/10 text-primary';
      case 'analysis':
        return 'bg-warning/10 text-warning';
      default:
        return 'bg-gray-500/10 text-gray-500';
    }
  };

  const handleStartApp = (app: IntegrationApp) => {
    console.log(`Starting ${app.name}`);
    // Docker start logic would go here
  };

  const handleStopApp = (app: IntegrationApp) => {
    console.log(`Stopping ${app.name}`);
    // Docker stop logic would go here
  };

  const openApp = (app: IntegrationApp) => {
    window.open(`http://localhost:${app.port}`, '_blank');
  };

  const filteredApps = (category: string) => 
    integrationApps.filter(app => app.category === category);

  return (
    <div className="min-h-screen bg-dark">
      {/* Header */}
      <header className="bg-surface border-b border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-100">Integrations</h2>
            <p className="text-gray-400 mt-1">Containerized security tools and development environments</p>
          </div>
          <div className="flex items-center space-x-4">
            <Badge className="bg-success/10 text-success">
              {integrationApps.filter(app => app.status === 'running').length} Running
            </Badge>
            <Dialog open={showConfigDialog} onOpenChange={setShowConfigDialog}>
              <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary/90 text-white">
                  <Settings className="h-4 w-4 mr-2" />
                  Global Settings
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md bg-surface border-gray-700">
                <DialogHeader>
                  <DialogTitle className="text-gray-100">Docker Configuration</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-300 mb-2 block">Docker Host</label>
                    <Input
                      defaultValue="unix:///var/run/docker.sock"
                      className="bg-card border-gray-600 text-gray-100"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-300 mb-2 block">Shared Volume Path</label>
                    <Input
                      defaultValue="/home/kali/shared"
                      className="bg-card border-gray-600 text-gray-100"
                    />
                  </div>
                  <Button className="w-full bg-primary hover:bg-primary/90">
                    Save Configuration
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">
        <Tabs defaultValue="security" className="space-y-6">
          <TabsList className="bg-surface border border-gray-700">
            <TabsTrigger value="security" className="data-[state=active]:bg-primary data-[state=active]:text-white">
              <Shield className="h-4 w-4 mr-2" />
              Security Tools
            </TabsTrigger>
            <TabsTrigger value="development" className="data-[state=active]:bg-primary data-[state=active]:text-white">
              <Code className="h-4 w-4 mr-2" />
              Development
            </TabsTrigger>
            <TabsTrigger value="analysis" className="data-[state=active]:bg-primary data-[state=active]:text-white">
              <Activity className="h-4 w-4 mr-2" />
              Analysis
            </TabsTrigger>
          </TabsList>

          {/* Security Tools */}
          <TabsContent value="security" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredApps("security").map((app) => (
                <Card key={app.id} className="bg-surface border-gray-700 hover:border-primary/50 transition-colors">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="bg-primary/10 p-2 rounded-lg">
                          <app.icon className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-lg font-semibold text-gray-100">{app.name}</CardTitle>
                          <Badge className={getCategoryColor(app.category)} variant="outline">
                            {app.category}
                          </Badge>
                        </div>
                      </div>
                      <Badge className={getStatusColor(app.status)}>
                        {app.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-400 text-sm mb-4">{app.description}</p>
                    
                    {app.fileRequired && (
                      <div className="mb-4 p-3 bg-warning/10 border border-warning/20 rounded-lg">
                        <p className="text-warning text-xs">Requires: {app.fileRequired}</p>
                      </div>
                    )}

                    <div className="space-y-2 text-xs text-gray-400 mb-4">
                      <div className="flex justify-between">
                        <span>Port:</span>
                        <span>{app.port}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Image:</span>
                        <span className="truncate ml-2">{app.dockerImage}</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {app.status === 'running' ? (
                        <>
                          <Button 
                            size="sm" 
                            className="flex-1 bg-primary hover:bg-primary/90"
                            onClick={() => openApp(app)}
                          >
                            <ExternalLink className="h-3 w-3 mr-1" />
                            Open
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="border-gray-600 text-gray-300"
                            onClick={() => handleStopApp(app)}
                          >
                            <PowerOff className="h-3 w-3" />
                          </Button>
                        </>
                      ) : (
                        <Button 
                          size="sm" 
                          className="flex-1 bg-success hover:bg-success/90"
                          onClick={() => handleStartApp(app)}
                        >
                          <Power className="h-3 w-3 mr-1" />
                          Start
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Development Tools */}
          <TabsContent value="development" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredApps("development").map((app) => (
                <Card key={app.id} className="bg-surface border-gray-700 hover:border-primary/50 transition-colors">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="bg-primary/10 p-2 rounded-lg">
                          <app.icon className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-lg font-semibold text-gray-100">{app.name}</CardTitle>
                          <Badge className={getCategoryColor(app.category)} variant="outline">
                            {app.category}
                          </Badge>
                        </div>
                      </div>
                      <Badge className={getStatusColor(app.status)}>
                        {app.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-400 text-sm mb-4">{app.description}</p>

                    <div className="space-y-2 text-xs text-gray-400 mb-4">
                      <div className="flex justify-between">
                        <span>Port:</span>
                        <span>{app.port}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Image:</span>
                        <span className="truncate ml-2">{app.dockerImage}</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {app.status === 'running' ? (
                        <>
                          <Button 
                            size="sm" 
                            className="flex-1 bg-primary hover:bg-primary/90"
                            onClick={() => openApp(app)}
                          >
                            <ExternalLink className="h-3 w-3 mr-1" />
                            Open
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="border-gray-600 text-gray-300"
                            onClick={() => handleStopApp(app)}
                          >
                            <PowerOff className="h-3 w-3" />
                          </Button>
                        </>
                      ) : (
                        <Button 
                          size="sm" 
                          className="flex-1 bg-success hover:bg-success/90"
                          onClick={() => handleStartApp(app)}
                        >
                          <Power className="h-3 w-3 mr-1" />
                          Start
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Analysis Tools */}
          <TabsContent value="analysis" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredApps("analysis").map((app) => (
                <Card key={app.id} className="bg-surface border-gray-700 hover:border-primary/50 transition-colors">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="bg-primary/10 p-2 rounded-lg">
                          <app.icon className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-lg font-semibold text-gray-100">{app.name}</CardTitle>
                          <Badge className={getCategoryColor(app.category)} variant="outline">
                            {app.category}
                          </Badge>
                        </div>
                      </div>
                      <Badge className={getStatusColor(app.status)}>
                        {app.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-400 text-sm mb-4">{app.description}</p>

                    <div className="space-y-2 text-xs text-gray-400 mb-4">
                      <div className="flex justify-between">
                        <span>Port:</span>
                        <span>{app.port}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Image:</span>
                        <span className="truncate ml-2">{app.dockerImage}</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {app.status === 'running' ? (
                        <>
                          <Button 
                            size="sm" 
                            className="flex-1 bg-primary hover:bg-primary/90"
                            onClick={() => openApp(app)}
                          >
                            <ExternalLink className="h-3 w-3 mr-1" />
                            Open
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="border-gray-600 text-gray-300"
                            onClick={() => handleStopApp(app)}
                          >
                            <PowerOff className="h-3 w-3" />
                          </Button>
                        </>
                      ) : (
                        <Button 
                          size="sm" 
                          className="flex-1 bg-success hover:bg-success/90"
                          onClick={() => handleStartApp(app)}
                        >
                          <Power className="h-3 w-3 mr-1" />
                          Start
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Docker Management */}
        <Card className="bg-surface border-gray-700 mt-8">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-100">Docker Management</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="space-y-4">
                <h4 className="text-gray-100 font-medium">System Status</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Docker Version:</span>
                    <span className="text-gray-300">24.0.7</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Running Containers:</span>
                    <span className="text-gray-300">{integrationApps.filter(app => app.status === 'running').length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Images Pulled:</span>
                    <span className="text-gray-300">{integrationApps.length}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-gray-100 font-medium">Quick Actions</h4>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full border-gray-600 text-gray-300 justify-start">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Pull Latest Images
                  </Button>
                  <Button variant="outline" className="w-full border-gray-600 text-gray-300 justify-start">
                    <PowerOff className="h-4 w-4 mr-2" />
                    Stop All Containers
                  </Button>
                  <Button variant="outline" className="w-full border-gray-600 text-gray-300 justify-start">
                    <Database className="h-4 w-4 mr-2" />
                    Clean Up Images
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-gray-100 font-medium">Resource Usage</h4>
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-gray-400 text-sm">CPU</span>
                      <span className="text-gray-300 text-sm">25%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-700 rounded-full">
                      <div className="h-2 bg-warning rounded-full" style={{ width: "25%" }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-gray-400 text-sm">Memory</span>
                      <span className="text-gray-300 text-sm">3.2GB</span>
                    </div>
                    <div className="w-full h-2 bg-gray-700 rounded-full">
                      <div className="h-2 bg-primary rounded-full" style={{ width: "40%" }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}