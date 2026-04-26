import { Card, CardContent } from "@/components/ui/card";
import { Users, Layers, ClipboardList, MessageSquare, CheckCircle2, Shield } from "lucide-react";

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  description?: string;
  color?: string;
}

export function StatCard({ title, value, icon, description, color = "bg-[#004d00]" }: StatCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">{title}</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
            {description && <p className="text-xs text-gray-500 mt-1">{description}</p>}
          </div>
          <div className={`w-12 h-12 ${color} rounded-lg flex items-center justify-center text-white`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function DashboardStats({ stats }: { stats: Record<string, number | string> }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.totalUsers !== undefined && (
        <StatCard title="Total Users" value={stats.totalUsers} icon={<Users className="w-6 h-6" />} />
      )}
      {stats.totalCommandants !== undefined && (
        <StatCard title="Commandants" value={stats.totalCommandants} icon={<Shield className="w-6 h-6" />} />
      )}
      {stats.totalBatches !== undefined && (
        <StatCard title="Total Batches" value={stats.totalBatches} icon={<Layers className="w-6 h-6" />} />
      )}
      {stats.totalCorpsMembers !== undefined && (
        <StatCard title="Corps Members" value={stats.totalCorpsMembers} icon={<Users className="w-6 h-6" />} />
      )}
      {stats.evaluatedByPlatoon !== undefined && (
        <StatCard
          title="Platoon Evaluated"
          value={stats.evaluatedByPlatoon}
          icon={<CheckCircle2 className="w-6 h-6" />}
          color="bg-green-600"
        />
      )}
      {stats.evaluatedByManOWar !== undefined && (
        <StatCard
          title="Man O'War Evaluated"
          value={stats.evaluatedByManOWar}
          icon={<CheckCircle2 className="w-6 h-6" />}
          color="bg-blue-600"
        />
      )}
      {stats.withSoldierComment !== undefined && (
        <StatCard
          title="With Comments"
          value={stats.withSoldierComment}
          icon={<MessageSquare className="w-6 h-6" />}
          color="bg-amber-600"
        />
      )}
      {stats.withCommandantComment !== undefined && (
        <StatCard
          title="Commandant Comments"
          value={stats.withCommandantComment}
          icon={<ClipboardList className="w-6 h-6" />}
          color="bg-purple-600"
        />
      )}
    </div>
  );
}
