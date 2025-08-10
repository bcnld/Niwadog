// タイトル画面制御用JS（企業名＆ロゴ表示対応）

class TitleScreen {
  constructor() {
    // DOM生成
    this.createElements();

    // 企業名＆ロゴリスト
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

    // 背景スクロール用
    this.bgPosX = 0;

    // メニュー項目
    this.menuItems = ["New Game", "Load Game"];
    this.selectedIndex = 0;

    // イベント登録（PC）
    window.addEventListener("keydown", (e) => this.onAnyKey(e));

    // イベント登録（スマホ）
    window.addEventListener("touchstart", (e) => this.onAnyKey(e));

    // 開始
    this.run();
  }

  createElements() {
    // ルートコンテナ
    this.container = document.createElement("div");
    this.container.style.position = "fixed";
    this.container.style.top = "0";
    this.container.style.left = "0";
    this.container.style.width = "100vw";
    this.container.style.height = "100vh";
    this.container.style.backgroundColor = "black";
    this.container.style.color = "white";
    this.container.style.fontFamily = "'Arial Black', sans-serif";
    this.container.style.overflow = "hidden";
    this.container.style.display = "flex";
    this.container.style.flexDirection = "column";
    this.container.style.justifyContent = "center";
    this.container.style.alignItems = "center";
    this.container.style.userSelect = "none";
    document.body.appendChild(this.container);

    // 企業ロゴ
    this.companyLogo = document.createElement("img");
    this.companyLogo.style.maxWidth = "300px";
    this.companyLogo.style.maxHeight = "150px";
    this.companyLogo.style.opacity = "0";
    this.companyLogo.style.transition = "opacity 1s";
    this.container.appendChild(this.companyLogo);

    // 企業名テキスト
    this.companyText = document.createElement("div");
    this.companyText.style.fontSize = "48px";
    this.companyText.style.opacity = "0";
    this.companyText.style.transition = "opacity 1s";
    this.container.appendChild(this.companyText);

    // タイトル画面要素（最初は非表示）
    this.titleScreen = document.createElement("div");
    this.titleScreen.style.position = "relative";
    this.titleScreen.style.width = "100%";
    this.titleScreen.style.height = "100%";
    this.titleScreen.style.display = "none";
    this.container.appendChild(this.titleScreen);

    // 背景（横スクロール）
    this.bg = document.createElement("div");
    this.bg.style.position = "absolute";
    this.bg.style.top = "0";
    this.bg.style.left = "0";
    this.bg.style.width = "200%";
    this.bg.style.height = "100%";
    this.bg.style.backgroundImage = "url('images/title_bg.jpg')";
    this.bg.style.backgroundRepeat = "repeat-x";
    this.bg.style.backgroundSize = "cover";
    this.titleScreen.appendChild(this.bg);

    // タイトル画像
    this.titleImage = document.createElement("img");
    this.titleImage.src = "images/game_title.png";
    this.titleImage.style.position = "relative";
    this.titleImage.style.marginTop = "10vh";
    this.titleImage.style.maxWidth = "80%";
    this.titleImage.style.userSelect = "none";
    this.titleScreen.appendChild(this.titleImage);

    // タイトルテキスト
    this.titleText = document.createElement("div");
    this.titleText.textContent = "BIOHAZARD 4";
    this.titleText.style.fontSize = "48px";
    this.titleText.style.textAlign = "center";
    this.titleText.style.marginTop = "10px";
    this.titleText.style.color = "white";
    this.titleText.style.textShadow = "0 0 10px rgba(255,255,255,0.7)";
    this.titleScreen.appendChild(this.titleText);

    // Press Any Key
    this.pressKeyText = document.createElement("div");
    this.pressKeyText.textContent = "Press Any Key";
    this.pressKeyText.style.position = "absolute";
    this.pressKeyText.style.bottom = "10vh";
    this.pressKeyText.style.width = "100%";
    this.pressKeyText.style.textAlign = "center";
    this.pressKeyText.style.fontSize = "24px";
    this.pressKeyText.style.color = "white";
    this.pressKeyText.style.opacity = "0";
    this.pressKeyText.style.userSelect = "none";
    this.pressKeyText.style.transition = "opacity 0.7s ease-in-out";
    this.titleScreen.appendChild(this.pressKeyText);

    // メインメニュー
    this.menu = document.createElement("div");
    this.menu.style.position = "absolute";
    this.menu.style.bottom = "20vh";
    this.menu.style.width = "100%";
    this.menu.style.display = "flex";
    this.menu.style.justifyContent = "center";
    this.menu.style.gap = "40px";
    this.menu.style.fontSize = "32px";
    this.menu.style.color = "white";
    this.menu.style.textShadow = "0 0 5px black";
    this.menu.style.userSelect = "none";
    this.menu.style.opacity = "0";
    this.menu.style.transition = "opacity 1s ease";
    this.menu.style.cursor = "default";
    this.titleScreen.appendChild(this.menu);

    this.menuItemsElements = [];
    for (let i = 0; i < this.menuItems.length; i++) {
      const el = document.createElement("div");
      el.textContent = this.menuItems[i];
      this.menu.appendChild(el);
      this.menuItemsElements.push(el);
    }
  }

  run() {
    requestAnimationFrame(() => this.loop());
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
        this.mainMenuLoop();
        break;
    }
    requestAnimationFrame(() => this.loop());
  }

  // 企業名＆ロゴ表示アニメーション
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
            this.state = "showTitle";
            this.companyText.style.opacity = "0";
            this.companyLogo.style.opacity = "0";
            this.companyText.textContent = "";
            this.companyLogo.src = "";
            this.titleScreen.style.display = "block";
            this.opacity = 0;
            this.fadeIn = true;
            return;
          }
          this.fadeIn = true;
        }
      }
    }
    // 表示更新
    this.companyText.textContent = current.name;
    this.companyLogo.src = current.logo;
    this.companyText.style.opacity = this.opacity.toFixed(2);
    this.companyLogo.style.opacity = this.opacity.toFixed(2);
  }

  // タイトルフェードイン
  showTitleLoop() {
    if (this.fadeIn) {
      this.opacity += 0.01;
      if (this.opacity >= 1) {
        this.opacity = 1;
        this.fadeIn = false;
        this.state = "waitKey";
        this.pressKeyAlpha = 0;
        this.pressKeyFadeIn = true;
        return;
      }
      this.titleScreen.style.opacity = this.opacity.toFixed(2);
    }
  }

  // Press Any Key 点滅
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
    this.pressKeyText.style.opacity = this.pressKeyAlpha.toFixed(2);
  }

  // キーまたはタップでメインメニュー表示
  onAnyKey(e) {
    if (this.state === "waitKey") {
      this.state = "mainMenu";
      this.pressKeyText.style.opacity = "0";
      this.menu.style.opacity = "1";
      this.menu.style.pointerEvents = "auto";
    }
  }

  // メニューの背景スクロール
  mainMenuLoop() {
    this.bgPosX -= 0.5;
    if (this.bgPosX < -window.innerWidth) {
      this.bgPosX = 0;
    }
    this.bg.style.backgroundPosition = `${this.bgPosX}px 0`;
  }
}

// ページロード後に開始
window.addEventListener("load", () => {
  new TitleScreen();
});
