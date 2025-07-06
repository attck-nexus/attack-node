import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { 
  Shield, 
  BarChart3, 
  Bug, 
  Target, 
  Bot, 
  Settings, 
  Monitor,
  Gauge
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/", icon: Gauge },
  { name: "Programs & Targets", href: "/programs", icon: Target },
  { name: "Vulnerability Reports", href: "/vulnerabilities", icon: Bug },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
];

const integrations = [
  { name: "AI Agents", href: "/ai-agents", icon: Bot },
  { name: "Burp Suite", href: "/burp", icon: Shield },
  { name: "Kali Environment", href: "/kali", icon: Monitor },
];

const settings = [
  { name: "Configuration", href: "/settings", icon: Settings },
];

export default function Sidebar() {
  const [location] = useLocation();

  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-surface border-r border-gray-700 z-50">
      <div className="p-6 border-b border-gray-700">
        <h1 className="text-xl font-bold text-primary">BugBounty Command</h1>
        <p className="text-xs text-gray-400 mt-1">Multi-Agent Security Platform</p>
      </div>
      
      <nav className="mt-6">
        <div className="px-6 py-2 text-xs font-medium text-gray-400 uppercase tracking-wider">
          Main
        </div>
        {navigation.map((item) => {
          const isActive = location === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center px-6 py-3 text-gray-300 hover:bg-card hover:text-gray-100 transition-colors",
                isActive && "bg-primary/10 text-gray-100 border-r-2 border-primary"
              )}
            >
              <item.icon className="h-5 w-5 mr-3" />
              {item.name}
            </Link>
          );
        })}
        
        <div className="px-6 py-2 text-xs font-medium text-gray-400 uppercase tracking-wider mt-6">
          Integrations
        </div>
        {integrations.map((item) => {
          const isActive = location === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center px-6 py-3 text-gray-300 hover:bg-card hover:text-gray-100 transition-colors",
                isActive && "bg-primary/10 text-gray-100 border-r-2 border-primary"
              )}
            >
              <item.icon className="h-5 w-5 mr-3" />
              {item.name}
            </Link>
          );
        })}
        
        <div className="px-6 py-2 text-xs font-medium text-gray-400 uppercase tracking-wider mt-6">
          Settings
        </div>
        {settings.map((item) => {
          const isActive = location === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center px-6 py-3 text-gray-300 hover:bg-card hover:text-gray-100 transition-colors",
                isActive && "bg-primary/10 text-gray-100 border-r-2 border-primary"
              )}
            >
              <item.icon className="h-5 w-5 mr-3" />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
