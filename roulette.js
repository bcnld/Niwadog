let dogData = []; // dog.jsonの全データを格納

// dog.jsonの読み込み（fetch）※必要なら使ってね
export function loadDogData() {
  return fetch('dog.json')
    .then(res => res.json())
    .then(data => {
      dogData = data;
      return data;
    });
}

// 指定した犬のIDから確率を返す関数
export function getDogProbability(dogId) {
  const dog = dogData.find(d => Number(d.number) === Number(dogId));
  return dog ? dog.probability : 0;
}

// 確率からルーレットの当たり範囲（開始角度と終了角度）をランダムに計算する関数
// ここでは「当たり角度幅は確率×2π（全円）」にして、開始角度はランダムに
export function calcHitZone(dogId) {
  const prob = getDogProbability(dogId);
  const hitZoneSize = prob * 2 * Math.PI; // 確率を角度に変換
  let start = Math.random() * 2 * Math.PI;
  let end = start + hitZoneSize;
  if (end > 2 * Math.PI) {
    end -= 2 * Math.PI;
  }
  return { start, end };
}
