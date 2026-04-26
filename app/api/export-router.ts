import { z } from "zod";
import { createRouter, anyStaffQuery } from "./middleware";
import { getAllCorpsMembers, getCorpsMemberById, getHigherInstitutionsByCorpsMember } from "./queries/corps-members";
import { getEvaluationsByCorpsMember } from "./queries/evaluations";
import { getCommentsByCorpsMember, getCommandantCommentByCorpsMember } from "./queries/comments";

export const exportRouter = createRouter({
  csv: anyStaffQuery
    .input(z.object({ batchId: z.string().optional() }))
    .query(async ({ input }) => {
      const members = await getAllCorpsMembers(input.batchId);

      const headers = [
        "ID", "Surname", "Other Names", "State Code", "Call-Up Number",
        "Phone Number", "State of Origin", "State of Deployment",
        "Qualification", "Area of Specialization", "Platoon",
        "Platoon Evaluated", "Man O'War Evaluated",
        "Has Soldier Comment", "Has Commandant Comment", "Camp Experience Comment",
      ];

      const rows = members.map((m) => [
        m.id, m.surname, m.otherNames, m.stateCode, m.callUpNumber,
        m.phoneNumber, m.stateOfOrigin, m.stateOfDeployment,
        m.qualification, m.areaOfSpecialization, m.platoon,
        m.isEvaluatedByPlatoon ? "Yes" : "No",
        m.isEvaluatedByManOWar ? "Yes" : "No",
        m.hasSoldierComment ? "Yes" : "No",
        m.hasCommandantComment ? "Yes" : "No",
        m.campExperienceComment || "",
      ]);

      const csvContent = [
        headers.join(","),
        ...rows.map((row) =>
          row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
        ),
      ].join("\n");

      return { csv: csvContent };
    }),

  fullReport: anyStaffQuery
    .input(z.object({ corpsMemberId: z.string() }))
    .query(async ({ input }) => {
      const member = await getCorpsMemberById(input.corpsMemberId);
      if (!member) throw new Error("Corps member not found");

      const [institutions, evaluations, comments, commandantComment] = await Promise.all([
        getHigherInstitutionsByCorpsMember(input.corpsMemberId),
        getEvaluationsByCorpsMember(input.corpsMemberId),
        getCommentsByCorpsMember(input.corpsMemberId),
        getCommandantCommentByCorpsMember(input.corpsMemberId),
      ]);

      return { member, institutions, evaluations, comments, commandantComment };
    }),
});
