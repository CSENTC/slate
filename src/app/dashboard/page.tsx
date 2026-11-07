import { AppShell } from "@/components/layout/app-shell";
import { getBuilderData } from "@/lib/actions/builder-actions";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const data = await getBuilderData();

  if (!data) {
    return (
      <AppShell title="Dashboard">
        <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6">
          <div>
            <span className="font-mono text-xs uppercase tracking-wider text-muted">
              Workspace Status
            </span>
            <h2 className="text-2xl font-bold tracking-tight text-ink mt-1">
              No workspace found
            </h2>
          </div>
          <div className="p-8 rounded-2xl border border-line bg-surface flex flex-col items-center text-center gap-4">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{ background: "var(--accent)" }}
            >
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#fff"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 5v14M5 12h14" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-ink text-lg">
                Set up your workspace
              </h3>
              <p className="text-muted text-sm max-w-sm mt-1">
                Complete the setup wizard to configure your institution, periods,
                and breaks before building your timetable.
              </p>
            </div>
            <Link
              href="/setup"
              className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm text-white"
              style={{ background: "var(--accent)" }}
            >
              Start Setup Wizard →
            </Link>
          </div>
        </div>
      </AppShell>
    );
  }

  const { workspace, classes, teachers, rooms, allocations, entries, periods } =
    data;

  const workingPeriods = periods.filter((p) => !p.isBreak);
  const periodsPerDay = workingPeriods.length;
  const daysPerWeek = workspace.workingDays.length;
  const totalRequired = allocations.reduce(
    (sum, a) => sum + a.periodsPerWeek,
    0
  );
  const totalPlaced = allocations.reduce((sum, a) => sum + a.placedCount, 0);
  const coveragePct =
    totalRequired > 0 ? Math.round((totalPlaced / totalRequired) * 100) : 0;

  const statCards = [
    {
      label: "Classes",
      value: classes.length,
      icon: (
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      ),
      href: "/master/classes",
      color: "#6366f1",
    },
    {
      label: "Teachers",
      value: teachers.length,
      icon: (
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      ),
      href: "/master/teachers",
      color: "#0ea5e9",
    },
    {
      label: "Rooms",
      value: rooms.length,
      icon: (
        <>
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="M9 3v18" />
        </>
      ),
      href: "/master/rooms",
      color: "#10b981",
    },
    {
      label: "Allocations",
      value: allocations.length,
      icon: (
        <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 1 4 0M9 5h6" />
      ),
      href: "/master/allocations",
      color: "#f59e0b",
    },
  ];

  return (
    <AppShell title={`${workspace.name} — Dashboard`}>
      <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <span className="font-mono text-xs uppercase tracking-wider text-muted">
              Workspace
            </span>
            <h2 className="text-2xl font-bold tracking-tight text-ink mt-1">
              {workspace.name}
            </h2>
            <p className="text-muted text-sm mt-0.5">
              Academic Year {workspace.academicYear}&nbsp;·&nbsp;{daysPerWeek}{" "}
              days/week&nbsp;·&nbsp;{periodsPerDay} periods/day
            </p>
          </div>
          <div className="flex gap-3 flex-wrap">
            <Link
              href="/builder"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm text-white"
              style={{ background: "var(--accent)" }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" />
                <rect x="14" y="14" width="7" height="7" rx="1" />
              </svg>
              Open Builder
            </Link>
            <Link
              href="/settings"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm border border-line text-ink bg-surface"
            >
              Settings
            </Link>
          </div>
        </div>

        {/* Schedule Coverage Banner */}
        <div className="p-5 rounded-2xl border border-line bg-surface">
          <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
            <div>
              <span className="font-mono text-xs uppercase tracking-wider text-muted">
                Schedule Coverage
              </span>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-3xl font-bold tracking-tight text-ink">
                  {coveragePct}%
                </span>
                <span className="text-sm text-muted">
                  {totalPlaced} / {totalRequired} periods placed
                </span>
              </div>
            </div>
            <div className="text-right">
              {totalRequired === 0 ? (
                <Link
                  href="/master/allocations"
                  className="text-xs font-semibold underline"
                  style={{ color: "var(--accent)" }}
                >
                  Add allocations →
                </Link>
              ) : totalPlaced === totalRequired ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                  ✓ Complete
                </span>
              ) : (
                <Link
                  href="/builder"
                  className="text-xs font-semibold underline"
                  style={{ color: "var(--accent)" }}
                >
                  Continue in Builder →
                </Link>
              )}
            </div>
          </div>
          <div className="h-2.5 rounded-full bg-line overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${coveragePct}%`,
                background:
                  coveragePct === 100
                    ? "#10b981"
                    : coveragePct > 60
                      ? "var(--accent)"
                      : "#f59e0b",
              }}
            />
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {statCards.map((card) => (
            <Link
              key={card.label}
              href={card.href}
              className="group p-5 rounded-2xl border border-line bg-surface hover:border-current transition-colors"
            >
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
                style={{ background: `${card.color}18` }}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke={card.color}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  {card.icon}
                </svg>
              </div>
              <div className="text-2xl font-bold tracking-tight text-ink">
                {card.value}
              </div>
              <div className="text-xs text-muted mt-0.5">{card.label}</div>
            </Link>
          ))}
        </div>

        {/* Quick Links / Actions */}
        {allocations.length === 0 ? (
          <div className="p-6 rounded-2xl border border-dashed border-line bg-surface flex flex-col items-center text-center gap-3">
            <p className="text-sm text-muted max-w-sm">
              No allocations yet. Set up your subjects, teachers and rooms, then
              create allocations to link them.
            </p>
            <Link
              href="/master/allocations"
              className="text-xs font-semibold underline"
              style={{ color: "var(--accent)" }}
            >
              Go to Allocations →
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl border border-line bg-surface space-y-3">
              <span className="font-mono text-xs uppercase tracking-wider text-muted">
                Quick Actions
              </span>
              <div className="space-y-1 mt-2">
                {[
                  { label: "Open Timetable Builder", href: "/builder" },
                  { label: "Manage Subjects", href: "/master/subjects" },
                  { label: "Manage Teachers", href: "/master/teachers" },
                  { label: "Manage Rooms", href: "/master/rooms" },
                  { label: "Settings", href: "/settings" },
                ].map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-line/40 transition-colors text-sm text-ink"
                  >
                    {link.label}
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M9 18l6-6-6-6" />
                    </svg>
                  </Link>
                ))}
              </div>
            </div>

            <div className="p-5 rounded-2xl border border-line bg-surface space-y-3">
              <span className="font-mono text-xs uppercase tracking-wider text-muted">
                Schedule Summary
              </span>
              <div className="mt-2 space-y-3">
                {[
                  { label: "Total periods required", value: totalRequired },
                  { label: "Periods placed", value: totalPlaced },
                  {
                    label: "Periods remaining",
                    value: totalRequired - totalPlaced,
                  },
                  {
                    label: "Classes with sessions",
                    value: `${new Set(entries.map((e) => e.classId)).size} / ${classes.length}`,
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="text-muted">{item.label}</span>
                    <span className="font-semibold text-ink tabular-nums">
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
