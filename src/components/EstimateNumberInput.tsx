import React, { useEffect, useId, useState } from "react";

/** Keep in-progress text editable; only validated numbers enter quote state. */
export function EstimateNumberInput({ label, value, min, max, onChange, className, required = false }: {
  label: string; value: number | null; min: number; max: number;
  onChange: (value: number | null) => void; className?: string; required?: boolean;
}) {
  const [draft, setDraft] = useState(value === null ? "" : String(value));
  const [error, setError] = useState("");
  const errorId = useId();
  useEffect(() => { setDraft(value === null ? "" : String(value)); }, [value]);
  const valid = (raw: string) => {
    const n = Number(raw.replace(",", "."));
    return raw.trim() !== "" && Number.isFinite(n) && n >= min && n <= max ? n : null;
  };
  return <>
    <input aria-label={label} type="text" inputMode="decimal" className={className}
      aria-invalid={!!error} aria-describedby={error ? errorId : undefined} value={draft}
      onChange={e => {
        const raw = e.target.value; setDraft(raw); setError("");
        if (!raw.trim() && value === null) return;
        if (!raw.trim() && min > 0) return;
        const n = valid(raw); if (n !== null) onChange(n);
      }}
      onBlur={() => {
        if (!draft.trim() && value === null) { onChange(null); return; }
        if (!draft.trim() && !required) { onChange(null); return; }
        const n = valid(draft);
        if (n !== null) { onChange(n); setDraft(String(n)); return; }
        setDraft(value === null ? "" : String(value));
        setError(`${min}~${max} 사이로 입력해 주세요. 이전 값으로 되돌렸습니다.`);
      }}
      onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); e.currentTarget.blur(); } }} />
    {error && <span id={errorId} role="alert" className="block mt-1 text-xs text-rose-700">{error}</span>}
  </>;
}
