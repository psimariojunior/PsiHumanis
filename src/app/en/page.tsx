"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { WhatsAppWidget } from "@/components/whatsapp-widget"
import {
  ArrowRight, CheckCircle, Sparkles, Shield, Zap, Heart, Brain,
  Users, Globe, Languages,
  Menu, X, Calendar, MessageCircle, ChevronDown
} from "lucide-react"

const t = {
  nav: { home: "Home", services: "Services", about: "About", booking: "Booking", faq: "FAQ" },
  hero: {
    badge: "Online and in-person psychological care",
    title1: "Take care of your mind",
    title2: "transform your life",
    subtitle: "Psychotherapy with a humanized approach. Individual, couples and online care with a qualified professional.",
    cta: "Book an Appointment",
    patient: "Patient Portal",
    trust1: "Confidentiality Guaranteed",
    trust2: "Online or In-Person",
    trust3: "Active CRP",
  },
  how: {
    badge: "How It Works",
    title: "Your journey in",
    titleAccent: "3 steps",
    subtitle: "Simple, fast and secure. Start today.",
    steps: [
      { icon: Calendar, title: "Book", desc: "Choose the best day and time in the online schedule. No bureaucracy." },
      { icon: Globe, title: "Connect", desc: "At the scheduled time, enter the secure virtual room with one click." },
      { icon: Heart, title: "Transform", desc: "Attend the session with privacy and take the next step in your well-being." },
    ],
  },
  services: {
    badge: "Services",
    title: "Specialized",
    titleAccent: "care",
    subtitle: "Various modalities to take care of you.",
    items: [
      { title: "Individual Therapy", desc: "Individual psychological care for adults and adolescents with a personalized approach." },
      { title: "Couples Therapy", desc: "Mediation for couples seeking to improve communication and strengthen their bond." },
      { title: "Online Therapy", desc: "Video call consultations with security and privacy. Attend from anywhere." },
      { title: "Anxiety Management", desc: "Evidence-based techniques for dealing with anxiety, stress and burnout." },
      { title: "Psychological Support", desc: "Support for moments of transition, grief and personal development." },
      { title: "Clinical Supervision", desc: "Supervision for professionals with case discussion and technical guidance." },
    ],
  },
  about: {
    badge: "About",
    title: "Meet the professional",
    p1: "I am Mário Júnior, clinical psychologist (CRP 04/52274), graduated in Psychology with a postgraduate degree in Neuropsychology. My approach is Gestalt Therapy, centered on the person and the relationship, focusing on the here and now.",
    p2: "I believe in a humanized and welcoming service, where each person finds a safe space to get to know themselves better, overcome challenges and develop their full potential.",
    items: ["Individual Therapy", "Couples Therapy", "Online", "In-Person"],
    cta: "Book an Appointment",
  },
  faq: {
    badge: "FAQ",
    title: "Frequently asked",
    titleAccent: "questions",
    subtitle: "Get answers about the therapeutic process.",
    items: [
      { q: "How does online therapy work?", a: "You schedule a time, receive a secure link by email, and at the scheduled time just click to enter the virtual room. Everything is encrypted." },
      { q: "How long is each session?", a: "Sessions last 30 minutes. Frequency is arranged between psychologist and patient." },
      { q: "Is confidentiality guaranteed?", a: "Yes. All sessions follow the CRP code of ethics. Encrypted video calls and secure records." },
      { q: "Do I need a medical referral?", a: "No. Book directly without the need for a referral." },
      { q: "What payment methods are accepted?", a: "We accept PIX, credit card, bank slip and bank transfer." },
      { q: "Can I cancel or reschedule?", a: "Yes, up to 24 hours in advance through the patient portal." },
    ],
  },
  cta: {
    title: "Ready to start your journey?",
    subtitle: "Take the first step toward your emotional well-being.",
    cta1: "Book an Appointment",
    cta2: "Create Account",
  },
  footer: {
    desc: "Complete management system for psychologists. Schedule appointments, issue medical records, manage finances and conduct online consultations securely.",
    links: "Links",
    access: "Access",
    home: "Home",
    book: "Book Appointment",
    terms: "Terms of Use",
    privacy: "Privacy Policy",
    psychologist: "Psychologist Area",
    patientAccess: "Patient Portal",
    register: "Register",
    copyright: "All rights reserved.",
    crp: "CRP 04/52274 • Responsible Psychologist",
  },
  langSwitch: "PT",
}

const services = [
  { icon: Heart, title: t.services.items[0].title, desc: t.services.items[0].desc, color: "from-rose-500 to-pink-600", bgLight: "bg-rose-50 dark:bg-rose-950/30", textLight: "text-rose-600 dark:text-rose-400" },
  { icon: Users, title: t.services.items[1].title, desc: t.services.items[1].desc, color: "from-violet-500 to-purple-600", bgLight: "bg-violet-50 dark:bg-violet-950/30", textLight: "text-violet-600 dark:text-violet-400" },
  { icon: Brain, title: t.services.items[2].title, desc: t.services.items[2].desc, color: "from-teal-500 to-cyan-600", bgLight: "bg-teal-50 dark:bg-teal-950/30", textLight: "text-teal-600 dark:text-teal-400" },
  { icon: Shield, title: t.services.items[3].title, desc: t.services.items[3].desc, color: "from-teal-500 to-teal-700", bgLight: "bg-teal-50 dark:bg-teal-950/30", textLight: "text-teal-600 dark:text-teal-400" },
  { icon: Heart, title: t.services.items[4].title, desc: t.services.items[4].desc, color: "from-orange-500 to-amber-600", bgLight: "bg-orange-50 dark:bg-orange-950/30", textLight: "text-orange-600 dark:text-orange-400" },
  { icon: Globe, title: t.services.items[5].title, desc: t.services.items[5].desc, color: "from-indigo-500 to-teal-600", bgLight: "bg-indigo-50 dark:bg-indigo-950/30", textLight: "text-indigo-600 dark:text-indigo-400" },
]

const faqItems = t.faq.items
const steps = t.how.steps
const navLinks = [
  { label: t.nav.home, href: "/en" },
  { label: t.nav.services, href: "/en/#servicos" },
  { label: t.nav.about, href: "/en/#sobre" },
  { label: t.nav.booking, href: "/en/agendar" },
  { label: t.nav.faq, href: "/en/#faq" },
]

export default function LandingPageEN() {
  const [activeFaq, setActiveFaq] = useState<number | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  useEffect(() => { setMenuOpen(false) }, [pathname])

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.includes("#")) {
      e.preventDefault()
      const id = href.split("#")[1]
      const el = document.getElementById(id)
      if (el) el.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <header className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
        scrolled
          ? "bg-white/80 dark:bg-slate-950/80 backdrop-blur-2xl border-b border-slate-200/50 dark:border-slate-800/50 shadow-lg shadow-slate-900/5"
          : "bg-transparent"
      )}>
        <div className={cn(
          "absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-teal-500 via-sky-500 to-teal-500 opacity-0 transition-opacity duration-500",
          scrolled && "opacity-100"
        )} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            <Link href="/en" className="flex items-center gap-3 group">
              <div className="flex items-center justify-center w-16 h-16 rounded-2xl overflow-hidden bg-gradient-to-br from-teal-500 to-teal-700 shadow-xl shadow-teal-500/20 group-hover:shadow-teal-500/30 transition-all duration-300 group-hover:scale-105">
                <Image src="/logo.png" alt="PsiHumanis" width={64} height={64} className="w-full h-full object-cover" priority />
              </div>
              <div className={cn(
                "flex flex-col transition-all duration-500",
                scrolled ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2 hidden md:flex"
              )}>
                <span className="text-lg font-bold bg-gradient-to-r from-teal-600 to-teal-700 dark:from-teal-400 dark:to-sky-400 bg-clip-text text-transparent">
                  PsiHumanis
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-500 leading-none">CRP 04/52274</span>
              </div>
            </Link>
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map(link => (
                <Link key={link.href} href={link.href} onClick={e => handleNavClick(e, link.href)}
                  className={cn("px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200",
                    pathname === link.href
                      ? "text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/50"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/50"
                  )}>
                  {link.label}
                </Link>
              ))}
              <Link href="/" className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-400 hover:text-teal-400 transition-colors ml-2 border-l border-slate-200 dark:border-slate-700 pl-4">
                <Languages className="h-3.5 w-3.5" />
                {t.langSwitch}
              </Link>
            </nav>
            <div className="hidden md:flex items-center gap-2">
              <a href="https://wa.me/5531992863861" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-9 h-9 rounded-xl text-slate-400 hover:text-teal-400 hover:bg-teal-50 dark:hover:bg-slate-800 transition-all duration-200" aria-label="WhatsApp">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              </a>
              <a href="https://instagram.com/psi_marioalmeida" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-9 h-9 rounded-xl text-slate-400 hover:text-pink-400 hover:bg-pink-50 dark:hover:bg-slate-800 transition-all duration-200" aria-label="Instagram">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44 0 .796.645 1.44 1.441 1.44s1.44-.645 1.44-1.44c0-.796-.645-1.44-1.44-1.44z"/></svg>
              </a>
              <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1" />
              <Link href="/login"><Button variant="ghost" size="sm" className="text-slate-600 dark:text-slate-400">Psychologist</Button></Link>
              <Link href="/paciente/login">
                <Button size="sm" className="bg-gradient-to-r from-teal-500 to-teal-700 hover:from-teal-600 hover:to-teal-800 text-white shadow-lg shadow-teal-500/25">
                  <Sparkles className="h-4 w-4 mr-1.5" />
                  Patient Portal
                </Button>
              </Link>
            </div>
            <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" aria-label="Open menu">
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
        {menuOpen && (
          <div className="md:hidden border-t border-slate-200/50 dark:border-slate-800/50 bg-white dark:bg-slate-950">
            <div className="px-4 py-4 space-y-1">
              {navLinks.map(link => (
                <Link key={link.href} href={link.href} onClick={e => handleNavClick(e, link.href)}
                  className="block px-4 py-2.5 text-sm font-medium rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/50">
                  {link.label}
                </Link>
              ))}
              <Link href="/" className="block px-4 py-2.5 text-sm font-medium rounded-lg text-teal-600 dark:text-teal-400 hover:bg-slate-100 dark:hover:bg-slate-800/50">
                <Languages className="h-3.5 w-3.5 inline mr-1.5" />{t.langSwitch}
              </Link>
              <hr className="my-3 border-slate-200 dark:border-slate-800" />
              <div className="flex items-center gap-2 px-2 mb-3">
                <a href="https://wa.me/5531992863861" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-9 h-9 rounded-lg text-slate-400 hover:text-teal-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all" aria-label="WhatsApp">
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                </a>
                <a href="https://instagram.com/psi_marioalmeida" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-9 h-9 rounded-lg text-slate-400 hover:text-pink-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all" aria-label="Instagram">
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44 0 .796.645 1.44 1.441 1.44s1.44-.645 1.44-1.44c0-.796-.645-1.44-1.44-1.44z"/></svg>
                </a>
              </div>
              <Link href="/login" className="block px-4 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-400">Psychologist</Link>
              <Link href="/paciente/login" className="block px-4 py-2.5 text-sm font-medium text-teal-600 dark:text-teal-400">Patient Portal</Link>
            </div>
          </div>
        )}
      </header>

      {/* Hero */}
      <section className="relative min-h-[90vh] flex items-center pt-20">
        <div className="absolute inset-0 bg-gradient-to-b from-teal-50/80 via-white to-white dark:from-slate-950 dark:via-slate-950 dark:to-slate-950" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-teal-200/30 via-transparent to-transparent dark:from-teal-900/10" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-teal-200/20 via-transparent to-transparent dark:from-teal-900/10" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="space-y-8"
            >
              <motion.div
                animate={{ opacity: [1, 0.7, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 text-sm font-medium"
              >
                <Sparkles className="h-4 w-4" />
                {t.hero.badge}
              </motion.div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight tracking-tight">
                <span className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 dark:from-white dark:via-slate-200 dark:to-slate-400 bg-clip-text text-transparent">{t.hero.title1}</span>
                <br />
                <span className="bg-gradient-to-r from-teal-500 to-teal-700 bg-clip-text text-transparent">{t.hero.title2}</span>
              </h1>
              <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 leading-relaxed max-w-lg">{t.hero.subtitle}</p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link href="/agendar">
                  <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-teal-500 to-teal-700 hover:from-teal-600 hover:to-teal-800 text-white shadow-lg shadow-teal-500/25 text-base h-12 px-8">
                    {t.hero.cta} <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/paciente/login">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto text-base h-12 px-8 border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800">
                    {t.hero.patient}
                  </Button>
                </Link>
              </div>
              <div className="flex items-center gap-6 text-sm text-slate-500 dark:text-slate-500">
                <div className="flex items-center gap-2"><Shield className="h-4 w-4 text-teal-500" /><span>{t.hero.trust1}</span></div>
                <div className="flex items-center gap-2"><Zap className="h-4 w-4 text-teal-500" /><span>{t.hero.trust2}</span></div>
                <div className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-teal-500" /><span>{t.hero.trust3}</span></div>
              </div>
            </motion.div>
            <div className="relative hidden lg:block">
              <div className="relative w-full aspect-[4/5] rounded-3xl bg-gradient-to-br from-teal-100 via-sky-50 to-teal-50 dark:from-teal-950/30 dark:via-sky-950/20 dark:to-teal-950/30 overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center p-8">
                  <div className="text-center">
                    <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-teal-400 to-sky-500 flex items-center justify-center mb-6 shadow-2xl shadow-teal-500/30">
                      <Heart className="h-10 w-10 text-white" />
                    </div>
                    <div className="w-28 h-28 mx-auto rounded-full overflow-hidden border-4 border-white dark:border-slate-800 shadow-2xl shadow-teal-500/30 mb-6">
                      <Image src="/profile.jpg" alt="Mário Júnior" width={112} height={112} className="w-full h-full object-cover" priority />
                    </div>
                    <p className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Mário Júnior</p>
                    <p className="text-teal-600 dark:text-teal-400 font-medium mb-2">Clinical Psychologist</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">CRP 04/52274</p>
                    <div className="flex justify-center gap-2 flex-wrap">
                      {["Gestalt Therapy", "Neuropsychology", "Online"].map(tag => (
                        <span key={tag} className="px-3 py-1 rounded-full bg-white/60 dark:bg-slate-800/60 text-xs text-slate-600 dark:text-slate-400">{tag}</span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-teal-200/30 dark:bg-teal-800/20 blur-3xl" />
                <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-teal-200/30 dark:bg-teal-800/20 blur-3xl" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 md:py-28 bg-slate-50/50 dark:bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <Badge variant="outline" className="mb-4 px-4 py-1.5 text-sm border-teal-200 dark:border-teal-800 text-teal-600 dark:text-teal-400">{t.how.badge}</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">{t.how.title} <span className="text-teal-500">{t.how.titleAccent}</span></h2>
            <p className="text-lg text-slate-600 dark:text-slate-400">{t.how.subtitle}</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, i) => (
              <div key={step.title} className="relative group">
                <div className="text-center p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-teal-200 dark:hover:border-teal-800 transition-all duration-300">
                  <div className="relative inline-flex mb-6">
                    <div className="absolute inset-0 bg-teal-500/10 dark:bg-teal-500/20 rounded-full blur-xl" />
                    <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center shadow-lg shadow-teal-500/20">
                      <step.icon className="h-7 w-7 text-white" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-teal-500 text-white text-xs font-bold flex items-center justify-center shadow-md">{i + 1}</div>
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">{step.title}</h3>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{step.desc}</p>
                </div>
                {i < steps.length - 1 && <div className="hidden md:block absolute top-1/2 -right-4 text-slate-300 dark:text-slate-700"><ArrowRight className="h-6 w-6" /></div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section id="servicos" className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <Badge variant="outline" className="mb-4 px-4 py-1.5 text-sm border-violet-200 dark:border-violet-800 text-violet-600 dark:text-violet-400">{t.services.badge}</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">{t.services.title} <span className="text-violet-500">{t.services.titleAccent}</span></h2>
            <p className="text-lg text-slate-600 dark:text-slate-400">{t.services.subtitle}</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, index) => (
              <div key={service.title}>
                <Card className="group p-6 border border-slate-200 dark:border-slate-800 hover:border-transparent hover:shadow-lg transition-all duration-300 bg-white dark:bg-slate-900 overflow-hidden">
                  <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center mb-5 transition-transform group-hover:scale-110 duration-300", service.bgLight, service.textLight)}>
                    <service.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">{service.title}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{service.desc}</p>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About */}
      <section id="sobre" className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="relative">
              <div className="relative w-full aspect-[3/4] rounded-3xl bg-gradient-to-br from-teal-100 via-sky-50 to-teal-50 dark:from-teal-950/30 dark:via-sky-950/20 dark:to-teal-950/30 overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center p-8">
                  <div className="text-center">
                    <div className="w-28 h-28 mx-auto rounded-full overflow-hidden border-4 border-white dark:border-slate-800 shadow-2xl shadow-teal-500/30 mb-6">
                      <Image src="/profile.jpg" alt="Mário Júnior" width={112} height={112} className="w-full h-full object-cover" loading="lazy" />
                    </div>
                    <p className="text-2xl font-bold text-slate-800 dark:text-white">Mário Júnior</p>
                    <p className="text-teal-600 dark:text-teal-400 font-medium">Clinical Psychologist</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">CRP 04/52274</p>
                    <Separator className="my-4 max-w-[120px] mx-auto" />
                    <div className="space-y-1.5 text-sm text-slate-600 dark:text-slate-400">
                      <p>Gestalt Therapy</p>
                      <p>Postgraduate in Neuropsychology</p>
                      <p>Person-Centered Approach</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-teal-500/10 dark:bg-teal-500/20 rounded-3xl blur-2xl" />
            </div>
            <div className="space-y-6">
              <Badge variant="outline" className="px-4 py-1.5 text-sm border-teal-200 dark:border-teal-800 text-teal-600 dark:text-teal-400">{t.about.badge}</Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">{t.about.title}</h2>
              <div className="space-y-4 text-slate-600 dark:text-slate-400 leading-relaxed">
                <p>{t.about.p1}</p>
                <p>{t.about.p2}</p>
              </div>
              <div className="flex flex-wrap gap-4 pt-2">
                {t.about.items.map(item => (
                  <div key={item} className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                    <CheckCircle className="h-4 w-4 text-teal-500" /> {item}
                  </div>
                ))}
              </div>
              <Link href="/agendar">
                <Button className="mt-4 bg-gradient-to-r from-teal-500 to-teal-700 hover:from-teal-600 hover:to-teal-800 text-white shadow-lg shadow-teal-500/25">
                  {t.about.cta} <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 md:py-28 bg-slate-50/50 dark:bg-slate-900/50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <Badge variant="outline" className="mb-4 px-4 py-1.5 text-sm border-sky-200 dark:border-sky-800 text-sky-600 dark:text-sky-400">{t.faq.badge}</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">{t.faq.title} <span className="text-sky-500">{t.faq.titleAccent}</span></h2>
            <p className="text-lg text-slate-600 dark:text-slate-400">{t.faq.subtitle}</p>
          </div>
          <div className="space-y-3">
            {faqItems.map((item, i) => (
              <div key={i} className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden transition-all duration-200">
                <button onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-left hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <span className="font-medium text-slate-900 dark:text-white pr-4">{item.q}</span>
                  <ChevronDown className={cn("h-5 w-5 text-slate-400 flex-shrink-0 transition-transform duration-200", activeFaq === i && "rotate-180")} />
                </button>
                <AnimatePresence initial={false}>
                  {activeFaq === i && (
                    <motion.div key="answer" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2, ease: "easeInOut" }}>
                      <p className="px-5 pb-5 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{item.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 md:py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-600 via-teal-700 to-teal-900" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-teal-400/20 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-sky-400/20 via-transparent to-transparent" />
        <div className="absolute top-10 left-10 w-64 h-64 rounded-full bg-teal-400/10 blur-3xl animate-float" />
        <div className="absolute bottom-10 right-10 w-48 h-48 rounded-full bg-sky-400/10 blur-3xl animate-float" style={{ animationDelay: "-3s" }} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-2xl mx-auto">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm mb-8">
              <Heart className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 leading-tight">{t.cta.title}</h2>
            <p className="text-lg md:text-xl text-teal-100/80 mb-10 max-w-lg mx-auto">{t.cta.subtitle}</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/agendar">
                <Button size="lg" className="w-full sm:w-auto bg-white text-teal-700 hover:bg-teal-50 shadow-xl shadow-black/10 text-base h-12 px-8 group">
                  <Calendar className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" /> {t.cta.cta1}
                </Button>
              </Link>
              <Link href="/paciente/cadastro">
                <Button size="lg" className="w-full sm:w-auto bg-teal-500 text-white hover:bg-teal-400 shadow-lg shadow-teal-500/30 text-base h-12 px-8 group">
                  <MessageCircle className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" /> {t.cta.cta2}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 dark:bg-slate-950 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center justify-center w-14 h-14 rounded-2xl overflow-hidden bg-gradient-to-br from-teal-500 to-teal-700 shadow-xl shadow-teal-500/20 ring-2 ring-teal-500/30">
                  <Image src="/logo.png" alt="PsiHumanis" width={56} height={56} className="w-full h-full object-cover" loading="lazy" />
                </div>
                <div>
                  <span className="text-xl font-bold text-white block">PsiHumanis</span>
                  <span className="text-xs text-teal-400/70">CRP 04/52274</span>
                </div>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed max-w-md">{t.footer.desc}</p>
              <div className="flex items-center gap-3 mt-4">
                <a href="https://wa.me/5531992863861" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-10 h-10 rounded-xl bg-slate-800 hover:bg-teal-600 text-slate-400 hover:text-white transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-teal-500/25" aria-label="WhatsApp">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                </a>
                <a href="https://instagram.com/psi_marioalmeida" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-10 h-10 rounded-xl bg-slate-800 hover:bg-gradient-to-br hover:from-pink-500 hover:via-purple-500 hover:to-yellow-500 text-slate-400 hover:text-white transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-pink-500/25" aria-label="Instagram">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44 0 .796.645 1.44 1.441 1.44s1.44-.645 1.44-1.44c0-.796-.645-1.44-1.44-1.44z"/></svg>
                </a>
                <Link href="/" className="flex items-center justify-center w-10 h-10 rounded-xl bg-slate-800 hover:bg-teal-600 text-slate-400 hover:text-white transition-all duration-300 hover:scale-110" aria-label="Portuguese">
                  <Languages className="h-5 w-5" />
                </Link>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white mb-4">{t.footer.links}</h4>
              <ul className="space-y-3">
                <li><Link href="/en" className="text-sm text-slate-400 hover:text-teal-400 transition-colors">{t.footer.home}</Link></li>
                <li><Link href="/agendar" className="text-sm text-slate-400 hover:text-teal-400 transition-colors">{t.footer.book}</Link></li>
                <li><Link href="/termos" className="text-sm text-slate-400 hover:text-teal-400 transition-colors">{t.footer.terms}</Link></li>
                <li><Link href="/privacidade" className="text-sm text-slate-400 hover:text-teal-400 transition-colors">{t.footer.privacy}</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white mb-4">{t.footer.access}</h4>
              <ul className="space-y-3">
                <li><Link href="/login" className="text-sm text-slate-400 hover:text-teal-400 transition-colors">{t.footer.psychologist}</Link></li>
                <li><Link href="/paciente/login" className="text-sm text-slate-400 hover:text-teal-400 transition-colors">{t.footer.patientAccess}</Link></li>
                <li><Link href="/paciente/cadastro" className="text-sm text-slate-400 hover:text-teal-400 transition-colors">{t.footer.register}</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-10 pt-8 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-slate-500">© {new Date().getFullYear()} PsiHumanis. {t.footer.copyright}</p>
            <p className="text-sm text-slate-500">{t.footer.crp}</p>
          </div>
        </div>
      </footer>

      <WhatsAppWidget />
    </div>
  )
}
