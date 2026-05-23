export const tools = [
  {
    name: 'get_schedule',
    description: '당일 조업 일정과 작업 배정 정보 조회'
  },
  {
    name: 'get_near_miss_history',
    description: '최근 30일 Near-miss 이력 조회'
  },
  {
    name: 'get_weather_condition',
    description: '현재 해상 상태, 파고, 풍속 조회'
  },
  {
    name: 'generate_briefing',
    description: '일정, Near-miss 이력, 날씨 조건을 바탕으로 맞춤 안전 브리핑 생성'
  },
  {
    name: 'classify_near_miss',
    description: '위험 메모를 6개 유형으로 분류'
  },
  {
    name: 'send_alert',
    description: '고위험 상황일 때 알림 초안 생성 (Rule Engine 연동)'
  },
  {
    name: 'trigger_pdf_report',
    description: 'PDF 보고서 생성 Edge Function 호출'
  }
];
