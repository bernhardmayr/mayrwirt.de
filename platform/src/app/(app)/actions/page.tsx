import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { ActionCard } from "@/components/actions/ActionCard";
import { ActionForm } from "@/components/actions/ActionForm";

export default async function ActionsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const company = await prisma.company.findUnique({ where: { userId: session.user.id } });
  if (!company) redirect("/settings");

  const actions = await prisma.action.findMany({
    where: { companyId: company.id },
    include: { feedback: { select: { id: true, authorName: true, rating: true, source: true } } },
    orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
  });

  const columns = [
    { label: "Offen", status: "open" },
    { label: "In Arbeit", status: "in_progress" },
    { label: "Erledigt", status: "done" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Maßnahmen</h1>
        <ActionForm />
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {columns.map(({ label, status }) => {
          const items = actions.filter((a) => a.status === status);
          return (
            <div key={status} className="space-y-3">
              <div className="flex items-center gap-2">
                <h2 className="font-semibold text-sm">{label}</h2>
                <span className="text-xs text-muted-foreground bg-muted rounded-full px-2 py-0.5">
                  {items.length}
                </span>
              </div>
              {items.length === 0 ? (
                <p className="text-xs text-muted-foreground py-4 text-center">Keine Maßnahmen</p>
              ) : (
                items.map((action) => (
                  <ActionCard
                    key={action.id}
                    id={action.id}
                    title={action.title}
                    description={action.description}
                    priority={action.priority}
                    status={action.status}
                    dueDate={action.dueDate}
                    feedback={action.feedback}
                  />
                ))
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
