import { unstable_cache } from "next/cache"
import * as adminMetrics from "./adminMetrics"

// Cache durations (in seconds)
const CACHE_5_MIN = 300
const CACHE_10_MIN = 600

/**
 * Cached version of getDashboardSummary
 */
export const getCachedDashboardSummary = (period: adminMetrics.PeriodType = 'week', mentorId?: string) => {
    return unstable_cache(
        async () => adminMetrics.getDashboardSummary(period, mentorId),
        [`admin-summary-${period}-${mentorId || 'all'}`],
        {
            revalidate: CACHE_5_MIN,
            tags: ['admin-metrics', 'dashboard-summary']
        }
    )()
}

/**
 * Cached version of getSubjectDistributionAll
 */
export const getCachedSubjectDistributionAll = (period: adminMetrics.PeriodType = 'week', mentorId?: string) => {
    return unstable_cache(
        async () => adminMetrics.getSubjectDistributionAll(period, mentorId),
        [`admin-subjects-${period}-${mentorId || 'all'}`],
        {
            revalidate: CACHE_10_MIN,
            tags: ['admin-metrics', 'subject-distribution']
        }
    )()
}

/**
 * Cached version of getWeeklyEvolution
 */
export const getCachedWeeklyEvolution = (mentorId?: string) => {
    return unstable_cache(
        async () => adminMetrics.getWeeklyEvolution(mentorId),
        [`admin-evolution-${mentorId || 'all'}`],
        {
            revalidate: CACHE_10_MIN,
            tags: ['admin-metrics', 'weekly-evolution']
        }
    )()
}

/**
 * Cached version of getScheduleAdherence
 */
export const getCachedScheduleAdherence = (mentorId?: string) => {
    return unstable_cache(
        async () => adminMetrics.getScheduleAdherence(mentorId),
        [`admin-adherence-${mentorId || 'all'}`],
        {
            revalidate: CACHE_5_MIN,
            tags: ['admin-metrics', 'schedule-adherence']
        }
    )()
}
