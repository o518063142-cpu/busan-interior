import test from 'node:test';
import assert from 'node:assert/strict';
import { approximateWon } from '../src/utils/estimatePresentation.ts';
import { defaultPublicSelection,calculatePublicSelection } from '../shared/publicEstimate32.ts';

test('표시 반올림은 실측 전 예산임을 표현하고 원본 계산값을 변경하지 않는다',()=>{
 const q=calculatePublicSelection({...defaultPublicSelection(),tilePricingBasis:'budget-v1',extraWork:{entranceTile:'work',balconyTile:'work'},furnitureBasis:'gene',kitchen:true,kitchenLengthM:3,shoeCabinet:true,shoeCabinetLengthM:1.2});
 assert.equal(q.subtotalWon,4701510);
 assert.equal(approximateWon(q.subtotalWon!),'약 470만원');
 assert.equal(q.subtotalWon,4701510);
 assert.equal(approximateWon(981510),'약 98만원');
 assert.equal(approximateWon(995000),'약 100만원');
 assert.equal(approximateWon(9000),'약 1만원 미만');
});
