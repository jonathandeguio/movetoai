interface Step {
  number: number
  title: string
  description: string
  code?: string
  tip?: string
}

interface Props {
  steps: Step[]
}

export function StepByStep({ steps }: Props) {
  return (
    <div className="space-y-6">
      {steps.map(step => (
        <div key={step.number} className="flex gap-4">
          <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
            style={{ background: "var(--green)", color: "#000" }}>
            {step.number}
          </div>
          <div className="flex-1 pt-1">
            <h4 className="font-semibold mb-2" style={{ color: "var(--text-primary)" }}>{step.title}</h4>
            <p className="text-sm mb-3" style={{ color: "var(--text-secondary)" }}>{step.description}</p>
            {step.code && (
              <pre className="rounded-lg p-4 text-xs overflow-x-auto mb-3"
                style={{ background: "var(--bg-secondary)", color: "var(--text-primary)", fontFamily: "monospace" }}>
                <code>{step.code}</code>
              </pre>
            )}
            {step.tip && (
              <div className="flex items-start gap-2 p-3 rounded-lg text-sm"
                style={{ background: "rgba(110, 231, 183, 0.08)", border: "1px solid rgba(110, 231, 183, 0.2)" }}>
                <span>💡</span>
                <p style={{ color: "var(--text-secondary)" }}>{step.tip}</p>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
