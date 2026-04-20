import { LucideIcon } from "lucide-react";
import { Card } from "@/ui/card";

interface RevenueCardProps {
  title: string;
  subtitle: string;
  value: string;
  change: string;
  icon: LucideIcon;
  iconBg?: string;
}

const RevenueCard = ({ title, subtitle, value, change, icon: Icon, iconBg = "bg-primary/10 text-primary" }: RevenueCardProps) => {
  return (
    <Card className="p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <span className="text-xs font-medium text-success">+{change}%</span>
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${iconBg}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <p className="text-3xl font-bold text-card-foreground text-right">{value}</p>
      <p className="text-sm font-semibold text-card-foreground text-right mt-1">{title}</p>
      <p className="text-xs text-muted-foreground text-right">{subtitle}</p>
    </Card>
  );
};

export default RevenueCard;
