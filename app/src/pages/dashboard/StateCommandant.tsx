import { useState } from "react";

import { DashboardLayout } from "@/components/DashboardLayout";
import { DashboardStats } from "@/components/dashboard/StatCards";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { trpc } from "@/providers/trpc";
import { Search, Printer } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function StateCommandantDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [search, setSearch] = useState("");
  const [platoonFilter, setPlatoonFilter] = useState<string>("");
  const { data: stats } = trpc.stats.dashboard.useQuery();
  const { data: batches } = trpc.batches.list.useQuery();
  const { data: members } = trpc.corpsMembers.list.useQuery({
    search: search || undefined,
    platoon: platoonFilter ? Number(platoonFilter) : undefined,
  });
  const { user } = useAuth();

  const activeBatch = batches?.find((b) => b.isActive);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">State Commandant Dashboard</h1>
          <p className="text-gray-600">Read-only access to corps member data and reports</p>
        </div>

        {stats && <DashboardStats stats={stats} />}

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-white border">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="members">Corps Members</TabsTrigger>
            <TabsTrigger value="batches">Batches</TabsTrigger>
            <TabsTrigger value="reports">Print Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>System Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm text-gray-600">Active Batch</p>
                    <p className="font-medium text-lg">{activeBatch?.name || "None"}</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm text-gray-600">Total Corps Members</p>
                    <p className="font-medium text-lg">{stats?.totalCorpsMembers || 0}</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm text-gray-600">Your State</p>
                    <p className="font-medium text-lg capitalize">{user?.state || "N/A"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="members" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Corps Members</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-3 mb-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Search by name, state code, or call-up number"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  <Select value={platoonFilter} onValueChange={setPlatoonFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Platoon" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Platoons</SelectItem>
                      {Array.from({ length: 10 }, (_, i) => i + 1).map((p) => (
                        <SelectItem key={p} value={String(p)}>Platoon {p}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>State Code</TableHead>
                      <TableHead>Platoon</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {members?.map((member) => (
                      <TableRow key={member.id}>
                        <TableCell className="font-medium">
                          {member.surname} {member.otherNames}
                        </TableCell>
                        <TableCell>{member.stateCode}</TableCell>
                        <TableCell>Platoon {member.platoon}</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Badge variant={member.isEvaluatedByPlatoon ? "default" : "secondary"} className={member.isEvaluatedByPlatoon ? "bg-green-100 text-green-700" : ""}>
                              PI
                            </Badge>
                            <Badge variant={member.isEvaluatedByManOWar ? "default" : "secondary"} className={member.isEvaluatedByManOWar ? "bg-blue-100 text-blue-700" : ""}>
                              MOW
                            </Badge>
                            <Badge variant={member.hasSoldierComment ? "default" : "secondary"} className={member.hasSoldierComment ? "bg-amber-100 text-amber-700" : ""}>
                              S
                            </Badge>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="batches" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Batches</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Year</TableHead>
                      <TableHead>State</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {batches?.map((batch) => (
                      <TableRow key={batch.id}>
                        <TableCell className="font-medium">{batch.name}</TableCell>
                        <TableCell>{batch.year}</TableCell>
                        <TableCell className="capitalize">{batch.state}</TableCell>
                        <TableCell>
                          <Badge variant={batch.isActive ? "default" : "secondary"} className={batch.isActive ? "bg-green-100 text-green-700" : ""}>
                            {batch.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Print Reports</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">Generate official evaluation reports with state commandant signature.</p>
                <Button onClick={() => window.print()} className="bg-[#004d00] hover:bg-[#003300]">
                  <Printer className="w-4 h-4 mr-2" />
                  Print Reports
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
