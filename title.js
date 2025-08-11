class TitleScreen {
  constructor() {
    // 背景div取得または生成
    this.bgDiv = document.getElementById("background");
    if (!this.bgDiv) {
      this.bgDiv = document.createElement("div");
      this.bgDiv.id = "background";
      Object.assign(this.bgDiv.style, {
        position: "fixed",
        top: "0",
        left: "0",
        width: "100vw",
        height: "100vh",
        backgroundSize: "cover",
        backgroundPosition: "center",
        zIndex: "-1",
        filter: "blur(8px)",
        transformOrigin: "center center",
        transform: "scale(1.2)",
        transition: "transform 3s ease-out, filter 3s ease-out",
        backgroundRepeat: "no-repeat",
        backgroundColor: "transparent",
      });
      document.body.appendChild(this.bgDiv);
    }

    // 企業表示要素
    this.companyNameDiv = document.getElementById("company-name");
    this.companyLogoImg = document.getElementById("company-logo");
    this.companyTextDiv = document.getElementById("company-text");

    // タイトル表示要素
    this.gameTitleDiv = document.getElementById("game-title");
    this.pressAnyKeyDiv = document.getElementById("press-any-key");

    // BGM audio要素
    this.bgm = document.getElementById("bgm");

    // 企業リスト
    this.companyList = [
      { name: "Mdm", logo: "images/mdm_logo.png" },
      { name: "Sus Dog", logo: "images/dog.gif" },
      { name: "Homo iranai", logo: "images/homo_logo.png" }
    ];
    this.currentCompanyIndex = 0;

    // 状態管理
    this.state = "showCompany"; // showCompany -> showTitle -> waitKey -> mainMenu
    this.opacity = 0;
    this.fadeIn = true;
    this.holdTimer = 0;

    // Press Any Key点滅用
    this.pressKeyAlpha = 0;
    this.pressKeyFadeIn = true;

    // 背景画像パス
    this.pressBgImage = "images/press_bg.png";  // Press Any Key背景
    this.menuBgImage = "images/title_bg.png";   // メインメニュー背景

    // 初期状態セット
    this.bgDiv.style.backgroundImage = ""; // 最初は背景なし

    // 企業表示は見えるが透過0スタート
    this.companyNameDiv.style.display = "flex";
    this.companyNameDiv.style.opacity = 0;

    // タイトル表示は非表示
    this.gameTitleDiv.style.display = "none";
    this.gameTitleDiv.style.opacity = 0;

    // Press Any Keyは非表示（opacity 0）
    this.pressAnyKeyDiv.style.opacity = 0;
    this.pressAnyKeyDiv.style.display = "none";

    // イベント登録
    this.onAnyKeyHandler = (e) => this.onAnyKey(e);
    window.addEventListener("keydown", this.onAnyKeyHandler);
    window.addEventListener("touchstart", this.onAnyKeyHandler);

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
        // ここでメインメニュー処理開始可能
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
        this.holdTimer = 60; // 1秒保持（60fps想定）
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
            // 企業表示完了 → タイトル表示に移行
            this.state = "showTitle";

            // 企業表示非表示に
            this.companyNameDiv.style.opacity = 0;
            this.companyNameDiv.style.display = "none";

            // 背景をPress Any Key用に切り替え＆ぼかし解除・ズームアウト
            this.bgDiv.style.backgroundImage = `url('${this.pressBgImage}')`;
            this.bgDiv.style.filter = "blur(0px)";
            this.bgDiv.style.transform = "scale(1)";
            this.bgDiv.style.zIndex = "-1";

            // タイトル表示準備
            this.gameTitleDiv.style.display = "flex";
            this.opacity = 0;
            this.fadeIn = true;

            // BGM再生（許可されていれば）
            this.bgm.play().catch(() => {});

            return;
          }
          this.fadeIn = true;
        }
      }
    }

    // 企業名・ロゴ更新＆表示
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

        // Press Any Key 表示
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

      // Press Any Key非表示
      this.pressAnyKeyDiv.style.opacity = 0;
      this.pressAnyKeyDiv.style.display = "none";

      // 背景切り替え（メインメニュー背景）
      this.bgDiv.style.backgroundImage = `url('${this.menuBgImage}')`;
      this.bgDiv.style.filter = "blur(0px)";
      this.bgDiv.style.transform = "scale(1)";
      this.bgDiv.style.zIndex = "-1";

      // BGMは引き続き再生中の想定

      // ここからゲームメインメニュー処理など開始してください
      alert("ここからメインメニューやゲーム開始処理を追加してください。");

      // 以降はキー押下は無視するならイベント解除
      window.removeEventListener("keydown", this.onAnyKeyHandler);
      window.removeEventListener("touchstart", this.onAnyKeyHandler);
    }
  }
}

// ページロード後初期化
window.addEventListener("load", () => {
  const questionOverlay = document.getElementById("question-overlay");
  const yesBtn = document.getElementById("question-yes-btn");

  yesBtn.addEventListener("click", () => {
    questionOverlay.classList.remove("active");
    new TitleScreen();
  });
});
