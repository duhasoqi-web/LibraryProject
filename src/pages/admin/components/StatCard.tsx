import { LucideIcon } from "lucide-react";
import { Card } from "@/ui/card";

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  changeType: "positive" | "negative";
  icon: LucideIcon;
  iconBg?: string;
}

const StatCard = ({ title, value, change, changeType, icon: Icon, iconBg = "bg-primary/10 text-primary" }: StatCardProps) => {
  return (
    <Card className="p-5 flex items-center justify-between hover:shadow-md transition-shadow">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${iconBg}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div className="text-right">
        <div className="flex items-center gap-2 justify-end mb-1">
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
            changeType === "positive" 
              ? "bg-success/10 text-success" 
              : "bg-destructive/10 text-destructive"
          }`}>
            {changeType === "positive" ? "+" : ""}{change}
          </span>
        </div>
        <p className="text-2xl font-bold text-card-foreground">{value}</p>
        <p className="text-sm text-muted-foreground">{title}</p>
      </div>
    </Card>
  );
};

export default StatCard;
