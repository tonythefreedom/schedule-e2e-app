import dotenv from 'dotenv';

dotenv.config();

const SLACK_BOT_TOKEN = process.env.SLACK_BOT_TOKEN || '';
const SLACK_NOTIFY_EMAIL = process.env.SLACK_NOTIFY_EMAIL || '';

// 이메일 → 슬랙 유저 ID 조회는 비용이 있으므로 한 번만 하고 캐싱한다.
let cachedUserId: string | null = null;

async function resolveUserId(): Promise<string | null> {
  if (cachedUserId) return cachedUserId;
  if (!SLACK_BOT_TOKEN || !SLACK_NOTIFY_EMAIL) {
    console.error('[slack] SLACK_BOT_TOKEN 또는 SLACK_NOTIFY_EMAIL이 설정되지 않았습니다.');
    return null;
  }

  const res = await fetch(
    `https://slack.com/api/users.lookupByEmail?email=${encodeURIComponent(SLACK_NOTIFY_EMAIL)}`,
    { headers: { Authorization: `Bearer ${SLACK_BOT_TOKEN}` } }
  );
  const data = await res.json();
  if (data.ok && data.user?.id) {
    cachedUserId = data.user.id;
    return cachedUserId;
  }
  console.error('[slack] users.lookupByEmail 실패:', data.error);
  return null;
}

/**
 * 설정된 이메일(SLACK_NOTIFY_EMAIL)의 슬랙 사용자에게 DM을 발송한다.
 * 성공 여부를 boolean으로 반환한다.
 */
export async function sendSlackDM(text: string): Promise<boolean> {
  const userId = await resolveUserId();
  if (!userId) return false;

  const res = await fetch('https://slack.com/api/chat.postMessage', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${SLACK_BOT_TOKEN}`,
      'Content-Type': 'application/json; charset=utf-8',
    },
    body: JSON.stringify({ channel: userId, text }),
  });
  const data = await res.json();
  if (!data.ok) {
    console.error('[slack] chat.postMessage 실패:', data.error);
    return false;
  }
  return true;
}
