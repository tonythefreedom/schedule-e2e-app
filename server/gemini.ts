import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_KEY || '');

export async function analyzeSchedule(message: string, existingSchedules: any[] = []) {
  const model = genAI.getGenerativeModel({ 
    model: 'gemini-2.5-flash',
    generationConfig: { responseMimeType: "application/json" }
  });
  
  const todayDate = new Date().toISOString().split('T')[0];
  const todayDay = ['일', '월', '화', '수', '목', '금', '토'][new Date().getDay()];
  const schedulesJson = JSON.stringify(existingSchedules);

  const promptTemplate = `당신은 일정 관리 에이전트입니다. 사용자의 메시지를 분석하여 일정 관리 작업을 수행합니다.
응답은 반드시 JSON 형식으로만 작성하세요.

<규칙>
1. 일정 등록 요청 시 (예: "내일 1시에 ..."):
   - 만약 이미 동일한 날짜와 시간에 일정이 존재하거나, 동일한 제목의 일정이 해당 날짜에 존재한다면 intent를 "duplicate"로 설정하세요.
   - 중복 여부를 판단할 때 기존 일정 목록을 꼼꼼히 확인하세요.
   - 응답 형식: {"intent": "create" | "duplicate", "data": {"title": "일정 제목", "date": "YYYY-MM-DD", "time": "HH:mm", "location": "장소", "content": "추가 내용"}}

2. 일정 조회 요청 시 (예: "오늘 일정 뭐야?", "내일 약속 확인해줘", "내 주간 일정 보여줘"):
   - 응답 형식: {"intent": "query", "query_type": "today" | "tomorrow" | "week" | "person", "person": "사람 이름 (해당하는 경우만)", "description": "일정 목록을 확인해주세요 (또는 관련 메시지)"}

3. 빈 시간 확인 또는 추천 요청 시 (예: "언제 비어있어?", "추천해줘"):
   - 응답 형식: {"intent": "recommend", "response": "자연스러운 응답 메시지 (예: 이번주 목요일 오후가 비어있습니다. 이 시간은 어떠세요?)"}

<컨텍스트>
- 오늘 날짜: {{TODAY_DATE}} ({{TODAY_DAY}}요일)
- 현재 저장된 일정 목록: {{EXISTING_SCHEDULES}}

<사용자 입력>
{{USER_MESSAGE}}`;

  const prompt = promptTemplate
    .replace('{{TODAY_DATE}}', todayDate)
    .replace('{{TODAY_DAY}}', todayDay)
    .replace('{{EXISTING_SCHEDULES}}', schedulesJson)
    .replace('{{USER_MESSAGE}}', message);

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();
    console.log('Gemini raw response:', text);
    
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      let cleaned = jsonMatch[0].replace(/```json|```/g, '').trim();
      try {
        return JSON.parse(cleaned);
      } catch (e) {
        console.error('JSON parse error, trying to fix...', e);
        try {
          cleaned = cleaned.replace(/\\/g, '\\\\').replace(/\n/g, '\\n');
          return JSON.parse(cleaned);
        } catch (e2) {
          console.error('Failed to parse JSON completely', e2);
        }
      }
    }
    
    if (message.includes('비어') || message.includes('추천') || message.includes('언제')) {
      return {
        intent: 'recommend',
        response: text
      };
    }
    return {
      intent: 'unknown',
      description: '죄송합니다. 요청을 이해하지 못했습니다.'
    };
  } catch (error) {
    console.log('Gemini API Error details (log):', error);
    console.error('Gemini API Error details:', error);
    return null;
  }
}
