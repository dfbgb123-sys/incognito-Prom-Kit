// app/api/generate/route.ts
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

function formatPrompt(template: string, data: { large_name: string, medium_name: string, small_name: string, userInput: string, activeRequests: string[] }) {
  let content = template
    .replace(/\[?\{large_name\}\]?/g, data.large_name)
    .replace(/\[?\{large_category\}\]?/g, data.large_name)
    .replace(/\[?\{medium_name\}\]?/g, data.medium_name)
    .replace(/\[?\{medium_category\}\]?/g, data.medium_name)
    .replace(/\[?\{small_name\}\]?/g, data.small_name)
    .replace(/\[?\{small_category\}\]?/g, data.small_name);

  const contextStr = data.userInput.trim() 
    ? `\n- 사용자 추가 맥락 사양: ${data.userInput.trim()}` 
    : '';
  content = content.replace(/\{user_context\}/g, contextStr);

  const requestsStr = data.activeRequests.map(req => `- ${req}`).join('\n');
  content = content.replace(/\{requests\}/g, requestsStr);

  let constraintsStr = '';
  if (data.small_name.trim()) {
    constraintsStr = data.small_name.split(',').map((name, i) => `- [보완사항 ${i + 1}] ${name.trim()}`).join('\n');
  }

  if (!data.small_name.trim()) {
    content = content.replace(/\n## ⚠️ 제약 조건 및 피드백\n\{constraints\}/g, '');
    content = content.replace(/\{constraints\}/g, '');
  } else {
    content = content.replace(/\{constraints\}/g, constraintsStr);
  }

  return content;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { type } = body;

    if (type === 'prompt') {
      const { large_name, medium_names, small_names, userInput, activeRequests } = body;

      const categoriesPath = path.join(process.cwd(), 'app', 'categories.json');
      const categoriesData = JSON.parse(fs.readFileSync(categoriesPath, 'utf8'));
      let categoriesChanged = false;

      // Find or register Large Category
      let largeCat = categoriesData.find((c: any) => c.level === 1 && c.name === large_name);
      if (!largeCat) {
        largeCat = {
          id: 'cat_l_usr_' + Date.now(),
          name: large_name,
          level: 1,
          parent_id: null,
          type: 'user'
        };
        categoriesData.push(largeCat);
        categoriesChanged = true;
      }

      // Find or register Medium Category (the first selected sub-chip)
      const primaryMediumName = medium_names[0] || null;
      let mediumCat = null;
      if (primaryMediumName) {
        mediumCat = categoriesData.find((c: any) => c.level === 2 && c.parent_id === largeCat.id && c.name === primaryMediumName);
        if (!mediumCat) {
          mediumCat = {
            id: 'cat_m_usr_' + Date.now(),
            name: primaryMediumName,
            level: 2,
            parent_id: largeCat.id,
            type: 'user'
          };
          categoriesData.push(mediumCat);
          categoriesChanged = true;
        }
      }

      // Find or register Small Category (the first selected refinement/tuning chip)
      const primarySmallName = small_names[0] || null;
      let smallCat = null;
      if (primarySmallName) {
        smallCat = categoriesData.find((c: any) => c.level === 3 && c.name === primarySmallName);
        if (!smallCat) {
          smallCat = {
            id: 'cat_s_usr_' + Date.now(),
            name: primarySmallName,
            level: 3,
            parent_id: null,
            type: 'user'
          };
          categoriesData.push(smallCat);
          categoriesChanged = true;
        }
      }

      // Save categories.json if updated
      if (categoriesChanged) {
        fs.writeFileSync(categoriesPath, JSON.stringify(categoriesData, null, 2), 'utf8');
      }

      // 2. Combination Map Search using resolved IDs
      const combinationPath = path.join(process.cwd(), 'app', 'combination_maps.json');
      const combinationData = JSON.parse(fs.readFileSync(combinationPath, 'utf8'));

      const large_id = largeCat.id;
      const medium_id = mediumCat ? mediumCat.id : null;
      const small_id = smallCat ? smallCat.id : null;

      const foundMap = combinationData.find((map: any) => 
        map.large_id === large_id && 
        map.medium_id === medium_id && 
        map.small_id === small_id
      );

      let templateId = 'tpl_default';

      if (foundMap) {
        templateId = foundMap.template_id;
      } else {
        // [새로운 조합인 경우]:
        // a. combination_maps.json에 새로운 고유 ID를 동적으로 생성하여 등록
        const newCombId = 'comb_user_' + Date.now();
        const newCombo = {
          id: newCombId,
          large_id,
          medium_id,
          small_id,
          template_id: 'tpl_default'
        };
        combinationData.push(newCombo);
        fs.writeFileSync(combinationPath, JSON.stringify(combinationData, null, 2), 'utf8');
      }

      // 100% 로컬 템플릿 치환으로 최종 프롬프트 조립
      const templatePath = path.join(process.cwd(), 'app', 'prompt_templates.json');
      const templateData = JSON.parse(fs.readFileSync(templatePath, 'utf8'));
      const targetTemplate = templateData.find((t: any) => t.id === templateId) || templateData.find((t: any) => t.id === 'tpl_default');

      const generatedPrompt = formatPrompt(targetTemplate.template_content, {
        large_name,
        medium_name: medium_names.join(', ') || '기본 맞춤 전략',
        small_name: small_names.join(', '),
        userInput,
        activeRequests
      });

      return NextResponse.json({ success: true, prompt: generatedPrompt });

    } else if (type === 'addCategory') {
      const { name, level, parent_name } = body;

      const categoriesPath = path.join(process.cwd(), 'app', 'categories.json');
      const categoriesData = JSON.parse(fs.readFileSync(categoriesPath, 'utf8'));

      let parentId = null;
      if (parent_name) {
        const parentCat = categoriesData.find((c: any) => c.level === 1 && c.name === parent_name);
        parentId = parentCat ? parentCat.id : null;
      }

      let existing = categoriesData.find((c: any) => c.level === level && c.name === name && c.parent_id === parentId);
      if (existing) {
        return NextResponse.json({ success: true, category: existing });
      }

      const prefix = level === 1 ? 'cat_l_usr_' : level === 2 ? 'cat_m_usr_' : 'cat_s_usr_';
      const newCat = {
        id: prefix + Date.now(),
        name,
        level,
        parent_id: parentId,
        type: 'user'
      };

      categoriesData.push(newCat);
      fs.writeFileSync(categoriesPath, JSON.stringify(categoriesData, null, 2), 'utf8');

      return NextResponse.json({ success: true, category: newCat });
    } else {
      return NextResponse.json({ success: false, error: '잘못된 요청 타입입니다.' }, { status: 400 });
    }
  } catch (error) {
    console.error('Local prompt assembly error:', error);
    return NextResponse.json({ success: false, error: '로컬 프롬프트 생성 실패' }, { status: 500 });
  }
}