/**
 * ================================================================
 * navi.js  ─  공통 네비게이션 컴포넌트
 * ================================================================
 *
 * ▶ 역할
 *   id="shared-nav" 인 요소에 공통 <nav> 를 동적으로 주입합니다.
 *   각 페이지 JS 에서 NaviComponent.init({...}) 을 호출하면 됩니다.
 *
 * ▶ 사용법
 *   <head> 안:
 *     <script src="navi.js"></script>
 *
 *   <body> 맨 앞:
 *     <div id="shared-nav"></div>
 *
 *   페이지 초기화 시:
 *     NaviComponent.init({
 *       activePage : 'suneung',   // 'schedule'|'suneung'|'university'|'record'
 *       userName   : '홍길동',    // 표시할 이름 (없으면 빈 문자열)
 *       studentId  : 'S001',      // URL 파라미터 전달용 (없으면 빈 문자열)
 *       githubUrl  : 'https://blueskyfre.github.io/chphed.github.io', // 선택: 기본값 내장
 *       onSave     : function() { MyNS.doSave(); },     // 저장 버튼 핸들러
 *       onLogout   : function() { MyNS.doLogout(); },   // 로그아웃 핸들러
 *     });
 *
 * ▶ 주의
 *   - 각 페이지의 기존 네임스페이스(SuselNS 등) 코드는 전혀 수정하지 않아도 됩니다.
 *   - activePage 에 해당하는 버튼은 자동으로 "현재 페이지" 스타일로 강조됩니다.
 *   - onSave / onLogout 을 넘기지 않으면 버튼이 보이지 않습니다.
 * ================================================================
 */

var NaviComponent = (function () {
  'use strict';

  /* ── 기본 GitHub URL (각 페이지에서 덮어쓸 수 있음) ── */
  var DEFAULT_GITHUB_URL = 'https://blueskyfre.github.io/chphed.github.io';

  /* ── 네비게이션 메뉴 정의 ── */
  var NAV_ITEMS = [
    { key: 'schedule',   label: '일정',        color: 'blue' },
    { key: 'suneung',    label: '수능과목선택', color: 'blue' },
    { key: 'university', label: '관심대학',     color: 'green' },
    { key: 'record',     label: '생기부 기초자료', color: 'purple' }
  ];

  /* ── 페이지 URL 맵 ── */
  var PAGE_FILES = {
    schedule  : 'firstpage.html',
    suneung   : 'susel.html',
    university: 'univer.html',
    record    : 'record.html'
  };

  /* ── 색상 클래스 맵 ── */
  var COLOR_INACTIVE = {
    blue  : 'bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200',
    green : 'bg-green-50 hover:bg-green-100 text-green-700 border-green-200',
    purple: 'bg-purple-50 hover:bg-purple-100 text-purple-700 border-purple-200'
  };
  var COLOR_ACTIVE = {
    blue  : 'bg-blue-500 text-white border-blue-500 shadow',
    green : 'bg-green-500 text-white border-green-500 shadow',
    purple: 'bg-purple-500 text-white border-purple-500 shadow'
  };

  /* ── 현재 설정값 ── */
  var _cfg = {};

  /* ════════════════════════════════════════════════════════════════
     공개 API: init
     ════════════════════════════════════════════════════════════════ */
  function init(options) {
    options   = options || {};
    _cfg = {
      activePage : options.activePage  || '',
      userName   : options.userName    || '',
      studentId  : options.studentId   || '',
      githubUrl  : options.githubUrl   || DEFAULT_GITHUB_URL,
      onSave     : options.onSave      || null,
      onLogout   : options.onLogout    || null
    };

    _render();
  }

  /* ── 사용자 정보 / 핸들러 업데이트 (페이지 JS 초기화 후 호출 가능) ── */
  function update(options) {
    options = options || {};
    if (options.userName  !== undefined) _cfg.userName  = options.userName;
    if (options.studentId !== undefined) _cfg.studentId = options.studentId;
    if (options.onSave    !== undefined) _cfg.onSave    = options.onSave;
    if (options.onLogout  !== undefined) _cfg.onLogout  = options.onLogout;

    /* 사용자 이름 표시 갱신 */
    var nameEl = document.getElementById('nav-user-info');
    if (nameEl) {
      nameEl.textContent = _cfg.userName ? (_cfg.userName + ' 학생') : '';
    }
  }

  /* ════════════════════════════════════════════════════════════════
     내부: 네비게이션 HTML 생성 및 주입
     ════════════════════════════════════════════════════════════════ */
  function _render() {
    var container = document.getElementById('shared-nav');
    if (!container) {
      console.warn('[NaviComponent] id="shared-nav" 요소를 찾을 수 없습니다.');
      return;
    }

    /* ── 버튼 HTML 생성 ── */
    var btnHTML = NAV_ITEMS.map(function (item) {
      var isActive = (item.key === _cfg.activePage);
      var colorCls = isActive
        ? (COLOR_ACTIVE[item.color]   || COLOR_ACTIVE.blue)
        : (COLOR_INACTIVE[item.color] || COLOR_INACTIVE.blue);

      return '<button'
        + ' onclick="NaviComponent._onNavClick(\'' + item.key + '\')"'
        + ' class="font-medium px-2 py-1.5 sm:px-4 sm:py-2 rounded-lg transition text-xs sm:text-sm border ' + colorCls + '"'
        + '>'
        + item.label
        + '</button>';
    }).join('\n          ');

    /* ── 우측 버튼 HTML ── */
    var saveHTML = _cfg.onSave
      ? '<button onclick="NaviComponent._onSave()"'
      +   ' class="bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm px-2 py-1.5 sm:px-3 sm:py-2 rounded-lg transition border border-blue-600 font-medium">'
      +   '💾 저장'
      + '</button>'
      : '';

    var logoutHTML = _cfg.onLogout
      ? '<button onclick="NaviComponent._onLogout()"'
      +   ' class="bg-red-50 hover:bg-red-100 text-red-600 text-xs sm:text-sm px-2 py-1.5 sm:px-3 sm:py-2 rounded-lg transition border border-red-200">'
      +   '로그아웃'
      + '</button>'
      : '';

    var userName = _cfg.userName ? (_cfg.userName + ' 학생') : '';

    /* ── 최종 nav HTML ── */
    container.innerHTML =
      '<nav class="bg-white shadow-sm sticky top-0 z-50">'
    + '  <div class="max-w-6xl mx-auto px-4 py-3">'
    + '    <div class="flex items-center justify-between">'

    /* 좌측: 메뉴 버튼 */
    + '      <div class="flex items-center gap-1 sm:gap-2 flex-wrap">'
    +          btnHTML
    + '      </div>'

    /* 우측: 사용자 + 저장 + 로그아웃 */
    + '      <div class="flex items-center gap-2 sm:gap-3">'
    + '        <span id="nav-user-info" class="text-xs sm:text-sm text-gray-600 font-medium">' + userName + '</span>'
    +          saveHTML
    +          logoutHTML
    + '      </div>'

    + '    </div>'
    + '  </div>'
    + '</nav>';
  }

  /* ════════════════════════════════════════════════════════════════
     내부: 이벤트 핸들러
     (onclick 에서 직접 참조하므로 반드시 공개(return) 해야 함)
     ════════════════════════════════════════════════════════════════ */
  function _onNavClick(pageKey) {
    if (pageKey === _cfg.activePage) return; // 현재 페이지면 무시

    var params = new URLSearchParams({
      studentId : _cfg.studentId,
      name      : _cfg.userName
    });
    var fileName = PAGE_FILES[pageKey];
    if (fileName) {
      window.location.href = _cfg.githubUrl + '/' + fileName + '?' + params.toString();
    }
  }

  function _onSave() {
    if (typeof _cfg.onSave === 'function') _cfg.onSave();
  }

  function _onLogout() {
    if (typeof _cfg.onLogout === 'function') _cfg.onLogout();
  }

  /* ════════════════════════════════════════════════════════════════
     공개 API
     ════════════════════════════════════════════════════════════════ */
  return {
    init       : init,
    update     : update,
    /* 내부 핸들러 (onclick 에서 호출됨) */
    _onNavClick: _onNavClick,
    _onSave    : _onSave,
    _onLogout  : _onLogout
  };

})();
