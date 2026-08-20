"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { WelcomeCard } from "@/components/dashboard/WelcomeCard";
import { WelcomePasswordBanner } from "@/components/dashboard/WelcomePasswordBanner";
import { SummaryCards } from "@/components/dashboard/SummaryCards";
import { WeeklyChart } from "@/components/dashboard/WeeklyChart";
import { MonthlyChart } from "@/components/dashboard/MonthlyChart";
import { SubjectPerformanceChart } from "@/components/dashboard/SubjectPerformanceChart";
import { DailyGoalCard } from "@/components/dashboard/DailyGoalCard";
import { RecentActivityList } from "@/components/dashboard/RecentActivityList";
import { CourseProgressList } from "@/components/dashboard/CourseProgressList";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { useAuth } from "@/context/AuthContext";
import { activityService, coursesService, progressService } from "@/services";
import type { Course, Progress, RecentActivity } from "@/types";

export default function DashboardPage() {
  return (
    <Suspense fallback={null}>
      <DashboardPageInner />
    </Suspense>
  );
}

function DashboardPageInner() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const showWelcomeBanner = searchParams.get("bemvindo") === "1";
  const [progress, setProgress] = useState<Progress | null>(null);
  const [activities, setActivities] = useState<RecentActivity[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([progressService.get(), activityService.list(), coursesService.list()]).then(
      ([p, a, c]) => {
        setProgress(p);
        setActivities(a);
        setCourses(c);
        setLoading(false);
      }
    );
  }, []);

  if (loading || !progress) {
    return (
      <div className="space-y-6">
        <div className="skeleton h-40 rounded-2xl" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
        <div className="grid lg:grid-cols-3 gap-6">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {showWelcomeBanner && <WelcomePasswordBanner />}

      <WelcomeCard name={user?.name ?? "Aluno"} />

      <SummaryCards progress={progress} />

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <WeeklyChart data={progress.weekly} />
        </div>
        <DailyGoalCard progress={progress} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <MonthlyChart data={progress.monthly} />
        <SubjectPerformanceChart data={progress.bySubject} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <RecentActivityList activities={activities} />
        <CourseProgressList courses={courses} />
      </div>
    </div>
  );
}
