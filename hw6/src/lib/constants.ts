export const DEFAULT_LLM_MODEL = "gpt-3.5-turbo";
export const MAX_CONTEXT_MESSAGES = 10;
export const FALLBACK_MESSAGE =
  "抱歉，我目前無法處理您的請求。請稍後再試，或聯繫管理員。";

export const ERROR_MESSAGES = {
  QUOTA_EXCEEDED: "抱歉，服務配額已用盡，請稍後再試。",
  SERVICE_UNAVAILABLE: "服務暫時無法使用，請稍後再試。",
  RATE_LIMIT: "請求過於頻繁，請稍後再試。",
  DEFAULT: FALLBACK_MESSAGE,
};

