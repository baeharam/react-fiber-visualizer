import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChapterHeader, SummaryBox } from '../components/shared';

// ─── Tab 정의 ────────────────────────────────────────────────────────────────
const TABS = [
  { id: 'timeslicing', label: 'Time Slicing' },
  { id: 'interruptible', label: 'Interruptible Rendering' },
  { id: 'comparison', label: 'Legacy vs Concurrent' },
  { id: 'transitions', label: 'useTransition / Suspense' },
  { id: 'deferred', label: 'useDeferredValue' },
];

// ─── Time Slicing 탭 ──────────────────────────────────────────────────────────
const FIBER_NODES = [
  { id: 'App', label: 'App', depth: 0 },
  { id: 'Header', label: 'Header', depth: 1 },
  { id: 'Nav', label: 'Nav', depth: 2 },
  { id: 'Main', label: 'Main', depth: 1 },
  { id: 'List', label: 'List (100 items)', depth: 2, heavy: true },
  { id: 'Item1', label: 'Item 1', depth: 3 },
  { id: 'Item2', label: 'Item 2', depth: 3 },
  { id: 'Item3', label: 'Item 3', depth: 3 },
  { id: 'Footer', label: 'Footer', depth: 1 },
];

type SliceStatus = 'idle' | 'running' | 'yielded' | 'done';

interface TimeSlice {
  id: number;
  nodes: string[];
  durationMs: number;
  yielded: boolean;
}

function TimeSlicingTab() {
  const [slices, setSlices] = useState<TimeSlice[]>([]);
  const [status, setStatus] = useState<SliceStatus>('idle');
  const [currentSlice, setCurrentSlice] = useState(0);
  const [processedNodes, setProcessedNodes] = useState<Set<string>>(new Set());
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const SLICED_GROUPS: TimeSlice[] = [
    { id: 1, nodes: ['App', 'Header', 'Nav'], durationMs: 3.2, yielded: false },
    { id: 2, nodes: ['Main', 'List'], durationMs: 4.8, yielded: true },  // 5ms 임박
    { id: 3, nodes: ['Item1', 'Item2'], durationMs: 3.6, yielded: false },
    { id: 4, nodes: ['Item3', 'Footer'], durationMs: 2.1, yielded: false },
  ];

  const run = () => {
    if (status === 'running') return;
    setStatus('running');
    setSlices([]);
    setProcessedNodes(new Set());
    setCurrentSlice(0);

    let idx = 0;
    const allNodes = new Set<string>();

    const processSlice = () => {
      if (idx >= SLICED_GROUPS.length) {
        setStatus('done');
        return;
      }

      const slice = SLICED_GROUPS[idx];
      setCurrentSlice(idx);
      setSlices((prev) => [...prev, slice]);

      // 처리된 노드 누적
      slice.nodes.forEach((n) => allNodes.add(n));
      setProcessedNodes(new Set(allNodes));

      if (slice.yielded) {
        setStatus('yielded');
        timerRef.current = setTimeout(() => {
          setStatus('running');
          idx++;
          timerRef.current = setTimeout(processSlice, 400);
        }, 1000); // yield 상태 표시
      } else {
        idx++;
        timerRef.current = setTimeout(processSlice, 700);
      }
    };

    timerRef.current = setTimeout(processSlice, 400);
  };

  const reset = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setSlices([]);
    setStatus('idle');
    setCurrentSlice(0);
    setProcessedNodes(new Set());
  };

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div className="card" style={{ background: 'rgba(6,182,212,0.06)', borderColor: 'rgba(6,182,212,0.25)' }}>
        <div className="card-title" style={{ color: 'var(--secondary)' }}>Time Slicing이란?</div>
        <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.8 }}>
          Concurrent Mode에서 React는 렌더링 작업을 <strong style={{ color: 'var(--text)' }}>5ms 단위 타임슬롯</strong>으로 분할합니다.
          각 슬롯 종료 시 <code style={{ color: '#a78bfa', background: 'rgba(167,139,250,0.1)', padding: '1px 6px', borderRadius: '3px' }}>shouldYield()</code>를 확인하고,
          deadline을 초과하면 현재 작업을 중단(<strong style={{ color: '#ef4444' }}>yield</strong>)하여 브라우저에 제어권을 반환합니다.
          브라우저는 이 틈에 사용자 입력을 처리하고 화면을 그립니다.
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '16px', alignItems: 'start' }}>
        {/* 타임라인 시각화 */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <div className="card-title" style={{ margin: 0 }}>
              {status === 'idle' && '실행 대기'}
              {status === 'running' && (
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <motion.span animate={{ opacity: [1, 0.3, 1] }} transition={{ repeat: Infinity, duration: 0.8 }} style={{ color: '#06b6d4' }}>●</motion.span>
                  렌더링 중
                </span>
              )}
              {status === 'yielded' && <span style={{ color: '#f59e0b' }}>⏸ Yielded — 브라우저 제어 반환</span>}
              {status === 'done' && <span style={{ color: '#10b981' }}>✓ 렌더링 완료</span>}
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="btn btn-primary" onClick={run} disabled={status === 'running'} style={{ fontSize: '11px', padding: '4px 12px' }}>▶ 시뮬레이션</button>
              <button className="btn btn-secondary" onClick={reset} style={{ fontSize: '11px', padding: '4px 12px' }}>↺ 리셋</button>
            </div>
          </div>

          {/* 슬라이스 타임라인 바 */}
          <div style={{ marginBottom: '16px' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-muted)', marginBottom: '6px' }}>
              5ms 타임슬롯 단위 실행
            </div>
            <div style={{ display: 'flex', gap: '2px', height: '32px', alignItems: 'stretch' }}>
              {SLICED_GROUPS.map((slice, i) => {
                const isProcessed = slices.some(s => s.id === slice.id);
                const isCurrent = currentSlice === i && (status === 'running' || status === 'yielded');
                return (
                  <motion.div
                    key={slice.id}
                    animate={{ opacity: isProcessed ? 1 : 0.2 }}
                    style={{
                      flex: slice.durationMs,
                      borderRadius: '4px',
                      background: isProcessed
                        ? slice.yielded
                          ? 'linear-gradient(135deg, #f59e0b, #ef4444)'
                          : 'linear-gradient(135deg, #06b6d4, #7c3aed)'
                        : 'var(--border)',
                      border: isCurrent ? '2px solid white' : '1px solid transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      position: 'relative',
                    }}
                  >
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'white', fontWeight: 700 }}>
                      {slice.durationMs}ms
                    </span>
                    {isProcessed && slice.yielded && (
                      <div style={{ position: 'absolute', top: '-18px', right: '0', fontFamily: 'var(--font-mono)', fontSize: '9px', color: '#f59e0b' }}>
                        yield ↑
                      </div>
                    )}
                  </motion.div>
                );
              })}
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', paddingLeft: '8px' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--text-muted)' }}>← 5ms 한계</span>
              </div>
            </div>

            {/* 브라우저 Paint 표시 */}
            <div style={{ display: 'flex', gap: '2px', height: '20px', marginTop: '4px' }}>
              {SLICED_GROUPS.map((slice, i) => {
                const isAfterYield = slices.some(s => s.id === slice.id && s.yielded);
                return (
                  <div key={i} style={{ flex: slice.durationMs, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {isAfterYield && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: '#22c55e', fontWeight: 700 }}
                      >
                        🎨 Paint
                      </motion.div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Fiber 노드 처리 상태 */}
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-muted)', marginBottom: '8px' }}>처리된 Fiber 노드</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {FIBER_NODES.map((node) => {
                const isDone = processedNodes.has(node.id);
                return (
                  <motion.div
                    key={node.id}
                    animate={{ scale: isDone ? 1 : 0.95 }}
                    style={{
                      padding: '4px 10px',
                      borderRadius: '6px',
                      border: `1px solid ${isDone ? (node.heavy ? '#f59e0b' : '#06b6d4') : 'var(--border)'}`,
                      background: isDone ? (node.heavy ? 'rgba(245,158,11,0.12)' : 'rgba(6,182,212,0.12)') : 'var(--surface-2)',
                      fontFamily: 'var(--font-mono)', fontSize: '11px',
                      color: isDone ? (node.heavy ? '#f59e0b' : '#06b6d4') : 'var(--text-muted)',
                      transition: 'all 0.3s',
                    }}
                  >
                    {node.heavy ? '⚠️ ' : ''}{node.label}
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>

        {/* shouldYield 코드 */}
        <div className="card">
          <div className="card-title">shouldYield() 로직</div>
          <div className="code-block" style={{ fontSize: '11px', lineHeight: 1.9 }}>
            <div><span className="code-comment">{'// React Scheduler'}</span></div>
            <div><span className="code-keyword">let</span> deadline = <span className="code-number">0</span>;</div>
            <div><span className="code-keyword">const</span> frameInterval = <span className="code-number">5</span>; <span className="code-comment">{'// ms'}</span></div>
            <div style={{ marginTop: '10px' }}><span className="code-keyword">function</span> <span className="code-function">shouldYield</span><span className="code-punc">() {'{'}</span></div>
            <div style={{ paddingLeft: '16px' }}><span className="code-keyword">return</span> <span className="code-function">getCurrentTime</span>() &gt;= deadline;</div>
            <div><span className="code-punc">{'}'}</span></div>
            <div style={{ marginTop: '10px' }}><span className="code-function">workLoopConcurrent</span><span className="code-punc">() {'{'}</span></div>
            <div style={{ paddingLeft: '16px' }}><span className="code-keyword">while</span> <span className="code-punc">(</span></div>
            <div style={{ paddingLeft: '32px' }}>workInProgress !== <span className="code-number">null</span> <span className="code-punc">&&</span></div>
            <div style={{ paddingLeft: '32px' }}>!<span className="code-function">shouldYield</span>()</div>
            <div style={{ paddingLeft: '16px' }}><span className="code-punc">) {'{'}</span></div>
            <div style={{ paddingLeft: '32px' }}><span className="code-function">performUnitOfWork</span>(wip);</div>
            <div style={{ paddingLeft: '16px' }}><span className="code-punc">{'}'}</span></div>
            <div><span className="code-punc">{'}'}</span></div>
          </div>
          <div style={{ marginTop: '12px', padding: '10px', background: 'rgba(245,158,11,0.08)', borderRadius: '6px', border: '1px solid rgba(245,158,11,0.2)' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: '#f59e0b', marginBottom: '4px' }}>isInputPending() (실험적)</div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Chrome의 <code style={{ color: '#a78bfa' }}>navigator.scheduling.isInputPending()</code>을 통해 대기 중인 사용자 입력이 있을 경우 더 빨리 yield할 수 있습니다.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Interruptible Rendering 탭 ───────────────────────────────────────────────
type RenderMode = 'legacy' | 'concurrent';

interface RenderFrame {
  id: number;
  type: 'render' | 'input' | 'paint' | 'yield' | 'blocked';
  label: string;
  width: number;
  color: string;
}

function buildFrames(mode: RenderMode): RenderFrame[] {
  if (mode === 'legacy') {
    return [
      { id: 1, type: 'render', label: '렌더링 (동기 60ms)', width: 240, color: '#ef4444' },
      { id: 2, type: 'blocked', label: '입력 차단됨 ⚠️', width: 180, color: '#7f1d1d' },
      { id: 3, type: 'paint', label: 'Paint', width: 60, color: '#22c55e' },
      { id: 4, type: 'input', label: '입력 처리 (지연)', width: 80, color: '#f97316' },
    ];
  } else {
    return [
      { id: 1, type: 'render', label: '렌더 5ms', width: 50, color: '#06b6d4' },
      { id: 2, type: 'yield', label: 'yield', width: 20, color: '#f59e0b' },
      { id: 3, type: 'input', label: '입력 즉시 처리 ✓', width: 50, color: '#22c55e' },
      { id: 4, type: 'render', label: '렌더 재개 5ms', width: 50, color: '#06b6d4' },
      { id: 5, type: 'yield', label: 'yield', width: 20, color: '#f59e0b' },
      { id: 6, type: 'render', label: '렌더 5ms', width: 50, color: '#06b6d4' },
      { id: 7, type: 'paint', label: 'Paint', width: 50, color: '#22c55e' },
      { id: 8, type: 'render', label: '나머지 렌더', width: 60, color: '#7c3aed' },
      { id: 9, type: 'paint', label: 'Paint 완료', width: 50, color: '#22c55e' },
    ];
  }
}

function InterruptibleTab() {
  const [mode, setMode] = useState<RenderMode>('legacy');
  const [visibleCount, setVisibleCount] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const frames = buildFrames(mode);

  const play = () => {
    if (isPlaying) return;
    setIsPlaying(true);
    setVisibleCount(0);
    let i = 0;
    const step = () => {
      i++;
      setVisibleCount(i);
      if (i < frames.length) {
        timerRef.current = setTimeout(step, 500);
      } else {
        setIsPlaying(false);
      }
    };
    timerRef.current = setTimeout(step, 300);
  };

  const reset = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setIsPlaying(false);
    setVisibleCount(0);
  };

  useEffect(() => { reset(); }, [mode]);
  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* 모드 토글 */}
      <div style={{ display: 'flex', gap: '8px' }}>
        {(['legacy', 'concurrent'] as RenderMode[]).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            style={{
              padding: '8px 20px', borderRadius: '8px',
              border: `1px solid ${mode === m ? (m === 'legacy' ? '#ef4444' : '#06b6d4') : 'var(--border)'}`,
              background: mode === m ? (m === 'legacy' ? 'rgba(239,68,68,0.15)' : 'rgba(6,182,212,0.15)') : 'var(--surface-2)',
              color: mode === m ? (m === 'legacy' ? '#ef4444' : '#06b6d4') : 'var(--text-secondary)',
              fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: mode === m ? 700 : 400,
              cursor: 'pointer', transition: 'all 0.2s',
            }}
          >
            {m === 'legacy' ? '⚠️ Legacy Mode (동기)' : '✅ Concurrent Mode (비동기)'}
          </button>
        ))}
      </div>

      {/* 설명 */}
      <div className="card" style={{
        background: mode === 'legacy' ? 'rgba(239,68,68,0.06)' : 'rgba(6,182,212,0.06)',
        borderColor: mode === 'legacy' ? 'rgba(239,68,68,0.25)' : 'rgba(6,182,212,0.25)',
      }}>
        <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.8 }}>
          {mode === 'legacy' ? (
            <>
              <strong style={{ color: '#ef4444' }}>Legacy Mode (ReactDOM.render)</strong>: 렌더링은 동기적으로 실행되어 완료될 때까지 메인 스레드를 점유합니다.
              60ms 렌더링 중에는 사용자 입력(클릭, 타이핑)이 차단됩니다.
              <strong style={{ color: '#ef4444' }}> Jank(화면 버벅임)</strong>의 원인입니다.
            </>
          ) : (
            <>
              <strong style={{ color: '#06b6d4' }}>Concurrent Mode (createRoot)</strong>: 렌더링은 5ms 단위로 중단되며,
              사용자 입력이 발생하면 <strong style={{ color: '#22c55e' }}>즉시 처리</strong>됩니다.
              낮은 우선순위 업데이트(Transition)는 높은 우선순위 업데이트(사용자 입력)에 의해 <strong style={{ color: '#f59e0b' }}>인터럽트</strong>될 수 있습니다.
            </>
          )}
        </div>
      </div>

      {/* 프레임 타임라인 */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div className="card-title" style={{ margin: 0 }}>메인 스레드 타임라인</div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn btn-primary" onClick={play} disabled={isPlaying} style={{ fontSize: '11px', padding: '4px 12px' }}>▶ 재생</button>
            <button className="btn btn-secondary" onClick={reset} style={{ fontSize: '11px', padding: '4px 12px' }}>↺ 리셋</button>
          </div>
        </div>

        {/* 16ms 프레임 경계선 표시 */}
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-muted)', marginBottom: '6px', display: 'flex', gap: '8px' }}>
          <span>← 16ms/frame (60fps 기준)</span>
          {mode === 'legacy' && <span style={{ color: '#ef4444' }}>▶ 렌더링이 프레임 예산을 훨씬 초과!</span>}
        </div>

        {/* 타임라인 바 */}
        <div style={{ display: 'flex', gap: '3px', alignItems: 'stretch', height: '44px', position: 'relative' }}>
          {/* 16ms 프레임 경계선 */}
          {mode === 'legacy' && (
            <div style={{ position: 'absolute', left: '64px', top: 0, bottom: 0, width: '1px', background: 'rgba(255,255,255,0.2)', zIndex: 1 }}>
              <span style={{ position: 'absolute', top: '-18px', left: '-12px', fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--text-muted)' }}>16ms</span>
            </div>
          )}

          {frames.map((frame, i) => (
            <AnimatePresence key={frame.id}>
              {i < visibleCount && (
                <motion.div
                  initial={{ opacity: 0, scaleX: 0 }}
                  animate={{ opacity: 1, scaleX: 1 }}
                  style={{
                    width: `${frame.width}px`, flexShrink: 0,
                    borderRadius: '4px',
                    background: `${frame.color}${frame.type === 'blocked' ? '40' : '25'}`,
                    border: `1px solid ${frame.color}${frame.type === 'blocked' ? '80' : '60'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transformOrigin: 'left',
                  }}
                >
                  <span style={{
                    fontFamily: 'var(--font-mono)', fontSize: '9px',
                    color: frame.color, fontWeight: 600,
                    textAlign: 'center', padding: '2px',
                    writingMode: frame.width < 50 ? 'vertical-rl' : 'horizontal-tb',
                  }}>
                    {frame.label}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          ))}
        </div>

        {/* 범례 */}
        <div style={{ display: 'flex', gap: '16px', marginTop: '12px', flexWrap: 'wrap' }}>
          {[
            { color: '#06b6d4', label: 'React 렌더링' },
            { color: '#f59e0b', label: 'Yield (브라우저 양보)' },
            { color: '#22c55e', label: 'Paint / 입력 처리' },
            { color: '#ef4444', label: '동기 렌더링 (블로킹)' },
            { color: '#7c3aed', label: '나머지 작업' },
          ].map((item) => (
            <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: item.color }} />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-secondary)' }}>{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 코드 비교 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <div className="card" style={{ borderColor: 'rgba(239,68,68,0.3)' }}>
          <div className="card-title" style={{ color: '#ef4444' }}>Legacy Mode</div>
          <div className="code-block" style={{ fontSize: '12px', lineHeight: 1.9 }}>
            <div><span className="code-comment">{'// React 17 이하 / legacy'}</span></div>
            <div>ReactDOM.<span className="code-function">render</span>(</div>
            <div style={{ paddingLeft: '16px' }}><span className="code-tag">&lt;App /&gt;</span>,</div>
            <div style={{ paddingLeft: '16px' }}>document.<span className="code-function">getElementById</span>(<span className="code-string">'root'</span>)</div>
            <div>);</div>
            <div style={{ marginTop: '10px' }}><span className="code-comment">{'// workLoopSync: 동기 실행'}</span></div>
            <div><span className="code-keyword">function</span> <span className="code-function">workLoopSync</span><span className="code-punc">() {'{'}</span></div>
            <div style={{ paddingLeft: '16px' }}><span className="code-keyword">while</span> (workInProgress !== <span className="code-number">null</span>) <span className="code-punc">{'{'}</span></div>
            <div style={{ paddingLeft: '32px' }}><span className="code-function">performUnitOfWork</span>(wip);</div>
            <div style={{ paddingLeft: '16px' }}><span className="code-punc">{'}'}</span></div>
            <div><span className="code-punc">{'}'}</span></div>
          </div>
        </div>

        <div className="card" style={{ borderColor: 'rgba(6,182,212,0.3)' }}>
          <div className="card-title" style={{ color: '#06b6d4' }}>Concurrent Mode</div>
          <div className="code-block" style={{ fontSize: '12px', lineHeight: 1.9 }}>
            <div><span className="code-comment">{'// React 18 createRoot'}</span></div>
            <div><span className="code-keyword">const</span> root = ReactDOM.<span className="code-function">createRoot</span>(</div>
            <div style={{ paddingLeft: '16px' }}>document.<span className="code-function">getElementById</span>(<span className="code-string">'root'</span>)</div>
            <div>);</div>
            <div>root.<span className="code-function">render</span>(<span className="code-tag">&lt;App /&gt;</span>);</div>
            <div style={{ marginTop: '10px' }}><span className="code-comment">{'// workLoopConcurrent: yield 가능'}</span></div>
            <div><span className="code-keyword">function</span> <span className="code-function">workLoopConcurrent</span><span className="code-punc">() {'{'}</span></div>
            <div style={{ paddingLeft: '16px' }}><span className="code-keyword">while</span> (wip !== <span className="code-number">null</span> && !<span className="code-function">shouldYield</span>()) <span className="code-punc">{'{'}</span></div>
            <div style={{ paddingLeft: '32px' }}><span className="code-function">performUnitOfWork</span>(wip);</div>
            <div style={{ paddingLeft: '16px' }}><span className="code-punc">{'}'}</span></div>
            <div><span className="code-punc">{'}'}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Legacy vs Concurrent 비교 탭 ─────────────────────────────────────────────
function ComparisonTab() {
  const rows = [
    { feature: '렌더링 방식', legacy: '동기 (완료까지 블로킹)', concurrent: '비동기 (5ms 단위 분할)', win: 'concurrent' },
    { feature: '인터럽트 가능', legacy: '❌ 불가', concurrent: '✅ 가능 (shouldYield)', win: 'concurrent' },
    { feature: '우선순위 모델', legacy: 'expirationTime (단순)', concurrent: 'Lanes 비트마스크 (세밀)', win: 'concurrent' },
    { feature: '배치 업데이트', legacy: '이벤트 핸들러 내부만', concurrent: '자동 배치 (모든 컨텍스트)', win: 'concurrent' },
    { feature: 'useTransition', legacy: '❌ 없음', concurrent: '✅ 저우선순위 트랜지션', win: 'concurrent' },
    { feature: 'Suspense', legacy: '제한적 (코드 스플리팅만)', concurrent: '✅ 데이터 페칭, 동시 렌더', win: 'concurrent' },
    { feature: 'Tearing 방지', legacy: '❌ 외부 스토어 문제', concurrent: '✅ useSyncExternalStore', win: 'concurrent' },
    { feature: '업그레이드 비용', legacy: '낮음 (기존 코드 호환)', concurrent: 'createRoot 교체 필요', win: 'legacy' },
    { feature: '엄격 모드', legacy: '1회 렌더', concurrent: '2회 렌더 (개발 모드)', win: 'neutral' },
    { feature: 'Server Components', legacy: '❌ 미지원', concurrent: '✅ RSC 기반', win: 'concurrent' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div className="card">
        <div className="card-title">Legacy Mode vs Concurrent Mode 완전 비교</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
          {/* 헤더 */}
          <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr 1fr', gap: '0', background: 'var(--surface)', borderRadius: '6px 6px 0 0', padding: '10px 12px', border: '1px solid var(--border)' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700 }}>특성</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: '#ef4444', fontWeight: 700, textAlign: 'center' }}>Legacy Mode</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: '#06b6d4', fontWeight: 700, textAlign: 'center' }}>Concurrent Mode</span>
          </div>
          {rows.map((row, i) => (
            <div
              key={i}
              style={{
                display: 'grid', gridTemplateColumns: '200px 1fr 1fr',
                gap: '0', padding: '10px 12px',
                background: i % 2 === 0 ? 'var(--surface-2)' : 'var(--surface)',
                border: '1px solid var(--border)',
                borderTop: 'none',
                borderRadius: i === rows.length - 1 ? '0 0 6px 6px' : '0',
              }}
            >
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600 }}>{row.feature}</span>
              <span style={{
                fontSize: '12px', textAlign: 'center',
                color: row.win === 'legacy' ? '#10b981' : 'var(--text-secondary)',
                fontWeight: row.win === 'legacy' ? 700 : 400,
              }}>
                {row.legacy}
              </span>
              <span style={{
                fontSize: '12px', textAlign: 'center',
                color: row.win === 'concurrent' ? '#10b981' : 'var(--text-secondary)',
                fontWeight: row.win === 'concurrent' ? 700 : 400,
              }}>
                {row.concurrent}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 마이그레이션 가이드 */}
      <div className="card">
        <div className="card-title">React 18 마이그레이션 핵심</div>
        <div className="code-block" style={{ fontSize: '12px', lineHeight: 1.9 }}>
          <div><span className="code-comment">{'// Before (React 17)'}</span></div>
          <div>import ReactDOM <span className="code-keyword">from</span> <span className="code-string">'react-dom'</span>;</div>
          <div>ReactDOM.<span className="code-function">render</span>(<span className="code-tag">&lt;App /&gt;</span>, container);</div>
          <div style={{ marginTop: '12px' }}><span className="code-comment">{'// After (React 18) — Concurrent Mode 활성화'}</span></div>
          <div>import {'{'} createRoot {'}'} <span className="code-keyword">from</span> <span className="code-string">'react-dom/client'</span>;</div>
          <div><span className="code-keyword">const</span> root = <span className="code-function">createRoot</span>(container);</div>
          <div>root.<span className="code-function">render</span>(<span className="code-tag">&lt;App /&gt;</span>);</div>
          <div style={{ marginTop: '12px' }}><span className="code-comment">{'// 자동 배치 (React 18 기본)'}</span></div>
          <div><span className="code-keyword">function</span> <span className="code-function">handleClick</span><span className="code-punc">() {'{'}</span></div>
          <div style={{ paddingLeft: '20px' }}><span className="code-function">setCount</span>(c + <span className="code-number">1</span>); <span className="code-comment">{'// 배치됨!'}</span></div>
          <div style={{ paddingLeft: '20px' }}><span className="code-function">setFlag</span>(!flag); <span className="code-comment">{'// 하나의 리렌더로 합쳐짐'}</span></div>
          <div><span className="code-punc">{'}'}</span></div>
        </div>
      </div>
    </div>
  );
}

// ─── useTransition / Suspense 탭 ─────────────────────────────────────────────
const TRANSITION_STEPS = [
  {
    id: 0,
    title: 'startTransition 호출',
    desc: '사용자가 검색어를 입력합니다. 입력 업데이트(InputContinuousLane)는 즉시 처리되고, 무거운 목록 필터링 업데이트는 startTransition으로 감쌉니다.',
    code: `import { useTransition, useState } from 'react';

function SearchBox() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isPending, startTransition] = useTransition();

  function handleChange(e) {
    // 즉시 업데이트 (InputContinuousLane)
    setQuery(e.target.value);

    // 저우선순위 트랜지션 (TransitionLane)
    startTransition(() => {
      setResults(filterItems(e.target.value));
    });
  }
  // ...
}`,
    color: '#06b6d4',
  },
  {
    id: 1,
    title: 'Lane 분리',
    desc: 'startTransition 내부 setState는 TransitionLane(우선순위 낮음)으로 마킹됩니다. 새로운 키 입력이 오면 기존 트랜지션은 폐기(interrupt)하고 새 트랜지션을 시작합니다.',
    code: `// React 내부: startTransition
function startTransition(scope) {
  const prevTransition = ReactCurrentBatchConfig.transition;
  // 현재 실행 중인 작업에 Transition Lane 마킹
  ReactCurrentBatchConfig.transition = {};
  try {
    scope(); // setState 호출됨 → TransitionLane 할당
  } finally {
    ReactCurrentBatchConfig.transition = prevTransition;
  }
}

// 결과: Fiber.lanes에 TransitionLane1(0x100) 설정
// getHighestPriorityLane() 시 InputContinuousLane보다 낮은 우선순위`,
    color: '#a78bfa',
  },
  {
    id: 2,
    title: 'isPending 표시',
    desc: 'React는 트랜지션 렌더링이 완료되기 전까지 isPending=true를 반환합니다. 이를 통해 로딩 스피너나 스켈레톤 UI를 보여줄 수 있습니다. Suspense fallback과 조합하면 더 강력합니다.',
    code: `function SearchBox() {
  const [isPending, startTransition] = useTransition();

  return (
    <>
      <input onChange={handleChange} />
      {/* isPending: 트랜지션 렌더링 중인지 여부 */}
      {isPending && <Spinner />}

      {/* Suspense와 조합 */}
      <Suspense fallback={<SkeletonList />}>
        <SearchResults query={deferredQuery} />
      </Suspense>
    </>
  );
}`,
    color: '#22c55e',
  },
  {
    id: 3,
    title: 'useDeferredValue',
    desc: 'useTransition과 유사하지만 setValue를 직접 감싸지 않고 값을 지연합니다. 부모에서 제어할 수 없는 props를 지연할 때 유용합니다.',
    code: `import { useDeferredValue } from 'react';

function SearchResults({ query }) {
  // query가 즉시 업데이트되어도
  // deferredQuery는 낮은 우선순위로 업데이트
  const deferredQuery = useDeferredValue(query);

  // stale 여부 표시
  const isStale = query !== deferredQuery;

  return (
    <div style={{ opacity: isStale ? 0.7 : 1 }}>
      <SlowList query={deferredQuery} />
    </div>
  );
}`,
    color: '#f59e0b',
  },
];

function TransitionsTab() {
  const [activeStep, setActiveStep] = useState(0);
  const [isPending, setIsPending] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<string[]>([]);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const ALL_ITEMS = ['React Fiber', 'Concurrent Mode', 'Scheduler', 'Lanes', 'Suspense', 'useTransition', 'useDeferredValue', 'Server Components', 'Automatic Batching', 'Streaming SSR'];

  const handleQueryChange = (value: string) => {
    setQuery(value);
    setIsPending(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    // 트랜지션 시뮬레이션: 300ms 지연 후 결과 업데이트
    timerRef.current = setTimeout(() => {
      setResults(ALL_ITEMS.filter(item => item.toLowerCase().includes(value.toLowerCase())));
      setIsPending(false);
    }, 300);
  };

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* 라이브 데모 */}
      <div className="card" style={{ background: 'rgba(6,182,212,0.06)', borderColor: 'rgba(6,182,212,0.25)' }}>
        <div className="card-title" style={{ color: 'var(--secondary)' }}>useTransition 라이브 데모</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <input
              value={query}
              onChange={(e) => handleQueryChange(e.target.value)}
              placeholder="검색어 입력 (e.g. 'React', 'Lane')..."
              style={{
                flex: 1, padding: '8px 12px', borderRadius: '6px',
                border: '1px solid var(--border-2)', background: 'var(--surface-2)',
                color: 'var(--text)', fontFamily: 'var(--font-mono)', fontSize: '13px',
                outline: 'none',
              }}
            />
            {isPending && (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
                style={{ width: '18px', height: '18px', border: '2px solid #06b6d4', borderTopColor: 'transparent', borderRadius: '50%' }}
              />
            )}
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: isPending ? '#f59e0b' : '#10b981' }}>
              {isPending ? 'isPending: true' : 'isPending: false'}
            </span>
          </div>
          <div style={{ minHeight: '80px' }}>
            {results.length > 0 ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {results.map((item) => (
                  <div key={item} style={{
                    padding: '4px 12px', borderRadius: '6px',
                    border: '1px solid rgba(6,182,212,0.4)', background: 'rgba(6,182,212,0.1)',
                    fontFamily: 'var(--font-mono)', fontSize: '12px', color: '#06b6d4',
                    opacity: isPending ? 0.6 : 1, transition: 'opacity 0.2s',
                  }}>
                    {item}
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                {query ? '결과 없음' : '검색어를 입력하세요'}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 코드 스텝 */}
      <div className="card">
        <div className="card-title">useTransition / useDeferredValue 상세</div>
        <div style={{ display: 'flex', gap: '4px', marginBottom: '16px', flexWrap: 'wrap' }}>
          {TRANSITION_STEPS.map((s) => (
            <button
              key={s.id}
              onClick={() => setActiveStep(s.id)}
              style={{
                padding: '6px 14px', borderRadius: '6px',
                border: `1px solid ${activeStep === s.id ? s.color : 'var(--border)'}`,
                background: activeStep === s.id ? `${s.color}15` : 'transparent',
                color: activeStep === s.id ? s.color : 'var(--text-secondary)',
                fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: activeStep === s.id ? 700 : 400,
                cursor: 'pointer', transition: 'all 0.2s',
              }}
            >
              {s.title}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeStep}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            {(() => {
              const s = TRANSITION_STEPS[activeStep];
              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{
                    padding: '10px 14px', borderRadius: '6px',
                    border: `1px solid ${s.color}40`, background: `${s.color}08`,
                  }}>
                    <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.8 }}>{s.desc}</div>
                  </div>
                  <div className="code-block" style={{ fontSize: '12px', lineHeight: 1.8, whiteSpace: 'pre' }}>
                    {s.code.split('\n').map((line, i) => (
                      <div key={i}>{line || '\u00A0'}</div>
                    ))}
                  </div>
                </div>
              );
            })()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── useDeferredValue 탭 ─────────────────────────────────────────────────────────────
const ITEMS = Array.from({ length: 5000 }, (_, i) => `item-${i + 1}`);

function DeferredTab() {
  const [input, setInput] = useState('');
  const [deferredInput, setDeferredInput] = useState('');
  const [isStale, setIsStale] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInput(val);
    setIsStale(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setDeferredInput(val);
      setIsStale(false);
    }, 300);
  };

  const filtered = ITEMS.filter((item) => item.includes(deferredInput)).slice(0, 30);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* useTransition vs useDeferredValue 비교 */}
      <div className="card">
        <div className="card-title">useTransition vs useDeferredValue</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
          <div style={{ padding: '12px', borderRadius: '8px', border: '1px solid #06b6d430', background: '#06b6d408' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: '#06b6d4', fontWeight: 700, marginBottom: '8px' }}>useTransition</div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
              • <strong style={{ color: 'var(--text)' }}>상태를 직접 소유</strong>할 때<br />
              • startTransition 안에서 setState 호출<br />
              • isPending 플래그로 Pending 상태 추적<br />
              • 표시를 유지하면서 Transition 마킹
            </div>
            <div className="code-block" style={{ fontSize: '11px', marginTop: '10px', lineHeight: 1.7 }}>
              {`const [isPending, startTransition] = useTransition();

startTransition(() => {
  setQuery(input); // TransitionLane으로 마킹
});`}
            </div>
          </div>
          <div style={{ padding: '12px', borderRadius: '8px', border: '1px solid #f59e0b30', background: '#f59e0b08' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: '#f59e0b', fontWeight: 700, marginBottom: '8px' }}>useDeferredValue</div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
              • <strong style={{ color: 'var(--text)' }}>props / 외부에서 받은 값</strong>을 지연<br />
              • setState 접근 불가 시 (e.g. 라이브러리 값)<br />
              • value !== deferred로 stale 감지<br />
              • React가 낮은 우선순위로 르대링 예약
            </div>
            <div className="code-block" style={{ fontSize: '11px', marginTop: '10px', lineHeight: 1.7 }}>
              {`const deferred = useDeferredValue(value);

// value !== deferred 라면 stale(=렌더링 진행 중)
const isStale = value !== deferred;`}
            </div>
          </div>
        </div>
      </div>

      {/* 라이브 데모 */}
      <div className="card">
        <div className="card-title">useDeferredValue 라이브 데모 — 5,000개 아이템 필터링</div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '12px' }}>
          <input
            value={input}
            onChange={handleChange}
            placeholder="아이템 검색... (e.g. 42)"
            style={{
              flex: 1, padding: '8px 12px', borderRadius: '6px',
              border: '1px solid var(--border)', background: 'var(--bg-secondary)',
              color: 'var(--text)', fontFamily: 'var(--font-mono)', fontSize: '13px',
              outline: 'none',
            }}
          />
          <div style={{
            padding: '4px 10px', borderRadius: '4px', fontSize: '11px',
            fontFamily: 'var(--font-mono)',
            background: isStale ? '#f59e0b15' : '#10b98115',
            color: isStale ? '#f59e0b' : '#10b981',
            border: `1px solid ${isStale ? '#f59e0b40' : '#10b98140'}`,
          }}>
            {isStale ? '⏳ stale (deferred 대기 중)' : '✓ 최신상태'}
          </div>
        </div>
        <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>
          필터 결과: <strong style={{ color: 'var(--text)' }}>{filtered.length}개</strong>
          {deferredInput && <span> ("{deferredInput}" 포함)</span>}
        </div>
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '4px',
          maxHeight: '160px', overflow: 'hidden',
          opacity: isStale ? 0.5 : 1, transition: 'opacity 0.2s',
        }}>
          {filtered.map((item) => (
            <div key={item} style={{
              padding: '3px 6px', borderRadius: '4px', fontSize: '10px',
              fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)',
              background: 'var(--bg-secondary)', border: '1px solid var(--border)',
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            }}>
              {item}
            </div>
          ))}
        </div>
      </div>

      {/* 내부 동작 원리 */}
      <div className="card">
        <div className="card-title">내부 동작: React가 defer하는 방식</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {[
            { step: '1', label: 'urgent 업데이트', desc: 'setInput(newVal) → InputLane(SyncLane). 즉시 렌더링.', color: '#ef4444' },
            { step: '2', label: 'deferred 예약', desc: 'useDeferredValue 내부적으로 동일 값으로 TransitionLane에 이전 deferred 유지', color: '#f59e0b' },
            { step: '3', label: 'concurrent 렌더링', desc: 'React가 idle time에 TransitionLane 작업 시작. shouldYield()로 여러 프레임에 분산.', color: '#6366f1' },
            { step: '4', label: 'deferred 갱신', desc: 'TransitionLane 렌더링 완료 시 deferred 값 갱신. value === deferred 상태.', color: '#10b981' },
          ].map((row) => (
            <div key={row.step} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <div style={{
                width: '24px', height: '24px', borderRadius: '50%', flexShrink: 0,
                background: `${row.color}20`, border: `1px solid ${row.color}60`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '11px', fontWeight: 700, color: row.color, fontFamily: 'var(--font-mono)',
              }}>
                {row.step}
              </div>
              <div>
                <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text)', fontFamily: 'var(--font-mono)' }}>{row.label}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>{row.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
// ─── 메인 Chapter7 ────────────────────────────────────────────────────────────
export function Chapter7() {
  const [activeTab, setActiveTab] = useState('timeslicing');

  return (
    <div>
      <ChapterHeader
        number={7}
        title="Concurrent Mode"
        titleHighlight="심화"
        description="React 18 Concurrent Mode의 핵심 메커니즘: Time Slicing, Interruptible Rendering, useTransition, useDeferredValue를 내부 동작 원리와 함께 분석합니다."
      />

      {/* 탭 */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '20px', borderBottom: '1px solid var(--border)' }}>
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '8px 16px', background: 'transparent', border: 'none',
              borderBottom: `2px solid ${activeTab === tab.id ? 'var(--primary)' : 'transparent'}`,
              color: activeTab === tab.id ? 'var(--text)' : 'var(--text-secondary)',
              fontFamily: 'var(--font-mono)', fontSize: '12px',
              fontWeight: activeTab === tab.id ? 700 : 400,
              cursor: 'pointer', transition: 'all 0.2s', marginBottom: '-1px',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 탭 컨텐츠 */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'timeslicing' && <TimeSlicingTab />}
          {activeTab === 'interruptible' && <InterruptibleTab />}
          {activeTab === 'comparison' && <ComparisonTab />}
          {activeTab === 'transitions' && <TransitionsTab />}
          {activeTab === 'deferred' && <DeferredTab />}
        </motion.div>
      </AnimatePresence>

      <SummaryBox
        items={[
          'Time Slicing: 렌더링 작업을 5ms 단위로 분할합니다. shouldYield()가 deadline 초과 시 workLoopConcurrent를 중단하고 브라우저에 제어권을 반환합니다.',
          'Interruptible Rendering: 낮은 우선순위 업데이트(Transition)는 높은 우선순위 업데이트(사용자 입력)에 의해 중단될 수 있습니다. 중단된 작업은 나중에 재개됩니다.',
          'createRoot()를 사용해야 Concurrent Mode가 활성화됩니다. React 17의 ReactDOM.render()는 항상 동기 렌더링입니다.',
          'useTransition: 저우선순위 상태 업데이트를 TransitionLane으로 마킹합니다. isPending으로 진행 상태를 추적할 수 있습니다.',
          'useDeferredValue: props나 외부에서 받은 값을 지연합니다. 긴급하지 않은 자식 재렌더링을 defer할 때 유용합니다.',
          '자동 배치(Automatic Batching): React 18은 setTimeout, Promise, native 이벤트 핸들러 내부에서도 자동으로 배치 업데이트를 수행합니다.',
        ]}
      />
    </div>
  );
}
