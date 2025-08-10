class TitleScreen {
  constructor() {
    // DOM要素作成
    this.container = document.getElementById("title-container");
    this.container.innerHTML = "";

    // 企業ロゴ・名前用コンテナ
    this.companyNameDiv = document.createElement("div");
    this.companyNameDiv.id = "company-name";
    this.container.appendChild(this.companyNameDiv);

    this.companyLogoImg = document.createElement("img");
    this.companyLogoImg.id = "company-logo";
    this.companyNameDiv.appendChild(this.companyLogoImg);

    this.companyTextDiv = document.createElement("div");
    this.companyTextDiv.id = "company-text";
    this.companyNameDiv.appendChild(this.companyTextDiv);

    // タイトル画面用コンテナ
    this.gameTitleDiv = document.createElement("div");
    this.gameTitleDiv.id = "game-title";
    this.gameTitleDiv.style.display = "none";
    this.gameTitleDiv.style.flexDirection = "column";
    this.gameTitleDiv.style.alignItems = "center";
    this.container.appendChild(this.gameTitleDiv);

    // タイトル画像
    this.titleImage = document.createElement("img");
    this.titleImage.src = "images/game_title.png";
    this.gameTitleDiv.appendChild(this.titleImage);

    // タイトルテキスト
    this.titleText = document.createElement("div");
    this.titleText.textContent = "BIOHAZARD 4";
    this.gameTitleDiv.appendChild(this.titleText);

    // Press Any Key
    this.pressAnyKeyDiv = document.createElement("div");
    this.pressAnyKeyDiv.id = "press-any-key";
    this.pressAnyKeyDiv.textContent = "Press Any Key";
    this.gameTitleDiv.appendChild(this.pressAnyKeyDiv);

    // 企業リスト
    this.companyList = [
      { name: "Mdm", logo: "images/mdm_logo.png" },
      { name: "Sus Dog", logo: "images/Sus_logo.png" },
      { name: "Homo iranai", logo: "images/homo_logo.png" }
    ];
    this.currentCompanyIndex = 0;

    this.state = "showCompany"; // 状態管理
    this.opacity = 0;
    this.fadeIn = true;
    this.holdTimer = 0;

    this.pressKeyAlpha = 0;
    this.pressKeyFadeIn = true;

    this.bgm = document.getElementById("bgm");

    // イベント登録
    window.addEventListener("keydown", this.onAnyKey.bind(this));
    window.addEventListener("touchstart", this.onAnyKey.bind(this));

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
        // ゲーム開始などの処理をここに書く
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
        this.holdTimer = 60; // 1秒キープ
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
            // 全ての企業ロゴを表示し終わったらタイトルへ
            this.state = "showTitle";

            this.companyNameDiv.style.opacity = 0;
            this.companyNameDiv.style.display = "none";

            this.gameTitleDiv.style.display = "flex";
            this.opacity = 0;
            this.fadeIn = true;

            // BGM再生（ユーザー操作済みならOK）
            this.bgm.play().catch(() => {});

            return;
          }
          this.fadeIn = true;
        }
      }
    }
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

  onAnyKey(e) {
    if (this.state === "waitKey") {
      this.state = "mainMenu";
      this.pressAnyKeyDiv.style.opacity = "0";
      alert("ここからゲーム開始やメインメニュー表示などの処理を追加してください。");
    }
  }
}

// 起動時
window.addEventListener("load", () => {
  const questionOverlay = document.getElementById("question-overlay");
  const yesBtn = document.getElementById("question-yes-btn");

  yesBtn.addEventListener("click", () => {
    questionOverlay.classList.remove("active");
    new TitleScreen();
  });
});
