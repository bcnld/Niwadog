class TitleScreen {
  constructor() {
    // 要素取得
    this.bgDiv = document.getElementById("background");
    this.companyNameDiv = document.getElementById("company-name");
    this.companyLogoImg = document.getElementById("company-logo");
    this.companyTextDiv = document.getElementById("company-text");
    this.gameTitleDiv = document.getElementById("game-title");
    this.pressAnyKeyDiv = document.getElementById("press-any-key");
    this.bgm = document.getElementById("bgm");

    // 企業リスト（画像はimagesフォルダに置く想定）
    this.companyList = [
      { name: "Mdm", logo: "images/press_bg.png" },
      { name: "Sus Dog", logo: "images/press_bg.png" },
      { name: "Homo iranai", logo: "images/press_bg.png" }
    ];
    this.currentCompanyIndex = 0;

    // 状態管理
    this.state = "showCompany"; // showCompany -> showTitle -> waitKey -> mainMenu
    this.opacity = 0;
    this.fadeIn = true;
    this.holdTimer = 0;

    // Press Any Key点滅制御用
    this.pressKeyAlpha = 0;
    this.pressKeyFadeIn = true;

    // 背景画像パス（適宜差し替えてください）
    this.pressBgImage = "images/press_bg.png";
    this.menuBgImage = "images/title_bg.png";

    // 初期背景は空
    this.bgDiv.style.backgroundImage = "";

    // 初期設定：企業名は非表示(透明)、ゲームタイトル非表示、Press Any Key非表示
    this.companyNameDiv.style.opacity = 0;
    this.companyNameDiv.style.display = "flex";  // 表示は残して透明に
    this.gameTitleDiv.style.opacity = 0;
    this.gameTitleDiv.style.display = "none";
    this.pressAnyKeyDiv.style.opacity = 0;
    this.pressAnyKeyDiv.style.display = "none";

    // イベント登録
    window.addEventListener("keydown", () => this.onAnyKey());
    window.addEventListener("touchstart", () => this.onAnyKey());

    // ループ開始
    this.loop();
  }

  loop() {
    switch (this.state) {
      case "showCompany":
        this.showCompanyLoop();
        break;
      case "showTitle":
        this.showTitleLoop();
        break;
      case "waitKey":
        this.waitKeyLoop();
        break;
      case "mainMenu":
        // ここでメインメニュー開始など処理追加
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
        this.holdTimer = 60; // 1秒保持 (60fps)
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
            // 企業表示終了、タイトル表示へ
            this.state = "showTitle";

            this.companyNameDiv.style.opacity = 0;
            this.companyNameDiv.style.display = "none";

            this.gameTitleDiv.style.display = "flex";
            this.opacity = 0;
            this.fadeIn = true;

            // BGM再生（再生制限回避はcatchで）
            this.bgm.play().catch(() => {});

            // 背景をPress Any Key用に切り替え、ズーム＆ぼかし解除
            this.bgDiv.style.backgroundImage = `url('${this.pressBgImage}')`;
            this.bgDiv.style.transform = "scale(1)";
            this.bgDiv.style.filter = "blur(0px)";
            return;
          }
          this.fadeIn = true;
        }
      }
    }

    this.companyTextDiv.textContent = current.name;
    this.companyLogoImg.src = current.logo;
    this.companyNameDiv.style.opacity = this.opacity.toFixed(2);
    this.companyNameDiv.style.display = "flex";
  }

  showTitleLoop() {
    if (this.fadeIn) {
      this.opacity += 0.01;
      if (this.opacity >= 1) {
        this.opacity = 1;
        this.fadeIn = false;
        this.state = "waitKey";
        this.pressKeyAlpha = 0;
        this.pressKeyFadeIn = true;

        this.pressAnyKeyDiv.style.display = "block";
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
    if (this.state === "waitKey") {
      this.state = "mainMenu";

      this.pressAnyKeyDiv.style.opacity = 0;
      this.pressAnyKeyDiv.style.display = "none";

      this.bgDiv.style.backgroundImage = `url('${this.menuBgImage}')`;
      this.bgDiv.style.transform = "scale(1)";
      this.bgDiv.style.filter = "blur(0px)";

      alert("ここからメインメニューやゲーム開始処理を追加してください。");
    }
  }
}

// 質問「はい」ボタン押したらタイトル開始
window.addEventListener("load", () => {
  const questionOverlay = document.getElementById("question-overlay");
  const yesBtn = document.getElementById("question-yes-btn");

  yesBtn.addEventListener("click", () => {
    questionOverlay.classList.remove("active");
    questionOverlay.style.display = "none";

    new TitleScreen();
  });
});
