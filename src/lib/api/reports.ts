import { httpClient } from "./client";
import type { ActivityReportItem, CategoryReportItem, DailyTrendResponse, ReportRangeParams, ReportSummary } from "@/types/reports";

export const reportsApi = {
  summary: (params: ReportRangeParams) => httpClient.get<ReportSummary>("/reports/summary", { params }).then((r) => r.data),

  categories: (params: ReportRangeParams) =>
    httpClient.get<CategoryReportItem[]>("/reports/categories", { params }).then((r) => r.data),

  activities: (params: ReportRangeParams) =>
    httpClient.get<ActivityReportItem[]>("/reports/activities", { params }).then((r) => r.data),

  dailyTrend: (params: ReportRangeParams) =>
    httpClient.get<DailyTrendResponse>("/reports/daily-trend", { params }).then((r) => r.data),
};
