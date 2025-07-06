import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Monitor, 
  Play, 
  Square, 
  Pause, 
  RotateCcw, 
  Settings, 
  ExternalLink, 
  Terminal, 
  Globe, 
  Shield,
  Power,
  PowerOff,
  RefreshCw,
  Download,
  Upload,
  FolderOpen,
  Users,
  Activity
} from "lucide-react";

export default function KaliEnvironment() {
  const [isRunning, setIsRunning] = useState(true);
  const [showConfig, setShowConfig] = useState(false);
  const [vncPassword, setVncPassword] = useState("password");
  const [containerPort, setContainerPort] = useState("6901");

  const handleStart = () => {
    setIsRunning(true);
    // Here we would integrate with Docker API to start the container
  };

  const handleStop = () => {
    setIsRunning(false);
    // Here we would integrate with Docker API to stop the container
  };

  const handleRestart = () => {
    // Here we would restart the Docker container
  };

  const openVNC = () => {
    window.open(`http://localhost:${containerPort}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-dark">
      {/* Header */}
      <header className="bg-surface border-b border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-100">Kali Linux Environment</h2>
            <p className="text-gray-400 mt-1">Persistent penetration testing environment via Docker</p>
          </div>
          <div className="flex items-center space-x-4">
            <Badge className={isRunning ? "bg-success/10 text-success" : "bg-error/10 text-error"}>
              {isRunning ? "Running" : "Stopped"}
            </Badge>
            <Dialog open={showConfig} onOpenChange={setShowConfig}>
              <DialogTrigger asChild>
                <Button variant="outline" className="border-gray-600 text-gray-300">
                  <Settings className="h-4 w-4 mr-2" />
                  Configure
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md bg-surface border-gray-700">
                <DialogHeader>
                  <DialogTitle className="text-gray-100">Environment Configuration</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-300 mb-2 block">VNC Password</label>
                    <Input
                      value={vncPassword}
                      onChange={(e) => setVncPassword(e.target.value)}
                      type="password"
                      className="bg-card border-gray-600 text-gray-100"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-300 mb-2 block">Container Port</label>
                    <Input
                      value={containerPort}
                      onChange={(e) => setContainerPort(e.target.value)}
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
        {/* Control Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Environment Status */}
          <Card className="bg-surface border-gray-700">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-100 flex items-center">
                <Monitor className="h-5 w-5 mr-2" />
                Environment Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Status</span>
                  <Badge className={isRunning ? "bg-success/10 text-success" : "bg-error/10 text-error"}>
                    {isRunning ? "Running" : "Stopped"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Port</span>
                  <span className="text-gray-300">{containerPort}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Uptime</span>
                  <span className="text-gray-300">{isRunning ? "2h 34m" : "0m"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Memory Usage</span>
                  <span className="text-gray-300">{isRunning ? "1.2GB" : "0MB"}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="bg-surface border-gray-700">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-100">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {!isRunning ? (
                  <Button 
                    onClick={handleStart}
                    className="w-full bg-success hover:bg-success/90 text-white"
                  >
                    <Power className="h-4 w-4 mr-2" />
                    Start Environment
                  </Button>
                ) : (
                  <>
                    <Button 
                      onClick={openVNC}
                      className="w-full bg-primary hover:bg-primary/90 text-white"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Open VNC Desktop
                    </Button>
                    <Button 
                      onClick={handleRestart}
                      variant="outline" 
                      className="w-full border-gray-600 text-gray-300"
                    >
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Restart
                    </Button>
                    <Button 
                      onClick={handleStop}
                      variant="destructive" 
                      className="w-full"
                    >
                      <PowerOff className="h-4 w-4 mr-2" />
                      Stop Environment
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Resource Usage */}
          <Card className="bg-surface border-gray-700">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-100 flex items-center">
                <Activity className="h-5 w-5 mr-2" />
                Resource Usage
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-400 text-sm">CPU</span>
                    <span className="text-gray-300 text-sm">15%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-700 rounded-full">
                    <div className="h-2 bg-primary rounded-full" style={{ width: "15%" }} />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-400 text-sm">Memory</span>
                    <span className="text-gray-300 text-sm">24%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-700 rounded-full">
                    <div className="h-2 bg-warning rounded-full" style={{ width: "24%" }} />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-400 text-sm">Disk</span>
                    <span className="text-gray-300 text-sm">8%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-700 rounded-full">
                    <div className="h-2 bg-success rounded-full" style={{ width: "8%" }} />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tools and Applications */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Pre-installed Tools */}
          <Card className="bg-surface border-gray-700">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-100">Pre-installed Tools</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" className="border-gray-600 text-gray-300 justify-start">
                  <Terminal className="h-4 w-4 mr-2" />
                  Terminal
                </Button>
                <Button variant="outline" className="border-gray-600 text-gray-300 justify-start">
                  <Globe className="h-4 w-4 mr-2" />
                  Firefox ESR
                </Button>
                <Button variant="outline" className="border-gray-600 text-gray-300 justify-start">
                  <Shield className="h-4 w-4 mr-2" />
                  Burp Suite
                </Button>
                <Button variant="outline" className="border-gray-600 text-gray-300 justify-start">
                  <Monitor className="h-4 w-4 mr-2" />
                  OWASP ZAP
                </Button>
                <Button variant="outline" className="border-gray-600 text-gray-300 justify-start">
                  <Terminal className="h-4 w-4 mr-2" />
                  Metasploit
                </Button>
                <Button variant="outline" className="border-gray-600 text-gray-300 justify-start">
                  <Shield className="h-4 w-4 mr-2" />
                  Nmap
                </Button>
                <Button variant="outline" className="border-gray-600 text-gray-300 justify-start">
                  <Globe className="h-4 w-4 mr-2" />
                  Wireshark
                </Button>
                <Button variant="outline" className="border-gray-600 text-gray-300 justify-start">
                  <Terminal className="h-4 w-4 mr-2" />
                  Nikto
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* File Management */}
          <Card className="bg-surface border-gray-700">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-100">File Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-card rounded-lg">
                  <div className="flex items-center">
                    <FolderOpen className="h-5 w-5 text-primary mr-3" />
                    <div>
                      <p className="text-gray-100 font-medium">/home/kali</p>
                      <p className="text-gray-400 text-sm">User directory</p>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" className="border-gray-600 text-gray-300">
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <Button variant="outline" className="border-gray-600 text-gray-300">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Files
                  </Button>
                  <Button variant="outline" className="border-gray-600 text-gray-300">
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
                
                <div className="p-3 bg-card rounded-lg">
                  <p className="text-gray-400 text-sm mb-2">Persistent Volume</p>
                  <p className="text-gray-100">All files are automatically saved</p>
                  <p className="text-gray-400 text-xs">Located at: /persistent-data</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Docker Configuration */}
        <Card className="bg-surface border-gray-700">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-100">Docker Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-card p-4 rounded-lg">
                <h4 className="text-gray-100 font-medium mb-2">Current Configuration</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Image:</span>
                    <span className="text-gray-300">kasmweb/kali-rolling-desktop:1.17.0</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Port Mapping:</span>
                    <span className="text-gray-300">{containerPort}:6901</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Memory Limit:</span>
                    <span className="text-gray-300">4GB</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Shared Memory:</span>
                    <span className="text-gray-300">512MB</span>
                  </div>
                </div>
              </div>

              <div className="bg-card p-4 rounded-lg">
                <h4 className="text-gray-100 font-medium mb-2">Docker Command</h4>
                <code className="text-xs text-gray-400 bg-gray-800 p-2 rounded block font-mono">
                  docker run --rm -it --shm-size=512m -p {containerPort}:6901 -e VNC_PW={vncPassword} -v /persistent-data:/home/kali/data kasmweb/kali-rolling-desktop:1.17.0
                </code>
              </div>

              <div className="flex gap-3">
                <Button className="bg-primary hover:bg-primary/90">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Update Image
                </Button>
                <Button variant="outline" className="border-gray-600 text-gray-300">
                  <Settings className="h-4 w-4 mr-2" />
                  Advanced Settings
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}