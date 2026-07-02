import Link from "next/link"
import { Shield, FileText, Lock, AlertTriangle, RefreshCw, Heart, CreditCard } from "lucide-react"

export default function TermosPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <div className="max-w-3xl mx-auto px-4 py-16 md:py-24">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-xl shadow-emerald-500/20 mb-6">
          <FileText className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-8">Termos de Uso</h1>

        <div className="prose prose-slate dark:prose-invert max-w-none space-y-8">
          <section>
            <h2 className="flex items-center gap-2 text-xl font-semibold text-slate-900 dark:text-white">
              <Shield className="h-5 w-5 text-emerald-500" /> 1. Aceitação dos Termos
            </h2>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Ao utilizar a plataforma PsiHumanis, você declara ter lido, compreendido e concordado
              com todos os termos e condições descritos neste documento. Caso não concorde com
              qualquer disposição, você não deve utilizar nossos serviços.
            </p>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed mt-3">
              Ao se registrar, agendar uma consulta ou utilizar qualquer funcionalidade da plataforma,
              você aceita expressamente estes Termos de Uso e nossa Política de Privacidade.
            </p>
          </section>

          <section>
            <h2 className="flex items-center gap-2 text-xl font-semibold text-slate-900 dark:text-white">
              <Heart className="h-5 w-5 text-emerald-500" /> 2. Natureza do Serviço — Aviso Importante
            </h2>
            <div className="p-4 bg-amber-50 dark:bg-amber-950/30 rounded-xl border border-amber-200 dark:border-amber-800">
              <p className="text-amber-800 dark:text-amber-200 leading-relaxed font-medium">
                O PsiHumanis é uma ferramenta de gestão e agendamento para profissionais
                de psicologia. A plataforma NÃO substitui, exclui ou dispensa a avaliação
                clínica presencial, o diagnóstico profissional ou o tratamento psicológico.
              </p>
            </div>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed mt-3">
              As funcionalidades de prontuário, diário emocional e questionários clínicos
              são instrumentos de apoio ao trabalho do psicólogo. O diagnóstico e tratamento
              são de responsabilidade exclusiva do profissional registrado no CRP.
            </p>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed mt-3">
              Em caso de emergência ou risco iminente, entre em contato imediatamente
              com o CVV (188), SAMU (192) ou o pronto-socorro mais próximo.
            </p>
          </section>

          <section>
            <h2 className="flex items-center gap-2 text-xl font-semibold text-slate-900 dark:text-white">
              <Lock className="h-5 w-5 text-emerald-500" /> 3. Privacidade e Dados
            </h2>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              A plataforma coleta e armazena dados pessoais (nome, telefone, email, CPF)
              estritamente necessários para a prestação dos serviços de agendamento e
              acompanhamento psicológico. Todos os dados são tratados em conformidade com a
              Lei Geral de Proteção de Dados (LGPD — Lei nº 13.709/2018).
            </p>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed mt-3">
              Os dados sensíveis compartilhados durante as consultas e registros no diário
              emocional são criptografados e acessíveis apenas ao paciente e ao psicólogo
              responsável.
            </p>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed mt-3">
              Para mais detalhes, consulte nossa{" "}
              <Link href="/privacidade" className="text-emerald-600 dark:text-emerald-400 hover:underline">
                Política de Privacidade
              </Link>.
            </p>
          </section>

          <section>
            <h2 className="flex items-center gap-2 text-xl font-semibold text-slate-900 dark:text-white">
              <AlertTriangle className="h-5 w-5 text-emerald-500" /> 4. Responsabilidades
            </h2>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              O PsiHumanis atua como plataforma de gestão e agendamento. A responsabilidade
              pelo conteúdo das consultas, prontuários e registros é integralmente do
              profissional psicólogo responsável, registrado no CRP sob o número 04/52274.
            </p>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed mt-3">
              A plataforma não se responsabiliza por falhas técnicas temporárias que possam
              afetar a realização de consultas online, comprometendo-se a manter a
              infraestrutura com os melhores padrões de disponibilidade e segurança.
            </p>
          </section>

          <section>
            <h2 className="flex items-center gap-2 text-xl font-semibold text-slate-900 dark:text-white">
              <FileText className="h-5 w-5 text-emerald-500" /> 5. Uso da Plataforma
            </h2>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              O paciente compromete-se a fornecer informações verdadeiras e atualizadas.
              O psicólogo compromete-se a utilizar a plataforma em conformidade com o
              Código de Ética Profissional do Psicólogo (Resolução CFP nº 010/2005).
            </p>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed mt-3">
              É proibido o uso da plataforma para fins ilícitos, disseminação de conteúdo
              ofensivo, ou qualquer atividade que viole direitos de terceiros.
            </p>
          </section>

          <section>
            <h2 className="flex items-center gap-2 text-xl font-semibold text-slate-900 dark:text-white">
              <CreditCard className="h-5 w-5 text-emerald-500" /> 6. Planos, Pagamentos e Cancelamento
            </h2>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Os planos e preços estão disponíveis em nossa página de{" "}
              <Link href="/pricing" className="text-emerald-600 dark:text-emerald-400 hover:underline">
                assinatura
              </Link>.
              O pagamento é processado de forma segura pela Stripe.
            </p>

            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mt-4">Direito de Arrependimento</h3>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Conforme o Art. 49 do Código de Defesa do Consumidor (CDC), você tem direito
              de cancelar a assinatura em até <strong>7 (sete) dias corridos</strong> a partir da data
              da contratação, sem necessidade de justificativa, com direito ao reembolso
              integral do valor pago.
            </p>

            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mt-4">Cancelamento após o período de arrependimento</h3>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Após o período de 7 dias, o cancelamento da assinatura pode ser feito a
              qualquer momento. O acesso permanece ativo até o final do período já pago.
              Não há reembolso proporcional por cancelamento antecipado após o período de
              arrependimento.
            </p>

            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mt-4">Política de Reembolso</h3>
            <ul className="list-disc list-inside text-slate-600 dark:text-slate-400 leading-relaxed mt-2 space-y-1">
              <li><strong>Até 7 dias após a contratação:</strong> reembolso integral (direito de arrependimento — CDC Art. 49)</li>
              <li><strong>Após 7 dias:</strong> não há reembolso, mas o acesso continua até o fim do período pago</li>
              <li><strong>Cobrança indevida:</strong> reembolso integral independente do prazo</li>
              <li><strong>Falha de serviço:</strong> reembolso proporcional ao período indisponível, se superior a 24h consecutivas</li>
            </ul>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed mt-3">
              Para solicitar reembolso ou cancelamento, entre em contato pelo email{" "}
              <a href="mailto:contato@psihumanis.com.br" className="text-emerald-600 dark:text-emerald-400 hover:underline">
                contato@psihumanis.com.br
              </a>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">7. Disposições Gerais</h2>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Estes termos podem ser atualizados a qualquer momento. O usuário será notificado
              sobre alterações substanciais. O foro eleito é o da Comarca de Belo Horizonte, MG.
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
