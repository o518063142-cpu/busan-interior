# 고객 선택형 견적 운영 반영 전 검토

확인일: 2026-10-26. 운영 main 기준 `5c7fab5efab1df197db87e26703c1d82eefcb497`.
검토 시작 Preview: `a86a5bc2c9bec290825974ca4a46aa5ec6d1df2d`. 이후 수정 커밋과 배포 응답은 PR #16의 최신 기록을 따른다.

## 반영 대상

- /ai-estimate 기본 공종 선택형 견적, /ai-estimate?mode=photos 사진 상담 경로.
- 공개가격 소계, 별도 참고범위, 미확인 공사·VAT·부산 적용 조건, 선택 스냅샷과 상담 저장, 카카오 요약.
- 관리자 상담함·전환 지표와 관련 API·신규 경로, 익명 세션 전환 추적. 내부 GENE PLAN이나 GENE BID 코드를 고객 홈페이지에 배포하는 작업이 아니다.
- 저장된 기존 상담·계약 상태를 이 검토 과정에서 수정하지 않았다.

## 기존 기능과의 관계

운영본 대비 변경 파일을 확인했다. HOME·시공사례·정보글의 SEO 렌더러, sitemap, robots, prerender, 업체 기본정보, 헤더·푸터, 기존 ContactPage·ContactModal의 소스는 이번 PR에서 수정되지 않았다. vercel.json은 기존 공개 경로를 유지하고 업로드·관리자 신규 경로를 앞에 추가한다. App에는 추적 컴포넌트와 관리자 바로가기가 추가된다. 기존 카카오 API는 이전 작업에서 200자 요약으로 보완되었으므로 일반 상담에도 영향을 주며, 긴 상담 전문은 DB에 보존한다.

## 발견하고 보완한 항목

### 선택형 견적 전환 이벤트 누락

기존 ConversionTracker는 예전 버튼/완료 문구를 관찰한다. 새 선택형 화면의 상담 버튼과 완료 문구는 이에 일치하지 않아 새 흐름의 시작·신청·완료 이벤트가 빠질 수 있었다.

- 첫 유효 공사 선택에서 견적 선택/실행 이벤트를 한 번 기록한다. 이 단계는 숫자 소계가 없는 상담 필요 항목 선택도 포함하므로 관리자 표시를 ‘견적 선택·실행’으로 구분한다.
- 상담 버튼 클릭은 신청 의도이며 접수 성공과 구분한다. 새 버튼의 이벤트는 기존 문구 관찰과 중복 기록하지 않는다.
- Firestore 저장 성공 이후에만 접수 완료 이벤트를 기록한다. 알림 실패를 상담 저장 실패로 바꾸거나 중복 저장하지 않는다.
- 추적 요청에는 eventName/path/source/sessionId만 담고 이름·연락처·선택 전문은 담지 않는다.
- 브라우저 저장소가 차단되면 페이지 수명 내 메모리 세션으로 상담과 이벤트를 연결한다. SSR에서 방문자 세션은 생성하지 않는다. 추적 실패는 고객 접수를 중단시키지 않는다.
- Preview 추적 API의 DB 기록 생략과 테스트 상담/연결 세션의 운영 지표 제외는 유지한다.

### 관리자 API 기동 오류

검토 시작 Preview의 /api/funnel-metrics와 /api/ai-leads GET은 500이었다. 런타임 로그에서 jwks-rsa의 require('jose')가 ESM-only jose6을 로드하며 ERR_REQUIRE_ESM을 내는 것을 확인했다. Node의 require(esm) 지원을 끈 로컬 환경에서도 재현했다.

Firebase 관리자 SDK 자체는 유지하고 jwks-rsa 하위 jose만 CJS 호환 5.10.0으로 고정한다. 수정 후 같은 제한 환경에서 Firebase auth 로딩과 생성한 로컬 RSA 키의 JWKS 변환·서명 검증을 통과했다. 실제 계정 토큰이나 서비스키를 테스트에 사용하지 않았다. 관리자 요청은 인증 헤더가 없으면 DB 연결보다 먼저 401로 거부한다. 기존 Firebase 로그인 방식은 유지한다.

원본 이슈: https://github.com/firebase/firebase-admin-node/issues/3181
원본 변경 기록: https://github.com/auth0/node-jwks-rsa/blob/master/CHANGELOG.md

## 검증과 남은 범위

- 자동 테스트 61개 통과, Vite build·8경로 prerender·Express bundle 통과.
- Chromium PC1440 / 모바일390에서 ConversionTracker와 선택 화면을 함께 렌더링하고 React StrictMode로 점검했다. 첫 선택 1회, 클릭, DB 성공 완료 1회, 세션 일치, 개인정보 미전송, 저장 실패 제외를 확인했다. 모바일은 sessionStorage 자체를 차단했다.
- 브라우저의 Firestore 저장·카카오·집계 API는 테스트 대역으로 격리했다. 실제 고객 접수나 카카오 추가 발송, 실제 전환 실적을 만들지 않았다.
- tsc는 기존 미사용 src/AIEstimatePage.tsx의 import 오류 3건으로 실패한다. 이번 수정 파일의 추가 타입 오류는 없다.
- 배포된 Preview의 공개 경로·관리자 미인증 API 응답은 PR 설명의 최신 HTTP 확인을 따른다. 관리자 로그인 후 실데이터 집계 조회는 아직 확인하지 않았다.
- 표시 소계는 전체 공사 확정 견적이 아니다. 공개 참고범위도 합산하지 않으며 신발장·타일 등 남은 현장 조건을 상담에서 확인해야 한다.
- 이 단계는 기존 검토 브랜치의 Preview 범위다. main 병합·운영 배포는 수행하지 않았다.
