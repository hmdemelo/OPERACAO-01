import { LayoutDashboard, Users, User, BookOpen, Trophy, Image, Calendar, Megaphone, FileQuestion, BookMarked, Layers, Library, PieChart, NotebookPen, ClipboardList, Activity } from "lucide-react"

export const adminItems = [
    { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard, prefetch: false },
    { label: "Usuários", href: "/admin/users", icon: Users, prefetch: false },
    { label: "Matérias", href: "/admin/subjects", icon: BookOpen, prefetch: false },
    { label: "Cronograma", href: "/admin/schedules", icon: Calendar, prefetch: false },
    { label: "Banco de Questões", href: "/admin/questions", icon: FileQuestion, prefetch: false },
    { label: "Concursos", href: "/admin/concursos", icon: Trophy, prefetch: false },
    { label: "Homepage", href: "/admin/landing", icon: Image, prefetch: false },
    { label: "Novidades", href: "/admin/changelog", icon: Megaphone, prefetch: false },
    { label: "Acessos", href: "/admin/access-log", icon: Activity, prefetch: false, adminOnly: true },
    { label: "Catálogo", href: "/admin/v2/catalogo", icon: Library, prefetch: false, section: "V2" },
    { label: "Alunos", href: "/admin/v2/students", icon: Layers, prefetch: false, section: "V2" },
    { label: "Analytics", href: "/admin/v2/dashboard", icon: PieChart, prefetch: false, section: "V2" },
]

export const mentorItems = [
    { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard, prefetch: false },
    { label: "Cronograma", href: "/admin/schedules", icon: Calendar, prefetch: false },
    { label: "Banco de Questões", href: "/admin/questions", icon: FileQuestion, prefetch: false },
    { label: "Novidades", href: "/admin/changelog", icon: Megaphone, prefetch: false },
    { label: "Alunos", href: "/admin/v2/students", icon: Layers, prefetch: false, section: "V2" },
    { label: "Analytics", href: "/admin/v2/dashboard", icon: PieChart, prefetch: false, section: "V2" },
]

export const studentItems = [
    { label: "Dashboard", href: "/student/dashboard", icon: LayoutDashboard, prefetch: false, v1: true, v2: false },
    { label: "Cronograma", href: "/student/weekly-plan", icon: Calendar, prefetch: false, v1: true, v2: false },
    { label: "Fase 1", href: "/student/fase1", icon: PieChart, prefetch: false, v1: false, v2: true },
    { label: "Fase 2", href: "/student/fase2", icon: NotebookPen, prefetch: false, v1: false, v2: true },
    { label: "Fase 3", href: "/student/fase3", icon: ClipboardList, prefetch: false, v1: false, v2: true },
    { label: "Banco de Questões", href: "/student/questions", icon: BookMarked, prefetch: false, v1: true, v2: true },
    { label: "Perfil", href: "/student/profile", icon: User, prefetch: false, v1: true, v2: true },
]
