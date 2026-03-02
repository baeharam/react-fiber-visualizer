import { motion } from 'framer-motion';

export type FiberNodeStatus = 'default' | 'highlight' | 'active' | 'complete' | 'modified' | 'added' | 'deleted';

export interface FiberNodeData {
  id: string;
  type: string;
  key?: string | null;
  stateNode?: string;
  child?: string | null;
  sibling?: string | null;
  return?: string | null;
  flags?: string;
  lanes?: string;
  pendingProps?: string;
  memoizedState?: string;
}

interface FiberNodeCardProps {
  node: FiberNodeData;
  status?: FiberNodeStatus;
  onClick?: () => void;
  compact?: boolean;
  delay?: number;
}

export function FiberNodeCard({
  node,
  status = 'default',
  onClick,
  compact = false,
  delay = 0,
}: FiberNodeCardProps) {
  const statusClass = status !== 'default' ? status : '';

  return (
    <motion.div
      className={`fiber-node ${statusClass}`}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay }}
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
      whileHover={onClick ? { scale: 1.02 } : undefined}
    >
      <div className="fiber-node-type">{node.type}</div>
      {!compact && (
        <>
          {node.key !== undefined && (
            <div className="fiber-node-field">
              <span className="fiber-node-key">key:</span>
              <span className="fiber-node-val">{node.key === null ? 'null' : `"${node.key}"`}</span>
            </div>
          )}
          {node.stateNode && (
            <div className="fiber-node-field">
              <span className="fiber-node-key">stateNode:</span>
              <span className="fiber-node-val">{node.stateNode}</span>
            </div>
          )}
          {node.flags && (
            <div className="fiber-node-field">
              <span className="fiber-node-key">flags:</span>
              <span className="fiber-node-val">{node.flags}</span>
            </div>
          )}
        </>
      )}
      {node.child && (
        <div className="fiber-node-field">
          <span className="fiber-node-key">child:</span>
          <span className="fiber-node-val pointer">→ {node.child}</span>
        </div>
      )}
      {node.sibling && (
        <div className="fiber-node-field">
          <span className="fiber-node-key">sibling:</span>
          <span className="fiber-node-val pointer">→ {node.sibling}</span>
        </div>
      )}
      {node.return && (
        <div className="fiber-node-field">
          <span className="fiber-node-key">return:</span>
          <span className="fiber-node-val pointer">↑ {node.return}</span>
        </div>
      )}
    </motion.div>
  );
}
