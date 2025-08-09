window.addEventListener('DOMContentLoaded', () => {
  const bgm = document.getElementById('bgm');
  if (!bgm) return;

  bgm.volume = 0.5;
  bgm.loop = true;

  bgm.play().catch(() => {
    console.log('自動再生失敗。ユーザー操作を待機。');
  });

  document.body.addEventListener('click', () => {
    bgm.play().then(() => {
      console.log('ユーザー操作でBGM再生成功');
    }).catch(e => {
      console.error('ユーザー操作でBGM再生失敗:', e);
    });
  });
});
