/* ============================================================
   ChestMod — полностью переписанный app.js
   ============================================================ */

const API = 'https://api.modrinth.com/v2';

const STORAGE_KEY = 'chestmod_v1';
const LEGACY_STORAGE_KEY = 'modchest_v1';

const TRANS_KEY = 'chestmod_translations_v8';
const TRANS_MAX = 300;

const LAYOUT_MIN_WIDTH = 1060;

const PROJECT_TYPES = ['mod', 'resourcepack', 'shader'];

const THEMES = ['burgundy', 'blue', 'purple', 'green'];

const TYPE_META = {
  mod: {
    folder: 'mods',
    button: 'typeModButton',
    group: 'typeModGroup',
    short: 'typeModShort'
  },
  resourcepack: {
    folder: 'resourcepacks',
    button: 'typeResourcepackButton',
    group: 'typeResourcepackGroup',
    short: 'typeResourcepackShort'
  },
  shader: {
    folder: 'shaderpacks',
    button: 'typeShaderButton',
    group: 'typeShaderGroup',
    short: 'typeShaderShort'
  }
};

const FIRST_WORDS = [
  'amber', 'ancient', 'azure', 'black', 'brave',
  'bright', 'crimson', 'dark', 'diamond', 'dragon',
  'ember', 'frost', 'golden', 'green', 'iron',
  'jade', 'lunar', 'mystic', 'obsidian', 'ruby'
];

const SECOND_WORDS = [
  'arch', 'beacon', 'castle', 'cave', 'chest',
  'citadel', 'crystal', 'domain', 'forge', 'garden',
  'hall', 'haven', 'keep', 'land', 'lake',
  'light', 'peak', 'realm', 'spire', 'vault'
];

const LOADER_PRIORITY = {
  forge: 1,
  fabric: 2,
  neoforge: 3,
  quilt: 4
};

const LOADER_LABELS = {
  forge: 'Forge',
  fabric: 'Fabric',
  neoforge: 'NeoForge',
  quilt: 'Quilt'
};

const PROTECTED_TERMS = [
  'Buy Me a Coffee',
  'Ko-fi',
  'CurseForge',
  'Modrinth',
  'GitHub',
  'GitLab',
  'Discord',
  'Telegram',
  'YouTube',
  'Twitch',
  'Reddit',
  'Patreon',
  'Twitter',
  'Instagram',
  'TikTok',
  'Facebook',
  'Minecraft',
  'Mojang',
  'Microsoft',
  'JetBrains',
  'Java',
  'NeoForge',
  'Forge',
  'Fabric',
  'Quilt',
  'OptiFine',
  'Spigot',
  'Bukkit',
  'Paper',
  'Folia',
  'ChestMod',
  'ModChest',
  'SanchezST'
];

const state = {
  gameVersion: '1.20.1',
  loader: 'fabric',
  projectType: 'mod',
  cart: [],
  translate: false,
  lang: 'ru',
  theme: 'burgundy'
};

const cache = new Map();
const projects = new Map();

let allCategories = [];

const explore = {
  offset: 0,
  limit: 24,
  total: 0,
  loading: false,
  loaded: false,
  hits: []
};

let versionPicker = null;
let loaderPicker = null;
let sortPicker = null;
let categoryPicker = null;

let detailOpen = false;
let settingsOpen = false;

let detailTranslated = false;
let detailRequestId = 0;

const detailOriginals = new Map();

/* ============================================================
   Локализация
   ============================================================ */

const I18N = {
  ru: {
    brandSub: 'beta 1.1',

    tabInfo: 'Информация',
    tabBuilder: 'Сборка',
    tabExplore: 'Обзор Modrinth',

    settingsBtnTitle: 'Настройки',

    infoHeroLabel: 'О проекте',
    infoHeroTitle: 'ChestMod - сборщик <span>модов, ресурспаков и шейдеров</span>',
    infoHeroText: 'Устал лазать по сайтам и скачивать каждый мод по-отдельности? На этом сайте вы можете в несколько кликов создать свою собственную сборку и скачать ее в zip-файл. Сайт создан при помощи ИИ. Могут возникнуть ошибки.',

    infoAboutTitle: 'Что это?',
    infoAboutText: 'Надоели обычные сборки на различных сайтах? Хочешь создать что-то своё? Динозавры и пистолеты? Магия и техника? ChestMod - это сайт, на котором вы можете в несколько кликов создать вашу собственную сборку. Все моды берутся с сайта Modrinth.',

    infoHowTitle: 'Как это работает?',
    infoHowStep1: 'Открой вкладку «Сборка» и выбери версию Minecraft и загрузчик.',
    infoHowStep2: 'Во вкладке «Обзор Modrinth» найди моды, ресурспаки или шейдеры и "положи" их в сундук.',
    infoHowStep3: 'Нажми «Скачать ZIP» - и ты получишь архив, который нужно распаковать в .minecraft.',

    infoFeaturesTitle: 'Возможности',
    infoFeatureSearch: 'Поиск по Modrinth с детальными настройками поиска.',
    infoFeatureChest: 'Сундук с модами, ресурспаками и шейдерами.',
    infoFeatureDeps: 'Проверка версий, загрузчиков, обязательных зависимостей и конфликтов.',
    infoFeatureZip: 'Сборка ZIP , с проверкой SHA-1.',
    infoFeatureThemes: 'Хорошая персонализация в настройках.',

    infoCreditsTitle: 'Авторство',
    infoCreditsText: 'Идея, постановка задач и направление развития: <b>SanchezST</b>. Реализация интерфейса, логики и кода сделана в паре с AI-ассистентом Qwen 3.8 Max.',

    builderNoteTitle: 'Совет',
    builderNoteText: 'Если хочешь быстро начать - открой «Обзор Modrinth», выбери тип проекта и добавляй файлы в сундук. Текущая версия и загрузчик всегда показаны в шапке.',

    settingsTitle: 'Параметры сборки',
    stepTag: 'Обязательно перед выбором модов и др.',
    versionLabel: 'Версия Minecraft',
    loaderLabel: 'Загрузчик',
    findMods: '🔎 Найти в обзоре',
    choose: 'Выбрать',
    versionPh: 'Версия',
    loaderPh: 'Загрузчик',

    chestTitle: 'Ваш сундук',
    chestEmptyTitle: 'Сундук пуст',
    chestEmptySub: 'Найдите моды, ресурспаки или шейдеры в обзоре и положите их сюда.',
    download: 'Скачать ZIP',
    fixDeps: 'Дотянуть зависимости',
    clear: 'Очистить',
    clearConfirm: 'Точно очистить?',
    hint: 'Проверка SHA-1 и раскладка по папкам mods / resourcepacks / shaderpacks.',
    depTag: '· зависимость',

    searchTitle: 'Поиск и фильтры',
    projectTypeLabel: 'Тип проекта',
    typeModButton: 'Моды',
    typeResourcepackButton: 'Ресурсы',
    typeShaderButton: 'Шейдеры',
    typeModGroup: 'Моды',
    typeResourcepackGroup: 'Ресурспаки',
    typeShaderGroup: 'Шейдерпаки',
    typeModShort: 'Мод',
    typeResourcepackShort: 'Ресурс',
    typeShaderShort: 'Шейдер',

    searchLabel: 'Поиск',
    searchPlaceholder: 'Sodium, JEI, Create...',
    searchBtn: 'Найти',
    sortLabel: 'Сортировка',
    categoryLabel: 'Категория',
    onlyBuild: 'Только под мою сборку',
    refresh: 'Обновить',
    loadMore: 'Показать ещё',
    loading: 'Загрузка…',

    sortDownloads: 'По загрузкам',
    sortFollows: 'По подпискам',
    sortUpdated: 'По обновлению',
    sortNewest: 'По новизне',
    allCategories: 'Все категории',
    pickerFilterPh: 'Фильтр…',
    pickerEmpty: 'Ничего не найдено',

    addToCart: 'В сундук',
    inCart: 'В сундуке ✓',
    openModrinth: 'Страница на Modrinth',

    translateDesc: 'Переводить описания',
    translateBtn: 'Перевести?',
    showOriginal: 'Оригинал',
    translatingBusy: 'Перевожу…',

    settingsModalTitle: 'Настройки',
    languageLabel: 'Язык',
    themeLabel: 'Цветовая гамма',
    themeBurgundy: 'Тёмно-бордовая',
    themeBlue: 'Тёмно-синяя',
    themePurple: 'Тёмно-фиолетовая',
    themeGreen: 'Тёмно-зелёная',
    translateHint: 'Переводятся краткие описания в карточках и полные тексты в окне проекта.',

    detailLoadError: 'Не удалось загрузить информацию о проекте.',
    detailUpdated: 'Обновлён',
    detailLatest: 'Последняя версия',
    detailNoFiles: 'Нет файлов',

    msgChestEmpty: 'Сундук очищен.',
    msgRemoved: '«{t}» убран из сундука.',
    msgAdded: '«{t}» добавлен в сундук.',
    msgAlready: 'Этот проект уже в сундуке.',
    msgDepsPulled: 'Подтянуты зависимости: {d}.',
    msgDepsAdded: 'Добавлено зависимостей: {n}.',
    msgDepsOk: 'Все зависимости уже на месте.',
    msgCantAddDep: 'Не смог добавить зависимость: {m}',
    msgNetwork: 'Нет соединения с Modrinth.',
    msgApi: 'Modrinth API вернул {s}.',
    msgInitError: 'Не удалось загрузить версии игры и загрузчики.',
    msgLoadMoreFail: 'Не удалось догрузить проекты.',
    msgNotFound: 'Проекты не найдены',
    msgNotFoundSub: 'Смените запрос, категорию или отключите фильтр сборки.',
    msgLoadFail: 'Не удалось загрузить',
    msgSearchEmptySub: 'Смените запрос или фильтры.',
    msgNoVersion: '«{t}»: нет версии под {v}.',
    msgNoVersionLoader: '«{t}»: нет версии под {v} / {l}.',
    msgIncompatibleWith: '«{t}» несовместим с: {n}.',
    msgDeclaredIncompatible: '«{t}» несовместим с «{n}».',
    msgDepFailed: 'Зависимость для «{t}»: {m}',
    msgDeep: 'Слишком глубокая цепочка зависимостей.',
    msgCantAdd: 'Не удалось добавить проект.',
    msgFixFirst: 'Сначала исправьте ошибки в сундуке.',
    msgDownloading: 'Качаю…',
    msgPackaging: 'Пакую…',
    msgPacking: 'Собираю архив…',
    msgDone: 'Готово: {n} файлов, {s}.',
    msgBuildError: 'Ошибка сборки: {m}',
    msgFileFailed: 'Не скачался {f} ({s})',
    msgCorrupt: 'Файл {f} повреждён (SHA-1 не совпал).',

    errNoVersion: 'не поддерживает Minecraft {v}.',
    errNoLoader: 'не работает на {l}.',
    errMissingDep: 'Не хватает зависимости «{t}» для: {n}.',
    warnLegacy: 'Часть файлов добавлена старой версией сайта. Добавьте их заново для полной проверки.',
    issueOk: '✅ Конфликтов и недостающих зависимостей нет.',

    metaShown: 'Показано {a} из {b}',
    buildCtx: 'Сейчас: {v} · {l}',
    summaryMods: 'Файлов: {n}',

    dl: 'загрузок',
    follows: 'подписок',
    noDesc: 'Без описания.'
  },

  en: {
    brandSub: 'beta 1.1',

    tabInfo: 'Info',
    tabBuilder: 'Builder',
    tabExplore: 'Browse Modrinth',

    settingsBtnTitle: 'Settings',

    infoHeroLabel: 'About project',
    infoHeroTitle: 'ChestMod – a collector of <span>mods, resource packs and shaders</span>',
    infoHeroText: 'Tired of scouring websites and downloading each mod individually? On this site, you can create your own custom modpack in just a few clicks and download it as a zip file. This site was built using AI, so errors may appear.',

    infoAboutTitle: 'What is it?',
    infoAboutText: 'Tired of the standard modpacks found on various websites? Want to create something of your own? Dinosaurs and guns? Magic and technology? ChestMod is a site where you can build your own custom modpack in just a few clicks. All mods are sourced from Modrinth.',

    infoHowTitle: 'How it works',
    infoHowStep1: 'Open Builder and choose a Minecraft version and modloader.',
    infoHowStep2: 'In Browse Modrinth, find mods, resource packs, or shaders and put them into the chest.',
    infoHowStep3: 'Press Download ZIP — the archive will be built with mods, resourcepacks, and shaderpacks folders.',

    infoFeaturesTitle: 'Features',
    infoFeatureSearch: 'Modrinth search with filters by project type, category, sorting, and current build.',
    infoFeatureChest: 'Chest grouped by mods, resources, and shaders.',
    infoFeatureDeps: 'Checks versions, loaders, required dependencies, and conflicts.',
    infoFeatureZip: 'ZIP building with SHA-1 checks.',
    infoFeatureThemes: 'Good personalisation.',

    infoCreditsTitle: 'Credits',
    infoCreditsText: 'Idea, task direction, and development vision: <b>SanchezST</b>. Interface, logic, and code implementation made together with an AI assistant Qwen 3.8 Max.',

    builderNoteTitle: 'Tip',
    builderNoteText: 'If you want to start quickly, open Browse Modrinth, choose a project type, and add files to the chest. The current version and loader are always shown in the header.',

    settingsTitle: 'Build settings',
    stepTag: 'Be sure to check this before choosing mods, etc.',
    versionLabel: 'Minecraft version',
    loaderLabel: 'Loader',
    findMods: '🔎 Find in Browse',
    choose: 'Choose',
    versionPh: 'Version',
    loaderPh: 'Loader',

    chestTitle: 'Your chest',
    chestEmptyTitle: 'Chest is empty',
    chestEmptySub: 'Find mods, resource packs, or shaders in Browse and put them here.',
    download: 'Download ZIP',
    fixDeps: 'Pull dependencies',
    clear: 'Clear',
    clearConfirm: 'Really clear?',
    hint: 'SHA-1 checks and sorting into mods / resourcepacks / shaderpacks folders.',
    depTag: '· dependency',

    searchTitle: 'Search & filters',
    projectTypeLabel: 'Project type',
    typeModButton: 'Mods',
    typeResourcepackButton: 'Resources',
    typeShaderButton: 'Shaders',
    typeModGroup: 'Mods',
    typeResourcepackGroup: 'Resource packs',
    typeShaderGroup: 'Shader packs',
    typeModShort: 'Mod',
    typeResourcepackShort: 'Resource',
    typeShaderShort: 'Shader',

    searchLabel: 'Search',
    searchPlaceholder: 'Sodium, JEI, Create...',
    searchBtn: 'Search',
    sortLabel: 'Sorting',
    categoryLabel: 'Category',
    onlyBuild: 'Only for my build',
    refresh: 'Refresh',
    loadMore: 'Show more',
    loading: 'Loading…',

    sortDownloads: 'By downloads',
    sortFollows: 'By follows',
    sortUpdated: 'By update',
    sortNewest: 'By newest',
    allCategories: 'All categories',
    pickerFilterPh: 'Filter…',
    pickerEmpty: 'Nothing found',

    addToCart: 'Add to chest',
    inCart: 'In chest ✓',
    openModrinth: 'Modrinth page',

    translateDesc: 'Translate descriptions',
    translateBtn: '🌐 Translate',
    showOriginal: 'Original',
    translatingBusy: 'Translating…',

    settingsModalTitle: 'Settings',
    languageLabel: 'Language',
    themeLabel: 'Color theme',
    themeBurgundy: 'Dark burgundy',
    themeBlue: 'Dark blue',
    themePurple: 'Dark purple',
    themeGreen: 'Dark green',
    translateHint: 'Short card descriptions and full project texts are translated.',

    detailLoadError: 'Failed to load project info.',
    detailUpdated: 'Updated',
    detailLatest: 'Latest version',
    detailNoFiles: 'No files',

    msgChestEmpty: 'Chest cleared.',
    msgRemoved: '"{t}" removed from the chest.',
    msgAdded: '"{t}" added to the chest.',
    msgAlready: 'This project is already in the chest.',
    msgDepsPulled: 'Dependencies pulled: {d}.',
    msgDepsAdded: 'Dependencies added: {n}.',
    msgDepsOk: 'All dependencies are already in place.',
    msgCantAddDep: 'Could not add dependency: {m}',
    msgNetwork: 'No connection to Modrinth.',
    msgApi: 'Modrinth API returned {s}.',
    msgInitError: 'Failed to load game versions and loaders.',
    msgLoadMoreFail: 'Failed to load more projects.',
    msgNotFound: 'No projects found',
    msgNotFoundSub: 'Try another query, category, or disable the build filter.',
    msgLoadFail: 'Failed to load',
    msgSearchEmptySub: 'Change the query or filters.',
    msgNoVersion: '"{t}": no version for {v}.',
    msgNoVersionLoader: '"{t}": no version for {v} / {l}.',
    msgIncompatibleWith: '"{t}" is incompatible with: {n}.',
    msgDeclaredIncompatible: '"{t}" is incompatible with "{n}".',
    msgDepFailed: 'Dependency for "{t}": {m}',
    msgDeep: 'Dependency chain is too deep.',
    msgCantAdd: 'Could not add the project.',
    msgFixFirst: 'Fix the chest errors first.',
    msgDownloading: 'Downloading…',
    msgPackaging: 'Packing…',
    msgPacking: 'Building archive…',
    msgDone: 'Done: {n} files, {s}.',
    msgBuildError: 'Build error: {m}',
    msgFileFailed: 'Failed to download {f} ({s})',
    msgCorrupt: 'File {f} is corrupted (SHA-1 mismatch).',

    errNoVersion: 'does not support Minecraft {v}.',
    errNoLoader: 'does not work on {l}.',
    errMissingDep: 'Missing dependency "{t}" for: {n}.',
    warnLegacy: 'Some files were added by an older site version. Re-add them for full checks.',
    issueOk: '✅ No conflicts or missing dependencies.',

    metaShown: 'Showing {a} of {b}',
    buildCtx: 'Current: {v} · {l}',
    summaryMods: 'Files: {n}',

    dl: 'downloads',
    follows: 'follows',
    noDesc: 'No description.'
  }
};

/* ============================================================
   Базовые утилиты
   ============================================================ */

const $ = id => document.getElementById(id);
const sleep = ms => new Promise(r => setTimeout(r, ms));

function t(key, vars) {
  const table = I18N[state.lang] || I18N.ru;
  let s = table[key] ?? I18N.ru[key] ?? key;

  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      s = s.replaceAll(`{${k}}`, v);
    }
  }

  return s;
}

function escapeHtml(s) {
  return String(s ?? '').replace(/[&<>"']/g, c => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[c]));
}

function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function formatNumber(n) {
  return Number(n || 0).toLocaleString(state.lang === 'ru' ? 'ru-RU' : 'en-US');
}

function formatBytes(bytes) {
  if (!bytes) return state.lang === 'ru' ? '0 Б' : '0 B';

  const units = state.lang === 'ru'
    ? ['Б', 'КБ', 'МБ', 'ГБ']
    : ['B', 'KB', 'MB', 'GB'];

  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / 1024 ** i).toFixed(i ? 1 : 0)} ${units[i]}`;
}

function safeFileName(name) {
  const base = String(name || '')
    .split(/[\\/]/).pop()
    .replace(/\.\./g, '_')
    .replace(/[<>:"|?*\u0000-\u001F]/g, '_')
    .trim();

  return base || 'file.zip';
}

function sanitizeSvg(svg) {
  return String(svg || '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/\son\w+\s*=\s*"[^"]*"/gi, '')
    .replace(/\son\w+\s*=\s*'[^']*'/gi, '')
    .replace(/href\s*=\s*"javascript:[^"]*"/gi, '');
}

function normalizeType(type) {
  return PROJECT_TYPES.includes(type) ? type : 'mod';
}

function normalizeTheme(theme) {
  return THEMES.includes(theme) ? theme : 'burgundy';
}

function getTypeMeta(type) {
  return TYPE_META[normalizeType(type)] || TYPE_META.mod;
}

function capitalize(s) {
  const str = String(s || '');
  return str ? str[0].toUpperCase() + str.slice(1) : '';
}

function loaderDisplay(value) {
  const v = String(value || '').toLowerCase();
  return LOADER_LABELS[v] || capitalize(v);
}

function getLoaderLabel() {
  const opt = loaderPicker?.allOptions?.find(o => o.value === state.loader);
  if (opt?.label) return opt.label;
  return loaderDisplay(state.loader);
}

function randomZipName() {
  const first = FIRST_WORDS[Math.floor(Math.random() * FIRST_WORDS.length)];
  const second = SECOND_WORDS[Math.floor(Math.random() * SECOND_WORDS.length)];
  const digits = String(Math.floor(Math.random() * 1000)).padStart(3, '0');
  return `${first}-${second}-${digits}.zip`;
}

function sortOptions() {
  return [
    { value: 'downloads', label: t('sortDownloads') },
    { value: 'follows', label: t('sortFollows') },
    { value: 'updated', label: t('sortUpdated') },
    { value: 'newest', label: t('sortNewest') }
  ];
}

let toastTimer = null;

function showToast(message, type = 'info') {
  const toast = $('toast');
  if (!toast) return;

  toast.textContent = message;
  toast.className = `toast show ${type}`;

  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 3600);
}

async function sha1Hex(buffer) {
  const digest = await crypto.subtle.digest('SHA-1', buffer);
  return [...new Uint8Array(digest)]
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

async function mapLimited(items, limit, fn) {
  let i = 0;

  async function worker() {
    while (i < items.length) {
      const idx = i++;
      await fn(items[idx]);
    }
  }

  const workersCount = Math.max(0, Math.min(limit, items.length));
  await Promise.all(Array.from({ length: workersCount }, worker));
}

/* ============================================================
   Динамическая фиксация интерфейса
   ============================================================ */

function updateChromeHeight() {
  const topbar = document.querySelector('.topbar');
  const tabs = document.querySelector('.tabs-wrap');

  const topbarH = topbar?.offsetHeight || 0;
  const tabsH = tabs?.offsetHeight || 0;
  const totalH = topbarH + tabsH;

  document.documentElement.style.setProperty('--topbar-h', `${topbarH}px`);
  document.documentElement.style.setProperty('--chrome-h', `${totalH}px`);
}

function updateLayoutMode() {
  const fixed = window.innerWidth >= LAYOUT_MIN_WIDTH;
  document.body.classList.toggle('fixed-app', fixed);
  updateChromeHeight();
}

function initLayoutWatcher() {
  updateLayoutMode();

  window.addEventListener('resize', updateLayoutMode);
  window.addEventListener('orientationchange', updateLayoutMode);

  if (document.fonts?.ready) {
    document.fonts.ready
      .then(updateLayoutMode)
      .catch(() => {});
  }

  const targets = [
    document.querySelector('.topbar'),
    document.querySelector('.tabs-wrap')
  ].filter(Boolean);

  if ('ResizeObserver' in window) {
    const observer = new ResizeObserver(() => updateLayoutMode());
    targets.forEach(el => observer.observe(el));
  }
}

/* ============================================================
   Темы
   ============================================================ */

function applyTheme() {
  state.theme = normalizeTheme(state.theme);
  document.body.dataset.theme = state.theme;

  document.querySelectorAll('.theme-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.theme === state.theme);
  });
}

/* ============================================================
   Markdown и HTML-описания
   ============================================================ */

function renderModBody(md) {
  const text = (md || '').trim();
  if (!text) return '';

  if (window.marked && window.DOMPurify) {
    try {
      const html = marked.parse(text, { gfm: true, breaks: true });
      return DOMPurify.sanitize(html, { ADD_ATTR: ['target'] });
    } catch (e) {
      console.error('Markdown render failed:', e);
    }
  }

  return `<p>${escapeHtml(text)}</p>`;
}

function fixupDetailBody(scope) {
  scope.querySelectorAll('.detail-body a').forEach(a => {
    a.setAttribute('target', '_blank');
    a.setAttribute('rel', 'noopener noreferrer');
  });

  scope.querySelectorAll('.detail-body img').forEach(img => {
    img.setAttribute('loading', 'lazy');
  });
}

/* ============================================================
   Оверлеи и блокировка прокрутки фона
   ============================================================ */

function syncOverlay() {
  const overlay = $('overlay');
  if (!overlay) return;
  overlay.classList.toggle('show', detailOpen);
}

function syncSettingsOverlay() {
  const overlay = $('settings-overlay');
  if (!overlay) return;
  overlay.classList.toggle('show', settingsOpen);
}

function syncBodyModal() {
  document.body.classList.toggle('has-modal-open', detailOpen || settingsOpen);
}

/* ============================================================
   Перевод
   ============================================================ */

let translations = loadTranslations();

function loadTranslations() {
  try {
    return JSON.parse(localStorage.getItem(TRANS_KEY) || '{}');
  } catch {
    return {};
  }
}

function saveTranslations() {
  try {
    const entries = Object.entries(translations);
    const trimmed = entries.length > TRANS_MAX
      ? Object.fromEntries(entries.slice(-TRANS_MAX))
      : translations;

    localStorage.setItem(TRANS_KEY, JSON.stringify(trimmed));
  } catch {
    /* ignore */
  }
}

function hashText(s) {
  let h = 5381;
  for (let i = 0; i < s.length; i++) {
    h = ((h * 33) ^ s.charCodeAt(i)) >>> 0;
  }
  return h.toString(36);
}

function protectTerms(text) {
  const found = [];
  let out = text;

  for (const term of PROTECTED_TERMS) {
    const re = new RegExp(`\\b${escapeRegExp(term)}\\b`, 'gi');

    out = out.replace(re, match => {
      found.push(match);
      return `ZZQ${found.length - 1}ZZ`;
    });
  }

  return { out, found };
}

function restoreTerms(text, found) {
  if (!found.length) return text;

  return text.replace(/zzq\s*(\d+)\s*zz/gi, (whole, i) => {
    return found[Number(i)] ?? whole;
  });
}

function isUrlText(text) {
  const s = String(text || '').trim();
  if (!s) return false;

  return (
    /^(https?:\/\/|www\.)\S+$/i.test(s) ||
    /^[a-z0-9-]+(?:\.[a-z0-9-]+)+(?:\/\S*)?$/i.test(s)
  );
}

async function translateViaGoogle(text) {
  const url =
    'https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=ru&dt=t&q=' +
    encodeURIComponent(text);

  const res = await fetch(url);
  if (!res.ok) throw new Error(`translate ${res.status}`);

  const data = await res.json();
  const out = (data[0] || [])
    .map(seg => seg?.[0] || '')
    .join('')
    .trim();

  if (!out) throw new Error('google empty');
  return out;
}

async function translateViaMyMemory(text) {
  const url =
    `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text.slice(0, 480))}&langpair=en|ru`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`mymemory ${res.status}`);

  const data = await res.json();
  const out = data?.responseData?.translatedText;

  if (!out) throw new Error('mymemory empty');
  return String(out).trim();
}

async function translateText(text) {
  const txt = String(text || '').trim();
  if (!txt) return '';

  const key = hashText(txt);
  if (translations[key]) return translations[key];

  const { out: protectedText, found } = protectTerms(txt);

  let translated = '';

  try {
    translated = await translateViaGoogle(protectedText);
  } catch {
    translated = await translateViaMyMemory(protectedText);
  }

  const out = restoreTerms(translated || '', found).trim();

  if (out) {
    translations[key] = out;
    saveTranslations();
  }

  return out;
}

function applyTranslation(card, description) {
  const descEl = card.querySelector('.mod-desc');
  if (!descEl || !description) return;

  descEl.classList.add('translating');
  descEl.title = description;

  translateText(description)
    .then(out => {
      if (out) descEl.textContent = out;
    })
    .catch(() => {
      /* остаётся оригинал */
    })
    .finally(() => {
      descEl.classList.remove('translating');
    });
}

async function translateElementTextNodes(rootEl) {
  const walker = document.createTreeWalker(rootEl, NodeFilter.SHOW_TEXT);
  const nodes = [];

  while (walker.nextNode()) {
    const node = walker.currentNode;
    const value = node.nodeValue.trim();

    if (value.length < 2) continue;
    if (!/\p{L}/u.test(value)) continue;
    if (node.parentElement?.closest('pre, code')) continue;
    if (node.parentElement?.closest('a') && isUrlText(value)) continue;

    nodes.push(node);
  }

  await mapLimited(nodes, 4, async node => {
    const raw = node.nodeValue;
    const lead = raw.match(/^\s*/)[0];
    const trail = raw.match(/\s*$/)[0];

    try {
      const out = await translateText(raw.trim());
      if (out) node.nodeValue = lead + out + trail;
    } catch {
      /* пропускаем узел */
    }
  });
}

/* ============================================================
   Modrinth API
   ============================================================ */

async function mr(path, params = {}, attempt = 0) {
  const qs = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    qs.set(key, typeof value === 'string' ? value : JSON.stringify(value));
  }

  const url = API + path + (qs.toString() ? '?' + qs : '');

  if (cache.has(url)) return cache.get(url);

  let res;

  try {
    res = await fetch(url);
  } catch (e) {
    if (attempt < 2) {
      await sleep(700 * 2 ** attempt);
      return mr(path, params, attempt + 1);
    }
    throw new Error(t('msgNetwork'));
  }

  if ((res.status === 429 || res.status >= 500) && attempt < 2) {
    const retryAfter = Number(res.headers.get('Retry-After')) || 0;
    await sleep(Math.max(retryAfter * 1000, 900 * 2 ** attempt));
    return mr(path, params, attempt + 1);
  }

  if (!res.ok) throw new Error(t('msgApi', { s: res.status }));

  const data = await res.json();
  cache.set(url, data);
  return data;
}

function rememberProject(hit) {
  if (!hit?.project_id) return;

  projects.set(hit.project_id, {
    title: hit.title,
    icon: hit.icon_url,
    slug: hit.slug || null,
    type: normalizeType(hit.project_type || state.projectType)
  });
}

async function ensureProjectInfo(projectId) {
  const cached = projects.get(projectId);
  if (cached && cached.type) return cached;

  try {
    const p = await mr(`/project/${projectId}`);
    const info = {
      title: p.title,
      icon: p.icon_url,
      slug: p.slug || null,
      type: normalizeType(p.project_type)
    };

    projects.set(projectId, info);
    return info;
  } catch {
    const fallback = {
      title: projectId,
      icon: null,
      slug: null,
      type: 'mod'
    };

    projects.set(projectId, fallback);
    return fallback;
  }
}

async function projectTitle(projectId) {
  const info = await ensureProjectInfo(projectId);
  return info.title;
}

function projectPageUrl(type, slug) {
  if (!slug) return null;

  const segment = type === 'mod' ? 'mod' : type;
  return `https://modrinth.com/${segment}/${slug}`;
}

/* ============================================================
   Пикеры: portal в body + затемнение фона
   ============================================================ */

const pickerRegistry = new Set();
let openPicker = null;
let pickerOverlay = null;

function ensurePickerOverlay() {
  if (pickerOverlay) return pickerOverlay;

  pickerOverlay = document.createElement('div');
  pickerOverlay.className = 'picker-overlay';
  pickerOverlay.id = 'picker-overlay';

  pickerOverlay.addEventListener('click', () => {
    closeAllPickers();
  });

  document.body.appendChild(pickerOverlay);
  return pickerOverlay;
}

function syncPickerOverlay() {
  const overlay = ensurePickerOverlay();
  const anyOpen = Boolean(openPicker);

  overlay.classList.toggle('show', anyOpen);
  document.body.classList.toggle('picker-open', anyOpen);
}

function closeAllPickers() {
  pickerRegistry.forEach(p => p.close());
  openPicker = null;
  syncPickerOverlay();
}

function createPicker(container, settings) {
  const {
    options = [],
    selected = null,
    filterable = false,
    placeholder = '',
    title = null,
    onSelect
  } = settings;

  let allOptions = options;
  let current = selected;

  container.classList.add('picker');
  container.innerHTML = `
    <button type="button" class="picker-btn" aria-haspopup="listbox" aria-expanded="false">
      <span class="picker-current-left">
        <span class="picker-current-icon" hidden></span>
        <span class="picker-value"></span>
      </span>
      <span class="picker-arrow">▾</span>
    </button>
  `;

  const menu = document.createElement('div');
  menu.className = 'picker-menu';
  menu.hidden = true;

  menu.innerHTML = `
    <div class="picker-menu-head">
      <span class="picker-menu-title"></span>
      <button type="button" class="picker-menu-close">✕</button>
    </div>

    ${filterable ? `<input type="text" class="picker-filter" placeholder="${escapeHtml(t('pickerFilterPh'))}">` : ''}

    <div class="picker-options" role="listbox"></div>
  `;

  document.body.appendChild(menu);

  const btn = container.querySelector('.picker-btn');
  const valueEl = container.querySelector('.picker-value');
  const currentIconEl = container.querySelector('.picker-current-icon');
  const titleEl = menu.querySelector('.picker-menu-title');
  const closeBtn = menu.querySelector('.picker-menu-close');
  const optionsBox = menu.querySelector('.picker-options');
  const filterInput = menu.querySelector('.picker-filter');

  function renderOptions(filterText = '') {
    const f = filterText.trim().toLowerCase();
    const list = allOptions.filter(o => !f || o.label.toLowerCase().includes(f));

    optionsBox.innerHTML = '';

    if (!list.length) {
      optionsBox.innerHTML = `<div class="picker-empty">${escapeHtml(t('pickerEmpty'))}</div>`;
      return;
    }

    for (const opt of list) {
      const item = document.createElement('div');
      item.className = 'picker-option' + (opt.value === current ? ' selected' : '');
      item.setAttribute('role', 'option');

      item.innerHTML = `
        ${opt.icon ? `<span class="picker-opt-icon">${sanitizeSvg(opt.icon)}</span>` : ''}
        <span class="picker-option-label">${escapeHtml(opt.label)}</span>
      `;

      item.addEventListener('click', e => {
        e.stopPropagation();
        current = opt.value;
        refresh();
        api.close();
        onSelect?.(opt.value);
      });

      optionsBox.appendChild(item);
    }
  }

  function refreshTitle() {
    if (titleEl && title) titleEl.textContent = t(title);
    if (filterInput) filterInput.placeholder = t('pickerFilterPh');
  }

  function refresh() {
    const opt = allOptions.find(o => o.value === current);

    valueEl.textContent = opt ? opt.label : (placeholder || t('choose'));

    if (opt?.icon) {
      currentIconEl.innerHTML = sanitizeSvg(opt.icon);
      currentIconEl.hidden = false;
    } else {
      currentIconEl.innerHTML = '';
      currentIconEl.hidden = true;
    }

    renderOptions(filterInput ? filterInput.value : '');
  }

  function openMenu() {
    if (openPicker && openPicker !== api) {
      openPicker.close();
    }

    container.classList.add('open');
    menu.hidden = false;
    btn.setAttribute('aria-expanded', 'true');
    openPicker = api;

    syncPickerOverlay();

    if (filterInput) {
      filterInput.value = '';
      renderOptions('');
      setTimeout(() => filterInput.focus(), 0);
    }
  }

  function closeMenu() {
    container.classList.remove('open');
    menu.hidden = true;
    btn.setAttribute('aria-expanded', 'false');

    if (openPicker === api) {
      openPicker = null;
    }

    syncPickerOverlay();
  }

  btn.addEventListener('click', e => {
    e.stopPropagation();
    menu.hidden ? openMenu() : closeMenu();
  });

  closeBtn.addEventListener('click', e => {
    e.stopPropagation();
    api.close();
  });

  if (filterInput) {
    filterInput.addEventListener('input', () => renderOptions(filterInput.value));

    filterInput.addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        e.preventDefault();
        optionsBox.querySelector('.picker-option')?.click();
      }

      if (e.key === 'Escape') {
        e.stopPropagation();
        api.close();
        btn.focus();
      }
    });
  }

  const api = {
    container,
    menu,
    allOptions,

    setOptions(opts, keepSelection = true) {
      allOptions = opts;
      api.allOptions = opts;

      if (!keepSelection || !opts.some(o => o.value === current)) {
        current = opts[0]?.value ?? null;
      }

      refresh();
    },

    setSelected(value) {
      current = value;
      refresh();
    },

    getValue: () => current,
    refresh,
    refreshTitle,
    open: openMenu,
    close: closeMenu,
    isOpen: () => !menu.hidden
  };

  pickerRegistry.add(api);
  refreshTitle();
  refresh();

  return api;
}

document.addEventListener('click', e => {
  pickerRegistry.forEach(p => {
    if (
      p.isOpen() &&
      !p.container.contains(e.target) &&
      !p.menu.contains(e.target)
    ) {
      p.close();
    }
  });
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    closeAllPickers();
    closeModDetail();
    closeSettingsModal();
  }
});

/* ============================================================
   Вкладки
   ============================================================ */

function initTabs() {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => setActiveTab(btn.dataset.tab));
  });

  $('chest-mini')?.addEventListener('click', () => setActiveTab('builder'));
}

function setActiveTab(tabId) {
  closeAllPickers();

  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tabId);
  });

  document.querySelectorAll('.tab-panel').forEach(panel => {
    panel.classList.toggle('active', panel.id === `tab-${tabId}`);
  });

  if (tabId === 'explore' && !explore.loaded) searchExplore(true);

  requestAnimationFrame(updateLayoutMode);
}

/* ============================================================
   Тип проекта
   ============================================================ */

function updateProjectTypeButtons() {
  document.querySelectorAll('.type-btn').forEach(btn => {
    btn.classList.toggle(
      'active',
      normalizeType(btn.dataset.projectType) === state.projectType
    );
  });
}

function setProjectType(type) {
  const nextType = normalizeType(type);
  if (nextType === state.projectType) return;

  state.projectType = nextType;
  saveState();

  updateProjectTypeButtons();
  rebuildCategoryOptions(false);
  updateBuildContext();

  const exploreActive = $('tab-explore')?.classList.contains('active');

  if (explore.loaded || exploreActive) {
    searchExplore(true);
  }
}

/* ============================================================
   Версия и загрузчик
   ============================================================ */

async function initFilters() {
  const [versions, loaders] = await Promise.all([
    mr('/tag/game_version'),
    mr('/tag/loader')
  ]);

  const versionOptions = versions
    .filter(v => v.version_type === 'release')
    .map(v => ({ value: v.version, label: v.version }));

  const loaderOptions = loaders
    .filter(l =>
      Array.isArray(l.supported_project_types) &&
      l.supported_project_types.includes('mod')
    )
    .map(l => ({
      value: String(l.name || '').toLowerCase(),
      label: l.name,
      icon: l.icon || null
    }))
    .sort((a, b) => {
      const pa = LOADER_PRIORITY[a.value] ?? 99;
      const pb = LOADER_PRIORITY[b.value] ?? 99;

      return pa - pb || a.label.localeCompare(b.label);
    });

  if (!versionOptions.some(o => o.value === state.gameVersion)) {
    state.gameVersion = versionOptions[0]?.value || '';
  }

  state.loader = String(state.loader || 'fabric').toLowerCase();

  if (!loaderOptions.some(o => o.value === state.loader)) {
    state.loader = loaderOptions[0]?.value || '';
  }

  versionPicker = createPicker($('version-picker'), {
    options: versionOptions,
    selected: state.gameVersion,
    filterable: true,
    title: 'versionLabel',
    placeholder: t('versionPh'),
    onSelect: value => {
      state.gameVersion = value;
      onSettingsChanged();
    }
  });

  loaderPicker = createPicker($('loader-picker'), {
    options: loaderOptions,
    selected: state.loader,
    title: 'loaderLabel',
    placeholder: t('loaderPh'),
    onSelect: value => {
      state.loader = value;
      onSettingsChanged();
    }
  });

  updateBuildContext();
}

function onSettingsChanged() {
  saveState();
  renderCart();
  updateBuildContext();

  if (explore.loaded && $('explore-use-filters')?.checked) {
    searchExplore(true);
  }
}

function updateBuildContext() {
  const el = $('build-pill');
  if (!el) return;

  const v = state.gameVersion || '—';
  const l = getLoaderLabel() || '—';

  el.textContent = `${v} · ${l}`;
  el.title = t('buildCtx', { v, l });
}

/* ============================================================
   Скелетоны и пустые состояния
   ============================================================ */

function skeletonHtml(count = 6) {
  return Array.from({ length: count }).map(() => `
    <div class="mod-card skeleton">
      <div class="mod-top">
        <div class="skel skel-icon"></div>
        <div style="flex:1">
          <div class="skel skel-line w-60"></div>
          <div class="skel skel-line w-80"></div>
        </div>
      </div>

      <div class="skel skel-line"></div>
      <div class="skel skel-line w-80"></div>
      <div class="skel skel-btn"></div>
    </div>
  `).join('');
}

function emptyBlock(icon, title, subtitle) {
  return `
    <div class="empty-results" style="grid-column:1/-1">
      <div class="empty-icon">${icon}</div>
      <p>${escapeHtml(title)}</p>
      <small>${escapeHtml(subtitle)}</small>
    </div>
  `;
}

/* ============================================================
   Ранжирование поиска
   ============================================================ */

function rankByTitle(hits, query) {
  const q = (query || '').trim().toLowerCase();
  if (!q) return hits;

  const score = hit => {
    const title = (hit.title || '').toLowerCase();
    const desc = (hit.description || '').toLowerCase();

    if (title === q) return 0;
    if (title.startsWith(q)) return 1;
    if (title.split(/\s+/).some(w => w.startsWith(q))) return 2;
    if (title.includes(q)) return 3;
    if (desc.includes(q)) return 4;
    return 5;
  };

  return [...hits].sort((a, b) => score(a) - score(b));
}

/* ============================================================
   Категории
   ============================================================ */

function categoryMatchesType(c, type) {
  const raw = c?.project_type;

  if (!raw) return true;
  if (raw === 'all') return true;

  const arr = Array.isArray(raw) ? raw : [raw];
  return arr.includes(type) || arr.includes('all');
}

function rebuildCategoryOptions(keepSelection = true) {
  if (!categoryPicker) return;

  const current = categoryPicker.getValue();

  const options = [
    { value: 'all', label: t('allCategories') },
    ...allCategories
      .filter(c => categoryMatchesType(c, state.projectType))
      .sort((a, b) => a.name.localeCompare(b.name))
      .map(c => ({
        value: c.name,
        label: c.name,
        icon: c.icon || null
      }))
  ];

  categoryPicker.setOptions(options, keepSelection);

  if (!keepSelection || !options.some(o => o.value === current)) {
    categoryPicker.setSelected('all');
  }
}

async function initExploreCategories() {
  try {
    const categories = await mr('/tag/category');
    allCategories = categories;
    rebuildCategoryOptions(false);
  } catch (e) {
    console.error('Categories failed:', e);
  }
}

/* ============================================================
   Обзор и поиск
   ============================================================ */

function initExplorePickers() {
  sortPicker = createPicker($('sort-picker'), {
    options: sortOptions(),
    selected: 'downloads',
    title: 'sortLabel',
    placeholder: t('sortLabel'),
    onSelect: () => searchExplore(true)
  });

  categoryPicker = createPicker($('category-picker'), {
    options: [{ value: 'all', label: t('allCategories') }],
    selected: 'all',
    filterable: true,
    title: 'categoryLabel',
    placeholder: t('categoryLabel'),
    onSelect: () => searchExplore(true)
  });
}

function updateExploreMeta() {
  const el = $('explore-meta');
  if (!el) return;

  el.textContent = explore.total
    ? t('metaShown', {
        a: formatNumber(explore.offset),
        b: formatNumber(explore.total)
      })
    : '';
}

async function searchExplore(reset = true) {
  const results = $('explore-results');
  const loadMoreBtn = $('explore-load-more');

  if (!results || explore.loading) return;

  explore.loading = true;

  if (reset) {
    explore.offset = 0;
    results.innerHTML = skeletonHtml(8);
    loadMoreBtn.hidden = true;
  } else {
    loadMoreBtn.disabled = true;
    loadMoreBtn.textContent = t('loading');
  }

  const query = $('explore-search')?.value.trim() || '';
  const category = categoryPicker?.getValue() || 'all';
  const useFilters = $('explore-use-filters')?.checked ?? true;

  const facets = [[`project_type:${state.projectType}`]];

  if (category && category !== 'all') {
    facets.push([`categories:${category}`]);
  }

  if (useFilters) {
    if (state.gameVersion) facets.push([`versions:${state.gameVersion}`]);
    if (state.projectType === 'mod' && state.loader) {
      facets.push([`categories:${state.loader}`]);
    }
  }

  const offset = reset ? 0 : explore.offset;

  try {
    const data = await mr('/search', {
      query,
      facets,
      limit: explore.limit,
      offset,
      index: query ? 'relevance' : (sortPicker?.getValue() || 'downloads')
    });

    const hits = rankByTitle(data.hits || [], query);

    explore.total = data.total_hits || 0;
    explore.hits = hits;

    if (reset) results.innerHTML = '';

    if (reset && !hits.length) {
      results.innerHTML = emptyBlock('📭', t('msgNotFound'), t('msgNotFoundSub'));
    }

    hits.forEach(hit => results.appendChild(createModCard(hit)));

    explore.offset = offset + hits.length;
    explore.loaded = true;

    updateExploreMeta();

    loadMoreBtn.hidden = explore.offset >= explore.total;
    updateAddButtons();
  } catch (e) {
    console.error(e);

    if (reset) {
      results.innerHTML = emptyBlock('⚠️', t('msgLoadFail'), e.message);
    } else {
      showToast(t('msgLoadMoreFail'), 'error');
    }
  } finally {
    explore.loading = false;
    loadMoreBtn.disabled = false;
    loadMoreBtn.textContent = t('loadMore');
  }
}

function rerenderExploreResults() {
  const results = $('explore-results');
  if (!results || !explore.loaded) return;

  results.innerHTML = '';

  if (!explore.hits.length) {
    results.innerHTML = emptyBlock('📭', t('msgNotFound'), t('msgSearchEmptySub'));
  }

  explore.hits.forEach(hit => results.appendChild(createModCard(hit)));
  updateAddButtons();
}

/* ============================================================
   Карточки проектов
   ============================================================ */

const EXTERNAL_ICON = `
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
       stroke="currentColor" stroke-width="2.2"
       stroke-linecap="round" stroke-linejoin="round">
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
    <path d="M15 3h6v6"/>
    <path d="M10 14L21 3"/>
  </svg>
`;

function createModCard(hit) {
  rememberProject(hit);

  const card = document.createElement('article');
  card.className = 'mod-card';

  const type = normalizeType(hit.project_type || state.projectType);
  const pageUrl = projectPageUrl(type, hit.slug);

  card.innerHTML = `
    <div class="mod-top">
      <div class="mod-icon">
        ${hit.icon_url ? `<img src="${hit.icon_url}" alt="" loading="lazy">` : '📦'}
      </div>

      <div class="mod-title">
        <h3 title="${escapeHtml(hit.title)}">${escapeHtml(hit.title)}</h3>
        <div class="mod-meta">⬇ ${formatNumber(hit.downloads)}</div>
      </div>
    </div>

    <p class="mod-desc">${escapeHtml(hit.description || t('noDesc'))}</p>

    <div class="mod-footer">
      <div class="mod-actions">
        ${pageUrl ? `
          <a class="page-link"
             href="${pageUrl}"
             target="_blank"
             rel="noopener noreferrer"
             title="${escapeHtml(t('openModrinth'))}">
            ${EXTERNAL_ICON}
          </a>
        ` : ''}

        <button class="add-btn"
                data-add-id="${hit.project_id}"
                data-add-type="${type}">
          ${escapeHtml(t('addToCart'))}
        </button>
      </div>
    </div>
  `;

  card.querySelector('.add-btn').addEventListener('click', e => {
    e.stopPropagation();
    addToCart(hit.project_id, type);
  });

  if (state.translate && state.lang === 'ru' && hit.description) {
    applyTranslation(card, hit.description);
  }

  card.addEventListener('click', e => {
    if (e.target.closest('button, a')) return;
    openModDetail(hit);
  });

  return card;
}

function isAdded(projectId) {
  return state.cart.some(item => item.id === projectId);
}

function updateAddButtons() {
  document.querySelectorAll('.add-btn').forEach(btn => {
    const added = isAdded(btn.dataset.addId);

    btn.disabled = added;
    btn.classList.toggle('added', added);
    btn.textContent = added ? t('inCart') : t('addToCart');
  });
}

/* ============================================================
   Детали проекта
   ============================================================ */

function openDetailShell() {
  closeAllPickers();

  $('mod-detail').classList.add('show');
  detailOpen = true;
  syncOverlay();
  syncBodyModal();
}

function closeModDetail() {
  const modal = $('mod-detail');
  if (!modal) return;

  modal.classList.remove('show');
  detailOpen = false;
  detailTranslated = false;
  detailOriginals.clear();
  detailRequestId++;

  syncOverlay();
  syncBodyModal();
}

async function toggleDetailTranslation(btn) {
  const scope = $('mod-detail-body');

  const targets = [
    scope.querySelector('.detail-desc'),
    scope.querySelector('.detail-body')
  ].filter(Boolean);

  if (!targets.length) return;

  if (!detailTranslated) {
    btn.disabled = true;
    btn.textContent = t('translatingBusy');

    targets.forEach(el => {
      if (!detailOriginals.has(el)) detailOriginals.set(el, el.innerHTML);
      el.classList.add('translating');
    });

    let ok = false;

    try {
      for (const el of targets) {
        await translateElementTextNodes(el);
      }
      ok = true;
    } catch (e) {
      console.error(e);
    } finally {
      targets.forEach(el => el.classList.remove('translating'));
      btn.disabled = false;

      if (ok) {
        detailTranslated = true;
        btn.textContent = t('showOriginal');
      } else {
        btn.textContent = t('translateBtn');
      }
    }
  } else {
    for (const el of targets) {
      if (detailOriginals.has(el)) el.innerHTML = detailOriginals.get(el);
    }

    fixupDetailBody(scope);
    detailTranslated = false;
    btn.textContent = t('translateBtn');
  }
}

async function openModDetail(hit) {
  const body = $('mod-detail-body');
  const requestId = ++detailRequestId;

  detailTranslated = false;
  detailOriginals.clear();

  body.innerHTML = `
    <div class="detail-loading">
      <div class="skel skel-line w-60" style="height:20px"></div>
      <div class="skel skel-line"></div>
      <div class="skel skel-line w-80"></div>
      <div class="skel skel-line"></div>
      <div class="skel skel-line w-60"></div>
    </div>
  `;

  openDetailShell();

  try {
    const [project, versions] = await Promise.all([
      mr(`/project/${hit.project_id}`),
      mr(`/project/${hit.project_id}/version`, { limit: 1 })
    ]);

    if (requestId !== detailRequestId || !detailOpen) return;

    const latest = versions?.[0] || null;
    const type = normalizeType(project.project_type || hit.project_type || state.projectType);
    const typeMeta = getTypeMeta(type);

    projects.set(hit.project_id, {
      title: project.title,
      icon: project.icon_url,
      slug: project.slug || null,
      type
    });

    const downloads = project.downloads ?? hit.downloads ?? 0;
    const follows = project.follows ?? 0;
    const updated = project.updated
      ? new Date(project.updated).toLocaleDateString(state.lang === 'ru' ? 'ru-RU' : 'en-US')
      : '—';

    const categories = project.categories || [];
    const loaders = project.loaders || [];
    const desc = project.description || hit.description || '';
    const bodyText = (project.body || desc).trim();

    const pageUrl = projectPageUrl(type, project.slug || hit.slug);
    const added = isAdded(hit.project_id);

    const showTranslateBtn = state.lang === 'ru' && (desc || bodyText);

    body.innerHTML = `
      <div class="detail-top">
        <div class="detail-icon">
          ${(project.icon_url || hit.icon_url)
            ? `<img src="${project.icon_url || hit.icon_url}" alt="">`
            : '📦'}
        </div>

        <div class="detail-title">
          <h3>${escapeHtml(project.title)}</h3>

          <div class="detail-meta">
            <span>⬇ <b>${formatNumber(downloads)}</b> ${escapeHtml(t('dl'))}</span>
            <span>❤ <b>${formatNumber(follows)}</b> ${escapeHtml(t('follows'))}</span>
            <span>${escapeHtml(t('detailUpdated'))}: <b>${escapeHtml(updated)}</b></span>
          </div>
        </div>
      </div>

      ${desc ? `<p class="detail-desc">${escapeHtml(desc)}</p>` : ''}

      <div class="detail-tags">
        <span class="chip">${escapeHtml(t(typeMeta.group))}</span>
        ${categories.map(c => `<span class="chip">${escapeHtml(c)}</span>`).join('')}
        ${loaders.map(l => `<span class="chip">${escapeHtml(l)}</span>`).join('')}
      </div>

      <div class="detail-version">
        ${escapeHtml(t('detailLatest'))}:
        ${latest
          ? `${escapeHtml(latest.version_number)} · ${escapeHtml((latest.game_versions || []).slice(0, 4).join(', '))}`
          : escapeHtml(t('detailNoFiles'))}
      </div>

      ${showTranslateBtn ? `
        <div class="detail-translate-row">
          <button type="button" class="translate-toggle">
            ${escapeHtml(t('translateBtn'))}
          </button>
        </div>
      ` : ''}

      <div class="detail-body">${renderModBody(bodyText)}</div>

      <div class="detail-actions">
        <button class="detail-add-btn${added ? ' added' : ''}" ${added ? 'disabled' : ''}>
          ${escapeHtml(added ? t('inCart') : t('addToCart'))}
        </button>

        ${pageUrl ? `
          <a class="detail-link" href="${pageUrl}" target="_blank" rel="noopener noreferrer">
            ${escapeHtml(t('openModrinth'))} ↗
          </a>
        ` : ''}
      </div>
    `;

    fixupDetailBody(body);

    body.querySelector('.detail-add-btn')?.addEventListener('click', () => {
      addToCart(hit.project_id, type);
    });

    body.querySelector('.translate-toggle')?.addEventListener('click', e => {
      toggleDetailTranslation(e.currentTarget);
    });
  } catch (e) {
    if (requestId !== detailRequestId || !detailOpen) return;

    console.error(e);
    body.innerHTML = `<div class="detail-error">⚠️ ${escapeHtml(t('detailLoadError'))}</div>`;
  }
}

/* ============================================================
   Совместимость и зависимости
   ============================================================ */

async function fetchCompatibleVersion(projectId, type = 'mod') {
  const params = {
    game_versions: [state.gameVersion]
  };

  if (type === 'mod' && state.loader) {
    params.loaders = [state.loader];
  }

  const versions = await mr(`/project/${projectId}/version`, params);

  if (!versions.length) return null;

  const version = versions[0];
  const file = version.files.find(f => f.primary) || version.files[0];

  return file ? { version, file } : null;
}

async function resolveAndAdd(projectId, ctx = {}) {
  const visited = ctx.visited || new Set();
  const planned = ctx.planned || new Set();
  const depth = ctx.depth || 0;
  const isDependency = ctx.isDependency || false;

  if (depth > 20) throw new Error(t('msgDeep'));
  if (isAdded(projectId) || visited.has(projectId)) {
    return { added: false, addedDeps: [] };
  }

  visited.add(projectId);
  planned.add(projectId);

  const info = await ensureProjectInfo(projectId);
  const type = normalizeType(ctx.type || info.type);

  const compatible = await fetchCompatibleVersion(projectId, type);

  if (!compatible) {
    const title = info.title || projectId;

    throw new Error(
      type === 'mod'
        ? t('msgNoVersionLoader', {
            t: title,
            v: state.gameVersion,
            l: getLoaderLabel()
          })
        : t('msgNoVersion', {
            t: title,
            v: state.gameVersion
          })
    );
  }

  const { version, file } = compatible;
  const deps = Array.isArray(version.dependencies) ? version.dependencies : [];

  const required = deps.filter(d => d.dependency_type === 'required' && d.project_id);
  const incompatible = deps.filter(d => d.dependency_type === 'incompatible' && d.project_id);

  const known = new Set([...state.cart.map(m => m.id), ...planned]);

  const conflicts = incompatible.filter(
    d => d.project_id !== projectId && known.has(d.project_id)
  );

  if (conflicts.length) {
    const title = info.title || projectId;
    const names = await Promise.all(conflicts.map(d => projectTitle(d.project_id)));

    throw new Error(t('msgIncompatibleWith', {
      t: title,
      n: [...new Set(names)].join(', ')
    }));
  }

  for (const mod of state.cart) {
    const declared = (mod.dependencies || []).find(
      d => d.dependency_type === 'incompatible' && d.project_id === projectId
    );

    if (declared) {
      const title = info.title || projectId;
      throw new Error(t('msgDeclaredIncompatible', {
        t: mod.title,
        n: title
      }));
    }
  }

  const addedDeps = [];

  for (const dep of required) {
    if (isAdded(dep.project_id) || visited.has(dep.project_id)) continue;

    try {
      const depInfo = await ensureProjectInfo(dep.project_id);
      const depType = normalizeType(depInfo.type);

      const result = await resolveAndAdd(dep.project_id, {
        visited,
        planned,
        depth: depth + 1,
        isDependency: true,
        type: depType
      });

      if (result.added) {
        addedDeps.push(result.title, ...result.addedDeps);
      }
    } catch (e) {
      const parent = info.title || projectId;
      throw new Error(t('msgDepFailed', {
        t: parent,
        m: e.message
      }));
    }
  }

  const title = info.title || projectId;

  state.cart.push({
    id: projectId,
    type,
    title,
    icon: info.icon || null,
    slug: info.slug || null,
    version: version.version_number,
    fileName: safeFileName(file.filename),
    fileUrl: file.url,
    size: file.size || 0,
    hashes: file.hashes || {},
    gameVersions: version.game_versions || [],
    loaders: (version.loaders || []).map(String).map(s => s.toLowerCase()),
    isDependency,
    dependencies: deps.map(d => ({
      project_id: d.project_id,
      dependency_type: d.dependency_type
    }))
  });

  return {
    added: true,
    title,
    addedDeps: [...new Set(addedDeps)]
  };
}

async function addToCart(projectId, type = null) {
  if (isAdded(projectId)) {
    showToast(t('msgAlready'), 'info');
    return;
  }

  try {
    const result = await resolveAndAdd(projectId, {
      visited: new Set(),
      planned: new Set([projectId]),
      type
    });

    renderCart();
    updateAddButtons();

    if (result.added) {
      showToast(t('msgAdded', { t: result.title }), 'success');

      if (result.addedDeps.length) {
        setTimeout(() => {
          showToast(t('msgDepsPulled', {
            d: result.addedDeps.join(', ')
          }), 'info');
        }, 700);
      }

      const detailBtn = document.querySelector('.detail-add-btn');

      if (detailBtn && detailOpen) {
        detailBtn.disabled = true;
        detailBtn.classList.add('added');
        detailBtn.textContent = t('inCart');
      }
    }
  } catch (e) {
    console.error(e);
    showToast(e.message || t('msgCantAdd'), 'error');
  }
}

function validateCart() {
  const errors = [];
  const warnings = [];

  const ids = new Set(state.cart.map(m => m.id));
  const missing = new Map();
  const conflicts = new Set();

  for (const mod of state.cart) {
    const type = normalizeType(mod.type);

    if (mod.gameVersions?.length && !mod.gameVersions.includes(state.gameVersion)) {
      errors.push(`«${mod.title}» ${t('errNoVersion', { v: state.gameVersion })}`);
    }

    if (
      type === 'mod' &&
      mod.loaders?.length &&
      !mod.loaders.includes(state.loader)
    ) {
      errors.push(`«${mod.title}» ${t('errNoLoader', { l: getLoaderLabel() })}`);
    }

    for (const dep of mod.dependencies || []) {
      if (!dep.project_id) continue;

      if (dep.dependency_type === 'required' && !ids.has(dep.project_id)) {
        if (!missing.has(dep.project_id)) missing.set(dep.project_id, []);
        missing.get(dep.project_id).push(mod.title);
      }

      if (dep.dependency_type === 'incompatible' && ids.has(dep.project_id)) {
        const other = state.cart.find(m => m.id === dep.project_id);

        conflicts.add(t('msgIncompatibleWith', {
          t: mod.title,
          n: other?.title || dep.project_id
        }));
      }
    }
  }

  for (const [projectId, neededBy] of missing) {
    const title = projects.get(projectId)?.title || projectId;

    errors.push(t('errMissingDep', {
      t: title,
      n: neededBy.join(', ')
    }));
  }

  conflicts.forEach(text => errors.push(text));

  const legacy = state.cart.filter(m => !m.dependencies || !m.gameVersions || !m.type);
  if (legacy.length) warnings.push(t('warnLegacy'));

  return {
    errors,
    warnings,
    missingIds: [...missing.keys()]
  };
}

function renderIssues(issues) {
  const box = $('chest-issues');
  if (!box) return;

  if (!state.cart.length) {
    box.hidden = true;
    box.innerHTML = '';
    return;
  }

  const blocks = [
    ...issues.errors.map(text => `<div class="issue error">⛔ ${escapeHtml(text)}</div>`),
    ...issues.warnings.map(text => `<div class="issue warning">⚠️ ${escapeHtml(text)}</div>`)
  ];

  if (!blocks.length) {
    blocks.push(`<div class="issue ok">${escapeHtml(t('issueOk'))}</div>`);
  }

  box.hidden = false;
  box.innerHTML = blocks.join('');
}

async function fixDependencies() {
  const issues = validateCart();

  if (!issues.missingIds.length) {
    showToast(t('msgDepsOk'), 'info');
    return;
  }

  const btn = $('fix-deps-btn');
  btn.disabled = true;
  btn.textContent = t('loading');

  let added = 0;

  for (const projectId of issues.missingIds) {
    try {
      const info = await ensureProjectInfo(projectId);

      const result = await resolveAndAdd(projectId, {
        visited: new Set(),
        planned: new Set([projectId]),
        isDependency: true,
        type: info.type
      });

      if (result.added) added++;
    } catch (e) {
      showToast(t('msgCantAddDep', { m: e.message }), 'error');
    }
  }

  btn.disabled = false;
  btn.textContent = t('fixDeps');

  renderCart();
  updateAddButtons();

  if (added) showToast(t('msgDepsAdded', { n: added }), 'success');
}

/* ============================================================
   Сундук
   ============================================================ */

function createChestItem(mod) {
  const item = document.createElement('div');
  item.className = 'chest-item' + (mod.isDependency ? ' dep' : '');

  const type = normalizeType(mod.type);
  const typeMeta = getTypeMeta(type);
  const pageUrl = projectPageUrl(type, mod.slug);

  item.innerHTML = `
    <div class="chest-item-left">
      <div class="chest-item-icon">
        ${mod.icon ? `<img src="${mod.icon}" alt="" loading="lazy">` : '📦'}
      </div>

      <div style="min-width:0; flex:1">
        <strong title="${escapeHtml(mod.title)}">${escapeHtml(mod.title)}</strong>
        <small>
          ${escapeHtml(mod.version)} · ${escapeHtml(t(typeMeta.short))}
          ${mod.isDependency ? ' ' + escapeHtml(t('depTag')) : ''}
        </small>
      </div>
    </div>

    <div class="chest-item-actions">
      ${pageUrl ? `
        <a class="chest-link"
           href="${pageUrl}"
           target="_blank"
           rel="noopener noreferrer"
           title="${escapeHtml(t('openModrinth'))}">
          ${EXTERNAL_ICON}
        </a>
      ` : ''}

      <button class="icon-btn" title="✕">✕</button>
    </div>
  `;

  item.querySelector('.icon-btn').addEventListener('click', () => {
    removeFromCart(mod.id);
  });

  return item;
}

function renderCart() {
  const list = $('chest-list');
  const empty = $('chest-empty');
  const summary = $('chest-summary');

  list.innerHTML = '';

  $('chest-count').textContent = state.cart.length;
  $('chest-count-top').textContent = state.cart.length;

  empty.hidden = state.cart.length > 0;

  const groups = PROJECT_TYPES
    .map(type => ({
      type,
      items: state.cart.filter(m => normalizeType(m.type) === type)
    }))
    .filter(g => g.items.length);

  for (const group of groups) {
    const groupEl = document.createElement('div');
    groupEl.className = 'chest-group';

    const head = document.createElement('div');
    head.className = 'chest-group-head';
    head.innerHTML = `
      <span>${escapeHtml(t(getTypeMeta(group.type).group))}</span>
      <span>${group.items.length}</span>
    `;

    const itemsBox = document.createElement('div');
    itemsBox.className = 'chest-group-items';

    for (const mod of group.items) {
      itemsBox.appendChild(createChestItem(mod));
    }

    groupEl.appendChild(head);
    groupEl.appendChild(itemsBox);
    list.appendChild(groupEl);
  }

  const issues = validateCart();
  renderIssues(issues);

  const totalSize = state.cart.reduce((sum, m) => sum + (m.size || 0), 0);

  summary.hidden = state.cart.length === 0;
  summary.innerHTML = `
    <span>${escapeHtml(t('summaryMods', { n: state.cart.length }))}</span>
    <span>${formatBytes(totalSize)}</span>
  `;

  $('fix-deps-btn').hidden = issues.missingIds.length === 0;
  $('clear-btn').hidden = state.cart.length === 0;
  $('download-btn').disabled = state.cart.length === 0 || issues.errors.length > 0;

  saveState();
}

function removeFromCart(projectId) {
  const removed = state.cart.find(m => m.id === projectId);
  state.cart = state.cart.filter(m => m.id !== projectId);

  renderCart();
  updateAddButtons();

  if (removed) showToast(t('msgRemoved', { t: removed.title }), 'info');
}

let clearArmed = false;
let clearTimer = null;

function handleClear() {
  const btn = $('clear-btn');

  if (!clearArmed) {
    clearArmed = true;
    btn.textContent = t('clearConfirm');

    clearTimeout(clearTimer);
    clearTimer = setTimeout(() => {
      clearArmed = false;
      btn.textContent = t('clear');
    }, 3000);

    return;
  }

  clearArmed = false;
  clearTimeout(clearTimer);
  btn.textContent = t('clear');

  state.cart = [];
  renderCart();
  updateAddButtons();

  showToast(t('msgChestEmpty'), 'info');
}

/* ============================================================
   Сборка ZIP
   ============================================================ */

async function downloadPack() {
  if (!state.cart.length) return;

  const issues = validateCart();

  if (issues.errors.length) {
    showToast(t('msgFixFirst'), 'error');
    renderCart();
    return;
  }

  const downloadBtn = $('download-btn');
  const fixBtn = $('fix-deps-btn');
  const clearBtn = $('clear-btn');
  const progressWrap = $('progress-wrap');
  const progressBar = $('progress-bar');
  const progressText = $('progress-text');

  downloadBtn.disabled = true;
  fixBtn.disabled = true;
  clearBtn.disabled = true;
  downloadBtn.textContent = t('msgDownloading');

  progressWrap.hidden = false;
  progressText.hidden = false;
  progressBar.style.width = '0%';

  const canVerify = window.isSecureContext && !!crypto?.subtle;
  const totalBytes = state.cart.reduce((s, m) => s + (m.size || 0), 0);

  let loadedBytes = 0;
  let done = 0;

  try {
    const zip = new JSZip();
    const folders = {};

    for (const mod of state.cart) {
      progressText.textContent = `${done + 1}/${state.cart.length} · ${mod.fileName}`;

      const res = await fetch(mod.fileUrl);
      if (!res.ok) {
        throw new Error(t('msgFileFailed', {
          f: mod.fileName,
          s: res.status
        }));
      }

      const buffer = await res.arrayBuffer();

      if (canVerify && mod.hashes?.sha1) {
        const digest = await sha1Hex(buffer);
        const expected = String(mod.hashes.sha1).toLowerCase();

        if (digest !== expected) {
          throw new Error(t('msgCorrupt', { f: mod.fileName }));
        }
      }

      const type = normalizeType(mod.type);
      const folderName = getTypeMeta(type).folder;

      if (!folders[folderName]) {
        folders[folderName] = zip.folder(folderName);
      }

      folders[folderName].file(safeFileName(mod.fileName), buffer);

      done++;
      loadedBytes += buffer.byteLength;

      const percent = totalBytes
        ? (loadedBytes / totalBytes) * 100
        : (done / state.cart.length) * 100;

      progressBar.style.width = `${Math.min(percent, 100)}%`;
    }

    downloadBtn.textContent = t('msgPackaging');
    progressText.textContent = t('msgPacking');

    const blob = await zip.generateAsync({
      type: 'blob',
      compression: 'STORE'
    });

    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = randomZipName();
    link.click();

    setTimeout(() => URL.revokeObjectURL(link.href), 1500);

    showToast(t('msgDone', {
      n: state.cart.length,
      s: formatBytes(blob.size)
    }), 'success');
  } catch (e) {
    console.error(e);
    showToast(t('msgBuildError', { m: e.message }), 'error');
  } finally {
    progressWrap.hidden = true;
    progressText.hidden = true;
    progressBar.style.width = '0%';

    downloadBtn.textContent = t('download');
    fixBtn.disabled = false;
    clearBtn.disabled = false;

    renderCart();
  }
}

/* ============================================================
   Настройки
   ============================================================ */

function openSettingsModal() {
  closeAllPickers();

  const modal = $('settings-modal');
  if (!modal) return;

  updateSettingsUI();
  modal.classList.add('show');
  settingsOpen = true;
  syncSettingsOverlay();
  syncBodyModal();
}

function closeSettingsModal() {
  const modal = $('settings-modal');
  if (!modal) return;

  modal.classList.remove('show');
  settingsOpen = false;
  syncSettingsOverlay();
  syncBodyModal();
}

function updateSettingsUI() {
  document.querySelectorAll('.settings-lang-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === state.lang);
  });

  const translateWrap = $('settings-translate');
  const translateCb = $('explore-translate');

  if (translateWrap) {
    translateWrap.classList.toggle('show', state.lang === 'ru');
  }

  if (translateCb) {
    translateCb.checked = state.translate;
  }

  document.querySelectorAll('.theme-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.theme === state.theme);
  });
}

/* ============================================================
   Сохранение состояния
   ============================================================ */

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      gameVersion: state.gameVersion,
      loader: state.loader,
      projectType: state.projectType,
      cart: state.cart,
      translate: state.translate,
      lang: state.lang,
      theme: state.theme
    }));
  } catch {
    /* ignore */
  }
}

function loadState() {
  try {
    let saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');

    if (!saved) {
      const legacy = JSON.parse(localStorage.getItem(LEGACY_STORAGE_KEY) || 'null');

      if (legacy) {
        saved = legacy;

        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
          localStorage.removeItem(LEGACY_STORAGE_KEY);
        } catch {
          /* ignore */
        }
      }
    }

    if (!saved) return;

    if (saved.gameVersion) state.gameVersion = saved.gameVersion;

    if (saved.loader) {
      state.loader = String(saved.loader).toLowerCase();
    }

    if (PROJECT_TYPES.includes(saved.projectType)) {
      state.projectType = saved.projectType;
    }

    if (typeof saved.translate === 'boolean') {
      state.translate = saved.translate;
    }

    if (saved.lang === 'en' || saved.lang === 'ru') {
      state.lang = saved.lang;
    }

    state.theme = normalizeTheme(saved.theme);

    if (Array.isArray(saved.cart)) {
      state.cart = saved.cart.map(m => ({
        ...m,
        type: normalizeType(m.type),
        loaders: Array.isArray(m.loaders)
          ? m.loaders.map(String).map(s => s.toLowerCase())
          : []
      }));
    }

    state.cart.forEach(m => {
      if (m.id && m.title) {
        projects.set(m.id, {
          title: m.title,
          icon: m.icon,
          slug: m.slug || null,
          type: normalizeType(m.type)
        });
      }
    });
  } catch {
    state.cart = [];
  }
}

/* ============================================================
   Применение локализации
   ============================================================ */

function applyI18n() {
  document.documentElement.lang = state.lang;

  document.querySelectorAll('[data-i18n]').forEach(el => {
    el.innerHTML = t(el.dataset.i18n);
  });

  document.querySelectorAll('[data-i18n-html]').forEach(el => {
    el.innerHTML = t(el.dataset.i18nHtml);
  });

  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    el.placeholder = t(el.dataset.i18nPlaceholder);
  });

  document.querySelectorAll('[data-i18n-title]').forEach(el => {
    el.title = t(el.dataset.i18nTitle);
  });

  document.querySelectorAll('[data-i18n-aria]').forEach(el => {
    el.setAttribute('aria-label', t(el.dataset.i18nAria));
  });

  updateProjectTypeButtons();

  if (state.lang !== 'ru' && state.translate) {
    state.translate = false;
  }

  if (sortPicker) sortPicker.setOptions(sortOptions(), true);

  rebuildCategoryOptions(true);

  if (versionPicker) versionPicker.refresh();
  if (loaderPicker) loaderPicker.refresh();

  pickerRegistry.forEach(p => p.refreshTitle?.());

  updateBuildContext();
  renderCart();
  updateAddButtons();
  updateExploreMeta();
  updateSettingsUI();

  requestAnimationFrame(updateLayoutMode);
}

/* ============================================================
   События
   ============================================================ */

$('explore-search-btn')?.addEventListener('click', () => searchExplore(true));

$('explore-search')?.addEventListener('keydown', e => {
  if (e.key === 'Enter') searchExplore(true);
});

$('explore-refresh')?.addEventListener('click', () => searchExplore(true));
$('explore-use-filters')?.addEventListener('change', () => searchExplore(true));
$('explore-load-more')?.addEventListener('click', () => searchExplore(false));

$('goto-explore-btn')?.addEventListener('click', () => setActiveTab('explore'));

$('download-btn')?.addEventListener('click', downloadPack);
$('fix-deps-btn')?.addEventListener('click', fixDependencies);
$('clear-btn')?.addEventListener('click', handleClear);

document.querySelectorAll('.type-btn').forEach(btn => {
  btn.addEventListener('click', () => setProjectType(btn.dataset.projectType));
});

$('overlay')?.addEventListener('click', () => {
  closeModDetail();
});

document.querySelector('#mod-detail .modal-close')?.addEventListener('click', () => {
  closeModDetail();
});

$('mod-detail')?.addEventListener('click', e => {
  if (e.target.id === 'mod-detail') {
    closeModDetail();
  }
});

$('settings-btn')?.addEventListener('click', openSettingsModal);
$('settings-close')?.addEventListener('click', closeSettingsModal);
$('settings-overlay')?.addEventListener('click', closeSettingsModal);

$('settings-modal')?.addEventListener('click', e => {
  if (e.target.id === 'settings-modal') {
    closeSettingsModal();
  }
});

document.querySelectorAll('.settings-lang-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    state.lang = btn.dataset.lang;

    if (state.lang !== 'ru') {
      state.translate = false;
    }

    saveState();
    applyI18n();

    if (explore.loaded) rerenderExploreResults();
  });
});

$('explore-translate')?.addEventListener('change', e => {
  state.translate = e.target.checked;
  saveState();
  rerenderExploreResults();
});

document.querySelectorAll('.theme-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    state.theme = normalizeTheme(btn.dataset.theme);
    saveState();
    applyTheme();
    updateSettingsUI();
  });
});

/* ============================================================
   Старт
   ============================================================ */

loadState();
applyTheme();

renderCart();
updateBuildContext();

initTabs();
initExplorePickers();
initExploreCategories();

applyI18n();
initLayoutWatcher();

initFilters()
  .catch(e => {
    console.error(e);
    showToast(t('msgInitError'), 'error');
  })
  .finally(() => {
    requestAnimationFrame(updateLayoutMode);
  });