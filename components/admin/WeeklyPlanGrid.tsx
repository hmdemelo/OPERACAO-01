'use client'

import { useState } from 'react'

export function WeeklyPlanGrid({ userId, subjects }: { userId: string, subjects: any[] }) {
    // State to hold grid data: 7 days x 3 blocks
    // Initially empty or fetched from API if editing existing
    const [grid, setGrid] = useState<any[][]>(
        Array(7).fill(null).map(() =>
            Array(3).fill({ subjectId: "", content: "", duration: 60 })
        )
    )

    // TODO: Fetch existing plan on mount

    const handleSave = async () => {
        // Post to /api/admin/plans
        // Helper to format grid into items array
    }

    return (
        <div className="grid grid-cols-7 gap-4">
            {/* Headers: Seg, Ter, Qua... */}
            {['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'].map(day => (
                <div key={day} className="font-bold text-center">{day}</div>
            ))}

            {/* Grid Cells */}
            {grid.map((dayBlocks, dayIndex) => (
                <div key={dayIndex} className="space-y-2">
                    {dayBlocks.map((block, blockIndex) => (
                        <div key={blockIndex} className="border p-2 rounded">
                            {/* Inputs for Subject, Content, Duration */}
                            <select className="w-full text-sm mb-1 border rounded" value={block.subjectId} onChange={() => { }}>
                                <option value="">Select Subject</option>
                                {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                            <input type="text" placeholder="Content" className="w-full text-sm mb-1 border rounded p-1" />
                            <input type="number" placeholder="Min" className="w-full text-xs border rounded p-1" />
                        </div>
                    ))}
                </div>
            ))}

            <button onClick={handleSave} className="col-span-7 bg-blue-600 text-white p-2 rounded mt-4">Save Weekly Plan</button>
        </div>
    )
}
