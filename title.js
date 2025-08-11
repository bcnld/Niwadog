class TitleScreen {
  constructor() {
    this.bgDiv = document.getElementById('background');

    // 最初からpress背景画像セット
    this.bgDiv.style.backgroundImage = "url('images/press_bg.png')";
    this.bgDiv.style.filter = 'blur(8px)';
    this.bgDiv.style.transform = 'scale(1.2)';

    // 企業名・ロゴ
    this.companyNameDiv = document.getElementById('company-name');
    this.companyLogoImg = document.getElementById('company-logo');
    this.companyTextDiv = document.getElementById('company-text');

    // タイトル
    this.gameTitleDiv = document.getElementById('game-title');
    this.pressAnyKeyDiv = document.getElementById('press-any-key');

    // BGM
    this.bgm = document.getElementById('bgm');

    this.companyList = [
      { name: 'Mdm', logo: 'images/mdm_logo.png' },
      { name: 'Sus Dog', logo: 'images/Sus_logo.png' },
      { name: 'Homo iranai', logo: 'images/homo_logo.png' }
    ];
    this.currentCompanyIndex = 0;

    // 状態管理
    this.state = 'showCompany';
    this.opacity = 0;
    this.fadeIn = true;
    this.holdTimer = 0;

    this.pressKeyAlpha = 0;
    this.pressKeyFadeIn = true;

    // 初期状態セット
    this.companyNameDiv.style.opacity = 0;
    this.companyNameDiv.style.display = 'flex';

    this.gameTitleDiv.style.opacity = 0;
    this.gameTitleDiv.style.display = 'none';

    this.pressAnyKeyDiv.style.opacity = 0;
    this.pressAnyKeyDiv.style.pointerEvents = 'none';

    // イベント登録
    window.addEventListener('keydown', () => this.onAnyKey());
    window.addEventListener('touchstart', () => this.onAnyKey());

    this.loop();
  }

  loop() {
    switch (this.state) {
      case 'showCompany':
        this.showCompanyLoop();
        break;
      case 'showTitle':
        this.showTitleLoop();
        break;
      case 'waitKey':
        this.waitKeyLoop();
        break;
      case 'mainMenu':
        // メインメニュー処理（省略）
        break;
    }
    requestAnimationFrame(() => this.loop());
  }

  showCompanyLoop() {
    const current = this.companyList[this.currentCompanyIndex];
    if (this.fadeIn) {
      this.opacity += 0.02;
      if (this.opacity >= 1) {
        this.opacity = 1;
        this.fadeIn = false;
        this.holdTimer = 60;
      }
    } else {
      if (this.holdTimer > 0) {
        this.holdTimer--;
      } else {
        this.opacity -= 0.02;
        if (this.opacity <= 0) {
          this.opacity = 0;
          this.currentCompanyIndex++;
          if (this.currentCompanyIndex >= this.companyList.length) {
            // 企業ロゴ全終了

            // 企業表示非表示に
            this.companyNameDiv.style.opacity = 0;
            this.companyNameDiv.style.display = 'none';

            // 背景ぼかし＆ズーム解除（演出）
            this.bgDiv.style.transform = 'scale(1)';
            this.bgDiv.style.filter = 'blur(0)';

            // BGM再生
            this.bgm.play().catch(() => {});

            // タイトル表示準備
            this.gameTitleDiv.style.display = 'flex';
            this.opacity = 0;
            this.fadeIn = true;
            this.state = 'showTitle';

            return;
          }
          this.fadeIn = true;
        }
      }
    }

    this.companyTextDiv.textContent = current.name;
    this.companyLogoImg.src = current.logo;
    this.companyNameDiv.style.opacity = this.opacity.toFixed(2);
    this.companyNameDiv.style.display = 'flex';
  }

  showTitleLoop() {
    if (this.fadeIn) {
      this.opacity += 0.01;
      if (this.opacity >= 1) {
        this.opacity = 1;
        this.fadeIn = false;
        this.state = 'waitKey';

        this.pressKeyAlpha = 0;
        this.pressKeyFadeIn = true;

        this.pressAnyKeyDiv.style.opacity = 1;
        this.pressAnyKeyDiv.style.pointerEvents = 'auto';
      }
      this.gameTitleDiv.style.opacity = this.opacity.toFixed(2);
    }
  }

  waitKeyLoop() {
    if (this.pressKeyFadeIn) {
      this.pressKeyAlpha += 0.03;
      if (this.pressKeyAlpha >= 1) {
        this.pressKeyAlpha = 1;
        this.pressKeyFadeIn = false;
      }
    } else {
      this.pressKeyAlpha -= 0.03;
      if (this.pressKeyAlpha <= 0) {
        this.pressKeyAlpha = 0;
        this.pressKeyFadeIn = true;
      }
    }
    this.pressAnyKeyDiv.style.opacity = this.pressKeyAlpha.toFixed(2);
  }

  onAnyKey() {
    if (this.state === 'waitKey') {
      this.state = 'mainMenu';

      // Press Any Key非表示
      this.pressAnyKeyDiv.style.opacity = 0;
      this.pressAnyKeyDiv.style.pointerEvents = 'none';

      // 背景をメニュー用に変更（必要に応じて）
      this.bgDiv.style.backgroundImage = "url('images/title_bg.png')";
      this.bgDiv.style.transform = 'scale(1)';
      this.bgDiv.style.filter = 'blur(0)';

      alert('ここからメインメニューやゲーム開始処理を追加してください。');
    }
  }
}

// ページロード後初期化
window.addEventListener('load', () => {
  // ここで質問モーダル非表示を呼び出しなどがあれば入れてください
  new TitleScreen();
});
