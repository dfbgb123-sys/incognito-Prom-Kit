export interface CategoryItem {
  id: string;
  name: string;
  level: number;
  parent_id: string | null;
  type: string;
}

export interface PromptTemplate {
  id: string;
  title: string;
  template_content: string;
}

/**
 * 대분류 카테고리 이름을 입력받아 해당 대분류 하위의 중분류(세부 칩) 이름 배열을 반환합니다.
 * 존재하지 않는 카테고리의 경우 빈 배열([])을 반환하여 안전하게 방어합니다.
 */
export function getSubChipsByMacroName(categories: CategoryItem[], macroName: string): string[] {
  if (!macroName) return [];
  const parentCat = categories.find(c => c.level === 1 && c.name === macroName);
  if (!parentCat) return [];
  
  return categories
    .filter(c => c.level === 2 && c.parent_id === parentCat.id)
    .map(c => c.name);
}

/**
 * 템플릿 ID를 입력받아 정확히 매칭되는 템플릿 개체를 반환합니다.
 * 존재하지 않는 ID이거나 유효하지 않을 경우 null을 반환하여 예외를 방어합니다.
 */
export function getTemplateById(templates: PromptTemplate[], templateId: string): PromptTemplate | null {
  if (!templateId) return null;
  const found = templates.find(t => t.id === templateId);
  return found || null;
}
