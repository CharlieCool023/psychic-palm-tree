import { useState } from "react";

import { DashboardLayout } from "@/components/DashboardLayout";
import { StatCard } from "@/components/dashboard/StatCards";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import { ClipboardList, Printer, Eye, Loader2, CheckCircle2 } from "lucide-react";

const categories = [
  { key: "leadershipInitiative", label: "Leadership & Initiative" },
  { key: "professionalBearing", label: "Professional Bearing & Conduct" },
  { key: "physicalFitness", label: "Physical Fitness" },
  { key: "communicationSkills", label: "Communication Skills" },
  { key: "technicalCompetence", label: "Technical Competence" },
  { key: "teamworkCooperation", label: "Teamwork & Cooperation" },
  { key: "reliabilityDependability", label: "Reliability & Dependability" },
  { key: "respectDignityRights", label: "Respect for Dignity & Rights" },
];

const scoreLabels: Record<number, string> = {
  2: "Poor",
  4: "Fair",
  6: "Good",
  8: "Very Good",
  10: "Excellent",
};

export default function PlatoonInstructorDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const { user } = useAuth();
  const platoon = user?.assignedPlatoon || 1;

  const { data: members } = trpc.corpsMembers.list.useQuery({ platoon });
  const { data: evaluations } = trpc.evaluations.listByEvaluator.useQuery();
  

  const totalMembers = members?.length || 0;
  const evaluatedCount = evaluations?.length || 0;
  const pendingCount = totalMembers - evaluatedCount;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Platoon Instructor Dashboard</h1>
          <p className="text-gray-600">Platoon {platoon} - Evaluate corps members</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard title="Total Members" value={totalMembers} icon={<ClipboardList className="w-6 h-6" />} />
          <StatCard title="Evaluated" value={evaluatedCount} icon={<CheckCircle2 className="w-6 h-6" />} color="bg-green-600" />
          <StatCard title="Pending" value={pendingCount} icon={<ClipboardList className="w-6 h-6" />} color="bg-amber-600" />
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-white border">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="platoon">My Platoon</TabsTrigger>
            <TabsTrigger value="evaluations">Evaluations</TabsTrigger>
            <TabsTrigger value="print">Print</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <QuickActionCard
                    title="Evaluate Corps Members"
                    description="Submit evaluations for your platoon members"
                    onClick={() => setActiveTab("platoon")}
                  />
                  <QuickActionCard
                    title="Print Summary"
                    description="Print platoon evaluation summary"
                    onClick={() => setActiveTab("print")}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="platoon" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>My Platoon - Corps Members</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>State Code</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {members?.map((member) => {
                      const isEvaluated = member.isEvaluatedByPlatoon;
                      return (
                        <TableRow key={member.id}>
                          <TableCell className="font-medium">
                            {member.surname} {member.otherNames}
                          </TableCell>
                          <TableCell>{member.stateCode}</TableCell>
                          <TableCell>
                            <Badge variant={isEvaluated ? "default" : "secondary"} className={isEvaluated ? "bg-green-100 text-green-700" : ""}>
                              {isEvaluated ? "Evaluated" : "Pending"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <EvaluationDialog member={member} />
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="evaluations" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>My Evaluations</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Corps Member ID</TableHead>
                      <TableHead>Overall Score</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {evaluations?.map((evalItem) => (
                      <TableRow key={evalItem.id}>
                        <TableCell>{evalItem.corpsMemberId}</TableCell>
                        <TableCell className="font-medium">{evalItem.overallAverage}</TableCell>
                        <TableCell>{new Date(evalItem.createdAt).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="print" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Print Platoon Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">Generate a printable summary of all evaluations for Platoon {platoon}.</p>
                <Button onClick={() => window.print()} className="bg-[#004d00] hover:bg-[#003300]">
                  <Printer className="w-4 h-4 mr-2" />
                  Print Summary
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}

function EvaluationDialog({ member }: { member: any }) {
  const [open, setOpen] = useState(false);
  const [scores, setScores] = useState<Record<string, number>>({
    leadershipInitiative: 6,
    professionalBearing: 6,
    physicalFitness: 6,
    communicationSkills: 6,
    technicalCompetence: 6,
    teamworkCooperation: 6,
    reliabilityDependability: 6,
    respectDignityRights: 6,
  });
  const utils = trpc.useUtils();

  const { data: existingEvaluation } = trpc.evaluations.getByCorpsMemberAndRole.useQuery(
    { corpsMemberId: member.id, evaluatorRole: "platoon_instructor" },
    { enabled: open }
  );

  const submitMutation = trpc.evaluations.submitPlatoonEvaluation.useMutation({
    onSuccess: () => {
      utils.corpsMembers.list.invalidate();
      utils.evaluations.listByEvaluator.invalidate();
      setOpen(false);
    },
  });

  const overallAverage = (
    Object.values(scores).reduce((a, b) => a + b, 0) / 8
  ).toFixed(2);

  const handleSubmit = () => {
    const payload: any = {
      corpsMemberId: member.id,
      ...scores,
    };
    submitMutation.mutate(payload);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant={member.isEvaluatedByPlatoon ? "outline" : "default"} className={!member.isEvaluatedByPlatoon ? "bg-[#004d00] hover:bg-[#003300]" : ""}>
          <Eye className="w-3 h-3 mr-1" />
          {member.isEvaluatedByPlatoon ? "Update" : "Evaluate"}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Evaluate {member.surname} {member.otherNames}</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 mt-4">
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">State Code: <span className="font-medium">{member.stateCode}</span></p>
            <p className="text-sm text-gray-600">Platoon: <span className="font-medium">{member.platoon}</span></p>
          </div>

          {categories.map((cat) => (
            <div key={cat.key}>
              <div className="flex justify-between mb-2">
                <Label className="text-sm font-medium">{cat.label}</Label>
                <span className="text-sm font-bold text-[#004d00]">
                  {scores[cat.key]} - {scoreLabels[scores[cat.key]]}
                </span>
              </div>
              <Slider
                value={[scores[cat.key]]}
                onValueChange={([v]) => setScores((prev) => ({ ...prev, [cat.key]: v }))}
                min={2}
                max={10}
                step={2}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Poor</span>
                <span>Excellent</span>
              </div>
            </div>
          ))}

          <div className="p-4 bg-[#004d00]/5 rounded-lg border border-[#004d00]/20">
            <div className="flex justify-between items-center">
              <span className="font-medium text-gray-900">Overall Average Score</span>
              <span className="text-2xl font-bold text-[#004d00]">{overallAverage}</span>
            </div>
          </div>

          <Button
            onClick={handleSubmit}
            className="w-full bg-[#004d00] hover:bg-[#003300] h-12"
            disabled={submitMutation.isPending}
          >
            {submitMutation.isPending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : existingEvaluation ? (
              "Update Evaluation"
            ) : (
              "Submit Evaluation"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
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
