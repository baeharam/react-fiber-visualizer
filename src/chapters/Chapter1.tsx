import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChapterHeader, SummaryBox, StepControls } from '../components/shared';

const STEPS = [
  {
    id: 0,
    label: 'JSX 코드',
    badge: 'JSX',
    badgeColor: '#e06c75',
  },
  {
    id: 1,
    label: 'React.createElement()',
    badge: 'React Element',
    badgeColor: '#61afef',
  },
  {
    id: 2,
    label: 'Fiber Node',
    badge: 'Fiber Node',
    badgeColor: '#06b6d4',
  },
];

function JsxView() {
  return (
    <div className="code-block" style={{ fontSize: '13px', lineHeight: 2 }}>
      <div>
        <span className="code-keyword">function</span>{' '}
        <span className="code-function">Greeting</span>
        <span className="code-punc">({'{'}</span>
        <span className="code-prop">name</span>
        <span className="code-punc">{'}'}) {'{'}</span>
      </div>
      <div style={{ paddingLeft: '20px' }}>
        <span className="code-keyword">return</span>{' '}
        <span className="code-punc">(</span>
      </div>
      <div style={{ paddingLeft: '40px' }}>
        <span className="code-tag">&lt;h1</span>{' '}
        <span className="code-attr">className</span>
        <span className="code-punc">=</span>
        <span className="code-string">"title"</span>
        <span className="code-tag">&gt;</span>
      </div>
      <div style={{ paddingLeft: '60px' }}>
        <span className="code-punc">{'{'}</span>
        <span className="code-prop">name</span>
        <span className="code-punc">{'}'}</span>
        <span style={{ color: 'var(--text-secondary)' }}>, 안녕하세요!</span>
      </div>
      <div style={{ paddingLeft: '40px' }}>
        <span className="code-tag">&lt;/h1&gt;</span>
      </div>
      <div style={{ paddingLeft: '20px' }}>
        <span className="code-punc">);</span>
      </div>
      <div>
        <span className="code-punc">{'}'}</span>
      </div>
    </div>
  );
}

function ReactElementView() {
  return (
    <div className="code-block" style={{ fontSize: '13px', lineHeight: 1.9 }}>
      <div>
        <span className="code-comment">{'// Babel이 JSX를 변환한 결과'}</span>
      </div>
      <div>
        <span className="code-function">React.createElement</span>
        <span className="code-punc">(</span>
      </div>
      <div style={{ paddingLeft: '20px' }}>
        <span className="code-string">"h1"</span>
        <span className="code-punc">,</span>{' '}
        <span className="code-comment">{'// type'}</span>
      </div>
      <div style={{ paddingLeft: '20px' }}>
        <span className="code-punc">{'{'}</span>{' '}
        <span className="code-attr">className</span>
        <span className="code-punc">:</span>{' '}
        <span className="code-string">"title"</span>{' '}
        <span className="code-punc">{'}'}</span>
        <span className="code-punc">,</span>{' '}
        <span className="code-comment">{'// props'}</span>
      </div>
      <div style={{ paddingLeft: '20px' }}>
        <span className="code-prop">name</span>
        <span className="code-punc">,</span>{' '}
        <span className="code-string">" 안녕하세요!"</span>{' '}
        <span className="code-comment">{'// children'}</span>
      </div>
      <div>
        <span className="code-punc">)</span>
      </div>
      <div style={{ marginTop: '16px' }}>
        <span className="code-comment">{'// 반환된 React Element 객체:'}</span>
      </div>
      <div>
        <span className="code-punc">{'{'}</span>
      </div>
      <div style={{ paddingLeft: '20px' }}>
        <span className="code-attr">$$typeof</span>
        <span className="code-punc">:</span>{' '}
        <span className="code-value">Symbol(react.element)</span>
        <span className="code-punc">,</span>
      </div>
      <div style={{ paddingLeft: '20px' }}>
        <span className="code-attr">type</span>
        <span className="code-punc">:</span>{' '}
        <span className="code-string">"h1"</span>
        <span className="code-punc">,</span>
      </div>
      <div style={{ paddingLeft: '20px' }}>
        <span className="code-attr">key</span>
        <span className="code-punc">:</span>{' '}
        <span className="code-number">null</span>
        <span className="code-punc">,</span>
      </div>
      <div style={{ paddingLeft: '20px' }}>
        <span className="code-attr">ref</span>
        <span className="code-punc">:</span>{' '}
        <span className="code-number">null</span>
        <span className="code-punc">,</span>
      </div>
      <div style={{ paddingLeft: '20px' }}>
        <span className="code-attr">props</span>
        <span className="code-punc">:</span>{' '}
        <span className="code-punc">{'{'}</span>{' '}
        <span className="code-attr">className</span>
        <span className="code-punc">:</span>{' '}
        <span className="code-string">"title"</span>
        <span className="code-punc">,</span>{' '}
        <span className="code-attr">children</span>
        <span className="code-punc">:</span>{' '}
        <span className="code-punc">[...]</span>{' '}
        <span className="code-punc">{'}'}</span>
      </div>
      <div>
        <span className="code-punc">{'}'}</span>
      </div>
    </div>
  );
}

interface FieldRowProps {
  label: string;
  value: string;
  color?: string;
  desc: string;
  delay?: number;
}

function FieldRow({ label, value, color = 'var(--text-secondary)', desc, delay = 0 }: FieldRowProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay }}
      style={{
        display: 'grid',
        gridTemplateColumns: '120px 160px 1fr',
        gap: '12px',
        padding: '8px 12px',
        borderRadius: '6px',
        background: 'rgba(255,255,255,0.02)',
        marginBottom: '4px',
        alignItems: 'center',
      }}
    >
      <span
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '12px',
          color: 'var(--secondary)',
          fontWeight: 600,
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '12px',
          color,
          background: 'rgba(0,0,0,0.3)',
          padding: '2px 8px',
          borderRadius: '4px',
          display: 'inline-block',
        }}
      >
        {value}
      </span>
      <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{desc}</span>
    </motion.div>
  );
}

function FiberNodeView() {
  const [subTab, setSubTab] = useState<'fields' | 'hooks' | 'updatequeue' | 'flags'>('fields');

  const fields = [
    { label: 'tag', value: 'HostComponent (5)', color: '#e06c75', desc: 'Fiber 종류: 0=FunctionComponent, 1=ClassComponent, 3=HostRoot, 5=HostComponent(DOM 태그)' },
    { label: 'type', value: '"h1"', color: '#98c379', desc: '엘리먼트 유형. 문자열(DOM), 함수/클래스(컴포넌트)' },
    { label: 'key', value: 'null', color: '#d19a66', desc: '리스트 렌더링 최적화를 위한 고유 식별자' },
    { label: 'stateNode', value: 'HTMLElement', color: '#61afef', desc: '실제 DOM 노드 또는 클래스 컴포넌트 인스턴스' },
    { label: 'child', value: '→ TextFiber', color: '#a78bfa', desc: '첫 번째 자식 Fiber를 가리키는 포인터' },
    { label: 'sibling', value: 'null', color: '#a78bfa', desc: '다음 형제 Fiber를 가리키는 포인터' },
    { label: 'return', value: '↑ ParentFiber', color: '#a78bfa', desc: '부모 Fiber를 가리키는 포인터 (역방향 링크)' },
    { label: 'flags', value: 'Update | Placement', color: '#f59e0b', desc: '이 Fiber에서 수행할 사이드 이펙트 비트마스크' },
    { label: 'subtreeFlags', value: 'ChildDeletion', color: '#f59e0b', desc: '자식 서브트리에 존재하는 effectFlag 합산 (React 18 최적화)' },
    { label: 'lanes', value: '0b000001', color: '#10b981', desc: '작업 우선순위. 낮은 숫자 = 높은 우선순위' },
    { label: 'childLanes', value: '0b010000', color: '#10b981', desc: '자식 서브트리 중 가장 높은 우선순위 lane' },
    { label: 'pendingProps', value: '{ className: "title" }', color: '#e2e8f0', desc: '새로 렌더링될 props' },
    { label: 'memoizedProps', value: '{ className: "title" }', color: '#e2e8f0', desc: '마지막으로 렌더링된 props (current tree)' },
    { label: 'memoizedState', value: 'Hook | null', color: '#06b6d4', desc: 'hooks의 상태 정보 (linked list 헤드)' },
    { label: 'updateQueue', value: 'UpdateQueue | null', color: '#22c55e', desc: '클래스 컴포넌트의 setState, 함수 컴포넌트의 effect 큐' },
    { label: 'alternate', value: '↔ current/wip', color: '#6366f1', desc: 'current ↔ workInProgress 양방향 참조 (Double Buffering)' },
  ];

  const SUB_TABS = [
    { id: 'fields' as const, label: 'Fiber 핵심 필드', color: '#06b6d4' },
    { id: 'hooks' as const, label: 'memoizedState (Hooks)', color: '#a78bfa' },
    { id: 'updatequeue' as const, label: 'updateQueue', color: '#22c55e' },
    { id: 'flags' as const, label: 'flags 비트마스크', color: '#f59e0b' },
  ];

  return (
    <div>
      {/* 서브탭 */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '14px', borderBottom: '1px solid var(--border)' }}>
        {SUB_TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setSubTab(t.id)}
            style={{
              padding: '6px 14px', background: 'transparent', border: 'none',
              borderBottom: `2px solid ${subTab === t.id ? t.color : 'transparent'}`,
              color: subTab === t.id ? t.color : 'var(--text-secondary)',
              fontFamily: 'var(--font-mono)', fontSize: '11px',
              fontWeight: subTab === t.id ? 700 : 400,
              cursor: 'pointer', transition: 'all 0.2s', marginBottom: '-1px',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={subTab} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.2 }}>
          {subTab === 'fields' && (
            <div>
              <div
                style={{
                  background: 'linear-gradient(135deg, rgba(6,182,212,0.08), rgba(124,58,237,0.08))',
                  border: '1px solid var(--border-2)',
                  borderTop: '2px solid var(--secondary)',
                  borderRadius: 'var(--radius)',
                  padding: '16px',
                  marginBottom: '12px',
                }}
              >
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--secondary)', marginBottom: '12px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  FiberNode {'{'} type: "h1" {'}'}
                </div>
                {fields.map((f, i) => (
                  <FieldRow key={f.label} {...f} delay={i * 0.03} />
                ))}
              </div>
              <div style={{ background: 'rgba(124,58,237,0.06)', border: '1px solid rgba(124,58,237,0.2)', borderRadius: 'var(--radius)', padding: '12px 16px', fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                💡 <strong style={{ color: 'var(--text)' }}>Fiber는 순수 JavaScript 객체입니다.</strong>{' '}
                React는 이 객체들을 연결 리스트로 구성하여 트리를 표현하고, 작업을 중단/재개할 수 있는 단위로 사용합니다.
                각 Fiber는 <strong style={{ color: '#a78bfa' }}>current</strong>와{' '}
                <strong style={{ color: 'var(--secondary)' }}>workInProgress</strong> 두 가지 버전을 가집니다 (Double Buffering).
              </div>
            </div>
          )}

          {subTab === 'hooks' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ background: 'rgba(167,139,250,0.06)', border: '1px solid rgba(167,139,250,0.2)', borderRadius: 'var(--radius)', padding: '12px 16px', fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                <strong style={{ color: '#a78bfa' }}>memoizedState</strong>는 Fiber의 첫 번째 Hook을 가리킵니다.
                각 Hook은 <code style={{ color: '#06b6d4', background: 'rgba(6,182,212,0.1)', padding: '1px 5px', borderRadius: '3px' }}>next</code> 포인터로 다음 Hook과 연결됩니다. 호출 순서가 곧 연결 리스트 순서입니다.
              </div>
              {/* 연결 리스트 시각화 */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0', overflowX: 'auto', padding: '4px 0' }}>
                {[
                  { hook: 'useState', memoized: 'count: 0', queue: 'UpdateQueue', color: '#a78bfa' },
                  { hook: 'useEffect', memoized: 'Effect { create, deps }', queue: 'null', color: '#06b6d4' },
                  { hook: 'useRef', memoized: '{ current: null }', queue: 'null', color: '#10b981' },
                  { hook: 'useState', memoized: 'text: ""', queue: 'UpdateQueue', color: '#a78bfa' },
                ].map((h, i, arr) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                    <div style={{
                      padding: '10px 14px', borderRadius: '8px',
                      border: `1px solid ${h.color}60`,
                      background: `${h.color}10`,
                      minWidth: '160px',
                    }}>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: h.color, fontWeight: 700, marginBottom: '4px' }}>{h.hook}</div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-secondary)', marginBottom: '2px' }}>memoizedState:</div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text)', background: 'rgba(0,0,0,0.3)', padding: '2px 6px', borderRadius: '3px', marginBottom: '4px' }}>{h.memoized}</div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-muted)' }}>queue: {h.queue}</div>
                    </div>
                    {i < arr.length - 1 && (
                      <div style={{ padding: '0 8px', color: '#a78bfa', fontFamily: 'var(--font-mono)', fontSize: '14px', fontWeight: 700 }}>→</div>
                    )}
                    {i === arr.length - 1 && (
                      <div style={{ padding: '0 8px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '11px' }}>→ null</div>
                    )}
                  </div>
                ))}
              </div>
              {/* Hook 객체 구조 코드 */}
              <div className="code-block" style={{ fontSize: '12px', lineHeight: 1.9 }}>
                <div><span className="code-comment">{'// Hook 객체 구조 (React 소스: ReactFiberHooks.js)'}</span></div>
                <div><span className="code-keyword">type</span> Hook = {'{'}</div>
                <div style={{ paddingLeft: '20px' }}><span className="code-prop">memoizedState</span>: any,   <span className="code-comment">{'// useState: 현재 상태값, useEffect: Effect 객체'}</span></div>
                <div style={{ paddingLeft: '20px' }}><span className="code-prop">baseState</span>: any,       <span className="code-comment">{'// 가장 최근 base 상태 (Concurrent: 부분 적용 기점)'}</span></div>
                <div style={{ paddingLeft: '20px' }}><span className="code-prop">baseQueue</span>: Update | null, <span className="code-comment">{'// 아직 처리 안 된 업데이트 (인터럽트 후 재개용)'}</span></div>
                <div style={{ paddingLeft: '20px' }}><span className="code-prop">queue</span>: UpdateQueue | null, <span className="code-comment">{'// 새로운 setState 업데이트들의 원형 연결 리스트'}</span></div>
                <div style={{ paddingLeft: '20px' }}><span className="code-prop">next</span>: Hook | null,     <span className="code-comment">{'// 다음 Hook (호출 순서 == 연결 순서)'}</span></div>
                <div>{'}'}</div>
                <div style={{ marginTop: '10px' }}><span className="code-comment">{'// 규칙: Hook을 조건문/반복문 안에서 호출하면 next 순서가 깨짐!'}</span></div>
                <div><span className="code-comment">{'// → "Hooks called in a different order" 에러 발생'}</span></div>
              </div>
            </div>
          )}

          {subTab === 'updatequeue' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 'var(--radius)', padding: '12px 16px', fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                <strong style={{ color: '#22c55e' }}>updateQueue</strong>는 컴포넌트에 대기 중인 상태 업데이트를 관리합니다.
                setState가 연속 호출될 때 각 업데이트는 <strong style={{ color: '#06b6d4' }}>원형 연결 리스트(circular linked list)</strong>로 연결됩니다.
                Concurrent Mode에서 인터럽트된 업데이트는 <code style={{ color: '#a78bfa', background: 'rgba(167,139,250,0.1)', padding: '1px 5px', borderRadius: '3px' }}>baseQueue</code>에 보관됩니다.
              </div>
              {/* 원형 연결 리스트 시각화 */}
              <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '16px' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '12px' }}>queue.pending (원형 연결 리스트: 마지막 노드 → 첫 노드)</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap' }}>
                  {[
                    { action: 'setCount(1)', lane: 'DefaultLane', color: '#22c55e' },
                    { action: 'setCount(c=>c+1)', lane: 'DefaultLane', color: '#22c55e' },
                    { action: 'setCount(99)', lane: 'SyncLane', color: '#ef4444' },
                  ].map((u, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
                      <div style={{ padding: '8px 12px', borderRadius: '6px', border: `1px solid ${u.color}60`, background: `${u.color}10`, minWidth: '140px' }}>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: u.color, fontWeight: 700, marginBottom: '3px' }}>Update #{i + 1}</div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-secondary)', marginBottom: '2px' }}>action: {u.action}</div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-muted)' }}>lane: {u.lane}</div>
                      </div>
                      <div style={{ padding: '0 6px', color: 'var(--text-muted)', fontSize: '14px' }}>→</div>
                    </div>
                  ))}
                  <div style={{ padding: '4px 10px', borderRadius: '4px', border: '1px dashed var(--border-2)', fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-muted)' }}>↩ Update #1 (원형)</div>
                </div>
              </div>
              <div className="code-block" style={{ fontSize: '12px', lineHeight: 1.9 }}>
                <div><span className="code-comment">{'// UpdateQueue 구조 (ReactFiberClassComponent.js / ReactFiberHooks.js)'}</span></div>
                <div><span className="code-keyword">type</span> UpdateQueue = {'{'}</div>
                <div style={{ paddingLeft: '20px' }}><span className="code-prop">baseState</span>: State,              <span className="code-comment">{'// 다음 렌더 시작 기점 상태'}</span></div>
                <div style={{ paddingLeft: '20px' }}><span className="code-prop">firstBaseUpdate</span>: Update | null, <span className="code-comment">{'// 처리 안 된 첫 번째 업데이트'}</span></div>
                <div style={{ paddingLeft: '20px' }}><span className="code-prop">lastBaseUpdate</span>: Update | null,  <span className="code-comment">{'// 처리 안 된 마지막 업데이트'}</span></div>
                <div style={{ paddingLeft: '20px' }}><span className="code-prop">shared</span>: {'{'} pending: Update | null {'}'}, <span className="code-comment">{'// 새로 들어온 업데이트 큐 (원형)'}</span></div>
                <div style={{ paddingLeft: '20px' }}><span className="code-prop">effects</span>: Array&lt;Update&gt; | null  <span className="code-comment">{'// commitUpdateQueue에서 처리할 콜백'}</span></div>
                <div>{'}'}</div>
              </div>
            </div>
          )}

          {subTab === 'flags' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 'var(--radius)', padding: '12px 16px', fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                <strong style={{ color: '#f59e0b' }}>flags</strong> (구: effectTag)는 Fiber에서 Commit Phase에 수행할 작업을 비트마스크로 표현합니다.
                React 17에서는 effectList 연결 리스트를 순회했지만, React 18은 <strong style={{ color: '#06b6d4' }}>subtreeFlags</strong>를 DFS로 탐색해 성능을 개선했습니다.
              </div>
              {/* flags 비트 테이블 */}
              {[
                { name: 'NoFlags',          hex: '0x00000000', color: 'var(--text-muted)', desc: '아무 작업 없음' },
                { name: 'Placement',        hex: '0x00000002', color: '#22c55e', desc: 'DOM 노드 삽입 (createChild, insertBefore)' },
                { name: 'Update',           hex: '0x00000004', color: '#06b6d4', desc: 'DOM 속성 업데이트 (commitUpdate)' },
                { name: 'ChildDeletion',    hex: '0x00000010', color: '#ef4444', desc: '자식 노드 삭제 (commitDeletion)' },
                { name: 'ContentReset',     hex: '0x00000040', color: '#f97316', desc: '텍스트 내용 초기화 (input/textarea)' },
                { name: 'Ref',             hex: '0x00000200', color: '#a78bfa', desc: 'ref 콜백/ref object 처리' },
                { name: 'Snapshot',         hex: '0x00000400', color: '#f59e0b', desc: 'getSnapshotBeforeUpdate 호출 (beforeMutation)' },
                { name: 'Passive',          hex: '0x00000800', color: '#10b981', desc: 'useEffect 실행 필요 (비동기 layout effect)' },
                { name: 'PassiveUnmount',   hex: '0x00002000', color: '#10b981', desc: 'useEffect cleanup 실행 필요' },
                { name: 'LayoutMask',       hex: 'Update|Ref', color: '#eab308', desc: 'commitLayoutEffects 대상 (useLayoutEffect)' },
              ].map((f, i) => (
                <motion.div
                  key={f.name}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  style={{ display: 'grid', gridTemplateColumns: '160px 120px 1fr', gap: '10px', padding: '7px 12px', borderRadius: '5px', background: 'rgba(255,255,255,0.02)', marginBottom: '2px', alignItems: 'center' }}
                >
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: f.color, fontWeight: 600 }}>{f.name}</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)', background: 'rgba(0,0,0,0.3)', padding: '2px 6px', borderRadius: '3px' }}>{f.hex}</span>
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{f.desc}</span>
                </motion.div>
              ))}
              <div className="code-block" style={{ fontSize: '12px', lineHeight: 1.9, marginTop: '4px' }}>
                <div><span className="code-comment">{'// React 18: subtreeFlags 기반 탐색 (commitPassiveMountEffects 등)'}</span></div>
                <div><span className="code-keyword">function</span> <span className="code-function">recursivelyTraversePassiveMountEffects</span><span className="code-punc">(root, parentFiber) {'{'}</span></div>
                <div style={{ paddingLeft: '20px' }}><span className="code-comment">{'// subtreeFlags 확인으로 불필요한 서브트리 순회 생략'}</span></div>
                <div style={{ paddingLeft: '20px' }}><span className="code-keyword">if</span> (parentFiber.subtreeFlags & PassiveMask) {'{'}</div>
                <div style={{ paddingLeft: '40px' }}><span className="code-keyword">let</span> child = parentFiber.child;</div>
                <div style={{ paddingLeft: '40px' }}><span className="code-keyword">while</span> (child !== null) {'{'}</div>
                <div style={{ paddingLeft: '60px' }}><span className="code-function">recursivelyTraversePassiveMountEffects</span>(root, child);</div>
                <div style={{ paddingLeft: '60px' }}>child = child.sibling;</div>
                <div style={{ paddingLeft: '40px' }}>{'}'}</div>
                <div style={{ paddingLeft: '20px' }}>{'}'}</div>
                <div>{'}'}</div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export function Chapter1() {
  const [step, setStep] = useState(0);

  const views = [<JsxView key="jsx" />, <ReactElementView key="re" />, <FiberNodeView key="fn" />];

  return (
    <div>
      <ChapterHeader
        number={1}
        title="JSX →"
        titleHighlight="Fiber Node"
        description="JSX 코드가 어떻게 React Element를 거쳐 Fiber Node로 변환되는지 3단계 과정을 살펴봅니다. Fiber Node의 핵심 필드들을 하나씩 이해해봅니다."
      />

      {/* 스텝 타임라인 */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0',
          marginBottom: '24px',
        }}
      >
        {STEPS.map((s, i) => (
          <div key={s.id} style={{ display: 'flex', alignItems: 'center', flex: i < 2 ? 1 : 'none' }}>
            <div
              onClick={() => setStep(s.id)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer',
                opacity: step >= s.id ? 1 : 0.4,
                transition: 'opacity 0.3s',
              }}
            >
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: step === s.id ? s.badgeColor : step > s.id ? 'var(--success)' : 'var(--surface-2)',
                  border: `2px solid ${step >= s.id ? s.badgeColor : 'var(--border)'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '14px',
                  fontWeight: 700,
                  color: 'white',
                  boxShadow: step === s.id ? `0 0 16px ${s.badgeColor}60` : 'none',
                  transition: 'all 0.3s ease',
                }}
              >
                {step > s.id ? '✓' : s.id + 1}
              </div>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '10px',
                  color: step === s.id ? s.badgeColor : 'var(--text-secondary)',
                  whiteSpace: 'nowrap',
                  fontWeight: step === s.id ? 700 : 400,
                }}
              >
                {s.badge}
              </span>
            </div>
            {i < 2 && (
              <div
                style={{
                  flex: 1,
                  height: '2px',
                  background: step > i ? 'var(--secondary)' : 'var(--border)',
                  margin: '0 8px',
                  marginBottom: '22px',
                  transition: 'background 0.3s ease',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {step > i && (
                  <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'var(--secondary)',
                      transformOrigin: 'left',
                    }}
                  />
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 컨텐츠 영역 */}
      <div className="card" style={{ minHeight: '340px' }}>
        <div className="card-title" style={{ color: STEPS[step].badgeColor }}>
          {STEPS[step].label}
        </div>
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
          >
            {views[step]}
          </motion.div>
        </AnimatePresence>
      </div>

      <StepControls
        step={step}
        total={STEPS.length}
        onNext={() => setStep((s) => Math.min(s + 1, STEPS.length - 1))}
        onPrev={() => setStep((s) => Math.max(s - 1, 0))}
        onReset={() => setStep(0)}
      />

      <SummaryBox
        items={[
          'JSX는 Babel에 의해 React.createElement() 호출로 변환됩니다.',
          'React.createElement()는 순수 JavaScript 객체(React Element)를 반환합니다.',
          'React는 이 Element를 기반으로 Fiber Node를 생성합니다. Fiber는 작업 단위(unit of work)입니다.',
          'Fiber의 child/sibling/return 포인터로 트리 구조를 표현합니다 (연결 리스트).',
          'flags 비트마스크는 어떤 DOM 작업이 필요한지 기록합니다. lanes는 작업 우선순위입니다.',
        ]}
      />
    </div>
  );
}
