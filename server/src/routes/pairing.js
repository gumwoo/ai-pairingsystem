const express = require('express');
const router = express.Router();
const pairingController = require('../controllers/pairingController');

/**
 * @route   POST /api/pairing/predict
 * @desc    Predict pairing score for a liquor and ingredient
 * @access  Public
 */
router.post('/predict', pairingController.predictPairingScore);

/**
 * @route   POST /api/pairing/korean/predict
 * @desc    Predict pairing score with Korean input
 * @access  Public
 */
router.post('/korean/predict', pairingController.predictPairingScoreKorean);

/**
 * @route   POST /api/pairing/korean/best
 * @desc    Find the best pairing combination for Korean liquor and ingredient input
 * @access  Public
 */
router.post('/korean/best', pairingController.findBestPairingKorean);

/**
 * @route   POST /api/pairing/korean/recommend
 * @desc    Get ingredient recommendations with Korean liquor input
 * @access  Public
 */
router.post('/korean/recommend', pairingController.getRecommendationsKorean);

/**
 * @route   POST /api/pairing/korean/recommend-liquors
 * @desc    🆕 Get liquor recommendations with Korean ingredient input
 * @access  Public
 */
router.post('/korean/recommend-liquors', pairingController.getLiquorRecommendationsKorean);

/**
 * @route   POST /api/pairing/korean/ingredient-to-liquor
 * @desc    Get liquor recommendations for Korean ingredient input (alternative endpoint)
 * @access  Public
 */
router.post('/korean/ingredient-to-liquor', pairingController.getLiquorRecommendationsForIngredient);

/**
 * @route   GET /api/pairing/korean/search
 * @desc    Search liquors and ingredients by Korean text
 * @access  Public
 */
router.get('/korean/search', pairingController.searchByKorean);

/**
 * @route   GET /api/pairing/score-statistics
 * @desc    Get score statistics for calibrating normalization range
 * @access  Public
 */
router.get('/score-statistics', pairingController.getScoreStatistics);

/**
 * @route   GET /api/pairing/score/:liquorId/:ingredientId
 * @desc    Get pairing score for a liquor and ingredient
 * @access  Public
 */
router.get('/score/:liquorId/:ingredientId', pairingController.getPairingScoreByIds);

/**
 * @route   GET /api/pairings/:liquorId/:ingredientId
 * @desc    Get pairing score for a liquor and ingredient (스웨거 호환용)
 * @access  Public
 */
router.get('/pairings/:liquorId/:ingredientId', pairingController.getPairingScoreByIds);

/**
 * @route   GET /api/pairing/recommendations/:liquorId
 * @desc    Get recommended ingredients for a liquor
 * @access  Public
 */
router.get('/recommendations/:liquorId', pairingController.getRecommendationsForLiquor);

/**
 * @route   GET /api/pairing/explanation/:liquorId/:ingredientId
 * @desc    Get explanation for a pairing
 * @access  Public
 */
router.get('/explanation/:liquorId/:ingredientId', pairingController.getExplanationForPairing);

/**
 * @route   GET /api/pairing/top
 * @desc    Get top rated pairings
 * @access  Public
 */
router.get('/top', pairingController.getTopPairings);

/**
 * @route   POST /api/pairing/rate/:pairingId
 * @desc    Rate a pairing
 * @access  Public
 */
router.post('/rate/:pairingId', pairingController.ratePairing);

module.exports = router;