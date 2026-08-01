import Link from "next/link";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import type { Course } from "@/types";

export function CourseProgressList({ courses }: { courses: Course[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Progresso por curso</CardTitle>
      </CardHeader>
      <div className="flex flex-col gap-5">
        {courses.map((course) => (
          <div key={course.id} className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-5">
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <p className="text-sm font-semibold text-foreground truncate">{course.name}</p>
                <span className="text-sm font-bold text-accent shrink-0">{course.progressPercent}%</span>
              </div>
              <ProgressBar percent={course.progressPercent} />
              <p className="text-xs text-muted mt-1.5">
                Última aula: {course.lastLessonTitle} · {course.completedLessons}/{course.totalLessons} aulas
              </p>
            </div>
            <Link
              href="/videoaulas"
              className="inline-flex items-center justify-center rounded-xl border border-border text-foreground hover:bg-surface-2 transition-smooth h-8 px-3 text-xs font-semibold shrink-0"
            >
              Continuar
            </Link>
          </div>
        ))}
      </div>
    </Card>
  );
}
