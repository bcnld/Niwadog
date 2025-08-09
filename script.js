const bgm = document.getElementById('bgm');

document.addEventListener('DOMContentLoaded', () => {
  if (!bgm) return;

  bgm.volume = 0.5;
  bgm.loop = true; // ループ再生

  // 自動再生を試みる
  bgm.play().catch(() => {
    console.warn('BGM自動再生がブロックされました。ユーザー操作待ち。');

    const playOnUserGesture = () => {
      bgm.currentTime = 0; // 最初から
      bgm.play().catch(err => console.error('BGM再生エラー:', err));

      // 再生開始後にイベント削除
      document.removeEventListener('click', playOnUserGesture);
      document.removeEventListener('touchstart', playOnUserGesture);
    };

    // タップやクリックで再生
    document.addEventListener('click', playOnUserGesture);
    document.addEventListener('touchstart', playOnUserGesture);
  });
});
