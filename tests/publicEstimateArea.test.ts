import test from 'node:test';
import assert from 'node:assert/strict';
import { defaultPublicSelection, calculatePublicSelection, validatePublicSelection, publicSelectionSummary } from '../shared/publicEstimate32.ts';
import handler from '../api/ai-estimate.ts';

test('32평 기본과 이전 저장 선택은 기존 금액을 유지한다', () => {
 const s = { ...defaultPublicSelection(), wallpaper:'silk', floor:'wood' };
 assert.equal(calculatePublicSelection(s).subtotalWon,4650000);
 assert.deepEqual(calculatePublicSelection(s),calculatePublicSelection({...s,supplyPyung:32}));
});
test('20~50평형 및 소수 평수는 도배·바닥만 비율 환산한다', () => {
 for(const n of [24,32,42,52,43.5]){
  const q=calculatePublicSelection({...defaultPublicSelection(),supplyPyung:n,wallpaper:'paper',floor:'vinyl18',kitchen:true,furnitureBasis:'gene',kitchenLengthM:3});
  assert.equal(q.subtotalWon,Math.round(1290000*n/32)+Math.round(912000*n/32)+3000000);
  assert.equal(q.area.supplyPyung,n);assert.equal(q.areaPricing.ratio,n/32);
  assert.match(publicSelectionSummary({...defaultPublicSelection(),supplyPyung:n},q),new RegExp(n+'평'));
 }
});
test('평형 변경에도 가구 길이·욕실 개수·직접 입력 타일 면적은 독립적이다',()=>{
 const s={...defaultPublicSelection(),furnitureBasis:'gene' as const, kitchen:true,kitchenLengthM:4.2,shoeCabinet:true,shoeCabinetLengthM:1.5,bathrooms:[{method:'full',largeTile:false}],tilePricingBasis:'budget-v1' as const,extraWork:{entranceTile:'work' as const},tileBySpace:{entranceTile:{areaM2:5,method:'unknown',size:'unknown',surface:'floor' as const,condition:'unknown' as const}}};
 assert.equal(calculatePublicSelection({...s,supplyPyung:24}).subtotalWon,calculatePublicSelection({...s,supplyPyung:52}).subtotalWon);
 for(const count of [1,2,3,4])assert.equal(calculatePublicSelection({...defaultPublicSelection(),bathrooms:Array.from({length:count},()=>({method:'overlay',largeTile:false}))}).subtotalWon,3500000*count);
});
test('타일 미입력만 평형별 가정으로 조정하며 공임을 그대로 비례 확대하지 않는다',()=>{
 const q=calculatePublicSelection({...defaultPublicSelection(),supplyPyung:48,tilePricingBasis:'budget-v1',extraWork:{balconyTile:'work'}});
 assert.equal(q.tileBudget?.spaces[0].areaM2,15);assert.equal(q.tileBudget?.laborWon,520000);
 assert.match(q.tileBudget!.assumptions.join(' '),/48\/32/);
});
test('30평대 밖의 창호 공개 묶음금액을 임의 적용하지 않는다',()=>{
 for(const n of [24,42,52]){const q=calculatePublicSelection({...defaultPublicSelection(),supplyPyung:n,windows:true,windowScope:'all'});assert.equal(q.subtotalWon,null);assert.ok(q.pending.some(x=>x.includes('선택 평형에 적용하지 않음')));}
});
test('조작된 평수·욕실 개수는 서버에서 거부한다',async()=>{
 for(const n of [0,9,101,NaN,Infinity,'42',null]) assert.ok(validatePublicSelection({...defaultPublicSelection(),supplyPyung:n}));
 assert.ok(validatePublicSelection({...defaultPublicSelection(),bathrooms:Array.from({length:5},()=>({method:'keep',largeTile:false}))}));
 let status=200;let payload:any;
 const res={setHeader(){},status(n:number){status=n;return this;},json(v:unknown){payload=v;return this;}};
 await handler({method:'POST',query:{},body:{publicSelection:{...defaultPublicSelection(),supplyPyung:48,wallpaper:'silk',subtotalWon:1}}} as any,res as any);
 assert.equal(status,200);assert.equal(payload.data.subtotalWon,3015000);assert.equal(payload.data.area.supplyPyung,48);
 await handler({method:'POST',query:{},body:{publicSelection:{...defaultPublicSelection(),supplyPyung:'48',wallpaper:'silk'}}} as any,res as any);assert.equal(status,400);
});
