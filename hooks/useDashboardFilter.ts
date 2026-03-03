import { useState, useMemo } from 'react';

export function useDashboardFilter(weeklySummary: any, fullHistory: any[]) {
    const [selectedSubject, setSelectedSubject] = useState<string | null>(null);

    const filteredHistory = useMemo(() => {
        return selectedSubject
            ? fullHistory.filter((log: any) => log.subject === selectedSubject)
            : fullHistory;
    }, [fullHistory, selectedSubject]);

    const filteredSummary = useMemo(() => {
        if (!selectedSubject) return weeklySummary;

        const totalHours = filteredHistory.reduce((acc: number, log: any) => acc + log.hoursStudied, 0);
        const totalQuestions = filteredHistory.reduce((acc: number, log: any) => acc + log.questionsAnswered, 0);
        const totalCorrect = filteredHistory.reduce((acc: number, log: any) => acc + log.correctAnswers, 0);
        const accuracy = totalQuestions > 0 ? (totalCorrect / totalQuestions) * 100 : 0;

        return {
            totalHours,
            totalQuestions,
            totalCorrect,
            accuracy,
            logCount: filteredHistory.length
        };
    }, [weeklySummary, filteredHistory, selectedSubject]);

    const clearFilter = () => setSelectedSubject(null);

    return {
        selectedSubject,
        setSelectedSubject,
        clearFilter,
        filteredHistory,
        filteredSummary
    };
}
