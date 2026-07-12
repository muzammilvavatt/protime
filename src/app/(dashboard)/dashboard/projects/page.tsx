import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Pencil,
  User,
  MapPin,
  CalendarDays,
  CheckSquare2,
  FolderKanban,
} from "lucide-react";
import { deleteProjectAction } from "@/actions/project.actions";
import { getSession } from "@/lib/session";
import { DeleteButton } from "@/components/DeleteButton";
import { GlobalProjectsReportButtons } from "@/components/GlobalProjectsReportButtons";

export default async function ProjectsPage() {
  const session = await getSession();
  const isAdmin = session?.user?.role === "ADMIN";

  const projects = await prisma.project.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      tasks: {
        select: { status: true },
      },
      _count: {
        select: { tasks: true },
      },
    },
  });

  // ── Helper: status badge classes ──────────────────────────────────────────
  function statusBadge(status: string) {
    switch (status) {
      case "ACTIVE":
        return "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200";
      case "COMPLETED":
        return "bg-slate-100 text-slate-600";
      case "ON_HOLD":
        return "bg-amber-50 text-amber-700 ring-1 ring-amber-200";
      default:
        return "bg-slate-100 text-slate-600";
    }
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* ── Print-only Header ─────────────────────────────────────────────── */}
      <div className="hidden print:block mb-8">
        <div className="flex justify-between items-end border-b-2 border-slate-800 pb-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Overall Projects Report
            </h1>
            <p className="text-slate-600 mt-1">
              Status of all active and completed projects
            </p>
          </div>
          <div className="text-right">
            <h3 className="font-bold text-slate-900">PROTIME / PRMC</h3>
            <p className="text-sm text-slate-500">
              {new Date().toLocaleDateString("en-IN")}
            </p>
          </div>
        </div>
      </div>

      {/* ── Page Header ───────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 no-print animate-fade-in-up">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            Projects
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Manage your construction sites and NOCs.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {isAdmin && <GlobalProjectsReportButtons projects={projects} />}
          {isAdmin && (
            <Link href="/dashboard/projects/add">
              <button className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors shadow-sm">
                <Plus className="w-4 h-4" />
                New Project
              </button>
            </Link>
          )}
        </div>
      </div>

      {/* ── Empty State ───────────────────────────────────────────────────── */}
      {projects.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 bg-white rounded-xl ring-1 ring-slate-200 shadow-sm animate-fade-in-up">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-50 to-indigo-100 flex items-center justify-center mb-4">
            <FolderKanban className="w-8 h-8 text-indigo-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-700">
            No projects yet
          </h3>
          <p className="text-sm text-slate-500 mt-1 mb-6">
            Get started by creating your first project.
          </p>
          {isAdmin && (
            <Link href="/dashboard/projects/add">
              <button className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors shadow-sm">
                <Plus className="w-4 h-4" />
                New Project
              </button>
            </Link>
          )}
        </div>
      )}

      {/* ── Project Card Grid ─────────────────────────────────────────────── */}
      {projects.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 stagger-children animate-fade-in-up">
          {projects.map((project) => {
            const completedTasks = project.tasks.filter(
              (t) => t.status === "COMPLETED"
            ).length;
            const totalTasks = project._count.tasks;
            const progressPercent =
              totalTasks > 0
                ? Math.round((completedTasks / totalTasks) * 100)
                : 0;

            return (
              <div
                key={project.id}
                className="protime-card-hover flex flex-col p-5 gap-4"
              >
                {/* ── Card Top: Name + Status Badge ── */}
                <div className="flex items-start justify-between gap-2">
                  <Link
                    href={`/dashboard/projects/${project.id}`}
                    className="flex-1 min-w-0"
                  >
                    <h3
                      className="font-bold text-slate-900 truncate text-base hover:text-indigo-600 transition-colors"
                      title={project.name}
                    >
                      {project.name}
                    </h3>
                  </Link>
                  <span
                    className={`shrink-0 inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${statusBadge(
                      project.status
                    )}`}
                  >
                    {project.status.replace(/_/g, " ")}
                  </span>
                </div>

                {/* ── Card Middle: Client + Location ── */}
                <div className="flex flex-col gap-1.5 text-sm text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="font-medium text-slate-700 truncate">
                      {project.clientName}
                    </span>
                  </div>
                  {project.location && (
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{project.location}</span>
                    </div>
                  )}
                </div>

                {/* ── Progress Bar ── */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>Progress</span>
                    <span className="font-semibold text-slate-700">
                      {completedTasks}/{totalTasks} tasks
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="h-1.5 rounded-full bg-indigo-500 transition-all duration-500"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>

                {/* ── Card Bottom: Chips + Actions ── */}
                <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100">
                  {/* Chips */}
                  <div className="flex flex-wrap gap-2">
                    {project.deadline && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-xs font-medium">
                        <CalendarDays className="w-3 h-3" />
                        {new Date(project.deadline).toLocaleDateString(
                          "en-IN",
                          { timeZone: "Asia/Kolkata" }
                        )}
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-xs font-medium">
                      <CheckSquare2 className="w-3 h-3" />
                      {totalTasks} task{totalTasks !== 1 ? "s" : ""}
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-1 shrink-0">
                    <Link href={`/dashboard/projects/${project.id}`}>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 h-8 px-2.5 text-xs rounded-lg"
                      >
                        View
                      </Button>
                    </Link>
                    {isAdmin && (
                      <>
                        <Link href={`/dashboard/projects/${project.id}/edit`}>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-slate-500 hover:text-slate-700 hover:bg-slate-100 h-8 w-8 p-0 rounded-lg"
                            title="Edit Project"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
                        </Link>
                        <form
                          action={deleteProjectAction.bind(null, project.id)}
                        >
                          <DeleteButton itemName="Project" />
                        </form>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
