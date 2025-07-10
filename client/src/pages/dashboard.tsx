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
  const [unreadNotifications, setUnreadNotifications] = useState(3);
  
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/dashboard/stats"],
  });

  const { data: vulnerabilities, isLoading: vulnsLoading } = useQuery({
    queryKey: ["/api/vulnerabilities"],
  });

  const { data: programs, isLoading: programsLoading } = useQuery({
    queryKey: ["/api/programs"],
  });

  const { data: aiAgents, isLoading: agentsLoading } = useQuery({
    queryKey: ["/api/ai-agents"],
  });

  const recentVulnerabilities = vulnerabilities?.slice(0, 3) || [];
  const activePrograms = programs?.filter((p: any) => p.status === 'active').slice(0, 3) || [];
  const agentsList = aiAgents?.slice(0, 3) || [];

  // Sample notifications data
  const notifications = [
    {
      id: 1,
      type: 'success',
      title: 'Vulnerability Confirmed',
      message: 'Your XSS vulnerability report on Target Alpha has been triaged as P2',
      time: '5 minutes ago',
      read: false,
      icon: CheckCircle
    },
    {
      id: 2,
      type: 'warning',
      title: 'Agent Status Alert',
      message: 'OpenAI Agent has been offline for 15 minutes',
      time: '1 hour ago',
      read: false,
      icon: AlertCircle
    },
    {
      id: 3,
      type: 'info',
      title: 'New Program Available',
      message: 'Microsoft has launched a new bug bounty program with up to $100k rewards',
      time: '2 hours ago',
      read: false,
      icon: Info
    }
  ];

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
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center text-gray-400">
                      No new notifications
                    </div>
                  ) : (
                    notifications.map((notification) => (
                      <DropdownMenuItem
                        key={notification.id}
                        className="p-4 cursor-pointer hover:bg-card focus:bg-card"
                        onClick={() => handleNotificationClick(notification.id)}
                      >
                        <div className="flex items-start space-x-3 w-full">
                          <notification.icon 
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
                
                {notifications.length > 0 && (
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
            value={stats?.totalPrograms || 0}
            icon={Target}
            trend="+2 this week"
            iconColor="text-primary"
          />
          <StatsCard
            title="Total Vulnerabilities"
            value={stats?.totalVulnerabilities || 0}
            icon={Bug}
            trend="+15 this month"
            iconColor="text-secondary"
          />
          <StatsCard
            title="Total Rewards"
            value={stats?.totalRewards ? `$${stats.totalRewards.toLocaleString()}` : "$0"}
            icon={DollarSign}
            trend="+$2,500 this week"
            iconColor="text-success"
          />
          <StatsCard
            title="Avg. Response Time"
            value={`${stats?.avgResponseTime || 0} days`}
            icon={Clock}
            trend="-0.5 days improvement"
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
                {recentVulnerabilities.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    No vulnerabilities found. Create your first report to get started.
                  </div>
                ) : (
                  recentVulnerabilities.map((vulnerability: any) => (
                    <VulnerabilityCard key={vulnerability.id} vulnerability={vulnerability} />
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
                {activePrograms.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    No active programs found. Add your first program to get started.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-700">
                          <th className="text-left text-gray-400 font-medium pb-3">Program</th>
                          <th className="text-left text-gray-400 font-medium pb-3">Platform</th>
                          <th className="text-left text-gray-400 font-medium pb-3">Status</th>
                          <th className="text-left text-gray-400 font-medium pb-3">Rewards</th>
                        </tr>
                      </thead>
                      <tbody>
                        {activePrograms.map((program: any) => (
                          <tr key={program.id} className="border-b border-gray-700 hover:bg-card">
                            <td className="py-3">
                              <div className="flex items-center">
                                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-xs font-medium mr-3">
                                  {program.name.charAt(0)}
                                </div>
                                <div>
                                  <p className="font-medium text-gray-100">{program.name}</p>
                                  <p className="text-sm text-gray-400">{program.url}</p>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 text-gray-300">{program.platform}</td>
                            <td className="py-3">
                              <Badge className="bg-success/10 text-success">
                                {program.status}
                              </Badge>
                            </td>
                            <td className="py-3 text-gray-300">
                              ${program.minReward} - ${program.maxReward}
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

          {/* Kali Environment */}
          <Card className="bg-surface border-gray-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold text-gray-100">
                  Kali Environment
                </CardTitle>
                <Button variant="link" className="text-primary hover:text-primary/80 p-0">
                  Manage
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-card rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-400">Status</span>
                    <span className="text-success text-sm">Running</span>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-400">Port</span>
                    <span className="text-gray-300 text-sm">6901</span>
                  </div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm text-gray-400">Uptime</span>
                    <span className="text-gray-300 text-sm">2h 34m</span>
                  </div>
                  <div className="flex space-x-2">
                    <Button className="bg-primary hover:bg-primary/90 text-white flex-1">
                      <ExternalLink className="h-3 w-3 mr-1" />
                      Open VNC
                    </Button>
                    <Button variant="outline" size="icon" className="border-gray-600 text-gray-300">
                      <Square className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                <div className="bg-card rounded-lg p-4">
                  <h4 className="font-medium text-gray-100 mb-2">Quick Actions</h4>
                  <div className="space-y-2">
                    <button className="w-full text-left text-sm text-gray-300 hover:text-gray-100 py-1">
                      <span className="mr-2">🖥️</span>
                      Open Terminal
                    </button>
                    <button className="w-full text-left text-sm text-gray-300 hover:text-gray-100 py-1">
                      <span className="mr-2">🌐</span>
                      Launch Browser
                    </button>
                    <button className="w-full text-left text-sm text-gray-300 hover:text-gray-100 py-1">
                      <span className="mr-2">🛡️</span>
                      Start Burp Suite
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
                {stats?.vulnerabilityTrends?.map((trend: any) => (
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
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-success rounded-full mt-2" />
                  <div>
                    <p className="text-sm text-gray-100">New program added</p>
                    <p className="text-xs text-gray-400">2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2" />
                  <div>
                    <p className="text-sm text-gray-100">AI agent configured</p>
                    <p className="text-xs text-gray-400">4 hours ago</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-warning rounded-full mt-2" />
                  <div>
                    <p className="text-sm text-gray-100">Vulnerability report generated</p>
                    <p className="text-xs text-gray-400">6 hours ago</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
