/*
  gameManager.js - shared progress, theme, language, achievements and audio.

  Quick guide for documentation:
  1. STORAGE_KEYS controls the localStorage names used by the game.
  2. I18N stores all English and Myanmar text for global language switching.
  3. ACHIEVEMENTS defines the five badges shown on Achievements.html.
  4. GameManager is the shared object used by every page.
  5. completeLevel() saves score, unlocks achievements and opens the next level.
  6. handleLevelFail() records failed attempts and shows the Retry/Menu screen.
  7. getEndingType() decides good/bad ending from the failed-attempt count.
  8. setupBackgroundMusic() and playSfx() control music and sound effect hooks.
*/
(function () {
  const STORAGE_KEYS = {
    progress: "waltz_progress",
    scores: "waltz_scores",
    theme: "waltz_theme",
    language: "waltz_language",
    username: "waltz_username",
    volume: "waltz_volume",
    muted: "waltz_muted",
    achievements: "waltz_achievements",
    failureCount: "waltz_failure_count",
  };
  const TOTAL_LEVELS = 4;
  const LEVEL_MAX_SCORES = {
    level1: 1240,
    level2: 880,
    level3: 925,
    level4: 1000,
  };
  const SFX_PATHS = {
    correct: "audio/sfx/correct.wav",
    wrong: "audio/sfx/wrong.wav",
    coin: "audio/coins.mp3",
    failed: "audio/sfx/level-failed.wav",
    achievement: "audio/sfx/achievement.wav",
  };
  const I18N = {
    ENG: {
      back: "← Back",
      menu: "Menu",
      retry: "Retry",
      submit: "Submit",
      save: "Save",
      begin: "Start",
      settings: "Settings",
      exit: "Exit",
      title: "Waltz Trial",
      stages: "Stages",
      unlocked: "Unlocked",
      score: "Score",
      best: "Best",
      locked: "Locked",
      launcherText: "Welcome to Waltz Judgement, your trial awaits.",
      startGame: "Start Game",
      settingsTitle: "Settings",
      username: "Username",
      music: "Music",
      theme: "Light / Dark",
      language: "Language",
      progress: "Progress",
      resetProgress: "Reset Progress",
      achievements: "Achievements",
      resetConfirm: "Reset all unlocked levels, scores, failed attempts and achievements?",
      progressReset: "Progress reset.",
      usernameSaved: "Username saved.",
      light: "Light",
      dark: "Dark",
      achievementsTitle: "Achievements",
      achievementsIntro:
        "Earn badges by clearing trials, avoiding mistakes and reaching the ending.",
      achievementUnlocked: "Achievement Unlocked!",
      ach_first_steps_title: "First Steps",
      ach_first_steps_desc: "Complete Level 1.",
      ach_sharp_mind_title: "Sharp Mind",
      ach_sharp_mind_desc: "Clear a level without mistakes.",
      ach_speed_runner_title: "Speed Runner",
      ach_speed_runner_desc: "Clear a level with at least 30 seconds left.",
      ach_survivor_title: "Waltz Survivor",
      ach_survivor_desc: "Complete all four levels.",
      ach_true_ending_title: "True Ending",
      ach_true_ending_desc:
        "Reach the good ending with fewer than 2 failed attempts.",
      gameOver: "GAME OVER",
      failed: "You have failed",
      levelFailed: "Level failed.",
      digits: "Digits",
      enterCode: "Enter the 3-digit code:",
      wrongAnswer: "Wrong answer! -15 seconds.",
      correctDigit: "Correct! You received digit:",
      wrongCode: "Wrong code! -15 seconds.",
      levelComplete: "Level Complete!",
      returning: "Returning to stages...",
      l1q1: "The judge places three cups on a table. Two are empty. One hides the key. You may only choose once. What gives you the best chance to win?",
      l1q1a: "Pick the heaviest cup",
      l1q1b: "Pick the middle cup",
      l1q1c: "Any cup has the same chance",
      l1q1d: "Wait for a clue",
      l1q2: "At the trial gate, four marked paths appear: North says 'Only liars go this way.' East says 'The treasure is not here.' South says 'North lies.' West says 'South tells the truth.' If only one sign tells the truth, which path should you trust most?",
      l1q2a: "North",
      l1q2b: "East",
      l1q2c: "South",
      l1q2d: "West",
      l1q3: "At the end of the first trial, Waltz asks one final question: Which is harder to break once lost?",
      l1q3a: "A chain",
      l1q3b: "A window",
      l1q3c: "Trust",
      l1q3d: "A sword",
      round: "Round",
      enterSequence: "Enter the number sequence:",
      correctNext: "Correct! Moving to next round.",
      level4Title: "Level 4: Riddle Door",
      level4Intro:
        "Answer each riddle to open the final doors. Too many wrong answers will end the trial.",
      riddle: "Riddle",
      time: "Time",
      mistakes: "Mistakes",
      typeAnswer: "Type your answer...",
      typeFirst: "Type an answer first.",
      doorOpens: "Correct. The door opens.",
      finalDoor: "The final door opens. Waltz Trial is complete.",
      goodEndingTitle: "Good Ending — The Trial Passed",
      goodEndingText:
        "Through Trial and Errors, you can finally see a light that leads to open wide field which also means you have successfully passed the Waltz Trial.",
      badEndingTitle: "Bad Ending — The Trial Unfinished",
      badEndingText:
        "Even after all you have been through the light is not shining through and the path loops back to infinite darkness, which you are not ready yet for the Trial.",
      failedAttempts: "Failed Attempts",
      returnTitle: "Return to Title",
    },
    MM: {
      back: "← နောက်သို့",
      menu: "မီနူး",
      retry: "ထပ်ကြိုးစားမည်",
      submit: "တင်မည်",
      save: "သိမ်းမည်",
      begin: "စတင်မည်",
      settings: "ဆက်တင်",
      exit: "ထွက်မည်",
      title: "Waltz Trial",
      stages: "အဆင့်များ",
      unlocked: "ဖွင့်ပြီး",
      score: "ရမှတ်",
      best: "အကောင်းဆုံး",
      locked: "ပိတ်ထားသည်",
      launcherText: "Welcome to Waltz Judgement, your trial awaits.",
      startGame: "ဂိမ်းစတင်မည်",
      settingsTitle: "ဆက်တင်များ",
      username: "အသုံးပြုသူအမည်",
      music: "သီချင်း",
      theme: "အလင်း / အမှောင်",
      language: "ဘာသာစကား",
      progress: "တိုးတက်မှု",
      resetProgress: "တိုးတက်မှု ပြန်စမည်",
      achievements: "အောင်မြင်မှုများ",
      resetConfirm:
        "အဆင့်များ၊ ရမှတ်များ၊ ကျရှုံးမှုအကြိမ်များနှင့် အောင်မြင်မှုများအားလုံး ပြန်စမလား?",
      progressReset: "ပြန်စပြီးပါပြီ။",
      usernameSaved: "အမည် သိမ်းပြီးပါပြီ။",
      light: "အလင်း",
      dark: "အမှောင်",
      achievementsTitle: "အောင်မြင်မှုများ",
      achievementsIntro:
        "အဆင့်များပြီးမြောက်ခြင်း၊ အမှားနည်းခြင်းနှင့် အဆုံးသတ်ရောက်ခြင်းဖြင့် ရယူပါ။",
      achievementUnlocked: "အောင်မြင်မှု ရရှိပြီး!",
      ach_first_steps_title: "ပထမခြေလှမ်း",
      ach_first_steps_desc: "အဆင့် ၁ ကို ပြီးမြောက်ပါ။",
      ach_sharp_mind_title: "ထက်မြက်သောစိတ်",
      ach_sharp_mind_desc: "အမှားမရှိဘဲ အဆင့်တစ်ခု ပြီးမြောက်ပါ။",
      ach_speed_runner_title: "မြန်ဆန်သူ",
      ach_speed_runner_desc: "စက္ကန့် ၃၀ ကျန်နေစဉ် အဆင့်တစ်ခု ပြီးမြောက်ပါ။",
      ach_survivor_title: "Waltz Survivor",
      ach_survivor_desc: "အဆင့် ၄ ခုလုံး ပြီးမြောက်ပါ။",
      ach_true_ending_title: "အဆုံးသတ်ကောင်း",
      ach_true_ending_desc:
        "ကျရှုံးမှု ၂ ကြိမ်ထက်နည်းပြီး အဆုံးသတ်ကောင်းကို ရယူပါ။",
      gameOver: "ဂိမ်းပြီးဆုံး",
      failed: "သင် ကျရှုံးခဲ့သည်",
      levelFailed: "အဆင့် ကျရှုံးခဲ့သည်။",
      digits: "ဂဏန်းများ",
      enterCode: "ဂဏန်း ၃ လုံးကုဒ် ထည့်ပါ:",
      wrongAnswer: "မှားနေသည်။ -၁၅ စက္ကန့်",
      correctDigit: "မှန်ပါသည်။ ရရှိသောဂဏန်း:",
      wrongCode: "ကုဒ်မှားနေသည်။ -၁၅ စက္ကန့်",
      levelComplete: "အဆင့်ပြီးပါပြီ!",
      returning: "အဆင့်များသို့ ပြန်သွားနေသည်...",
      l1q1: "တရားသူကြီးက ခွက် ၃ ခွက်ကို စားပွဲပေါ်တင်ထားသည်။ နှစ်ခွက်မှာ အလွတ်ဖြစ်ပြီး တစ်ခွက်မှာ သော့ရှိသည်။ တစ်ကြိမ်သာရွေးရမည်။ အနိုင်ရနိုင်ခြေ အကောင်းဆုံးက ဘာလဲ?",
      l1q1a: "အလေးဆုံးခွက်ကို ရွေးမည်",
      l1q1b: "အလယ်ခွက်ကို ရွေးမည်",
      l1q1c: "ခွက်တိုင်း အခွင့်အရေးတူသည်",
      l1q1d: "အရိပ်အမြွက် စောင့်မည်",
      l1q2: "တရားစီရင်ရာတံခါးတွင် လမ်း ၄ လမ်းရှိသည်။ North က 'လိမ်သူများသာ ဤလမ်းသွားသည်'။ East က 'ရတနာ ဒီမှာမရှိ'။ South က 'North လိမ်သည်'။ West က 'South မှန်သည်'။ စာတန်းတစ်ခုသာ မှန်လျှင် ဘယ်လမ်းကို ယုံသင့်သလဲ?",
      l1q2a: "North",
      l1q2b: "East",
      l1q2c: "South",
      l1q2d: "West",
      l1q3: "ပထမစမ်းသပ်မှုအဆုံးတွင် Waltz မေးသည်။ ဆုံးရှုံးပြီးနောက် ပြန်တည်ဆောက်ရန် အခက်ဆုံးက ဘာလဲ?",
      l1q3a: "ကွင်းဆက်",
      l1q3b: "ပြတင်းပေါက်",
      l1q3c: "ယုံကြည်မှု",
      l1q3d: "ဓား",
      round: "အလှည့်",
      enterSequence: "နံပါတ်စဉ်ကို ထည့်ပါ:",
      correctNext: "မှန်ပါသည်။ နောက်တစ်ဆင့်သို့ သွားမည်။",
      level4Title: "အဆင့် ၄: ပဟေဠိတံခါး",
      level4Intro:
        "တံခါးများဖွင့်ရန် ပဟေဠိများဖြေပါ။ အမှားများလွန်းပါက စမ်းသပ်မှုအဆုံးသတ်မည်။",
      riddle: "ပဟေဠိ",
      time: "အချိန်",
      mistakes: "အမှား",
      typeAnswer: "အဖြေ ရိုက်ထည့်ပါ...",
      typeFirst: "အဖြေ အရင်ထည့်ပါ။",
      doorOpens: "မှန်ပါသည်။ တံခါးဖွင့်သည်။",
      finalDoor: "နောက်ဆုံးတံခါးဖွင့်သွားသည်။ Waltz Trial ပြီးဆုံးပါပြီ။",
      goodEndingTitle: "အဆုံးသတ်ကောင်း — စမ်းသပ်မှုအောင်မြင်",
      goodEndingText:
        "စမ်းသပ်မှုများနှင့် အမှားများကို ဖြတ်သန်းပြီးနောက်၊ ကျယ်ပြန့်သော လယ်ပြင်သို့ ဦးတည်သော အလင်းကို နောက်ဆုံးမြင်နိုင်လာသည်။ ထိုအရာက သင် Waltz Trial ကို အောင်မြင်စွာ ဖြတ်ကျော်ခဲ့ကြောင်း ဆိုလိုသည်။",
      badEndingTitle: "အဆုံးသတ်ဆိုး — စမ်းသပ်မှုမပြီး",
      badEndingText:
        "သင် အရာများစွာကို ဖြတ်သန်းခဲ့ပေမယ့် အလင်းမထွက်လာသေးပါ။ လမ်းကြောင်းသည် အဆုံးမရှိသော အမှောင်ထဲသို့ ပြန်လှည့်သွားပြီး၊ သင်သည် Trial အတွက် မပြင်ဆင်ရသေးကြောင်း ဆိုလိုသည်။",
      failedAttempts: "ကျရှုံးခဲ့သည့်အကြိမ်",
      returnTitle: "ခေါင်းစဉ်သို့ ပြန်မည်",
    },
  };
  const ACHIEVEMENTS = [
    {
      id: "first_steps",
      titleKey: "ach_first_steps_title",
      descKey: "ach_first_steps_desc",
    },
    {
      id: "sharp_mind",
      titleKey: "ach_sharp_mind_title",
      descKey: "ach_sharp_mind_desc",
    },
    {
      id: "speed_runner",
      titleKey: "ach_speed_runner_title",
      descKey: "ach_speed_runner_desc",
    },
    {
      id: "survivor",
      titleKey: "ach_survivor_title",
      descKey: "ach_survivor_desc",
    },
    {
      id: "true_ending",
      titleKey: "ach_true_ending_title",
      descKey: "ach_true_ending_desc",
    },
  ];
  function currentFileName() {
    const p = window.location.pathname || "";
    return p.substring(p.lastIndexOf("/") + 1) || "Front_Page.html";
  }
  function safeJson(key, fallback) {
    try {
      return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback));
    } catch (e) {
      return fallback;
    }
  }
  // Main shared object. Pages call these methods instead of repeating code.
  const GameManager = {
    totalLevels: TOTAL_LEVELS,
    achievements: ACHIEVEMENTS,
    init() {
      try {
        this.ensureDefaults();
        this.enforceLauncherForPersistentAudio();
        this.injectGlobalStyles();
        this.applyTheme();
        this.applyLanguage();
        this.setupBackgroundMusic();
      } catch (error) {
        console.error("Waltz setup failed:", error);
      }
    },
    ensureDefaults() {
      const defaults = {
        [STORAGE_KEYS.progress]: "1",
        [STORAGE_KEYS.scores]: JSON.stringify({}),
        [STORAGE_KEYS.theme]: "dark",
        [STORAGE_KEYS.language]: "ENG",
        [STORAGE_KEYS.volume]: "50",
        [STORAGE_KEYS.muted]: "false",
        [STORAGE_KEYS.achievements]: JSON.stringify({}),
        [STORAGE_KEYS.failureCount]: "0",
      };

      Object.entries(defaults).forEach(([key, value]) => {
        if (!localStorage.getItem(key)) localStorage.setItem(key, value);
      });
    },
    enforceLauncherForPersistentAudio() {
      const file = currentFileName().toLowerCase();
      const isLauncher = file === "launcher.html";
      const isInside = window.self !== window.top;
      const skip =
        new URLSearchParams(window.location.search).get("standalone") === "1";
      if (!isLauncher && !isInside && !skip)
        window.location.replace(
          "Launcher.html?page=" + encodeURIComponent(currentFileName()),
        );
    },
    injectGlobalStyles() {
      if (document.getElementById("waltz-global-style")) return;
      const style = document.createElement("style");
      style.id = "waltz-global-style";
      style.textContent = `
      :root { --w-bg:#11131a; --w-panel:rgba(14,16,24,.84); --w-text:#f2f0e8; --w-muted:#c8c2b5; --w-line:rgba(255,255,255,.18); --w-accent:#7aa7ff; --w-green:#78dd8c; }
      body.waltz-dark{background:linear-gradient(135deg,#101218,#1b1d28)!important;color:var(--w-text)!important} body.waltz-light{--w-bg:#ece7dc;--w-panel:rgba(255,250,238,.92);--w-text:#2a241d;--w-muted:#5f574d;--w-line:#867b6d;--w-accent:#416fae;--w-green:#2f7d49;background:linear-gradient(135deg,#e6dfd0,#f4efe4)!important;color:var(--w-text)!important}
      body.waltz-light .container,body.waltz-light .menu-container,body.waltz-light .settings-container,body.waltz-light .level-container,body.waltz-light .game-container,body.waltz-light .panel,body.waltz-light .game-box,body.waltz-light .ending-card,body.waltz-light .achievement-card{background:var(--w-panel)!important;color:var(--w-text)!important;border-color:var(--w-line)!important;box-shadow:0 16px 45px rgba(92,74,50,.18)!important}
      body.waltz-light h1,body.waltz-light h2,body.waltz-light h3,body.waltz-light p,body.waltz-light label,body.waltz-light .level-title,body.waltz-light .section,body.waltz-light .question,body.waltz-light .riddle,body.waltz-light .subtitle,body.waltz-light .narrative-text{color:var(--w-text)!important;text-shadow:none!important} body.waltz-light button,body.waltz-light .menu-btn,body.waltz-light .answer-btn,body.waltz-light .primary-btn,body.waltz-light input{color:var(--w-text)!important;border-color:#6f6458!important;background:rgba(255,255,255,.48)!important} body.waltz-light button:hover,body.waltz-light .menu-btn:hover,body.waltz-light .answer-btn:hover,body.waltz-light .primary-btn:hover{background:#d7c4a2!important;color:#201a14!important} body.waltz-light .active{background:#86a8e7!important;color:#10151f!important} body.waltz-light .locked{background:rgba(64,51,38,.08)!important;color:#7a7168!important}
      .waltz-toast{position:fixed;top:22px;right:22px;z-index:9999;padding:16px 20px;border-radius:16px;background:rgba(17,20,26,.94);color:#fff;border:1px solid #78dd8c;box-shadow:0 12px 35px rgba(0,0,0,.35);font-family:inherit;animation:waltzToast .3s ease both}.waltz-toast strong{display:block;font-size:1.1rem;color:#78dd8c}@keyframes waltzToast{from{opacity:0;transform:translateY(-10px)}to{opacity:1;transform:translateY(0)}}
      .waltz-gameover{position:fixed;inset:0;z-index:9998;display:flex;align-items:center;justify-content:center;background:radial-gradient(circle,rgba(120,0,0,.22),transparent 50%),rgba(4,5,8,.86);backdrop-filter:blur(7px)}.waltz-gameover-card{width:min(520px,90vw);padding:38px;text-align:center;border-radius:24px;border:1px solid rgba(255,255,255,.18);background:rgba(10,10,15,.92);color:#f2f0e8;box-shadow:0 20px 55px rgba(0,0,0,.55)}.waltz-gameover-card h1{letter-spacing:8px;font-size:3rem;margin:0 0 18px;color:#f4e9e9}.waltz-gameover-card p{font-size:1.5rem;margin:0 0 28px;color:#d8cccc}.waltz-gameover-actions{display:flex;justify-content:center;gap:18px}.waltz-gameover-actions button{min-width:130px;padding:12px 20px;border-radius:12px;border:1px solid rgba(255,255,255,.28);background:transparent;color:#fff;cursor:pointer;font-size:1.1rem}.waltz-gameover-actions button:hover{background:#9e2630}`;
      document.head.appendChild(style);
    },
    t(key) {
      const lang = this.getLanguage();
      return (I18N[lang] && I18N[lang][key]) || I18N.ENG[key] || key;
    },
    applyLanguage() {
      const lang = this.getLanguage();
      document.documentElement.lang = lang === "MM" ? "my" : "en";
      document.querySelectorAll("[data-i18n]").forEach((el) => {
        el.textContent = this.t(el.dataset.i18n);
      });
      document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
        el.setAttribute("placeholder", this.t(el.dataset.i18nPlaceholder));
      });
    },
    getLanguage() {
      return localStorage.getItem(STORAGE_KEYS.language) || "ENG";
    },
    setLanguage(language) {
      localStorage.setItem(
        STORAGE_KEYS.language,
        language === "MM" ? "MM" : "ENG",
      );
      this.applyLanguage();
    },
    getUnlockedLevel() {
      return Math.min(
        Math.max(
          parseInt(localStorage.getItem(STORAGE_KEYS.progress) || "1", 10),
          1,
        ),
        TOTAL_LEVELS,
      );
    },
    setUnlockedLevel(n) {
      localStorage.setItem(
        STORAGE_KEYS.progress,
        String(Math.min(Math.max(parseInt(n, 10) || 1, 1), TOTAL_LEVELS)),
      );
    },
    completeLevel(levelNumber, stats = {}) {
      const level = parseInt(levelNumber, 10);
      const score = this.calculateScore(stats);

      this.saveLevelScore(level, score);

      // Achievement checks stay here so each level only calls completeLevel().
      if (level === 1) this.unlockAchievement("first_steps");
      if (Number(stats.mistakes || 0) === 0)
        this.unlockAchievement("sharp_mind");
      if (Number(stats.timeRemaining || 0) >= 30)
        this.unlockAchievement("speed_runner");
      if (level >= TOTAL_LEVELS) this.unlockAchievement("survivor");

      // Unlock the next level after a level is cleared.
      const currentUnlocked = this.getUnlockedLevel();
      if (level >= currentUnlocked && level < TOTAL_LEVELS)
        this.setUnlockedLevel(level + 1);

      return score;
    },
    calculateScore(stats = {}) {
      const correct = Number(stats.correctAnswers || 0);
      const total = Math.max(Number(stats.totalQuestions || correct || 1), 1);
      const timeRemaining = Math.max(Number(stats.timeRemaining || 0), 0);
      const mistakes = Math.max(Number(stats.mistakes || 0), 0);

      const accuracyScore = Math.round((correct / total) * 700);
      const timeBonus = Math.round(timeRemaining * 3);
      const mistakePenalty = mistakes * 25;

      return Math.max(0, accuracyScore + timeBonus - mistakePenalty);
    },
    getScores() {
      return safeJson(STORAGE_KEYS.scores, {});
    },
    saveLevelScore(levelNumber, score) {
      const scores = this.getScores(),
        key = "level" + levelNumber;
      scores[key] = Math.max(Number(scores[key] || 0), Number(score || 0));
      localStorage.setItem(STORAGE_KEYS.scores, JSON.stringify(scores));
    },
    getLevelScore(n) {
      return Number(this.getScores()["level" + n] || 0);
    },
    getGlobalScore() {
      return Object.values(this.getScores()).reduce(
        (s, v) => s + Number(v || 0),
        0,
      );
    },
    getMaxScore() {
      return Object.values(LEVEL_MAX_SCORES).reduce((a, b) => a + b, 0);
    },
    getScorePercent() {
      return Math.min(
        100,
        Math.round((this.getGlobalScore() / this.getMaxScore()) * 100),
      );
    },
    getFailureCount() {
      return Math.max(parseInt(localStorage.getItem(STORAGE_KEYS.failureCount) || "0", 10) || 0, 0);
    },
    recordFailure() {
      const count = this.getFailureCount() + 1;
      localStorage.setItem(STORAGE_KEYS.failureCount, String(count));
      return count;
    },
    getEndingType() {
      return this.getFailureCount() >= 2 ? "bad" : "good";
    },
    resetProgress() {
      localStorage.setItem(STORAGE_KEYS.progress, "1");
      localStorage.setItem(STORAGE_KEYS.scores, JSON.stringify({}));
      localStorage.setItem(STORAGE_KEYS.achievements, JSON.stringify({}));
      localStorage.setItem(STORAGE_KEYS.failureCount, "0");
    },
    handleLevelFail(levelNumber, reason) {
      if (document.querySelector(".waltz-gameover")) return;
      this.recordFailure();
      this.showGameOver(levelNumber, reason || this.t("failed"));
    },
    showGameOver(levelNumber, reason) {
      this.playSfx("failed");
      if (document.querySelector(".waltz-gameover")) return;
      const o = document.createElement("div");
      o.className = "waltz-gameover";
      o.innerHTML = `<div class="waltz-gameover-card"><h1>${this.t("gameOver")}</h1><p>${reason || this.t("failed")}</p><div class="waltz-gameover-actions"><button id="waltzRetry">${this.t("retry")}</button><button id="waltzMenu">${this.t("menu")}</button></div></div>`;
      document.body.appendChild(o);
      document.getElementById("waltzRetry").onclick = () => {
        window.location.href = "Level" + levelNumber + ".html";
      };
      document.getElementById("waltzMenu").onclick = () => {
        window.location.href = "MenuTest.html";
      };
    },
    getAchievements() {
      return safeJson(STORAGE_KEYS.achievements, {});
    },
    unlockAchievement(id) {
      const a = this.getAchievements();
      if (a[id]) return false;
      a[id] = new Date().toISOString();
      localStorage.setItem(STORAGE_KEYS.achievements, JSON.stringify(a));
      this.playSfx("achievement");
      const meta = ACHIEVEMENTS.find((x) => x.id === id);
      this.showToast(
        this.t("achievementUnlocked"),
        meta ? this.t(meta.titleKey) : id,
      );
      return true;
    },
    hasAchievement(id) {
      return Boolean(this.getAchievements()[id]);
    },
    checkEndingAchievement() {
      if (this.getEndingType() === "good") this.unlockAchievement("true_ending");
    },
    showToast(title, msg) {
      if (!document.body) return;
      const t = document.createElement("div");
      t.className = "waltz-toast";
      t.innerHTML = `<strong>${title}</strong><span>${msg}</span>`;
      document.body.appendChild(t);
      setTimeout(() => t.remove(), 3600);
    },
    setTheme(theme) {
      localStorage.setItem(
        STORAGE_KEYS.theme,
        theme === "light" ? "light" : "dark",
      );
      this.applyTheme();
    },
    getTheme() {
      return localStorage.getItem(STORAGE_KEYS.theme) || "dark";
    },
    applyTheme() {
      if (!document.body) return;
      document.body.classList.remove("waltz-light", "waltz-dark");
      document.body.classList.add(
        this.getTheme() === "light" ? "waltz-light" : "waltz-dark",
      );
    },
    setUsername(username) {
      localStorage.setItem(
        STORAGE_KEYS.username,
        String(username || "").trim() || "Player",
      );
    },
    getUsername() {
      return localStorage.getItem(STORAGE_KEYS.username) || "Player";
    },
    playSfx(name) {
      try {
        const src = SFX_PATHS[name];
        if (!src) return;

        const audio = new Audio(src);
        audio.volume = 0.55;
        audio.play().catch(() => {});
      } catch (error) {}
    },
    setVolume(volume) {
      const v = Math.min(Math.max(parseInt(volume, 10) || 0, 0), 100);
      localStorage.setItem(STORAGE_KEYS.volume, String(v));
      localStorage.setItem(STORAGE_KEYS.muted, v === 0 ? "true" : "false");
      const a = document.getElementById("waltz-bg-music");
      if (a) {
        a.volume = v / 100;
        a.muted = v === 0;
      }
      this.syncParentAudio();
    },
    getVolume() {
      return parseInt(localStorage.getItem(STORAGE_KEYS.volume) || "50", 10);
    },
    syncParentAudio() {
      try {
        if (
          window.parent &&
          window.parent !== window &&
          window.parent.WaltzAudioController
        ) {
          window.parent.WaltzAudioController.sync();
          window.parent.WaltzAudioController.play();
        } else if (window.parent && window.parent !== window) {
          window.parent.postMessage({ type: "WALTZ_AUDIO_SYNC" }, "*");
        }
      } catch (e) {}
    },
    setupBackgroundMusic() {
      if (window.self !== window.top) {
        this.syncParentAudio();
        return;
      }
      if (document.getElementById("waltz-bg-music")) return;
      const a = document.createElement("audio");
      a.id = "waltz-bg-music";
      a.loop = true;
      a.volume = this.getVolume() / 100;
      a.muted = localStorage.getItem(STORAGE_KEYS.muted) === "true";
      a.src = "audio/Mission.mp3";
      a.style.display = "none";
      document.body.appendChild(a);
      const start = () => {
        a.play().catch(() => {});
        document.removeEventListener("click", start);
      };
      document.addEventListener("click", start);
    },
  };
  window.GameManager = GameManager;
  if (document.readyState === "loading")
    document.addEventListener("DOMContentLoaded", () => GameManager.init());
  else GameManager.init();
})();
