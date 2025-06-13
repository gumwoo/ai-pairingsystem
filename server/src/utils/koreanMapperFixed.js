const fs = require('fs');
const path = require('path');

class KoreanToNodeIdMapper {
  constructor() {
    this.nodesData = null;
    this.liquorMap = new Map();
    this.ingredientMap = new Map();
    this.koreanToEnglishMap = new Map();
    
    console.log('🚀 Initializing Korean Mapper...');
    this.koreanMappings = this.loadKoreanMappings();
    this.loadKoreanLiquorMapping();
    this.loadNodesData();
    console.log('✅ Korean Mapper initialization complete');
  }

  loadKoreanLiquorMapping() {
    console.log('📁 Loading Korean liquor mapping...');
    try {
      const csvPath = path.join(__dirname, '../../English-Korean_Liquor_Names.csv');
      console.log(`🔍 Looking for Korean liquor CSV at: ${csvPath}`);
      
      if (!fs.existsSync(csvPath)) {
        console.warn(`⚠️ Korean liquor mapping CSV file not found at: ${csvPath}`);
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
            
            this.koreanToEnglishMap.set(cleanKoreanName, cleanLiquorName);
          }
        }
      });
      
      console.log(`✅ Loaded ${this.koreanToEnglishMap.size} Korean liquor mappings from CSV`);
    } catch (error) {
      console.error('❌ Error loading Korean liquor mapping:', error);
    }
  }

  loadNodesData() {
    console.log('📁 Loading nodes data...');
    try {
      const csvPath = path.join(__dirname, '../../../ai-server/dataset/nodes_191120_updated.csv');
      console.log(`🔍 Looking for nodes CSV at: ${csvPath}`);
      
      if (!fs.existsSync(csvPath)) {
        console.warn(`⚠️ CSV file not found at: ${csvPath}, using fallback data`);
        this.loadFallbackData();
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
      
      console.log(`✅ Loaded ${this.liquorMap.size} liquors and ${this.ingredientMap.size} ingredients from CSV`);
    } catch (error) {
      console.error('❌ Error loading nodes data:', error);
      this.loadFallbackData();
    }
  }

  loadFallbackData() {
    console.log('🔄 Loading fallback data...');
    
    // 더 확장된 기본 데이터
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
        2413: 'framboise_liqueur',
        // 와인 관련 추가
        2234: 'port_wine',
        2235: 'port',
        2236: 'red_wine',
        2237: 'white_wine',
        2238: 'wine',
        5587: 'sake'
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
        2591: 'fresh_tomato',
        // 치즈 관련 더 추가
        2500: 'mozzarella_cheese',
        2501: 'brie_cheese',
        2502: 'goat_cheese'
      }
    };

    for (const [nodeId, name] of Object.entries(fallbackData.liquors)) {
      this.liquorMap.set(name.toLowerCase(), parseInt(nodeId));
    }

    for (const [nodeId, name] of Object.entries(fallbackData.ingredients)) {
      this.ingredientMap.set(name.toLowerCase(), parseInt(nodeId));
    }

    console.log(`✅ Loaded fallback data: ${this.liquorMap.size} liquors, ${this.ingredientMap.size} ingredients`);
    
    // 디버그: 와인과 치즈가 있는지 확인
    console.log('🔍 Debug - Checking for wine and cheese in data:');
    for (const [name, nodeId] of this.liquorMap.entries()) {
      if (name.includes('wine')) {
        console.log(`  🍷 Found wine: ${name} → ${nodeId}`);
      }
    }
    for (const [name, nodeId] of this.ingredientMap.entries()) {
      if (name.includes('cheese')) {
        console.log(`  🧀 Found cheese: ${name} → ${nodeId}`);
      }
    }
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
        "포트 와인": ["port_wine", "port"],
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
        "치킨": ["chicken"],
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

  searchByKorean(koreanText, type = 'both') {
    console.log(`🔍 Searching for Korean text: "${koreanText}" (type: ${type})`);
    const results = [];
    
    // 1. CSV 매핑에서 정확한 매치 찾기 (주류만)
    if (type === 'liquor' || type === 'both') {
      // 정확한 매치
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
          console.log(`  ✅ Found exact CSV match: ${englishName} → ${nodeId}`);
        }
      }
      
      // 부분 매치
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
            console.log(`  ✅ Found partial CSV match: ${english} → ${nodeId}`);
          }
        }
      }
    }

    // 2. 기존 매핑 방식
    const mappings = type === 'liquor' ? { liquors: this.koreanMappings.liquors } : 
                    type === 'ingredient' ? { ingredients: this.koreanMappings.ingredients } :
                    this.koreanMappings;

    for (const [category, categoryMappings] of Object.entries(mappings)) {
      const dataMap = category === 'liquors' ? this.liquorMap : this.ingredientMap;
      console.log(`  🔍 Searching in ${category} with ${dataMap.size} items`);
      
      for (const [koreanName, englishNames] of Object.entries(categoryMappings)) {
        if (koreanText.includes(koreanName) || koreanName.includes(koreanText)) {
          console.log(`    ✅ Korean match found: "${koreanName}" → ${englishNames}`);
          
          for (const englishName of englishNames) {
            const categoryResults = [];
            
            for (const [dbName, nodeId] of dataMap.entries()) {
              if (dbName.includes(englishName.toLowerCase())) {
                const quality = this.calculateItemQuality(dbName, englishName);
                
                categoryResults.push({
                  nodeId,
                  name: dbName,
                  type: category.slice(0, -1),
                  korean: koreanName,
                  matchType: dbName === englishName.toLowerCase() ? 'exact_mapping' : 'partial_mapping',
                  priority: quality,
                  quality: quality,
                  keyword: englishName
                });
              }
            }
            
            const topResults = categoryResults
              .sort((a, b) => b.quality - a.quality)
              .slice(0, 8);
            
            for (const result of topResults) {
              if (!results.find(r => r.nodeId === result.nodeId)) {
                results.push(result);
                console.log(`      ✅ Added: ${result.name} → ${result.nodeId} (quality: ${result.quality})`);
              }
            }
          }
        }
      }
    }

    // 정렬
    results.sort((a, b) => {
      if (a.quality !== b.quality) {
        return b.quality - a.quality;
      }
      return a.name.length - b.name.length;
    });

    console.log(`🎯 Total results found: ${results.length}`);
    const topResults = results.slice(0, 15);
    topResults.forEach((result, i) => {
      console.log(`  ${i+1}. ${result.name} (${result.matchType}, quality: ${result.quality}) → node_id: ${result.nodeId}`);
    });

    return results.slice(0, 30);
  }

  calculateItemQuality(dbName, englishKeyword) {
    let quality = 0;
    
    if (dbName === englishKeyword.toLowerCase()) {
      quality = 1000;
    } else if (this.isSimpleMatch(dbName, englishKeyword)) {
      quality = 800;
    } else if (this.isComplexMatch(dbName, englishKeyword)) {
      quality = 400;
    } else {
      quality = 100;
    }
    
    const lengthPenalty = Math.min(dbName.length * 2, 100);
    quality = Math.max(quality - lengthPenalty, 50);
    
    return quality;
  }

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

  getAllLiquors() {
    const liquors = [];
    for (const [name, nodeId] of this.liquorMap.entries()) {
      liquors.push({
        nodeId,
        name,
        type: 'liquor'
      });
    }
    
    return liquors.sort((a, b) => a.nodeId - b.nodeId);
  }

  getAllIngredients() {
    const ingredients = [];
    for (const [name, nodeId] of this.ingredientMap.entries()) {
      ingredients.push({
        nodeId,
        name,
        type: 'ingredient'
      });
    }
    
    return ingredients.sort((a, b) => a.nodeId - b.nodeId);
  }

  getAllMatchingItems(koreanText, type) {
    const results = [];
    const mappings = type === 'liquor' ? this.koreanMappings.liquors : this.koreanMappings.ingredients;
    const dataMap = type === 'liquor' ? this.liquorMap : this.ingredientMap;
    
    const matchingKeywords = [];
    
    for (const [koreanName, englishNames] of Object.entries(mappings)) {
      if (koreanText.includes(koreanName) || koreanName.includes(koreanText)) {
        matchingKeywords.push(...englishNames);
      }
    }
    
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
        liquors: liquorResults,
        ingredients: ingredientResults
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