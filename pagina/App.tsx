import React, { useState, useMemo } from 'react';
import {
  Bell, CheckCircle, Trophy, TrendingUp, Calendar,
  LogOut, PlusCircle, Users, BookOpen, Clock, Target,
  X, Award, Zap, ArrowRight, Shield, Target as TargetIcon,
  ChevronRight, Star, MessageSquare, BarChart3, PieChart,
  Activity, ArrowUpRight, TrendingDown, BookCheck, Mail,
  Lock, UserPlus, Fingerprint, Database, Cpu, Search, Check,
  Medal, GraduationCap, CreditCard, ShoppingCart,
  CheckCircle2, Compass, PenTool, Lightbulb
} from 'lucide-react';
import { User, StudyLog, StudentStats, Notification, Role } from './types';
import { SUBJECTS, MOCK_STUDENTS, MOCK_ADMIN } from './constants';

// --- COMPONENTE DE BRANDING ---

const Logo = ({ size = "md", light = false }: { size?: "sm" | "md" | "lg", light?: boolean }) => {
  const dimensions = size === "sm" ? "h-8 w-8" : size === "lg" ? "h-24 w-24" : "h-14 w-14";
  const fontSize = size === "sm" ? "text-xs" : size === "lg" ? "text-4xl" : "text-xl";

  return (
    <div className={`relative ${dimensions} flex items-center justify-center shrink-0`}>
      <div className="absolute inset-0 rounded-full border-2 border-orange-500/20 animate-pulse"></div>
      <div className="absolute inset-0 rounded-full border-t-2 border-orange-500 animate-spin [animation-duration:3s]"></div>
      <div className={`relative ${light ? 'bg-white' : 'bg-slate-900'} rounded-full w-[85%] h-[85%] flex items-center justify-center shadow-[0_0_15px_rgba(249,115,22,0.3)] border border-slate-800`}>
        <span className={`${fontSize} font-black ${light ? 'text-slate-900' : 'text-white'} tracking-tighter italic`}>01</span>
      </div>
    </div>
  );
};

// --- MOCK DE APROVADOS (RESULTADOS ANTERIORES) ---
const PAST_RESULTS = [
  { name: "Ricardo Oliveira", role: "Aprovado PRF", image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=150&h=150&auto=format&fit=crop", quote: "A mentoria mudou meu ritmo de jogo." },
  { name: "Fernanda Santos", role: "Aprovada PF - Agente", image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150&h=150&auto=format&fit=crop", quote: "Foco total no que realmente cai." },
  { name: "Lucas Mendes", role: "1º Lugar PM-SP", image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=150&h=150&auto=format&fit=crop", quote: "Estratégia é 90% da aprovação." },
  { name: "Camila Rocha", role: "Aprovada PC-DF", image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=150&h=150&auto=format&fit=crop", quote: "O ranking me motivou todos os dias." },
  { name: "Gabriel Silva", role: "Aprovado Receita Federal", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&h=150&auto=format&fit=crop", quote: "Disciplina tática impecável." },
  { name: "Beatriz Lima", role: "Aprovada PC-RJ", image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=150&h=150&auto=format&fit=crop", quote: "Materiais direto ao ponto." },
];

// --- COMPONENTE LANDING PAGE ---

function LandingPage({ onGoToLogin }: { onGoToLogin: () => void }) {
  const handleWhatsAppRedirect = (message: string) => {
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/5563999462065?text=${encodedMessage}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-orange-500/30">
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none"></div>

      <nav className="fixed top-0 w-full bg-slate-950/80 backdrop-blur-xl z-50 border-b border-white/5 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Logo size="sm" />
            <span className="text-white font-black uppercase tracking-[0.2em] text-sm">Operação 01</span>
          </div>

          <button
            onClick={onGoToLogin}
            className="group relative px-6 py-2.5 bg-orange-600 rounded-full overflow-hidden transition-all hover:scale-105 active:scale-95"
          >
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform"></div>
            <span className="relative text-[10px] font-black uppercase tracking-widest flex items-center gap-2 text-white">
              Área do Aluno <ArrowRight size={14} />
            </span>
          </button>
        </div>
      </nav>

      <main className="relative">
        {/* HERO SECTION */}
        <section className="pt-40 pb-20 px-6">
          <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 text-orange-500 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em]">
                <Zap size={14} fill="currentColor" />
                Sua aprovação é nossa única missão
              </div>
              <h1 className="text-6xl lg:text-8xl font-black text-white leading-[0.9] tracking-tighter uppercase">
                Domine o <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600">Campo de Batalha</span>
              </h1>
              <p className="text-slate-400 text-lg font-medium max-w-lg leading-relaxed">
                Pare de estudar sem estratégia. A Operação 01 é o centro de inteligência que transforma esforço em aprovação através de dados e disciplina de elite.
              </p>
              <div className="flex flex-wrap gap-4 pt-4">
                <button
                  onClick={() => document.getElementById('planos')?.scrollIntoView({ behavior: 'smooth' })}
                  className="bg-white text-slate-950 font-black uppercase tracking-widest text-xs px-10 py-5 rounded-2xl hover:bg-orange-500 hover:text-white transition-all shadow-[0_20px_40px_rgba(255,255,255,0.1)]"
                >
                  Ver Planos Operacionais
                </button>
              </div>
            </div>

            <div className="relative group flex justify-center lg:justify-end">
              <div className="absolute inset-0 bg-orange-600/10 blur-[100px] rounded-full group-hover:bg-orange-600/20 transition-colors"></div>
              <div className="relative bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-[3rem] p-10 shadow-2xl w-full max-w-md flex flex-col items-center gap-8">
                <Logo size="lg" />
                <div className="w-full space-y-4">
                  <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-orange-600 w-3/4 animate-[shimmer_2s_infinite]"></div>
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-black uppercase text-slate-500">
                    <span>Eficiência da Tropa</span>
                    <span className="text-orange-500">92% de Foco</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* MÉTODO SECTION */}
        <section id="metodo" className="py-32 px-6 relative">
          <div className="max-w-7xl mx-auto">
            <div className="text-center space-y-4 mb-20">
              <h2 className="text-[10px] font-black text-orange-500 uppercase tracking-[0.4em]">Engenharia da Aprovação</h2>
              <h3 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter">O Método Operação 01</h3>
            </div>

            <div className="grid lg:grid-cols-4 gap-4">
              {[
                {
                  step: "01",
                  icon: <Compass size={32} className="text-orange-500" />,
                  title: "Diagnóstico Tático",
                  desc: "Identificamos seus pontos fracos através de um simulado nivelador para traçar sua rota de combate."
                },
                {
                  step: "02",
                  icon: <PenTool size={32} className="text-blue-500" />,
                  title: "Plano de Operações",
                  desc: "Cronograma personalizado focado em horas líquidas e ciclo de matérias otimizado."
                },
                {
                  step: "03",
                  icon: <Target size={32} className="text-red-500" />,
                  title: "Execução & Registro",
                  desc: "Você registra cada minuto e questão no nosso terminal. Dados que geram evolução real."
                },
                {
                  step: "04",
                  icon: <Trophy size={32} className="text-amber-500" />,
                  title: "Revisão e Vitória",
                  desc: "Ajustes semanais com o mentor Weverson baseados no seu ranking e métricas de acerto."
                }
              ].map((item, i) => (
                <div key={i} className="group bg-slate-900/40 border border-white/5 p-8 rounded-[2rem] hover:bg-slate-900 transition-all">
                  <div className="flex justify-between items-start mb-6">
                    <div className="p-4 bg-slate-950 rounded-2xl border border-white/5 group-hover:scale-110 transition-transform">
                      {item.icon}
                    </div>
                    <span className="text-4xl font-black text-white/10 group-hover:text-orange-500/20 transition-colors italic">{item.step}</span>
                  </div>
                  <h4 className="text-xl font-black text-white uppercase mb-4 tracking-tight">{item.title}</h4>
                  <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>

            <div className="mt-20 bg-gradient-to-r from-orange-600 to-orange-800 rounded-[3rem] p-12 overflow-hidden relative group">
              <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:scale-125 transition-transform">
                <Zap size={200} fill="white" />
              </div>
              <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
                <div className="space-y-6">
                  <h4 className="text-3xl font-black text-white uppercase tracking-tighter">Por que o método funciona?</h4>
                  <p className="text-white/80 font-medium">Não acreditamos em fórmulas mágicas. Acreditamos em **Dados, Disciplina e Direcionamento**. Nosso software exclusivo gera insights que uma planilha comum jamais conseguiria.</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-black/20 backdrop-blur-md p-6 rounded-2xl border border-white/10">
                    <p className="text-2xl font-black text-white">40%</p>
                    <p className="text-[10px] font-black text-white/60 uppercase tracking-widest mt-1">Mais agilidade</p>
                  </div>
                  <div className="bg-black/20 backdrop-blur-md p-6 rounded-2xl border border-white/10">
                    <p className="text-2xl font-black text-white">+85%</p>
                    <p className="text-[10px] font-black text-white/60 uppercase tracking-widest mt-1">De retenção</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* APROVADOS SECTION */}
        <section id="aprovados" className="py-32 px-6 bg-slate-900/20">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-20">
              <div className="space-y-4">
                <h2 className="text-[10px] font-black text-orange-500 uppercase tracking-[0.4em]">Mural da Glória</h2>
                <h3 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter">Legado Operação 01</h3>
              </div>
              <p className="text-slate-400 max-w-md text-sm font-medium">
                Estes são alguns dos agentes que seguiram o método à risca e hoje ostentam o distintivo no peito. Sua foto será a próxima.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {PAST_RESULTS.map((res, i) => (
                <div key={i} className="group bg-slate-900 border border-white/5 rounded-[2.5rem] p-2 hover:border-orange-500/30 transition-all overflow-hidden">
                  <div className="relative h-64 rounded-[2.2rem] overflow-hidden">
                    <img src={res.image} alt={res.name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 to-transparent"></div>
                    <div className="absolute bottom-6 left-6 right-6">
                      <p className="text-xl font-black text-white uppercase tracking-tighter">{res.name}</p>
                      <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest bg-orange-500/10 px-2 py-1 rounded border border-orange-500/20">{res.role}</span>
                    </div>
                  </div>
                  <div className="p-6">
                    <p className="text-slate-400 text-sm italic font-medium leading-relaxed">"{res.quote}"</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* PLANOS SECTION */}
        <section id="planos" className="py-32 px-6 relative">
          <div className="max-w-7xl mx-auto">
            <div className="text-center space-y-4 mb-20">
              <h2 className="text-[10px] font-black text-orange-500 uppercase tracking-[0.4em]">Seu Alistamento</h2>
              <h3 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter">Invista no seu futuro</h3>
            </div>

            <div className="grid md:grid-cols-3 gap-8 items-stretch">
              {/* PLANO 01 */}
              <div className="bg-slate-900/50 border border-white/5 rounded-[3rem] p-12 flex flex-col hover:border-white/10 transition-all">
                <div className="mb-10">
                  <h4 className="text-2xl font-black text-white uppercase tracking-tight">Mentoria 01</h4>
                  <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-1">Acompanhamento e Software</p>
                </div>
                <div className="mb-10">
                  <div className="flex items-baseline gap-1">
                    <span className="text-slate-400 text-sm font-bold uppercase">R$</span>
                    <span className="text-6xl font-black text-white">189</span>
                    <span className="text-slate-400 text-sm font-bold uppercase">,00</span>
                  </div>
                  <p className="text-slate-500 text-[10px] font-bold uppercase mt-2">Pagamento Mensal</p>
                </div>
                <div className="flex-1 space-y-5">
                  {["Software Operação 01", "Ranking Nacional", "Planilha de Horas Líquidas", "Suporte Individual"].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 text-xs font-bold text-slate-400 uppercase tracking-tight">
                      <CheckCircle2 size={16} className="text-orange-500 shrink-0" /> {item}
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => handleWhatsAppRedirect("Olá! Tenho interesse no plano Operação Mentoria 01 (R$ 189,00).")}
                  className="mt-12 w-full py-5 bg-white/5 border border-white/10 text-white font-black uppercase text-[10px] tracking-widest rounded-2xl hover:bg-orange-600 transition-all"
                >
                  Iniciar Alistamento
                </button>
              </div>

              {/* PLANO COMBO - DESTAQUE */}
              <div className="bg-slate-900 border-2 border-orange-600 rounded-[3rem] p-12 flex flex-col relative shadow-[0_40px_80px_rgba(234,88,12,0.15)] scale-105 z-10">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-orange-600 px-8 py-2 rounded-full text-[10px] font-black text-white uppercase tracking-[0.3em]">
                  Oferta de Elite
                </div>
                <div className="mb-10">
                  <h4 className="text-2xl font-black text-white uppercase tracking-tight">Combo Total</h4>
                  <p className="text-orange-500 text-[10px] font-black uppercase tracking-widest mt-1">Mentoria + Aulas de Português</p>
                </div>
                <div className="mb-10">
                  <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest line-through mb-1">De R$ 378,00</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-orange-500 text-sm font-bold uppercase">R$</span>
                    <span className="text-7xl font-black text-white">289</span>
                    <span className="text-orange-500 text-sm font-bold uppercase">,00</span>
                  </div>
                </div>
                <div className="flex-1 space-y-5">
                  {[
                    "Tudo do Plano Mentoria",
                    "Curso Português Completo",
                    "Curso de Redação Nota 1000",
                    "Mentor Weverson 24h",
                    "Acesso Vitalício aos Materiais"
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 text-xs font-black text-slate-200 uppercase tracking-tight">
                      <Zap size={16} className="text-orange-500 shrink-0" fill="currentColor" /> {item}
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => handleWhatsAppRedirect("Olá! Quero garantir o Combo Mentoria + Aulas (R$ 289,00).")}
                  className="mt-12 w-full py-6 bg-orange-600 text-white font-black uppercase text-xs tracking-widest rounded-2xl shadow-xl shadow-orange-900/40 hover:bg-orange-700 transition-all"
                >
                  Garantir Combo de Elite
                </button>
              </div>

              {/* PLANO 03 */}
              <div className="bg-slate-900/50 border border-white/5 rounded-[3rem] p-12 flex flex-col hover:border-white/10 transition-all">
                <div className="mb-10">
                  <h4 className="text-2xl font-black text-white uppercase tracking-tight">Português + Redação</h4>
                  <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-1">Foco em Conteúdo Base</p>
                </div>
                <div className="mb-10">
                  <div className="flex items-baseline gap-1">
                    <span className="text-slate-400 text-sm font-bold uppercase">R$</span>
                    <span className="text-5xl font-black text-white">189</span>
                    <span className="text-slate-400 text-sm font-bold uppercase">,00</span>
                  </div>
                </div>
                <div className="flex-1 space-y-5">
                  {["Aulas semanais ao vivo via Meet", "Material de apoio em PDF", "Listas de exercícios", "Propostas de redação", "Correção individualizada", "Orientações de escrita", "Acompanhamento do aluno"].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 text-xs font-bold text-slate-400 uppercase tracking-tight">
                      <CheckCircle2 size={16} className="text-orange-500 shrink-0" /> {item}
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => handleWhatsAppRedirect("Olá! Tenho interesse nas Aulas de Língua Portuguesa e Redação (R$ 189,00).")}
                  className="mt-12 w-full py-5 bg-white/5 border border-white/10 text-white font-black uppercase text-[10px] tracking-widest rounded-2xl hover:bg-orange-600 transition-all"
                >
                  Comprar Aulas
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* CTA FINAL */}
        <section className="py-40 px-6 text-center">
          <div className="max-w-4xl mx-auto space-y-8">
            <h2 className="text-5xl md:text-7xl font-black text-white uppercase tracking-tighter">Missão dada é <span className="text-orange-500">Missão Cumprida</span></h2>
            <p className="text-slate-400 text-lg">O próximo aprovado pode ser você. Não deixe para amanhã o estudo que te fará 01.</p>
            <button
              onClick={() => handleWhatsAppRedirect("Olá! Quero ser Operação 01 e iniciar meu treinamento agora!")}
              className="bg-orange-600 text-white font-black uppercase tracking-[0.2em] text-sm px-16 py-8 rounded-[2rem] hover:bg-orange-700 shadow-[0_30px_60px_rgba(234,88,12,0.3)] transition-all active:scale-95"
            >
              Quero ser Operação 01
            </button>
          </div>
        </section>
      </main>

      <footer className="bg-slate-950 border-t border-white/5 py-12 px-6 text-center">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-3">
            <Logo size="sm" />
            <span className="text-white font-black uppercase tracking-[0.2em] text-sm">Operação 01</span>
          </div>
          <p className="text-slate-600 text-[10px] font-black uppercase tracking-widest">
            © 2024 Operação 01 • Mentoria de Elite • Todos os direitos reservados
          </p>
        </div>
      </footer>
    </div>
  );
}

// --- APP PRINCIPAL ---

export default function App() {
  const [view, setView] = useState<'landing' | 'auth' | 'confirm-email' | 'dashboard'>('landing');
  const [user, setUser] = useState<User | null>(null);
  const [logs, setLogs] = useState<StudyLog[]>([]);
  const [isNewLogModalOpen, setIsNewLogModalOpen] = useState(false);

  const handleLogin = (email: string, pass: string) => {
    if (email === 'weverson.farias@hotmail.com' && pass === 'eduarda10') {
      setUser({ ...MOCK_ADMIN, id: 'mentor-01', email, name: 'Weverson Farias' });
      setView('dashboard');
    } else {
      const student = MOCK_STUDENTS.find(s => s.email === email);
      if (student) {
        setUser(student);
        setView('dashboard');
      } else {
        alert("Acesso negado. Credenciais táticas não encontradas.");
      }
    }
  };

  const handleRegister = (email: string) => {
    setView('confirm-email');
  };

  const handleLogout = () => {
    setUser(null);
    setView('landing');
  };

  const calculateStudentStats = (studentId: string, currentLogs: StudyLog[]): StudentStats => {
    const studentLogs = currentLogs.filter(l => l.studentId === studentId);
    const totalHours = studentLogs.reduce((acc, curr) => acc + curr.hours, 0);
    const totalQuestions = studentLogs.reduce((acc, curr) => acc + curr.questionsTotal, 0);
    const totalCorrect = studentLogs.reduce((acc, curr) => acc + curr.questionsCorrect, 0);
    const student = MOCK_STUDENTS.find(s => s.id === studentId);
    return {
      studentId,
      studentName: student?.name || 'Agente',
      totalHours,
      totalQuestions,
      totalCorrect,
      accuracy: totalQuestions > 0 ? (totalCorrect / totalQuestions) * 100 : 0
    };
  };

  const rankings = useMemo(() => {
    return MOCK_STUDENTS.map(s => calculateStudentStats(s.id, logs))
      .sort((a, b) => b.totalHours - a.totalHours || b.accuracy - a.accuracy);
  }, [logs]);

  if (view === 'landing') return <LandingPage onGoToLogin={() => setView('auth')} />;
  if (view === 'auth') return <AuthScreen onLogin={handleLogin} onRegister={handleRegister} onBack={() => setView('landing')} />;
  if (view === 'confirm-email') return <ConfirmEmailScreen onBack={() => setView('auth')} />;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-slate-900 border-b border-slate-800 px-6 py-3 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <Logo size="sm" />
          <div className="hidden sm:block">
            <h1 className="text-lg font-black text-white leading-none uppercase tracking-tighter">Operação 01</h1>
            <p className="text-[10px] text-orange-500 font-bold uppercase tracking-widest mt-0.5">Painel de Operações</p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-white">{user?.name}</p>
            <p className="text-[10px] text-slate-400 uppercase font-black">{user?.role === 'ADMIN' ? 'Comandante' : 'Agente'}</p>
          </div>
          <button onClick={handleLogout} className="p-2 text-slate-400 hover:text-orange-500 rounded-full transition-colors"><LogOut size={20} /></button>
        </div>
      </header>

      <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
        {user?.role === 'STUDENT' ? (
          <StudentDashboard user={user} logs={logs} stats={calculateStudentStats(user.id, logs)} onOpenLogModal={() => setIsNewLogModalOpen(true)} />
        ) : (
          <AdminDashboard rankings={rankings} logs={logs} />
        )}
      </main>

      {isNewLogModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95">
            <div className="p-6 border-b bg-slate-50 flex justify-between items-center">
              <h2 className="text-xl font-black text-slate-900 uppercase">Registrar Missão</h2>
              <button onClick={() => setIsNewLogModalOpen(false)} className="text-slate-400"><X size={24} /></button>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const newLog: StudyLog = {
                id: Math.random().toString(36).substr(2, 9),
                studentId: user?.id || 'unknown',
                date: String(formData.get('date')),
                hours: Number(formData.get('hours')),
                subject: String(formData.get('subject')),
                content: String(formData.get('content')),
                questionsTotal: Number(formData.get('questionsTotal')),
                questionsCorrect: Number(formData.get('questionsCorrect')),
              };
              setLogs(prev => [...prev, newLog]);
              setIsNewLogModalOpen(false);
            }} className="p-8 space-y-5">
              <div className="grid grid-cols-2 gap-5">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400">Matéria</label>
                  <input name="subject" type="text" required className="w-full bg-slate-100 rounded-xl px-4 py-3" placeholder="Ex: Penal" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400">Data</label>
                  <input name="date" type="date" required defaultValue={new Date().toISOString().split('T')[0]} className="w-full bg-slate-100 rounded-xl px-4 py-3" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400">Conteúdo</label>
                <input name="content" type="text" required className="w-full bg-slate-100 rounded-xl px-4 py-3" placeholder="O que estudou?" />
              </div>
              <div className="grid grid-cols-3 gap-5">
                <input name="hours" type="number" step="0.5" required className="w-full bg-slate-100 rounded-xl px-4 py-3" placeholder="Horas" />
                <input name="questionsTotal" type="number" required className="w-full bg-slate-100 rounded-xl px-4 py-3" placeholder="Q. Total" />
                <input name="questionsCorrect" type="number" required className="w-full bg-slate-100 rounded-xl px-4 py-3" placeholder="Acertos" />
              </div>
              <button type="submit" className="w-full bg-orange-600 text-white font-black uppercase py-4 rounded-xl shadow-xl shadow-orange-100 hover:bg-orange-700 transition-all active:scale-95">Salvar Relatório</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// --- TELAS DE AUTH ---

function AuthScreen({ onLogin, onRegister, onBack }: { onLogin: (e: string, p: string) => void, onRegister: (e: string) => void, onBack: () => void }) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 relative">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-orange-600/10 blur-[150px] rounded-full pointer-events-none"></div>

      <button onClick={onBack} className="absolute top-8 left-8 text-slate-500 hover:text-white flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] transition-all">
        <ArrowRight className="rotate-180" size={16} /> Voltar ao Início
      </button>

      <div className="relative bg-slate-900 border border-white/10 p-1 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] rounded-[2.5rem] shadow-[0_40px_80px_rgba(0,0,0,0.5)] w-full max-w-md overflow-hidden">
        <div className="bg-slate-900 p-8 rounded-[2.3rem] border border-white/5 space-y-8">
          <div className="text-center">
            <div className="inline-block p-4 rounded-3xl bg-slate-950 border border-white/5 mb-6">
              <Logo size="md" />
            </div>
            <h2 className="text-2xl font-black text-white uppercase tracking-tighter">
              {mode === 'login' ? 'Login Operacional' : 'Novo Alistamento'}
            </h2>
          </div>

          <div className="flex bg-slate-950 p-1.5 rounded-2xl border border-white/5">
            <button
              onClick={() => setMode('login')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${mode === 'login' ? 'bg-orange-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
            >
              <Fingerprint size={14} /> Entrar
            </button>
            <button
              onClick={() => setMode('register')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${mode === 'register' ? 'bg-orange-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
            >
              <UserPlus size={14} /> Cadastro
            </button>
          </div>

          <form className="space-y-5" onSubmit={(e) => {
            e.preventDefault();
            if (mode === 'register' && pass !== confirmPass) {
              alert("As senhas não coincidem!");
              return;
            }
            mode === 'login' ? onLogin(email, pass) : onRegister(email);
          }}>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-slate-600 group-focus-within:text-orange-500 transition-colors">
                <Mail size={18} />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-950 border border-white/5 rounded-2xl pl-12 pr-5 py-4 text-white focus:border-orange-500/50 outline-none transition-all placeholder:text-slate-700 font-medium text-sm"
                placeholder="E-mail"
                required
              />
            </div>

            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-slate-600 group-focus-within:text-orange-500 transition-colors">
                <Lock size={18} />
              </div>
              <input
                type="password"
                value={pass}
                onChange={(e) => setPass(e.target.value)}
                className="w-full bg-slate-950 border border-white/5 rounded-2xl pl-12 pr-5 py-4 text-white focus:border-orange-500/50 outline-none transition-all placeholder:text-slate-700 font-medium text-sm"
                placeholder="Senha"
                required
              />
            </div>

            {mode === 'register' && (
              <div className="relative group animate-in slide-in-from-top-2 duration-300">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-slate-600 group-focus-within:text-orange-500 transition-colors">
                  <CheckCircle size={18} />
                </div>
                <input
                  type="password"
                  value={confirmPass}
                  onChange={(e) => setConfirmPass(e.target.value)}
                  className="w-full bg-slate-950 border border-white/5 rounded-2xl pl-12 pr-5 py-4 text-white focus:border-orange-500/50 outline-none transition-all placeholder:text-slate-700 font-medium text-sm"
                  placeholder="Confirmar Senha"
                  required
                />
              </div>
            )}

            <button type="submit" className="group relative w-full bg-orange-600 text-white font-black uppercase tracking-widest text-xs py-5 rounded-2xl shadow-[0_10px_30px_rgba(234,88,12,0.3)] active:scale-[0.98] transition-all">
              {mode === 'login' ? 'Autenticar' : 'Finalizar Cadastro'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

function ConfirmEmailScreen({ onBack }: { onBack: () => void }) {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
      <div className="relative mb-10">
        <div className="absolute inset-0 bg-orange-600/20 blur-3xl animate-pulse"></div>
        <div className="relative w-24 h-24 bg-slate-900 border border-orange-500/50 text-orange-500 rounded-3xl flex items-center justify-center shadow-[0_0_30px_rgba(234,88,12,0.2)]">
          <Mail size={48} className="animate-bounce" />
        </div>
      </div>
      <h2 className="text-4xl font-black text-white uppercase tracking-tighter mb-4">Quase lá, Agente!</h2>
      <p className="text-slate-400 max-w-sm mb-12 leading-relaxed font-medium">
        Enviamos um link de confirmação para o seu e-mail. Ative sua conta para iniciar o treinamento.
      </p>
      <button onClick={onBack} className="flex items-center gap-3 bg-white/5 border border-white/10 px-8 py-4 rounded-2xl text-orange-500 font-black uppercase text-xs tracking-widest hover:bg-white/10 transition-all">
        <ArrowRight className="rotate-180" size={16} /> Voltar ao Login
      </button>
    </div>
  );
}

// --- DASHBOARDS ---

function StudentDashboard({ user, logs, stats, onOpenLogModal }: { user: User, logs: StudyLog[], stats: StudentStats, onOpenLogModal: () => void }) {
  const userLogs = logs.filter(l => l.studentId === user.id).reverse();
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Olá, {user.name}</h2>
          <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.2em] mt-1">Status da Missão: Ativo</p>
        </div>
        <button onClick={onOpenLogModal} className="flex items-center gap-2 bg-orange-600 text-white font-black uppercase tracking-widest text-xs px-8 py-4 rounded-2xl shadow-xl hover:bg-orange-700 transition-all">
          <PlusCircle size={18} /> Novo Registro
        </button>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Total Horas" value={`${stats.totalHours}h`} icon={<Clock />} />
        <StatCard label="Questões" value={stats.totalQuestions} icon={<BookOpen />} />
        <StatCard label="Acertos" value={stats.totalCorrect} icon={<Target />} />
        <StatCard label="Precisão" value={`${stats.accuracy.toFixed(1)}%`} icon={<Trophy />} />
      </div>
    </div>
  );
}

function AdminDashboard({ rankings, logs }: { rankings: StudentStats[], logs: StudyLog[] }) {
  const totalHours = rankings.reduce((acc, curr) => acc + curr.totalHours, 0);
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <AdminMetricCard label="Agentes" value={MOCK_STUDENTS.length} icon={<Users />} color="text-blue-600" />
        <AdminMetricCard label="Horas" value={`${totalHours}h`} icon={<Clock />} color="text-orange-600" />
      </div>
    </div>
  );
}

function StatCard({ label, value, icon }: { label: string, value: any, icon: any }) {
  return (
    <div className="bg-white p-6 rounded-[1.5rem] border border-slate-200 shadow-sm group">
      <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center mb-4 text-orange-600">
        {React.cloneElement(icon as React.ReactElement<any>, { size: 20 })}
      </div>
      <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{label}</p>
      <p className="text-2xl font-black text-slate-900 mt-1">{value}</p>
    </div>
  );
}

function AdminMetricCard({ label, value, icon, color = "text-orange-600" }: { label: string, value: any, icon: any, color?: string }) {
  return (
    <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm">
      <div className={`w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center ${color} mb-4 shadow-sm`}>
        {React.cloneElement(icon as React.ReactElement<any>, { size: 24 })}
      </div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
      <p className="text-3xl font-black text-slate-900 tracking-tighter">{value}</p>
    </div>
  );
}
