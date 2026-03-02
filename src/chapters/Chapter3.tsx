import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChapterHeader, SummaryBox } from '../components/shared';

interface WorkNode {
  id: string;
  label: string;
  depth: number;
  index: number; // sibling index at same depth
}

const NODES: WorkNode[] = [
  { id: 'app', label: 'App', depth: 0, index: 0 },
  { id: 'div', label: 'div', depth: 1, index: 0 },
  { id: 'header', label: 'Header', depth: 2, index: 0 },
  { id: 'main', label: 'main', depth: 2, index: 1 },
  { id: 'p', label: 'p', depth: 3, index: 0 },
  { id: 'text', label: '"Hello"', depth: 4, index: 0 },
];

type PhaseType = 'beginWork' | 'completeWork';

interface WorkStep {
  nodeId: string;
  phase: PhaseType;
  description: string;
  call: string;
}

const STEPS: WorkStep[] = [
  { nodeId: 'app', phase: 'beginWork', description: 'App Fiber 처리 시작. 함수 컴포넌트 호출, JSX 반환값으로 자식 Fiber 생성.', call: 'beginWork(App)' },
  { nodeId: 'div', phase: 'beginWork', description: 'div Fiber 처리 시작. props 처리, 자식 Fiber(Header, main) 생성.', call: 'beginWork(div)' },
  { nodeId: 'header', phase: 'beginWork', description: 'Header Fiber 처리 시작. 함수 컴포넌트 호출. 자식 없음.', call: 'beginWork(Header)' },
  { nodeId: 'header', phase: 'completeWork', description: 'Header 작업 완료. completedWork에 effectList 추가. sibling(main)으로 이동.', call: 'completeWork(Header)' },
  { nodeId: 'main', phase: 'beginWork', description: 'main Fiber 처리 시작. 자식 Fiber(p) 생성.', call: 'beginWork(main)' },
  { nodeId: 'p', phase: 'beginWork', description: 'p Fiber 처리 시작. 자식 Fiber("Hello") 생성.', call: 'beginWork(p)' },
  { nodeId: 'text', phase: 'beginWork', description: '"Hello" 텍스트 노드 처리 시작. 자식 없음 → 즉시 complete.', call: 'beginWork("Hello")' },
  { nodeId: 'text', phase: 'completeWork', description: '텍스트 노드 작업 완료. 실제 TextNode 생성. 부모(p)로 이동.', call: 'completeWork("Hello")' },
  { nodeId: 'p', phase: 'completeWork', description: 'p 작업 완료. 실제 DOM 노드 생성 및 자식 추가. 부모(main)로 이동.', call: 'completeWork(p)' },
  { nodeId: 'main', phase: 'completeWork', description: 'main 작업 완료. DOM 노드 생성 및 자식(p) 추가. 부모(div)로 이동.', call: 'completeWork(main)' },
  { nodeId: 'div', phase: 'completeWork', description: 'div 작업 완료. DOM 노드 생성, 자식(Header, main) 붙임. 부모(App)로 이동.', call: 'completeWork(div)' },
  { nodeId: 'app', phase: 'completeWork', description: 'App 작업 완료! 전체 workInProgress 트리 구성 완료. commit phase로 이동.', call: 'completeWork(App) → Render Phase 완료!' },
];

const PHASE_COLORS: Record<PhaseType, string> = {
  beginWork: '#06b6d4',
  completeWork: '#10b981',
};

const PHASE_BG: Record<PhaseType, string> = {
  beginWork: 'rgba(6,182,212,0.08)',
  completeWork: 'rgba(16,185,129,0.08)',
};

// 노드 위치 계산
const DEPTH_Y = (d: number) => 20 + d * 110;

const NODE_W = 130;
const NODE_H = 52;

// x 위치: sibling 보정
function getNodePos(node: WorkNode): { x: number; y: number } {
  const baseX: Record<string, number> = {
    app: 280,
    div: 280,
    header: 80,
    main: 480,
    p: 480,
    text: 480,
  };
  return { x: baseX[node.id] ?? 280, y: DEPTH_Y(node.depth) };
}

function buildEdges() {
  type EdgeType = 'child' | 'sibling';
  const edges: { from: string; to: string; type: EdgeType }[] = [
    { from: 'app', to: 'div', type: 'child' },
    { from: 'div', to: 'header', type: 'child' },
    { from: 'header', to: 'main', type: 'sibling' },
    { from: 'main', to: 'p', type: 'child' },
    { from: 'p', to: 'text', type: 'child' },
  ];
  return edges;
}

const EDGES = buildEdges();

const nodeMap: Record<string, WorkNode> = {};
NODES.forEach((n) => (nodeMap[n.id] = n));

export function Chapter3() {
  const [stepIdx, setStepIdx] = useState(0);
  const [autoPlay, setAutoPlay] = useState(false);
  const [intervalId, setIntervalId] = useState<ReturnType<typeof setInterval> | null>(null);

  const currentStep = STEPS[stepIdx];

  // 지금까지 complete된 노드들
  const completedNodes = new Set<string>();
  for (let i = 0; i <= stepIdx; i++) {
    if (STEPS[i].phase === 'completeWork') completedNodes.add(STEPS[i].nodeId);
  }

  const handleAutoPlay = () => {
    if (autoPlay) {
      if (intervalId) clearInterval(intervalId);
      setIntervalId(null);
      setAutoPlay(false);
    } else {
      setAutoPlay(true);
      const id = setInterval(() => {
        setStepIdx((s) => {
          if (s >= STEPS.length - 1) {
            clearInterval(id);
            setAutoPlay(false);
            setIntervalId(null);
            return s;
          }
          return s + 1;
        });
      }, 1200);
      setIntervalId(id);
    }
  };

  const handleReset = () => {
    if (intervalId) clearInterval(intervalId);
    setIntervalId(null);
    setAutoPlay(false);
    setStepIdx(0);
  };

  const SVG_W = 700;
  const SVG_H = 520;

  return (
    <div>
      <ChapterHeader
        number={4}
        title="Work Loop"
        titleHighlight="(Render Phase)"
        description="React의 Render Phase에서 Fiber 트리를 어떻게 순회하는지 단계별로 살펴봅니다. beginWork(하강)와 completeWork(상승)로 구성된 DFS 순회 과정입니다."
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '16px', alignItems: 'start' }}>
        {/* 트리 시각화 */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div
            style={{
              padding: '12px 16px',
              borderBottom: '1px solid var(--border)',
              display: 'flex',
              gap: '16px',
              alignItems: 'center',
            }}
          >
            <div style={{ display: 'flex', gap: '12px' }}>
              {(['beginWork', 'completeWork'] as PhaseType[]).map((p) => (
                <div key={p} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div
                    style={{
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      background: PHASE_COLORS[p],
                    }}
                  />
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-secondary)' }}>
                    {p}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <svg
            width="100%"
            height={SVG_H}
            viewBox={`0 0 ${SVG_W} ${SVG_H}`}
            preserveAspectRatio="xMidYMid meet"
          >
            <defs>
              <marker id="wl-arrow" markerWidth="7" markerHeight="7" refX="6" refY="3" orient="auto">
                <path d="M0,0 L0,6 L7,3 z" fill="var(--border-2)" />
              </marker>
            </defs>

            {/* 엣지 */}
            {EDGES.map((e, i) => {
              const fn = nodeMap[e.from];
              const tn = nodeMap[e.to];
              const fp = getNodePos(fn);
              const tp = getNodePos(tn);

              let d: string;
              if (e.type === 'child') {
                const sx = fp.x + NODE_W / 2;
                const sy = fp.y + NODE_H;
                const ex = tp.x + NODE_W / 2;
                const ey = tp.y;
                const mid = (sy + ey) / 2;
                d = `M ${sx} ${sy} C ${sx} ${mid} ${ex} ${mid} ${ex} ${ey}`;
              } else {
                const sx = fp.x + NODE_W;
                const sy = fp.y + NODE_H / 2;
                const ex = tp.x;
                const ey = tp.y + NODE_H / 2;
                const mid = (sx + ex) / 2;
                d = `M ${sx} ${sy} C ${mid} ${sy} ${mid} ${ey} ${ex} ${ey}`;
              }

              return (
                <path
                  key={i}
                  d={d}
                  stroke="var(--border-2)"
                  strokeWidth="1.5"
                  fill="none"
                  markerEnd="url(#wl-arrow)"
                  opacity="0.5"
                />
              );
            })}

            {/* 노드들 */}
            {NODES.map((node) => {
              const pos = getNodePos(node);
              const isActive = currentStep.nodeId === node.id;
              const isComplete = completedNodes.has(node.id);
              const phase = isActive ? currentStep.phase : null;
              const borderColor = isActive
                ? PHASE_COLORS[phase!]
                : isComplete
                ? '#10b981'
                : 'var(--border-2)';
              const bgColor = isActive
                ? PHASE_BG[phase!]
                : isComplete
                ? 'rgba(16,185,129,0.05)'
                : 'var(--surface-2)';

              return (
                <motion.g key={node.id} animate={{ scale: isActive ? 1.05 : 1 }} style={{ transformOrigin: `${pos.x + NODE_W / 2}px ${pos.y + NODE_H / 2}px` }}>
                  {/* glow effect */}
                  {isActive && (
                    <motion.rect
                      x={pos.x - 4}
                      y={pos.y - 4}
                      width={NODE_W + 8}
                      height={NODE_H + 8}
                      rx="12"
                      fill={PHASE_COLORS[phase!]}
                      opacity="0.15"
                      animate={{ opacity: [0.15, 0.3, 0.15] }}
                      transition={{ repeat: Infinity, duration: 1.2 }}
                    />
                  )}
                  <rect
                    x={pos.x}
                    y={pos.y}
                    width={NODE_W}
                    height={NODE_H}
                    rx="8"
                    fill={bgColor}
                    stroke={borderColor}
                    strokeWidth={isActive ? 2 : 1}
                  />
                  <text
                    x={pos.x + NODE_W / 2}
                    y={pos.y + 22}
                    textAnchor="middle"
                    fontSize="14"
                    fontWeight="700"
                    fill={isActive ? PHASE_COLORS[phase!] : isComplete ? '#10b981' : '#e2e8f0'}
                    fontFamily="var(--font-mono)"
                  >
                    {node.label}
                  </text>
                  {(isActive || isComplete) && (
                    <text
                      x={pos.x + NODE_W / 2}
                      y={pos.y + 38}
                      textAnchor="middle"
                      fontSize="10"
                      fill={isActive ? PHASE_COLORS[phase!] : '#10b981'}
                      fontFamily="var(--font-mono)"
                      opacity="0.8"
                    >
                      {isActive ? phase : '✓ complete'}
                    </text>
                  )}
                </motion.g>
              );
            })}

            {/* 순서 번호 */}
            <text x="20" y="30" fontSize="11" fill="var(--text-muted)" fontFamily="var(--font-mono)">
              Step {stepIdx + 1}/{STEPS.length}
            </text>
          </svg>
        </div>

        {/* 오른쪽 컨트롤 패널 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* 현재 스텝 정보 */}
          <AnimatePresence mode="wait">
            <motion.div
              key={stepIdx}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="card"
              style={{
                borderColor: PHASE_COLORS[currentStep.phase],
                background: PHASE_BG[currentStep.phase],
              }}
            >
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '10px',
                  color: PHASE_COLORS[currentStep.phase],
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  marginBottom: '8px',
                }}
              >
                {currentStep.phase}
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '13px',
                  color: PHASE_COLORS[currentStep.phase],
                  marginBottom: '10px',
                  fontWeight: 600,
                }}
              >
                {currentStep.call}
              </div>
              <div style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                {currentStep.description}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* 컨트롤 버튼 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                className="btn btn-secondary"
                onClick={() => setStepIdx((s) => Math.max(s - 1, 0))}
                disabled={stepIdx === 0 || autoPlay}
                style={{ flex: 1 }}
              >
                ← 이전
              </button>
              <button
                className="btn btn-primary"
                onClick={() => setStepIdx((s) => Math.min(s + 1, STEPS.length - 1))}
                disabled={stepIdx >= STEPS.length - 1 || autoPlay}
                style={{ flex: 1 }}
              >
                다음 →
              </button>
            </div>
            <button
              className={`btn ${autoPlay ? 'btn-outline' : 'btn-secondary'}`}
              onClick={handleAutoPlay}
              style={{ width: '100%' }}
            >
              {autoPlay ? '⏸ 일시정지' : '▶ 자동 재생'}
            </button>
            <button
              className="btn btn-secondary"
              onClick={handleReset}
              style={{ width: '100%', fontSize: '12px' }}
            >
              ↺ 처음으로
            </button>
          </div>

          {/* 스텝 진행도 */}
          <div className="card" style={{ padding: '12px 16px' }}>
            <div className="card-title">진행도</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {STEPS.map((s, i) => (
                <div
                  key={i}
                  onClick={() => !autoPlay && setStepIdx(i)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    background: i === stepIdx ? PHASE_BG[s.phase] : 'transparent',
                    cursor: autoPlay ? 'default' : 'pointer',
                    transition: 'background 0.2s',
                    opacity: i > stepIdx ? 0.4 : 1,
                  }}
                >
                  <div
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background:
                        i < stepIdx
                          ? '#10b981'
                          : i === stepIdx
                          ? PHASE_COLORS[s.phase]
                          : 'var(--border-2)',
                      flexShrink: 0,
                    }}
                  />
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '10px',
                      color: i === stepIdx ? PHASE_COLORS[s.phase] : 'var(--text-secondary)',
                      fontWeight: i === stepIdx ? 600 : 400,
                    }}
                  >
                    {s.nodeId} · {s.phase === 'beginWork' ? 'begin' : 'complete'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* performUnitOfWork 슈도코드 */}
      <div className="card mt-4">
        <div className="card-title">Work Loop 핵심 로직 — Sync vs Concurrent</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          {/* Sync */}
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: '#ef4444', fontWeight: 700, marginBottom: '8px', padding: '4px 8px', background: 'rgba(239,68,68,0.1)', borderRadius: '4px', display: 'inline-block' }}>performSyncWorkOnRoot</div>
            <div className="code-block" style={{ fontSize: '11px', lineHeight: 1.9 }}>
              <div><span className="code-keyword">function</span> <span className="code-function">workLoopSync</span><span className="code-punc">() {'{'}</span></div>
              <div style={{ paddingLeft: '16px' }}><span className="code-comment">{'// shouldYield 없음! 완료까지 블로킹'}</span></div>
              <div style={{ paddingLeft: '16px' }}><span className="code-keyword">while</span> (workInProgress !== <span className="code-number">null</span>) {'{'}</div>
              <div style={{ paddingLeft: '32px' }}><span className="code-function">performUnitOfWork</span>(wip);</div>
              <div style={{ paddingLeft: '16px' }}>{'}'}</div>
              <div>{'}'}</div>
              <div style={{ marginTop: '10px' }}><span className="code-comment">{'// 진입점: scheduleUpdateOnFiber →'}</span></div>
              <div><span className="code-comment">{'// performSyncWorkOnRoot → workLoopSync'}</span></div>
              <div style={{ marginTop: '6px', color: '#ef4444', fontSize: '11px' }}><span className="code-comment">{'// 사용: flushSync, legacy ReactDOM.render'}</span></div>
            </div>
          </div>
          {/* Concurrent */}
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: '#06b6d4', fontWeight: 700, marginBottom: '8px', padding: '4px 8px', background: 'rgba(6,182,212,0.1)', borderRadius: '4px', display: 'inline-block' }}>performConcurrentWorkOnRoot</div>
            <div className="code-block" style={{ fontSize: '11px', lineHeight: 1.9 }}>
              <div><span className="code-keyword">function</span> <span className="code-function">workLoopConcurrent</span><span className="code-punc">() {'{'}</span></div>
              <div style={{ paddingLeft: '16px' }}><span className="code-keyword">while</span> (</div>
              <div style={{ paddingLeft: '32px' }}>workInProgress !== <span className="code-number">null</span> &&</div>
              <div style={{ paddingLeft: '32px', color: '#22c55e', fontWeight: 700 }}>!<span className="code-function">shouldYield</span>()   <span className="code-comment" style={{ fontWeight: 400 }}>{'// ← 핵심!'}</span></div>
              <div style={{ paddingLeft: '16px' }}>) {'{'}</div>
              <div style={{ paddingLeft: '32px' }}><span className="code-function">performUnitOfWork</span>(wip);</div>
              <div style={{ paddingLeft: '16px' }}>{'}'}</div>
              <div>{'}'}</div>
              <div style={{ marginTop: '6px', color: '#06b6d4', fontSize: '11px' }}><span className="code-comment">{'// 사용: createRoot, startTransition'}</span></div>
            </div>
          </div>
        </div>
        {/* 분기 로직 */}
        <div style={{ marginTop: '14px' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '8px' }}>진입 분기 (ReactFiberWorkLoop.js)</div>
          <div className="code-block" style={{ fontSize: '11px', lineHeight: 1.9 }}>
            <div><span className="code-keyword">function</span> <span className="code-function">performConcurrentWorkOnRoot</span><span className="code-punc">(root) {'{'}</span></div>
            <div style={{ paddingLeft: '20px' }}><span className="code-keyword">const</span> lanes = <span className="code-function">getNextLanes</span>(root, root.pingedLanes);</div>
            <div style={{ paddingLeft: '20px' }}><span className="code-comment">{'// SyncLane이면 동기 경로 사용'}</span></div>
            <div style={{ paddingLeft: '20px' }}><span className="code-keyword">if</span> (<span className="code-function">includesSomeLane</span>(lanes, SyncLane)) {'{'}</div>
            <div style={{ paddingLeft: '40px' }}><span className="code-keyword">return</span> <span className="code-function">performSyncWorkOnRoot</span>(root);</div>
            <div style={{ paddingLeft: '20px' }}>{'}'}</div>
            <div style={{ paddingLeft: '20px' }}><span className="code-keyword">const</span> exitStatus = <span className="code-function">renderRootConcurrent</span>(root, lanes);</div>
            <div style={{ paddingLeft: '20px' }}><span className="code-comment">{'// shouldYield로 중단됐으면 null 반환 → 재스케줄'}</span></div>
            <div style={{ paddingLeft: '20px' }}><span className="code-keyword">if</span> (exitStatus === RootInProgress) <span className="code-keyword">return</span> performConcurrentWorkOnRoot.bind(<span className="code-number">null</span>, root);</div>
            <div style={{ paddingLeft: '20px' }}><span className="code-function">finishConcurrentRender</span>(root, exitStatus, lanes);</div>
            <div>{'}'}</div>
          </div>
        </div>
      </div>

      <SummaryBox
        items={[
          'Work Loop는 workInProgress가 null이 될 때까지 performUnitOfWork를 반복 호출합니다.',
          'beginWork: 현재 Fiber를 처리하고 자식 Fiber를 반환합니다 (트리 하강). 컴포넌트 함수를 실행합니다.',
          'completeWork: 자식이 없을 때 실행됩니다. 실제 DOM 노드를 생성하고 부모로 이동합니다 (트리 상승).',
          'workLoopSync vs workLoopConcurrent: SyncLane 여부에 따라 진입 경로가 분기됩니다. Concurrent는 shouldYield() 체크로 5ms마다 중단 가능합니다.',
          'performConcurrentWorkOnRoot: SyncLane이면 동기 경로 사용. 중단 시 자신을 다시 scheduleCallback에 등록하여 재개합니다.',
          'DFS(깊이 우선) 순회: App→div→Header→(complete)→main→p→"Hello"→(complete 역순) 순서입니다.',
        ]}
      />
    </div>
  );
}
