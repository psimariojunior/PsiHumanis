import Link from "next/link"
import { Shield, Lock, Eye, Trash2, Mail, Globe, AlertTriangle, UserCheck } from "lucide-react"

export default function PrivacidadePage() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <div className="max-w-3xl mx-auto px-4 py-16 md:py-24">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-xl shadow-emerald-500/20 mb-6">
          <Shield className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-8">Política de Privacidade</h1>

        <div className="prose prose-slate dark:prose-invert max-w-none space-y-8">
          <section>
            <h2 className="flex items-center gap-2 text-xl font-semibold text-slate-900 dark:text-white">
              <Shield className="h-5 w-5 text-emerald-500" /> 1. Dados Coletados
            </h2>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Coletamos os seguintes dados pessoais fornecidos voluntariamente pelo usuário:
              nome completo, endereço de email, número de telefone, CPF e data de nascimento.
              Durante o uso da plataforma, também registramos dados de agendamento,
              prontuários e entradas no diário emocional.
            </p>
          </section>

          <section>
            <h2 className="flex items-center gap-2 text-xl font-semibold text-slate-900 dark:text-white">
              <UserCheck className="h-5 w-5 text-emerald-500" /> 2. Bases Legais para Tratamento
            </h2>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Nosso tratamento de dados pessoais é fundamentado nas seguintes bases legais da LGPD (Art. 7):
            </p>
            <ul className="list-disc list-inside text-slate-600 dark:text-slate-400 leading-relaxed mt-3 space-y-2">
              <li><strong>Consentimento (Art. 7, I):</strong> Para envio de comunicações de marketing, cookies de rastreamento e compartilhamento com terceiros não essenciais.</li>
              <li><strong>Execução de contrato (Art. 7, V):</strong> Para prestação dos serviços de agendamento, prontuários eletrônicos, videochamadas e controle financeiro.</li>
              <li><strong>Legítimo interesse (Art. 7, IX):</strong> Para melhoria dos serviços, segurança da plataforma e prevenção de fraudes.</li>
              <li><strong>Obrigação legal (Art. 7, II):</strong> Para manutenção de prontuários pelo prazo mínimo de 5 anos (Resolução CFP nº 06/2019) e obrigações fiscais.</li>
            </ul>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed mt-3">
              Para dados sensíveis (dados de saúde, registros clínicos, diário emocional), utilizamos
              como base legal o <strong>consentimento específico (Art. 11, I)</strong> e a <strong>tutela da saúde
              (Art. 11, II, f)</strong>, conforme previsto na LGPD.
            </p>
          </section>

          <section>
            <h2 className="flex items-center gap-2 text-xl font-semibold text-slate-900 dark:text-white">
              <Lock className="h-5 w-5 text-emerald-500" /> 3. Armazenamento e Segurança
            </h2>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Seus dados são armazenados em servidores seguros com criptografia em trânsito
              (TLS 1.3) e em repouso (AES-256). Utilizamos PostgreSQL em infraestrutura
              Neon, com backups diários e replicação automática.
            </p>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed mt-3">
              O acesso aos dados é restrito ao psicólogo responsável (CRP 04/52274) e
              ao próprio paciente, através de autenticação segura com tokens JWT.
            </p>
          </section>

          <section>
            <h2 className="flex items-center gap-2 text-xl font-semibold text-slate-900 dark:text-white">
              <Eye className="h-5 w-5 text-emerald-500" /> 4. Compartilhamento de Dados
            </h2>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Nenhum dado pessoal é compartilhado com terceiros sem o consentimento expresso
              do titular. Exceções aplicam-se apenas a obrigações legais ou ordem judicial.
            </p>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed mt-3">
              Utilizamos serviços de terceiros para funcionalidades específicas:
            </p>
            <ul className="list-disc list-inside text-slate-600 dark:text-slate-400 leading-relaxed mt-2 space-y-1">
              <li><strong>Resend</strong> — envio de emails transacionais (lembretes, confirmações)</li>
              <li><strong>SendGrid</strong> — envio de emails para pacientes</li>
              <li><strong>LiveKit Cloud</strong> — videochamadas seguras com criptografia ponta a ponta</li>
              <li><strong>Neon</strong> — armazenamento de banco de dados (PostgreSQL)</li>
              <li><strong>Vercel</strong> — hospedagem da aplicação</li>
              <li><strong>Stripe</strong> — processamento de pagamentos</li>
              <li><strong>Google Analytics</strong> — análise de tráfego (apenas com consentimento)</li>
            </ul>
          </section>

          <section>
            <h2 className="flex items-center gap-2 text-xl font-semibold text-slate-900 dark:text-white">
              <Globe className="h-5 w-5 text-emerald-500" /> 5. Transferência Internacional de Dados
            </h2>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Alguns dos nossos serviços de terceiros estão localizados fora do Brasil,
              o que pode envolver a transferência internacional de dados pessoais.
              Essas transferências são realizadas em conformidade com o Capítulo V da LGPD
              (Arts. 33 a 36), com as seguintes garantias:
            </p>
            <ul className="list-disc list-inside text-slate-600 dark:text-slate-400 leading-relaxed mt-2 space-y-1">
              <li>Países com grau de proteção adequado reconhecido pela ANPD</li>
              <li>Cláusulas contratuais padrão de proteção de dados</li>
              <li>Certificações e normas técnicas de segurança (SOC 2, ISO 27001)</li>
              <li>Medidas técnicas de criptografia em trânsito e em repouso</li>
            </ul>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed mt-3">
              Os principais serviços utilizados fora do Brasil incluem: LiveKit Cloud (EUA),
              Vercel (EUA), Stripe (EUA) e Resend (EUA).
            </p>
          </section>

          <section>
            <h2 className="flex items-center gap-2 text-xl font-semibold text-slate-900 dark:text-white">
              <Trash2 className="h-5 w-5 text-emerald-500" /> 6. Direitos do Titular
            </h2>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Nos termos dos Arts. 17 a 22 da LGPD, você tem direito a:
            </p>
            <ul className="list-disc list-inside text-slate-600 dark:text-slate-400 leading-relaxed mt-2 space-y-1">
              <li><strong>Confirmação</strong> da existência de tratamento de dados</li>
              <li><strong>Acesso</strong> aos seus dados pessoais</li>
              <li><strong>Correção</strong> de dados incompletos ou desatualizados</li>
              <li><strong>Anonimização, bloqueio ou exclusão</strong> de dados desnecessários</li>
              <li><strong>Portabilidade</strong> dos dados a outro fornecedor</li>
              <li><strong>Eliminação</strong> dos dados tratados com consentimento</li>
              <li><strong>Informação</strong> sobre compartilhamento com terceiros</li>
              <li><strong>Revogação do consentimento</strong> a qualquer momento</li>
            </ul>
          </section>

          <section>
            <h2 className="flex items-center gap-2 text-xl font-semibold text-slate-900 dark:text-white">
              <Trash2 className="h-5 w-5 text-emerald-500" /> 7. Exclusão de Dados
            </h2>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              O paciente pode solicitar a exclusão de seus dados a qualquer momento.
              A solicitação deve ser feita por email para o psicólogo responsável.
              Os dados serão removidos em até 30 dias, exceto quando houver obrigação
              legal de retenção (como prontuários, que devem ser mantidos pelo prazo
              mínimo de 5 anos conforme Resolução CFP nº 06/2019 e legislação vigente).
            </p>
          </section>

          <section>
            <h2 className="flex items-center gap-2 text-xl font-semibold text-slate-900 dark:text-white">
              <AlertTriangle className="h-5 w-5 text-emerald-500" /> 8. Cookies
            </h2>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Utilizamos os seguintes cookies:
            </p>
            <div className="mt-3 overflow-x-auto">
              <table className="min-w-full text-sm text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 rounded-lg">
                <thead className="bg-slate-50 dark:bg-slate-800">
                  <tr>
                    <th className="px-4 py-2 text-left font-medium">Cookie</th>
                    <th className="px-4 py-2 text-left font-medium">Finalidade</th>
                    <th className="px-4 py-2 text-left font-medium">Duração</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  <tr>
                    <td className="px-4 py-2">next-auth.session-token</td>
                    <td className="px-4 py-2">Autenticação do psicólogo</td>
                    <td className="px-4 py-2">Sessão</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2">next-auth.csrf-token</td>
                    <td className="px-4 py-2">Proteção contra ataques CSRF</td>
                    <td className="px-4 py-2">Sessão</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2">psihumanis-locale</td>
                    <td className="px-4 py-2">Idioma de preferência (PT/EN)</td>
                    <td className="px-4 py-2">1 ano</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2">psihumanis-theme</td>
                    <td className="px-4 py-2">Tema de aparência (claro/escuro)</td>
                    <td className="px-4 py-2">1 ano</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2">cookie_consent</td>
                    <td className="px-4 py-2">Registro de consentimento de cookies</td>
                    <td className="px-4 py-2">1 ano</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2">_ga / _gid</td>
                    <td className="px-4 py-2">Google Analytics — análise de tráfego (apenas com consentimento)</td>
                    <td className="px-4 py-2">2 anos / 24h</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed mt-3">
              Você pode gerenciar suas preferências de cookies a qualquer momento
              através do banner de cookies ou limpando os cookies do seu navegador.
            </p>
          </section>

          <section>
            <h2 className="flex items-center gap-2 text-xl font-semibold text-slate-900 dark:text-white">
              <Mail className="h-5 w-5 text-emerald-500" /> 9. Contato e Encarregado
            </h2>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Para exercer seus direitos como titular de dados (acesso, correção, exclusão,
              portabilidade), entre em contato:
            </p>
            <div className="mt-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
              <p className="text-slate-600 dark:text-slate-400">
                <strong>Encarregado de Proteção de Dados (DPO):</strong> Mário Júnior
              </p>
              <p className="text-slate-600 dark:text-slate-400">
                <strong>CRP:</strong> 04/52274
              </p>
              <p className="text-slate-600 dark:text-slate-400">
                <strong>Email:</strong>{" "}
                <a href="mailto:contato@psihumanis.com.br" className="text-emerald-600 dark:text-emerald-400 hover:underline">
                  contato@psihumanis.com.br
                </a>
              </p>
              <p className="text-slate-600 dark:text-slate-400">
                <strong>Telefone:</strong> (31) 99286-3861
              </p>
              <p className="text-slate-600 dark:text-slate-400">
                <strong>Endereço:</strong> Belo Horizonte, MG — Brasil
              </p>
            </div>
          </section>

          <section>
            <h2 className="flex items-center gap-2 text-xl font-semibold text-slate-900 dark:text-white">
              <AlertTriangle className="h-5 w-5 text-emerald-500" /> 10. Autoridade Nacional de Proteção de Dados
            </h2>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Caso não receba resposta satisfatória do encarregado ou considere que seu
              direito não foi respeitado, você pode registrar uma reclamação junto à
              Autoridade Nacional de Proteção de Dados (ANPD):
            </p>
            <div className="mt-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
              <p className="text-slate-600 dark:text-slate-400">
                <strong>Site:</strong>{" "}
                <a href="https://www.gov.br/anpd" target="_blank" rel="noopener noreferrer" className="text-emerald-600 dark:text-emerald-400 hover:underline">
                  www.gov.br/anpd
                </a>
              </p>
              <p className="text-slate-600 dark:text-slate-400">
                <strong>Canal de atendimento:</strong> canal. citizen.gov.br/anpd
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">11. Atualizações</h2>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Esta política pode ser atualizada periodicamente. A versão mais recente estará
              sempre disponível nesta página. Recomendamos a revisão periódica.
            </p>
            <p className="text-slate-500 dark:text-slate-500 text-sm mt-2">
              Última atualização: junho de 2026.
            </p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-800">
          <Link href="/" className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-medium transition-colors">
            ← Voltar ao início
          </Link>
        </div>
      </div>
    </div>
  )
}
