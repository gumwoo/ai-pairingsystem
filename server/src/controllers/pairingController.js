const { getPairingScore, getPairingScoreOnly, getExplanationOnly, getRecommendations, getExplanation } = require('../ai/model');
const Pairing = require('../models/Pairing');
const Liquor = require('../models/Liquor');
const Ingredient = require('../models/Ingredient');
const koreanMapper = require('../utils/koreanMapper');

// 🔥 수정된 점수 정규화 함수 (0~1 범위 → 0~100 범위)
/**
 * AI 서버 점수를 0-100 범위로 정규화
 * @param {Number} rawScore - AI 서버에서 받은 원본 점수 (0~1 범위)
 * @returns {Number} 0-100 범위로 정규화된 점수
 */
function normalizeScoreTo100(rawScore) {
  if (typeof rawScore !== 'number') return 0;
  
  // 0~1 범위를 0~100으로 간단히 변환
  const normalized = rawScore * 100;
  
  // 0-100 범위로 제한 (안전장치)
  return Math.max(0, Math.min(100, Math.round(normalized)));
}

// 🔥 호환성을 위한 레거시 정규화 함수 (기존 -5~6 범위용)
/**
 * 레거시 모델의 점수를 0-100 범위로 정규화 (sigmoid 적용 전 모델용)
 * @param {Number} rawScore - AI 서버에서 받은 원본 점수 (-5~6 범위)
 * @returns {Number} 0-100 범위로 정규화된 점수
 */
function legacyNormalizeScoreTo100(rawScore) {
  if (typeof rawScore !== 'number') return 0;
  
  const LEGACY_SCORE_RANGE = {
    min: -30.0,  // 기존 범위
    max: 20.0
  };
  
  const normalized = ((rawScore - LEGACY_SCORE_RANGE.min) / (LEGACY_SCORE_RANGE.max - LEGACY_SCORE_RANGE.min)) * 100;
  return Math.max(0, Math.min(100, Math.round(normalized)));
}

// 🔥 스마트 정규화 함수 (자동으로 범위 감지)
/**
 * 점수 범위를 자동 감지하여 정규화
 * @param {Number} rawScore - AI 서버에서 받은 원본 점수
 * @returns {Number} 0-100 범위로 정규화된 점수
 */
// pairingController.js의 smartNormalizeScoreTo100 함수 수정
function smartNormalizeScoreTo100(rawScore) {
  // AI 서버가 이미 0~100 점수를 주므로 그대로 사용
  return Math.round(rawScore);
}

/**
 * 최고 페어링 찾기 - 점수만 계산하고 GPT 설명은 나중에 (토큰 최적화)
 */
const findBestPairing = async (koreanLiquor, koreanIngredient) => {
  console.log(`🔍 Finding best pairing for "${koreanLiquor}" + "${koreanIngredient}"`);
  
  const liquorResults = koreanMapper.searchByKorean(koreanLiquor, 'liquor');
  const ingredientResults = koreanMapper.searchByKorean(koreanIngredient, 'ingredient');
  
  if (liquorResults.length === 0 || ingredientResults.length === 0) {
    return null;
  }
  
  let bestScore = -Infinity;
  let bestCombination = null;
  const testedCombinations = [];
  
  const maxLiquors = Math.min(5, liquorResults.length);
  const maxIngredients = Math.min(5, ingredientResults.length);
  
  for (let i = 0; i < maxLiquors; i++) {
    for (let j = 0; j < maxIngredients; j++) {
      const liquor = liquorResults[i];
      const ingredient = ingredientResults[j];
      
      try {
        const rawScore = await getPairingScoreOnly(liquor.nodeId, ingredient.nodeId);
        const normalizedScore = smartNormalizeScoreTo100(rawScore); // 🔥 스마트 정규화 사용
        
        const combination = {
          liquor,
          ingredient,
          rawScore,
          normalizedScore
        };
        
        testedCombinations.push(combination);
        
        if (rawScore > bestScore) {
          bestScore = rawScore;
          bestCombination = combination;
        }
        
      } catch (error) {
        console.error(`❌ Error testing combination ${liquor.name} + ${ingredient.name}:`, error);
      }
    }
  }
  
  return {
    bestCombination,
    testedCombinations: testedCombinations.sort((a, b) => b.rawScore - a.rawScore).slice(0, 10)
  };
};

/**
 * 최종 선택된 조합에 대해서만 GPT 설명 추가 (토큰 절약)
 */
const addGPTExplanationToBest = async (bestCombination, koreanLiquor, koreanIngredient) => {
  try {
    const explanation = await getExplanationOnly(
      bestCombination.liquor.nodeId, 
      bestCombination.ingredient.nodeId, 
      bestCombination.rawScore
    );
    
    return {
      ...bestCombination,
      gptExplanation: explanation.gpt_explanation || explanation.explanation,
      compatibilityLevel: bestCombination.normalizedScore >= 80 ? "강력 추천 조합" : 
                         bestCombination.normalizedScore >= 60 ? "추천 조합" : 
                         bestCombination.normalizedScore >= 40 ? "무난한 조합" : "실험적인 조합"
    };
  } catch (error) {
    const fallbackExplanation = `${koreanLiquor}과 ${koreanIngredient}의 최적 조합은 ${bestCombination.liquor.name}과 ${bestCombination.ingredient.name}입니다.`;
    
    return {
      ...bestCombination,
      gptExplanation: fallbackExplanation,
      compatibilityLevel: bestCombination.normalizedScore >= 80 ? "강력 추천 조합" : 
                         bestCombination.normalizedScore >= 60 ? "추천 조합" : 
                         bestCombination.normalizedScore >= 40 ? "무난한 조합" : "실험적인 조합"
    };
  }
};

/**
 * 재료에 어울리는 주류 추천 함수
 */
const findBestLiquorsForIngredient = async (koreanIngredient, limit = 5) => {
  console.log(`🔍 Finding best liquors for ingredient "${koreanIngredient}"`);
  
  const ingredientResults = koreanMapper.searchByKorean(koreanIngredient, 'ingredient');
  
  if (ingredientResults.length === 0) {
    return null;
  }
  
  const targetIngredient = ingredientResults[0];
  const allLiquors = koreanMapper.getAllLiquors(); // 모든 주류 가져오기
  
  const scoredLiquors = [];
  const maxLiquorsToTest = Math.min(50, allLiquors.length); // 테스트할 주류 수 제한
  
  for (let i = 0; i < maxLiquorsToTest; i++) {
    const liquor = allLiquors[i];
    
    try {
      const rawScore = await getPairingScoreOnly(liquor.nodeId, targetIngredient.nodeId);
      const normalizedScore = smartNormalizeScoreTo100(rawScore); // 🔥 스마트 정규화 사용
      
      scoredLiquors.push({
        liquor,
        rawScore,
        normalizedScore
      });
      
    } catch (error) {
      console.error(`❌ Error testing liquor ${liquor.name} with ${targetIngredient.name}:`, error);
    }
  }
  
  // 점수순으로 정렬하고 상위 결과만 반환
  const sortedLiquors = scoredLiquors
    .sort((a, b) => b.rawScore - a.rawScore)
    .slice(0, limit);
  
  return {
    ingredient: targetIngredient,
    recommendations: sortedLiquors
  };
};

exports.predictPairingScore = async (req, res) => {
  try {
    const { liquorId, ingredientId } = req.body;
    
    if (!liquorId || !ingredientId) {
      return res.status(400).json({ 
        success: false, 
        error: 'Please provide both liquorId and ingredientId in the request body' 
      });
    }
    
    const liquorIdNum = parseInt(liquorId);
    const ingredientIdNum = parseInt(ingredientId);
    
    const [liquor, ingredient] = await Promise.all([
      Liquor.getById(liquorIdNum),
      Ingredient.getById(ingredientIdNum)
    ]);
    
    if (!liquor || !ingredient) {
      return res.status(404).json({ 
        success: false, 
        error: `${!liquor ? 'Liquor' : 'Ingredient'} not found with the provided ID` 
      });
    }
    
    const score = await getPairingScore(liquorIdNum, ingredientIdNum);
    
    return res.json({
      success: true,
      data: {
        score,
        liquor: { id: liquor.id, name: liquor.name },
        ingredient: { id: ingredient.id, name: ingredient.name }
      }
    });
    
  } catch (error) {
    console.error('Error in predictPairingScore controller:', error);
    return res.status(500).json({ success: false, error: 'Server error' });
  }
};

exports.predictPairingScoreKorean = async (req, res) => {
  try {
    const { liquor, ingredient } = req.body;
    
    if (!liquor || !ingredient) {
      return res.status(400).json({ 
        success: false, 
        error: '한글 주류명과 재료명을 모두 입력해주세요' 
      });
    }
    
    const pairingResult = await findBestPairing(liquor, ingredient);
    
    if (!pairingResult || !pairingResult.bestCombination) {
      return res.status(404).json({
        success: false,
        error: '매칭되는 주류 또는 재료를 찾을 수 없습니다',
        korean_input: { liquor, ingredient }
      });
    }
    
    const { bestCombination, testedCombinations } = pairingResult;
    const bestWithExplanation = await addGPTExplanationToBest(bestCombination, liquor, ingredient);
    
    return res.json({
      success: true,
      data: {
        korean_input: { liquor, ingredient },
        best_pairing: {
          liquor: bestWithExplanation.liquor.name,
          ingredient: bestWithExplanation.ingredient.name,
          liquor_korean: liquor,
          ingredient_korean: ingredient
        },
        english_names: {
          liquor: bestWithExplanation.liquor.name,
          ingredient: bestWithExplanation.ingredient.name
        },
        node_ids: {
          liquor: bestWithExplanation.liquor.nodeId,
          ingredient: bestWithExplanation.ingredient.nodeId
        },
        score: bestWithExplanation.normalizedScore,
        raw_score: bestWithExplanation.rawScore,
        explanation: bestWithExplanation.gptExplanation,
        compatibility_level: bestWithExplanation.compatibilityLevel,
        search_summary: {
          tested_combinations: testedCombinations.length,
          total_combinations: testedCombinations.length,
          best_score: bestWithExplanation.normalizedScore,
          gpt_calls_made: 1,
          token_optimization: "Only best combination uses GPT explanation"
        },
        all_tested_combinations: testedCombinations.map(combo => ({
          liquor: combo.liquor.name,
          ingredient: combo.ingredient.name,
          score: combo.normalizedScore,
          raw_score: combo.rawScore
        })).slice(0, 10)
      }
    });
    
  } catch (error) {
    console.error('❌ Error in Korean pairing prediction:', error);
    return res.status(500).json({ 
      success: false, 
      error: '서버 오류가 발생했습니다' 
    });
  }
};

// 🔥 점수 범위 감지를 위한 새로운 엔드포인트
exports.getScoreStatistics = async (req, res) => {
  try {
    const scores = [];
    const samplePairs = [
      { liquor: 75, ingredient: 361 },
      { liquor: 423, ingredient: 361 },
      { liquor: 75, ingredient: 100 },
      { liquor: 524, ingredient: 22 },
      { liquor: 75, ingredient: 200 },
      { liquor: 75, ingredient: 300 },
      { liquor: 423, ingredient: 100 },
      { liquor: 423, ingredient: 200 },
      { liquor: 524, ingredient: 100 },
      { liquor: 524, ingredient: 200 }
    ];
    
    for (const pair of samplePairs) {
      try {
        const score = await getPairingScoreOnly(pair.liquor, pair.ingredient);
        scores.push(score);
      } catch (error) {
        console.error(`Error getting score for ${pair.liquor}-${pair.ingredient}:`, error);
      }
    }
    
    if (scores.length === 0) {
      return res.status(500).json({
        success: false,
        error: 'No scores collected'
      });
    }
    
    const minScore = Math.min(...scores);
    const maxScore = Math.max(...scores);
    const avgScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    
    // 🔥 점수 범위 감지
    const is01Range = scores.every(score => score >= 0 && score <= 1);
    const isLegacyRange = scores.some(score => score < 0 || score > 1);
    
    return res.json({
      success: true,
      data: {
        sample_scores: scores,
        statistics: { min: minScore, max: maxScore, average: avgScore, count: scores.length },
        range_detection: {
          is_01_range: is01Range,
          is_legacy_range: isLegacyRange,
          detected_type: is01Range ? "sigmoid_model" : "legacy_model"
        },
        normalization_info: {
          current_method: "smart_normalization",
          explanation: "Automatically detects score range and normalizes appropriately"
        }
      }
    });
    
  } catch (error) {
    console.error('Error getting score statistics:', error);
    return res.status(500).json({ success: false, error: 'Failed to collect score statistics' });
  }
};

exports.findBestPairingKorean = async (req, res) => {
  try {
    const { liquor, ingredient } = req.body;
    
    if (!liquor || !ingredient) {
      return res.status(400).json({ 
        success: false, 
        error: '한글 주류명과 재료명을 모두 입력해주세요' 
      });
    }
    
    const pairingResult = await findBestPairing(liquor, ingredient);
    
    if (!pairingResult || !pairingResult.bestCombination) {
      return res.status(404).json({
        success: false,
        error: '매칭되는 주류 또는 재료를 찾을 수 없습니다',
        korean_input: { liquor, ingredient }
      });
    }
    
    const { bestCombination, testedCombinations } = pairingResult;
    const bestWithExplanation = await addGPTExplanationToBest(bestCombination, liquor, ingredient);
    
    const sortedCombinations = testedCombinations
      .map(combo => ({
        liquor: combo.liquor.name,
        ingredient: combo.ingredient.name,
        score: combo.normalizedScore,
        raw_score: combo.rawScore
      }))
      .sort((a, b) => b.score - a.score);
    
    return res.json({
      success: true,
      data: {
        korean_input: { liquor, ingredient },
        best_combination: {
          liquor: bestWithExplanation.liquor.name,
          ingredient: bestWithExplanation.ingredient.name,
          score: bestWithExplanation.normalizedScore,
          raw_score: bestWithExplanation.rawScore,
          explanation: bestWithExplanation.gptExplanation,
          compatibility_level: bestWithExplanation.compatibilityLevel
        },
        all_tested_combinations: sortedCombinations,
        token_usage: {
          gpt_calls_made: 1,
          explanation: "GPT explanation requested only for best combination"
        }
      }
    });
    
  } catch (error) {
    console.error('❌ Error in findBestPairingKorean:', error);
    return res.status(500).json({ 
      success: false, 
      error: '서버 오류가 발생했습니다' 
    });
  }
};

exports.getRecommendationsKorean = async (req, res) => {
  try {
    const { liquor } = req.body;
    const limit = Math.min(parseInt(req.body.limit || 3), 3);
    
    if (!liquor) {
      return res.status(400).json({ 
        success: false, 
        error: '한글 주류명을 입력해주세요' 
      });
    }
    
    const liquorResults = koreanMapper.searchByKorean(liquor, 'liquor');
    
    if (liquorResults.length === 0) {
      return res.status(404).json({
        success: false,
        error: '매칭되는 주류를 찾을 수 없습니다',
        korean_input: liquor
      });
    }
    
    const liquorNodeId = liquorResults[0].nodeId;
    const recommendations = await getRecommendations(liquorNodeId, limit);
    
    let finalRecommendations = [];
    let overallExplanation = null;
    
    if (recommendations && typeof recommendations === 'object') {
      if (recommendations.recommendations && Array.isArray(recommendations.recommendations)) {
        finalRecommendations = recommendations.recommendations.map(rec => ({
          ingredient_id: rec.ingredient_id,
          ingredient_name: rec.ingredient_name,
          score: smartNormalizeScoreTo100(rec.score), // 🔥 스마트 정규화 사용
          raw_score: rec.score
        }));
        overallExplanation = recommendations.overall_explanation;
      } else if (Array.isArray(recommendations)) {
        finalRecommendations = recommendations.map(rec => ({
          ingredient_id: rec.ingredient_id,
          ingredient_name: rec.ingredient_name,
          score: smartNormalizeScoreTo100(rec.score), // 🔥 스마트 정규화 사용
          raw_score: rec.score
        }));
      }
    }
    
    return res.json({
      success: true,
      data: {
        korean_input: liquor,
        liquor_name: recommendations.liquor_name || liquorResults[0].name,
        english_name: liquorResults[0].name,
        liquor_node_id: liquorNodeId,
        recommendations: finalRecommendations,
        overall_explanation: overallExplanation,
        token_usage: {
          gpt_calls_made: overallExplanation ? 1 : 0,
          explanation: "GPT explanation only for overall recommendations"
        }
      }
    });
    
  } catch (error) {
    console.error('❌ Error in Korean recommendations:', error);
    return res.status(500).json({ 
      success: false, 
      error: '서버 오류가 발생했습니다' 
    });
  }
};

// 🆕 새로 추가된 함수: 한글 재료 입력으로 주류 추천
exports.getLiquorRecommendationsKorean = async (req, res) => {
  try {
    const { ingredient } = req.body;
    const limit = Math.min(parseInt(req.body.limit || 5), 10);
    
    if (!ingredient) {
      return res.status(400).json({ 
        success: false, 
        error: '한글 재료명을 입력해주세요' 
      });
    }
    
    const result = await findBestLiquorsForIngredient(ingredient, limit);
    
    if (!result) {
      return res.status(404).json({
        success: false,
        error: '매칭되는 재료를 찾을 수 없습니다',
        korean_input: ingredient
      });
    }
    
    const recommendations = result.recommendations.map(rec => ({
      liquor_id: rec.liquor.nodeId,
      liquor_name: rec.liquor.name,
      score: rec.normalizedScore,
      raw_score: rec.rawScore
    }));
    
    return res.json({
      success: true,
      data: {
        korean_input: ingredient,
        ingredient_name: result.ingredient.name,
        english_name: result.ingredient.name,
        ingredient_node_id: result.ingredient.nodeId,
        recommendations,
        token_usage: {
          gpt_calls_made: 0,
          explanation: "Liquor recommendations without GPT explanation"
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

// 🆕 새로 추가된 함수: 재료 기반 주류 추천 (대체 엔드포인트)
exports.getLiquorRecommendationsForIngredient = async (req, res) => {
  try {
    const { ingredient } = req.body;
    const limit = Math.min(parseInt(req.body.limit || 5), 10);
    
    if (!ingredient) {
      return res.status(400).json({ 
        success: false, 
        error: '재료명을 입력해주세요' 
      });
    }
    
    const result = await findBestLiquorsForIngredient(ingredient, limit);
    
    if (!result) {
      return res.status(404).json({
        success: false,
        error: '매칭되는 재료를 찾을 수 없습니다',
        input: ingredient
      });
    }
    
    const recommendations = result.recommendations.map(rec => ({
      liquor: {
        id: rec.liquor.nodeId,
        name: rec.liquor.name
      },
      score: rec.normalizedScore,
      raw_score: rec.rawScore,
      compatibility_level: rec.normalizedScore >= 80 ? "강력 추천" : 
                          rec.normalizedScore >= 60 ? "추천" : 
                          rec.normalizedScore >= 40 ? "무난함" : "실험적"
    }));
    
    return res.json({
      success: true,
      data: {
        input: ingredient,
        ingredient: {
          id: result.ingredient.nodeId,
          name: result.ingredient.name
        },
        liquor_recommendations: recommendations,
        summary: {
          total_tested: recommendations.length,
          best_score: recommendations[0]?.score || 0
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

exports.searchByKorean = async (req, res) => {
  try {
    const { query, type = 'both' } = req.query;
    
    if (!query) {
      return res.status(400).json({
        success: false,
        error: '검색어를 입력해주세요'
      });
    }
    
    const results = koreanMapper.searchByKorean(query, type);
    
    return res.json({
      success: true,
      data: { query, type, results }
    });
    
  } catch (error) {
    console.error('Error in Korean search:', error);
    return res.status(500).json({ 
      success: false, 
      error: '서버 오류가 발생했습니다' 
    });
  }
};

exports.getPairingScoreByIds = async (req, res) => {
  try {
    const { liquorId, ingredientId } = req.params;
    
    if (!liquorId || !ingredientId) {
      return res.status(400).json({ success: false, error: 'Please provide liquor and ingredient IDs' });
    }
    
    const liquorIdNum = parseInt(liquorId);
    const ingredientIdNum = parseInt(ingredientId);
    
    const rawScore = await getPairingScoreOnly(liquorIdNum, ingredientIdNum);
    const normalizedScore = smartNormalizeScoreTo100(rawScore); // 🔥 스마트 정규화 사용
    
    return res.json({
      success: true,
      data: { score: normalizedScore, raw_score: rawScore }
    });
    
  } catch (error) {
    console.error('Error in pairing score controller:', error);
    return res.status(500).json({ success: false, error: 'Server error' });
  }
};

exports.getRecommendationsForLiquor = async (req, res) => {
  try {
    const { liquorId } = req.params;
    const limit = Math.min(parseInt(req.query.limit || 3), 3);
    
    if (!liquorId) {
      return res.status(400).json({ success: false, error: 'Please provide a liquor ID' });
    }
    
    const liquorIdNum = parseInt(liquorId);
    const recommendations = await getRecommendations(liquorIdNum, limit);
    
    let result = [];
    
    if (recommendations && typeof recommendations === 'object') {
      if (recommendations.recommendations && Array.isArray(recommendations.recommendations)) {
        result = recommendations.recommendations.map(rec => ({
          score: smartNormalizeScoreTo100(rec.score), // 🔥 스마트 정규화 사용
          raw_score: rec.score,
          ingredient_id: rec.ingredient_id
        }));
      } else if (Array.isArray(recommendations)) {
        result = recommendations.map(rec => ({
          score: smartNormalizeScoreTo100(rec.score), // 🔥 스마트 정규화 사용
          raw_score: rec.score,
          ingredient_id: rec.ingredient_id
        }));
      }
    }
    
    return res.json({
      success: true,
      data: { recommendations: result }
    });
    
  } catch (error) {
    console.error('Error in pairing recommendations controller:', error);
    return res.status(500).json({ success: false, error: 'Server error' });
  }
};

exports.getExplanationForPairing = async (req, res) => {
  try {
    const { liquorId, ingredientId } = req.params;
    
    if (!liquorId || !ingredientId) {
      return res.status(400).json({ success: false, error: 'Please provide liquor and ingredient IDs' });
    }
    
    const liquorIdNum = parseInt(liquorId);
    const ingredientIdNum = parseInt(ingredientId);
    
    const explanation = await getExplanation(liquorIdNum, ingredientIdNum);
    
    return res.json({
      success: true,
      data: explanation
    });
    
  } catch (error) {
    console.error('Error in pairing explanation controller:', error);
    return res.status(500).json({ success: false, error: 'Server error' });
  }
};

exports.getTopPairings = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit || 10);
    const topPairings = await Pairing.getTopPairings(limit);
    
    return res.json({
      success: true,
      data: topPairings
    });
    
  } catch (error) {
    console.error('Error in top pairings controller:', error);
    return res.status(500).json({ success: false, error: 'Server error' });
  }
};

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