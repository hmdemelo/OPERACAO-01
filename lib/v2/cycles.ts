import { prisma } from "@/lib/db"

/**
 * Retorna o StudyGrid ativo do aluno (cycle em andamento). Se o aluno nunca teve
 * um ciclo criado, retorna null — o mentor precisa criar o primeiro ciclo antes
 * que o aluno consiga interagir com a Fase 1.
 */
export async function getActiveGrid(userId: string) {
    return prisma.studyGrid.findFirst({
        where: { userId, active: true },
        select: { id: true, cycleNumber: true, cycleLabel: true },
    })
}

/**
 * Retorna todos os IDs de tópicos do catálogo que o aluno já marcou como
 * `completed` em ciclos anteriores (qualquer grid, ativo ou não).
 *
 * Usado pela UI do mentor durante a montagem de um novo ciclo para sinalizar
 * "já estudado" ao lado dos tópicos.
 */
export async function getStudiedTopicV2Ids(userId: string): Promise<Set<string>> {
    const rows = await prisma.studyTopicBlock.findMany({
        where: {
            completed: true,
            contentBlock: { block: { grid: { userId } } },
        },
        select: { topicV2Id: true },
    })
    return new Set(rows.map(r => r.topicV2Id))
}
