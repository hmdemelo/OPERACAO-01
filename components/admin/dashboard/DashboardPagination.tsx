"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { PaginationControls } from "@/components/ui/pagination-controls"

interface DashboardPaginationProps {
    currentPage: number
    totalPages: number
    pageSize: number
    totalItems: number
}

export function DashboardPagination({
    currentPage,
    totalPages,
    pageSize,
    totalItems,
}: DashboardPaginationProps) {
    const router = useRouter()
    const searchParams = useSearchParams()

    const onPageChange = (page: number) => {
        const params = new URLSearchParams(searchParams.toString())
        params.set("page", page.toString())
        router.push(`?${params.toString()}`)
    }

    const onPageSizeChange = (size: number) => {
        const params = new URLSearchParams(searchParams.toString())
        params.set("limit", size.toString())
        params.set("page", "1") // Reset to page 1
        router.push(`?${params.toString()}`)
    }

    return (
        <PaginationControls
            currentPage={currentPage}
            totalPages={totalPages}
            pageSize={pageSize}
            totalItems={totalItems}
            onPageChange={onPageChange}
            onPageSizeChange={onPageSizeChange}
        />
    )
}
