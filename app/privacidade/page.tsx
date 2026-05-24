import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
    title: "Política de Privacidade | Operação 01",
    description:
        "Política de Privacidade da Operação 01 — como coletamos, tratamos e protegemos seus dados pessoais em conformidade com a LGPD.",
}

const VIGENCIA = "24 de maio de 2026"
const VERSAO = "1.1"

export default function PoliticaPrivacidadePage() {
    return (
        <main className="min-h-screen bg-slate-950 text-slate-200">
            <header className="border-b border-white/5 bg-slate-900/50">
                <div className="container mx-auto max-w-3xl px-6 py-8">
                    <Link href="/" className="text-xs uppercase tracking-widest text-slate-500 hover:text-orange-500">
                        ← Operação 01
                    </Link>
                    <h1 className="mt-4 text-4xl font-black uppercase tracking-tighter text-white">
                        Política de Privacidade
                    </h1>
                    <p className="mt-2 text-sm text-slate-500">
                        Versão {VERSAO} • Em vigor desde {VIGENCIA}
                    </p>
                </div>
            </header>

            <article className="container mx-auto max-w-3xl px-6 py-12 space-y-10">
                <section>
                    <p className="text-slate-300 leading-relaxed">
                        Esta Política de Privacidade descreve como a <strong>Operação 01</strong> coleta, usa,
                        compartilha e protege os dados pessoais dos seus usuários, em conformidade com a Lei Geral de
                        Proteção de Dados Pessoais (Lei 13.709/2018 — LGPD).
                    </p>
                </section>

                <section className="space-y-3">
                    <h2 className="text-2xl font-black uppercase tracking-tight text-white">1. Quem somos</h2>
                    <p className="text-slate-300 leading-relaxed">
                        A <strong>Operação 01</strong> é uma plataforma de mentoria para preparação em concursos
                        públicos. Para fins desta política, atuamos como <strong>controlador de dados pessoais</strong>{" "}
                        nos termos do art. 5º, VI da LGPD.
                    </p>
                    <p className="text-slate-300 leading-relaxed">
                        Canal oficial de privacidade:{" "}
                        <a href="mailto:privacidade@operacao01.com.br" className="text-orange-500 hover:underline">
                            privacidade@operacao01.com.br
                        </a>
                    </p>
                </section>

                <section className="space-y-3">
                    <h2 className="text-2xl font-black uppercase tracking-tight text-white">
                        2. Dados que coletamos
                    </h2>
                    <p className="text-slate-300 leading-relaxed">
                        Coletamos apenas os dados estritamente necessários à prestação do serviço:
                    </p>
                    <div className="overflow-x-auto rounded-xl border border-white/5">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-900/60 text-left text-xs uppercase tracking-widest text-slate-400">
                                <tr>
                                    <th className="px-4 py-3">Dado</th>
                                    <th className="px-4 py-3">Finalidade</th>
                                    <th className="px-4 py-3">Base legal</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5 text-slate-300">
                                <tr>
                                    <td className="px-4 py-3 font-medium">Nome completo</td>
                                    <td className="px-4 py-3">Identificação do aluno</td>
                                    <td className="px-4 py-3">Execução de contrato (art. 7º, V)</td>
                                </tr>
                                <tr>
                                    <td className="px-4 py-3 font-medium">E-mail</td>
                                    <td className="px-4 py-3">Autenticação e comunicação</td>
                                    <td className="px-4 py-3">Execução de contrato (art. 7º, V)</td>
                                </tr>
                                <tr>
                                    <td className="px-4 py-3 font-medium">Senha (hash)</td>
                                    <td className="px-4 py-3">Autenticação segura</td>
                                    <td className="px-4 py-3">Execução de contrato (art. 7º, V)</td>
                                </tr>
                                <tr>
                                    <td className="px-4 py-3 font-medium">Telefone</td>
                                    <td className="px-4 py-3">Contato direto com o aluno</td>
                                    <td className="px-4 py-3">Execução de contrato (art. 7º, V)</td>
                                </tr>
                                <tr>
                                    <td className="px-4 py-3 font-medium">Data de nascimento</td>
                                    <td className="px-4 py-3">Personalização e métricas</td>
                                    <td className="px-4 py-3">Execução de contrato (art. 7º, V)</td>
                                </tr>
                                <tr>
                                    <td className="px-4 py-3 font-medium">Cidade e estado</td>
                                    <td className="px-4 py-3">Atendimento regional</td>
                                    <td className="px-4 py-3">Legítimo interesse (art. 7º, IX)</td>
                                </tr>
                                <tr>
                                    <td className="px-4 py-3 font-medium">Concurso-alvo, escolaridade</td>
                                    <td className="px-4 py-3">Personalização do plano de estudos</td>
                                    <td className="px-4 py-3">Execução de contrato (art. 7º, V)</td>
                                </tr>
                                <tr>
                                    <td className="px-4 py-3 font-medium">Logs de estudo e respostas</td>
                                    <td className="px-4 py-3">Acompanhamento pedagógico</td>
                                    <td className="px-4 py-3">Execução de contrato (art. 7º, V)</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </section>

                <section className="space-y-3">
                    <h2 className="text-2xl font-black uppercase tracking-tight text-white">
                        3. Dados que NÃO coletamos
                    </h2>
                    <ul className="list-disc space-y-2 pl-6 text-slate-300 leading-relaxed">
                        <li>
                            Não coletamos CPF nem outros documentos de identificação civil (princípio da
                            minimização — art. 6º, III da LGPD).
                        </li>
                        <li>Não armazenamos seu endereço IP em nosso banco de dados.</li>
                        <li>Não armazenamos seu User Agent (informações do navegador).</li>
                        <li>Não utilizamos login social (Google, Facebook etc.) — apenas credenciais próprias.</li>
                        <li>Não compartilhamos seus dados com SDKs de telemetria de terceiros.</li>
                    </ul>
                </section>

                <section className="space-y-3">
                    <h2 className="text-2xl font-black uppercase tracking-tight text-white">
                        4. Compartilhamento com terceiros
                    </h2>
                    <p className="text-slate-300 leading-relaxed">
                        Compartilhamos dados estritamente necessários com os seguintes operadores:
                    </p>
                    <ul className="list-disc space-y-2 pl-6 text-slate-300 leading-relaxed">
                        <li>
                            <strong>Vercel Inc.</strong> — hospedagem da aplicação (servidores nos EUA).
                        </li>
                        <li>
                            <strong>Provedor de banco de dados PostgreSQL</strong> — armazenamento dos seus dados.
                        </li>
                        <li>
                            <strong>Meta (Facebook Pixel)</strong> e <strong>Google Tag Manager</strong> — apenas{" "}
                            <em>após</em> seu consentimento explícito via banner de cookies.
                        </li>
                    </ul>
                </section>

                <section className="space-y-3">
                    <h2 className="text-2xl font-black uppercase tracking-tight text-white">5. Tempo de retenção</h2>
                    <ul className="list-disc space-y-2 pl-6 text-slate-300 leading-relaxed">
                        <li>Dados do usuário: enquanto a conta estiver ativa.</li>
                        <li>Logs de estudo e histórico: vinculados ao usuário (excluídos junto com a conta).</li>
                        <li>Histórico de auditoria de edições: até 24 meses.</li>
                        <li>
                            Após exclusão da conta, todos os dados pessoais são removidos definitivamente
                            (eliminação física) em até 30 dias.
                        </li>
                    </ul>
                </section>

                <section className="space-y-3">
                    <h2 className="text-2xl font-black uppercase tracking-tight text-white">
                        6. Seus direitos como titular
                    </h2>
                    <p className="text-slate-300 leading-relaxed">
                        Em conformidade com o art. 18 da LGPD, você pode, a qualquer momento, solicitar:
                    </p>
                    <ul className="list-disc space-y-2 pl-6 text-slate-300 leading-relaxed">
                        <li>Confirmação da existência de tratamento dos seus dados.</li>
                        <li>Acesso aos dados que mantemos sobre você.</li>
                        <li>Correção de dados incompletos, inexatos ou desatualizados.</li>
                        <li>Anonimização, bloqueio ou eliminação de dados desnecessários ou excessivos.</li>
                        <li>Portabilidade dos seus dados para outro fornecedor.</li>
                        <li>Eliminação dos dados tratados com seu consentimento.</li>
                        <li>Informação sobre as entidades com quem compartilhamos seus dados.</li>
                        <li>Revogação do consentimento, quando aplicável.</li>
                    </ul>
                </section>

                <section className="space-y-3">
                    <h2 className="text-2xl font-black uppercase tracking-tight text-white">
                        7. Como exercer seus direitos
                    </h2>
                    <p className="text-slate-300 leading-relaxed">
                        Para exercer qualquer dos direitos listados acima, envie um e-mail para{" "}
                        <a href="mailto:privacidade@operacao01.com.br" className="text-orange-500 hover:underline">
                            privacidade@operacao01.com.br
                        </a>{" "}
                        identificando-se como titular. Responderemos em até <strong>15 dias úteis</strong>.
                    </p>
                </section>

                <section className="space-y-3">
                    <h2 className="text-2xl font-black uppercase tracking-tight text-white">
                        8. Cookies e rastreamento
                    </h2>
                    <p className="text-slate-300 leading-relaxed">
                        Utilizamos cookies estritamente necessários para o funcionamento da plataforma (sessão de
                        login). Esses cookies não exigem consentimento (art. 7º, V, LGPD).
                    </p>
                    <p className="text-slate-300 leading-relaxed">
                        Cookies de marketing e analytics (Facebook Pixel, Google Tag Manager) são carregados{" "}
                        <strong>somente após seu consentimento explícito</strong> no banner exibido na primeira
                        visita. Você pode revogar o consentimento a qualquer momento limpando o armazenamento local
                        do navegador.
                    </p>
                </section>

                <section className="space-y-3">
                    <h2 className="text-2xl font-black uppercase tracking-tight text-white">
                        9. Segurança técnica
                    </h2>
                    <ul className="list-disc space-y-2 pl-6 text-slate-300 leading-relaxed">
                        <li>Todas as senhas são armazenadas como hash BCrypt (nunca em texto claro).</li>
                        <li>Comunicação criptografada via HTTPS/TLS.</li>
                        <li>Tokens de sessão (JWT) com expiração absoluta de 1 hora.</li>
                        <li>Não armazenamos IPs nem fingerprints de navegador.</li>
                    </ul>
                </section>

                <section className="space-y-3">
                    <h2 className="text-2xl font-black uppercase tracking-tight text-white">
                        10. Alterações nesta política
                    </h2>
                    <p className="text-slate-300 leading-relaxed">
                        Esta política pode ser atualizada periodicamente. Alterações materiais serão notificadas por
                        e-mail e exigirão novo aceite no próximo login.
                    </p>
                </section>

                <section className="space-y-3">
                    <h2 className="text-2xl font-black uppercase tracking-tight text-white">11. Encarregado (DPO)</h2>
                    <p className="text-slate-300 leading-relaxed">
                        O canal{" "}
                        <a href="mailto:privacidade@operacao01.com.br" className="text-orange-500 hover:underline">
                            privacidade@operacao01.com.br
                        </a>{" "}
                        é a via oficial para todas as comunicações relativas a privacidade e proteção de dados,
                        funcionando como ponto de contato com o Encarregado pelo Tratamento de Dados Pessoais (art.
                        41 da LGPD).
                    </p>
                </section>

                <footer className="border-t border-white/5 pt-8 text-center text-xs uppercase tracking-widest text-slate-600">
                    Última atualização: {VIGENCIA} • Versão {VERSAO}
                </footer>
            </article>
        </main>
    )
}
