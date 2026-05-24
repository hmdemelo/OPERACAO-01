import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
    title: "Termos de Uso | Operação 01",
    description:
        "Termos de Uso da plataforma Operação 01 — direitos, deveres e condições gerais de uso do serviço de mentoria.",
}

const VIGENCIA = "24 de maio de 2026"
const VERSAO = "1.0"

export default function TermosDeUsoPage() {
    return (
        <main className="min-h-screen bg-slate-950 text-slate-200">
            <header className="border-b border-white/5 bg-slate-900/50">
                <div className="container mx-auto max-w-3xl px-6 py-8">
                    <Link href="/" className="text-xs uppercase tracking-widest text-slate-500 hover:text-orange-500">
                        ← Operação 01
                    </Link>
                    <h1 className="mt-4 text-4xl font-black uppercase tracking-tighter text-white">
                        Termos de Uso
                    </h1>
                    <p className="mt-2 text-sm text-slate-500">
                        Versão {VERSAO} • Em vigor desde {VIGENCIA}
                    </p>
                </div>
            </header>

            <article className="container mx-auto max-w-3xl px-6 py-12 space-y-10">
                <section>
                    <p className="text-slate-300 leading-relaxed">
                        Estes Termos regulam o uso da plataforma <strong>Operação 01</strong>. Ao se cadastrar e
                        acessar o serviço, você declara ter lido, compreendido e concordado integralmente com as
                        condições aqui descritas.
                    </p>
                </section>

                <section className="space-y-3">
                    <h2 className="text-2xl font-black uppercase tracking-tight text-white">
                        1. Aceite e capacidade civil
                    </h2>
                    <p className="text-slate-300 leading-relaxed">
                        Para usar a Operação 01 você deve ter no mínimo 18 anos ou estar devidamente representado
                        por responsável legal. O cadastro implica plena aceitação destes Termos e da{" "}
                        <Link href="/privacidade" className="text-orange-500 hover:underline">
                            Política de Privacidade
                        </Link>
                        .
                    </p>
                </section>

                <section className="space-y-3">
                    <h2 className="text-2xl font-black uppercase tracking-tight text-white">
                        2. Cadastro e responsabilidades
                    </h2>
                    <ul className="list-disc space-y-2 pl-6 text-slate-300 leading-relaxed">
                        <li>Você se responsabiliza pela veracidade das informações cadastradas.</li>
                        <li>
                            Você é o único responsável pela guarda da sua senha — não a compartilhe com terceiros.
                        </li>
                        <li>
                            Em caso de uso indevido da conta, notifique imediatamente o canal de suporte para
                            bloqueio.
                        </li>
                    </ul>
                </section>

                <section className="space-y-3">
                    <h2 className="text-2xl font-black uppercase tracking-tight text-white">
                        3. Descrição do serviço
                    </h2>
                    <p className="text-slate-300 leading-relaxed">A Operação 01 oferece:</p>
                    <ul className="list-disc space-y-2 pl-6 text-slate-300 leading-relaxed">
                        <li>Mentoria personalizada para concursos públicos.</li>
                        <li>
                            Sistema de estudos em três fases (Fase 1: catálogo de tópicos; Fase 2: revisão
                            espaçada; Fase 3: simulados).
                        </li>
                        <li>Banco de questões aprovadas pelo mentor.</li>
                        <li>Plano semanal personalizado e relatórios de desempenho.</li>
                    </ul>
                </section>

                <section className="space-y-3">
                    <h2 className="text-2xl font-black uppercase tracking-tight text-white">
                        4. Propriedade intelectual
                    </h2>
                    <p className="text-slate-300 leading-relaxed">
                        Todo o conteúdo disponibilizado pelo mentor (questões, materiais didáticos, planos de
                        estudo, comentários e simulados) é protegido por direitos autorais e destinado{" "}
                        <strong>exclusivamente ao uso pessoal do aluno cadastrado</strong>. É vedada a
                        redistribuição, reprodução ou compartilhamento sem autorização expressa.
                    </p>
                </section>

                <section className="space-y-3">
                    <h2 className="text-2xl font-black uppercase tracking-tight text-white">5. Conduta proibida</h2>
                    <p className="text-slate-300 leading-relaxed">É expressamente proibido:</p>
                    <ul className="list-disc space-y-2 pl-6 text-slate-300 leading-relaxed">
                        <li>Compartilhar credenciais de acesso com terceiros.</li>
                        <li>Realizar engenharia reversa, scraping automatizado ou tentativas de invasão.</li>
                        <li>Postar conteúdo ilegal, ofensivo ou que viole direitos de terceiros.</li>
                        <li>Utilizar a plataforma para fins comerciais não autorizados.</li>
                        <li>Reproduzir ou redistribuir materiais didáticos sem autorização.</li>
                    </ul>
                </section>

                <section className="space-y-3">
                    <h2 className="text-2xl font-black uppercase tracking-tight text-white">
                        6. Suspensão e encerramento
                    </h2>
                    <p className="text-slate-300 leading-relaxed">
                        A Operação 01 pode suspender ou encerrar contas que violem estes Termos, mediante aviso
                        prévio quando possível. O usuário pode encerrar a própria conta a qualquer momento na área
                        de perfil — exclusão imediata e irreversível dos dados pessoais conforme a Política de
                        Privacidade.
                    </p>
                </section>

                <section className="space-y-3">
                    <h2 className="text-2xl font-black uppercase tracking-tight text-white">
                        7. Limitação de responsabilidade
                    </h2>
                    <p className="text-slate-300 leading-relaxed">
                        A Operação 01 oferece ferramentas e orientação pedagógica, mas{" "}
                        <strong>não garante aprovação</strong> em qualquer concurso. Os resultados dependem do
                        esforço e dedicação individual do aluno. Não nos responsabilizamos por:
                    </p>
                    <ul className="list-disc space-y-2 pl-6 text-slate-300 leading-relaxed">
                        <li>Indisponibilidades temporárias decorrentes de manutenção ou força maior.</li>
                        <li>Perdas indiretas, lucros cessantes ou danos morais decorrentes do uso da plataforma.</li>
                        <li>Conteúdo inserido por terceiros (questões enviadas por outros alunos).</li>
                    </ul>
                </section>

                <section className="space-y-3">
                    <h2 className="text-2xl font-black uppercase tracking-tight text-white">
                        8. Pagamentos e reembolso
                    </h2>
                    <p className="text-slate-300 leading-relaxed">
                        As condições de pagamento, periodicidade e política de reembolso são as informadas no
                        momento da contratação do plano. Em conformidade com o Código de Defesa do Consumidor (art.
                        49), você tem 7 dias após a contratação para arrependimento e reembolso integral, salvo se
                        já tiver consumido parte substancial do conteúdo.
                    </p>
                </section>

                <section className="space-y-3">
                    <h2 className="text-2xl font-black uppercase tracking-tight text-white">9. Alterações</h2>
                    <p className="text-slate-300 leading-relaxed">
                        Estes Termos podem ser alterados periodicamente. Alterações materiais serão notificadas por
                        e-mail e exigirão novo aceite no próximo login.
                    </p>
                </section>

                <section className="space-y-3">
                    <h2 className="text-2xl font-black uppercase tracking-tight text-white">
                        10. Foro e lei aplicável
                    </h2>
                    <p className="text-slate-300 leading-relaxed">
                        Estes Termos são regidos pela legislação brasileira. Fica eleito o foro da{" "}
                        <strong>Comarca de Araguaína, Estado do Tocantins</strong>, com renúncia expressa a
                        qualquer outro, por mais privilegiado que seja, para dirimir eventuais controvérsias.
                    </p>
                </section>

                <section className="space-y-3">
                    <h2 className="text-2xl font-black uppercase tracking-tight text-white">11. Contato</h2>
                    <p className="text-slate-300 leading-relaxed">
                        Dúvidas sobre estes Termos:{" "}
                        <a href="mailto:contato@operacao01.com.br" className="text-orange-500 hover:underline">
                            contato@operacao01.com.br
                        </a>
                        <br />
                        Dúvidas sobre privacidade:{" "}
                        <a href="mailto:privacidade@operacao01.com.br" className="text-orange-500 hover:underline">
                            privacidade@operacao01.com.br
                        </a>
                    </p>
                </section>

                <footer className="border-t border-white/5 pt-8 text-center text-xs uppercase tracking-widest text-slate-600">
                    Última atualização: {VIGENCIA} • Versão {VERSAO}
                </footer>
            </article>
        </main>
    )
}
