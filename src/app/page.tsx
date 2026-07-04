"use client"

import { useState, useEffect, lazy, Suspense } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { setLocale, t, getLocale } from "@/lib/i18n"
import toast from "react-hot-toast"
import { BreadcrumbJsonLd, FaqJsonLd } from "@/lib/seo"
import {
  ArrowRight, CheckCircle, Shield, Heart, Brain,
  Users, Globe, Calendar, ChevronDown, Menu, X, Star,
  Phone, Mail, MapPin, Clock, Quote, Award,
  Sun, Moon, Languages, Video, Play, Sparkles,
  Stethoscope, FileText, Lock, BarChart3, CalendarCheck,
  Zap, Eye, MessageCircle, ArrowUpRight, CircleDot, Mic, Maximize2
} from "lucide-react"

const WhatsAppWidget = lazy(() => import("@/components/whatsapp-widget").then(m => ({ default: m.WhatsAppWidget })))
const VideoTour = lazy(() => import("@/components/video-tour").then(m => ({ default: m.VideoTour })))

const faqItems = [
  { q: "Como funciona a terapia online?", a: "Você agenda um horário, recebe um link seguro por email, e no horário marcado basta clicar para entrar na sala virtual. Tudo criptografado." },
  { q: "Qual a duração de cada sessão?", a: "O tempo da sessão é acordado com o profissional, com duração média de 30 minutos. A frequência também é definida em conjunto." },
  { q: "O sigilo é garantido?", a: "Sim. Todas as sessões seguem o código de ética do CRP. Videochamadas criptografadas e registros seguros." },
  { q: "Preciso de encaminhamento médico?", a: "Não. Agende diretamente sem necessidade de encaminhamento." },
  { q: "Quais formas de pagamento?", a: "Aceitamos PIX, cartão de crédito, boleto e transferência bancária." },
  { q: "Posso cancelar ou reagendar?", a: "Sim, com até 24h de antecedência pelo portal do paciente." },
]

const navLinks = [
  { label: "Início", href: "/", en: "Home" },
  { label: "Serviços", href: "/#servicos", en: "Services" },
  { label: "Sobre", href: "/sobre", en: "About" },
  { label: "Avaliações", href: "/avaliacoes", en: "Reviews" },
  { label: "Blog", href: "/blog", en: "Blog" },
  { label: "Planos", href: "/pricing", en: "Plans" },
  { label: "FAQ", href: "/#faq", en: "FAQ" },
]

const features = [
  { icon: CalendarCheck, title: "Agenda inteligente", desc: "Disponibilidade pública, confirmações automáticas e lembretes por WhatsApp e email.", accent: "bg-teal-500" },
  { icon: FileText, title: "Prontuário eletrônico", desc: "Registros clínicos, questionários, anamnese e documentos — tudo em um só lugar.", accent: "bg-violet-500" },
  { icon: Lock, title: "Segurança e LGPD", desc: "Dados isolados por profissional, criptografia ponta a ponta e conformidade total.", accent: "bg-emerald-500" },
  { icon: BarChart3, title: "Gestão financeira", desc: "Cobranças, faturas, Stripe, relatórios e indicadores de desempenho.", accent: "bg-amber-500" },
]

const services = [
  { icon: Heart, title: "Terapia Individual", desc: "Atendimento psicológico para adultos e adolescentes, com abordagem personalizada.", color: "text-rose-500" },
  { icon: Users, title: "Terapia de Casal", desc: "Mediação para casais que buscam melhorar a comunicação e fortalecer o vínculo.", color: "text-violet-500" },
  { icon: Video, title: "Terapia Online", desc: "Consultas por videochamada com segurança e privacidade. Atenda de onde estiver.", color: "text-teal-500" },
  { icon: Brain, title: "Gestão de Ansiedade", desc: "Técnicas baseadas em evidências para lidar com ansiedade, estresse e burnout.", color: "text-amber-500" },
  { icon: Clock, title: "Acompanhamento", desc: "Suporte para momentos de transição, luto e desenvolvimento pessoal.", color: "text-emerald-500" },
  { icon: Stethoscope, title: "Supervisão Clínica", desc: "Supervisão para profissionais com discussão de casos e orientação técnica.", color: "text-indigo-500" },
]

export default function LandingPage() {
  const [activeFaq, setActiveFaq] = useState<number | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [reviews, setReviews] = useState<{ id: string; patientName: string; rating: number; comment: string; createdAt: string }[]>([])
  const [reviewsAvg, setReviewsAvg] = useState(0)
  const [reviewsTotal, setReviewsTotal] = useState(0)
  const [videoOpen, setVideoOpen] = useState(false)
  const pathname = usePathname()
  const [darkMode, setDarkMode] = useState(() =>
    typeof document !== "undefined" ? document.documentElement.classList.contains("dark") : false
  )
  const locale = getLocale()

  const toggleTheme = () => {
    const html = document.documentElement
    const isDark = html.classList.contains("dark")
    html.classList.toggle("dark")
    localStorage.setItem("theme", isDark ? "light" : "dark")
    setDarkMode(!isDark)
  }

  const toggleLanguage = () => {
    const newLocale = locale === "pt" ? "en" : "pt"
    toast.success(newLocale === "en" ? "Language switched to English" : "Idioma alterado para Português", { duration: 2000 })
    setLocale(newLocale)
  }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  useEffect(() => { setMenuOpen(false) }, [pathname])

  useEffect(() => {
    fetch("/api/avaliacoes")
      .then((r) => r.json())
      .then((data) => {
        setReviews(data.reviews || [])
        setReviewsAvg(data.average || 0)
        setReviewsTotal(data.total || 0)
      })
      .catch(() => {})
  }, [])

  // Scroll reveal — adds .revealed to .reveal elements
  useEffect(() => {
    const els = document.querySelectorAll(".reveal")
    if (!els.length) return
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add("revealed"); obs.unobserve(e.target) } })
    }, { threshold: 0.1, rootMargin: "0px 0px -40px 0px" })
    els.forEach(el => obs.observe(el))
    return () => obs.disconnect()
  }, [])

  return (
    <div className="min-h-screen bg-[#FAFAF8] dark:bg-slate-950 overflow-x-hidden">
      <BreadcrumbJsonLd items={[
        { name: "Início", item: "/" },
        { name: "Serviços", item: "/#servicos" },
        { name: "FAQ", item: "/#faq" },
      ]} />
      <FaqJsonLd items={faqItems.map((item) => ({ q: item.q, a: item.a }))} />

      {/* ═══════════════════ HEADER ═══════════════════ */}
      <header className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
        scrolled
          ? "nav-scrolled border-b border-slate-200/50 dark:border-slate-800/50 shadow-sm"
          : "bg-transparent"
      )}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl overflow-hidden bg-gradient-to-br from-teal-600 to-teal-700 shadow-lg shadow-teal-500/20 transition-all duration-300 group-hover:scale-105">
                <Image src="/logo.png" alt="PsiHumanis" width={40} height={40} className="w-full h-full object-cover" priority />
              </div>
              <div className={cn("flex-col transition-all duration-500", scrolled ? "opacity-100 translate-x-0 flex" : "opacity-0 -translate-x-2 hidden md:flex")}>
                <span className="text-lg font-bold text-teal-700 dark:text-teal-400">PsiHumanis</span>
                <span className="text-[10px] text-slate-400 leading-none">CRP 04/52274</span>
              </div>
            </Link>
            <nav className="hidden lg:flex items-center gap-1">
              {navLinks.map(link => (
                <Link key={link.href} href={link.href} onClick={e => {
                  if (link.href.startsWith("/#")) { e.preventDefault(); const id = link.href.slice(2); document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }) }
                }} className="px-3 py-2 text-[13px] font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-all">{locale === "en" ? link.en : link.label}</Link>
              ))}
              <div className="w-px h-5 bg-slate-200 dark:bg-slate-700 mx-2" />
              <button onClick={toggleLanguage} className="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all" aria-label="Toggle language">
                <Languages className="h-4 w-4" />
              </button>
              <button onClick={toggleTheme} className="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all" aria-label="Toggle theme">
                {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>
              <Link href="/login" className="px-3 py-2 text-[13px] font-bold text-teal-700 dark:text-teal-300 hover:bg-teal-50 dark:hover:bg-teal-900/30 rounded-lg transition-all border border-teal-200 dark:border-teal-700">Psicólogo</Link>
              <Link href="/paciente/login" className="px-3 py-2 text-[13px] font-bold text-teal-700 dark:text-teal-300 hover:bg-teal-50 dark:hover:bg-teal-900/30 rounded-lg transition-all border border-teal-200 dark:border-teal-700">Paciente</Link>
              <Link href="/agendar"><Button size="sm" className="bg-teal-600 hover:bg-teal-700 text-white shadow-lg shadow-teal-500/20 text-[13px] h-9 px-5">{t("nav.book", locale)}</Button></Link>
            </nav>
            <button onClick={() => setMenuOpen(!menuOpen)} className="lg:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" aria-label="Menu">
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
        <AnimatePresence>
          {menuOpen && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="lg:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 overflow-hidden">
              <div className="px-4 py-4 space-y-1">
                {navLinks.map(link => (
                  <Link key={link.href} href={link.href} onClick={() => setMenuOpen(false)} className="block px-4 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">{locale === "en" ? link.en : link.label}</Link>
                ))}
                <div className="h-px bg-slate-100 dark:bg-slate-800 my-2" />
                <div className="flex items-center gap-2 px-4 py-2">
                  <button onClick={toggleLanguage} className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"><Languages className="h-3.5 w-3.5" /> {locale === "pt" ? "EN" : "PT"}</button>
                  <button onClick={toggleTheme} className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">{darkMode ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />} {darkMode ? "Claro" : "Escuro"}</button>
                </div>
                <Link href="/login" className="block px-4 py-2.5 text-sm font-bold text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-700 rounded-lg hover:bg-teal-50 dark:hover:bg-teal-900/30 transition-colors">Área do Psicólogo</Link>
                <Link href="/paciente/login" className="block px-4 py-2.5 text-sm font-bold text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-700 rounded-lg hover:bg-teal-50 dark:hover:bg-teal-900/30 transition-colors">Área do Paciente</Link>
                <Link href="/agendar" className="block mt-2"><Button className="w-full bg-teal-600 hover:bg-teal-700 text-white">Agende sua Consulta</Button></Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* ═══════════════════ HERO — Editorial, large type, organic ═══════════════════ */}
      <section className="relative min-h-screen flex items-center pt-20 pb-12 overflow-hidden hero-parallax grain-overlay">
        {/* Organic background blobs */}
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-teal-200/30 dark:bg-teal-900/20 blur-[120px] organic-shape" />
        <div className="absolute bottom-[10%] left-[-8%] w-[400px] h-[400px] rounded-full bg-amber-100/40 dark:bg-amber-900/10 blur-[100px] animate-float-delayed" />
        <div className="absolute top-[30%] left-[40%] w-[300px] h-[300px] rounded-full bg-violet-100/20 dark:bg-violet-900/10 blur-[80px] animate-float" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="max-w-3xl">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}>
              <Badge variant="outline" className="mb-6 px-4 py-1.5 text-xs font-medium border-teal-200 dark:border-teal-800 text-teal-700 dark:text-teal-400 bg-teal-50/50 dark:bg-teal-950/30 rounded-full">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-teal-500 mr-2 animate-pulse" />
                {t("hero.badge", locale)}
              </Badge>
            </motion.div>

            <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2 }} className="hero-title mb-8">
              <span className="text-slate-900 dark:text-white">{t("hero.title1", locale)}</span>
              <br />
              <span className="animated-gradient-text">{t("hero.title2", locale)}</span>
            </motion.h1>

            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.35 }} className="text-lg md:text-xl text-slate-500 dark:text-slate-400 leading-relaxed max-w-xl mb-10">
              {t("hero.subtitle", locale)}
            </motion.p>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.45 }} className="flex flex-col sm:flex-row gap-4 mb-12">
              <Link href="/agendar">
                <Button size="lg" className="btn-premium btn-press bg-teal-600 hover:bg-teal-700 text-white shadow-xl shadow-teal-500/20 text-base h-13 px-8 rounded-full font-medium group">
                  {t("hero.book", locale)} <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-0.5 transition-transform relative z-10" />
                </Button>
              </Link>
              <Link href="/register">
                <Button size="lg" variant="outline" className="h-13 px-8 rounded-full border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium group relative overflow-hidden">
                  <span className="relative z-10">{t("saas.login", locale)}</span> <ArrowUpRight className="ml-2 h-4 w-4 opacity-50 group-hover:opacity-100 transition-opacity relative z-10" />
                </Button>
              </Link>
            </motion.div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.6 }} className="flex flex-wrap items-center gap-x-8 gap-y-3 text-sm text-slate-500 dark:text-slate-500">
              <div className="flex items-center gap-2"><Shield className="h-4 w-4 text-teal-500" /><span>{t("hero.secure", locale)}</span></div>
              <div className="flex items-center gap-2"><Globe className="h-4 w-4 text-teal-500" /><span>{t("hero.online", locale)}</span></div>
              <div className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-teal-500" /><span>{t("hero.crp", locale)}</span></div>
            </motion.div>
          </div>

          {/* Right side — atmospheric illustration */}
          <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.9, delay: 0.4 }} className="hidden lg:block absolute right-8 top-1/2 -translate-y-1/2 w-[420px]">
            <div className="relative">
              {/* Organic card container */}
              <div className="relative rounded-[2rem] bg-white dark:bg-slate-900 p-8 shadow-2xl shadow-slate-900/10 dark:shadow-black/30 border border-slate-100 dark:border-slate-800">
                {/* Simulated video call */}
                <div className="rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 overflow-hidden aspect-[4/3] relative mb-6">
                  <div className="absolute inset-0 bg-gradient-to-br from-teal-950/40 via-transparent to-violet-950/20" />
                  <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/40 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-xs">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="font-medium">Dr. Mario Jr.</span>
                    <span className="text-white/40">30:00</span>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center mx-auto shadow-lg shadow-teal-500/30 ring-4 ring-teal-400/20">
                        <span className="text-xl font-bold text-white">MJ</span>
                      </div>
                      <p className="text-white/70 text-xs font-medium mt-3">Consulta online</p>
                    </div>
                  </div>
                  {/* PiP */}
                  <div className="absolute bottom-12 right-3 w-20 rounded-lg overflow-hidden border-2 border-white/20 shadow-xl aspect-video">
                    <div className="w-full h-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                      <span className="text-sm font-bold text-white">V</span>
                    </div>
                  </div>
                  {/* Controls */}
                  <div className="absolute bottom-0 left-0 right-0 pb-4 flex justify-center">
                    <div className="flex items-center gap-1.5 bg-black/50 backdrop-blur-xl rounded-full px-3 py-2 border border-white/10">
                      <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white"><Mic className="h-3.5 w-3.5" /></div>
                      <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white"><Video className="h-3.5 w-3.5" /></div>
                      <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center text-white"><Phone className="h-3.5 w-3.5 rotate-[135deg]" /></div>
                    </div>
                  </div>
                </div>

                {/* Stats row — dynamic from API */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: t("hero.stat.sessions", locale), value: reviewsTotal > 0 ? `${reviewsTotal}+` : "—", icon: CalendarCheck },
                    { label: t("hero.stat.patients", locale), value: "380+", icon: Users },
                    { label: t("hero.stat.rating", locale), value: reviewsAvg > 0 ? reviewsAvg.toFixed(1) : "—", icon: Star },
                  ].map((stat) => (
                    <div key={stat.label} className="text-center p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 stat-glow">
                      <stat.icon className="h-4 w-4 text-teal-500 mx-auto mb-1" />
                      <p className="text-lg font-bold text-slate-900 dark:text-white">{stat.value}</p>
                      <p className="text-[10px] text-slate-500 uppercase tracking-wider">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Floating notification */}
              <div className="absolute -top-3 -right-3 bg-white dark:bg-slate-800 rounded-xl p-3 shadow-xl border border-slate-100 dark:border-slate-700 animate-float">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                    <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-900 dark:text-white">Sessão concluída</p>
                    <p className="text-[10px] text-slate-500">Bem-estar garantido</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 scroll-indicator">
          <div className="w-6 h-10 rounded-full border-2 border-slate-300 dark:border-slate-600 flex items-start justify-center pt-2">
            <div className="w-1 h-2 rounded-full bg-slate-400 dark:bg-slate-500" />
          </div>
        </div>
      </section>

      {/* ═══════════════════ VIDEO DEMO ═══════════════════ */}
      <section className="py-16 md:py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-3">{locale === "en" ? "See the platform in action" : "Conheça a plataforma em ação"}</h2>
            <p className="text-slate-500 dark:text-slate-400 max-w-lg mx-auto">{locale === "en" ? "Schedule appointments, manage records and conduct online sessions — all in one place." : "Agende consultas, gerencie prontuários e realize atendimentos online — tudo em um só lugar."}</p>
          </div>
          {videoOpen ? (
            <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-slate-900/10 dark:shadow-black/30 border border-slate-200 dark:border-slate-800">
              <button onClick={() => setVideoOpen(false)} className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm flex items-center justify-center text-white transition-colors" aria-label="Fechar"><X className="h-5 w-5" /></button>
              <Suspense fallback={<div className="aspect-video bg-slate-900 flex items-center justify-center text-white">Carregando...</div>}>
                <VideoTour />
              </Suspense>
            </div>
          ) : (
            <button onClick={() => setVideoOpen(true)} className="relative w-full rounded-2xl overflow-hidden shadow-2xl shadow-slate-900/10 dark:shadow-black/30 border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 aspect-video flex items-center justify-center group cursor-pointer hover:shadow-slate-900/20 transition-all duration-500 hover:scale-[1.01]" aria-label="Assistir demonstração">
              <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 to-violet-500/5" />
              <div className="absolute inset-0 bg-gradient-to-br from-teal-500/0 via-transparent to-violet-500/0 group-hover:from-teal-500/10 group-hover:to-violet-500/10 transition-all duration-700" />
              <div className="relative z-10 text-center">
                <div className="w-20 h-20 rounded-full bg-teal-600 flex items-center justify-center mx-auto mb-5 shadow-xl shadow-teal-500/30 group-hover:scale-110 group-hover:bg-teal-700 group-hover:shadow-teal-500/50 transition-all duration-300">
                  <Play className="w-8 h-8 text-white ml-1" fill="currentColor" />
                </div>
                <p className="text-base font-semibold text-slate-800 dark:text-slate-200">{locale === "en" ? "Watch the demo" : "Assista à demonstração"}</p>
                <p className="text-sm text-slate-500 dark:text-slate-500 mt-1">{locale === "en" ? "2 minutes • See the main features" : "2 minutos • Veja as funcionalidades principais"}</p>
              </div>
            </button>
          )}
        </div>
      </section>

      {/* ═══════════════════ TRUST BAR ═══════════════════ */}
      <section className="border-y border-slate-200/60 dark:border-slate-800/60 bg-white/50 dark:bg-slate-950/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-wrap justify-center gap-x-10 gap-y-4">
            {[
              { icon: Lock, text: locale === "en" ? "Encrypted data" : "Dados criptografados" },
              { icon: Shield, text: locale === "en" ? "Active CRP" : "CRP ativo" },
              { icon: Globe, text: locale === "en" ? "Online or in-person" : "Online ou presencial" },
              { icon: Clock, text: locale === "en" ? "Commercial support" : "Suporte comercial" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2.5 group">
                <div className="w-7 h-7 rounded-lg bg-teal-50 dark:bg-teal-950/30 flex items-center justify-center group-hover:bg-teal-100 dark:group-hover:bg-teal-900/50 transition-colors">
                  <item.icon className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
                </div>
                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ HOW IT WORKS — Editorial numbered list ═══════════════════ */}
      <section id="como-funciona" className="py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-[1fr_1.2fr] gap-16 lg:gap-24 items-start">
            {/* Left: Sticky header */}
            <div className="lg:sticky lg:top-32">
              <Badge variant="outline" className="mb-4 px-4 py-1.5 text-xs font-medium border-teal-200 dark:border-teal-800 text-teal-700 dark:text-teal-400 rounded-full">{t("steps.badge", locale)}</Badge>
              <h2 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white leading-tight mb-6">{t("steps.title", locale)}</h2>
              <p className="text-lg text-slate-500 dark:text-slate-400 leading-relaxed max-w-md">{t("steps.subtitle", locale)}</p>
            </div>

            {/* Right: Steps with large numbers */}
            <div className="space-y-0">
              {[
                { num: "01", icon: Calendar, title: t("steps.1", locale), desc: t("steps.1desc", locale) },
                { num: "02", icon: Globe, title: t("steps.2", locale), desc: t("steps.2desc", locale) },
                { num: "03", icon: Heart, title: t("steps.3", locale), desc: t("steps.3desc", locale) },
              ].map((step, i) => (
                <div key={step.num} className="relative group">
                  <div className={cn("flex gap-8 py-10 border-b border-slate-200 dark:border-slate-800 transition-all duration-300 hover:bg-slate-50/50 dark:hover:bg-slate-900/30 hover:px-4 hover:-mx-4 rounded-xl", i === 0 && "border-t")}>
                    <div className="flex-shrink-0">
                      <span className="step-number">{step.num}</span>
                    </div>
                    <div className="pt-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/30 flex items-center justify-center group-hover:bg-teal-100 dark:group-hover:bg-teal-900/50 group-hover:scale-110 transition-all duration-300">
                          <step.icon className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-slate-900 dark:text-white">{step.title}</h3>
                      </div>
                      <p className="text-slate-500 dark:text-slate-400 leading-relaxed max-w-md">{step.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════ SaaS PLATFORM — Bento grid ═══════════════════ */}
      <section className="py-24 md:py-32 bg-slate-950 text-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-20 items-center">
            <div style={{ opacity: 1 }}>
              <Badge className="mb-4 bg-teal-500/15 text-teal-300 border border-teal-400/20 rounded-full">{t("saas.badge", locale)}</Badge>
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight leading-tight mb-6" style={{ color: "#fff" }}>{t("saas.title", locale)}</h2>
              <p className="text-lg mb-10" style={{ color: "#94a3b8", opacity: 1 }}>{t("saas.subtitle", locale)}</p>
              <div className="flex flex-col sm:flex-row gap-3 mb-8">
                <Link href="/pricing"><Button size="lg" className="bg-white text-slate-950 hover:bg-slate-100 rounded-full px-8 font-medium">{t("saas.cta", locale)} <ArrowRight className="ml-2 h-5 w-5" /></Button></Link>
                <Link href="/login" className="inline-flex items-center justify-center gap-2 h-11 px-8 rounded-full border border-white/30 text-white hover:bg-white/10 font-medium transition-colors" style={{ color: "#fff", borderColor: "rgba(255,255,255,0.3)" }}>{t("saas.login", locale)}</Link>
              </div>
              <div className="flex items-center gap-6 text-sm" style={{ color: "#94a3b8", opacity: 1 }}>
                <div className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-emerald-400" /><span>14 dias grátis</span></div>
                <div className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-emerald-400" /><span>Sem cartão</span></div>
                <div className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-emerald-400" /><span>Cancele quando quiser</span></div>
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-teal-500/10 to-violet-500/10 rounded-3xl blur-3xl" />
              <div className="relative grid sm:grid-cols-2 gap-4">
                {features.map((f, i) => (
                  <div key={f.title} className="group p-6 rounded-2xl bg-white/[0.05] border border-white/[0.08] backdrop-blur-sm card-lift hover:bg-white/[0.08] transition-all duration-300" style={{ opacity: 1 }}>
                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 relative z-10", f.accent)}>
                      <f.icon className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="font-semibold text-white mb-2 relative z-10" style={{ color: "#fff" }}>{f.title}</h3>
                    <p className="text-sm leading-relaxed relative z-10" style={{ color: "#94a3b8" }}>{f.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════ SERVICES — Asymmetric masonry ═══════════════════ */}
      <section id="servicos" className="py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-16">
            <Badge variant="outline" className="mb-4 px-4 py-1.5 text-xs font-medium border-teal-200 dark:border-teal-800 text-teal-700 dark:text-teal-400 rounded-full">{t("services.badge", locale)}</Badge>
            <h2 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white leading-tight mb-4">{t("services.title", locale)}</h2>
            <p className="text-lg text-slate-500 dark:text-slate-400">{t("services.subtitle", locale)}</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-px bg-slate-200/60 dark:bg-slate-800/60 rounded-2xl overflow-hidden shadow-lg shadow-slate-900/5 dark:shadow-black/20">
            {services.map((service, i) => (
              <div key={service.title} className={cn("group bg-white dark:bg-slate-950 p-8 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all duration-300 service-item card-lift hover:z-10 relative", service.color)}>
                <div className="w-12 h-12 rounded-xl bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                  <service.icon className={cn("h-6 w-6 transition-colors duration-300", service.color)} />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">{service.title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{service.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ ABOUT — Full-width editorial ═══════════════════ */}
      <section id="sobre" className="py-24 md:py-32 bg-slate-50 dark:bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-[1.1fr_1fr] gap-16 lg:gap-20 items-center">
            <div className="order-2 lg:order-1">
              <Badge variant="outline" className="mb-4 px-4 py-1.5 text-xs font-medium border-teal-200 dark:border-teal-800 text-teal-700 dark:text-teal-400 rounded-full">{t("about.badge", locale)}</Badge>
              <h2 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white leading-tight mb-6">{t("about.title", locale)}</h2>
              <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                <strong className="text-slate-900 dark:text-white">Mário Júnior</strong> — Psicólogo clínico (CRP 04/52274), especialista em Gestalt-Terapia.
              </p>
              <p className="text-slate-500 dark:text-slate-500 leading-relaxed mb-8">
                Criou o PsiHumanis para simplificar a gestão de consultórios e permitir que profissionais de saúde mental foquem no que realmente importa: seus pacientes.
              </p>
              <div className="flex flex-wrap gap-3 mb-8">
                {["Terapia Individual", "Terapia de Casal", "Online"].map((item) => (
                  <span key={item} className="px-4 py-1.5 text-xs font-medium bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300 rounded-full">{item}</span>
                ))}
              </div>
              <Link href="/sobre">
                <Button variant="outline" className="rounded-full border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 px-6 font-medium group">
                  {t("about.cta", locale)} <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                </Button>
              </Link>
            </div>

            <div className="order-1 lg:order-2">
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-br from-teal-200/30 to-violet-200/20 dark:from-teal-900/20 dark:to-violet-900/10 rounded-3xl blur-2xl" />
                <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-slate-900/10 dark:shadow-black/30 aspect-[4/5] bg-slate-200 dark:bg-slate-800">
                  <Image src="/profile.jpg" alt="Mário Júnior — Psicólogo" fill className="object-cover" loading="lazy" />
                </div>
                {/* Floating badge */}
                <div className="absolute -bottom-4 -left-4 bg-white dark:bg-slate-800 rounded-xl p-4 shadow-xl border border-slate-100 dark:border-slate-700">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center">
                      <Award className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900 dark:text-white">CRP 04/52274</p>
                      <p className="text-xs text-slate-500">Psicólogo Clínico</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════ REVIEWS — Horizontal scroll ═══════════════════ */}
      {reviewsTotal > 0 && (
        <section id="avaliacoes" className="py-24 md:py-32">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
              <div>
                <Badge variant="outline" className="mb-4 px-4 py-1.5 text-xs font-medium border-teal-200 dark:border-teal-800 text-teal-700 dark:text-teal-400 rounded-full">{t("reviews.badge", locale)}</Badge>
                <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">{t("reviews.title", locale)}</h2>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className={cn("h-5 w-5", i <= Math.round(reviewsAvg) ? "fill-amber-400 text-amber-400" : "fill-slate-200 text-slate-200 dark:fill-slate-700 dark:text-slate-700")} />
                  ))}
                </div>
                <span className="text-xl font-bold text-slate-900 dark:text-white">{reviewsAvg.toFixed(1)}</span>
                <span className="text-sm text-slate-500">· {reviewsTotal} avaliações</span>
              </div>
            </div>

            <div className="scroll-fade">
              <div className="flex gap-5 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide -mx-4 px-4">
                {reviews.slice(0, 6).map((r, i) => (
                  <div key={r.id} className="flex-shrink-0 w-[340px] snap-start">
                    <div className="h-full p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 hover:shadow-xl hover:shadow-slate-900/5 dark:hover:shadow-black/20 hover:-translate-y-1 transition-all duration-300">
                      <Quote className="h-6 w-6 text-teal-200 dark:text-teal-800 mb-4" />
                      <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm mb-6 line-clamp-4">&ldquo;{r.comment}&rdquo;</p>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white text-sm">{r.patientName}</p>
                          <div className="flex items-center gap-0.5 mt-1.5">
                            {[1, 2, 3, 4, 5].map((j) => (
                              <Star key={j} className={cn("h-3.5 w-3.5", j <= r.rating ? "fill-amber-400 text-amber-400" : "fill-slate-200 text-slate-200 dark:fill-slate-700 dark:text-slate-700")} />
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="text-center mt-10">
              <Link href="/avaliacoes">
                <Button variant="outline" className="rounded-full border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 px-6 font-medium group">
                  Ver todas as avaliações <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ═══════════════════ FAQ — Clean accordion ═══════════════════ */}
      <section id="faq" className="py-24 md:py-32 bg-slate-50 dark:bg-slate-900/30">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <Badge variant="outline" className="mb-4 px-4 py-1.5 text-xs font-medium border-teal-200 dark:border-teal-800 text-teal-700 dark:text-teal-400 rounded-full">{t("faq.badge", locale)}</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-3">{t("faq.title", locale)}</h2>
            <p className="text-lg text-slate-500 dark:text-slate-400">{t("faq.subtitle", locale)}</p>
          </div>
          <div className="space-y-3">
            {faqItems.map((item, i) => (
              <div key={i}>
                <button onClick={() => setActiveFaq(activeFaq === i ? null : i)} aria-expanded={activeFaq === i} className="w-full text-left p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 hover:border-teal-200 dark:hover:border-teal-800 hover:shadow-md hover:shadow-teal-500/5 transition-all duration-300 group">
                  <div className="flex items-center justify-between gap-4">
                    <span className="font-medium text-slate-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">{item.q}</span>
                    <div className={cn("w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all duration-300", activeFaq === i ? "bg-teal-100 dark:bg-teal-900/30" : "bg-slate-100 dark:bg-slate-800")}>
                      <ChevronDown className={cn("h-4 w-4 transition-all duration-300", activeFaq === i ? "rotate-180 text-teal-600 dark:text-teal-400" : "text-slate-400")} />
                    </div>
                  </div>
                  <div className={cn("overflow-hidden transition-all duration-300 ease-in-out", activeFaq === i ? "mt-4 max-h-40 opacity-100" : "max-h-0 opacity-0")}>
                    <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">{item.a}</p>
                  </div>
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ CTA — Organic gradient ═══════════════════ */}
      <section className="relative py-28 md:py-36 overflow-hidden">
        <div className="absolute inset-0 cta-gradient" />
        <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-white/5 blur-[100px] organic-shape" />
        <div className="absolute bottom-[-15%] left-[-5%] w-[400px] h-[400px] rounded-full bg-white/5 blur-[80px] animate-float-delayed" />
        <div className="absolute inset-0 bg-grid opacity-[0.06]" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="space-y-8">
            <h2 className="text-4xl md:text-6xl font-bold text-white leading-tight tracking-tight">{t("cta.title", locale)}</h2>
            <p className="text-lg md:text-xl text-teal-100/80 max-w-lg mx-auto">{t("cta.subtitle", locale)}</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/agendar"><Button size="lg" className="btn-premium btn-press bg-white text-teal-700 hover:bg-teal-50 shadow-xl shadow-white/10 text-base h-13 px-10 rounded-full font-semibold relative z-10 hover:shadow-2xl hover:shadow-white/20 transition-all duration-300">{locale === "en" ? "Schedule your appointment" : "Agende sua Consulta"} <ArrowRight className="ml-2 h-5 w-5 relative z-10" /></Button></Link>
              <Link href="/paciente/login"><Button size="lg" variant="outline" className="border-white/30 bg-white/10 text-white hover:bg-white/20 text-base h-13 px-10 rounded-full font-semibold backdrop-blur-sm transition-all duration-300">{locale === "en" ? "Patient Area" : "Área do Paciente"}</Button></Link>
            </div>
            <Link href="/register" className="inline-flex items-center gap-1.5 text-sm text-teal-200 hover:text-white transition-colors pt-2">
              <Sparkles className="h-3.5 w-3.5" /> {t("cta.psychologist", locale)}
            </Link>
            <div className="flex flex-wrap justify-center gap-6 pt-4 text-sm text-teal-200/60">
              <div className="flex items-center gap-2"><Shield className="h-4 w-4" /><span>100% Sigilo</span></div>
              <div className="flex items-center gap-2"><CheckCircle className="h-4 w-4" /><span>CRP Ativo</span></div>
              <div className="flex items-center gap-2"><Heart className="h-4 w-4" /><span>Atendimento Humanizado</span></div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════ COMPLIANCE BAR ═══════════════════ */}
      <div className="bg-slate-100 dark:bg-slate-900 border-y border-slate-200/60 dark:border-slate-800/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-wrap justify-center items-center gap-x-8 gap-y-2 text-xs text-slate-500 dark:text-slate-500">
            {[
              { icon: Shield, text: locale === "en" ? "Data protected" : "Dados protegidos", strong: "LGPD" },
              { icon: CheckCircle, text: locale === "en" ? "Registered professional" : "Profissional registrado", strong: "CRP" },
              { icon: Lock, text: locale === "en" ? "Connection" : "Conexão", strong: locale === "en" ? "encrypted" : "criptografada" },
              { icon: Globe, text: locale === "en" ? "Servers in" : "Servidores no", strong: locale === "en" ? "Brazil" : "Brasil" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-1.5 group">
                <item.icon className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform" />
                <span>{item.text} <strong className="font-semibold text-slate-700 dark:text-slate-300">{item.strong}</strong></span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ═══════════════════ FOOTER ═══════════════════ */}
      <footer className="bg-slate-900 dark:bg-slate-950 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12">
            <div className="space-y-4">
              <Link href="/" className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl overflow-hidden bg-gradient-to-br from-teal-600 to-teal-700 shadow-lg shadow-teal-500/20">
                  <Image src="/logo.png" alt="PsiHumanis" width={40} height={40} className="w-full h-full object-cover" />
                </div>
                <div>
                  <span className="text-lg font-bold text-white">PsiHumanis</span>
                  <p className="text-[10px] text-slate-400 leading-none">CRP 04/52274</p>
                </div>
              </Link>
              <p className="text-sm text-slate-400 leading-relaxed">Sistema completo de gestão para psicólogos. Agende consultas, emita prontuários, gerencie finanças e realize atendimentos online com segurança.</p>
              <div className="flex items-center gap-3 pt-2">
                <a href="https://wa.me/5531992863861" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all" aria-label="WhatsApp"><MessageCircle className="h-4 w-4" /></a>
                <a href="mailto:contato@psihumanis.com.br" className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all" aria-label="Email"><Mail className="h-4 w-4" /></a>
                <a href="tel:+5531992863861" className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all" aria-label="Telefone"><Phone className="h-4 w-4" /></a>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Plataforma</h4>
              <ul className="space-y-2.5">
                <li><Link href="/" className="text-sm text-slate-400 hover:text-white transition-colors">Início</Link></li>
                <li><Link href="/#servicos" className="text-sm text-slate-400 hover:text-white transition-colors">Serviços</Link></li>
                <li><Link href="/pricing" className="text-sm text-slate-400 hover:text-white transition-colors">Planos</Link></li>
                <li><Link href="/blog" className="text-sm text-slate-400 hover:text-white transition-colors">Blog</Link></li>
                <li><Link href="/sobre" className="text-sm text-slate-400 hover:text-white transition-colors">Sobre</Link></li>
                <li><Link href="/#faq" className="text-sm text-slate-400 hover:text-white transition-colors">FAQ</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Acesso</h4>
              <ul className="space-y-2.5">
                <li><Link href="/login" className="text-sm text-teal-300 hover:text-teal-200 font-medium transition-colors">Área do Psicólogo</Link></li>
                <li><Link href="/paciente/login" className="text-sm text-teal-300 hover:text-teal-200 font-medium transition-colors">Área do Paciente</Link></li>
                <li><Link href="/paciente/cadastro" className="text-sm text-slate-400 hover:text-white transition-colors">Cadastre-se</Link></li>
                <li><Link href="/agendar" className="text-sm text-slate-400 hover:text-white transition-colors">Agende Consulta</Link></li>
                <li><Link href="/avaliacoes" className="text-sm text-slate-400 hover:text-white transition-colors">Avaliações</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Contato</h4>
              <ul className="space-y-3">
                <li className="flex items-center gap-2.5 text-sm text-slate-400"><Mail className="h-4 w-4 text-teal-400 shrink-0" />contato@psihumanis.com.br</li>
                <li className="flex items-center gap-2.5 text-sm text-slate-400"><Phone className="h-4 w-4 text-teal-400 shrink-0" />(31) 99286-3861</li>
                <li className="flex items-center gap-2.5 text-sm text-slate-400"><MapPin className="h-4 w-4 text-teal-400 shrink-0" />Belo Horizonte, MG</li>
              </ul>
              <div className="mt-6 p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                <p className="text-xs text-slate-500 mb-1">Horário de suporte</p>
                <p className="text-sm text-white font-medium">Seg - Sex: 8h às 18h</p>
              </div>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-slate-500">© {new Date().getFullYear()} PsiHumanis. Todos os direitos reservados.</p>
            <div className="flex items-center gap-4">
              <Link href="/termos" className="text-xs text-slate-500 hover:text-slate-300 transition-colors">Termos de Uso</Link>
              <Link href="/privacidade" className="text-xs text-slate-500 hover:text-slate-300 transition-colors">Privacidade</Link>
              <span className="text-xs text-slate-600">CRP 04/52274</span>
            </div>
          </div>
        </div>
      </footer>
      <Suspense fallback={null}>
        <WhatsAppWidget />
      </Suspense>
    </div>
  )
}
