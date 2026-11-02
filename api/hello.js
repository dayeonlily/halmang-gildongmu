// 동작 확인용 — 키 값은 내보내지 않고 "있는지 없는지"만 알려줍니다.
export default function handler(req, res) {
  res.status(200).json({
    ok: true,
    time: new Date().toISOString(),
    hasDataKey: Boolean(process.env.DATA_GO_KR_KEY),
    hasClaudeKey: Boolean(process.env.ANTHROPIC_API_KEY),
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY), // Claude 를 쓸 수 없을 때 대신 답하는 Gemini
  })
}
