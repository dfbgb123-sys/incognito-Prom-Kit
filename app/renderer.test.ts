import { formatPrompt } from './utils/renderer';

describe('Prompt Assembly Logic (formatPrompt)', () => {
  const mockTemplate = `
# 페르소나
- {large_name} 전문 컨설턴트

# 상황 설정
- 사용자는 {medium_name} 주제를 학습하려 함
- 구체사항: {small_name}

# 상세 요구사항
{requests}
{user_context}
  `;

  // 1. [기본 조립 성공] (test case 1)
  it('should successfully compile the prompt template with valid parameters without omission', () => {
    const testData = {
      large_name: '영어',
      medium_name: '기본 회화, 문법',
      small_name: '오답 집중 케어',
      userInput: '3일 안에 실전 마스터 원해요',
      activeRequests: ['액션 플랜 제공', '체크리스트 가이드']
    };

    const result = formatPrompt(mockTemplate, testData);

    expect(result).toContain('영어 전문 컨설턴트');
    expect(result).toContain('기본 회화, 문법 주제');
    expect(result).toContain('구체사항: 오답 집중 케어');
    expect(result).toContain('- 액션 플랜 제공');
    expect(result).toContain('- 사용자 추가 맥락 사양: 3일 안에 실전 마스터 원해요');
  });

  // 2. [핵심 재료 누락 방어] (test case 2)
  it('should throw an error if the large_name (대분류) is missing or empty', () => {
    const invalidData = {
      large_name: '',
      medium_name: '기본 회화',
      small_name: '',
      userInput: '',
      activeRequests: []
    };

    expect(() => {
      formatPrompt(mockTemplate, invalidData);
    }).toThrow('대분류(large_name)는 필수 입력 항목입니다.');
  });
});
