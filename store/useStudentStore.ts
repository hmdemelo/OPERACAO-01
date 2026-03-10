import { create } from 'zustand'

interface StudentState {
    // Dashboard Data
    dashboardData: {
        weeklySummary: any;
        dailyProgress: any[];
        subjectDistribution: any[];
        fullHistory: any[];
    } | null;
    isLoadingDashboard: boolean;
    lastDashboardFetch: number | null;

    // Actions
    setDashboardData: (data: any) => void;
    setLoadingDashboard: (loading: boolean) => void;
    invalidateDashboard: () => void;
}

export const useStudentStore = create<StudentState>((set) => ({
    dashboardData: null,
    isLoadingDashboard: false,
    lastDashboardFetch: null,

    setDashboardData: (data) => set({
        dashboardData: data,
        lastDashboardFetch: Date.now(),
        isLoadingDashboard: false
    }),

    setLoadingDashboard: (loading) => set({ isLoadingDashboard: loading }),

    invalidateDashboard: () => set({ lastDashboardFetch: null, dashboardData: null }),
}))
