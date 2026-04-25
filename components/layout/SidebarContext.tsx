"use client"
import React, { createContext, useContext, useState, useEffect } from 'react'

interface SidebarContextType {
    isCollapsed: boolean
    toggleSidebar: () => void
    isMobileOpen: boolean
    setMobileOpen: (open: boolean) => void
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined)

export function SidebarProvider({ children }: { children: React.ReactNode }) {
    const [isCollapsed, setIsCollapsed] = useState(false)
    const [isMobileOpen, setMobileOpen] = useState(false)

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('sidebar-collapsed')
            setTimeout(() => {
                if (saved) setIsCollapsed(saved === 'true')
            }, 0)
        }
    }, [])

    // Prevent body scroll — all scrolling happens inside <main>
    useEffect(() => {
        document.body.style.overflow = 'hidden'
        return () => { document.body.style.overflow = '' }
    }, [])

    const toggleSidebar = () => {
        const newState = !isCollapsed
        setIsCollapsed(newState)
        if (typeof window !== 'undefined') {
            localStorage.setItem('sidebar-collapsed', String(newState))
        }
    }

    return (
        <SidebarContext.Provider value={{ isCollapsed, toggleSidebar, isMobileOpen, setMobileOpen }}>
            {children}
        </SidebarContext.Provider>
    )
}

export function useSidebar() {
    const context = useContext(SidebarContext)
    if (!context) throw new Error('useSidebar must be used within SidebarProvider')
    return context
}
