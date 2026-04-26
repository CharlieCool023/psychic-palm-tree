import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { StatCard } from "@/components/dashboard/StatCards";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import { ClipboardList, MessageSquare, Loader2, CheckCircle2 } from "lucide-react";

export default function SoldierDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const { user } = useAuth();
  const platoon = user?.assignedPlatoon || 1;

  const { data: members } = trpc.corpsMembers.list.useQuery({ platoon });
  const { data: comments } = trpc.comments.listBySoldier.useQuery();
  

  const totalMembers = members?.length || 0;
  const commentedCount = comments?.length || 0;
  const pendingCount = totalMembers - commentedCount;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Soldier Dashboard</h1>
          <p className="text-gray-600">Platoon {platoon} - Add observations about corps members</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard title="Total Members" value={totalMembers} icon={<ClipboardList className="w-6 h-6" />} />
          <StatCard title="Commented" value={commentedCount} icon={<CheckCircle2 className="w-6 h-6" />} color="bg-green-600" />
          <StatCard title="Pending" value={pendingCount} icon={<ClipboardList className="w-6 h-6" />} color="bg-amber-600" />
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-white border">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="platoon">My Platoon</TabsTrigger>
            <TabsTrigger value="comments">My Comments</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <QuickActionCard
                    title="Add Comments"
                    description="Add observations about corps members in your platoon"
                    onClick={() => setActiveTab("platoon")}
                  />
                  <QuickActionCard
                    title="View My Comments"
                    description="Review all comments you have submitted"
                    onClick={() => setActiveTab("comments")}
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
                      const hasComment = comments?.some((c) => c.corpsMemberId === member.id);
                      return (
                        <TableRow key={member.id}>
                          <TableCell className="font-medium">
                            {member.surname} {member.otherNames}
                          </TableCell>
                          <TableCell>{member.stateCode}</TableCell>
                          <TableCell>
                            <Badge variant={hasComment ? "default" : "secondary"} className={hasComment ? "bg-green-100 text-green-700" : ""}>
                              {hasComment ? "Commented" : "Pending"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <CommentDialog member={member} existingComment={comments?.find((c) => c.corpsMemberId === member.id)} />
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="comments" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>My Comments</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Corps Member ID</TableHead>
                      <TableHead>Comment</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {comments?.map((comment) => (
                      <TableRow key={comment.id}>
                        <TableCell>{comment.corpsMemberId}</TableCell>
                        <TableCell className="max-w-md truncate">{comment.comment}</TableCell>
                        <TableCell>{new Date(comment.createdAt).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}

function CommentDialog({ member, existingComment }: { member: any; existingComment?: any }) {
  const [open, setOpen] = useState(false);
  const [comment, setComment] = useState(existingComment?.comment || "");
  const utils = trpc.useUtils();

  const submitMutation = trpc.comments.submitSoldierComment.useMutation({
    onSuccess: () => {
      utils.corpsMembers.list.invalidate();
      utils.comments.listBySoldier.invalidate();
      setOpen(false);
    },
  });

  const handleSubmit = () => {
    if (!comment.trim()) return;
    submitMutation.mutate({
      corpsMemberId: member.id,
      comment: comment.trim(),
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant={existingComment ? "outline" : "default"} className={!existingComment ? "bg-[#004d00] hover:bg-[#003300]" : ""}>
          <MessageSquare className="w-3 h-3 mr-1" />
          {existingComment ? "Edit" : "Comment"}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {existingComment ? "Edit" : "Add"} Comment: {member.surname} {member.otherNames}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">State Code: <span className="font-medium">{member.stateCode}</span></p>
            <p className="text-sm text-gray-600">Platoon: <span className="font-medium">{member.platoon}</span></p>
          </div>

          <Textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Enter your observations about this corps member..."
            rows={6}
          />

          <Button
            onClick={handleSubmit}
            className="w-full bg-[#004d00] hover:bg-[#003300] h-12"
            disabled={submitMutation.isPending || !comment.trim()}
          >
            {submitMutation.isPending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : existingComment ? (
              "Update Comment"
            ) : (
              "Submit Comment"
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
