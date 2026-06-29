/**
 * AI calls go directly to Anthropic from the browser.
 * The backend /api/ai/* routes exist as fallback for server-side use.
 */
const ANTHROPIC_KEY = import.meta.env.VITE_ANTHROPIC_KEY || ''
const MODEL = 'claude-sonnet-4-6'

const SEARCH_SYSTEM = `You are NEXUS SCHOLAR scholarship intelligence engine.
Find real active fully-funded international bachelor scholarships for Pakistani CS/AI/Cybersecurity students.
PRIORITY: No IELTS (accepts MOI letter, English proficiency certificate, school cert in English).
Search: Turkey (Türkiye Bursları), China (CSC), Hungary (Stipendium), Korea (KGSP), Japan (MEXT), Germany (DAAD), UAE, Qatar, Saudi Arabia, Malaysia, Poland, Kazakhstan.
Return ONLY a valid JSON array — no markdown, no text outside the array. Max 6 items.
Schema: [{"name":"","university":"","country":"","flag":"","deadline":"","deadlineISO":"YYYY-MM-DD","funding":"Fully Funded","stipend":"","ieltsRequired":false,"ieltsNote":"","officialUrl":"https://...","keyBenefit":"","dcs":82,"suitability":88,"tier":"ALPHA","competitiveness":"Medium","fields":["CS"],"docs":["Passport","Transcripts"]}]`

const CONSULTANT_SYSTEM = `You are NEXUS SCHOLAR — elite AI scholarship advisor.
STUDENT PROFILE:
• Sayyad | 18yo | Pakistani (Pashtun) | ICS Stream
• Target: Bachelor CS / AI / Cybersecurity
• IELTS-FREE — MOI letter + English Proficiency Certificate available
• Extracurriculars: FL Studio producer (trap/amapiano 2yr), C++/JUCE VST developer (Khpal Awaaz)
• Europass CV: assessed application-ready
• Priority: Fully-funded + stipend, NO IELTS, English instruction
Rules: Specific + actionable. Real URLs. If unsure about a deadline say to verify at [URL].`

async function callClaude(system, messages, useWebSearch = true) {
  const tools = useWebSearch ? [{ type: 'web_search_20250305', name: 'web_search' }] : []
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 1000,
      system,
      ...(tools.length && { tools }),
      messages,
    }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error?.message || `Anthropic API error ${res.status}`)
  }
  const data = await res.json()
  return (data.content || []).filter(b => b.type === 'text').map(b => b.text).join('')
}

export const aiApi = {
  search: async (query) => {
    const text = await callClaude(SEARCH_SYSTEM, [{ role: 'user', content: query }])
    const match = text.match(/\[[\s\S]*?\]/)
    if (!match) throw new Error('No structured data returned')
    return JSON.parse(match[0])
  },

  chat: (messages) => callClaude(CONSULTANT_SYSTEM, messages),
}
