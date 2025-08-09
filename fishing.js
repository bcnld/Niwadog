// 釣りUIの要素取得
const fishingUI = document.getElementById('fishing-ui');

// 犬クリックで釣りUI表示する関数
function attachDogClickEvents() {
  const dogs = document.querySelectorAll('.dog');
  dogs.forEach(dog => {
    dog.onclick = () => {
      fishingUI.style.display = 'block';  // 釣りUIを表示
    };
  });
}

// 犬が生成されたあとに呼んでください
attachDogClickEvents();
