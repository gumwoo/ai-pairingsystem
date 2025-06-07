
exports.ratePairing = async (req, res) => {
  try {
    const { pairingId } = req.params;
    const { rating } = req.body;
    
    if (!pairingId) {
      return res.status(400).json({ success: false, error: 'Please provide a pairing ID' });
    }
    
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, error: 'Rating must be between 1 and 5' });
    }
    
    const updatedPairing = await Pairing.updateRating(pairingId, rating);
    
    return res.json({
      success: true,
      data: updatedPairing
    });
    
  } catch (error) {
    console.error('Error in rate pairing controller:', error);
    return res.status(500).json({ success: false, error: 'Server error' });
  }
};

exports.getLiquorRecommendationsForIngredient = async (req, res) => {
  try {
    const { ingredient } = req.body;
    const limit = Math.min(parseInt(req.body.limit || 5), 5);
    
    if (!ingredient) {
      return res.status(400).json({ 
        success: false, 
        error: '한글 재료명을 입력해주세요' 
      });
    }
    
    const ingredientResults = koreanMapper.searchByKorean(ingredient, 'ingredient');
    
    if (ingredientResults.length === 0) {
      return res.status(404).json({
        success: false,
        error: '매칭되는 재료를 찾을 수 없습니다',
        korean_input: ingredient
      });
    }
    
    const mainIngredient = ingredientResults[0];
    const sampleLiquorIds = [75, 423, 524, 300, 400, 500, 600, 700, 800, 900];
    const bestLiquors = [];
    
    for (const liquorId of sampleLiquorIds) {
      try {
        const rawScore = await getPairingScoreOnly(liquorId, mainIngredient.nodeId);
        const normalizedScore = normalizeScoreTo100(rawScore);
        
        const liquorInfo = koreanMapper.getLiquorByNodeId(liquorId);
        
        if (liquorInfo) {
          bestLiquors.push({
            liquor_id: liquorInfo.nodeId,
            liquor_name: liquorInfo.name,
            score: normalizedScore,
            raw_score: rawScore,
            compatibility_level: normalizedScore >= 80 ? "강력 추천" : 
                                normalizedScore >= 60 ? "추천" : 
                                normalizedScore >= 40 ? "무난한 선택" : "실험적인 선택"
          });
        }
      } catch (error) {
        console.error(`❌ Error testing liquor ${liquorId}:`, error);
      }
    }
    
    bestLiquors.sort((a, b) => b.raw_score - a.raw_score);
    const recommendations = bestLiquors.slice(0, limit);
    
    let bestWithExplanation = null;
    if (recommendations.length > 0) {
      const bestLiquor = recommendations[0];
      try {
        const explanation = await getExplanationOnly(
          bestLiquor.liquor_id,
          mainIngredient.nodeId,
          bestLiquor.raw_score
        );
        
        bestWithExplanation = {
          liquor_name: bestLiquor.liquor_name,
          score: bestLiquor.score,
          explanation: explanation.gpt_explanation || explanation.explanation
        };
      } catch (error) {
        bestWithExplanation = {
          liquor_name: bestLiquor.liquor_name,
          score: bestLiquor.score,
          explanation: `${ingredient}에 가장 잘 어울리는 술은 ${bestLiquor.liquor_name}입니다.`
        };
      }
    }
    
    return res.json({
      success: true,
      data: {
        korean_input: ingredient,
        ingredient_name: mainIngredient.name,
        ingredient_node_id: mainIngredient.nodeId,
        best_liquor: bestWithExplanation,
        recommendations: recommendations,
        search_summary: {
          tested_liquors: bestLiquors.length,
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

exports.getLiquorRecommendationsKorean = async (req, res) => {
  try {
    const { ingredient } = req.body;
    const limit = Math.min(parseInt(req.body.limit || 3), 3);
    
    if (!ingredient) {
      return res.status(400).json({ 
        success: false, 
        error: '한글 재료명을 입력해주세요' 
      });
    }
    
    const ingredientResults = koreanMapper.searchByKorean(ingredient, 'ingredient');
    
    if (ingredientResults.length === 0) {
      return res.status(404).json({
        success: false,
        error: '매칭되는 재료를 찾을 수 없습니다',
        korean_input: ingredient
      });
    }
    
    const mainIngredient = ingredientResults[0];
    const sampleLiquorIds = [75, 423, 524, 300, 400, 500, 600, 700, 800, 900, 100, 200, 350, 450, 550];
    const bestLiquors = [];
    
    for (const liquorId of sampleLiquorIds) {
      try {
        const rawScore = await getPairingScoreOnly(liquorId, mainIngredient.nodeId);
        const normalizedScore = normalizeScoreTo100(rawScore);
        
        const liquorInfo = koreanMapper.getLiquorByNodeId(liquorId);
        
        if (liquorInfo) {
          bestLiquors.push({
            liquor_id: liquorInfo.nodeId,
            liquor_name: liquorInfo.name,
            score: normalizedScore,
            raw_score: rawScore
          });
        }
      } catch (error) {
        console.error(`❌ Error testing liquor ${liquorId}:`, error);
      }
    }
    
    bestLiquors.sort((a, b) => b.raw_score - a.raw_score);
    const topRecommendations = bestLiquors.slice(0, limit);
    
    const recommendationsWithExplanations = [];
    for (const rec of topRecommendations) {
      try {
        const explanation = await getExplanationOnly(
          rec.liquor_id,
          mainIngredient.nodeId,
          rec.raw_score
        );
        
        recommendationsWithExplanations.push({
          name: rec.liquor_name,
          score: rec.score,
          explanation: explanation.gpt_explanation || explanation.explanation || `${ingredient}과 ${rec.liquor_name}은 잘 어울리는 조합입니다.`
        });
      } catch (error) {
        recommendationsWithExplanations.push({
          name: rec.liquor_name,
          score: rec.score,
          explanation: `${ingredient}과 ${rec.liquor_name}은 좋은 조합입니다.`
        });
      }
    }
    
    let overallExplanation = null;
    if (topRecommendations.length > 0) {
      const topLiquorNames = topRecommendations.slice(0, 2).map(r => r.liquor_name).join(', ');
      overallExplanation = `${ingredient}에는 ${topLiquorNames} 등이 특히 잘 어울립니다. 이들은 ${ingredient}의 맛과 향을 보완하고 조화를 이룹니다.`;
    }
    
    return res.json({
      success: true,
      data: {
        korean_input: ingredient,
        ingredient_name: mainIngredient.name,
        ingredient_node_id: mainIngredient.nodeId,
        recommendations: recommendationsWithExplanations,
        overall_explanation: overallExplanation,
        token_usage: {
          gpt_calls_made: recommendationsWithExplanations.length,
          explanation: "GPT explanation for each recommendation"
        }
      }
    });
    
  } catch (error) {
    console.error('❌ Error in Korean liquor recommendations:', error);
    return res.status(500).json({ 
      success: false, 
      error: '서버 오류가 발생했습니다' 
    });
  }
};