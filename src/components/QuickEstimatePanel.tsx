import React from "react";
import { ArrowDown, Calculator, Check, Ruler } from "lucide-react";
import { approximateWon } from "../utils/estimatePresentation";
import type { PublicSelection32 } from "../../shared/publicEstimate32";
import { calculatePublicSelection } from "../../shared/publicEstimate32";

type Quote = ReturnType<typeof calculatePublicSelection>;

interface QuickEstimatePanelProps {
  selection: PublicSelection32;
  quote: Quote;
  onAreaChange: (area: number) => void;
  onUpdate: (patch: Partial<PublicSelection32>) => void;
}

/**
 * Customer-friendly entry to the existing public estimate, not a second pricing engine.
 * Presets are explicitly disclosed; the detailed form remains the source of truth.
 */
export function QuickEstimatePanel({ selection, quote, onAreaChange, onUpdate }: QuickEstimatePanelProps) {
  const area = selection.supplyPyung ?? 32;
  const bathSelected = selection.bathrooms.some(b => b.method !== "keep");
  const electricalSelected = selection.extraWork?.electrical === "work";

  const choices = [
    {
      id: "wallpaper",
      name: "도배",
      example: "전체 실크 · 천장 포함",
      selected: selection.wallpaper !== "keep",
      toggle: () => onUpdate({ wallpaper: selection.wallpaper === "keep" ? "silk" : "keep" }),
    },
    {
      id: "floor",
      name: "바닥",
      example: "일반 강마루",
      selected: selection.floor !== "keep",
      toggle: () => onUpdate({ floor: selection.floor === "keep" ? "wood" : "keep" }),
    },
    {
      id: "bathroom",
      name: "욕실",
      example: "욕실 1곳 덧방 예시",
      selected: bathSelected,
      toggle: () => onUpdate({
        bathrooms: selection.bathrooms.map((bath, index) =>
          bathSelected ? { ...bath, method: "keep", largeTile: false }
            : index === 0 ? { ...bath, method: "overlay", largeTile: false } : bath,
        ),
      }),
    },
    {
      id: "kitchen",
      name: "주방",
      example: "기본 3m · 길이 수정 가능",
      selected: selection.kitchen,
      toggle: () => onUpdate({ kitchen: !selection.kitchen }),
    },
    {
      id: "shoe",
      name: "신발장",
      example: "길이 입력 후 금액 확인",
      selected: selection.shoeCabinet,
      toggle: () => onUpdate({
        shoeCabinet: !selection.shoeCabinet,
        filmShoeCabinets: !selection.shoeCabinet ? 0 : selection.filmShoeCabinets ?? 0,
      }),
    },
    {
      id: "lighting",
      name: "전기·조명",
      example: "범위 실측 후 확인",
      selected: electricalSelected,
      toggle: () => onUpdate({
        extraWork: { ...selection.extraWork, electrical: electricalSelected ? "keep" : "work" },
        electricalWorks: electricalSelected ? [] : selection.electricalWorks ?? [],
      }),
    },
  ];
  const selectedCount = choices.filter(choice => choice.selected).length;

  return <section aria-labelledby="quick-estimate-title" className="rounded-3xl border border-stone-200 bg-stone-50 p-5 sm:p-8 space-y-5">
    <div className="space-y-2">
      <p className="text-xs font-bold tracking-wider text-amber-700">빠른 시작 · 선택형 가견적</p>
      <h2 id="quick-estimate-title" className="text-2xl sm:text-3xl font-black text-stone-950">30초 간편 견적 선택</h2>
      <p className="text-sm leading-6 text-stone-600">평수를 고르고 필요한 공사만 누르세요. 금액은 기존 지니 견적 계산 기준으로 즉시 반영되며, 선택 항목의 <strong>참고 소계</strong>이지 전체 공사 확정금액은 아닙니다.</p>
    </div>
    <div className="rounded-2xl bg-white border border-stone-200 p-4 sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <label htmlFor="quick-area" className="font-bold flex items-center gap-2"><Ruler className="w-4 h-4 text-amber-700" />공급평수</label>
        <strong className="text-2xl font-black tabular-nums">{area}평</strong>
      </div>
      <input id="quick-area" aria-label="공급평수 슬라이더" type="range" min="10" max="100" step="1" value={area} onChange={event => onAreaChange(Number(event.target.value))} className="w-full mt-4 accent-amber-600" />
      <div className="flex justify-between text-xs text-stone-500 mt-1"><span>10평</span><span>100평</span></div>
      <p className="text-xs text-stone-500 mt-3">정확한 평수·소수점 입력은 아래 상세 선택에서 가능합니다.</p>
    </div>
    <div className="space-y-3">
      <h3 className="font-black text-stone-900">원하는 공사를 선택하세요 <span className="text-sm font-medium text-stone-500">({selectedCount}개 선택)</span></h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
        {choices.map(choice => <button key={choice.id} type="button" aria-pressed={choice.selected} onClick={choice.toggle}
          className={`rounded-xl p-3 sm:p-4 text-left border transition-colors min-h-24 ${choice.selected ? "border-amber-500 bg-amber-50 text-stone-950" : "border-stone-200 bg-white hover:border-stone-400 text-stone-800"}`}>
          <span className="flex items-center gap-2 font-black text-sm sm:text-base">
            {choice.selected && <Check aria-hidden="true" className="w-4 h-4 text-amber-700 shrink-0" />}{choice.name}
          </span>
          <span className="block text-xs text-stone-500 leading-5 mt-2">{choice.example}</span>
        </button>)}
      </div>
      <p className="text-xs leading-5 text-stone-600">선택 즉시 각 공종의 <strong>시작 예시 사양</strong>이 적용됩니다. 자재·욕실 수·주방 길이 등 실제 조건은 아래 상세 선택에서 바꿀 수 있습니다.</p>
    </div>
    <div className="rounded-2xl bg-stone-950 p-5 sm:p-6 text-white space-y-3" aria-live="polite">
      <div className="flex gap-2 items-center text-sm font-bold text-amber-300"><Calculator className="w-4 h-4" />현재 선택 공사 참고 소계</div>
      <p className="text-3xl font-black tabular-nums">{quote.subtotalWon === null ? (quote.hasSelection ? "금액 확인 필요" : "공사를 선택해 주세요") : approximateWon(quote.subtotalWon)}</p>
      <p className="text-xs text-stone-300 leading-5">선택 공사 중 가격이 확인된 항목만 합산했습니다. 선택하지 않은 공사, 현장 조건, 철거·폐기·부가세 등은 빠질 수 있어 전체 예산 범위가 아닙니다. 가격 미확인 항목은 아래 상세 내역에서 확인하세요.</p>
      <a href="#selected-estimate" className="flex items-center justify-center gap-2 rounded-xl bg-amber-400 text-stone-950 p-4 font-black text-sm hover:bg-amber-300">
        예상 내역 확인하고 실측 상담 신청 <ArrowDown className="w-4 h-4" />
      </a>
      <a href="#detailed-estimate" className="flex items-center justify-center gap-2 text-sm underline underline-offset-4 text-white py-2">
        공종·자재를 더 자세히 선택하기 <ArrowDown className="w-4 h-4" />
      </a>
    </div>
  </section>;
}
