window.addEventListener('load', () => {
  const bgm = document.getElementById('bgm');
  if (!bgm) return;

  bgm.volume = 0.5;
  bgm.loop = true;

  // ファイルが読み込めたら再生
  bgm.oncanplaythrough = () => {
    bgm.play().catch(() => {
      // 自動再生ブロックされたらユーザー操作待ちにする
      const startBgm = () => {
        bgm.play().catch(err => console.error('BGM再生エラー:', err));
        window.removeEventListener('click', startBgm);
        window.removeEventListener('touchstart', startBgm);
      };
      window.addEventListener('click', startBgm);
      window.addEventListener('touchstart', startBgm);
    });
  };

  // 読み込み失敗したらログを出す
  bgm.onerror = () => {
    console.error('BGMの読み込みに失敗しました');
  };
});
