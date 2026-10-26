import test from 'node:test';
import assert from 'node:assert/strict';
import {getConversionSessionId,getTrackingValue,setTrackingValue,removeTrackingValue,trackEstimateEvent} from '../src/utils/conversionTracking.ts';
function fakeWindow(t:any, storage:any) {
  const before=Object.getOwnPropertyDescriptor(globalThis,'window');
  Object.defineProperty(globalThis,'window',{configurable:true,value:{get sessionStorage(){if(storage instanceof Error)throw storage;return storage;}}});
  t.after(()=>{if(before)Object.defineProperty(globalThis,'window',before);else delete (globalThis as any).window;});
}
test('SSR에서 방문자 세션이나 추적 요청을 만들지 않는다',async t=>{
  let calls=0;t.mock.method(globalThis,'fetch',async()=>{calls++;throw Error('unexpected');});
  assert.equal(getConversionSessionId(),'');assert.equal(getTrackingValue('any'),null);
  await trackEstimateEvent('ai_estimate_generate');assert.equal(calls,0);
});
test('저장소가 차단돼도 세션을 유지하고 추적 실패를 고객 흐름에 전파하지 않는다',async t=>{
  fakeWindow(t,new Error('storage blocked'));
  setTrackingValue('qa','value');assert.equal(getTrackingValue('qa'),'value');
  removeTrackingValue('qa');assert.equal(getTrackingValue('qa'),null);
  const first=getConversionSessionId();assert.match(first,/^s_/);assert.equal(getConversionSessionId(),first);
  t.mock.method(globalThis,'fetch',async()=>{throw Error('analytics unavailable');});
  await assert.doesNotReject(trackEstimateEvent('consultation_submitted',first));
  assert.equal(getConversionSessionId(),first);
});
test('명시적 전환 이벤트는 상담과 같은 세션을 쓰고 개인정보를 담지 않는다',async t=>{
  const values=new Map([['gene_conversion_session_id','s_existing_customer_session']]);
  fakeWindow(t,{getItem:(key:string)=>values.get(key)??null,setItem:(key:string,value:string)=>values.set(key,value),removeItem:(key:string)=>values.delete(key)});
  const events:any[]=[];
  t.mock.method(globalThis,'fetch',async(url:any,options:any)=>{assert.equal(url,'/api/track-conversion');assert.equal(options.keepalive,true);events.push(JSON.parse(options.body));return new Response('{}');});
  for(const event of ['ai_estimate_generate','ai_estimate_consultation_click','consultation_submitted'] as const)await trackEstimateEvent(event);
  assert.equal(events.length,3);
  for(const event of events){assert.equal(event.sessionId,'s_existing_customer_session');assert.equal(event.source,'ai-estimate');assert.equal(event.path,'/ai-estimate');assert.deepEqual(Object.keys(event).sort(),['eventName','path','sessionId','source']);}
});
