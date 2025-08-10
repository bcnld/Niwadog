class TitleScreen {
  constructor() {
    this.createElements();

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

    this.bgPosX = 0;
    this.bgScrollSpeed = 0;  // 背景スクロール速度（最初は0）

    this.menuItems = ["New Game", "Load Game"];
    this.selectedIndex = 0;

    window.addEventListener("keydown", (e) => this.onAnyKey(e));
    window.addEventListener("touchstart", (e) => this.onAnyKey(e));

    this.run();
  }

  createElements() {
    this.container = document.createElement("div");
    Object.assign(this.container.style, {
      position: "fixed",
      top: "0",
      left: "0",
      width: "100vw",
      height: "100vh",
      backgroundColor: "black",
      color: "white",
      fontFamily: "'Arial Black', sans-serif",
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      userSelect: "none"
    });
    document.body.appendChild(this.container);

    this.companyLogo = document.createElement("img");
    Object.assign(this.companyLogo.style, {
      maxWidth: "300px",
      maxHeight: "150px",
      opacity: "0",
      transition: "opacity 1s",
      marginBottom: "20px",
      userSelect: "none"
    });
    this.container.appendChild(this.companyLogo);

    this.companyText = document.createElement("div");
    Object.assign(this.companyText.style, {
      fontSize: "48px",
      opacity: "0",
      transition: "opacity 1s",
      userSelect: "none"
    });
    this.container.appendChild(this.companyText);

    this.titleScreen = document.createElement("div");
    Object.assign(this.titleScreen.style, {
      position: "relative",
      width: "100%",
      height: "100%",
      display: "none",
      flexDirection: "column",
      alignItems: "center"
    });
    this.container.appendChild(this.titleScreen);

    this.bg = document.createElement("div");
    Object.assign(this.bg.style, {
      position: "absolute",
      top: "0",
      left: "0",
      width: "200%",
      height: "100%",
      backgroundImage: "url('images/title_bg.jpg')",
      backgroundRepeat: "repeat-x",
      backgroundSize: "cover",
      zIndex: "-1"
    });
    this.titleScreen.appendChild(this.bg);

    this.titleImage = document.createElement("img");
    this.titleImage.src = "images/game_title.png";
    Object.assign(this.titleImage.style, {
      position: "relative",
      marginTop: "10vh",
      maxWidth: "80%",
      userSelect: "none"
    });
    this.titleScreen.appendChild(this.titleImage);

    this.titleText = document.createElement("div");
    this.titleText.textContent = "BIOHAZARD 4";
    Object.assign(this.titleText.style, {
      fontSize: "48px",
      textAlign: "center",
      marginTop: "10px",
      color: "white",
      textShadow: "0 0 10px rgba(255,255,255,0.7)",
      userSelect: "none"
    });
    this.titleScreen.appendChild(this.titleText);

    this.pressKeyText = document.createElement("div");
    this.pressKeyText.textContent = "Press Any Key";
    Object.assign(this.pressKeyText.style, {
      position: "absolute",
      bottom: "10vh",
      width: "100%",
      textAlign: "center",
      fontSize: "24px",
      color: "white",
      opacity: "0",
      userSelect: "none",
      transition: "opacity 0.7s ease-in-out"
    });
    this.titleScreen.appendChild(this.pressKeyText);

    this.menu = document.createElement("div");
    Object.assign(this.menu.style, {
      position: "absolute",
      bottom: "20vh",
      width: "100%",
      display: "flex",
      justifyContent: "center",
      gap: "40px",
      fontSize: "32px",
      color: "white",
      textShadow: "0 0 5px black",
      userSelect: "none",
      opacity: "0",
      transition: "opacity 1s ease",
      cursor: "default",
      pointerEvents: "none"
    });
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
            this.titleScreen.style.display = "flex";
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
      this.titleScreen.style.opacity = this.opacity.toFixed(2);
      if (this.opacity >= 1) {
        this.opacity = 1;
        this.fadeIn = false;
        this.state = "waitKey";
        this.pressKeyAlpha = 0;
        this.pressKeyFadeIn = true;
        this.bgScrollSpeed = 0; // 背景は止めておく

        // BGM再生処理
        const bgmAudio = document.getElementById("bgm");
        if (bgmAudio) {
          bgmAudio.volume = 0.5;
          bgmAudio.play().catch(e => {
            console.log("BGM再生失敗:", e);
          });
        }
      }
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
    this.pressKeyText.style.opacity = this.pressKeyAlpha.toFixed(2);
  }

  onAnyKey(e) {
    if (this.state === "waitKey") {
      this.state = "mainMenu";
      this.pressKeyText.style.opacity = "0";
      this.menu.style.opacity = "1";
      this.menu.style.pointerEvents = "auto";
      this.bgScrollSpeed = 0.5; // スクロール開始
    }
  }

  mainMenuLoop() {
    this.bgPosX += this.bgScrollSpeed;
    if (this.bgPosX > window.innerWidth) {
      this.bgPosX = 0;
    }
    this.bg.style.backgroundPosition = `${this.bgPosX}px 0`;
  }
}

window.addEventListener("load", () => {
  new TitleScreen();
});
