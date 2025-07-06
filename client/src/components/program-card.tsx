import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { type Program } from "@shared/schema";
import { Building, Globe, DollarSign } from "lucide-react";

interface ProgramCardProps {
  program: Program;
  onSelect?: (program: Program) => void;
}

const statusColors = {
  active: "bg-success/10 text-success",
  paused: "bg-warning/10 text-warning",
  ended: "bg-error/10 text-error"
};

export default function ProgramCard({ program, onSelect }: ProgramCardProps) {
  const handleClick = () => {
    if (onSelect) {
      onSelect(program);
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
  };

  const getColorFromName = (name: string) => {
    const colors = ['bg-blue-600', 'bg-green-600', 'bg-red-600', 'bg-purple-600', 'bg-yellow-600', 'bg-indigo-600'];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  return (
    <Card 
      className="bg-surface border-gray-700 hover:bg-card cursor-pointer transition-colors"
      onClick={handleClick}
    >
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-medium mr-3 ${getColorFromName(program.name)}`}>
              {getInitials(program.name)}
            </div>
            <div>
              <h3 className="font-medium text-gray-100">{program.name}</h3>
              <p className="text-sm text-gray-400 flex items-center">
                <Globe className="h-3 w-3 mr-1" />
                {program.url}
              </p>
            </div>
          </div>
          <Badge 
            variant="secondary" 
            className={`${statusColors[program.status as keyof typeof statusColors]} px-2 py-1 text-xs font-medium`}
          >
            {program.status}
          </Badge>
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center text-gray-400">
            <Building className="h-4 w-4 mr-2" />
            <span>{program.platform}</span>
          </div>
          <div className="flex items-center text-gray-400">
            <DollarSign className="h-4 w-4 mr-2" />
            <span>${program.minReward} - ${program.maxReward}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
