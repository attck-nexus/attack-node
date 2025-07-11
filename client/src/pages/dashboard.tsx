import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import StatsCard from "@/components/stats-card";
import VulnerabilityCard from "@/components/vulnerability-card";
import AiAgentStatus from "@/components/ai-agent-status";
import { Target, Bug, DollarSign, Clock, Plus, Bell, ExternalLink, Play, Square, CheckCircle, AlertCircle, Info } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function Dashboard() {
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/dashboard/stats"],
  });

  const { data: beacons, isLoading: beaconsLoading } = useQuery({
    queryKey: ["/api/beacons"],
  });

  const { data: operations, isLoading: operationsLoading } = useQuery({
    queryKey: ["/api/operations"],
  });

  const { data: aiAgents, isLoading: agentsLoading } = useQuery({
    queryKey: ["/api/ai-agents"],
  });

  const recentBeacons = Array.isArray(beacons) ? beacons.slice(0, 3) : [];
  const activeOperations = Array.isArray(operations) ? operations.filter((p: any) => p.status === 'active').slice(0, 3) : [];
  const agentsList = Array.isArray(aiAgents) ? aiAgents.slice(0, 3) : [];

  // Load notifications from API
  const { data: notifications = [] } = useQuery({
    queryKey: ["/api/notifications"],
  });
  const notificationsList = Array.isArray(notifications) ? notifications : [];

  // Load recent activity from API
  const { data: recentActivity = [] } = useQuery({
    queryKey: ["/api/dashboard/activity"],
  });
  const activityList = Array.isArray(recentActivity) ? recentActivity : [];

  const handleMarkAllAsRead = () => {
    setUnreadNotifications(0);
  };

  const handleNotificationClick = (notificationId: number) => {
    // Mark individual notification as read
    console.log('Notification clicked:', notificationId);
  };

  if (statsLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-400">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark">
      {/* Header */}
      <header className="bg-surface border-b border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-100">Dashboard</h2>
            <p className="text-gray-400 mt-1">Welcome back, Security Researcher</p>
          </div>
          <div className="flex items-center space-x-4">
            <Button className="bg-primary hover:bg-primary/90 text-white">
              <Plus className="h-4 w-4 mr-2" />
              New Report
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="relative">
                  <Button variant="outline" size="icon" className="bg-card border-gray-600 text-gray-100 hover:bg-gray-700">
                    <Bell className="h-4 w-4" />
                  </Button>
                  {unreadNotifications > 0 && (
                    <span className="absolute -top-2 -right-2 bg-error text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {unreadNotifications}
                    </span>
                  )}
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-96 bg-surface border-gray-700" align="end">
                <DropdownMenuLabel className="flex items-center justify-between p-4 pb-2">
                  <span className="text-lg font-semibold text-gray-100">Notifications</span>
                  {unreadNotifications > 0 && (
                    <Button
                      variant="link"
                      size="sm"
                      className="text-primary hover:text-primary/80 p-0 h-auto"
                      onClick={handleMarkAllAsRead}
                    >
                      Mark all as read
                    </Button>
                  )}
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-gray-700" />
                
                <div className="max-h-96 overflow-y-auto">
                  {notificationsList.length === 0 ? (
                    <div className="p-8 text-center text-gray-400">
                      No new notifications
                    </div>
                  ) : (
                    notificationsList.map((notification: any) => (
                      <DropdownMenuItem
                        key={notification.id}
                        className="p-4 cursor-pointer hover:bg-card focus:bg-card"
                        onClick={() => handleNotificationClick(notification.id)}
                      >
                        <div className="flex items-start space-x-3 w-full">
                          <Info 
                            className={`h-5 w-5 mt-0.5 ${
                              notification.type === 'success' ? 'text-success' :
                              notification.type === 'warning' ? 'text-warning' :
                              'text-info'
                            }`} 
                          />
                          <div className="flex-1 space-y-1">
                            <p className="text-sm font-medium text-gray-100">
                              {notification.title}
                            </p>
                            <p className="text-sm text-gray-400 line-clamp-2">
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-500">
                              {notification.time}
                            </p>
                          </div>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-primary rounded-full mt-1.5" />
                          )}
                        </div>
                      </DropdownMenuItem>
                    ))
                  )}
                </div>
                
                {notificationsList.length > 0 && (
                  <>
                    <DropdownMenuSeparator className="bg-gray-700" />
                    <DropdownMenuItem className="p-3 text-center hover:bg-card focus:bg-card cursor-pointer">
                      <span className="text-sm text-primary hover:text-primary/80">
                        View all notifications
                      </span>
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-medium">
              SR
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Active Programs"
            value={(stats as any)?.totalPrograms || 0}
            icon={Target}
            trend={(stats as any)?.programsTrend || ""}
            iconColor="text-primary"
          />
          <StatsCard
            title="Total Vulnerabilities"
            value={(stats as any)?.totalVulnerabilities || 0}
            icon={Bug}
            trend={(stats as any)?.vulnerabilitiesTrend || ""}
            iconColor="text-secondary"
          />
          <StatsCard
            title="Total Rewards"
            value={(stats as any)?.totalRewards ? `$${(stats as any).totalRewards.toLocaleString()}` : "$0"}
            icon={DollarSign}
            trend={(stats as any)?.rewardsTrend || ""}
            iconColor="text-success"
          />
          <StatsCard
            title="Avg. Response Time"
            value={`${(stats as any)?.avgResponseTime || 0} days`}
            icon={Clock}
            trend={(stats as any)?.responseTimeTrend || ""}
            iconColor="text-warning"
          />
        </div>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Recent Vulnerabilities */}
          <Card className="bg-surface border-gray-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold text-gray-100">
                  Recent Vulnerabilities
                </CardTitle>
                <Button variant="link" className="text-primary hover:text-primary/80 p-0">
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentBeacons.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    No beacons found. Create your first beacon to get started.
                  </div>
                ) : (
                  recentBeacons.map((beacon: any) => (
                    <VulnerabilityCard key={beacon.id} vulnerability={beacon} />
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* AI Agent Status */}
          <Card className="bg-surface border-gray-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold text-gray-100">
                  AI Agent Status
                </CardTitle>
                <Button variant="link" className="text-primary hover:text-primary/80 p-0">
                  Configure
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {agentsList.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    No AI agents configured. Set up your first agent to get started.
                  </div>
                ) : (
                  agentsList.map((agent: any) => (
                    <AiAgentStatus key={agent.id} agent={agent} />
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Programs Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <Card className="bg-surface border-gray-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold text-gray-100">
                    Active Programs
                  </CardTitle>
                  <Button className="bg-primary hover:bg-primary/90 text-white">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Program
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {activeOperations.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    No active operations found. Add your first operation to get started.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-700">
                          <th className="text-left text-gray-400 font-medium pb-3">Operation</th>
                          <th className="text-left text-gray-400 font-medium pb-3">Platform</th>
                          <th className="text-left text-gray-400 font-medium pb-3">Status</th>
                          <th className="text-left text-gray-400 font-medium pb-3">Rewards</th>
                        </tr>
                      </thead>
                      <tbody>
                        {activeOperations.map((operation: any) => (
                          <tr key={operation.id} className="border-b border-gray-700 hover:bg-card">
                            <td className="py-3">
                              <div className="flex items-center">
                                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-xs font-medium mr-3">
                                  {operation.name.charAt(0)}
                                </div>
                                <div>
                                  <p className="font-medium text-gray-100">{operation.name}</p>
                                  <p className="text-sm text-gray-400">{operation.url}</p>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 text-gray-300">{operation.platform}</td>
                            <td className="py-3">
                              <Badge className="bg-success/10 text-success">
                                {operation.status}
                              </Badge>
                            </td>
                            <td className="py-3 text-gray-300">
                              ${operation.minReward} - ${operation.maxReward}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Docker Environment */}
          <Card className="bg-surface border-gray-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold text-gray-100">
                  Docker Environment
                </CardTitle>
                <Button variant="link" className="text-primary hover:text-primary/80 p-0">
                  Manage
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-card rounded-lg p-4">
                  <div className="text-center py-8 text-gray-400">
                    No containers running. Start a Docker environment to see status here.
                  </div>
                </div>

                <div className="bg-card rounded-lg p-4">
                  <h4 className="font-medium text-gray-100 mb-2">Available Environments</h4>
                  <div className="space-y-2">
                    <button 
                      className="w-full text-left text-sm text-gray-300 hover:text-gray-100 py-1"
                      onClick={() => window.location.href = '/kali-environment'}
                    >
                      <span className="mr-2">🐉</span>
                      Kali Linux Desktop
                    </button>
                    <button 
                      className="w-full text-left text-sm text-gray-300 hover:text-gray-100 py-1"
                      onClick={() => window.location.href = '/burp-suite'}
                    >
                      <span className="mr-2">🛡️</span>
                      Burp Suite Professional
                    </button>
                    <button 
                      className="w-full text-left text-sm text-gray-300 hover:text-gray-100 py-1"
                      onClick={() => window.location.href = '/integrations'}
                    >
                      <span className="mr-2">🔧</span>
                      Manage Integrations
                    </button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Analytics Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Vulnerability Trends */}
          <Card className="bg-surface border-gray-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold text-gray-100">
                  Vulnerability Trends
                </CardTitle>
                <select className="bg-card border border-gray-600 rounded px-3 py-1 text-sm text-gray-100">
                  <option>Last 30 days</option>
                  <option>Last 90 days</option>
                  <option>Last year</option>
                </select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {(stats as any)?.vulnerabilityTrends?.map((trend: any) => (
                  <div key={trend.severity} className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">
                      {trend.severity === 'P1' && 'Critical (P1)'}
                      {trend.severity === 'P2' && 'High (P2)'}
                      {trend.severity === 'P3' && 'Medium (P3)'}
                      {trend.severity === 'P4' && 'Low (P4)'}
                    </span>
                    <div className="flex items-center">
                      <div className="w-24 h-2 bg-gray-700 rounded-full mr-3">
                        <div 
                          className={`h-2 rounded-full ${
                            trend.severity === 'P1' ? 'bg-error' :
                            trend.severity === 'P2' ? 'bg-warning' :
                            trend.severity === 'P3' ? 'bg-primary' : 'bg-success'
                          }`}
                          style={{ width: `${Math.min(100, (trend.count / 50) * 100)}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-300">{trend.count}</span>
                    </div>
                  </div>
                )) || (
                  <div className="text-center py-8 text-gray-400">
                    No vulnerability data available.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="bg-surface border-gray-700">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-100">
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activityList.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    No recent activity found.
                  </div>
                ) : (
                  activityList.map((activity: any, index: number) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className={`w-2 h-2 rounded-full mt-2 ${
                        activity.type === 'success' ? 'bg-success' :
                        activity.type === 'warning' ? 'bg-warning' :
                        activity.type === 'error' ? 'bg-error' :
                        'bg-primary'
                      }`} />
                      <div>
                        <p className="text-sm text-gray-100">{activity.description}</p>
                        <p className="text-xs text-gray-400">{activity.timestamp}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
