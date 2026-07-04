"use client"

import { useCallback } from "react"
import { useHapticFeedback } from "@/hooks/use-haptic-feedback"

interface PDFData {
  title: string
  patientName: string
  psychologistName: string
  crp: string
  sections: {
    heading: string
    content: string
  }[]
  date: string
}

export function usePDFExport() {
  const { vibrate } = useHapticFeedback()

  const generatePDF = useCallback(async (data: PDFData) => {
    vibrate("medium")

    const { default: jsPDF } = await import("jspdf")
    const doc = new jsPDF()

    const primaryColor: [number, number, number] = [13, 148, 136]
    const textColor: [number, number, number] = [30, 41, 59]
    const mutedColor: [number, number, number] = [100, 116, 139]

    doc.setFillColor(...primaryColor)
    doc.rect(0, 0, 210, 40, "F")

    doc.setTextColor(255, 255, 255)
    doc.setFontSize(22)
    doc.setFont("helvetica", "bold")
    doc.text("PsiHumanis", 20, 18)

    doc.setFontSize(10)
    doc.setFont("helvetica", "normal")
    doc.text(data.title, 20, 28)

    doc.setFontSize(8)
    doc.text(`CRP ${data.crp}`, 20, 35)

    let y = 55

    doc.setTextColor(...textColor)
    doc.setFontSize(12)
    doc.setFont("helvetica", "bold")
    doc.text(`Paciente: ${data.patientName}`, 20, y)
    y += 8

    doc.setFontSize(10)
    doc.setFont("helvetica", "normal")
    doc.setTextColor(...mutedColor)
    doc.text(`Psicólogo: ${data.psychologistName}`, 20, y)
    y += 6
    doc.text(`Data: ${data.date}`, 20, y)
    y += 12

    for (const section of data.sections) {
      if (y > 260) {
        doc.addPage()
        y = 20
      }

      doc.setTextColor(...primaryColor)
      doc.setFontSize(12)
      doc.setFont("helvetica", "bold")
      doc.text(section.heading, 20, y)
      y += 8

      doc.setTextColor(...textColor)
      doc.setFontSize(10)
      doc.setFont("helvetica", "normal")
      const lines = doc.splitTextToSize(section.content, 170)
      doc.text(lines, 20, y)
      y += lines.length * 5 + 8
    }

    doc.setFillColor(241, 245, 249)
    doc.rect(0, 270, 210, 27, "F")

    doc.setTextColor(...mutedColor)
    doc.setFontSize(7)
    doc.text("Gerado por PsiHumanis - psihumanis.com.br", 20, 280)
    doc.text(`Documento emitido em ${data.date} - Valido como registro clínico`, 20, 285)

    const filename = `${data.title.toLowerCase().replace(/\s+/g, "-")}-${data.patientName.toLowerCase().replace(/\s+/g, "-")}-${data.date.replace(/\//g, "-")}.pdf`
    doc.save(filename)

    vibrate("heavy")
    return filename
  }, [vibrate])

  return { generatePDF }
}
