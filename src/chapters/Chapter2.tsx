import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChapterHeader, SummaryBox } from '../components/shared';

interface NodeDef {
  id: string;
  label: string;
  type: string;
  x: number;
  y: number;
  child?: string;
  sibling?: string;
  return: string | null;
  stateNode: string;
  flags: string;
  lanes: string;
}

const NODES: NodeDef[] = [
  {
    id: 'app',
    label: 'App',
    type: 'FunctionComponent',
    x: 320,
    y: 20,
    child: 'div',
    sibling: undefined,
    return: null,
    stateNode: 'null',
    flags: '0',
    lanes: '0',
  },
  {
    id: 'div',
    label: '<div>',
    type: 'HostComponent',
    x: 320,
    y: 130,
    child: 'header',
    sibling: undefined,
    return: 'app',
    stateNode: 'HTMLDivElement',
    flags: '0',
    lanes: '0',
  },
  {
    id: 'header',
    label: '<Header />',
    type: 'FunctionComponent',
    x: 120,
    y: 250,
    child: undefined,
    sibling: 'main',
    return: 'div',
    stateNode: 'null',
    flags: '0',
    lanes: '0',
  },
  {
    id: 'main',
    label: '<main>',
    type: 'HostComponent',
    x: 520,
    y: 250,
    child: 'p',
    sibling: undefined,
    return: 'div',
    stateNode: 'HTMLElement',
    flags: '0',
    lanes: '0',
  },
  {
    id: 'p',
    label: '<p>',
    type: 'HostComponent',
    x: 520,
    y: 370,
    child: 'text',
    sibling: undefined,
    return: 'main',
    stateNode: 'HTMLParagraphElement',
    flags: '0',
    lanes: '0',
  },
  {
    id: 'text',
    label: '"Hello"',
    type: 'HostText',
    x: 520,
    y: 490,
    child: undefined,
    sibling: undefined,
    return: 'p',
    stateNode: 'TextNode',
    flags: '0',
    lanes: '0',
  },
];

const NODE_W = 130;
const NODE_H = 52;

type ArrowType = 'child' | 'sibling' | 'return';

interface Arrow {
  from: NodeDef;
  to: NodeDef;
  type: ArrowType;
}

function buildArrows(): Arrow[] {
  const map: Record<string, NodeDef> = {};
  NODES.forEach((n) => (map[n.id] = n));
  const arrows: Arrow[] = [];
  NODES.forEach((n) => {
    if (n.child && map[n.child]) arrows.push({ from: n, to: map[n.child], type: 'child' });
    if (n.sibling && map[n.sibling]) arrows.push({ from: n, to: map[n.sibling], type: 'sibling' });
  });
  return arrows;
}

const ARROWS = buildArrows();

const ARROW_COLORS: Record<ArrowType, string> = {
  child: '#06b6d4',
  sibling: '#f59e0b',
  return: '#7c3aed',
};

const ARROW_LABELS: Record<ArrowType, string> = {
  child: 'child',
  sibling: 'sibling',
  return: 'return',
};

function computeArrowPath(from: NodeDef, to: NodeDef, type: ArrowType): string {
  const fx = from.x + NODE_W / 2;
  const fy = from.y + NODE_H / 2;
  const tx = to.x + NODE_W / 2;
  const ty = to.y + NODE_H / 2;

  if (type === 'child') {
    const startX = fx;
    const startY = from.y + NODE_H;
    const endX = tx;
    const endY = to.y;
    const mid = (startY + endY) / 2;
    return `M ${startX} ${startY} C ${startX} ${mid} ${endX} ${mid} ${endX} ${endY}`;
  }
  if (type === 'sibling') {
    const startX = from.x + NODE_W;
    const startY = fy;
    const endX = to.x;
    const endY = ty;
    const mid = (startX + endX) / 2;
    return `M ${startX} ${startY} C ${mid} ${startY} ${mid} ${endY} ${endX} ${endY}`;
  }
  return `M ${fx} ${fy} L ${tx} ${ty}`;
}

interface DetailPanelProps {
  node: NodeDef;
  onClose: () => void;
}

function DetailPanel({ node, onClose }: DetailPanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      style={{
        position: 'absolute',
        right: '16px',
        top: '16px',
        width: '240px',
        background: 'var(--surface-2)',
        border: '1px solid var(--secondary)',
        borderRadius: 'var(--radius-lg)',
        padding: '16px',
        boxShadow: '0 0 30px rgba(6,182,212,0.15)',
        zIndex: 10,
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '12px',
        }}
      >
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--secondary)', fontWeight: 700 }}>
          {node.label}
        </div>
        <button
          onClick={onClose}
          style={{ color: 'var(--text-secondary)', fontSize: '16px', lineHeight: 1, background: 'none', border: 'none', cursor: 'pointer' }}
        >
          ×
        </button>
      </div>
      {[
        { k: 'type', v: node.type },
        { k: 'stateNode', v: node.stateNode },
        { k: 'child', v: node.child ?? 'null' },
        { k: 'sibling', v: node.sibling ?? 'null' },
        { k: 'return', v: node.return ?? 'null' },
        { k: 'flags', v: node.flags },
        { k: 'lanes', v: node.lanes },
      ].map(({ k, v }) => (
        <div
          key={k}
          style={{
            display: 'flex',
            gap: '8px',
            marginBottom: '6px',
            alignItems: 'flex-start',
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              color: 'var(--text-muted)',
              minWidth: '72px',
              paddingTop: '1px',
            }}
          >
            {k}:
          </span>
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              color:
                k === 'type'
                  ? 'var(--secondary)'
                  : k === 'child' || k === 'sibling' || k === 'return'
                  ? '#a78bfa'
                  : 'var(--text)',
              wordBreak: 'break-all',
            }}
          >
            {v}
          </span>
        </div>
      ))}
    </motion.div>
  );
}

export function Chapter2() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showReturns, setShowReturns] = useState(false);

  const selectedNode = NODES.find((n) => n.id === selectedId) ?? null;

  const map: Record<string, NodeDef> = {};
  NODES.forEach((n) => (map[n.id] = n));

  const returnArrows: Arrow[] = NODES.filter((n) => n.return !== null).map((n) => ({
    from: n,
    to: map[n.return!],
    type: 'return' as ArrowType,
  }));

  const SVG_W = 740;
  const SVG_H = 580;

  return (
    <div>
      <ChapterHeader
        number={2}
        title="Fiber Tree"
        titleHighlight="구조"
        description="React 컴포넌트 트리가 어떻게 Fiber 노드들의 연결 리스트로 표현되는지 시각화합니다. child, sibling, return 포인터로 트리를 탐색합니다."
      />

      {/* 범례 & 컨트롤 */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px',
        }}
      >
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          {(['child', 'sibling', 'return'] as ArrowType[]).map((t) => (
            <div key={t} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div
                style={{
                  width: '24px',
                  height: '2px',
                  background: ARROW_COLORS[t],
                  borderRadius: '1px',
                }}
              />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-secondary)' }}>
                {ARROW_LABELS[t]}
              </span>
            </div>
          ))}
        </div>
        <button
          className={`btn ${showReturns ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setShowReturns((v) => !v)}
          style={{ fontSize: '12px', padding: '6px 12px' }}
        >
          return 포인터 {showReturns ? '숨기기' : '보기'}
        </button>
      </div>

      {/* 시각화 영역 */}
      <div
        className="card"
        style={{ position: 'relative', padding: '0', overflow: 'hidden', minHeight: `${SVG_H}px` }}
      >
        <svg
          width="100%"
          height={SVG_H}
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          preserveAspectRatio="xMidYMid meet"
          style={{ display: 'block' }}
        >
          <defs>
            {(['child', 'sibling', 'return'] as ArrowType[]).map((t) => (
              <marker
                key={t}
                id={`arrow-${t}`}
                markerWidth="8"
                markerHeight="8"
                refX="7"
                refY="3"
                orient="auto"
              >
                <path d="M0,0 L0,6 L8,3 z" fill={ARROW_COLORS[t]} />
              </marker>
            ))}
          </defs>

          {/* Child & Sibling 화살표 */}
          {ARROWS.map((a, i) => {
            const d = computeArrowPath(a.from, a.to, a.type);
            const pts = d.match(/[\d.]+/g);
            const midX = pts ? (parseFloat(pts[0]) + parseFloat(pts[pts.length - 2])) / 2 : 0;
            const midY = pts ? (parseFloat(pts[1]) + parseFloat(pts[pts.length - 1])) / 2 : 0;

            return (
              <g key={`arrow-${i}`}>
                <motion.path
                  d={d}
                  stroke={ARROW_COLORS[a.type]}
                  strokeWidth="1.5"
                  fill="none"
                  opacity="0.7"
                  markerEnd={`url(#arrow-${a.type})`}
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 0.7 }}
                  transition={{ duration: 0.6, delay: i * 0.1 }}
                />
                <text
                  x={midX}
                  y={midY - 4}
                  textAnchor="middle"
                  fontSize="10"
                  fill={ARROW_COLORS[a.type]}
                  opacity="0.8"
                  fontFamily="var(--font-mono)"
                >
                  {ARROW_LABELS[a.type]}
                </text>
              </g>
            );
          })}

          {/* Return 화살표 (토글) */}
          <AnimatePresence>
            {showReturns &&
              returnArrows.map((a, i) => {
                const fromCx = a.from.x + NODE_W / 2;
                const fromCy = a.from.y + NODE_H / 2;
                const toCx = a.to.x + NODE_W / 2;
                const toCy = a.to.y + NODE_H / 2;
                const offset = -45;
                const d = `M ${fromCx} ${fromCy} C ${fromCx + offset} ${fromCy} ${toCx + offset} ${toCy} ${toCx} ${toCy}`;

                return (
                  <motion.g
                    key={`ret-${a.from.id}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <path
                      d={d}
                      stroke={ARROW_COLORS['return']}
                      strokeWidth="1.5"
                      strokeDasharray="4 3"
                      fill="none"
                      opacity="0.6"
                      markerEnd="url(#arrow-return)"
                    />
                  </motion.g>
                );
              })}
          </AnimatePresence>

          {/* 노드들 */}
          {NODES.map((node, i) => {
            const isSelected = selectedId === node.id;
            const typeColor =
              node.type === 'FunctionComponent'
                ? '#a78bfa'
                : node.type === 'HostText'
                ? '#10b981'
                : '#06b6d4';

            return (
              <motion.g
                key={node.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.08 }}
                onClick={() => setSelectedId(isSelected ? null : node.id)}
                style={{ cursor: 'pointer' }}
              >
                {/* 노드 배경 */}
                <rect
                  x={node.x}
                  y={node.y}
                  width={NODE_W}
                  height={NODE_H}
                  rx="8"
                  fill={isSelected ? 'rgba(6,182,212,0.1)' : 'var(--surface-2)'}
                  stroke={isSelected ? '#06b6d4' : 'var(--border-2)'}
                  strokeWidth={isSelected ? 2 : 1}
                  filter={isSelected ? 'drop-shadow(0 0 8px rgba(6,182,212,0.4))' : 'none'}
                />
                {/* 왼쪽 타입 바 */}
                <rect x={node.x} y={node.y} width="3" height={NODE_H} rx="8" fill={typeColor} opacity="0.8" />
                <rect x={node.x} y={node.y + 8} width="3" height={NODE_H - 16} rx="0" fill={typeColor} opacity="0.8" />

                {/* 라벨 */}
                <text
                  x={node.x + 16}
                  y={node.y + 20}
                  fontSize="13"
                  fontWeight="700"
                  fill={isSelected ? '#06b6d4' : '#e2e8f0'}
                  fontFamily="var(--font-mono)"
                >
                  {node.label}
                </text>
                {/* 타입 */}
                <text
                  x={node.x + 16}
                  y={node.y + 36}
                  fontSize="10"
                  fill={typeColor}
                  fontFamily="var(--font-mono)"
                  opacity="0.8"
                >
                  {node.type}
                </text>
              </motion.g>
            );
          })}
        </svg>

        {/* 상세 패널 */}
        <AnimatePresence>
          {selectedNode && <DetailPanel node={selectedNode} onClose={() => setSelectedId(null)} />}
        </AnimatePresence>

        {/* 힌트 */}
        {!selectedNode && (
          <div
            style={{
              position: 'absolute',
              bottom: '16px',
              left: '50%',
              transform: 'translateX(-50%)',
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              color: 'var(--text-muted)',
            }}
          >
            노드를 클릭하면 상세 정보를 볼 수 있습니다
          </div>
        )}
      </div>

      {/* 코드 참조 */}
      <div className="card mt-4">
        <div className="card-title">시각화 대상 컴포넌트</div>
        <div className="code-block" style={{ fontSize: '12.5px', lineHeight: 1.9 }}>
          <div>
            <span className="code-keyword">function</span>{' '}
            <span className="code-function">App</span>
            <span className="code-punc">() {'{'}</span>
          </div>
          <div style={{ paddingLeft: '20px' }}>
            <span className="code-keyword">return</span>{' '}
            <span className="code-punc">(</span>
          </div>
          <div style={{ paddingLeft: '40px' }}>
            <span className="code-tag">&lt;div&gt;</span>
          </div>
          <div style={{ paddingLeft: '60px' }}>
            <span className="code-tag">&lt;Header /&gt;</span>
          </div>
          <div style={{ paddingLeft: '60px' }}>
            <span className="code-tag">&lt;main&gt;</span>
          </div>
          <div style={{ paddingLeft: '80px' }}>
            <span className="code-tag">&lt;p&gt;</span>
            <span style={{ color: 'var(--text-secondary)' }}>Hello</span>
            <span className="code-tag">&lt;/p&gt;</span>
          </div>
          <div style={{ paddingLeft: '60px' }}>
            <span className="code-tag">&lt;/main&gt;</span>
          </div>
          <div style={{ paddingLeft: '40px' }}>
            <span className="code-tag">&lt;/div&gt;</span>
          </div>
          <div style={{ paddingLeft: '20px' }}>
            <span className="code-punc">)</span>
          </div>
          <div>
            <span className="code-punc">{'}'}</span>
          </div>
        </div>
      </div>

      <SummaryBox
        items={[
          'Fiber 트리는 child → sibling → sibling 순서의 연결 리스트입니다. 일반적인 트리가 아닙니다.',
          '각 부모는 첫 번째 자식 하나에만 child 포인터를 가집니다. 나머지 자식들은 sibling으로 연결됩니다.',
          'return 포인터는 모든 Fiber가 부모를 참조하며, completeWork 후 작업 결과를 전달하는 데 사용됩니다.',
          'FunctionComponent의 stateNode는 null입니다. HostComponent(DOM 요소)의 stateNode는 실제 DOM 노드입니다.',
          'Fiber 트리 순회는 깊이 우선(DFS): App → div → Header → (sibling)main → p → "Hello" 순서입니다.',
        ]}
      />
    </div>
  );
}
