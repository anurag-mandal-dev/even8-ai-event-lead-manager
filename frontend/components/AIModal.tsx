"use client";

type Props = {
  title: string;
  result: string;
  onClose: () => void;
};

export default function AIModal({ title, result, onClose }: Props) {
  async function copy() {
    await navigator.clipboard.writeText(result);
  }

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label={title} onMouseDown={(e) => e.currentTarget === e.target && onClose()}>
      <div className="modal">
        <div className="form-header">
          <div><p className="eyebrow">AI assistant</p><h2>{title}</h2></div>
          <button className="icon-button" onClick={onClose} aria-label="Close">×</button>
        </div>
        <div className="ai-result">{result}</div>
        <div className="form-actions">
          <button className="button secondary" onClick={onClose}>Close</button>
          <button className="button primary" onClick={copy}>Copy result</button>
        </div>
      </div>
    </div>
  );
}
