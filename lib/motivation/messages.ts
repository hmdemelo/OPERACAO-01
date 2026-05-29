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
        "O ritmo está começando a se alinhar. Três dias seguidos é a prova de que você consegue vencer a inércia.",
        "Três dias de consistência. O hábito está ganhando corpo. Continue firme hoje!",
        "Você provou nos últimos 3 dias que a disciplina é maior que a motivação.",
    ],
    streak_5: [
        "Cinco dias consecutivos. A sua concorrência começa a ficar para trás quando você transforma estudo em rotina.",
        "Consistência excelente! Cinco dias seguidos mostrando que você não depende de condições perfeitas para estudar.",
        "Você está no comando do seu dia há 5 dias. Esse é o caminho exato rumo à aprovação.",
    ],
    streak_7: [
        "Uma semana inteira sem falhar. Você não está apenas estudando; está se tornando imparável.",
        "Sete dias seguidos. Essa regularidade é o que converte horas de estudo em posse de cargo.",
        "Pouquíssimos mantêm esse foco por 7 dias. Você provou que pertence ao grupo dos obstinados.",
    ],
    streak_10: [
        "10+ dias ininterruptos. Você entrou na zona de alta performance. Proteja essa sequência com unhas e dentes!",
        "Mais de 10 dias seguidos. Isso não é esforço isolado, é mentalidade de aprovado.",
        "Nesse ritmo de consistência extrema, o edital começa a parecer pequeno. Continue liderando sua rotina.",
    ],

    comeback_2: [
        "A pausa acabou e o seu compromisso continua intacto. Que bom ter você de volta hoje!",
        "Dois dias fora são apenas um detalhe. O importante é o clique de agora: você decidiu voltar.",
        "Retomar o ritmo rapidamente é a habilidade secreta dos aprovados. Vamos para a sessão de hoje.",
    ],
    comeback_3: [
        "A vida tem imprevistos, mas a sua persistência é maior. O foco está reativado a partir de agora.",
        "Três dias de intervalo. Esqueça o que passou e concentre-se apenas na primeira questão de hoje.",
        "Você voltou. Esse recomeço é o que separa quem passa de quem apenas sonha.",
    ],
    comeback_5: [
        "Cinco dias de hiato, mas o seu conhecimento acumulado continua com você. Vamos retomar o ritmo de onde parou?",
        "O ritmo pausou, mas a sua meta continua no mesmo lugar. Uma pequena sessão hoje já te recoloca no jogo.",
        "Voltar após cinco dias exige coragem e foco. Você tomou a decisão certa ao entrar hoje. Vamos juntos!",
    ],

    accuracy_high: [
        "Mais de 75% de acertos esta semana. O estudo está se convertendo em resultado.",
        "Alta precisão nos exercícios. Você está realmente absorvendo o conteúdo, não apenas batendo edital.",
        "Excelente rendimento! Esses acertos são a prova concreta de que as horas de estudo estão virando aprendizado.",
    ],
    accuracy_low: [
        "Você está com um ótimo volume de questões, mas a taxa de acerto sugere que vale a pena fazer uma pausa para revisar a teoria ou os erros.",
        "Muito bom pelo esforço no volume! Agora, que tal desacelerar um pouco e usar as questões erradas como um mapa de revisão?",
        "Errar é parte crucial do aprendizado. Antes de avançar para novas questões, dedique um tempo para entender os porquês dos erros de hoje.",
    ],

    plan_strong: [
        "Mais de 70% do plano semanal concluído! Você está executando o planejamento com maestria.",
        "O plano está virando realidade. Esse nível de compromisso com o cronograma vai se refletir na sua nota.",
        "Faltando pouco para fechar a semana com chave de ouro. Continue forte na reta final do plano!",
    ],
    plan_behind: [
        "O plano está em aberto, mas a semana ainda não acabou. Uma sessão concentrada hoje já muda o cenário.",
        "Não se preocupe em cumprir o plano perfeito; foque apenas em fazer a próxima sessão possível hoje.",
        "Ajuste de rota: o plano semanal está um pouco atrasado, mas você tem tempo para recuperar. Vamos dar o primeiro passo agora?",
    ],

    volume_100: [
        "100 questões respondidas! O aquecimento terminou. Você já tem dados reais sobre o seu rendimento.",
        "Primeiro marco histórico atingido: 100 questões. A sua base prática começou a ser solidificada.",
        "100 questões. Você já tem referências reais para a prova.",
    ],
    volume_250: [
        "250 questões no histórico. O seu repertório prático está se tornando uma vantagem competitiva real.",
        "Duzentas e cinquenta questões. Cada uma delas é um erro a menos que você cometerá na prova.",
        "250 questões no histórico. O esforço está acumulando.",
    ],
    volume_500: [
        "500 questões resolvidas! Metade de um milhar. Você já tem mais bagagem de treino que a maioria dos candidatos.",
        "500 passos dados na direção certa. O seu esforço acumulado está gerando casca e maturidade de prova.",
        "500 questões respondidas. Isso é volume de quem quer passar.",
    ],
    volume_1000: [
        "1.000 QUESTÕES! Um marco monumental. Você não é mais um iniciante; você treina como um profissional dos concursos.",
        "Mil questões respondidas no histórico. Pouquíssimas pessoas têm essa disciplina. Respeite a sua trajetória!",
        "Mil questões respondidas. O trabalho foi feito.",
    ],

    new_user: [
        "Primeira semana na plataforma! O início exige adaptação, mas cada clique hoje está pavimentando seu caminho até a posse.",
        "Você deu o passo que 95% das pessoas apenas planejam: você começou. Bem-vindo(a) à Operação 01!",
        "Construir o hábito de estudos é como engrenar um motor pesado: o começo exige mais força, mas logo vira rotina. Foco no dia de hoje!",
        "Não tente ser perfeito no começo, apenas seja consistente. Estude um pouco hoje e considere o dia ganho.",
    ],

    default: [
        "O cargo dos seus sonhos é construído com as horas invisíveis de um dia comum.",
        "Ninguém passa em concurso por sorte ou acidente. Passa quem decide pagar o preço da consistência diária.",
        "Um dia de cada vez, uma sessão por vez, uma questão por vez. O topo da montanha só se alcança assim.",
        "Disciplina é fazer o que precisa ser feito, mesmo nos dias em que a motivação não aparece.",
        "A prova vai cobrar exatamente o esforço que você colocou nos dias em que preferia estar descansando.",
        "O candidato aprovado não é o que nunca falha, mas o que nunca desiste de recomeçar.",
        "Cada questão resolvida hoje é um obstáculo a menos entre você e o Diário Oficial.",
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
        "Mais de 70% de média nos simulados. O funil de preparação da Fase 1 e 2 está convertendo em resultado bruto.",
        "Média excelente nos simulados! Você está provando que a teoria estudada foi verdadeiramente consolidada.",
        "Desempenho digno de aprovação. Continue calibrando os detalhes nos simulados para garantir a vaga.",
    ],
    fase3_accuracy_low: [
        "A precisão nos simulados está abaixo da meta. Lembre-se: o simulado serve exatamente para errar aqui e acertar na prova. É hora de voltar aos Cadernos de Erro da Fase 2.",
        "O volume de simulados está bom, mas a evolução está travada. Que tal blindar suas fraquezas revisando a fundo seus cadernos de erros esta semana?",
        "Simulados são diagnósticos. Se a média está baixa, o remédio está na Fase 2. Vamos mapear os temas recorrentes que precisam de reforço.",
    ],

    fase1_25: [
        "25% da Fase 1 concluída. A base teórica está ganhando forma. Excelente começo!",
        "Um quarto do conteúdo já foi vencido. Continue empilhando esses pequenos blocos todos os dias.",
        "Primeiro marco de conteúdo. Continue nesse ritmo.",
    ],
    fase1_50: [
        "Metade da Fase 1 batida! A montanha parece alta, mas você já passou da metade da subida. O topo está mais perto.",
        "50% dos tópicos concluídos. Você estabilizou seu ritmo de estudos. Daqui para a frente é consolidação.",
        "Metade da Fase 1 feita. Isso é consistência real.",
    ],
    fase1_75: [
        "75% da Fase 1 concluída. O final do edital está à vista. Mantenha a guarda alta nesta reta final de teoria!",
        "Três quartos da teoria vencidos. Pouquíssimos chegam até aqui com essa consistência. Continue acelerando.",
        "75% da Fase 1. O trabalho está sendo feito do jeito certo.",
    ],
    fase1_100: [
        "100% da Fase 1 completa! Um feito espetacular. Você dominou o edital teórico. Agora sua preparação entra no nível avançado.",
        "Teoria finalizada com sucesso! Você construiu o repertório básico completo. É hora de brilhar nos simulados e lapidar os erros.",
        "Fase 1 completa. O repertório está construído.",
    ],

    fase2_strong: [
        "Mais de 60% dos cadernos de erro produzidos. Você está ativamente eliminando os pontos cegos da sua preparação.",
        "Revisão em dia! O caderno de erros é o verdadeiro segredo dos aprovados. Cada erro catalogado é um acerto garantido.",
        "Você está tratando seus erros com seriedade profissional. Esse nível de revisão blinda sua nota contra pegadinhas.",
    ],

    fase3_first: [
        "Primeiro simulado registrado! Ele serve para calibrar sua bússola e mapear fraquezas, não para te definir. O ponto de partida foi dado.",
        "Você teve a coragem de se testar. Com esse primeiro diagnóstico na mesa, sabemos exatamente onde ajustar seu plano de estudo.",
        "Primeiro resultado nos simulados. Use isso como referência para o próximo.",
    ],

    comeback_v2_3: [
        "Três dias sem avançar nos tópicos. A Fase 1 está te esperando para darmos mais um passo hoje. Qual assunto vamos vencer agora?",
        "Pausa de três dias. Reiniciar o hábito hoje impede que o ritmo se perca por completo. Vamos a um tópico simples?",
        "O ritmo parou. Uma sessão na Fase 1 já reativa o hábito.",
    ],
    comeback_v2_5: [
        "Cinco dias fora da trilha de tópicos. Esqueça o tempo parado; seu progresso está salvo. Vamos retomar hoje de onde parou?",
        "Voltar a estudar depois de uma pausa exige energia, e você acabou de dar esse passo ao entrar. Vamos vencer um único bloco hoje para reativar o motor.",
        "Voltou. Isso é mais difícil do que continuar — e você fez.",
    ],

    fase1_low: [
        "Seu progresso na Fase 1 está um pouco lento. Lembre-se: a aprovação é construída de tópico em tópico. Que tal fechar apenas um hoje?",
        "O edital pode parecer gigante no início, mas ele cede diante da consistência diária. Vamos dar o próximo passo na Fase 1 hoje?",
        "Fase 1 ainda no início. Uma sessão de estudo já muda o número.",
    ],

    new_user: [
        "Primeira semana na plataforma! O início exige adaptação, mas cada clique hoje está pavimentando seu caminho até a posse.",
        "Você deu o passo que 95% das pessoas apenas planejam: você começou. Bem-vindo(a) à Operação 01!",
        "Construir o hábito de estudos é como engrenar um motor pesado: o começo exige mais força, mas logo vira rotina. Foco no dia de hoje!",
        "Não tente ser perfeito no começo, apenas seja consistente. Estude um pouco hoje e considere o dia ganho.",
    ],

    default: [
        "O cargo dos seus sonhos é construído com as horas invisíveis de um dia comum.",
        "Ninguém passa em concurso por sorte ou acidente. Passa quem decide pagar o preço da consistência diária.",
        "Um dia de cada vez, uma sessão por vez, uma questão por vez. O topo da montanha só se alcança assim.",
        "Disciplina é fazer o que precisa ser feito, mesmo nos dias em que a motivação não aparece.",
        "A prova vai cobrar exatamente o esforço que você colocou nos dias em que preferia estar descansando.",
        "O candidato aprovado não é o que nunca falha, mas o que nunca desiste de recomeçar.",
        "Cada questão resolvida hoje é um obstáculo a menos entre você e o Diário Oficial.",
    ],
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

/** Sorteia uma mensagem do array do cenário. */
export function pickMessage(messages: string[]): string {
    return messages[Math.floor(Math.random() * messages.length)]
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
