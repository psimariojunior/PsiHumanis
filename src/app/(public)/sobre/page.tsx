import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, Heart, Shield, Award, Mail, MessageSquare, Phone, MapPin } from "lucide-react"

export default function SobrePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-teal-50/30 dark:to-teal-950/10">
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-8">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar ao Início
        </Link>

        <div className="space-y-8">
          <div className="text-center space-y-4">
            <div className="w-32 h-32 rounded-full mx-auto overflow-hidden shadow-xl ring-4 ring-teal-500/20">
              <Image src="/profile.jpg" alt="Mário Júnior" width={128} height={128} className="w-full h-full object-cover" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Mário Júnior</h1>
            <p className="text-lg text-muted-foreground">Fundador do PsiHumanis</p>
            <p className="text-sm text-muted-foreground">CRP 04/52274 · Gestalt-Terapia</p>
          </div>

          <div className="prose prose-teal dark:prose-invert max-w-none space-y-6">
            <p>
              Psicólogo formado com experiência em atendimento individual e online.
              Percebeu que a maioria dos sistemas de gestão para psicólogos era complicada,
              cara ou não atendia às necessidades reais do profissional.
            </p>

            <h2>Por que criou o PsiHumanis?</h2>
            <p>
              &quot;Eu precisava de um sistema que me permitisse focar no que importa: meus pacientes.
              Sem complicação, sem custos escondidos, sem funções que eu nunca vou usar.
              Assim nasceu o PsiHumanis.&quot;
            </p>

            <h2>Valores</h2>
            <div className="grid md:grid-cols-3 gap-4 not-prose">
              <div className="text-center p-4 bg-teal-50 dark:bg-teal-950/30 rounded-xl">
                <Heart className="h-8 w-8 text-teal-600 mx-auto mb-2" />
                <h3 className="font-semibold">Simplicidade</h3>
                <p className="text-sm text-muted-foreground">Foco no essencial</p>
              </div>
              <div className="text-center p-4 bg-teal-50 dark:bg-teal-950/30 rounded-xl">
                <Shield className="h-8 w-8 text-teal-600 mx-auto mb-2" />
                <h3 className="font-semibold">Segurança</h3>
                <p className="text-sm text-muted-foreground">Dados protegidos</p>
              </div>
              <div className="text-center p-4 bg-teal-50 dark:bg-teal-950/30 rounded-xl">
                <Award className="h-8 w-8 text-teal-600 mx-auto mb-2" />
                <h3 className="font-semibold">Qualidade</h3>
                <p className="text-sm text-muted-foreground">Experiência profissional</p>
              </div>
            </div>

            <h2>Contato</h2>
            <p>Quer saber mais ou tem sugestões? Entre em contato:</p>
            <div className="flex flex-col gap-3 not-prose">
              <a href="mailto:contato@psihumanis.com.br" className="inline-flex items-center gap-2 text-primary hover:underline">
                <Mail className="h-4 w-4" />
                contato@psihumanis.com.br
              </a>
              <a href="https://wa.me/5531992863861" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-primary hover:underline">
                <MessageSquare className="h-4 w-4" />
                (31) 99286-3861
              </a>
              <span className="inline-flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                Belo Horizonte, MG
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
