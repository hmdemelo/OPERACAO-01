import { LayoutDashboard, Users, User, BookOpen, Trophy, Image, Calendar, Megaphone } from "lucide-react"

export const adminItems = [
    { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard, prefetch: false },
    { label: "Usuários", href: "/admin/users", icon: Users, prefetch: false },
    { label: "Matérias", href: "/admin/subjects", icon: BookOpen, prefetch: false },
    { label: "Cronograma", href: "/admin/schedules", icon: Calendar, prefetch: false },
    { label: "Concursos", href: "/admin/concursos", icon: Trophy, prefetch: false },
    { label: "Homepage", href: "/admin/landing", icon: Image, prefetch: false },
    { label: "Novidades", href: "/admin/changelog", icon: Megaphone, prefetch: false },
]

export const mentorItems = [
    { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard, prefetch: false },
    { label: "Cronograma", href: "/admin/schedules", icon: Calendar, prefetch: false },
    { label: "Novidades", href: "/admin/changelog", icon: Megaphone, prefetch: false },
]

export const studentItems = [
    { label: "Dashboard", href: "/student/dashboard", icon: LayoutDashboard, prefetch: false },
    { label: "Cronograma", href: "/student/weekly-plan", icon: Calendar, prefetch: false },
    { label: "Perfil", href: "/student/profile", icon: User, prefetch: false },
]
