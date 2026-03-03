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

    // Use useEffect to access localStorage on the client side only
    useEffect(() => {
        // Check if window is defined (it should be in useEffect, but good practice)
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('sidebar-collapsed')
            if (saved) setIsCollapsed(saved === 'true')
        }
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
