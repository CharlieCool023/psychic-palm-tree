import { useState, useEffect } from "react";

import { DashboardLayout } from "@/components/DashboardLayout";
import { DashboardStats } from "@/components/dashboard/StatCards";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { trpc } from "@/providers/trpc";
import { Plus, Search, Eye, Download, Printer, UserPlus, Loader2 } from "lucide-react";
import { RoleLabels } from "@contracts/constants";

export default function CampCommandantDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [search, setSearch] = useState("");
  const [platoonFilter, setPlatoonFilter] = useState<string>("");
  const [batchId, setBatchId] = useState<string | undefined>();
  const [evalStatusFilter, setEvalStatusFilter] = useState<string>("");
  const { data: stats } = trpc.stats.dashboard.useQuery();
  const { data: batches } = trpc.batches.list.useQuery();
  
  const { data: members } = trpc.corpsMembers.list.useQuery({
    batchId,
    search: search || undefined,
    platoon: platoonFilter ? Number(platoonFilter) : undefined,
    evaluatedBy: evalStatusFilter || undefined,
  });

  const { refetch: fetchCsv } = trpc.export.csv.useQuery({ batchId }, { enabled: false });

  const handleExport = async () => {
    const result = await fetchCsv();
    const csv = result.data?.csv || "";
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const batchName = batches?.find(b => b.id === batchId)?.name || "all";
    a.download = `corps-members-${batchName}-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    const printContent = document.getElementById("printable-table");
    if (!printContent) return;
    
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Corps Members Report</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; }
              table { width: 100%; border-collapse: collapse; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #004d00; color: white; }
              tr:nth-child(even) { background-color: #f2f2f2; }
              h1 { color: #004d00; }
            </style>
          </head>
          <body>
            <h1>Corps Members Report${batchId ? ` - Batch: ${batches?.find(b => b.id === batchId)?.name}` : ''}</h1>
            <p>Generated: ${new Date().toLocaleDateString()}</p>
            ${printContent.innerHTML}
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 500);
    }
  };

  const activeBatch = batches?.find(b => b.isActive);

  useEffect(() => {
    if (activeBatch && !batchId) {
      setBatchId(activeBatch.id);
    }
  }, [activeBatch, batchId]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Camp Commandant Dashboard</h1>
          <p className="text-gray-600">Manage corps members, staff, and batches</p>
        </div>

        {stats && <DashboardStats stats={stats} />}

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-white border">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="members">Corps Members</TabsTrigger>
            <TabsTrigger value="staff">Staff</TabsTrigger>
            <TabsTrigger value="batches">Batches</TabsTrigger>
            <TabsTrigger value="export">Export/Print</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <QuickActionCard
                    title="Manage Corps Members"
                    description="View and search all corps members"
                    onClick={() => setActiveTab("members")}
                  />
                  <QuickActionCard
                    title="Manage Staff"
                    description="Create and manage instructors and soldiers"
                    onClick={() => setActiveTab("staff")}
                  />
                  <QuickActionCard
                    title="Export Data"
                    description="Download corps member data as CSV"
                    onClick={() => setActiveTab("export")}
                  />
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
                <div className="flex flex-wrap gap-3 mb-4">
                  <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Search by name, state code, or call-up number"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  <Select value={batchId || ""} onValueChange={setBatchId}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Batch" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Batches</SelectItem>
                      {batches?.map((b) => (
                        <SelectItem key={b.id} value={b.id}>
                          {b.name} {b.isActive ? "(Active)" : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={platoonFilter} onValueChange={setPlatoonFilter}>
                    <SelectTrigger className="w-36">
                      <SelectValue placeholder="Platoon" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All</SelectItem>
                      {Array.from({ length: 10 }, (_, i) => i + 1).map((p) => (
                        <SelectItem key={p} value={String(p)}>Platoon {p}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={evalStatusFilter} onValueChange={setEvalStatusFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Eval Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All</SelectItem>
                      <SelectItem value="platoon">Platoon Evaluated</SelectItem>
                      <SelectItem value="man_o_war">Man O'War Evaluated</SelectItem>
                      <SelectItem value="soldier">Has Soldier Comment</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div id="printable-table" className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>State Code</TableHead>
                        <TableHead>Batch</TableHead>
                        <TableHead>Platoon</TableHead>
                        <TableHead>Evaluation Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {members?.map((member) => {
                        const memberBatch = batches?.find(b => b.id === member.batchId);
                        return (
                          <TableRow key={member.id}>
                            <TableCell className="font-medium">
                              {member.surname} {member.otherNames}
                            </TableCell>
                            <TableCell>{member.stateCode}</TableCell>
                            <TableCell>{memberBatch?.name || 'N/A'}</TableCell>
                            <TableCell>Platoon {member.platoon}</TableCell>
                            <TableCell>
                              <div className="flex gap-1 flex-wrap">
                                <Badge variant={member.isEvaluatedByPlatoon ? "default" : "secondary"} className={member.isEvaluatedByPlatoon ? "bg-green-100 text-green-700" : ""}>
                                  PI {member.isEvaluatedByPlatoon ? "✓" : "○"}
                                </Badge>
                                <Badge variant={member.isEvaluatedByManOWar ? "default" : "secondary"} className={member.isEvaluatedByManOWar ? "bg-blue-100 text-blue-700" : ""}>
                                  MOW {member.isEvaluatedByManOWar ? "✓" : "○"}
                                </Badge>
                                <Badge variant={member.hasSoldierComment ? "default" : "secondary"} className={member.hasSoldierComment ? "bg-amber-100 text-amber-700" : ""}>
                                  S {member.hasSoldierComment ? "✓" : "○"}
                                </Badge>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Button size="sm" variant="outline" onClick={() => {}}>
                                <Eye className="w-3 h-3 mr-1" />
                                View
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="staff" className="mt-4">
            <StaffTab />
          </TabsContent>

          <TabsContent value="batches" className="mt-4">
            <BatchesTab />
          </TabsContent>

          <TabsContent value="export" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Export & Print Reports</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="p-6">
                      <Download className="w-8 h-8 text-[#004d00] mb-3" />
                      <h3 className="font-medium">Export to CSV</h3>
                      <p className="text-sm text-gray-600 mt-1">Download all corps member data with no empty fields</p>
                      <div className="mt-3">
                        <Label>Select Batch</Label>
                        <Select value={batchId || ""} onValueChange={setBatchId}>
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="All Batches" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">All Batches</SelectItem>
                            {batches?.map((b) => (
                              <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <Button onClick={handleExport} className="mt-3 w-full bg-[#004d00] hover:bg-[#003300]">
                        <Download className="w-4 h-4 mr-2" />
                        Export CSV
                      </Button>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6">
                      <Printer className="w-8 h-8 text-[#004d00] mb-3" />
                      <h3 className="font-medium">Print Detailed Report</h3>
                      <p className="text-sm text-gray-600 mt-1">Generate printable report with all member details</p>
                      <Button onClick={handlePrint} className="mt-3 w-full bg-[#004d00] hover:bg-[#003300]">
                        <Printer className="w-4 h-4 mr-2" />
                        Generate Print View
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}

function QuickActionCard({ title, description, onClick }: { title: string; description: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="p-4 border rounded-lg hover:border-[#004d00] hover:bg-green-50 transition-colors text-left">
      <h3 className="font-medium text-gray-900">{title}</h3>
      <p className="text-sm text-gray-600 mt-1">{description}</p>
    </button>
  );
}

function StaffTab() {
  const [open, setOpen] = useState(false);
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"platoon_instructor" | "man_o_war_instructor" | "soldier">("platoon_instructor");
  const [assignedPlatoon, setAssignedPlatoon] = useState<number>(1);
  const [assignedBatch, setAssignedBatch] = useState<string>("");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const utils = trpc.useUtils();
  const { data: batches } = trpc.batches.list.useQuery();

  const { data: staff } = trpc.users.search.useQuery({ search, role: roleFilter || undefined });
  const createMutation = trpc.users.create.useMutation({
    onSuccess: () => {
      utils.users.search.invalidate();
      utils.users.list.invalidate();
      setOpen(false);
      setFullName(""); setUsername(""); setPassword("");
    },
    onError: (err: any) => alert(err.message),
  });

  const groupedStaff = {
    current: staff?.filter((s) => s.isActive && !s.isDeleted) || [],
    unassigned: staff?.filter((s) => !s.assignedPlatoon && s.isActive) || [],
    previous: staff?.filter((s) => s.isDeleted) || [],
  };

  const handleCreate = () => {
    createMutation.mutate({ 
      fullName, 
      username, 
      password, 
      role, 
      assignedPlatoon,
      assignedBatchId: assignedBatch || undefined
    });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Staff Management</CardTitle>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#004d00] hover:bg-[#003300]">
              <UserPlus className="w-4 h-4 mr-2" />
              Add Staff
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Staff</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <Label>Full Name</Label>
                <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Enter full name" />
              </div>
              <div>
                <Label>Username</Label>
                <Input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Enter username" />
              </div>
              <div>
                <Label>Password</Label>
                <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter password" />
              </div>
              <div>
                <Label>Role</Label>
                <Select value={role} onValueChange={(v) => setRole(v as any)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="platoon_instructor">Platoon Instructor</SelectItem>
                    <SelectItem value="man_o_war_instructor">Man O'War Instructor</SelectItem>
                    <SelectItem value="soldier">Soldier</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Assigned Platoon</Label>
                <Select value={String(assignedPlatoon)} onValueChange={(v) => setAssignedPlatoon(Number(v))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 10 }, (_, i) => i + 1).map((p) => (
                      <SelectItem key={p} value={String(p)}>Platoon {p}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Assigned Batch (Optional)</Label>
                <Select value={assignedBatch} onValueChange={setAssignedBatch}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select batch" />
                  </SelectTrigger>
                  <SelectContent>
                    {batches?.map((b) => (
                      <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                onClick={handleCreate}
                className="w-full bg-[#004d00] hover:bg-[#003300]"
                disabled={createMutation.isPending || !fullName || !username || !password}
              >
                {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create Staff"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="flex gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search staff..." className="pl-9" />
          </div>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Roles</SelectItem>
              <SelectItem value="platoon_instructor">Platoon Instructor</SelectItem>
              <SelectItem value="man_o_war_instructor">Man O'War</SelectItem>
              <SelectItem value="soldier">Soldier</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Current Staff ({groupedStaff.current.length})</h4>
            <StaffTable staff={groupedStaff.current} />
          </div>
          {groupedStaff.unassigned.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Unassigned Staff ({groupedStaff.unassigned.length})</h4>
              <StaffTable staff={groupedStaff.unassigned} />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function StaffTable({ staff }: { staff: any[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Username</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Platoon</TableHead>
          <TableHead>Batch</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {staff.map((user) => (
          <TableRow key={user.id}>
            <TableCell className="font-medium">{user.fullName}</TableCell>
            <TableCell>@{user.username}</TableCell>
            <TableCell>
              <Badge variant="secondary">{RoleLabels[user.role]}</Badge>
            </TableCell>
            <TableCell>{user.assignedPlatoon ? `Platoon ${user.assignedPlatoon}` : "-"}</TableCell>
            <TableCell>{user.assignedBatchId || "-"}</TableCell>
            <TableCell>
              <Badge variant={user.isActive ? "default" : "destructive"} className={user.isActive ? "bg-green-100 text-green-700" : ""}>
                {user.isActive ? "Active" : "Inactive"}
              </Badge>
            </TableCell>
          </TableRow>
        ))}
        {staff.length === 0 && (
          <TableRow>
            <TableCell colSpan={6} className="text-center text-gray-500 py-4">No staff found</TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}

function BatchesTab() {
  const { data: batches } = trpc.batches.list.useQuery();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [year, setYear] = useState(new Date().getFullYear());
  const [state, setState] = useState<"ondo" | "lagos">("ondo");
  const [description, setDescription] = useState("");
  const utils = trpc.useUtils();

  const createMutation = trpc.batches.create.useMutation({
    onSuccess: () => { utils.batches.list.invalidate(); setOpen(false); setName(""); setYear(new Date().getFullYear()); setDescription(""); },
    onError: (err: any) => alert(err.message),
  });

  const activateMutation = trpc.batches.activate.useMutation({
    onSuccess: () => utils.batches.list.invalidate(),
    onError: (err: any) => alert(err.message),
  });

  const deactivateMutation = trpc.batches.deactivate.useMutation({
    onSuccess: () => utils.batches.list.invalidate(),
    onError: (err: any) => alert(err.message),
  });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Batches</CardTitle>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#004d00] hover:bg-[#003300]">
              <Plus className="w-4 h-4 mr-2" />
              Create Batch
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Batch</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <Label>Batch Name</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Batch A 2025" />
              </div>
              <div>
                <Label>Year</Label>
                <Input type="number" value={year} onChange={(e) => setYear(Number(e.target.value))} />
              </div>
              <div>
                <Label>State</Label>
                <Select value={state} onValueChange={(v) => setState(v as "ondo" | "lagos")}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ondo">Ondo</SelectItem>
                    <SelectItem value="lagos">Lagos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Description (Optional)</Label>
                <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" />
              </div>
              <Button onClick={() => createMutation.mutate({ name, year, state, description })} className="w-full bg-[#004d00] hover:bg-[#003300]" disabled={createMutation.isPending || !name}>
                {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create Batch"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Year</TableHead>
              <TableHead>State</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
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
                <TableCell>
                  {batch.isActive ? (
                    <Button size="sm" variant="outline" onClick={() => deactivateMutation.mutate({ id: batch.id })} disabled={deactivateMutation.isPending}>
                      {deactivateMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : "Deactivate"}
                    </Button>
                  ) : (
                    <Button size="sm" className="bg-[#004d00] hover:bg-[#003300] text-white" onClick={() => activateMutation.mutate({ id: batch.id })} disabled={activateMutation.isPending}>
                      {activateMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : "Activate"}
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}