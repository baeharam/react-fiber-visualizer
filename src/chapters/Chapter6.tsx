import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChapterHeader, SummaryBox } from '../components/shared';

// ─── Lanes 비트마스크 정의 (React 실제 소스 기반) ───────────────────────────
const LANES = [
  { name: 'SyncLane',              bit: 0b00000000000000000000000000000001, hex: '0x1',    priority: 1, color: '#ef4444', desc: '동기 업데이트 (flushSync, legacy mode)' },
  { name: 'InputContinuousLane',   bit: 0b00000000000000000000000000000100, hex: '0x4',    priority: 2, color: '#f97316', desc: '연속 입력 (mousemove, drag, scroll)' },
  { name: 'DefaultLane',           bit: 0b00000000000000000000000000010000, hex: '0x10',   priority: 3, color: '#eab308', desc: '기본 업데이트 (setState, useReducer)' },
  { name: 'TransitionLane1',       bit: 0b00000000000000000000000100000000, hex: '0x100',  priority: 4, color: '#22c55e', desc: 'startTransition으로 마킹된 업데이트' },
  { name: 'RetryLane1',            bit: 0b00000000000000000100000000000000, hex: '0x4000', priority: 5, color: '#06b6d4', desc: 'Suspense fallback 재시도' },
  { name: 'IdleLane',              bit: 0b00100000000000000000000000000000, hex: '0x2000_0000', priority: 6, color: '#6366f1', desc: '유휴 상태 업데이트 (offscreen)' },
];

// ─── Scheduler Task 정의 ─────────────────────────────────────────────────────
interface SchedulerTask {
  id: number;
  name: string;
  priority: number;
  priorityLabel: string;
  expirationTime: number; // ms
  lane: typeof LANES[number];
  status: 'pending' | 'running' | 'done';
}

const INITIAL_TASKS: SchedulerTask[] = [
  { id: 1, name: 'onClick setState',        priority: 1, priorityLabel: 'ImmediatePriority', expirationTime: -1,    lane: LANES[0], status: 'pending' },
  { id: 2, name: 'mousemove handler',       priority: 2, priorityLabel: 'UserBlockingPriority', expirationTime: 250, lane: LANES[1], status: 'pending' },
  { id: 3, name: 'data fetch setState',     priority: 3, priorityLabel: 'NormalPriority',    expirationTime: 5000, lane: LANES[2], status: 'pending' },
  { id: 4, name: 'startTransition update',  priority: 4, priorityLabel: 'NormalPriority*', expirationTime: 5000, lane: LANES[3], status: 'pending' },
  { id: 5, name: 'Suspense retry',          priority: 5, priorityLabel: 'LowPriority',       expirationTime: 10000, lane: LANES[4], status: 'pending' },
  { id: 6, name: 'offscreen prerender',     priority: 6, priorityLabel: 'IdlePriority',      expirationTime: Infinity, lane: LANES[5], status: 'pending' },
];

// ─── Tab 정의 ────────────────────────────────────────────────────────────────
const TABS = [
  { id: 'lanes',     label: 'Lanes 비트마스크' },
  { id: 'scheduler', label: 'Scheduler Task Queue' },
  { id: 'msgchannel',label: 'MessageChannel 루프' },
];

// ─── Lanes 탭 ────────────────────────────────────────────────────────────────
function LanesTab() {
  const [selectedLanes, setSelectedLanes] = useState<number>(0);
  const [hoveredLane, setHoveredLane] = useState<number | null>(null);

  const toggleLane = (bit: number) => {
    setSelectedLanes((prev) => prev ^ bit);
  };

  const binaryStr = (n: number) => n.toString(2).padStart(32, '0');
  const formatBinary = (n: number) => {
    const s = binaryStr(n);
    // 8자리씩 구분
    return [s.slice(0, 8), s.slice(8, 16), s.slice(16, 24), s.slice(24, 32)].join('_');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* 개념 설명 */}
      <div className="card" style={{ background: 'rgba(6,182,212,0.06)', borderColor: 'rgba(6,182,212,0.25)' }}>
        <div className="card-title" style={{ color: 'var(--secondary)' }}>Lanes란?</div>
        <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.8 }}>
          React 18의 <strong style={{ color: 'var(--text)' }}>Lanes</strong>는 비트마스크(bitmask) 기반 우선순위 시스템입니다.
          여러 업데이트를 <strong style={{ color: '#f59e0b' }}>비트 OR</strong>로 배치(batch)하고,
          <strong style={{ color: '#10b981' }}>getHighestPriorityLane()</strong>으로 가장 낮은 비트(= 최고 우선순위)를 추출합니다.
          이는 React 17의 <code style={{ color: '#a78bfa', background: 'rgba(167,139,250,0.1)', padding: '1px 6px', borderRadius: '3px' }}>expirationTime</code> 모델을 대체합니다.
        </div>
      </div>

      {/* Lane 선택 인터렉션 */}
      <div className="card">
        <div className="card-title">Lane 조합 시뮬레이터 (클릭으로 선택)</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
          {LANES.map((lane) => {
            const isSelected = (selectedLanes & lane.bit) !== 0;
            const isHovered = hoveredLane === lane.bit;
            return (
              <motion.div
                key={lane.name}
                onClick={() => toggleLane(lane.bit)}
                onHoverStart={() => setHoveredLane(lane.bit)}
                onHoverEnd={() => setHoveredLane(null)}
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '28px 200px 80px 1fr',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: `1px solid ${isSelected ? lane.color : isHovered ? 'var(--border-2)' : 'var(--border)'}`,
                  background: isSelected ? `${lane.color}15` : 'var(--surface-2)',
                  cursor: 'pointer',
                  transition: 'border-color 0.2s, background 0.2s',
                }}
              >
                {/* 체크박스 */}
                <div style={{
                  width: '18px', height: '18px', borderRadius: '4px',
                  border: `2px solid ${isSelected ? lane.color : 'var(--border-2)'}`,
                  background: isSelected ? lane.color : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.2s',
                }}>
                  {isSelected && <span style={{ color: 'white', fontSize: '11px', fontWeight: 700 }}>✓</span>}
                </div>
                {/* 이름 */}
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: isSelected ? lane.color : 'var(--text)', fontWeight: isSelected ? 700 : 400 }}>
                  {lane.name}
                </span>
                {/* 비트값 */}
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)', background: 'rgba(0,0,0,0.3)', padding: '2px 6px', borderRadius: '3px' }}>
                  {lane.hex}
                </span>
                {/* 설명 */}
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{lane.desc}</span>
              </motion.div>
            );
          })}
        </div>

        {/* 비트마스크 결과 */}
        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: '8px',
          padding: '16px',
        }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            pendingLanes (OR 결합 결과)
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{
              fontFamily: 'var(--font-mono)', fontSize: '13px',
              color: selectedLanes === 0 ? 'var(--text-muted)' : '#10b981',
              background: 'rgba(0,0,0,0.4)', padding: '8px 14px', borderRadius: '6px',
              letterSpacing: '0.05em',
            }}>
              0b_{formatBinary(selectedLanes)}
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: '#f59e0b' }}>
              = {selectedLanes} (decimal)
            </div>
          </div>

          {selectedLanes !== 0 && (
            <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} style={{ marginTop: '12px' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '6px' }}>
                getHighestPriorityLane() → 최고 우선순위 lane:
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {(() => {
                  // 가장 낮은 비트 추출: lanes & -lanes
                  const highest = selectedLanes & -selectedLanes;
                  const highestLane = LANES.find((l) => l.bit === highest);
                  return highestLane ? (
                    <>
                      <span style={{
                        fontFamily: 'var(--font-mono)', fontSize: '13px',
                        color: highestLane.color, fontWeight: 700,
                        background: `${highestLane.color}20`, padding: '4px 10px', borderRadius: '6px',
                        border: `1px solid ${highestLane.color}40`,
                      }}>
                        {highestLane.name}
                      </span>
                      <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                        ({highestLane.hex}) — lanes &amp; -lanes = {highest}
                      </span>
                    </>
                  ) : null;
                })()}
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* 실제 React 소스 */}
      <div className="card">
        <div className="card-title">React 소스 코드 (ReactFiberLane.js)</div>
        <div className="code-block" style={{ fontSize: '12px', lineHeight: 1.9 }}>
          <div><span className="code-comment">{'// 각 Lane은 비트 단위로 정의됩니다'}</span></div>
          <div><span className="code-keyword">export const</span> <span className="code-prop">SyncLane</span> = <span className="code-number">0b0000000000000000000000000000001</span>; <span className="code-comment">{'// 1'}</span></div>
          <div><span className="code-keyword">export const</span> <span className="code-prop">InputContinuousLane</span> = <span className="code-number">0b0000000000000000000000000000100</span>; <span className="code-comment">{'// 4'}</span></div>
          <div><span className="code-keyword">export const</span> <span className="code-prop">DefaultLane</span> = <span className="code-number">0b0000000000000000000000000010000</span>; <span className="code-comment">{'// 16'}</span></div>
          <div><span className="code-keyword">export const</span> <span className="code-prop">TransitionLane1</span> = <span className="code-number">0b0000000000000000000001000000000</span>; <span className="code-comment">{'// 256'}</span></div>
          <div style={{ marginTop: '12px' }}><span className="code-comment">{'// 최고 우선순위 lane 추출: 가장 낮은 비트(= 작은 숫자 = 높은 우선순위)'}</span></div>
          <div><span className="code-keyword">function</span> <span className="code-function">getHighestPriorityLane</span><span className="code-punc">(lanes) {'{'}</span></div>
          <div style={{ paddingLeft: '20px' }}><span className="code-keyword">return</span> lanes <span className="code-punc">&amp;</span> -lanes; <span className="code-comment">{'// 2의 보수 이용한 LSB 추출'}</span></div>
          <div><span className="code-punc">{'}'}</span></div>
          <div style={{ marginTop: '12px' }}><span className="code-comment">{'// 여러 lane 합치기 (배치 업데이트)'}</span></div>
          <div><span className="code-keyword">function</span> <span className="code-function">mergeLanes</span><span className="code-punc">(a, b) {'{'}</span></div>
          <div style={{ paddingLeft: '20px' }}><span className="code-keyword">return</span> a <span className="code-punc">|</span> b;</div>
          <div><span className="code-punc">{'}'}</span></div>
          <div style={{ marginTop: '12px' }}><span className="code-comment">{'// lane 포함 여부 확인'}</span></div>
          <div><span className="code-keyword">function</span> <span className="code-function">includesSomeLane</span><span className="code-punc">(a, b) {'{'}</span></div>
          <div style={{ paddingLeft: '20px' }}><span className="code-keyword">return</span> <span className="code-punc">(</span>a <span className="code-punc">&amp;</span> b<span className="code-punc">)</span> !== <span className="code-number">NoLanes</span>;</div>
          <div><span className="code-punc">{'}'}</span></div>
        </div>
      </div>
    </div>
  );
}

// ─── Scheduler Task Queue 탭 ──────────────────────────────────────────────────
function SchedulerTab() {
  const [tasks, setTasks] = useState<SchedulerTask[]>(INITIAL_TASKS.map(t => ({ ...t })));
  const [runningId, setRunningId] = useState<number | null>(null);
  const [log, setLog] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const pushLog = (msg: string) => setLog((prev) => [...prev.slice(-12), msg]);

  const reset = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setTasks(INITIAL_TASKS.map(t => ({ ...t })));
    setRunningId(null);
    setLog([]);
    setIsRunning(false);
  };

  const runNext = (currentTasks: SchedulerTask[]) => {
    const pending = currentTasks.filter(t => t.status === 'pending');
    if (pending.length === 0) {
      setRunningId(null);
      setIsRunning(false);
      pushLog('✅ 모든 태스크 처리 완료');
      return;
    }
    // min-heap에서 최고 우선순위 꺼내기 (priority 낮을수록 높은 우선순위)
    const next = pending.reduce((a, b) => a.priority < b.priority ? a : b);
    setRunningId(next.id);
    pushLog(`▶ 실행: [P${next.priority}] ${next.name} (${next.lane.name})`);

    timerRef.current = setTimeout(() => {
      setTasks((prev) => {
        const updated = prev.map(t => t.id === next.id ? { ...t, status: 'done' as const } : t);
        pushLog(`✓ 완료: ${next.name}`);
        timerRef.current = setTimeout(() => runNext(updated), 600);
        return updated;
      });
    }, 900);
  };

  const start = () => {
    if (isRunning) return;
    setIsRunning(true);
    pushLog('🚀 Scheduler 시작 — MessageChannel으로 비동기 실행');
    runNext(tasks);
  };

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* 개념 설명 */}
      <div className="card" style={{ background: 'rgba(124,58,237,0.06)', borderColor: 'rgba(124,58,237,0.25)' }}>
        <div className="card-title" style={{ color: 'var(--primary)' }}>Scheduler Min-Heap</div>
        <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.8 }}>
          React Scheduler는 내부적으로 <strong style={{ color: 'var(--text)' }}>Min-Heap(최소 힙)</strong>으로 태스크를 관리합니다.
          <code style={{ color: '#a78bfa', background: 'rgba(167,139,250,0.1)', padding: '1px 6px', borderRadius: '3px', margin: '0 4px' }}>expirationTime</code>이 가장 작은(= 가장 긴급한) 태스크를 O(log n)으로 꺼냅니다.
          태스크는 <strong style={{ color: '#06b6d4' }}>MessageChannel</strong>을 통해 현재 프레임 렌더링을 블로킹하지 않고 다음 태스크 큐에서 실행됩니다.
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '16px', alignItems: 'start' }}>
        {/* 태스크 큐 */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <div className="card-title" style={{ margin: 0 }}>Task Queue (Min-Heap)</div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="btn btn-primary" onClick={start} disabled={isRunning} style={{ fontSize: '11px', padding: '4px 12px' }}>
                ▶ 실행
              </button>
              <button className="btn btn-secondary" onClick={reset} style={{ fontSize: '11px', padding: '4px 12px' }}>
                ↺ 리셋
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {tasks.map((task) => {
              const isActive = runningId === task.id;
              const isDone = task.status === 'done';
              return (
                <motion.div
                  key={task.id}
                  layout
                  animate={{
                    opacity: isDone ? 0.4 : 1,
                    x: isActive ? 6 : 0,
                  }}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '32px 28px 180px 120px 1fr',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: `1px solid ${isActive ? task.lane.color : isDone ? 'var(--border)' : 'var(--border-2)'}`,
                    background: isActive ? `${task.lane.color}15` : isDone ? 'transparent' : 'var(--surface-2)',
                    transition: 'border-color 0.3s',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  {/* 우선순위 뱃지 */}
                  <div style={{
                    width: '28px', height: '28px', borderRadius: '6px',
                    background: isDone ? 'var(--border)' : task.lane.color,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 700, color: 'white',
                    flexShrink: 0,
                  }}>
                    {isDone ? '✓' : `P${task.priority}`}
                  </div>
                  {/* Lane 비트 */}
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-muted)', textAlign: 'center' }}>
                    {task.lane.hex}
                  </span>
                  {/* 태스크 이름 */}
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: isDone ? 'var(--text-muted)' : task.lane.color, fontWeight: isActive ? 700 : 400, textDecoration: isDone ? 'line-through' : 'none' }}>
                    {task.name}
                  </span>
                  {/* 우선순위 레이블 */}
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    {task.priorityLabel}
                    {task.priorityLabel === 'NormalPriority*' && (
                      <span style={{ color: '#f59e0b', marginLeft: '4px' }} title="Scheduler 레벨은 NormalPriority이지만, Lane 레벨에서 TransitionLane으로 분류되어 별도 처리됩니다">⚑ TransitionLane</span>
                    )}
                  </span>
                  {/* Lane 이름 */}
                  <span style={{ fontSize: '11px', color: task.lane.color, fontFamily: 'var(--font-mono)' }}>
                    {task.lane.name}
                  </span>

                  {/* 실행 중 인디케이터 */}
                  {isActive && (
                    <motion.div
                      style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '3px', background: task.lane.color, borderRadius: '2px 0 0 2px' }}
                      animate={{ opacity: [1, 0.3, 1] }}
                      transition={{ repeat: Infinity, duration: 0.8 }}
                    />
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* 실행 로그 */}
        <div className="card" style={{ height: '100%' }}>
          <div className="card-title">실행 로그</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', minHeight: '200px' }}>
            <AnimatePresence>
              {log.length === 0 ? (
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontStyle: 'italic' }}>▶ 실행 버튼을 누르세요</div>
              ) : (
                log.map((entry, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-secondary)', lineHeight: 1.6 }}
                  >
                    {entry}
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Scheduler 우선순위 코드 */}
      <div className="card">
        <div className="card-title">Scheduler 우선순위 → Lane 매핑 (React 소스)</div>
        <div className="code-block" style={{ fontSize: '12px', lineHeight: 1.9 }}>
          <div><span className="code-comment">{'// packages/scheduler/src/SchedulerPriorities.js'}</span></div>
          <div><span className="code-keyword">export const</span> <span className="code-prop">ImmediatePriority</span> = <span className="code-number">1</span>; <span className="code-comment">{'// IMMEDIATE_PRIORITY_TIMEOUT = -1'}</span></div>
          <div><span className="code-keyword">export const</span> <span className="code-prop">UserBlockingPriority</span> = <span className="code-number">2</span>; <span className="code-comment">{'// timeout = 250ms'}</span></div>
          <div><span className="code-keyword">export const</span> <span className="code-prop">NormalPriority</span> = <span className="code-number">3</span>; <span className="code-comment">{'// timeout = 5000ms'}</span></div>
          <div><span className="code-keyword">export const</span> <span className="code-prop">LowPriority</span> = <span className="code-number">4</span>; <span className="code-comment">{'// timeout = 10000ms'}</span></div>
          <div><span className="code-keyword">export const</span> <span className="code-prop">IdlePriority</span> = <span className="code-number">5</span>; <span className="code-comment">{'// timeout = maxSigned31BitInt'}</span></div>
          <div style={{ marginTop: '12px' }}><span className="code-comment">{'// Scheduler → React reconciler: 우선순위를 lane으로 변환'}</span></div>
          <div><span className="code-keyword">function</span> <span className="code-function">lanesToEventPriority</span><span className="code-punc">(lanes) {'{'}</span></div>
          <div style={{ paddingLeft: '20px' }}><span className="code-keyword">const</span> lane = <span className="code-function">getHighestPriorityLane</span>(lanes);</div>
          <div style={{ paddingLeft: '20px' }}><span className="code-keyword">if</span> (<span className="code-function">isHigherEventPriority</span>(DiscreteEventPriority, lane)) <span className="code-keyword">return</span> DiscreteEventPriority;</div>
          <div style={{ paddingLeft: '20px' }}><span className="code-keyword">if</span> (<span className="code-function">isHigherEventPriority</span>(ContinuousEventPriority, lane)) <span className="code-keyword">return</span> ContinuousEventPriority;</div>
          <div style={{ paddingLeft: '20px' }}><span className="code-keyword">if</span> (<span className="code-function">includesSomeLane</span>(lanes, TransitionLanes)) <span className="code-keyword">return</span> DefaultEventPriority;</div>
          <div style={{ paddingLeft: '20px' }}><span className="code-keyword">return</span> IdleEventPriority;</div>
          <div><span className="code-punc">{'}'}</span></div>
        </div>
      </div>
    </div>
  );
}

// ─── MessageChannel 탭 ────────────────────────────────────────────────────────
const MSG_CHANNEL_STEPS = [
  {
    id: 0,
    title: '1. setState() 호출',
    desc: 'React 이벤트 핸들러에서 setState 호출. 업데이트 객체가 해당 Fiber의 updateQueue에 enqueue됩니다.',
    code: 'setState(newValue)\n// → enqueueUpdate(fiber, update)\n// → scheduleUpdateOnFiber(fiber, lane)',
    color: '#ef4444',
  },
  {
    id: 1,
    title: '2. scheduleCallback() 등록',
    desc: 'scheduleUpdateOnFiber가 Scheduler.scheduleCallback()을 호출합니다. 이 때 수행할 작업(performConcurrentWorkOnRoot)을 콜백으로 등록합니다.',
    code: 'scheduleCallback(\n  priorityLevel,\n  performConcurrentWorkOnRoot.bind(null, root)\n)',
    color: '#f97316',
  },
  {
    id: 2,
    title: '3. MessageChannel post',
    desc: 'Scheduler는 즉시 실행하지 않고 MessageChannel을 통해 매크로태스크로 등록합니다. 이를 통해 현재 실행 중인 JavaScript 작업이 먼저 완료되고, 브라우저가 paint를 수행할 기회를 얻습니다.',
    code: 'const { port1, port2 } = new MessageChannel();\nport1.onmessage = performWorkUntilDeadline;\nport2.postMessage(null); // 비동기 트리거',
    color: '#eab308',
  },
  {
    id: 3,
    title: '4. performWorkUntilDeadline',
    desc: '다음 매크로태스크에서 실행됩니다. 현재 프레임의 deadline(5ms)을 설정하고 workLoop를 시작합니다.',
    code: 'function performWorkUntilDeadline() {\n  const deadline = currentTime + frameInterval; // 5ms\n  let hasMoreWork = true;\n  try {\n    hasMoreWork = scheduledHostCallback(\n      hasTimeRemaining,\n      deadline\n    );\n  } finally {\n    if (hasMoreWork) port2.postMessage(null); // yield 후 재개\n  }\n}',
    color: '#22c55e',
  },
  {
    id: 4,
    title: '5. shouldYield() 체크',
    desc: 'workLoop 내 각 Fiber 처리 후 shouldYield()를 확인합니다. 5ms 타임슬롯을 초과하면 작업을 중단하고 브라우저에 제어권을 반환합니다.',
    code: 'function workLoopConcurrent() {\n  while (workInProgress !== null && !shouldYield()) {\n    performUnitOfWork(workInProgress);\n  }\n}\nfunction shouldYield() {\n  return getCurrentTime() >= deadline; // 5ms 초과 시 true\n}',
    color: '#06b6d4',
  },
  {
    id: 5,
    title: '6. 재개 또는 Commit',
    desc: 'shouldYield()가 true이면 port2.postMessage(null)로 다음 프레임에 작업을 재개합니다. 모든 Fiber 처리가 완료되면 Commit Phase를 시작합니다.',
    code: '// 모든 작업 완료 시:\nif (workInProgress === null) {\n  finishConcurrentRender(root, exitStatus);\n  // → commitRoot(root)\n}',
    color: '#a78bfa',
  },
];

function MessageChannelTab() {
  const [activeStep, setActiveStep] = useState(0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* 개념 */}
      <div className="card" style={{ background: 'rgba(16,185,129,0.06)', borderColor: 'rgba(16,185,129,0.25)' }}>
        <div className="card-title" style={{ color: 'var(--success)' }}>왜 MessageChannel인가?</div>
        <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.8 }}>
          React는 <strong style={{ color: 'var(--text)' }}>setTimeout(0)</strong> 대신 <strong style={{ color: '#22c55e' }}>MessageChannel</strong>을 사용합니다.
          이유: setTimeout은 중첩될수록 최소 4ms 지연이 생기지만, MessageChannel은 <strong style={{ color: 'var(--text)' }}>0ms 매크로태스크</strong>로 즉시 다음 이벤트 루프 순서에 실행됩니다.
          이를 통해 React는 5ms 단위로 작업을 쪼개어 브라우저의 paint와 입력 이벤트 처리를 방해하지 않습니다.
        </div>
      </div>

      {/* 스텝 타임라인 */}
      <div className="card">
        <div className="card-title">MessageChannel 기반 스케줄링 플로우</div>
        {/* 진행 바 */}
        <div style={{ display: 'flex', gap: '4px', marginBottom: '20px' }}>
          {MSG_CHANNEL_STEPS.map((s) => (
            <div
              key={s.id}
              onClick={() => setActiveStep(s.id)}
              style={{
                flex: 1, height: '4px', borderRadius: '2px',
                background: activeStep >= s.id ? s.color : 'var(--border)',
                cursor: 'pointer', transition: 'background 0.3s',
              }}
            />
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: '16px', alignItems: 'start' }}>
          {/* 스텝 목록 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {MSG_CHANNEL_STEPS.map((s) => (
              <div
                key={s.id}
                onClick={() => setActiveStep(s.id)}
                style={{
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: `1px solid ${activeStep === s.id ? s.color : 'transparent'}`,
                  background: activeStep === s.id ? `${s.color}15` : 'transparent',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                <span style={{
                  fontFamily: 'var(--font-mono)', fontSize: '11px',
                  color: activeStep === s.id ? s.color : 'var(--text-secondary)',
                  fontWeight: activeStep === s.id ? 700 : 400,
                }}>
                  {s.title}
                </span>
              </div>
            ))}
          </div>

          {/* 스텝 상세 */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeStep}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.2 }}
            >
              {(() => {
                const s = MSG_CHANNEL_STEPS[activeStep];
                return (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{
                      padding: '12px 16px', borderRadius: '8px',
                      border: `1px solid ${s.color}40`,
                      background: `${s.color}10`,
                    }}>
                      <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.8 }}>
                        {s.desc}
                      </div>
                    </div>
                    <div className="code-block" style={{ fontSize: '12px', lineHeight: 1.8, whiteSpace: 'pre' }}>
                      {s.code.split('\n').map((line, i) => (
                        <div key={i}>{line}</div>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* 네비게이션 */}
        <div style={{ display: 'flex', gap: '8px', marginTop: '16px', justifyContent: 'flex-end' }}>
          <button className="btn btn-secondary" onClick={() => setActiveStep((s) => Math.max(s - 1, 0))} disabled={activeStep === 0} style={{ fontSize: '11px', padding: '4px 12px' }}>
            ← 이전
          </button>
          <button className="btn btn-primary" onClick={() => setActiveStep((s) => Math.min(s + 1, MSG_CHANNEL_STEPS.length - 1))} disabled={activeStep === MSG_CHANNEL_STEPS.length - 1} style={{ fontSize: '11px', padding: '4px 12px' }}>
            다음 →
          </button>
        </div>
      </div>

      {/* 이벤트 루프 다이어그램 */}
      <div className="card">
        <div className="card-title">이벤트 루프에서 React 작업 위치</div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap', padding: '8px 0' }}>
          {[
            { label: 'JS 실행', color: '#ef4444', desc: 'Call Stack' },
            { label: '→', color: 'var(--text-muted)', desc: '' },
            { label: 'Microtask', color: '#f97316', desc: 'Promise.then, queueMicrotask' },
            { label: '→', color: 'var(--text-muted)', desc: '' },
            { label: 'rAF', color: '#22c55e', desc: 'requestAnimationFrame (paint 직전)' },
            { label: '→', color: 'var(--text-muted)', desc: '' },
            { label: 'Paint', color: '#a78bfa', desc: '브라우저 렌더링' },
            { label: '→', color: 'var(--text-muted)', desc: '' },
            { label: 'MessageChannel', color: '#06b6d4', desc: '← React Scheduler 여기!' },
            { label: '→', color: 'var(--text-muted)', desc: '' },
            { label: 'setTimeout', color: '#6366f1', desc: '최소 4ms 지연' },
          ].map((item, i) => (
            item.label === '→' ? (
              <span key={i} style={{ color: item.color, fontSize: '18px' }}>→</span>
            ) : (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                <div style={{
                  padding: '6px 12px', borderRadius: '6px',
                  border: `1px solid ${item.color}60`,
                  background: `${item.color}15`,
                  fontFamily: 'var(--font-mono)', fontSize: '12px', color: item.color, fontWeight: 600,
                }}>
                  {item.label}
                </div>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)', textAlign: 'center', maxWidth: '100px' }}>
                  {item.desc}
                </span>
              </div>
            )
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── 메인 Chapter6 ────────────────────────────────────────────────────────────
export function Chapter6() {
  const [activeTab, setActiveTab] = useState('lanes');

  return (
    <div>
      <ChapterHeader
        number={3}
        title="Scheduler +"
        titleHighlight="Lanes"
        description="React 18의 우선순위 시스템 핵심: 비트마스크 기반 Lanes 모델과 MessageChannel을 이용한 Scheduler 내부 동작 원리를 심층 분석합니다."
      />

      {/* 탭 네비게이션 */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '20px', borderBottom: '1px solid var(--border)', paddingBottom: '0' }}>
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '8px 16px',
              background: 'transparent',
              border: 'none',
              borderBottom: `2px solid ${activeTab === tab.id ? 'var(--primary)' : 'transparent'}`,
              color: activeTab === tab.id ? 'var(--text)' : 'var(--text-secondary)',
              fontFamily: 'var(--font-mono)',
              fontSize: '12px',
              fontWeight: activeTab === tab.id ? 700 : 400,
              cursor: 'pointer',
              transition: 'all 0.2s',
              marginBottom: '-1px',
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
          {activeTab === 'lanes' && <LanesTab />}
          {activeTab === 'scheduler' && <SchedulerTab />}
          {activeTab === 'msgchannel' && <MessageChannelTab />}
        </motion.div>
      </AnimatePresence>

      <SummaryBox
        items={[
          'Lanes는 비트마스크(bitmask) 기반 우선순위 시스템입니다. getHighestPriorityLane()은 lanes & -lanes (LSB 추출)로 최고 우선순위를 O(1)에 구합니다.',
          'Scheduler는 Min-Heap으로 태스크를 관리하며, expirationTime이 가장 작은 태스크부터 처리합니다.',
          'MessageChannel을 통해 현재 JS 실행을 블로킹하지 않고 다음 이벤트 루프에서 React 작업을 실행합니다.',
          '5ms 타임슬롯(frameInterval): shouldYield()가 현재 시간이 deadline을 초과하면 true를 반환하여 workLoop를 중단합니다.',
          'React 17의 expirationTime 모델 → React 18 Lanes 모델: 비트마스크로 여러 업데이트를 배치하고 더 세밀한 우선순위 제어가 가능해졌습니다.',
        ]}
      />
    </div>
  );
}
