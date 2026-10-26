import React, { useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { Calculator, CheckCircle2, Phone, Send, Loader2, ArrowUpRight } from "lucide-react";
import { MetaManager } from "../components/seo/MetaManager";
import { SITE_CONFIG } from "../config/siteConfig";
import { db } from "../firebase";
import {
  WALLPAPER_OPTIONS, FLOOR_OPTIONS, BATHROOM_OPTIONS, PUBLIC_SOURCES, WINDOW_OPTIONS,
  FILM_QUANTITY_OPTIONS, filmPrice, DOOR_OPTIONS, MOLDING_OPTIONS, EXTRA_WORK_SCOPES, EXTRA_WORK_OPTIONS,
  type ExtraWorkChoice,
  defaultPublicSelection, calculatePublicSelection, formatWon, publicSelectionSummary,
  type PublicSelection32,
} from "../../shared/publicEstimate32";

const control = "mt-2 w-full rounded-xl border border-stone-300 bg-white p-3 text-sm text-stone-900 focus:outline-amber-500";
const card = "rounded-2xl border border-stone-200 bg-white p-5 sm:p-6";
const choiceLabel = (o: { label: string; price: number | null }) => `${o.label}${o.price === null ? "" : ` · ${formatWon(o.price)}`}`;

export function PublicEstimatePage() {
  const [selection, setSelection] = useState(defaultPublicSelection);
  const quote = useMemo(() => calculatePublicSelection(selection), [selection]);
  const [contact, setContact] = useState({ name: "", phone: "", location: "", details: "" });
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const lock = useRef(false);
  const update = (patch: Partial<PublicSelection32>) => {
    setSelection(prev => ({ ...prev, ...patch })); setSaved(false); setError(""); setNotice("");
  };
  const bathChange = (index: number, patch: Partial<PublicSelection32["bathrooms"][number]>) => {
    const bathrooms = selection.bathrooms.map((bath, i) => {
      if (i !== index) return bath;
      const next = { ...bath, ...patch };
      if (!["overlay", "full"].includes(next.method)) next.largeTile = false;
      return next;
    });
    update({ bathrooms });
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (lock.current || saved) return;
    setError("");
    if (!quote.hasSelection) { setError("원하시는 공사 항목을 선택해 주세요."); return; }
    if (!contact.name.trim() || !contact.location.trim() || !/^0\d{8,11}$/.test(contact.phone.replace(/[-\s]/g, ""))) { setError("이름·공사 지역·연락 가능한 전화번호를 확인해 주세요."); return; }
    if (!consent) { setError("상담을 위한 개인정보 수집·이용에 동의해 주세요."); return; }
    lock.current = true; setBusy(true); setNotice("");
    try {
      // Recalculate on the server: the saved quote never trusts client-supplied prices.
      const response = await fetch("/api/ai-estimate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ publicSelection: selection }), signal: AbortSignal.timeout(15000) });
      const result = await response.json();
      if (!response.ok || !result.success || result.source !== "public-reference") throw new Error(result.error || "선택 견적 확인에 실패했습니다.");
      const isPreview = window.location.hostname.endsWith(".vercel.app") &&
        window.location.hostname !== new URL(SITE_CONFIG.seo.canonicalUrl).hostname;
      const isTest = isPreview || /^\[TEST\]/i.test(contact.name.trim());
      const details = `${isTest ? "[TEST] 테스트 접수 · 실적 집계 제외 · 실제 고객 연락 금지\n" : ""}${publicSelectionSummary(selection, result.data)}\n추가 요청: ${contact.details.trim() || "없음"}`;
      const payload = { name: contact.name.trim(), phone: contact.phone.trim(), location: contact.location.trim(), spaceType: "아파트", area: "32", startDate: "협의", details };
      let sessionId = "";
      try {
        sessionId = sessionStorage.getItem("gene_conversion_session_id") || `s_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
        sessionStorage.setItem("gene_conversion_session_id", sessionId);
      } catch { /* The consultation can still be saved if browser storage is unavailable. */ }
      const doc = await addDoc(collection(db, "consultations"), {
        ...payload, status: "new", source: "ai-estimate", estimateType: "public-selection-32",
        sessionId, isTest, excludeFromMetrics: isTest,
        estimateConditions: selection, publicEstimateSnapshot: result.data, createdAt: serverTimestamp(),
      });
      setSaved(true);
      try {
        const notified = await fetch("/api/notify-kakao", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...payload, docPath: doc.path, createdAt: new Date().toLocaleString("ko-KR") }), signal: AbortSignal.timeout(10000) });
        const notification = await notified.json();
        if (!notified.ok || !notification.success) setNotice("담당자 알림 확인이 지연됩니다. 상담은 저장되어 다시 접수하지 않으셔도 됩니다.");
      } catch { setNotice("담당자 알림 확인이 지연됩니다. 상담은 저장되어 다시 접수하지 않으셔도 됩니다."); }
    } catch (err: any) { setError(err?.name === "TimeoutError" ? "견적 확인 시간이 초과되었습니다. 잠시 후 다시 시도해 주세요." : "상담을 저장하지 못했습니다. 잠시 후 다시 시도하거나 전화로 문의해 주세요."); }
    finally { lock.current = false; setBusy(false); }
  };

  return <div className="mx-auto max-w-7xl px-4 py-10 lg:px-8 space-y-6">
    <MetaManager title="32평 아파트 공종 선택형 예상견적" description="합지·실크, 장판·마루, 욕실 철거·방수와 주방을 선택해 공개 시공가격 기준의 참고 소계를 확인하세요." canonicalPath="/ai-estimate" />
    <header className="rounded-3xl bg-stone-950 text-white p-6 sm:p-10 space-y-4">
      <p className="text-amber-300 text-xs font-bold tracking-wide">지니 인테리어 · 공종 선택형 예상견적</p>
      <h1 className="text-3xl sm:text-4xl font-black break-keep leading-tight">원하는 공사를 고르면,<br />예상 금액이 바로 바뀝니다.</h1>
      <p className="text-stone-300 text-sm leading-6 max-w-3xl">공급 32평 아파트를 기준으로 공종과 자재를 선택해 보세요. 인터넷에 공개된 타 업체 견적을 참고하며, 지니 인테리어의 확정 견적은 상담·실측 후 안내합니다.</p>
    </header>
    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-stone-700 leading-6">
      기준은 <strong>공급 32평 · 전용 약 24평 예시</strong>입니다. 실제 도면의 면적과 다를 수 있습니다. 원문마다 부가세·철거·보양 조건이 달라, 아래 소계는 전체 공사 총액이 아닙니다.
    </div>
    <div className="lg:hidden sticky top-24 z-20 rounded-xl border border-amber-300 bg-white/95 shadow-md p-3 flex items-center justify-between gap-3" aria-live="polite">
      <div><p className="text-xs text-stone-500">가격 확인 항목 소계</p><strong className="text-lg">{quote.subtotalWon === null ? (quote.hasSelection ? "금액 확인 필요" : "항목을 선택해 주세요") : formatWon(quote.subtotalWon)}</strong></div>
      <a href="#selected-estimate" className="text-xs font-bold text-amber-800 underline shrink-0">상세 내역</a>
    </div>
    <div className="grid lg:grid-cols-12 gap-6 items-start">
      <fieldset disabled={busy} className="lg:col-span-7 min-w-0 space-y-4">
        <legend className="sr-only">공사 항목 선택</legend>
        <section className={card}>
          <h2 className="font-black text-lg">1. 현장 조건</h2>
          <div className="grid sm:grid-cols-3 gap-4 mt-3">
            <label className="text-sm font-bold">거주 상태<select aria-label="거주 상태" className={control} value={selection.occupied ? "occupied" : "empty"} onChange={e => update({ occupied: e.target.value === "occupied" })}><option value="empty">빈집</option><option value="occupied">거주 중</option></select></label>
            <label className="text-sm font-bold">확장 여부<select aria-label="확장 여부" className={control} value={selection.expanded ? "yes" : "no"} onChange={e => update({ expanded: e.target.value === "yes" })}><option value="no">미확장</option><option value="yes">확장</option></select></label>
            <label className="text-sm font-bold">엘리베이터<select aria-label="엘리베이터" className={control} value={selection.elevator ? "yes" : "no"} onChange={e => update({ elevator: e.target.value === "yes" })}><option value="yes">있음</option><option value="no">없음</option></select></label>
          </div>
        </section>
        <section className={card}>
          <h2 className="font-black text-lg">2. 도배</h2>
          <label className="text-sm block mt-2">벽지 종류<select aria-label="벽지 종류" className={control} value={selection.wallpaper} onChange={e => update({ wallpaper: e.target.value })}>{WALLPAPER_OPTIONS.map(o => <option key={o.id} value={o.id}>{choiceLabel(o)}</option>)}</select></label>
          <p className="text-xs text-stone-500 mt-3">전체 합지·실크는 천장을 포함하는 공개 견적 예시입니다. 벽면 보수와 확장 면적은 별도 확인합니다.</p>
        </section>
        <section className={card}>
          <h2 className="font-black text-lg">3. 바닥</h2>
          <label className="text-sm block mt-2">바닥재<select aria-label="바닥재" className={control} value={selection.floor} onChange={e => update({ floor: e.target.value })}>{FLOOR_OPTIONS.map(o => <option key={o.id} value={o.id}>{choiceLabel(o)}</option>)}</select></label>
          {selection.floor !== "keep" && <label className="text-sm block mt-4">기존 바닥 철거<select aria-label="기존 바닥 철거" className={control} value={selection.floorRemoval} onChange={e => update({ floorRemoval: e.target.value })}><option value="unknown">필요 여부를 모르겠어요</option><option value="none">기존 바닥 철거 없음</option><option value="vinyl">기존 장판 철거 필요</option><option value="wood">기존 마루 철거 필요</option></select></label>}
        </section>
        <section className={card}>
          <h2 className="font-black text-lg">4. 욕실</h2>
          <p className="text-xs text-stone-500 mt-2">욕실별로 선택하세요. 전체 철거+방수는 하나의 패키지로 계산해 방수비를 중복해서 더하지 않습니다.</p>
          {selection.bathrooms.map((bath, index) => <div key={index} className="mt-4 rounded-xl bg-stone-50 p-4">
            <label className="text-sm font-bold">욕실 {index + 1}<select aria-label={`욕실 ${index + 1} 공사`} className={control} value={bath.method} onChange={e => bathChange(index, { method: e.target.value })}>{BATHROOM_OPTIONS.map(o => <option key={o.id} value={o.id}>{choiceLabel(o)}</option>)}</select></label>
            {["overlay", "full"].includes(bath.method) && <label className="mt-4 flex gap-2 text-sm items-start"><input type="checkbox" className="mt-1" checked={bath.largeTile} onChange={e => bathChange(index, { largeTile: e.target.checked })} />욕실 {index + 1} 전체 600×600 타일 변경 · +800,000원</label>}
          </div>)}
        </section>
        <section className={card}>
          <h2 className="font-black text-lg">5. 주방</h2>
          <label className="flex items-center gap-2 text-sm mt-4"><input type="checkbox" checked={selection.kitchen} onChange={e => update({ kitchen: e.target.checked })} />주방 기본 구성 교체</label>
          {selection.kitchen && <div className="mt-4 space-y-3"><label className="block text-sm">주방 길이(m)<input aria-label="주방 길이(m)" className={control} type="number" min="1" max="12" step="0.1" value={selection.kitchenLengthM} onChange={e => { const n = Number(e.target.value); if (Number.isFinite(n) && n >= 1 && n <= 12) update({ kitchenLengthM: n }); }} /></label><p className="text-xs text-stone-500 leading-5">상·하부장, 기본 상판·후드·수전·싱크볼 예시입니다. ㄱ/ㄷ자는 연결부를 포함한 총 길이를 확인해야 하며 기존 가구 철거·설비 이동 등은 별도입니다.</p></div>}
        </section>
        <section className={card}>
          <h2 className="font-black text-lg">6. 샤시</h2>
          <label className="flex items-center gap-2 text-sm mt-4"><input type="checkbox" checked={selection.windows} onChange={e => update({ windows: e.target.checked, windowScope: "unknown" })} />샷시 교체</label>
          {selection.windows && <div className="mt-4"><label className="text-sm">교체 범위<select aria-label="샤시 교체 범위" className={control} value={selection.windowScope ?? "unknown"} onChange={e => update({ windowScope: e.target.value })}>{WINDOW_OPTIONS.map(o => <option key={o.id} value={o.id}>{choiceLabel(o)}</option>)}</select></label><p className="text-xs text-stone-500 leading-5 mt-3">30평대 공개 시공 예시입니다. 내창+외창은 묶음 가격으로 계산합니다. 실제 창 수·규격·브랜드·유리와 철거·양중 조건은 별도 확인합니다.</p></div>}
        </section>
        <section className={card}>
          <h2 className="font-black text-lg">7. 필름</h2>
          <label className="flex items-center gap-2 text-sm mt-4"><input type="checkbox" checked={selection.film} onChange={e => update({ film: e.target.checked, filmDoors: 0, filmShoeCabinets: 0, filmEntryDoors: 0 })} />필름 공사</label>
          {selection.film && <div className="space-y-4 mt-4">
            {([
              ["filmDoors", "doors", "문·문틀 필름 수량"],
              ["filmShoeCabinets", "shoeCabinets", "신발장 필름 수량"],
              ["filmEntryDoors", "entryDoors", "현관문 안쪽 필름 수량"],
            ] as const).map(([key, part, label]) => <label key={key} className="block text-sm">{label}<select aria-label={label} disabled={key === "filmShoeCabinets" && selection.shoeCabinet} className={control} value={selection[key] ?? 0} onChange={e => update({ [key]: Number(e.target.value) })}>{FILM_QUANTITY_OPTIONS.map(count => <option key={count} value={count}>{count === 0 ? "시공 안 함" : `${count}개 · ${filmPrice(part, count) === null ? "가격 확인 필요" : formatWon(filmPrice(part, count)!)}`}</option>)}</select></label>)}
            <p className="text-xs text-stone-500 leading-5">수량별 공개 금액이며 개당 가격을 곱하지 않습니다. 4개 등 원문에 없는 수량은 별도 확인으로 남깁니다. 신발장 수량을 문짝 수로 자동 환산하지 않습니다. 실제 단위·규격, 여러 부위 묶음 금액과 바탕 보수·부속품은 상담으로 확인합니다.</p>
            {selection.shoeCabinet && <p className="text-xs text-amber-800">신발장 교체를 선택해 같은 대상의 필름 시공은 제외했습니다.</p>}
          </div>}
        </section>
        <section className={card}>
          <h2 className="font-black text-lg">8. 신발장</h2>
          <label className="flex items-center gap-2 text-sm mt-4"><input type="checkbox" checked={selection.shoeCabinet} onChange={e => update({ shoeCabinet: e.target.checked, filmShoeCabinets: e.target.checked ? 0 : selection.filmShoeCabinets ?? 0 })} />신발장 교체</label>
          <p className="text-xs text-stone-500 leading-5 mt-3">신발장은 크기·도어 사양·현장 설치 및 철거 범위를 확인한 후 별도 안내합니다. 교체와 같은 대상의 필름 시공을 중복해서 계산하지 않습니다.</p>
        </section>
        <section className={card}>
          <h2 className="font-black text-lg">9. 추가 공사 범위</h2>
          <p className="text-xs text-stone-600 mt-2 leading-5">원하는 공사를 선택해 주세요. 방문·몰딩은 사양·수량과 적용 조건을 확인해 공개가격 소계에 반영하며, 가격이 확인되지 않은 공사는 상담 확인 대상으로 전달됩니다.</p>
          <div className="space-y-4 mt-4">{EXTRA_WORK_SCOPES.map(scope => <div key={scope.id}>
            <label className="block text-sm font-bold">{scope.label}<select aria-label={scope.label} className={control} value={selection.extraWork?.[scope.id] ?? "keep"} onChange={e => update({ extraWork: { ...selection.extraWork, [scope.id]: e.target.value as ExtraWorkChoice }, ...(scope.id === "doors" ? { doorSpec: "unknown", doorCount: 1, doorsSeparateFromFilm: false } : {}), ...(scope.id === "carpentry" ? { moldingScope: "unknown", moldingRooms: 0 } : {}) })}>{EXTRA_WORK_OPTIONS.map(option => <option key={option.id} value={option.id}>{option.label}</option>)}</select></label>
            <p className="text-xs text-stone-500 mt-2 leading-5">{scope.detail}</p>
            {scope.id === "carpentry" && selection.extraWork?.carpentry === "work" && <div className="rounded-xl bg-stone-50 p-3 mt-3 space-y-3">
              <label className="block text-sm">몰딩 범위<select aria-label="몰딩 범위" className={control} value={selection.moldingScope ?? "unknown"} onChange={e => update({ moldingScope: e.target.value })}>{MOLDING_OPTIONS.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}</select></label>
              <label className="block text-sm">몰딩 기준 방 개수<select aria-label="몰딩 기준 방 개수" className={control} value={selection.moldingRooms ?? 0} onChange={e => update({ moldingRooms: Number(e.target.value) })}><option value={0}>모르겠어요 / 다른 구조</option>{[2, 3, 4].map(n => <option key={n} value={n}>방 {n}개</option>)}</select></label>
              <p className="text-xs text-amber-800 leading-5">방 개수별 전체 몰딩의 공개 시공 예시이며 전체 목공비가 아닙니다. 길이·제품·철거·운반·마감·VAT는 별도 확인합니다. 마루와 함께 선택한 하단 몰딩은 원문의 별도 행사 조건을 확인해야 하므로 합산하지 않습니다.</p>
            </div>}
            {scope.id === "doors" && selection.extraWork?.doors === "work" && <div className="rounded-xl bg-stone-50 p-3 mt-3 space-y-3">
              <label className="block text-sm">방문 사양<select aria-label="방문 사양" className={control} value={selection.doorSpec ?? "unknown"} onChange={e => update({ doorSpec: e.target.value })}>{DOOR_OPTIONS.map(o => <option key={o.id} value={o.id}>{choiceLabel(o)}{o.price !== null ? "/개" : ""}</option>)}</select></label>
              <label className="block text-sm">방문 교체 수량<select aria-label="방문 교체 수량" className={control} value={selection.doorCount ?? 1} onChange={e => update({ doorCount: Number(e.target.value) })}>{Array.from({ length: 10 }, (_, i) => i + 1).map(n => <option key={n} value={n}>{n}개</option>)}</select></label>
              {selection.film && (selection.filmDoors ?? 0) > 0 && <label className="flex gap-2 text-xs leading-5"><input type="checkbox" checked={selection.doorsSeparateFromFilm ?? false} onChange={e => update({ doorsSeparateFromFilm: e.target.checked })} />교체할 문과 필름 시공할 문은 서로 다른 대상입니다.</label>}
              <p className="text-xs text-amber-800 leading-5">다른 공종 동시시공 조건의 공개 예시입니다. 다른 가격 확인 항목이 없거나 필름 대상 구분이 안 된 경우 문 교체 금액은 합산하지 않습니다. 실측·철거·부속품·문선 마감·VAT는 별도 확인합니다.</p>
            </div>}
          </div>)}</div>
        </section>
      </fieldset>
      <aside id="selected-estimate" className="scroll-mt-44 lg:col-span-5 lg:sticky lg:top-28 space-y-4 min-w-0">
        <section className="rounded-3xl bg-stone-950 text-white p-6" aria-live="polite" aria-atomic="true">
          <h2 className="text-sm text-amber-300 font-bold flex gap-2 items-center"><Calculator className="w-4 h-4" />가격 확인 항목 소계</h2>
          <p data-testid="public-subtotal" className="font-black text-3xl mt-3">{quote.subtotalWon === null ? (quote.hasSelection ? "금액 확인 필요" : "공사를 선택해 주세요") : formatWon(quote.subtotalWon)}</p>
          <p className="text-sm text-stone-300 mt-4 leading-6">{quote.notice}</p>
          {quote.items.length > 0 && <ul className="mt-5 space-y-3 border-t border-stone-700 pt-4">{quote.items.map(item => <li key={item.id} className="text-sm flex justify-between gap-4"><span>{item.label}</span><strong className="shrink-0">{formatWon(item.amount)}</strong></li>)}</ul>}
        </section>
        {quote.hasSelection && <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <h3 className="font-black text-sm">소계에 포함되지 않은 확인 항목</h3>
          <ul className="mt-3 text-sm leading-6 text-stone-700 space-y-2"><li>• 원문 부가세 기준과 부산 현장 적용 금액</li>{quote.pending.map(item => <li key={item}>• {item}</li>)}</ul>
        </section>}
        <section className={card}>
          <h3 className="font-black text-lg">이 선택으로 실측 상담</h3>
          <p className="text-xs text-stone-500 mt-2">선택 내역과 공개가격 소계, 별도 확인 항목을 함께 전달합니다.</p>
          {saved ? <div role="status" className="mt-4 rounded-xl bg-emerald-50 p-4 text-emerald-800"><CheckCircle2 className="w-6 h-6 mb-2" /><strong>상담 신청이 접수되었습니다.</strong><p className="text-sm mt-2">담당자가 선택하신 공사 범위를 확인한 뒤 연락드립니다.</p>{notice && <p className="text-xs mt-2">{notice}</p>}</div> : <form onSubmit={submit} className="mt-4 space-y-3">
            <fieldset disabled={busy} className="space-y-3 min-w-0">
              <input aria-label="이름" autoComplete="name" placeholder="이름" required maxLength={50} className={control} value={contact.name} onChange={e => setContact({ ...contact, name: e.target.value })} />
              <input aria-label="연락처" type="tel" autoComplete="tel" placeholder="연락처" required maxLength={20} className={control} value={contact.phone} onChange={e => setContact({ ...contact, phone: e.target.value })} />
              <input aria-label="공사 지역" placeholder="공사 지역 · 예: 부산 동래구" required maxLength={100} className={control} value={contact.location} onChange={e => setContact({ ...contact, location: e.target.value })} />
              <textarea aria-label="추가 요청" placeholder="추가 요청 · 선택" maxLength={1000} className={control} value={contact.details} onChange={e => setContact({ ...contact, details: e.target.value })} />
              <label className="flex items-start gap-2 text-xs text-stone-600 leading-5"><input type="checkbox" className="mt-1" checked={consent} onChange={e => setConsent(e.target.checked)} />상담을 위한 이름·연락처·지역·선택 공사내역 수집 및 이용에 동의합니다.</label>
              {error && <p role="alert" className="text-sm text-rose-700">{error}</p>}
              <button type="submit" disabled={busy || !quote.hasSelection} className="w-full rounded-xl bg-amber-500 text-stone-950 p-4 font-black text-sm disabled:opacity-40 flex justify-center items-center gap-2">{busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}선택 내역으로 상담 신청</button>
            </fieldset>
          </form>}
          <a href={`tel:${SITE_CONFIG.company.phone.replace(/[^0-9+]/g, "")}`} className="mt-4 flex items-center justify-center gap-2 border border-stone-300 rounded-xl p-3 text-sm font-bold"><Phone className="w-4 h-4" />전화로 상담하기</a>
        </section>
      </aside>
    </div>
    <details className={card}>
      <summary className="font-bold cursor-pointer">가격 출처와 적용 조건 확인 · 2026.10.26 확인</summary>
      <p className="text-sm text-stone-600 mt-4">업체별 공개 견적 예시를 사용하며 전국 평균이나 부산 시세를 뜻하지 않습니다. 원문 부가세 기준과 게시일이 확인되지 않은 자료는 미확인으로 남겼습니다. 선택하지 않은 공종은 포함되지 않습니다.</p>
      <div className="grid md:grid-cols-2 gap-4 mt-4">{Object.entries(PUBLIC_SOURCES).map(([key, source]) => <div key={key} className="rounded-xl bg-stone-50 p-4 text-xs leading-6"><a target="_blank" rel="noopener noreferrer" href={source.url} className="font-bold underline inline-flex gap-1 items-center">{source.name}<ArrowUpRight className="w-3 h-3" /></a><p>{source.condition}</p><p className="text-stone-500">지역: {source.region} · 부가세: {source.vat} · 확인일: {source.checkedAt}</p></div>)}</div>
    </details>
    <Link to="/ai-estimate?mode=photos" className="block text-center text-sm font-bold text-stone-600 underline py-4">사진·평면도를 첨부해 상담하고 싶어요</Link>
  </div>;
}
