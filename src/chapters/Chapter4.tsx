import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChapterHeader, SummaryBox } from '../components/shared';

type DiffStatus = 'unchanged' | 'modified' | 'added' | 'deleted' | 'keyed-move';


const NODE_W = 140;
const NODE_H = 56;

// ---- State A: 초기 렌더 ----
const stateA = {
  label: '초기 상태 (count=0)',
  current: [
    { id: 'ca-app', label: 'App', x: 120, y: 20, statusCurrent: 'unchanged' as DiffStatus, statusWip: 'unchanged' as DiffStatus },
    { id: 'ca-counter', label: 'Counter\ncount=0', x: 0, y: 130, statusCurrent: 'unchanged' as DiffStatus, statusWip: 'unchanged' as DiffStatus },
    { id: 'ca-btn', label: '버튼', x: 240, y: 130, statusCurrent: 'unchanged' as DiffStatus, statusWip: 'unchanged' as DiffStatus },
    { id: 'ca-p', label: '<p> "0개"', x: 0, y: 240, statusCurrent: 'unchanged' as DiffStatus, statusWip: 'unchanged' as DiffStatus },
  ],
  wip: [
    { id: 'wa-app', label: 'App', x: 120, y: 20, statusCurrent: 'unchanged' as DiffStatus, statusWip: 'unchanged' as DiffStatus },
    { id: 'wa-counter', label: 'Counter\ncount=0', x: 0, y: 130, statusCurrent: 'unchanged' as DiffStatus, statusWip: 'unchanged' as DiffStatus },
    { id: 'wa-btn', label: '버튼', x: 240, y: 130, statusCurrent: 'unchanged' as DiffStatus, statusWip: 'unchanged' as DiffStatus },
    { id: 'wa-p', label: '<p> "0개"', x: 0, y: 240, statusCurrent: 'unchanged' as DiffStatus, statusWip: 'unchanged' as DiffStatus },
  ],
  alternates: [
    ['ca-app', 'wa-app'],
    ['ca-counter', 'wa-counter'],
    ['ca-btn', 'wa-btn'],
    ['ca-p', 'wa-p'],
  ] as [string, string][],
  description: '초기 렌더: current tree와 workInProgress tree가 동일한 상태입니다.',
};

// ---- State B: setState 후 diffing ----
const stateB = {
  label: 'setState 후 (count=1)',
  current: [
    { id: 'cb-app', label: 'App', x: 120, y: 20, statusCurrent: 'unchanged' as DiffStatus, statusWip: 'unchanged' as DiffStatus },
    { id: 'cb-counter', label: 'Counter\ncount=0', x: 0, y: 130, statusCurrent: 'unchanged' as DiffStatus, statusWip: 'unchanged' as DiffStatus },
    { id: 'cb-btn', label: '버튼', x: 240, y: 130, statusCurrent: 'unchanged' as DiffStatus, statusWip: 'unchanged' as DiffStatus },
    { id: 'cb-p', label: '<p> "0개"', x: 0, y: 240, statusCurrent: 'unchanged' as DiffStatus, statusWip: 'unchanged' as DiffStatus },
  ],
  wip: [
    { id: 'wb-app', label: 'App', x: 120, y: 20, statusCurrent: 'unchanged' as DiffStatus, statusWip: 'unchanged' as DiffStatus },
    { id: 'wb-counter', label: 'Counter\ncount=1', x: 0, y: 130, statusCurrent: 'unchanged' as DiffStatus, statusWip: 'modified' as DiffStatus },
    { id: 'wb-btn', label: '버튼', x: 240, y: 130, statusCurrent: 'unchanged' as DiffStatus, statusWip: 'unchanged' as DiffStatus },
    { id: 'wb-p', label: '<p> "1개"', x: 0, y: 240, statusCurrent: 'unchanged' as DiffStatus, statusWip: 'modified' as DiffStatus },
  ],
  alternates: [
    ['cb-app', 'wb-app'],
    ['cb-counter', 'wb-counter'],
    ['cb-btn', 'wb-btn'],
    ['cb-p', 'wb-p'],
  ] as [string, string][],
  description: 'setState(1) 호출 후: Counter와 p의 내용이 변경됩니다. 변경된 Fiber는 Update 플래그를 받습니다.',
};

// ---- State C: 리스트 key diffing ----
const stateC = {
  label: '키 기반 리스트 변경',
  current: [
    { id: 'cc-list', label: 'List', x: 100, y: 20, statusCurrent: 'unchanged' as DiffStatus, statusWip: 'unchanged' as DiffStatus },
    { id: 'cc-a', label: 'Item key="A"', x: 0, y: 130, statusCurrent: 'unchanged' as DiffStatus, statusWip: 'unchanged' as DiffStatus },
    { id: 'cc-b', label: 'Item key="B"', x: 160, y: 130, statusCurrent: 'unchanged' as DiffStatus, statusWip: 'unchanged' as DiffStatus },
    { id: 'cc-c', label: 'Item key="C"', x: 0, y: 240, statusCurrent: 'deleted' as DiffStatus, statusWip: 'unchanged' as DiffStatus },
  ],
  wip: [
    { id: 'wc-list', label: 'List', x: 100, y: 20, statusCurrent: 'unchanged' as DiffStatus, statusWip: 'unchanged' as DiffStatus },
    { id: 'wc-b', label: 'Item key="B"', x: 0, y: 130, statusCurrent: 'unchanged' as DiffStatus, statusWip: 'keyed-move' as DiffStatus },
    { id: 'wc-a', label: 'Item key="A"', x: 160, y: 130, statusCurrent: 'unchanged' as DiffStatus, statusWip: 'keyed-move' as DiffStatus },
    { id: 'wc-d', label: 'Item key="D"', x: 0, y: 240, statusCurrent: 'unchanged' as DiffStatus, statusWip: 'added' as DiffStatus },
  ],
  alternates: [
    ['cc-list', 'wc-list'],
    ['cc-a', 'wc-a'],
    ['cc-b', 'wc-b'],
  ] as [string, string][],
  description: 'key 기반 diffing: key="B"는 이동, key="C"는 삭제, key="D"는 새로 추가됩니다. key가 없으면 순서 기반으로만 비교합니다.',
};

const SCENARIOS = [stateA, stateB, stateC];

const STATUS_COLORS: Record<DiffStatus, string> = {
  unchanged: 'var(--border-2)',
  modified: '#f59e0b',
  added: '#10b981',
  deleted: '#ef4444',
  'keyed-move': '#06b6d4',
};

const STATUS_BG: Record<DiffStatus, string> = {
  unchanged: 'var(--surface-2)',
  modified: 'rgba(245,158,11,0.08)',
  added: 'rgba(16,185,129,0.08)',
  deleted: 'rgba(239,68,68,0.08)',
  'keyed-move': 'rgba(6,182,212,0.08)',
};

const STATUS_LABELS: Record<DiffStatus, string> = {
  unchanged: '변경없음',
  modified: '수정됨 (Update)',
  added: '추가됨 (Placement)',
  deleted: '삭제됨 (Deletion)',
  'keyed-move': '이동됨 (key 매칭)',
};

interface TreeSVGProps {
  nodes: typeof stateA.current;
  title: string;
  titleColor: string;
  showAlternate?: boolean;
  alternates?: [string, string][];
  offsetX?: number;
}

function TreeSVG({ nodes, title, titleColor, offsetX = 0 }: TreeSVGProps) {
  const SVG_W = 400;
  const SVG_H = 340;

  // build edges based on depth
  const nodeMap: Record<string, (typeof nodes)[0]> = {};
  nodes.forEach((n) => (nodeMap[n.id] = n));

  // simple edges: connect by y proximity
  const edges: { from: (typeof nodes)[0]; to: (typeof nodes)[0] }[] = [];
  // depth 0→1: parent is y=20, children are y=130
  const roots = nodes.filter((n) => n.y === 20);
  const depth1 = nodes.filter((n) => n.y === 130);
  const depth2 = nodes.filter((n) => n.y === 240);

  roots.forEach((r) => {
    depth1.forEach((c) => {
      edges.push({ from: r, to: c });
    });
  });
  depth1.forEach((p) => {
    // connect to depth2 nodes that are "under" p
    depth2.forEach((c) => {
      if (Math.abs(c.x - p.x) < 100) {
        edges.push({ from: p, to: c });
      }
    });
  });

  return (
    <div style={{ flex: 1 }}>
      <div
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '11px',
          fontWeight: 700,
          color: titleColor,
          marginBottom: '8px',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          textAlign: 'center',
        }}
      >
        {title}
      </div>
      <svg
        width="100%"
        height={SVG_H}
        viewBox={`-10 0 ${SVG_W} ${SVG_H}`}
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <marker id={`da-${offsetX}`} markerWidth="7" markerHeight="7" refX="6" refY="3" orient="auto">
            <path d="M0,0 L0,6 L7,3 z" fill="var(--border-2)" />
          </marker>
        </defs>

        {/* 엣지 */}
        {edges.map((e, i) => {
          const sx = e.from.x + NODE_W / 2;
          const sy = e.from.y + NODE_H;
          const ex = e.to.x + NODE_W / 2;
          const ey = e.to.y;
          const mid = (sy + ey) / 2;
          return (
            <path
              key={i}
              d={`M ${sx} ${sy} C ${sx} ${mid} ${ex} ${mid} ${ex} ${ey}`}
              stroke="var(--border-2)"
              strokeWidth="1.5"
              fill="none"
              markerEnd={`url(#da-${offsetX})`}
              opacity="0.4"
            />
          );
        })}

        {/* 노드들 */}
        {nodes.map((node, i) => {
          const status = title.includes('current') || title.includes('Current')
            ? node.statusCurrent
            : node.statusWip;
          const color = STATUS_COLORS[status];
          const bg = STATUS_BG[status];

          return (
            <motion.g
              key={node.id}
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: status === 'deleted' ? 0.4 : 1, scale: 1 }}
              transition={{ delay: i * 0.07 }}
            >
              <rect
                x={node.x}
                y={node.y}
                width={NODE_W}
                height={NODE_H}
                rx="8"
                fill={bg}
                stroke={color}
                strokeWidth={status !== 'unchanged' ? 2 : 1}
              />
              {status !== 'unchanged' && (
                <motion.rect
                  x={node.x - 3}
                  y={node.y - 3}
                  width={NODE_W + 6}
                  height={NODE_H + 6}
                  rx="11"
                  fill={color}
                  opacity="0.1"
                  animate={{ opacity: [0.1, 0.22, 0.1] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                />
              )}
              {/* 멀티라인 텍스트 */}
              {node.label.split('\n').map((line, li) => (
                <text
                  key={li}
                  x={node.x + NODE_W / 2}
                  y={node.y + 22 + li * 16}
                  textAnchor="middle"
                  fontSize={li === 0 ? '13' : '11'}
                  fontWeight={li === 0 ? '700' : '400'}
                  fill={status !== 'unchanged' ? color : '#e2e8f0'}
                  fontFamily="var(--font-mono)"
                >
                  {line}
                </text>
              ))}
              {/* 상태 배지 */}
              {status !== 'unchanged' && (
                <text
                  x={node.x + NODE_W - 4}
                  y={node.y + 12}
                  textAnchor="end"
                  fontSize="9"
                  fill={color}
                  fontFamily="var(--font-mono)"
                  fontWeight="700"
                >
                  {status === 'modified' ? 'UPD' : status === 'added' ? 'NEW' : status === 'deleted' ? 'DEL' : 'MOV'}
                </text>
              )}
            </motion.g>
          );
        })}
      </svg>
    </div>
  );
}

export function Chapter4() {
  const [scenarioIdx, setScenarioIdx] = useState(0);
  const [showAlternate, setShowAlternate] = useState(true);

  const scenario = SCENARIOS[scenarioIdx];

  return (
    <div>
      <ChapterHeader
        number={5}
        title="Reconciliation"
        titleHighlight="(Diffing)"
        description="React가 state 변경 시 현재 Fiber Tree(current)와 새 Tree(workInProgress)를 어떻게 비교하는지 시각화합니다. key 기반 매칭과 Fiber 재사용 원리를 이해합니다."
      />

      {/* 시나리오 탭 */}
      <div className="tabs">
        {SCENARIOS.map((s, i) => (
          <button
            key={i}
            className={`tab ${scenarioIdx === i ? 'active' : ''}`}
            onClick={() => setScenarioIdx(i)}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* 설명 */}
      <AnimatePresence mode="wait">
        <motion.div
          key={scenarioIdx}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.2 }}
          style={{
            background: 'rgba(124,58,237,0.06)',
            border: '1px solid rgba(124,58,237,0.2)',
            borderRadius: 'var(--radius)',
            padding: '12px 16px',
            marginBottom: '16px',
            fontSize: '13px',
            color: 'var(--text-secondary)',
            lineHeight: 1.7,
          }}
        >
          💡 {scenario.description}
        </motion.div>
      </AnimatePresence>

      {/* 범례 */}
      <div
        style={{
          display: 'flex',
          gap: '16px',
          marginBottom: '12px',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {(Object.entries(STATUS_LABELS) as [DiffStatus, string][]).map(([status, label]) => (
            <div key={status} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div
                style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '2px',
                  background: STATUS_COLORS[status],
                  opacity: status === 'unchanged' ? 0.4 : 1,
                }}
              />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-secondary)' }}>
                {label}
              </span>
            </div>
          ))}
        </div>
        <button
          className={`btn ${showAlternate ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setShowAlternate((v) => !v)}
          style={{ fontSize: '11px', padding: '5px 10px' }}
        >
          alternate 링크 {showAlternate ? '숨기기' : '보기'}
        </button>
      </div>

      {/* 두 트리 나란히 */}
      <div className="card" style={{ position: 'relative', overflow: 'hidden' }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={scenarioIdx}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{ display: 'flex', gap: '0', alignItems: 'flex-start', position: 'relative' }}
          >
            <TreeSVG
              nodes={scenario.current}
              title="Current Tree (화면에 표시 중)"
              titleColor="#a78bfa"
              offsetX={0}
            />

            {/* 중앙 구분선 + alternate 링크 */}
            <div
              style={{
                width: '60px',
                flexShrink: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                paddingTop: '48px',
                gap: '4px',
                position: 'relative',
              }}
            >
              <div
                style={{
                  width: '1px',
                  height: '300px',
                  background: 'var(--border)',
                  position: 'absolute',
                  top: '20px',
                }}
              />
              {showAlternate &&
                scenario.alternates.map(([cId, wId], i) => {
                  const cNode = scenario.current.find((n) => n.id === cId);
                  const wNode = scenario.wip.find((n) => n.id === wId);
                  if (!cNode || !wNode) return null;
                  const y = cNode.y + NODE_H / 2;
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scaleX: 0 }}
                      animate={{ opacity: 1, scaleX: 1 }}
                      exit={{ opacity: 0 }}
                      style={{
                        position: 'absolute',
                        top: `${y + 30}px`,
                        left: '-140px',
                        right: '-140px',
                        height: '1px',
                        background: 'linear-gradient(90deg, transparent, #7c3aed, transparent)',
                        opacity: 0.5,
                        zIndex: 2,
                      }}
                    >
                      <div
                        style={{
                          position: 'absolute',
                          top: '-8px',
                          left: '50%',
                          transform: 'translateX(-50%)',
                          fontFamily: 'var(--font-mono)',
                          fontSize: '8px',
                          color: '#7c3aed',
                          background: 'var(--surface)',
                          padding: '0 4px',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        alternate
                      </div>
                    </motion.div>
                  );
                })}
            </div>

            <TreeSVG
              nodes={scenario.wip}
              title="WorkInProgress Tree (새로 구성 중)"
              titleColor="#06b6d4"
              offsetX={500}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* key 기반 매칭 설명 */}
      <div className="card mt-4">
        <div className="card-title">key 기반 Reconciliation 원리</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                color: 'var(--danger)',
                marginBottom: '8px',
                fontWeight: 600,
              }}
            >
              key 없이 순서 기반 비교
            </div>
            <div className="code-block" style={{ fontSize: '11.5px', lineHeight: 1.8 }}>
              <div><span className="code-comment">{'// Old: [A, B, C]'}</span></div>
              <div><span className="code-comment">{'// New: [B, A, C]'}</span></div>
              <div><span className="code-comment">{'// → B를 A로 업데이트 (비효율!)'}</span></div>
              <div><span className="code-comment">{'// → A를 B로 업데이트'}</span></div>
              <div><span className="code-comment">{'// → C 유지'}</span></div>
              <div style={{ marginTop: '8px', color: 'var(--danger)' }}>3번 DOM 업데이트 발생</div>
            </div>
          </div>
          <div>
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                color: 'var(--success)',
                marginBottom: '8px',
                fontWeight: 600,
              }}
            >
              key 기반 비교
            </div>
            <div className="code-block" style={{ fontSize: '11.5px', lineHeight: 1.8 }}>
              <div><span className="code-comment">{'// Old: [A, B, C]'}</span></div>
              <div><span className="code-comment">{'// New: [B, A, C]'}</span></div>
              <div><span className="code-comment">{'// key="B" 매칭 → 이동만 수행'}</span></div>
              <div><span className="code-comment">{'// key="A" 매칭 → 이동만 수행'}</span></div>
              <div><span className="code-comment">{'// key="C" 매칭 → 변경없음'}</span></div>
              <div style={{ marginTop: '8px', color: 'var(--success)' }}>DOM 재사용, 효율적!</div>
            </div>
          </div>
        </div>
      </div>

      <SummaryBox
        items={[
          'Reconciliation은 React가 이전 Fiber(current)와 새 Element를 비교해 최소한의 DOM 변경을 계산하는 과정입니다.',
          'current와 workInProgress Fiber는 alternate 포인터로 서로를 참조합니다. 커밋 후 역할이 교체됩니다.',
          '같은 위치에 같은 type이면 Fiber를 재사용(업데이트). type이 다르면 이전 것을 삭제하고 새로 생성합니다.',
          'key prop은 리스트에서 React가 어떤 항목이 어떤 것과 대응하는지 파악하게 합니다. 이동, 삭제, 추가를 정확히 처리합니다.',
          '변경된 Fiber에는 flags(Update, Placement, Deletion 등)가 설정되어 commit phase에서 처리됩니다.',
        ]}
      />
    </div>
  );
}
