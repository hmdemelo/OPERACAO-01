// ─── V1 ───────────────────────────────────────────────────────────────────────

export type V1Scenario =
    | "streak_3"
    | "streak_5"
    | "streak_7"
    | "streak_10"
    | "comeback_2"
    | "comeback_3"
    | "comeback_5"
    | "accuracy_high"
    | "accuracy_low"
    | "plan_strong"
    | "plan_behind"
    | "volume_100"
    | "volume_250"
    | "volume_500"
    | "volume_1000"
    | "new_user"
    | "default"

export type V1MotivationContext = {
    currentStreak: number
    daysSinceLastLog: number
    weeklyAccuracy: number
    weeklyQuestions: number
    planCompletionRate: number
    allTimeQuestions: number
    accountAgeDays: number
    weekHasRemainingDays: boolean
}

// Priority: volume_milestone > streak > comeback > accuracy > plan > new_user > default
export function detectV1Scenario(ctx: V1MotivationContext): V1Scenario {
    if (ctx.allTimeQuestions >= 1000) return "volume_1000"
    if (ctx.allTimeQuestions >= 500)  return "volume_500"
    if (ctx.allTimeQuestions >= 250)  return "volume_250"
    if (ctx.allTimeQuestions >= 100)  return "volume_100"

    if (ctx.currentStreak >= 10) return "streak_10"
    if (ctx.currentStreak >= 7)  return "streak_7"
    if (ctx.currentStreak >= 5)  return "streak_5"
    if (ctx.currentStreak >= 3)  return "streak_3"

    if (ctx.daysSinceLastLog >= 5) return "comeback_5"
    if (ctx.daysSinceLastLog >= 3) return "comeback_3"
    if (ctx.daysSinceLastLog >= 2) return "comeback_2"

    if (ctx.weeklyQuestions >= 10 && ctx.weeklyAccuracy >= 75) return "accuracy_high"
    if (ctx.weeklyQuestions >= 15 && ctx.weeklyAccuracy < 50)  return "accuracy_low"

    if (ctx.planCompletionRate >= 70) return "plan_strong"
    if (ctx.planCompletionRate < 30 && ctx.weekHasRemainingDays) return "plan_behind"

    if (ctx.accountAgeDays <= 7) return "new_user"

    return "default"
}

export const V1_MESSAGES: Record<V1Scenario, string[]> = {
    streak_3: [
        "Três dias seguidos. O hábito está sendo construído.",
        "Consistência por três dias. Continue e isso vira rotina.",
        "Três dias sem falhar. É assim que se prepara para concurso.",
    ],
    streak_5: [
        "Cinco dias consecutivos. Consistência é o que separa quem passa de quem desiste.",
        "Cinco dias de estudo. A disciplina já está aparecendo nos números.",
        "Meio da semana sem parar. Você está construindo algo sólido.",
    ],
    streak_7: [
        "Uma semana inteira. Isso não é sorte — é disciplina.",
        "Sete dias seguidos. Pouquíssimas pessoas chegam aqui.",
        "Uma semana completa de estudo. O resultado vai aparecer.",
    ],
    streak_10: [
        "Dez dias sem parar. Você está à frente de quase todos.",
        "Dez dias consecutivos. Isso é preparo de verdade.",
        "Dez dias de sequência. Nesse ritmo, a prova é consequência.",
    ],

    comeback_2: [
        "Dois dias de pausa. Tudo bem — o importante é que você voltou.",
        "Dois dias fora. O que importa é que você está aqui agora.",
        "Voltou. Isso já é mais do que muita gente faz após uma pausa.",
    ],
    comeback_3: [
        "Voltou. Isso já é mais do que muita gente faz.",
        "Três dias difíceis. Mas você está aqui de novo.",
        "O intervalo acabou. Agora é retomar o ritmo.",
    ],
    comeback_5: [
        "Cinco dias de pausa. Mas você está aqui de novo. Recomeça do zero.",
        "Uma semana fora é pesada, mas o retorno é o que define.",
        "Voltou depois de cinco dias. Isso exige mais do que continuar — e você fez.",
    ],

    accuracy_high: [
        "Mais de 75% de acertos esta semana. O estudo está se convertendo em resultado.",
        "Alta precisão. Você não está só estudando — está aprendendo de verdade.",
        "Os números mostram o que as horas de estudo representam. Continue.",
    ],
    accuracy_low: [
        "Muitas questões, mas os acertos ainda estão baixos. Hora de revisar antes de avançar.",
        "Volume não é suficiente sem entendimento. Que tal desacelerar e revisar os erros?",
        "A quantidade está boa — agora o foco precisa ser na qualidade das respostas.",
    ],

    plan_strong: [
        "Mais de 70% do plano concluído. A semana está sendo executada do jeito certo.",
        "Você está seguindo o plano. Esse comprometimento vai aparecer na prova.",
        "Plano semanal quase completo. Termina forte.",
    ],
    plan_behind: [
        "A semana ainda não acabou. Há tempo de recuperar o plano.",
        "Atraso no plano não é derrota — é um sinal para ajustar o ritmo agora.",
        "O plano está em aberto. Uma sessão focada hoje já faz diferença.",
    ],

    volume_100: [
        "100 questões respondidas. A base está sendo construída.",
        "Cem questões. O repertório começa aqui.",
        "100 questões. Você já tem referências reais para a prova.",
    ],
    volume_250: [
        "250 questões. Você já tem um repertório real para a prova.",
        "Duzentas e cinquenta questões respondidas. Isso é preparo.",
        "250 questões no histórico. O esforço está acumulando.",
    ],
    volume_500: [
        "500 questões. Metade do caminho de quem estuda um ano inteiro.",
        "Quinhentas questões. Poucos chegam aqui.",
        "500 questões respondidas. Isso é volume de quem quer passar.",
    ],
    volume_1000: [
        "Mil questões. Isso é preparo de verdade.",
        "1000 questões. Você construiu uma base que a maioria não tem.",
        "Mil questões respondidas. O trabalho foi feito.",
    ],

    new_user: [
        "Primeira semana. O começo parece devagar, mas é onde tudo se define.",
        "Você começou — isso já é mais do que a maioria faz.",
        "Construir um hábito leva 21 dias. Você já está no caminho.",
        "O primeiro passo é o mais difícil. Você já deu.",
    ],

    default: [
        "O estudo de hoje é o resultado de amanhã.",
        "Ninguém passa em concurso por acidente. É escolha.",
        "Um dia de cada vez. Só isso.",
        "Disciplina é fazer o que precisa ser feito mesmo quando não tem vontade.",
        "A prova vai testar o que você fez nos dias em que não estava com vontade.",
        "Cada sessão de estudo é um passo que a maioria não dá.",
        "O candidato que passa não é necessariamente o mais inteligente — é o mais consistente.",
    ],
}

// ─── V2 ───────────────────────────────────────────────────────────────────────

export type V2Scenario =
    | "fase3_accuracy_high"
    | "fase3_accuracy_low"
    | "fase1_25"
    | "fase1_50"
    | "fase1_75"
    | "fase1_100"
    | "fase2_strong"
    | "fase3_first"
    | "comeback_v2_3"
    | "comeback_v2_5"
    | "fase1_low"
    | "new_user"
    | "default"

export type V2MotivationContext = {
    accountAgeDays: number
    // % de tópicos concluídos (StudyTopicBlock.completed); null = aluno sem grade
    fase1Pct: number | null
    // cadernos de erro produzidos (OR de f2Bool1..5 por disciplina)
    fase2Done: number
    // total de cadernos possíveis (5 × nº de disciplinas visíveis)
    fase2Total: number
    // precisão média ponderada nos simulados; null = nenhum simulado preenchido
    fase3Pct: number | null
    // quantidade de simulados preenchidos
    fase3Count: number
    // dias desde o último StudyTopicBlock.completed = true; null = nunca completou
    daysSinceLastTopicCompleted: number | null
}

// Priority: fase3_accuracy > fase1_milestone > fase2_strong > fase3_started >
//           comeback_v2 > fase1_low > new_user > default
export function detectV2Scenario(ctx: V2MotivationContext): V2Scenario {
    if (ctx.fase3Pct !== null && ctx.fase3Pct >= 70) return "fase3_accuracy_high"
    if (ctx.fase3Count >= 2 && ctx.fase3Pct !== null && ctx.fase3Pct < 50) return "fase3_accuracy_low"

    if (ctx.fase1Pct !== null) {
        if (ctx.fase1Pct >= 100) return "fase1_100"
        if (ctx.fase1Pct >= 75)  return "fase1_75"
        if (ctx.fase1Pct >= 50)  return "fase1_50"
        if (ctx.fase1Pct >= 25)  return "fase1_25"
    }

    if (ctx.fase2Total > 0 && (ctx.fase2Done / ctx.fase2Total) >= 0.6) return "fase2_strong"

    if (ctx.fase3Count === 1) return "fase3_first"

    if (ctx.daysSinceLastTopicCompleted !== null) {
        if (ctx.daysSinceLastTopicCompleted >= 5) return "comeback_v2_5"
        if (ctx.daysSinceLastTopicCompleted >= 3) return "comeback_v2_3"
    }

    if (ctx.fase1Pct !== null && ctx.fase1Pct < 20 && ctx.accountAgeDays > 7) return "fase1_low"

    if (ctx.accountAgeDays <= 7) return "new_user"

    return "default"
}

export const V2_MESSAGES: Record<V2Scenario, string[]> = {
    fase3_accuracy_high: [
        "Mais de 70% nos simulados. O estudo está se convertendo em resultado.",
        "Alta precisão nos simulados. O que você aprendeu na Fase 1 está aparecendo.",
        "Os números dos simulados mostram o que as horas de estudo valem. Continue.",
    ],
    fase3_accuracy_low: [
        "Vários simulados, mas a precisão ainda está baixa. Hora de voltar aos cadernos de erro.",
        "O volume de simulados está bom — agora o foco precisa ser na revisão dos erros.",
        "Fase 2 existe para isso: revisar os erros antes de avançar nos simulados.",
    ],

    fase1_25: [
        "Um quarto do conteúdo concluído. O trabalho está começando a tomar forma.",
        "25% dos tópicos. A base está sendo construída.",
        "Primeiro marco de conteúdo. Continue nesse ritmo.",
    ],
    fase1_50: [
        "Metade do conteúdo concluído. Você está no meio do caminho.",
        "50% dos tópicos. Daqui pra frente é puro avanço.",
        "Metade da Fase 1 feita. Isso é consistência real.",
    ],
    fase1_75: [
        "75% do conteúdo concluído. A reta final do programa está chegando.",
        "Três quartos dos tópicos. Poucos chegam aqui.",
        "75% da Fase 1. O trabalho está sendo feito do jeito certo.",
    ],
    fase1_100: [
        "Todo o conteúdo da Fase 1 concluído. Isso é uma preparação completa.",
        "100% dos tópicos. Agora é hora de transformar isso em resultado nos simulados.",
        "Fase 1 completa. O repertório está construído.",
    ],

    fase2_strong: [
        "Mais de 60% dos cadernos de erro produzidos. A revisão está acontecendo.",
        "Cadernos em dia. É assim que o erro vira aprendizado.",
        "Fase 2 avançada. Você está fechando os buracos antes da prova.",
    ],

    fase3_first: [
        "Primeiro simulado registrado. Agora você tem um número real para trabalhar.",
        "Simulado feito. É aqui que o estudo começa a ser testado.",
        "Primeiro resultado nos simulados. Use isso como referência para o próximo.",
    ],

    comeback_v2_3: [
        "Três dias sem concluir tópicos. O conteúdo ainda está te esperando.",
        "Pausa de três dias. Retomar agora ainda faz diferença.",
        "O ritmo parou. Uma sessão na Fase 1 já reativa o hábito.",
    ],
    comeback_v2_5: [
        "Cinco dias fora da Fase 1. Mas você está aqui agora — recomeça de onde parou.",
        "Uma semana sem avançar no conteúdo é pesada, mas o retorno é o que define.",
        "Voltou. Isso é mais difícil do que continuar — e você fez.",
    ],

    fase1_low: [
        "Poucos tópicos concluídos até agora. A Fase 1 é onde tudo começa — vale focar.",
        "O conteúdo está esperando. Cada tópico concluído é um passo na direção certa.",
        "Fase 1 ainda no início. Uma sessão de estudo já muda o número.",
    ],

    new_user: [
        "Primeira semana. O começo parece devagar, mas é onde tudo se define.",
        "Você começou — isso já é mais do que a maioria faz.",
        "Construir um hábito leva 21 dias. Você já está no caminho.",
        "O primeiro passo é o mais difícil. Você já deu.",
    ],

    default: [
        "O estudo de hoje é o resultado de amanhã.",
        "Ninguém passa em concurso por acidente. É escolha.",
        "Um dia de cada vez. Só isso.",
        "Disciplina é fazer o que precisa ser feito mesmo quando não tem vontade.",
        "A prova vai testar o que você fez nos dias em que não estava com vontade.",
        "Cada sessão de estudo é um passo que a maioria não dá.",
        "O candidato que passa não é necessariamente o mais inteligente — é o mais consistente.",
    ],
}

// ─── Compat alias (used by existing V1 callers) ───────────────────────────────

/** @deprecated Use detectV1Scenario + V1_MESSAGES directly. */
export type Scenario = V1Scenario
/** @deprecated Use V1MotivationContext. */
export type MotivationContext = V1MotivationContext
/** @deprecated Use detectV1Scenario. */
export const detectScenario = detectV1Scenario
/** @deprecated Use V1_MESSAGES. */
export const MESSAGES = V1_MESSAGES
