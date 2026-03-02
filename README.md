# React Fiber Visualizer

React 내부 아키텍처(Fiber)를 단계별로 시각화하는 인터랙티브 학습 사이트입니다.

## 📚 학습 챕터

| # | 챕터 | 내용 |
|---|------|------|
| 1 | **JSX → Fiber Node** | JSX가 React Element를 거쳐 Fiber Node로 변환되는 3단계 과정 |
| 2 | **Fiber Tree 구조** | child / sibling / return 포인터로 구성된 연결 리스트 트리 |
| 3 | **Scheduler + Lanes** | 비트마스크 Lanes 모델과 MessageChannel 기반 Scheduler 내부 동작 |
| 4 | **Work Loop** | beginWork ↓ / completeWork ↑ DFS 순회 과정 단계별 시뮬레이션 |
| 5 | **Reconciliation** | current ↔ workInProgress 비교 및 key 기반 매칭 전략 |
| 6 | **Commit Phase** | beforeMutation → mutation → layout 3단계 DOM 반영 과정 |
| 7 | **Concurrent Mode** | Time Slicing, Interruptible Rendering, useTransition, useDeferredValue |

## 🛠 Tech Stack

- **React 19** + **TypeScript**
- **Vite**
- **Framer Motion**

## 🚀 로컬 실행

```bash
npm install
npm run dev
```

## 🏗 빌드

```bash
npm run build
```

## 📖 주요 개념

### Fiber Node
React의 작업 단위. 각 컴포넌트에 대응하는 JavaScript 객체로, `child` / `sibling` / `return` 포인터로 트리를 구성합니다.

### 더블 버퍼링
`current` tree와 `workInProgress` tree를 `alternate` 포인터로 연결하여 교체합니다. 매 렌더링마다 새 Fiber 객체를 생성하지 않고 재활용합니다.

### Lanes
비트마스크 기반 우선순위 모델. `SyncLane`, `TransitionLane`, `IdleLane` 등 31개의 Lane으로 작업 우선순위를 관리합니다.

### Work Loop
`beginWork`(내려가며 WIP 생성)와 `completeWork`(올라오며 effect 수집)로 구성된 DFS 순회. `shouldYield()`로 5ms마다 브라우저에 제어를 양보합니다.

### Commit Phase
Render Phase 완료 후 실제 DOM 반영. `beforeMutation` → `mutation` → `layout` 3개의 서브페이즈로 구성됩니다.
