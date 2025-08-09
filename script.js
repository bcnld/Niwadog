window.addEventListener('load', () => {
  const bgm = document.getElementById('bgm');
  if (!bgm) return;

  bgm.volume = 0.5;
  bgm.loop = true;

  const playBgm = () => {
    bgm.play().catch(() => {
      // 自動再生が失敗した場合は何もしない。ユーザー操作を待つ
      console.log('自動再生失敗。ユーザー操作を待ちます。');
    });
  };

  playBgm();

  // ユーザーのクリックやタッチで再生トリガーを設定
  const startOnUserGesture = () => {
    bgm.play().catch(e => console.error('ユーザー操作での再生エラー:', e));
    window.removeEventListener('click', startOnUserGesture);
    window.removeEventListener('touchstart', startOnUserGesture);
  };
  window.addEventListener('click', startOnUserGesture);
  window.addEventListener('touchstart', startOnUserGesture);
});
