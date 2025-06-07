const fs = require('fs');
const path = require('path');

class KoreanToNodeIdMapper {
  constructor() {
    this.nodesData = null;
    this.liquorMap = new Map();
    this.ingredientMap = new Map();
    this.koreanToEnglishMap = new Map(); // 새로 추가: CSV 매핑
    this.koreanMappings = this.loadKoreanMappings();
    this.loadKoreanLiquorMapping(); // 새로 추가: CSV 로드
    this.loadNodesData();
  }

  loadKoreanLiquorMapping() {
    try {
      const csvPath = path.join(__dirname, '../../../EnglishKorean_Liquor_Names.csv');
      
      if (!fs.existsSync(csvPath)) {
        console.warn('Korean liquor mapping CSV file not found');
        return;
      }
      
      const csvData = fs.readFileSync(csvPath, 'utf-8');
      const lines = csvData.split('\n').slice(1); // 헤더 제거
      
      lines.forEach(line => {
        if (line.trim()) {
          const [liquor_name, korean_name] = line.split(',');
          if (liquor_name && korean_name) {
            const cleanLiquorName = liquor_name.trim();
            const cleanKoreanName = korean_name.trim();
            
            // 한국어 이름을 키로, 영어 이름을 값으로 저장
            this.koreanToEnglishMap.set(cleanKoreanName, cleanLiquorName);
          }
        }
      });
      
      console.log(`Loaded ${this.koreanToEnglishMap.size} Korean liquor mappings from CSV`);
    } catch (error) {
      console.error('Error loading Korean liquor mapping:', error);
    }
  }

  loadNodesData() {
    try {
      const csvPath = path.join(__dirname, '../../../ai-server/dataset/nodes_191120_updated.csv');
      
      if (!fs.existsSync(csvPath)) {
        console.warn('CSV file not found, using fallback data');
        return;
      }
      
      const csvData = fs.readFileSync(csvPath, 'utf-8');
      const lines = csvData.split('\n').slice(1); // 헤더 제거
      
      lines.forEach(line => {
        if (line.trim()) {
          const parts = line.split(',');
          if (parts.length >= 4) {
            const node_id = parts[0];
            const name = parts[1];
            const node_type = parts[3];
            
            if (node_id && name && node_type) {
              const nodeId = parseInt(node_id);
              const cleanName = name.toLowerCase().trim();
              
              if (node_type === 'liquor') {
                this.liquorMap.set(cleanName, nodeId);
              } else if (node_type === 'ingredient') {
                this.ingredientMap.set(cleanName, nodeId);
              }
            }
          }
        }
      });
      
      console.log(`Loaded ${this.liquorMap.size} liquors and ${this.ingredientMap.size} ingredients from CSV`);
    } catch (error) {
      console.error('Error loading nodes data:', error);
      // 오류 발생 시 기본 데이터로 대체
      this.loadFallbackData();
    }
  }

  loadFallbackData() {
    // CSV 로드 실패 시 기본 데이터
    const fallbackData = {
      liquors: {
        39: 'absinthe',
        40: 'absolut_citron_vodka',
        75: 'ale',
        96: 'almond_flavored_liqueur',
        100: 'almond_liqueur',
        120: 'amaretto_liqueur',
        122: 'amber_beer',
        123: 'amber_rum',
        159: 'apple_brandy',
        167: 'apple_liqueur',
        177: 'apricot_brandy',
        184: 'apricot_liqueur',
        194: 'armagnac',
        311: 'banana_liqueur',
        423: 'beer',
        519: 'blackberry_brandy',
        521: 'blackberry_liqueur',
        524: 'blackberry_wine',
        652: 'bourbon',
        653: 'bourbon_whiskey',
        662: 'brandy',
        755: 'brut_champagne',
        777: 'burgundy_wine',
        827: 'cabernet_sauvignon_wine',
        1069: 'champagne',
        1079: 'chardonnay_wine',
        1112: 'cherry_brandy',
        1115: 'cherry_flavored_liqueur',
        1137: 'chianti_wine',
        1246: 'chinese_rice_wine',
        1251: 'chinese_wine',
        1317: 'chocolate_liqueur',
        1361: 'cider',
        1441: 'coconut_liqueur',
        1448: 'coconut_rum',
        1462: 'coffee_flavored_liqueur',
        1465: 'coffee_liqueur',
        1467: 'cognac',
        1468: 'cointreau_liqueur',
        1627: 'corona_beer',
        1830: 'dark_rum',
        1821: 'dark_jamaican_rum',
        2102: 'dry_champagne',
        2112: 'dry_gin',
        2119: 'dry_marsala_wine',
        2135: 'dry_red_wine',
        2149: 'dry_vermouth',
        2151: 'dry_white_vermouth',
        2152: 'dry_white_wine',
        2153: 'dry_wine',
        2204: 'elderflower_liqueur',
        2413: 'framboise_liqueur'
      },
      ingredients: {
        88: 'almond',
        158: 'apple',
        175: 'apricot',
        223: 'avocado',
        302: 'banana',
        328: 'basil',
        361: 'beef',
        518: 'blackberry',
        547: 'blueberry',
        668: 'bread',
        781: 'butter',
        805: 'buttermilk',
        823: 'cabbage',
        885: 'candy_bar',
        966: 'caper',
        1005: 'carrot',
        1014: 'cashew_nut',
        1041: 'celery',
        1083: 'cheddar_cheese',
        1089: 'cheese',
        1111: 'cherry',
        1125: 'cherry_tomato',
        1138: 'chicken',
        1204: 'chickpea',
        1266: 'chocolate',
        1368: 'cinnamon',
        1458: 'coffee',
        1595: 'corn',
        1598: 'corn_chip',
        1631: 'cottage_cheese',
        1645: 'crab',
        1664: 'cranberry',
        1681: 'cream',
        1682: 'cream_cheese',
        1768: 'cucumber',
        1845: 'date',
        1895: 'dill',
        2188: 'egg',
        2200: 'eggplant',
        2320: 'feta_cheese',
        2331: 'fig',
        2364: 'fish',
        2396: 'flour',
        2430: 'french_fry',
        2547: 'fresh_pea',
        2591: 'fresh_tomato'
      }
    };

    for (const [nodeId, name] of Object.entries(fallbackData.liquors)) {
      this.liquorMap.set(name.toLowerCase(), parseInt(nodeId));
    }

    for (const [nodeId, name] of Object.entries(fallbackData.ingredients)) {
      this.ingredientMap.set(name.toLowerCase(), parseInt(nodeId));
    }

    console.log(`Loaded fallback data: ${this.liquorMap.size} liquors, ${this.ingredientMap.size} ingredients`);
  }

  loadKoreanMappings() {
    return {
      liquors: {
        "위스키": ["whiskey", "whisky", "bourbon", "scotch"],
        "보드카": ["vodka", "absolut"],
        "럼": ["rum", "dark_rum", "jamaican_rum"],
        "진": ["gin", "dry_gin"],
        "브랜디": ["brandy", "cognac", "armagnac"],
        "맥주": ["beer", "ale", "lager", "corona"],
        "와인": ["wine", "chardonnay", "cabernet", "burgundy", "chianti"],
        "테킬라": ["tequila"],
        "사케": ["sake"],
        "소주": ["soju"],
        "리큐어": ["liqueur", "amaretto", "cointreau"],
        "샴페인": ["champagne", "brut"],
        "사이다": ["cider"],
        "코냑": ["cognac"],
        "아마레또": ["amaretto"],
        "커피리큐어": ["coffee_liqueur", "coffee_flavored_liqueur"],
        "초콜릿리큐어": ["chocolate_liqueur"]
      },
      ingredients: {
        "치즈": ["cheese", "cheddar", "mozzarella", "brie", "feta", "cottage"],
        "고기": ["beef", "pork", "chicken", "meat"],
        "생선": ["fish", "salmon", "tuna"],
        "과일": ["apple", "orange", "lemon", "lime", "berry"],
        "사과": ["apple"],
        "바나나": ["banana"],
        "블루베리": ["blueberry"],
        "딸기": ["strawberry"],
        "체리": ["cherry"],
        "포도": ["grape"],
        "레몬": ["lemon"],
        "라임": ["lime"],
        "오렌지": ["orange"],
        "채소": ["vegetable", "onion", "garlic", "pepper"],
        "토마토": ["tomato", "cherry_tomato"],
        "당근": ["carrot"],
        "셀러리": ["celery"],
        "오이": ["cucumber"],
        "아보카도": ["avocado"],
        "향신료": ["spice", "pepper", "salt", "herb"],
        "바질": ["basil"],
        "딜": ["dill"],
        "계피": ["cinnamon"],
        "초콜릿": ["chocolate"],
        "커피": ["coffee"],
        "견과류": ["nut", "almond", "walnut", "cashew"],
        "아몬드": ["almond"],
        "캐슈넛": ["cashew_nut"],
        "해산물": ["seafood", "shrimp", "crab"],
        "게": ["crab"],
        "새우": ["shrimp"],
        "버섯": ["mushroom"],
        "올리브": ["olive"],
        "케이퍼": ["caper"],
        "빵": ["bread"],
        "버터": ["butter"],
        "크림": ["cream", "cream_cheese"],
        "달걀": ["egg"],
        "밀가루": ["flour"],
        "옥수수": ["corn"],
        "감자": ["potato"],
        "고구마": ["sweet_potato"],
        "콩": ["bean", "chickpea"],
        "완두콩": ["pea", "fresh_pea"],
        "가지": ["eggplant"],
        "무화과": ["fig"],
        "대추": ["date"],
        "크랜베리": ["cranberry"],
        "양배추": ["cabbage"],
        "우유": ["milk", "buttermilk"]
      }
    };
  }

  // *** 새로운 메서드: 품질 점수 계산 ***
  calculateItemQuality(dbName, englishKeyword) {
    // 기본 품질 점수
    let quality = 0;
    
    // 1. 정확한 매치 (최고 품질)
    if (dbName === englishKeyword.toLowerCase()) {
      quality = 1000;
    }
    // 2. 간단한 매치 (높은 품질)
    else if (this.isSimpleMatch(dbName, englishKeyword)) {
      quality = 800;
    }
    // 3. 복잡한 매치 (중간 품질)
    else if (this.isComplexMatch(dbName, englishKeyword)) {
      quality = 400;
    }
    // 4. 매우 구체적인 매치 (낮은 품질)
    else {
      quality = 100;
    }
    
    // 이름 길이에 따른 페널티 (길수록 구체적)
    const lengthPenalty = Math.min(dbName.length * 2, 100);
    quality = Math.max(quality - lengthPenalty, 50);
    
    return quality;
  }

  // 간단한 매치인지 확인
  isSimpleMatch(dbName, keyword) {
    const simplePatterns = {
      'wine': ['red_wine', 'white_wine', 'dry_wine'],
      'beef': ['ground_beef', 'beef_steak', 'beef_roast'],
      'chicken': ['chicken_breast', 'chicken_thigh', 'roast_chicken'],
      'pork': ['pork_chop', 'pork_loin', 'ground_pork'],
      'cheese': ['cheddar_cheese', 'mozzarella_cheese', 'cream_cheese'],
      'fish': ['salmon_fillet', 'tuna_steak', 'white_fish']
    };
    
    const patterns = simplePatterns[keyword.toLowerCase()] || [];
    return patterns.some(pattern => dbName === pattern);
  }

  // 복잡한 매치인지 확인
  isComplexMatch(dbName, keyword) {
    const complexPatterns = {
      'wine': ['chardonnay_wine', 'cabernet_wine', 'burgundy_wine', 'chianti_wine'],
      'beef': ['ribeye_steak', 'sirloin_steak', 'beef_tenderloin'],
      'chicken': ['chicken_wings', 'chicken_drumstick', 'chicken_cutlet'],
      'pork': ['pork_shoulder', 'pork_belly', 'pork_tenderloin']
    };
    
    const patterns = complexPatterns[keyword.toLowerCase()] || [];
    return patterns.some(pattern => dbName.includes(pattern));
  }

  // 🆕 새로 추가된 메서드: 모든 주류 반환
  getAllLiquors() {
    const liquors = [];
    for (const [name, nodeId] of this.liquorMap.entries()) {
      liquors.push({
        nodeId,
        name,
        type: 'liquor'
      });
    }
    
    // nodeId 순으로 정렬
    return liquors.sort((a, b) => a.nodeId - b.nodeId);
  }

  // 🆕 새로 추가된 메서드: 모든 재료 반환
  getAllIngredients() {
    const ingredients = [];
    for (const [name, nodeId] of this.ingredientMap.entries()) {
      ingredients.push({
        nodeId,
        name,
        type: 'ingredient'
      });
    }
    
    // nodeId 순으로 정렬
    return ingredients.sort((a, b) => a.nodeId - b.nodeId);
  }

  searchByKorean(koreanText, type = 'both') {
    const results = [];
    
    // 1. 먼저 CSV 매핑에서 정확한 매치 찾기 (주류만)
    if (type === 'liquor' || type === 'both') {
      // 정확한 매치부터 찾기
      if (this.koreanToEnglishMap.has(koreanText)) {
        const englishName = this.koreanToEnglishMap.get(koreanText);
        const nodeId = this.liquorMap.get(englishName.toLowerCase());
        if (nodeId) {
          results.push({
            nodeId,
            name: englishName,
            type: 'liquor',
            korean: koreanText,
            matchType: 'exact',
            priority: 1000,
            quality: 1000
          });
        }
      }
      
      // 부분 매치 찾기
      for (const [korean, english] of this.koreanToEnglishMap.entries()) {
        if (korean.includes(koreanText) || koreanText.includes(korean)) {
          const nodeId = this.liquorMap.get(english.toLowerCase());
          if (nodeId && !results.find(r => r.nodeId === nodeId)) {
            results.push({
              nodeId,
              name: english,
              type: 'liquor',
              korean: korean,
              matchType: 'partial',
              priority: 500,
              quality: 500
            });
          }
        }
      }
    }

    // 2. 기존 매핑 방식으로 보완 - *** 개선된 버전 ***
    const mappings = type === 'liquor' ? { liquors: this.koreanMappings.liquors } : 
                    type === 'ingredient' ? { ingredients: this.koreanMappings.ingredients } :
                    this.koreanMappings;

    for (const [category, categoryMappings] of Object.entries(mappings)) {
      const dataMap = category === 'liquors' ? this.liquorMap : this.ingredientMap;
      
      for (const [koreanName, englishNames] of Object.entries(categoryMappings)) {
        if (koreanText.includes(koreanName) || koreanName.includes(koreanText)) {
          
          // *** 각 영어 키워드별로 매칭 결과 수집 ***
          for (const englishName of englishNames) {
            const categoryResults = [];
            
            for (const [dbName, nodeId] of dataMap.entries()) {
              if (dbName.includes(englishName.toLowerCase())) {
                // 품질 점수 계산
                const quality = this.calculateItemQuality(dbName, englishName);
                
                categoryResults.push({
                  nodeId,
                  name: dbName,
                  type: category.slice(0, -1),
                  korean: koreanName,
                  matchType: dbName === englishName.toLowerCase() ? 'exact_mapping' : 'partial_mapping',
                  priority: quality,
                  quality: quality,
                  keyword: englishName // 디버깅용
                });
              }
            }
            
            // *** 각 키워드별로 상위 N개만 선택 ***
            const topResults = categoryResults
              .sort((a, b) => b.quality - a.quality)
              .slice(0, 8); // 키워드당 최대 8개
            
            // 중복 제거하고 추가
            for (const result of topResults) {
              if (!results.find(r => r.nodeId === result.nodeId)) {
                results.push(result);
              }
            }
          }
        }
      }
    }

    // *** 최종 정렬 및 제한 ***
    results.sort((a, b) => {
      // 1. 품질 점수 우선
      if (a.quality !== b.quality) {
        return b.quality - a.quality;
      }
      // 2. 이름 길이 (짧을수록 일반적)
      return a.name.length - b.name.length;
    });

    console.log(`Korean search for "${koreanText}": found ${results.length} results (filtered from potentially thousands)`);
    
    // *** 상위 결과만 로깅 ***
    const topResults = results.slice(0, 15);
    topResults.forEach((result, i) => {
      console.log(`  ${i+1}. ${result.name} (${result.matchType}, quality: ${result.quality}) → node_id: ${result.nodeId}`);
    });

    if (results.length > 15) {
      console.log(`  ... and ${results.length - 15} more results (showing top 15)`);
    }

    // *** 최대 30개로 제한 ***
    return results.slice(0, 30);
  }

  // *** 새로운 메서드: 전체 데이터에서 해당 카테고리 모든 아이템 반환 ***
  getAllMatchingItems(koreanText, type) {
    const results = [];
    const mappings = type === 'liquor' ? this.koreanMappings.liquors : this.koreanMappings.ingredients;
    const dataMap = type === 'liquor' ? this.liquorMap : this.ingredientMap;
    
    // 해당 한국어에 매칭되는 영어 키워드들 찾기
    const matchingKeywords = [];
    
    for (const [koreanName, englishNames] of Object.entries(mappings)) {
      if (koreanText.includes(koreanName) || koreanName.includes(koreanText)) {
        matchingKeywords.push(...englishNames);
      }
    }
    
    // 모든 데이터에서 키워드에 해당하는 아이템들 찾기
    for (const [dbName, nodeId] of dataMap.entries()) {
      for (const keyword of matchingKeywords) {
        if (dbName.includes(keyword.toLowerCase())) {
          if (!results.find(r => r.nodeId === nodeId)) {
            results.push({
              nodeId,
              name: dbName,
              type: type,
              korean: koreanText
            });
          }
        }
      }
    }
    
    console.log(`Found ${results.length} items for "${koreanText}" in category "${type}"`);
    return results;
  }

  // 새로운 메서드 추가: 최적의 페어링 조합 찾기
  async getBestPairingCombination(koreanLiquor, koreanIngredient) {
    const liquorResults = this.searchByKorean(koreanLiquor, 'liquor');
    const ingredientResults = this.searchByKorean(koreanIngredient, 'ingredient');
    
    if (liquorResults.length === 0 || ingredientResults.length === 0) {
      return {
        success: false,
        error: '매칭되는 주류 또는 재료를 찾을 수 없습니다',
        suggestions: {
          liquors: liquorResults,
          ingredients: ingredientResults
        }
      };
    }
    
    return {
      success: true,
      combinations: {
        liquors: liquorResults, // 이미 필터링된 결과
        ingredients: ingredientResults // 이미 필터링된 결과
      }
    };
  }

  getNodeIdByKorean(koreanLiquor, koreanIngredient) {
    const liquorResults = this.searchByKorean(koreanLiquor, 'liquor');
    const ingredientResults = this.searchByKorean(koreanIngredient, 'ingredient');

    return {
      liquorNodeId: liquorResults.length > 0 ? liquorResults[0].nodeId : null,
      ingredientNodeId: ingredientResults.length > 0 ? ingredientResults[0].nodeId : null,
      liquorName: liquorResults.length > 0 ? liquorResults[0].name : null,
      ingredientName: ingredientResults.length > 0 ? ingredientResults[0].name : null,
      suggestions: {
        liquors: liquorResults,
        ingredients: ingredientResults
      }
    };
  }
}

module.exports = new KoreanToNodeIdMapper();