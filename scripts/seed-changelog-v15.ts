import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const updates = [
    {
        version: "v1.5",
        title: "Performance Base",
        content: "⚡ **Carregamento Instantâneo na Área do Aluno**: O Dashboard de estudos agora usa memória dinâmica (Zustand Global Store). Clicar na tela e voltar não exige novos carregamentos!",
        category: "IMPROVEMENT"
    },
    {
        version: "v1.5",
        title: "Novos Botões de Gestão",
        content: "🔄 **Novo Botão 'Sincronizar Agora' (Admins)**: Mentores e Administradores ganharam um botão inteligente na Dashboard para atualizar os dados gerais de alunos sob demanda, sem pesar o servidor.",
        category: "NEW"
    },
    {
        version: "v1.5",
        title: "Otimização de Bancos",
        content: "📉 **Eliminação do Efeito 'Gargalo'**: Cortamos a raiz dos travamentos de horário de pico. Os menus não pré-carregam mais conteúdo antes do seu clique, salvando 80% do tráfego do banco de dados.",
        category: "FIX"
    },
    {
        version: "v1.5",
        title: "Dashboards",
        content: "⏱️ **Cache Prolongado e Silencioso**: As tabelas com milhares de métricas gerenciais operam respondendo na hora com um cache robusto de 60 minutos, atualizável com um clique.",
        category: "IMPROVEMENT"
    },
    {
        version: "v1.5",
        title: "Security Core",
        content: "🔐 **Nova Política de Sessões (1 Hora)**: Para proteger o progresso e a conta, se o acesso ficar sem uso ativo (o aluno pode usar sites externos livremente até 1h), a plataforma fará logout automático e seguro.",
        category: "NEW"
    },
    {
        version: "v1.5",
        title: "Resiliência de Sessão",
        content: "🛡️ **Fim das 'Sessões Travadas' (Limpeza de Middleware)**: Sabe aquele botão que às vezes não respondia porque o login do dia anterior 'venceu'? O novo sistema detecta isso e direciona graciosamente o usuário para relogar.",
        category: "FIX"
    },
    {
        version: "v1.5",
        title: "Controle de Acesso",
        content: "🚧 **Bloqueio Limpo (Acesso Cruzado Dirigido)**: Links administrativos visitados por alunos (ou vice-versa) param de dar tela de erro. A plataforma apenas os realoca para suas respectivas casas.",
        category: "IMPROVEMENT"
    },
    {
        version: "v1.5",
        title: "Infraestrutura",
        content: "🧩 **Motor do Banco Equalizado (Prisma Client)**: Unificada a base de comunicação do servidor, exterminando desconexões surpresas em nuvem apontadas anteriormente nos bastidores de engenharia.",
        category: "FIX"
    },
    {
        version: "v1.5",
        title: "Sincronicidade",
        content: "🎯 **Auto-Sync Fino**: O aluno ao completar a atividade no cronograma tem o progresso refletido no dashboard instantaneamente. Nenhuma etapa 'perdida no tempo'.",
        category: "IMPROVEMENT"
    },
    {
        version: "v1.5",
        title: "SEO e Indexação",
        content: "🔎 **Identidade Google Resolvida**: Implementados rastreadores robô avançados invisíveis para que sua nova Landing Page seja reconhecida perfeitamente pelo Google de forma impecável, e protegendo os painéis internos.",
        category: "NEW"
    }
];

async function main() {
    console.log("Iniciando a injeção do Changelog V1.5...");

    for (const update of updates) {
        await prisma.changelogEntry.create({
            data: {
                version: update.version,
                title: update.title,
                content: update.content,
                category: update.category,
                published: true,
                date: new Date()
            }
        });
        console.log(`✔ Atualização adicionada: ${update.title}`);
    }

    console.log("Todas as 10 novidades foram injetadas com sucesso!");
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
