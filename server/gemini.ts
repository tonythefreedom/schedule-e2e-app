import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_KEY || '');

export async function analyzeSchedule(message: string) {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
  const prompt = `
    사용자의 메시지를 분석하여 일정 관리 작업을 수행해줘.
    오늘 날짜는 ${new Date().toISOString().split('T')[0]} (오늘) 이야. 요일은 ${['일', '월', '화', '수', '목', '금', '토'][new Date().getDay()]}요일이야.

    응답은 반드시 아래 JSON 형식을 지켜야 해. JSON 외의 다른 텍스트는 포함하지 마. \`\`\`json \`\`\` 태그도 쓰지 마.

    1. 일정 등록 요청 시 (예: "내일 1시에 ..."):
    {
      "intent": "create",
      "data": {
        "title": "일정 제목 (예: 유명환 대표님과 저녁 약속)",
        "date": "YYYY-MM-DD",
        "time": "HH:mm",
        "location": "장소",
        "content": "추가 내용"
      }
    }

    2. 일정 조회 요청 시 (예: "오늘 일정 뭐야?", "내일 약속 확인해줘"):
    {
      "intent": "query",
      "query_type": "today" | "tomorrow" | "week" | "person",
      "person": "사람 이름 (해당하는 경우만)"
    }

    3. 빈 시간 확인 또는 추천 요청 시 (예: "언제 비어있어?", "추천해줘"):
    {
      "intent": "recommend" | "check_free",
      "response": "자연스러운 응답 메시지 (예: 이번주 목요일 오후가 비어있습니다. 이 시간은 어떠세요?)"
    }

    사용자 메시지: "${message}"
  `;

  try {
    console.log('Using GEMINI_KEY:', process.env.GEMINI_KEY ? 'exists' : 'missing');
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();
    console.log('Gemini raw response:', text);

    // Remove markdown code blocks if present
    const cleanText = text.replace(/```json\n?|```/g, '').trim();

    const jsonMatch = cleanText.match(/\{.*\}/s);
    
    if (jsonMatch) {
      try {
        const cleanedJson = jsonMatch[0].replace(/\/\/.*$/gm, '');
        const parsed = JSON.parse(cleanedJson);
        console.log('Gemini parsed response:', parsed);
        return parsed;
      } catch (e) {
        console.error('JSON Parse Error:', e, 'Cleaned text:', cleanText);
        return null;
      }
    }
    return null;
  } catch (error) {
    console.error('Gemini API Error:', error);
    return null;
  }
}
