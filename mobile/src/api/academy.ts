import { apiRequest } from "./client";

export type CourseTier = "single" | "bundle" | "full_access";

export interface CourseListItem {
  id: string;
  slug: string;
  title: string;
  description: string;
  price: number;
  tier: CourseTier;
  thumbnail_url: string;
}

export interface LessonSummary {
  id: string;
  order: number;
  title: string;
  duration_seconds: number;
}

export interface LessonDetail extends LessonSummary {
  video_url: string;
  transcript: string | null;
  resources: { label: string; url: string }[];
}

export interface ModuleOut {
  id: string;
  order: number;
  title: string;
  lessons: LessonSummary[];
}

export interface CourseDetail extends CourseListItem {
  workbook_url: string;
  modules: ModuleOut[];
  recommended_next: CourseListItem | null;
}

export interface Progress {
  lessons_completed: string[];
  percent_complete: number;
  current_lesson_id: string | null;
  completed_at: string | null;
}

export interface Enrollment {
  id: string;
  course: CourseListItem;
  purchased_at: string;
  status: "active" | "refunded";
  progress: Progress;
}

export interface LessonCompleteResult {
  percent_complete: number;
  current_lesson_id: string | null;
  completed_course: boolean;
}

export const academyApi = {
  listCourses: () => apiRequest<CourseListItem[]>("/academy/courses", { auth: false }),

  getCourse: (slug: string) =>
    apiRequest<CourseDetail>(`/academy/courses/${slug}`, { auth: false }),

  getLesson: (lessonId: string) =>
    apiRequest<LessonDetail>(`/academy/lessons/${lessonId}`),

  startCheckout: (courseId: string) =>
    apiRequest<{ checkout_url: string; session_id: string }>("/academy/checkout", {
      method: "POST",
      body: { course_id: courseId },
    }),

  myCourses: () => apiRequest<Enrollment[]>("/academy/my-courses"),

  getProgress: (courseId: string) =>
    apiRequest<Progress>(`/academy/courses/${courseId}/progress`),

  completeLesson: (lessonId: string) =>
    apiRequest<LessonCompleteResult>(`/academy/lessons/${lessonId}/complete`, {
      method: "POST",
    }),

  getWorkbookDownloadUrl: (courseId: string) =>
    apiRequest<{ download_url: string; expires_in_seconds: number }>(
      `/academy/courses/${courseId}/workbook`
    ),
};
