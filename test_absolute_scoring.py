def normalize_raw_score_absolute(raw_score):
    """절대적 기준에 따른 0~100 정규화"""
    
    # 절대적 평가 기준
    if raw_score >= 2.0:      # 90-100점: 정말 뛰어난 조합
        score = 90 + min(10, (raw_score - 2.0) * 5)
    elif raw_score >= 0.0:    # 80-89점: 매우 좋은 조합
        score = 80 + (raw_score / 2.0) * 10
    elif raw_score >= -2.0:   # 70-79점: 좋은 조합
        score = 70 + ((raw_score + 2.0) / 2.0) * 10
    elif raw_score >= -4.0:   # 60-69점: 괜찮은 조합
        score = 60 + ((raw_score + 4.0) / 2.0) * 10
    elif raw_score >= -6.0:   # 50-59점: 아쉬운 조합
        score = 50 + ((raw_score + 6.0) / 2.0) * 10
    elif raw_score >= -8.0:   # 40-49점: 별로인 조합
        score = 40 + ((raw_score + 8.0) / 2.0) * 10
    elif raw_score >= -10.0:  # 30-39점: 매우 별로인 조합
        score = 30 + ((raw_score + 10.0) / 2.0) * 10
    else:                     # 0-29점: 추천하지 않음
        score = max(0, 30 + ((raw_score + 10.0) / 2.0) * 30)
    
    result = max(0, min(100, round(score)))
    
    # 점수 구간별 설명
    if result >= 90:
        level = "🌟 최고의 조합"
    elif result >= 80:
        level = "⭐ 뛰어난 조합"
    elif result >= 70:
        level = "👍 좋은 조합"
    elif result >= 60:
        level = "👌 괜찮은 조합"
    elif result >= 50:
        level = "😐 보통 조합"
    elif result >= 40:
        level = "😕 아쉬운 조합"
    else:
        level = "❌ 추천하지 않음"
    
    return result, level

# 실제 관찰된 raw score들로 테스트
test_scores = [3.5721, 0.2526, -1.2328, -3.3105, -4.7613, -6.4675, -8.8423, -10.7538]

print("🎯 절대적 평가 기준 테스트:")
print("=" * 50)

for raw_score in test_scores:
    score, level = normalize_raw_score_absolute(raw_score)
    print(f"Raw: {raw_score:6.2f} → {score:3d}점 ({level})")

print("\n현재 문제점:")
print("- 상대평가라서 같은 조합도 다른 조합에 따라 점수가 바뀜")
print("- 모든 조합이 별로여도 그 중 제일 좋으면 100점 받음")
print("- 사용자가 '80점 이상만 보여줘' 같은 필터링 불가")
print("\n해결책:")
print("- 절대적 기준으로 변경하면 일관된 평가 가능")
print("- 정말 좋은 조합만 90점 이상 받음")
