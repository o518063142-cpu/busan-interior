import test from 'node:test';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import handler from '../api/funnel-metrics.ts';

test('Vercel과 같은 ESM require 미지원 환경에서도 Firebase 인증과 RSA 키 변환이 동작한다',()=>{
  const script=`
    const assert=require('node:assert/strict');
    require('firebase-admin/auth');
    const {generateKeyPairSync,sign,verify}=require('node:crypto');
    const jwks=require('jwks-rsa');
    const {publicKey,privateKey}=generateKeyPairSync('rsa',{modulusLength:2048});
    const jwk={...publicKey.export({format:'jwk'}),kid:'qa-local-key',alg:'RS256',use:'sig'};
    (async()=>{
      const client=jwks({jwksUri:'https://unused.invalid/keys',fetcher:async()=>({keys:[jwk]})});
      const converted=(await client.getSigningKey('qa-local-key')).getPublicKey();
      const body=Buffer.from('local auth compatibility test');
      assert.ok(verify('RSA-SHA256',body,converted,sign('RSA-SHA256',body,privateKey)));
      console.log('CJS Firebase auth + JWKS RSA verification PASS');
    })().catch(e=>{console.error(e);process.exitCode=1;});
  `;
  const output=execFileSync(process.execPath,['--no-experimental-require-module','-e',script],{cwd:fileURLToPath(new URL('..',import.meta.url)),encoding:'utf8'});
  assert.match(output,/RSA verification PASS/);
});
test('인증 없는 관리자 요청은 DB 연결보다 먼저 401로 거부한다',async()=>{
  for(const mode of [undefined,'leads','attachment']){
    let code=0;let payload:any;
    const res={setHeader(){},status(n:number){code=n;return this;},json(value:unknown){payload=value;return this;}};
    await handler({method:'GET',headers:{},query:{mode}} as any,res as any);
    assert.equal(code,401);assert.equal(payload.success,false);assert.match(payload.error,/인증/);
  }
});
