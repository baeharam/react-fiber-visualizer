interface ChapterHeaderProps {
  number: number;
  title: string;
  titleHighlight?: string;
  description: string;
}

export function ChapterHeader({ number, title, titleHighlight, description }: ChapterHeaderProps) {
  return (
    <div className="chapter-header">
      <div className="chapter-badge">
        <span>Chapter {number}</span>
      </div>
      <h1 className="chapter-title">
        {titleHighlight ? (
          <>
            {title} <span>{titleHighlight}</span>
          </>
        ) : (
          title
        )}
      </h1>
      <p className="chapter-desc">{description}</p>
    </div>
  );
}

interface SummaryBoxProps {
  items: string[];
}

export function SummaryBox({ items }: SummaryBoxProps) {
  return (
    <div className="summary-box">
      <div className="summary-box-title">
        <span>✦</span>
        <span>핵심 요약</span>
      </div>
      <ul>
        {items.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

interface StepControlsProps {
  step: number;
  total: number;
  onNext: () => void;
  onPrev: () => void;
  onReset: () => void;
  nextLabel?: string;
}

export function StepControls({
  step,
  total,
  onNext,
  onPrev,
  onReset,
  nextLabel = '다음 단계',
}: StepControlsProps) {
  return (
    <div className="flex items-center justify-between mt-4" style={{ padding: '12px 0' }}>
      <div className="flex items-center gap-3">
        <button className="btn btn-secondary" onClick={onPrev} disabled={step === 0}>
          ← 이전
        </button>
        <button className="btn btn-primary" onClick={onNext} disabled={step >= total - 1}>
          {nextLabel} →
        </button>
        <button
          className="btn btn-secondary"
          onClick={onReset}
          style={{ fontSize: '12px', padding: '6px 12px' }}
        >
          ↺ 처음으로
        </button>
      </div>
      <div className="step-indicator">
        {Array.from({ length: total }).map((_, i) => (
          <div
            key={i}
            className={`step-dot ${i === step ? 'active' : i < step ? 'done' : ''}`}
          />
        ))}
        <span
          style={{
            marginLeft: '8px',
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            color: 'var(--text-secondary)',
          }}
        >
          {step + 1} / {total}
        </span>
      </div>
    </div>
  );
}
