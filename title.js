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
        transition: "transform 3s ease-out, filter 3s ease-out"
      });
      document.body.appendChild(this.bgDiv);
    }

    // 企業情報要素
    this.companyNameDiv = document.getElementById("company-name");
    this.companyLogoImg = document.getElementById("company-logo");
    this.companyTextDiv = document.getElementById("company-text");

    // タイトル要素
    this.gameTitleDiv = document.getElementById("game-title");
    this.pressAnyKeyDiv = document.getElementById("press-any-key");

    // BGM audio要素
    this.bgm = document.getElementById("bgm");

    // 企業リスト
    this.companyList = [
      { name: "Mdm", logo: "images/mdm_logo.png" },
      { name: "Sus Dog", logo: "images/Sus_logo.png" },
      { name: "Homo iranai", logo: "images/homo_logo.png" }
    ];
    this.currentCompanyIndex = 0;

    // 状態管理
    this.state = "showCompany"; // showCompany -> showTitle -> waitKey -> mainMenu
    this.opacity = 0;
    this.fadeIn = true;
    this.holdTimer = 0;

    // Press Any Key用フェード用
    this.pressKeyAlpha = 0;
    this.pressKeyFadeIn = true;

    // 背景画像
    this.pressBgImage = "images/press_bg.png";  // Press Any Key背景
    this.menuBgImage = "images/title_bg.png";    // メインメニュー背景

    // 背景初期セット（Press Any Key用）
    this.bgDiv.style.backgroundImage = `url('${this.pressBgImage}')`;

    // イベント登録
    window.addEventListener("keydown", (e) => this.onAnyKey(e));
    window.addEventListener("touchstart", (e) => this.onAnyKey(e));

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
        // メインメニュー処理あればここに追加
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
        this.holdTimer = 60; // 1秒保持 (60fps前提)
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
            // 企業表示完了。タイトルへ移行
            this.state = "showTitle";

            // 企業表示を非表示に
            this.companyNameDiv.style.opacity = 0;
            this.companyNameDiv.style.display = "none";

            // タイトル表示を初期化＆表示
            this.gameTitleDiv.style.display = "flex";
            this.opacity = 0;
            this.fadeIn = true;

            // BGM再生（ユーザー操作済みならOK）
            this.bgm.play().catch(() => {});

            // 背景のズームアウト＆ぼかし解除開始
            this.bgDiv.style.transform = "scale(1)";
            this.bgDiv.style.filter = "blur(0px)";

            return;
          }
          this.fadeIn = true;
        }
      }
    }

    // 企業名・ロゴ表示更新
    this.companyTextDiv.textContent = current.name;
    this.companyLogoImg.src = current.logo;
    this.companyNameDiv.style.opacity = this.opacity.toFixed(2);
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
      this.pressAnyKeyDiv.style.opacity = "0";

      // 背景画像切り替え（メインメニュー用）
      this.bgDiv.style.backgroundImage = `url('${this.menuBgImage}')`;
      this.bgDiv.style.transform = "scale(1)";
      this.bgDiv.style.filter = "blur(0px)";

      alert("ここからメインメニューやゲーム開始処理を追加してください。");
    }
  }
}

// ページロード後の初期化
window.addEventListener("load", () => {
  const questionOverlay = document.getElementById("question-overlay");
  const yesBtn = document.getElementById("question-yes-btn");

  yesBtn.addEventListener("click", () => {
    questionOverlay.classList.remove("active");
    new TitleScreen();
  });
});
