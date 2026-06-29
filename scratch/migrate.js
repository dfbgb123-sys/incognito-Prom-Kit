const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '..', 'app', 'data.json');
const rawData = fs.readFileSync(dataPath, 'utf8');
const data = JSON.parse(rawData);

const categories = [];
const combinationMaps = [];
const promptTemplates = [];

let catIdCounter = 1;

function getNextId(level) {
  const prefix = level === 1 ? 'cat_l_' : level === 2 ? 'cat_m_' : 'cat_s_';
  return prefix + String(catIdCounter++).padStart(3, '0');
}

// 1. Level 1 Categories (대분류)
const macroInitial = ["공부", "여행", "영어", "일정", "준비물", "레시피", "맛집", "성형"];
const macroPool = data.macroPool || [];
const infiniteMacroPool = data.infiniteMacroPool || [];
const allMacros = [...new Set([...macroInitial, ...macroPool, ...infiniteMacroPool])];

const macroMap = {}; // name -> id

allMacros.forEach(name => {
  const id = getNextId(1);
  macroMap[name] = id;
  categories.push({
    id,
    name,
    level: 1,
    parent_id: null,
    type: 'system'
  });
});

// 2. Level 2 Categories (중분류)
const subCategoryData = data.subCategoryData || {};
const mediumMap = {}; // parentId_name -> id

Object.entries(subCategoryData).forEach(([macroName, subNames]) => {
  const parentId = macroMap[macroName];
  if (!parentId) return;

  subNames.forEach(name => {
    const key = `${parentId}_${name}`;
    if (mediumMap[key]) return;
    const id = getNextId(2);
    mediumMap[key] = id;
    categories.push({
      id,
      name,
      level: 2,
      parent_id: parentId,
      type: 'system'
    });
  });
});

// 3. Level 3 Categories (소분류 - Tuning / Secondary Pool)
const secondaryPool = data.secondaryPool || [];
const specificSecondaryPools = data.specificSecondaryPools || {};
const allSecondaries = [...new Set([...secondaryPool, ...Object.values(specificSecondaryPools).flat()])];

const smallMap = {}; // name -> id

allSecondaries.forEach(name => {
  const id = getNextId(3);
  smallMap[name] = id;
  categories.push({
    id,
    name,
    level: 3,
    parent_id: null,
    type: 'system'
  });
});

// 4. Prompt Templates (프롬프트 템플릿)
const defaultTemplateContent = `# 🤖 AI 페르소나 지정
- 당신은 핵심을 찌르는 10년 차 최고의 [{large_name}] 전문 컨설턴트이자 멘토입니다.

## 🎯 목표 및 상황
- 사용자는 현재 [{large_name}] 분야의 작업을 진행 중이며, 특히 [{medium_name}] 요소를 핵심 재료로 고려하고 있습니다.
{user_context}

## 📝 요청 사항
{requests}

## ⚠️ 제약 조건 및 피드백
{constraints}`;

promptTemplates.push({
  id: 'tpl_default',
  title: '기본 범용 템플릿',
  template_content: defaultTemplateContent
});

// Write to files
fs.writeFileSync(path.join(__dirname, '..', 'app', 'categories.json'), JSON.stringify(categories, null, 2), 'utf8');
fs.writeFileSync(path.join(__dirname, '..', 'app', 'prompt_templates.json'), JSON.stringify(promptTemplates, null, 2), 'utf8');
fs.writeFileSync(path.join(__dirname, '..', 'app', 'combination_maps.json'), JSON.stringify(combinationMaps, null, 2), 'utf8');

console.log('Migration completed successfully!');
