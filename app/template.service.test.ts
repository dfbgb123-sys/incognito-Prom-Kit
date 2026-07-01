import { 
  getSubChipsByMacroName, 
  getTemplateById, 
  CategoryItem, 
  PromptTemplate 
} from './utils/templateService';

describe('Template Service Tests', () => {
  const mockCategories: CategoryItem[] = [
    { id: 'cat_l_001', name: '공부', level: 1, parent_id: null, type: 'system' },
    { id: 'cat_l_002', name: '여행', level: 1, parent_id: null, type: 'system' },
    { id: 'cat_m_001', name: '오답노트', level: 2, parent_id: 'cat_l_001', type: 'system' },
    { id: 'cat_m_002', name: '스터디플래너', level: 2, parent_id: 'cat_l_001', type: 'system' },
    { id: 'cat_m_003', name: '유럽 배낭여행', level: 2, parent_id: 'cat_l_002', type: 'system' }
  ];

  const mockTemplates: PromptTemplate[] = [
    { id: 'tpl_default', title: '기본 템플릿', template_content: '기본 내용' },
    { id: 'tpl_study', title: '공부 전략', template_content: '공부 최적화' }
  ];

  // 1. [카테고리 필터링] (test case 1)
  it('should filter and return sub-chips belonging to the selected macro category', () => {
    const result = getSubChipsByMacroName(mockCategories, '공부');
    expect(result).toEqual(['오답노트', '스터디플래너']);
  });

  // 2. [ID로 양식 매칭] (test case 2)
  it('should fetch the exact template object matching the given ID', () => {
    const result = getTemplateById(mockTemplates, 'tpl_study');
    expect(result).not.toBeNull();
    expect(result?.title).toBe('공부 전략');
    expect(result?.template_content).toBe('공부 최적화');
  });

  // 3. [없는 데이터 예외 방어] (test case 3)
  it('should return empty array or null safely when invalid category name or non-existent ID is provided', () => {
    // Invalid category name -> returns []
    const invalidCategoryResult = getSubChipsByMacroName(mockCategories, '존재하지않음');
    expect(invalidCategoryResult).toEqual([]);

    // Invalid template ID -> returns null
    const invalidTemplateResult = getTemplateById(mockTemplates, 'non_existent_id');
    expect(invalidTemplateResult).toBeNull();

    // Empty parameters -> returns [] / null
    expect(getSubChipsByMacroName(mockCategories, '')).toEqual([]);
    expect(getTemplateById(mockTemplates, '')).toBeNull();
  });
});
