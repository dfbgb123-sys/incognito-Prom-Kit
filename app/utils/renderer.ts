export function formatPrompt(
  template: string,
  data: {
    large_name: string;
    medium_name: string;
    small_name: string;
    userInput: string;
    activeRequests: string[];
    lang?: 'ko' | 'en';
  }
) {
  if (!data.large_name || data.large_name.trim() === '') {
    throw new Error("대분류(large_name)는 필수 입력 항목입니다.");
  }
  if (!template) {
    throw new Error("템플릿 내용이 누락되었습니다.");
  }

  const lang = data.lang ?? 'ko';

  let content = template
    .replace(/\[?\{large_name\}\]?/g, data.large_name)
    .replace(/\[?\{large_category\}\]?/g, data.large_name)
    .replace(/\[?\{medium_name\}\]?/g, data.medium_name)
    .replace(/\[?\{medium_category\}\]?/g, data.medium_name)
    .replace(/\[?\{small_name\}\]?/g, data.small_name)
    .replace(/\[?\{small_category\}\]?/g, data.small_name);

  const contextLabel = lang === 'en' ? 'Additional context' : '사용자 추가 맥락 사양';
  const contextStr = data.userInput.trim()
    ? `\n- ${contextLabel}: ${data.userInput.trim()}`
    : '';
  content = content.replace(/\{user_context\}/g, contextStr);

  const requestsStr = data.activeRequests.map(req => `- ${req}`).join('\n');
  content = content.replace(/\{requests\}/g, requestsStr);

  const constraintLabel = lang === 'en' ? 'Constraint' : '보완사항';
  let constraintsStr = '';
  if (data.small_name.trim()) {
    constraintsStr = data.small_name.split(',').map((name, i) => `- [${constraintLabel} ${i + 1}] ${name.trim()}`).join('\n');
  }

  if (!data.small_name.trim()) {
    content = content.replace(/\n## ⚠️ 제약 조건 및 피드백\n\{constraints\}/g, '');
    content = content.replace(/\n## ⚠️ Constraints & Feedback\n\{constraints\}/g, '');
    content = content.replace(/\{constraints\}/g, '');
  } else {
    content = content.replace(/\{constraints\}/g, constraintsStr);
  }

  return content;
}
