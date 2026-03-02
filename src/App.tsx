import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Chapter1 } from './chapters/Chapter1';
import { Chapter2 } from './chapters/Chapter2';
import { Chapter3 } from './chapters/Chapter3';
import { Chapter4 } from './chapters/Chapter4';
import { Chapter5 } from './chapters/Chapter5';
import { Chapter6 } from './chapters/Chapter6';
import { Chapter7 } from './chapters/Chapter7';
import './index.css';

interface ChapterMeta {
  id: number;
  title: string;
  shortTitle: string;
  desc: string;
  tag: string;
  tagColor: string;
}

const CHAPTERS: ChapterMeta[] = [
  {
    id: 1,
    title: 'JSX → Fiber Node',
    shortTitle: 'JSX → Fiber',
    desc: 'JSX가 React Element를 거쳐 Fiber Node로 변환되는 3단계 과정',
    tag: 'Fundamentals',
    tagColor: '#e06c75',
  },
  {
    id: 2,
    title: 'Fiber Tree 구조',
    shortTitle: 'Fiber Tree',
    desc: 'child / sibling / return 포인터로 구성된 연결 리스트 트리',
    tag: 'Data Structure',
    tagColor: '#06b6d4',
  },
  {
    id: 3,
    title: 'Scheduler + Lanes',
    shortTitle: 'Scheduler',
    desc: '비트마스크 Lanes 모델과 MessageChannel 기반 Scheduler 내부 동작',
    tag: 'Scheduling',
    tagColor: '#f97316',
  },
  {
    id: 4,
    title: 'Work Loop',
    shortTitle: 'Work Loop',
    desc: 'beginWork ↓ / completeWork ↑ DFS 순회 과정 단계별 시뮬레이션',
    tag: 'Render Phase',
    tagColor: '#10b981',
  },
  {
    id: 5,
    title: 'Reconciliation',
    shortTitle: 'Diffing',
    desc: 'current ↔ workInProgress 비교 및 key 기반 매칭 전략',
    tag: 'Diffing',
    tagColor: '#f59e0b',
  },
  {
    id: 6,
    title: 'Commit Phase',
    shortTitle: 'Commit',
    desc: 'beforeMutation → mutation → layout 3단계 DOM 반영 과정',
    tag: 'Commit Phase',
    tagColor: '#a78bfa',
  },
  {
    id: 7,
    title: 'Concurrent Mode',
    shortTitle: 'Concurrent',
    desc: 'Time Slicing, Interruptible Rendering, useTransition, useDeferredValue',
    tag: 'Concurrent',
    tagColor: '#06b6d4',
  },
];

const CHAPTER_COMPONENTS = [Chapter1, Chapter2, Chapter6, Chapter3, Chapter4, Chapter5, Chapter7];

export default function App() {
  const [activeChapter, setActiveChapter] = useState(1);

  const ChapterComponent = CHAPTER_COMPONENTS[activeChapter - 1];

  return (
    <div className="app-layout">
      {/* 사이드바 */}
      <aside className="sidebar">
        {/* 로고 영역 */}
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <div className="sidebar-logo-icon">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <circle cx="9" cy="9" r="3" fill="white" opacity="0.9" />
                <ellipse cx="9" cy="9" rx="8" ry="3.5" stroke="white" strokeWidth="1.2" fill="none" opacity="0.6" />
                <ellipse cx="9" cy="9" rx="8" ry="3.5" stroke="white" strokeWidth="1.2" fill="none" opacity="0.6" transform="rotate(60 9 9)" />
                <ellipse cx="9" cy="9" rx="8" ry="3.5" stroke="white" strokeWidth="1.2" fill="none" opacity="0.6" transform="rotate(120 9 9)" />
              </svg>
            </div>
            <div>
              <div className="sidebar-title">React Fiber</div>
              <div className="sidebar-subtitle">Visualizer</div>
            </div>
          </div>
          <div
            style={{
              marginTop: '12px',
              fontSize: '11px',
              color: 'var(--text-muted)',
              lineHeight: 1.6,
              fontFamily: 'var(--font-mono)',
            }}
          >
            React 내부 아키텍처를<br />
            단계별로 시각화합니다
          </div>
        </div>

        {/* 네비게이션 */}
        <nav className="sidebar-nav">
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '10px',
              fontWeight: 700,
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              marginBottom: '8px',
              padding: '0 4px',
            }}
          >
            학습 챕터
          </div>
          {CHAPTERS.map((ch) => (
            <div
              key={ch.id}
              className={`nav-item ${activeChapter === ch.id ? 'active' : ''}`}
              onClick={() => setActiveChapter(ch.id)}
            >
              <div className="nav-item-number">{ch.id}</div>
              <div className="nav-item-content">
                <div className="nav-item-title">{ch.title}</div>
                <div className="nav-item-desc">{ch.desc}</div>
                <div style={{ marginTop: '4px' }}>
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '9px',
                      fontWeight: 700,
                      color: ch.tagColor,
                      background: `${ch.tagColor}20`,
                      padding: '1px 6px',
                      borderRadius: '3px',
                      border: `1px solid ${ch.tagColor}30`,
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                    }}
                  >
                    {ch.tag}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </nav>

        {/* 하단 정보 */}
        <div
          style={{
            padding: '16px 20px',
            borderTop: '1px solid var(--border)',
            fontSize: '11px',
            color: 'var(--text-muted)',
            fontFamily: 'var(--font-mono)',
            lineHeight: 1.8,
          }}
        >
          <div style={{ marginBottom: '4px', color: 'var(--text-secondary)', fontWeight: 600 }}>
            Tech Stack
          </div>
          <div>React 19 · TypeScript</div>
          <div>framer-motion · Vite</div>
          <div style={{ marginTop: '8px', color: 'var(--text-muted)' }}>
            React Fiber Internals
          </div>
        </div>
      </aside>

      {/* 메인 컨텐츠 */}
      <main className="main-content">
        {/* 상단 탑바 */}
        <div
          style={{
            height: '48px',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            padding: '0 40px',
            gap: '8px',
            background: 'var(--surface)',
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', gap: '6px' }}>
            {[1, 2, 3, 4, 5, 6, 7].map((n) => (
              <button
                key={n}
                onClick={() => setActiveChapter(n)}
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '6px',
                  background: activeChapter === n ? 'var(--primary)' : 'var(--surface-2)',
                  border: `1px solid ${activeChapter === n ? 'var(--primary)' : 'var(--border)'}`,
                  color: activeChapter === n ? 'white' : 'var(--text-secondary)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: activeChapter === n ? '0 0 12px var(--primary-glow)' : 'none',
                }}
              >
                {n}
              </button>
            ))}
          </div>
          <div
            style={{
              marginLeft: '12px',
              fontFamily: 'var(--font-mono)',
              fontSize: '12px',
              color: 'var(--text-secondary)',
            }}
          >
            {CHAPTERS[activeChapter - 1].shortTitle}
          </div>
          <div style={{ flex: 1 }} />
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '10px',
              color: 'var(--text-muted)',
            }}
          >
            {activeChapter} / 7
          </div>
          <div
            style={{
              display: 'flex',
              gap: '8px',
              marginLeft: '8px',
            }}
          >
            <button
              className="btn btn-secondary"
              onClick={() => setActiveChapter((c) => Math.max(c - 1, 1))}
              disabled={activeChapter === 1}
              style={{ fontSize: '11px', padding: '4px 10px' }}
            >
              ← 이전 챕터
            </button>
            <button
              className="btn btn-primary"
              onClick={() => setActiveChapter((c) => Math.min(c + 1, 7))}
              disabled={activeChapter === 7}
              style={{ fontSize: '11px', padding: '4px 10px' }}
            >
              다음 챕터 →
            </button>
          </div>
        </div>

        {/* 챕터 컨텐츠 */}
        <div className="chapter-content">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeChapter}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
              <ChapterComponent />
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
