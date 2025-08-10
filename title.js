class TitleScreen {
  constructor() {
    // 要素取得
    this.companyLogo = document.getElementById("company-logo");
    this.companyText = document.getElementById("company-text");
    this.titleScreenContent = document.getElementById("title-screen-content");
    this.titleImage = document.getElementById("title-image");
    this.titleText = document.getElementById("title-text");
    this.pressAnyKey = document.getElementById("press-any-key");
    this.mainMenu = document.getElementById("main-menu");

    this.companyList = [
      { name: "Mdm", logo: "images/mdm_logo.png" },
      { name: "Sus Dog", logo: "images/Sus_logo.png" },
      { name: "Homo iranai", logo: "images/homo_logo.png" }
    ];
    this.currentCompanyIndex = 0;

    this.state = "showCompany"; // showCompany -> showTitle -> waitKey -> mainMenu
    this.opacity = 0;
    this.fadeIn = true;
    this.holdTimer = 0;

    this.menuItems = ["New Game", "Load Game"];
    this.selectedIndex = 0;

    window.addEventListener("keydown", (e) => this.onAnyKey(e));
    window.addEventListener("touchstart", (e) => this.onAnyKey(e));

    this.initMenu();
    this.run();
  }

  initMenu() {
    this.mainMenu.innerHTML = "";
    this.menuItemsElements = [];
    for (let i = 0; i < this.menuItems.length; i++) {
      const el = document.createElement("div");
      el.textContent = this.menuItems[i];
      this.mainMenu.appendChild(el);
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
            this.titleScreenContent.style.display = "flex";
            this.opacity = 0;
            this.fadeIn = true;
            return;
          }
          this.fadeIn = true;
        }
      }
    }
    this.companyText.textContent = current.name;
    this.companyLogo.src = current.logo;
    this.companyText.style.opacity = this.opacity.toFixed(2);
    this.companyLogo.style.opacity = this.opacity.toFixed(2);
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
        return;
      }
      this.titleScreenContent.style.opacity = this.opacity.toFixed(2);
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
    this.pressAnyKey.style.opacity = this.pressKeyAlpha.toFixed(2);
  }

  onAnyKey(e) {
    if (this.state === "waitKey") {
      this.state = "mainMenu";
      this.pressAnyKey.style.opacity = "0";
      this.mainMenu.style.opacity = "1";
      this.mainMenu.style.pointerEvents = "auto";
    }
  }

  mainMenuLoop() {
    // 今は背景スクロールなし。必要ならここで処理を追加
  }
}

window.addEventListener("load", () => {
  new TitleScreen();
});
