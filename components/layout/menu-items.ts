import { LayoutDashboard, Users, User, BookOpen, Trophy, Image, Calendar, Megaphone } from "lucide-react"

export const adminItems = [
    { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard, prefetch: false },
    { label: "Usuários", href: "/admin/users", icon: Users, prefetch: false },
    { label: "Matérias", href: "/admin/subjects", icon: BookOpen },
    { label: "Cronograma", href: "/admin/schedules", icon: Calendar, prefetch: false },
    { label: "Concursos", href: "/admin/concursos", icon: Trophy },
    { label: "Homepage", href: "/admin/landing", icon: Image },
    { label: "Novidades", href: "/admin/changelog", icon: Megaphone },
]

export const mentorItems = [
    { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { label: "Cronograma", href: "/admin/schedules", icon: Calendar },
    { label: "Novidades", href: "/admin/changelog", icon: Megaphone },
]

export const studentItems = [
    { label: "Dashboard", href: "/student/dashboard", icon: LayoutDashboard },
    { label: "Cronograma", href: "/student/weekly-plan", icon: Calendar },
    { label: "Perfil", href: "/student/profile", icon: User },
]
