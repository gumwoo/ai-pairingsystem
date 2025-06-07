class KoreanPairingService {
  constructor() {
    // 포트를 5004로 수정하고 /api까지 포함
    this.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5004/api';
  }

  async predictPairing(koreanLiquor, koreanIngredient) {
    try {
      // /api를 제거하여 중복 방지
      const response = await fetch(`${this.baseURL}/pairing/korean/predict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          liquor: koreanLiquor,
          ingredient: koreanIngredient
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || '예측 요청 실패');
      }

      return data;
    } catch (error) {
      console.error('Korean pairing prediction error:', error);
      throw error;
    }
  }

  async getRecommendations(koreanLiquor, limit = 10) {
    try {
      // /api를 제거하여 중복 방지
      const response = await fetch(`${this.baseURL}/pairing/korean/recommend`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          liquor: koreanLiquor,
          limit
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || '추천 요청 실패');
      }

      return data;
    } catch (error) {
      console.error('Korean recommendations error:', error);
      throw error;
    }
  }

  async getLiquorRecommendations(koreanIngredient, limit = 10) {
    try {
      // 재료 기반 술 추천 API 호출
      const response = await fetch(`${this.baseURL}/pairing/korean/recommend-liquors`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ingredient: koreanIngredient,
          limit
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || '술 추천 요청 실패');
      }

      return data;
    } catch (error) {
      console.error('Korean liquor recommendations error:', error);
      throw error;
    }
  }

  async searchItems(query, type = 'both') {
    try {
      // /api를 제거하여 중복 방지
      const response = await fetch(
        `${this.baseURL}/pairing/korean/search?query=${encodeURIComponent(query)}&type=${type}`
      );

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || '검색 요청 실패');
      }

      return data;
    } catch (error) {
      console.error('Korean search error:', error);
      throw error;
    }
  }
}

export default new KoreanPairingService();