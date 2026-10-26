import test from 'node:test';
import assert from 'node:assert/strict';
import { defaultPublicSelection, calculatePublicSelection, publicSelectionSummary, type PublicSelection32 } from '../shared/publicEstimate32.ts';
import { buildConsultationKakao, KAKAO_TEXT_LIMIT } from '../shared/kakaoConsultation.ts';
import estimateHandler from '../api/ai-estimate.ts';
import notifyHandler from '../api/notify-kakao.ts';

const common: PublicSelection32 = {
  ...defaultPublicSelection(), kitchen: true, shoeCabinet: true,
  extraWork: { demolition:'work', electrical:'work', carpentry:'work', doors:'work', balconyTile:'work', entranceTile:'work' },
  moldingRooms:3, moldingScope:'both', doorCount:5,
};
const scenarios: Array<{ label:string; selection:PublicSelection32; expected:number }> = [
  { label:'합지·장판 조합', selection:{ ...common, wallpaper:'paper', floor:'vinyl18', bathrooms:[{method:'overlay',largeTile:false},{method:'overlay',largeTile:false}], doorSpec:'leaf' }, expected:14302000 },
  { label:'실크·마루 조합', selection:{ ...common, wallpaper:'silk', floor:'wood', bathrooms:[{method:'full',largeTile:false},{method:'full',largeTile:false}], kitchenLengthM:6, doorSpec:'frame' }, expected:22600000 },
  { label:'창호 포함 조합', selection:{ ...common, wallpaper:'premium', floor:'widewood', bathrooms:[{method:'full',largeTile:true},{method:'full',largeTile:true}], kitchenLengthM:6, windows:true, windowScope:'all', film:true, filmDoors:3, filmEntryDoors:1, doorCount:2, doorSpec:'frame', doorsSeparateFromFilm:true, moldingRooms:4 }, expected:38217000 },
];
function response() {
  return { code:200, payload:undefined as any, setHeader() {}, status(code:number){this.code=code;return this;}, json(payload:unknown){this.payload=payload;return this;} };
}
for (const scenario of scenarios) test(`${scenario.label}: 화면·API·저장용 전문·카카오 요약이 일치한다`, async () => {
  const selected = structuredClone(scenario.selection);
  const quote = calculatePublicSelection(selected);
  assert.equal(quote.subtotalWon,scenario.expected);
  assert.equal(quote.totalIsComplete,false);
  for(const scope of ['신발장','전기·조명','발코니 타일','현관 타일']) assert.ok(quote.pending.some(p=>p.includes(scope)));
  const res = response();
  await estimateHandler({method:'POST',query:{},body:{publicSelection:selected,subtotalWon:1}} as any,res as any);
  assert.equal(res.code,200);
  assert.deepEqual(res.payload.data,quote);
  const details = '[TEST] 테스트 접수 · 실적 제외 · 고객 연락 금지\n' + publicSelectionSummary(selected,res.payload.data) + '\n추가 요청: ' + '긴 요청🙂'.repeat(200);
  const saved = { name:'[TEST] 검산', phone:'010-0000-0000', location:'부산 동래구', area:'32', spaceType:'아파트', details, docPath:'consultations/qaSavedDocument123456' };
  const original = structuredClone(saved);
  const template = buildConsultationKakao(saved);
  assert.ok(details.length>1000);
  assert.ok(template.text.length<=KAKAO_TEXT_LIMIT);
  assert.match(template.text,/^\[TEST\].*고객 연락 금지/);
  assert.ok(template.text.includes(scenario.expected.toLocaleString('ko-KR')+'원'));
  assert.ok(template.text.includes(saved.phone));
  assert.ok(template.text.includes('qaSavedDocument123456'));
  assert.match(template.text,/총액 아님/);
  assert.match(template.text,/관리자 확인/);
  assert.deepEqual(saved,original); // The full saved selection and request stay intact.
  assert.deepEqual(selected,scenario.selection);
});

test('일반 상담도 연락처와 요청을 유지하고 링크는 관리자 경로로 고정한다', () => {
  const template=buildConsultationKakao({name:'테스트 고객',phone:'051-806-3143',details:'욕실 상담',link:'https://invalid.example',spaceType:'상가',area:20});
  assert.match(template.text,/욕실 상담/);
  assert.match(template.text,/051-806-3143/);
  assert.ok(!template.text.startsWith('[TEST]'));
  assert.equal(template.link.web_url,'https://gene-interior.vercel.app/admin');
  assert.equal(template.link.mobile_web_url,template.link.web_url);
});
test('최대 길이·이모지·미입력에서도 200자와 테스트 표시를 보존한다', () => {
  for (const input of [{},{isTest:true},{name:'[TEST]'+ '🙂'.repeat(100),phone:'0'.repeat(50),location:'부산'.repeat(100),details:'가격 확인 항목 소계: '+ '9'.repeat(100)+'원',docPath:'consultations/'+ 'A'.repeat(128),spaceType:'가'.repeat(100),area:'3'.repeat(100),startDate:'1'.repeat(100)}]) {
    const result=buildConsultationKakao(input);
    assert.ok(result.text.length<=200,`length=${result.text.length}`);
    assert.ok(!/[\uD800-\uDBFF](?![\uDC00-\uDFFF])/.test(result.text));
    assert.match(result.text,/관리자 확인/);
  }
});

for (const success of [true,false]) test(`실제 알림 핸들러: 긴 상담을 제한 이내로 전송하고 ${success?'성공':'실패'} 응답을 구분한다`, async t => {
  const previous = { key:process.env.KAKAO_REST_API_KEY, token:process.env.KAKAO_REFRESH_TOKEN, secret:process.env.KAKAO_CLIENT_SECRET };
  process.env.KAKAO_REST_API_KEY='qa-only-key'; process.env.KAKAO_REFRESH_TOKEN='qa-only-refresh'; delete process.env.KAKAO_CLIENT_SECRET;
  t.after(()=> { for(const [key,value] of Object.entries({KAKAO_REST_API_KEY:previous.key,KAKAO_REFRESH_TOKEN:previous.token,KAKAO_CLIENT_SECRET:previous.secret})) {if(value===undefined)delete process.env[key];else process.env[key]=value;} });
  let count=0; let template:any;
  t.mock.method(globalThis,'fetch',async (url:unknown,options:any)=> {
    count++;
    if(url==='https://kauth.kakao.com/oauth/token') return new Response(JSON.stringify({access_token:'qa-only-access'}),{status:200});
    assert.equal(url,'https://kapi.kakao.com/v2/api/talk/memo/default/send');
    assert.equal(options.method,'POST');
    template=JSON.parse(new URLSearchParams(options.body).get('template_object')!);
    assert.ok(template.text.length<=200);
    assert.equal(template.link.web_url,'https://gene-interior.vercel.app/admin');
    return new Response(JSON.stringify(success?{result_code:0}:{code:-2,msg:'QA mocked rejection'}),{status:success?200:400});
  });
  const res=response();
  await notifyHandler({method:'POST',body:{name:'[TEST] 알림 검증',phone:'010-0000-0000',details:'[TEST] '+ '긴 선택 내역'.repeat(1000),docPath:'consultations/qa-only'}} as any,res as any);
  assert.equal(count,2);
  assert.equal(res.payload.success,success);
  assert.match(template.text,/고객 연락 금지/);
});
