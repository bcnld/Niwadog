// probability: 0.0〜1.0 の釣れやすさ
// maxSegments: 5（固定）
// hitZoneRatio: セグメント幅に対する当たり範囲の割合（0〜1）
export function calculateHitZones(probability, maxSegments = 5, hitZoneRatio = 0.4) {
  const segmentAngle = (2 * Math.PI) / maxSegments;

  // 釣れやすさに応じて当たり区間数を決定（1〜maxSegments）
  const hitZonesCount = Math.min(maxSegments, Math.max(1, Math.round(probability * maxSegments)));

  // 0〜maxSegments-1 のインデックス配列を作成しシャッフル
  const segments = Array.from({ length: maxSegments }, (_, i) => i);
  segments.sort(() => Math.random() - 0.5);

  // hitZonesCount個の区間をランダムに選択
  const chosenSegments = segments.slice(0, hitZonesCount);

  // 当たり判定の開始・終了角度を計算
  const hitZones = chosenSegments.map(i => {
    const center = i * segmentAngle + segmentAngle / 2;
    let start = center - (segmentAngle * hitZoneRatio) / 2;
    let end = center + (segmentAngle * hitZoneRatio) / 2;

    // 角度は0〜2πに丸める
    if (start < 0) start += 2 * Math.PI;
    if (end > 2 * Math.PI) end -= 2 * Math.PI;

    return { start, end };
  });

  return hitZones;
}
