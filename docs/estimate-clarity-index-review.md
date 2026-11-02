# 예상견적 표현·입력·색인 점검 (2026-11-02)

기준 운영 SHA b824ed3b71a8614f5aa274efc9f79502951ace06. 공종 단가·기본 면적·서버 계산·DB 저장·카카오 전송은 수정하지 않는다.

- 고객 화면 총액과 항목 소계는 만원 단위로 반올림해 ‘약’으로 표시한다. 4,701,510원은 약470만원이고 저장/API/알림 전문의 원 단위 금액은 보존한다. 합계 반올림과 항목별 반올림은 독립이므로 화면에 반올림 사실을 안내한다.
- 반영 항목, 타일 계산 가정, 실측시 추가비용 확인 사항을 구분한다. 포함된 타일을 ‘소계 미포함’으로 묶던 잘못된 제목을 제거한다. VAT 포함 여부 미확정을 금액 바로 옆에 표시한다.
- 주방/신발장 길이, 타일 면적, 몰딩 길이는 입력 중 빈칸·소수점을 허용한다. 유효한 값만 계산 상태에 전달한다. 선택 입력은 빈칸에서 포커스를 벗어나면 null, 필수 주방 길이의 빈칸/범위 초과는 이전 값 복원+오류 안내. 계산/API 입력에 NaN을 전달하지 않는다.
- 모바일 상단 금액바는 문서 흐름에 두어 제목/입력을 가리지 않게 한다. 상세 링크는 유지하고 페이지 하단 고정 연락바 여백을 확보한다. 다른 페이지 연락바/헤더는 변경하지 않는다.
- /ai-estimate 정적 title/description/h1/요약에서 실제 없는 공사기간 자동산출 주장을 제거하고 현재 선택형 가견적 기능과 맞춘다. 다른 정적 경로·시공사례·정보글·사업자 정보는 변경하지 않는다.
- 공개 /ai-estimate는 이미 sitemap에 포함되고 canonical은 자기 주소, index 허용. 관리자 /admin 정확한 주소에 X-Robots-Tag noindex를 추가하고 기존 하위주소 noindex를 유지한다. 고객별 견적·접수·관리자 데이터는 공개 색인용 HTML에 넣지 않는다. 사진 상담의 동작과 canonical은 유지한다.

검증: 자동테스트65개, Vite build,8경로prerender,Express bundle 통과. 기존 미사용 src/AIEstimatePage.tsx의 tsc import3건만 남음. PC1440/모바일390 브라우저에서 반올림표시/정확한저장금액,필수·선택숫자빈칸/소수/범위초과복원,가정표시,모바일금액바 static,서버재계산/모의접수 통과. DB/카카오는 모의 처리해 새 운영접수·실제알림을 생성하지 않았다.

색인 판단: 검증된 공개 견적 페이지는 색인 대상으로 적합하나 실제 색인/검색순위는 검색엔진이 결정한다. 이 작업은 Search Console/서치어드바이저 제출 성공이나 색인 완료를 뜻하지 않는다. 관리자·개별 상담을 색인 대상으로 제출하지 않는다.
근거: Google JavaScript SEO https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics 및 네이버 https://searchadvisor.naver.com/guide/seo-advanced-javascript.


## 운영 HTTP 후속 점검
PR17 병합 후 062349069f0c6a065d3d23133adfb995b8d08b60 배포에서 공개 /ai-estimate 새 HTML/canonical/index허용·사이트맵 포함은 확인했다. 그러나 관리자 GET의 X-Robots-Tag는 누락됐다. 상위 headers 선언만으로 현재 커스텀 routes 응답에 전달되지 않는 현상이다. 실제 관리자 인증은 정상이며 고객 데이터가 공개된 것은 아니다. 후속 수정에서 기존 /admin, /admin/funnel, /admin/ai-leads의 route 객체에 noindex 응답 헤더를 직접 명시한다. 공개 경로는 변경하지 않는다. 배포 후 HTTP로 다시 확인해야 완료다.
