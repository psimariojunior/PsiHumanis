import Groq from "groq-sdk"

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
})

export interface AIResponse {
  content: string
  error?: string
}

const PSYCHOLOGIST_SYSTEM = `Você é um assistente de IA para psicólogos na plataforma PsiHumanis.
Suas funções incluem:
- Resumir sessões de terapia e prontuários
- Sugerir abordagens de tratamento baseadas em notas clínicas
- Gerar relatórios e observações clínicas
- Auxiliar com documentação terapêutica
- Analisar padrões emocionais de pacientes
- Sugerir exercícios e tarefas terapêuticas

IMPORTANTE:
- Sempre mantenha o sigilo profissional (Código de Ética do Psicólogo)
- Nunca faça diagnósticos definitivos — sugira apenas hipóteses para investigação
- Linguagem profissional, clara e objetiva
- Responda em português brasileiro
- Formate respostas com markdown quando apropriado`

export async function summarizeSession(notes: string, patientName?: string): Promise<AIResponse> {
  try {
    const completion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: PSYCHOLOGIST_SYSTEM },
        {
          role: "user",
          content: `Resuma a seguinte sessão de terapia${patientName ? ` do paciente ${patientName}` : ""}. Extraia os pontos principais, observações clínicas e próximos passos:\n\n${notes}`,
        },
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.3,
      max_tokens: 1024,
    })
    return { content: completion.choices[0]?.message?.content || "" }
  } catch (e) {
    return { content: "", error: e instanceof Error ? e.message : "Erro ao resumir sessão" }
  }
}

export async function suggestTreatment(assessment: string, history?: string): Promise<AIResponse> {
  try {
    const prompt = `Com base nas seguintes informações clínicas, sugira abordagens e técnicas terapêuticas adequadas. Não faça diagnósticos, apenas sugira hipóteses e caminhos para investigação:\n\nAvaliação:\n${assessment}${history ? `\n\nHistórico:\n${history}` : ""}`

    const completion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: PSYCHOLOGIST_SYSTEM },
        { role: "user", content: prompt },
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.4,
      max_tokens: 1024,
    })
    return { content: completion.choices[0]?.message?.content || "" }
  } catch (e) {
    return { content: "", error: e instanceof Error ? e.message : "Erro ao sugerir tratamento" }
  }
}

export async function generateReport(patientData: {
  name: string
  sessions?: number
  moodHistory?: number[]
  notes?: string
}): Promise<AIResponse> {
  try {
    const prompt = `Gere um relatório clínico resumido para o paciente. Formato profissional com seções:

**Dados**: Nome: ${patientData.name}, Total de sessões: ${patientData.sessions || "N/A"}
${patientData.moodHistory?.length ? `**Evolução do humor** (últimas avaliações): ${patientData.moodHistory.join(", ")}` : ""}
${patientData.notes ? `**Notas**: ${patientData.notes}` : ""}

Gere:
1. Resumo do quadro atual
2. Evolução observada
3. Pontos de atenção
4. Recomendações para as próximas sessões`

    const completion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: PSYCHOLOGIST_SYSTEM },
        { role: "user", content: prompt },
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.3,
      max_tokens: 1024,
    })
    return { content: completion.choices[0]?.message?.content || "" }
  } catch (e) {
    return { content: "", error: e instanceof Error ? e.message : "Erro ao gerar relatório" }
  }
}

export async function suggestTasks(sessionNotes: string, patientContext?: string): Promise<AIResponse> {
  try {
    const prompt = `Com base na sessão abaixo, sugira 3-5 tarefas terapêuticas para o paciente realizar entre as sessões. Inclua descrição, objetivo e duração estimada:\n\nSessão:\n${sessionNotes}${patientContext ? `\nContexto do paciente: ${patientContext}` : ""}`

    const completion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: PSYCHOLOGIST_SYSTEM },
        { role: "user", content: prompt },
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.5,
      max_tokens: 800,
    })
    return { content: completion.choices[0]?.message?.content || "" }
  } catch (e) {
    return { content: "", error: e instanceof Error ? e.message : "Erro ao sugerir tarefas" }
  }
}

export async function analyzeEmotions(emotionEntries: string[]): Promise<AIResponse> {
  try {
    const prompt = `Analise os registros emocionais do paciente abaixo. Identifique padrões, tendências e forneça insights clínicos:\n\nRegistros:\n${emotionEntries.map((e, i) => `${i + 1}. ${e}`).join("\n")}

Forneça:
1. Padrões identificados
2. Tendências emocionais
3. Possíveis gatilhos
4. Sugestões de acompanhamento`

    const completion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: PSYCHOLOGIST_SYSTEM },
        { role: "user", content: prompt },
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.3,
      max_tokens: 800,
    })
    return { content: completion.choices[0]?.message?.content || "" }
  } catch (e) {
    return { content: "", error: e instanceof Error ? e.message : "Erro ao analisar emoções" }
  }
}

export async function chat(userMessage: string, context?: string): Promise<AIResponse> {
  try {
    const messages: { role: "system" | "user" | "assistant"; content: string }[] = [
      { role: "system", content: PSYCHOLOGIST_SYSTEM },
    ]
    if (context) messages.push({ role: "assistant", content: `Contexto anterior:\n${context}` })
    messages.push({ role: "user", content: userMessage })

    const completion = await groq.chat.completions.create({
      messages,
      model: "llama-3.3-70b-versatile",
      temperature: 0.5,
      max_tokens: 1024,
    })
    return { content: completion.choices[0]?.message?.content || "" }
  } catch (e) {
    return { content: "", error: e instanceof Error ? e.message : "Erro ao processar mensagem" }
  }
}
