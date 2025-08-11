class TitleScreen {
  constructor() {
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

    this.state = "showCompany"; // showCompany -> showTitle -> waitKey -> mainMenu
    this.opacity = 0;
    this.fadeIn = true;
    this.holdTimer = 0;

    this.pressKeyAlpha = 0;
    this.pressKeyFadeIn = true;

    this.pressBgImage = "images/press_bg.png";
    this.menuBgImage = "images/title_bg.png";

    this.bgDiv.style.backgroundImage = "";
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
            // ここで背景画像を表示し、背景をズームアウト＆ぼかし解除
            this.bgDiv.style.backgroundImage = `url('${this.pressBgImage}')`;
            this.bgDiv.style.transform = "scale(1)";
            this.bgDiv.style.filter = "blur(0px)";

            // 会社ロゴを非表示
            this.companyNameDiv.style.opacity = 0;
            this.companyNameDiv.style.display = "none";

            // タイトル表示開始
            this.state = "showTitle";
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

window.addEventListener("load", () => {
  const questionOverlay = document.getElementById("question-overlay");
  const yesBtn = document.getElementById("question-yes-btn");

  yesBtn.addEventListener("click", () => {
    questionOverlay.classList.remove("active");
    new TitleScreen();
  });
});
