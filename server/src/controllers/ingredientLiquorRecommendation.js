/**
 * 🆕 재료에 어울리는 술 추천 (새로운 기능)
 */
exports.getLiquorRecommendationsForIngredient = async (req, res) => {
  try {
    const { ingredient } = req.body;
    const limit = Math.min(parseInt(req.body.limit || 5), 5);
    
    console.log('🍽️ Getting liquor recommendations for ingredient:', ingredient);
    
    if (!ingredient) {
      return res.status(400).json({ 
        success: false, 
        error: '한글 재료명을 입력해주세요' 
      });
    }
    
    // 재료에 어울리는 최고 주류들 찾기
    const liquorResult = await findBestLiquorsForIngredient(ingredient);
    
    if (!liquorResult || liquorResult.bestLiquors.length === 0) {
      return res.status(404).json({
        success: false,
        error: '매칭되는 재료를 찾을 수 없거나 추천할 주류가 없습니다',
        korean_input: ingredient
      });
    }
    
    // 최고 주류에만 GPT 설명 추가 (토큰 절약)
    let bestWithExplanation = null;
    if (liquorResult.bestLiquors.length > 0) {
      const bestLiquor = liquorResult.bestLiquors[0];
      try {
        const explanation = await getExplanationOnly(
          bestLiquor.liquor.nodeId,
          liquorResult.ingredient.nodeId,
          bestLiquor.rawScore
        );
        
        bestWithExplanation = {
          ...bestLiquor,
          gptExplanation: explanation.gpt_explanation || explanation.explanation
        };
      } catch (error) {
        console.error('❌ Error getting GPT explanation for best liquor:', error);
        bestWithExplanation = {
          ...bestLiquor,
          gptExplanation: `${ingredient}에 가장 잘 어울리는 술은 ${bestLiquor.liquor.name}입니다. 이 조합은 ${bestLiquor.normalizedScore}점을 받았습니다.`
        };
      }
    }
    
    // 모든 추천 주류 정리 (GPT 설명 없이)
    const recommendations = liquorResult.bestLiquors.slice(0, limit).map(liquor => ({
      liquor_id: liquor.liquor.nodeId,
      liquor_name: liquor.liquor.name,
      score: liquor.normalizedScore,
      raw_score: liquor.rawScore,
      compatibility_level: liquor.normalizedScore >= 80 ? "강력 추천" : 
                          liquor.normalizedScore >= 60 ? "추천" : 
                          liquor.normalizedScore >= 40 ? "무난한 선택" : "실험적인 선택"
    }));
    
    return res.json({
      success: true,
      data: {
        korean_input: ingredient,
        ingredient_name: liquorResult.ingredient.name,
        ingredient_node_id: liquorResult.ingredient.nodeId,
        best_liquor: bestWithExplanation ? {
          liquor_name: bestWithExplanation.liquor.name,
          score: bestWithExplanation.normalizedScore,
          explanation: bestWithExplanation.gptExplanation
        } : null,
        recommendations: recommendations,
        search_summary: {
          tested_liquors: liquorResult.allTested.length,
          returned_recommendations: recommendations.length,
          best_score: recommendations.length > 0 ? recommendations[0].score : 0
        },
        token_usage: {
          gpt_calls_made: bestWithExplanation ? 1 : 0,
          explanation: "GPT explanation only for best liquor recommendation"
        }
      }
    });
    
  } catch (error) {
    console.error('❌ Error in ingredient-to-liquor recommendations:', error);
    return res.status(500).json({ 
      success: false, 
      error: '서버 오류가 발생했습니다' 
    });
  }
};

/**
 * 재료에 어울리는 최고 주류 찾기
 * @param {String} koreanIngredient - 한글 재료명
 * @returns {Object} 최고 점수 주류들
 */
const findBestLiquorsForIngredient = async (koreanIngredient) => {
  console.log(`🍽️ Finding best liquors for ingredient "${koreanIngredient}"`);
  
  // 한글 이름으로 매칭되는 재료 찾기
  const ingredientResults = koreanMapper.searchByKorean(koreanIngredient, 'ingredient');
  
  console.log(`📋 Found ${ingredientResults.length} ingredient matches`);
  
  if (ingredientResults.length === 0) {
    return null;
  }
  
  const mainIngredient = ingredientResults[0]; // 첫 번째 매칭 재료 사용
  
  // 시스템에 있는 주요 주류들 (샘플링)
  const sampleLiquorIds = [75, 423, 524, 300, 400, 500, 600, 700, 800, 900]; // 대표적인 주류 ID들
  const bestLiquors = [];
  
  console.log(`🧪 Testing ingredient ${mainIngredient.name} (${mainIngredient.nodeId}) with sample liquors`);
  
  // 각 주류와의 페어링 점수 계산
  for (const liquorId of sampleLiquorIds) {
    try {
      const rawScore = await getPairingScoreOnly(liquorId, mainIngredient.nodeId);
      const normalizedScore = normalizeScoreTo100(rawScore);
      
      // 주류 정보 가져오기 (한글명 포함)
      const liquorInfo = koreanMapper.getLiquorByNodeId(liquorId);
      
      if (liquorInfo) {
        bestLiquors.push({
          liquor: liquorInfo,
          ingredient: mainIngredient,
          rawScore,
          normalizedScore
        });
        
        console.log(`🍷 ${liquorInfo.name}: ${normalizedScore} points (raw: ${rawScore})`);
      }
      
    } catch (error) {
      console.error(`❌ Error testing liquor ${liquorId} with ${mainIngredient.name}:`, error);
    }
  }
  
  // 점수순으로 정렬
  bestLiquors.sort((a, b) => b.rawScore - a.rawScore);
  
  console.log(`✅ Found ${bestLiquors.length} liquor pairings for ${mainIngredient.name}`);
  
  return {
    ingredient: mainIngredient,
    bestLiquors: bestLiquors.slice(0, 5), // Top 5
    allTested: bestLiquors
  };
};