import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChapterHeader, SummaryBox } from '../components/shared';

type SubPhase = 'beforeMutation' | 'mutation' | 'layout';

interface CommitNode {
  id: string;
  label: string;
  flag: string;
  flagColor: string;
  action: string;
  domEffect?: string;
  lifecycle?: string;
}

interface PhaseConfig {
  id: SubPhase;
  label: string;
  color: string;
  bg: string;
  description: string;
  subtitle: string;
  nodes: CommitNode[];
  domPreview: string[];
}

const PHASES: PhaseConfig[] = [
  {
    id: 'beforeMutation',
    label: 'Before Mutation',
    color: '#a78bfa',
    bg: 'rgba(124,58,237,0.08)',
    subtitle: '1단계: DOM 변경 전 스냅샷',
    description:
      'DOM을 변경하기 전 단계입니다. getSnapshotBeforeUpdate 생명주기가 실행되어 변경 전 DOM 상태(스크롤 위치 등)를 캡처합니다. useEffect cleanup 함수 예약도 이 시점에 됩니다.',
    nodes: [
      {
        id: 'bm-counter',
        label: 'Counter',
        flag: 'Snapshot',
        flagColor: '#a78bfa',
        action: 'getSnapshotBeforeUpdate(prevProps, prevState)',
        lifecycle: 'getSnapshotBeforeUpdate',
      },
      {
        id: 'bm-list',
        label: 'List',
        flag: 'Snapshot',
        flagColor: '#a78bfa',
        action: 'getSnapshotBeforeUpdate → scrollTop 캡처',
        lifecycle: 'getSnapshotBeforeUpdate',
      },
    ],
    domPreview: [
      '📸 DOM 스냅샷 캡처 중...',
      'counter.scrollTop = 0 (캡처)',
      'list.scrollTop = 240 (캡처)',
      '⚡ DOM 아직 변경되지 않음',
    ],
  },
  {
    id: 'mutation',
    label: 'Mutation',
    color: '#f59e0b',
    bg: 'rgba(245,158,11,0.08)',
    subtitle: '2단계: 실제 DOM 변경',
    description:
      '실제 DOM을 변경하는 단계입니다. 이전 렌더의 useEffect cleanup이 실행되고, 새 DOM 노드가 삽입(appendChild)되거나 제거(removeChild)됩니다. textContent 업데이트, style 변경 등이 여기서 일어납니다.',
    nodes: [
      {
        id: 'mut-p',
        label: '<p>',
        flag: 'Update',
        flagColor: '#f59e0b',
        action: 'p.textContent = "1개" (이전: "0개")',
        domEffect: 'textContent 업데이트',
      },
      {
        id: 'mut-newitem',
        label: '<li key="D">',
        flag: 'Placement',
        flagColor: '#10b981',
        action: 'list.appendChild(newLiElement)',
        domEffect: 'appendChild',
      },
      {
        id: 'mut-olditem',
        label: '<li key="C">',
        flag: 'Deletion',
        flagColor: '#ef4444',
        action: 'list.removeChild(liC)',
        domEffect: 'removeChild',
      },
    ],
    domPreview: [
      '🔧 DOM 변경 적용 중...',
      'useEffect cleanup 실행',
      'p.textContent: "0개" → "1개"',
      'list.appendChild(<li>D</li>)',
      'list.removeChild(<li>C</li>)',
      '✅ DOM 변경 완료',
    ],
  },
  {
    id: 'layout',
    label: 'Layout',
    color: '#06b6d4',
    bg: 'rgba(6,182,212,0.08)',
    subtitle: '3단계: 레이아웃 이후 훅 실행',
    description:
      'DOM 변경이 완료된 후, 브라우저가 paint하기 전에 동기적으로 실행됩니다. useLayoutEffect와 componentDidMount/componentDidUpdate가 실행됩니다. 이 시점에 DOM 크기/위치를 읽어도 안전합니다.',
    nodes: [
      {
        id: 'lay-app',
        label: 'App',
        flag: 'LayoutEffect',
        flagColor: '#06b6d4',
        action: 'useLayoutEffect(() => { ... }) 실행',
        lifecycle: 'useLayoutEffect',
      },
      {
        id: 'lay-counter',
        label: 'Counter',
        flag: 'Update',
        flagColor: '#06b6d4',
        action: 'componentDidUpdate(prevProps, prevState, snapshot)',
        lifecycle: 'componentDidUpdate',
      },
      {
        id: 'lay-new',
        label: '<li key="D">',
        flag: 'Placement',
        flagColor: '#10b981',
        action: 'componentDidMount() 실행',
        lifecycle: 'componentDidMount',
      },
    ],
    domPreview: [
      '🎯 브라우저 paint 직전...',
      'useLayoutEffect 실행',
      'counter.getBoundingClientRect() 가능',
      'componentDidUpdate 실행',
      'componentDidMount 실행',
      '🖥️ 브라우저 paint → 화면 갱신!',
      '⏱️ useEffect 비동기 예약됨',
    ],
  },
];

function DomPreview({ lines, color }: { lines: string[]; color: string }) {
  return (
    <div
      style={{
        background: 'var(--bg)',
        border: `1px solid ${color}40`,
        borderRadius: 'var(--radius)',
        padding: '16px',
        fontFamily: 'var(--font-mono)',
        fontSize: '12px',
        lineHeight: 2,
      }}
    >
      <div
        style={{
          fontSize: '10px',
          color: color,
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          marginBottom: '10px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
        }}
      >
        <span
          style={{
            display: 'inline-block',
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: color,
          }}
        />
        DOM Preview
      </div>
      <AnimatePresence>
        {lines.map((line, i) => (
          <motion.div
            key={`${line}-${i}`}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            style={{ color: line.startsWith('✅') || line.startsWith('🖥️') ? color : 'var(--text-secondary)' }}
          >
            {line}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

interface CommitNodeCardProps {
  node: CommitNode;
  delay: number;
  phaseColor: string;
}

function CommitNodeCard({ node, delay, phaseColor }: CommitNodeCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      style={{
        background: 'var(--surface-2)',
        border: `1px solid ${node.flagColor}60`,
        borderLeft: `3px solid ${node.flagColor}`,
        borderRadius: 'var(--radius)',
        padding: '14px 16px',
        marginBottom: '10px',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
        <div
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '13px',
            fontWeight: 700,
            color: '#e2e8f0',
          }}
        >
          {node.label}
        </div>
        <div
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '10px',
            fontWeight: 700,
            color: node.flagColor,
            background: `${node.flagColor}20`,
            padding: '2px 8px',
            borderRadius: '4px',
            border: `1px solid ${node.flagColor}40`,
          }}
        >
          {node.flag}
        </div>
      </div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11.5px', color: phaseColor, marginBottom: '4px' }}>
        {node.action}
      </div>
      {(node.domEffect || node.lifecycle) && (
        <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
          {node.domEffect && `DOM: ${node.domEffect}`}
          {node.lifecycle && `생명주기: ${node.lifecycle}`}
        </div>
      )}
    </motion.div>
  );
}

export function Chapter5() {
  const [phaseIdx, setPhaseIdx] = useState(0);

  const phase = PHASES[phaseIdx];

  // 전체 commit phase 흐름 다이어그램
  const phaseFlow = [
    { label: 'before\nMutation', color: '#a78bfa', active: phaseIdx === 0 },
    { label: 'mutation', color: '#f59e0b', active: phaseIdx === 1 },
    { label: 'layout', color: '#06b6d4', active: phaseIdx === 2 },
  ];

  return (
    <div>
      <ChapterHeader
        number={6}
        title="Commit Phase"
        titleHighlight="3단계"
        description="Render Phase가 완료된 workInProgress 트리를 실제 DOM에 반영하는 Commit Phase를 세 서브페이즈로 나누어 살펴봅니다."
      />

      {/* 페이즈 플로우 다이어그램 */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0',
          marginBottom: '24px',
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          padding: '20px 24px',
        }}
      >
        <div
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            color: 'var(--text-secondary)',
            marginRight: '20px',
            flexShrink: 0,
          }}
        >
          commit
          <br />
          Root
        </div>
        {phaseFlow.map((pf, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
            <div
              onClick={() => setPhaseIdx(i)}
              style={{
                flex: 1,
                padding: '12px',
                borderRadius: 'var(--radius)',
                background: pf.active ? `${pf.color}15` : 'var(--surface-2)',
                border: `${pf.active ? 2 : 1}px solid ${pf.active ? pf.color : 'var(--border)'}`,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                textAlign: 'center',
                boxShadow: pf.active ? `0 0 20px ${pf.color}30` : 'none',
              }}
            >
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '12px',
                  fontWeight: 700,
                  color: pf.active ? pf.color : 'var(--text-secondary)',
                  whiteSpace: 'pre',
                  lineHeight: 1.5,
                }}
              >
                {pf.label}
              </div>
              {pf.active && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={{
                    marginTop: '4px',
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: pf.color,
                    margin: '4px auto 0',
                    boxShadow: `0 0 8px ${pf.color}`,
                  }}
                />
              )}
            </div>
            {i < 2 && (
              <div
                style={{
                  width: '32px',
                  height: '2px',
                  background: `linear-gradient(90deg, ${phaseFlow[i].color}, ${phaseFlow[i + 1].color})`,
                  opacity: 0.4,
                }}
              />
            )}
          </div>
        ))}
        <div
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            color: 'var(--text-secondary)',
            marginLeft: '20px',
            flexShrink: 0,
          }}
        >
          → useEffect
          <br />
          비동기 실행
        </div>
      </div>

      {/* 현재 페이즈 상세 */}
      <AnimatePresence mode="wait">
        <motion.div
          key={phaseIdx}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.25 }}
        >
          {/* 페이즈 헤더 */}
          <div
            style={{
              background: phase.bg,
              border: `1px solid ${phase.color}40`,
              borderRadius: 'var(--radius)',
              padding: '16px 20px',
              marginBottom: '16px',
            }}
          >
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '13px',
                fontWeight: 700,
                color: phase.color,
                marginBottom: '6px',
              }}
            >
              {phase.subtitle}
            </div>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
              {phase.description}
            </div>
          </div>

          {/* 2열 레이아웃: 처리 노드 + DOM 프리뷰 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {/* 처리 노드 목록 */}
            <div>
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '10px',
                  fontWeight: 700,
                  color: 'var(--text-secondary)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  marginBottom: '12px',
                }}
              >
                이 페이즈에서 처리되는 Fiber 노드들
              </div>
              {phase.nodes.map((node, i) => (
                <CommitNodeCard key={node.id} node={node} delay={i * 0.1} phaseColor={phase.color} />
              ))}
            </div>

            {/* DOM 프리뷰 */}
            <div>
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '10px',
                  fontWeight: 700,
                  color: 'var(--text-secondary)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  marginBottom: '12px',
                }}
              >
                실행 순서 / DOM 변경
              </div>
              <DomPreview lines={phase.domPreview} color={phase.color} />
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* 네비게이션 버튼 */}
      <div style={{ display: 'flex', gap: '10px', marginTop: '20px', justifyContent: 'center' }}>
        <button
          className="btn btn-secondary"
          onClick={() => setPhaseIdx((i) => Math.max(i - 1, 0))}
          disabled={phaseIdx === 0}
        >
          ← 이전 페이즈
        </button>
        <button
          className="btn btn-primary"
          onClick={() => setPhaseIdx((i) => Math.min(i + 1, PHASES.length - 1))}
          disabled={phaseIdx >= PHASES.length - 1}
        >
          다음 페이즈 →
        </button>
      </div>

      {/* useEffect vs useLayoutEffect 비교 */}
      <div className="card mt-6">
        <div className="card-title">useLayoutEffect vs useEffect 타이밍</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div>
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '12px',
                color: '#06b6d4',
                fontWeight: 700,
                marginBottom: '10px',
              }}
            >
              useLayoutEffect
            </div>
            <div
              style={{
                background: 'var(--bg)',
                border: '1px solid rgba(6,182,212,0.3)',
                borderRadius: 'var(--radius)',
                padding: '12px',
                fontSize: '12px',
                color: 'var(--text-secondary)',
                lineHeight: 1.8,
              }}
            >
              <div>✦ DOM 변경 직후, paint 이전 실행</div>
              <div>✦ <strong style={{ color: 'var(--text)' }}>동기적</strong> 실행 (blocking)</div>
              <div>✦ DOM 측정/조작에 적합</div>
              <div>✦ 남용하면 페인트 지연 발생</div>
              <div style={{ marginTop: '8px', color: '#06b6d4' }}>
                layout phase에서 실행
              </div>
            </div>
          </div>
          <div>
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '12px',
                color: '#10b981',
                fontWeight: 700,
                marginBottom: '10px',
              }}
            >
              useEffect
            </div>
            <div
              style={{
                background: 'var(--bg)',
                border: '1px solid rgba(16,185,129,0.3)',
                borderRadius: 'var(--radius)',
                padding: '12px',
                fontSize: '12px',
                color: 'var(--text-secondary)',
                lineHeight: 1.8,
              }}
            >
              <div>✦ 브라우저 paint 완료 후 실행</div>
              <div>✦ <strong style={{ color: 'var(--text)' }}>비동기적</strong> 실행 (non-blocking)</div>
              <div>✦ 데이터 fetch, 이벤트 구독에 적합</div>
              <div>✦ 대부분의 경우 이것을 사용</div>
              <div style={{ marginTop: '8px', color: '#10b981' }}>
                commit 완료 후 scheduler에 의해 실행
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* React Lifecycle 타임라인 */}
      <div className="card mt-4">
        <div className="card-title">전체 Commit Phase 타임라인</div>
        <div style={{ position: 'relative', padding: '16px 0' }}>
          {[
            { time: 'T0', label: 'commitRoot 호출', color: '#a78bfa', desc: 'workInProgress 트리의 root부터 순회 시작' },
            { time: 'T1', label: 'beforeMutation 순회', color: '#a78bfa', desc: 'getSnapshotBeforeUpdate, useEffect cleanup 예약' },
            { time: 'T2', label: 'mutation 순회', color: '#f59e0b', desc: 'appendChild, removeChild, textContent 등 실제 DOM 변경' },
            { time: 'T3', label: 'current ↔ wip 포인터 교체', color: '#f59e0b', desc: 'workInProgress가 new current가 됨' },
            { time: 'T4', label: 'layout 순회', color: '#06b6d4', desc: 'useLayoutEffect, componentDidMount/Update 실행' },
            { time: 'T5', label: '브라우저 paint', color: '#10b981', desc: '사용자가 변경된 화면을 보게 됨' },
            { time: 'T6', label: 'useEffect 실행', color: '#10b981', desc: '비동기적으로 스케줄된 useEffect들 실행' },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06 }}
              style={{
                display: 'flex',
                gap: '12px',
                alignItems: 'flex-start',
                marginBottom: '10px',
              }}
            >
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '10px',
                  color: item.color,
                  fontWeight: 700,
                  minWidth: '28px',
                  paddingTop: '2px',
                }}
              >
                {item.time}
              </div>
              <div
                style={{
                  width: '2px',
                  alignSelf: 'stretch',
                  background: item.color,
                  opacity: 0.4,
                  borderRadius: '1px',
                  minHeight: '28px',
                }}
              />
              <div>
                <div
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: item.color,
                    marginBottom: '2px',
                  }}
                >
                  {item.label}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{item.desc}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <SummaryBox
        items={[
          'Commit Phase는 동기적으로 실행됩니다. 중간에 중단할 수 없습니다 (Render Phase와 다름).',
          'beforeMutation: DOM 변경 전 스냅샷. getSnapshotBeforeUpdate로 스크롤 위치 등을 저장합니다.',
          'mutation: 실제 DOM 조작. appendChild, removeChild, textContent 업데이트가 여기서 일어납니다.',
          'layout: DOM 변경 후, paint 전. useLayoutEffect와 componentDidMount/Update가 동기 실행됩니다.',
          'commit 완료 후 current ↔ workInProgress 역할이 교체되고, useEffect가 비동기 스케줄됩니다.',
        ]}
      />
    </div>
  );
}
