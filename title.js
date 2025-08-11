class TitleScreen {
  constructor() {
    this.bgDiv = document.getElementById("background");
    this.companyNameDiv = document.getElementById("company-name");
    this.companyLogoImg = document.getElementById("company-logo");
    this.companyTextDiv = document.getElementById("company-text");
    this.gameTitleDiv = document.getElementById("game-title");
    this.pressAnyKeyDiv = document.getElementById("press-any-key");
    this.bgm = document.getElementById("bgm");

    this.companyList = [
      { name: "Mdm", logo: "images/mdm_logo.png" },
      { name: "Sus Dog", logo: "images/dog.gif" },
      { name: "Homo iranai", logo: "images/homo_logo.png" }
    ];
    this.currentCompanyIndex = 0;

    this.state = "showCompany";
    this.opacity = 0;
    this.fadeIn = true;
    this.holdTimer = 0;

    this.pressKeyAlpha = 0;
    this.pressKeyFadeIn = true;

    // 事前に背景画像セットしてぼかし＆拡大をかける
    this.bgDiv.style.backgroundImage = `url('images/press_bg.png')`;
    this.bgDiv.style.filter = "blur(8px)";
    this.bgDiv.style.transform = "scale(1.2)";
    this.bgDiv.style.transition = "transform 3s ease-out, filter 3s ease-out";

    // 初期状態セット
    this.companyNameDiv.style.opacity = 0;
    this.companyNameDiv.style.display = "flex";

    this.gameTitleDiv.style.display = "none";
    this.gameTitleDiv.style.opacity = 0;

    this.pressAnyKeyDiv.style.opacity = 0;
    this.pressAnyKeyDiv.style.display = "none";

    window.addEventListener("keydown", (e) => this.onAnyKey(e));
    window.addEventListener("touchstart", (e) => this.onAnyKey(e));

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
            // 企業ロゴ表示終わり
            this.state = "showTitle";

            this.companyNameDiv.style.opacity = 0;
            this.companyNameDiv.style.display = "none";

            // 背景のぼかし＆拡大を解除（ズームアウト＆ぼかし解除）
            this.bgDiv.style.transform = "scale(1)";
            this.bgDiv.style.filter = "blur(0px)";

            // BGM再生
            this.bgm.play().catch(() => {});

            // タイトル表示初期化＆表示
            this.gameTitleDiv.style.display = "flex";
            this.opacity = 0;
            this.fadeIn = true;

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

      this.bgDiv.style.backgroundImage = `url('images/title_bg.png')`;
      this.bgDiv.style.transform = "scale(1)";
      this.bgDiv.style.filter = "blur(0px)";

      alert("ここからメインメニューやゲーム開始処理を追加してください。");
    }
  }
}

// 初期化
window.addEventListener("load", () => {
  const questionOverlay = document.getElementById("question-overlay");
  const yesBtn = document.getElementById("question-yes-btn");

  yesBtn.addEventListener("click", () => {
    questionOverlay.classList.remove("active");
    new TitleScreen();
  });
});
