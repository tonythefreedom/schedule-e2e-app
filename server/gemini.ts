import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function analyzeSchedule(message: string) {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const prompt = `
    다음 사용자의 요청에서 일정 정보를 추출해서 JSON 형식으로 응답해줘.
    요청: "${message}"
    
    JSON 형식:
    {
      "title": "일정 제목",
      "date": "YYYY-MM-DD",
      "time": "HH:mm",
      "location": "장소 (없으면 빈 문자열)",
      "content": "내용 (없으면 빈 문자열)"
    }
    
    오늘 날짜는 ${new Date().toISOString().split('T')[0]} 이야. 상대적인 날짜(내일, 이번주 토요일 등)는 이 날짜를 기준으로 계산해줘.
    JSON 외의 다른 텍스트는 포함하지 마.
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    const jsonMatch = text.match(/\{.*\}/s);
    
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return null;
  } catch (error) {
    console.error('Gemini API Error:', error);
    return null;
  }
}
