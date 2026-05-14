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
 * ▶ 미저장 경고 사용법 (각 HTML 페이지에서)
 *   - 내용 변경 시  : NaviComponent.setDirty(true);
 *   - 저장 완료 후  : NaviComponent.setDirty(false);
 *
 * ▶ 주의
 *   - 각 페이지의 기존 네임스페이스(SuselNS 등) 코드는 전혀 수정하지 않아도 됩니다.
 *   - activePage 에 해당하는 버튼은 자동으로 "현재 페이지" 스타일로 강조됩니다.
 *   - onSave / onLogout 을 넘기지 않으면 버튼이 보이지 않습니다.
 * ================================================================
 */

var NaviComponent = (function () {
  'use strict';

  /* ── 기본 GitHub URL : init() 호출 시점에 Config에서 지연 평가 ── */

  /* ── 네비게이션 메뉴 정의 ── */
  var NAV_ITEMS = [
    { key: 'schedule',   label: '일정',        color: 'blue' },
    { key: 'suneung',    label: '수능과목선택', color: 'blue' },
    { key: 'university', label: '관심대학',     color: 'blue' },
    { key: 'record',     label: '생기부 기초자료', color: 'blue' },
    { key: 'class',      label: '수업자료',     color: 'blue' }
  ];

  /* ── 교과별메뉴 권한에서 보이는 메뉴 키 목록 ── */
  var NAV_ITEMS_SUBJECT = ['class'];

  /* ── 페이지 URL 맵 ── */
  var PAGE_FILES = {
    schedule  : 'firstpage.html',
    suneung   : 'susel.html',
    university: 'univer.html',
    record    : 'record.html',
    class     : 'class.html'
  };

  /* ── 언더라인 색상 맵 (활성/비활성 hover용) ── */
  var UNDERLINE_COLOR = {
    blue  : '#3b82f6',
    green : '#22c55e',
    purple: '#a855f7'
  };

  /* ── 활성 텍스트 색상 맵 ── */
  var ACTIVE_TEXT_COLOR = {
    blue  : '#2563eb',
    green : '#16a34a',
    purple: '#9333ea'
  };

  /* ── 현재 설정값 ── */
  var _cfg = {};

  /* ── 미저장 상태 플래그 ── */
  var _isDirty = false;

  /* ── 공통 스타일 주입 (한 번만) ── */
  var _styleInjected = false;
  function _injectStyle() {
    if (_styleInjected) return;
    _styleInjected = true;
    var style = document.createElement('style');
    style.textContent = [
      '.navi-btn {',
      '  position: relative;',
      '  background: none;',
      '  border: none;',
      '  outline: none;',
      '  cursor: pointer;',
      '  padding: 6px 2px 4px;',
      '  font-size: 0.8rem;',
      '  font-weight: 500;',
      '  color: #6b7280;',
      '  letter-spacing: 0.01em;',
      '  transition: color 0.2s;',
      '}',
      '@media (min-width: 640px) {',
      '  .navi-btn { font-size: 0.875rem; padding: 6px 4px 4px; }',
      '}',
      '.navi-btn::after {',
      '  content: "";',
      '  position: absolute;',
      '  left: 0;',
      '  bottom: 0;',
      '  width: 100%;',
      '  height: 2px;',
      '  border-radius: 1px;',
      '  transform: scaleX(0);',
      '  transform-origin: left center;',
      '  transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);',
      '}',
      '.navi-btn:hover::after, .navi-btn.navi-active::after {',
      '  transform: scaleX(1);',
      '}',
      '.navi-btn-blue::after  { background: #3b82f6; }',
      '.navi-btn-green::after { background: #22c55e; }',
      '.navi-btn-purple::after{ background: #a855f7; }',
      '.navi-btn-blue:hover,  .navi-btn-blue.navi-active  { color: #2563eb; }',
      '.navi-btn-green:hover, .navi-btn-green.navi-active { color: #16a34a; }',
      '.navi-btn-purple:hover,.navi-btn-purple.navi-active{ color: #9333ea; }',
      '.navi-btn-action {',
      '  position: relative;',
      '  background: none;',
      '  border: none;',
      '  outline: none;',
      '  cursor: pointer;',
      '  padding: 6px 2px 4px;',
      '  font-size: 0.75rem;',
      '  font-weight: 500;',
      '  color: #6b7280;',
      '  letter-spacing: 0.01em;',
      '  transition: color 0.2s;',
      '}',
      '@media (min-width: 640px) {',
      '  .navi-btn-action { font-size: 0.8rem; }',
      '}',
      '.navi-btn-action::after {',
      '  content: "";',
      '  position: absolute;',
      '  left: 0;',
      '  bottom: 0;',
      '  width: 100%;',
      '  height: 2px;',
      '  border-radius: 1px;',
      '  transform: scaleX(0);',
      '  transform-origin: left center;',
      '  transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);',
      '}',
      '.navi-btn-action:hover::after { transform: scaleX(1); }',
      '.navi-btn-save::after  { background: #3b82f6; }',
      '.navi-btn-logout::after{ background: #ef4444; }',
      '.navi-btn-save:hover   { color: #2563eb; }',
      '.navi-btn-logout:hover { color: #dc2626; }'
    ].join('\n');
    document.head.appendChild(style);
  }

  /* ════════════════════════════════════════════════════════════════
     공개 API: init
     ════════════════════════════════════════════════════════════════ */
  function init(options) {
    options = options || {};
    var defaultGithub = (typeof Config !== 'undefined' && Config.GITHUB)
      ? Config.GITHUB
      : '';
    if (!defaultGithub) {
      console.error('[NaviComponent] 잘못된 주소를 참조했습니다.');
    }
    _cfg = {
      activePage   : options.activePage   || '',
      userName     : options.userName     || '',
      studentId    : options.studentId    || '',
      githubUrl    : options.githubUrl    || defaultGithub,
      menuAuth     : options.menuAuth     || '모든메뉴',
      onSave       : options.onSave       || null,
      onLogout     : options.onLogout     || null,
      classEnabled : (options.classEnabled !== false) // 기본 true, 명시적 false 시 비활성
    };

    // classEnabled 가 결정되지 않은 경우(undefined) → API로 자동 확인
    if (options.classEnabled === undefined && options.studentId && options.userName) {
      _checkClassEnabled(options.studentId, options.userName);
    }

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

  /* ── 수업자료 버튼 활성화 여부 자동 확인 ── */
  function _checkClassEnabled(studentId, studentName) {
    var deploy = (typeof Config !== 'undefined' && Config.DEPLOY) ? Config.DEPLOY : '';
    if (!deploy) return;

    var qs = 'action=classGetCourses'
      + '&studentId='   + encodeURIComponent(studentId)
      + '&studentName=' + encodeURIComponent(studentName);

    fetch(deploy + '?' + qs)
      .then(function(r) { return r.json(); })
      .then(function(res) {
        var hasClass = res.success && res.data && res.data.length > 0;
        _cfg.classEnabled = hasClass;
        // 버튼 DOM 갱신
        var btn = document.querySelector('[data-navkey="class"]');
        if (btn) {
          if (!hasClass) {
            btn.disabled = true;
            btn.style.opacity    = '0.35';
            btn.style.cursor     = 'not-allowed';
            btn.title = '수강 중인 과목이 없습니다.';
          } else {
            btn.disabled = false;
            btn.style.opacity = '';
            btn.style.cursor  = '';
            btn.title = '';
          }
        }
      })
      .catch(function() { /* 오류 시 기본값(활성) 유지 */ });
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

    _injectStyle();

    /* ── 버튼 HTML 생성 ── */
    var visibleItems = (_cfg.menuAuth === '교과별메뉴')
      ? NAV_ITEMS.filter(function(item) { return NAV_ITEMS_SUBJECT.indexOf(item.key) >= 0; })
      : NAV_ITEMS;

    var btnHTML = visibleItems.map(function (item) {
      var isActive  = (item.key === _cfg.activePage);
      var isDisabled = (item.key === 'class' && !_cfg.classEnabled);
      var activeClass = isActive ? ' navi-active' : '';
      var disabledAttr = isDisabled
        ? ' disabled style="opacity:0.35;cursor:not-allowed;" title="수강 중인 과목이 없습니다."'
        : '';

      return '<button'
        + ' onclick="NaviComponent._onNavClick(\'' + item.key + '\')"'
        + ' class="navi-btn navi-btn-' + item.color + activeClass + '"'
        + ' data-navkey="' + item.key + '"'
        + disabledAttr
        + '>'
        + item.label
        + '</button>';
    }).join('\n          ');

    /* ── 우측 버튼 HTML ── */
    var saveHTML = _cfg.onSave
      ? '<button onclick="NaviComponent._onSave()"'
      +   ' class="navi-btn-action navi-btn-save">'
      +   '💾 저장'
      + '</button>'
      : '';

    var logoutHTML = _cfg.onLogout
      ? '<button onclick="NaviComponent._onLogout()"'
      +   ' class="navi-btn-action navi-btn-logout">'
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

  /* ── 페이지 이동 실행 (dirty 확인 후 호출) ── */
  function _doNavTo(pageKey) {
    var params = new URLSearchParams({
      studentId : _cfg.studentId,
      name      : _cfg.userName,
      menuAuth  : _cfg.menuAuth
    });
    var fileName = PAGE_FILES[pageKey];
    if (fileName) {
      window.location.href = _cfg.githubUrl + fileName + '?' + params.toString();
    }
  }

  function _onNavClick(pageKey) {
    if (pageKey === _cfg.activePage) return; // 현재 페이지면 무시
    if (pageKey === 'class' && !_cfg.classEnabled) return; // 비활성화 상태면 무시
    if (_isDirty) {
      _showConfirm(function() { _doNavTo(pageKey); });
      return;
    }
    _doNavTo(pageKey);
  }

  function _onSave() {
    if (typeof _cfg.onSave === 'function') _cfg.onSave();
  }

  function _onLogout() {
    if (_isDirty) {
      _showConfirm(function() {
        if (typeof _cfg.onLogout === 'function') _cfg.onLogout();
      });
      return;
    }
    if (typeof _cfg.onLogout === 'function') _cfg.onLogout();
  }

  /* ════════════════════════════════════════════════════════════════
     미저장 확인 모달 (공통)
     ════════════════════════════════════════════════════════════════ */
  function _injectConfirmStyle() {
    if (document.getElementById('navi-confirm-style')) return;
    var style = document.createElement('style');
    style.id = 'navi-confirm-style';
    style.textContent = [
      '#navi-confirm-overlay {',
      '  display: none;',
      '  position: fixed;',
      '  inset: 0;',
      '  background: rgba(0,0,0,0.45);',
      '  z-index: 99999;',
      '  align-items: center;',
      '  justify-content: center;',
      '}',
      '#navi-confirm-overlay.navi-confirm-show { display: flex; }',
      '.navi-confirm-box {',
      '  background: #ffffff;',
      '  border-radius: 1rem;',
      '  padding: 2rem 1.75rem 1.5rem;',
      '  max-width: 360px;',
      '  width: 90%;',
      '  box-shadow: 0 8px 40px rgba(0,0,0,0.18);',
      '  text-align: center;',
      '}',
      '.navi-confirm-icon { font-size: 2rem; margin-bottom: 0.75rem; }',
      '.navi-confirm-title {',
      '  font-size: 1rem;',
      '  font-weight: 700;',
      '  color: #1f2937;',
      '  margin-bottom: 0.5rem;',
      '}',
      '.navi-confirm-desc {',
      '  font-size: 0.85rem;',
      '  color: #6b7280;',
      '  margin-bottom: 1.5rem;',
      '  line-height: 1.6;',
      '}',
      '.navi-confirm-btns { display: flex; gap: 0.75rem; justify-content: center; }',
      '.navi-confirm-btn-leave {',
      '  flex: 1; padding: 0.6rem 0; border-radius: 0.5rem;',
      '  border: 1px solid #e5e7eb; background: #f9fafb;',
      '  color: #6b7280; font-size: 0.875rem; font-weight: 600;',
      '  cursor: pointer; transition: background 0.15s;',
      '}',
      '.navi-confirm-btn-leave:hover { background: #f3f4f6; }',
      '.navi-confirm-btn-stay {',
      '  flex: 1; padding: 0.6rem 0; border-radius: 0.5rem;',
      '  border: none; background: #2563eb;',
      '  color: #ffffff; font-size: 0.875rem; font-weight: 600;',
      '  cursor: pointer; transition: background 0.15s;',
      '}',
      '.navi-confirm-btn-stay:hover { background: #1d4ed8; }'
    ].join('\n');
    document.head.appendChild(style);
  }

  function _ensureConfirmModal() {
    _injectConfirmStyle();
    if (document.getElementById('navi-confirm-overlay')) return;
    var div = document.createElement('div');
    div.id = 'navi-confirm-overlay';
    div.innerHTML = [
      '<div class="navi-confirm-box">',
      '  <div class="navi-confirm-icon">💾</div>',
      '  <div class="navi-confirm-title">저장하지 않은 내용이 있습니다</div>',
      '  <div class="navi-confirm-desc">이 페이지를 떠나면 작성한 내용이<br>사라집니다. 정말 이동하시겠습니까?</div>',
      '  <div class="navi-confirm-btns">',
      '    <button class="navi-confirm-btn-leave" id="navi-confirm-leave">저장 안 하고 이동</button>',
      '    <button class="navi-confirm-btn-stay" id="navi-confirm-stay">계속 작성하기</button>',
      '  </div>',
      '</div>'
    ].join('');
    document.body.appendChild(div);
  }

  function _showConfirm(onLeave) {
    _ensureConfirmModal();
    var overlay = document.getElementById('navi-confirm-overlay');
    overlay.classList.add('navi-confirm-show');
    document.getElementById('navi-confirm-stay').onclick = function() {
      overlay.classList.remove('navi-confirm-show');
    };
    document.getElementById('navi-confirm-leave').onclick = function() {
      overlay.classList.remove('navi-confirm-show');
      _isDirty = false;
      onLeave();
    };
  }

  /* ════════════════════════════════════════════════════════════════
     확장 공개 API: showAlert / showConfirmDialog / showLoading(msg) / 버튼 잠금
     — 기존 코드는 일절 수정하지 않고, 아래에 새 함수만 추가합니다.
     ════════════════════════════════════════════════════════════════ */

  /* ── Alert 전용 스타일 (한 번만 주입) ── */
  function _injectAlertStyle() {
    if (document.getElementById('navi-alert-style')) return;
    var style = document.createElement('style');
    style.id = 'navi-alert-style';
    style.textContent = [
      '#navi-alert-overlay {',
      '  display: none;',
      '  position: fixed;',
      '  inset: 0;',
      '  background: rgba(0,0,0,0.45);',
      '  z-index: 100000;',
      '  align-items: center;',
      '  justify-content: center;',
      '}',
      '#navi-alert-overlay.navi-alert-show { display: flex; }',
      '.navi-alert-box {',
      '  background: #ffffff;',
      '  border-radius: 1rem;',
      '  padding: 2rem 1.75rem 1.5rem;',
      '  max-width: 360px;',
      '  width: 90%;',
      '  box-shadow: 0 8px 40px rgba(0,0,0,0.18);',
      '  text-align: center;',
      '}',
      '.navi-alert-icon { font-size: 2rem; margin-bottom: 0.75rem; }',
      '.navi-alert-title {',
      '  font-size: 1rem;',
      '  font-weight: 700;',
      '  color: #1f2937;',
      '  margin-bottom: 0.5rem;',
      '  white-space: pre-line;',
      '}',
      '.navi-alert-btn {',
      '  margin-top: 1.25rem;',
      '  padding: 0.6rem 2rem;',
      '  border-radius: 0.5rem;',
      '  border: none;',
      '  background: #2563eb;',
      '  color: #ffffff;',
      '  font-size: 0.875rem;',
      '  font-weight: 600;',
      '  cursor: pointer;',
      '  transition: background 0.15s;',
      '}',
      '.navi-alert-btn:hover { background: #1d4ed8; }'
    ].join('\n');
    document.head.appendChild(style);
  }

  function _ensureAlertModal() {
    _injectAlertStyle();
    if (document.getElementById('navi-alert-overlay')) return;
    var div = document.createElement('div');
    div.id = 'navi-alert-overlay';
    div.innerHTML = [
      '<div class="navi-alert-box">',
      '  <div class="navi-alert-icon" id="navi-alert-icon">ℹ️</div>',
      '  <div class="navi-alert-title" id="navi-alert-title"></div>',
      '  <button class="navi-alert-btn" id="navi-alert-ok">확인</button>',
      '</div>'
    ].join('');
    document.body.appendChild(div);
  }

  /**
   * showAlert(message, options)
   * options.icon   : 이모지 (기본 'ℹ️', 오류는 '❌', 성공은 '✅')
   * options.onClose: 확인 후 콜백 (선택)
   */
  function showAlert(message, options) {
    options = options || {};
    _ensureAlertModal();
    var overlay  = document.getElementById('navi-alert-overlay');
    var titleEl  = document.getElementById('navi-alert-title');
    var iconEl   = document.getElementById('navi-alert-icon');
    var okBtn    = document.getElementById('navi-alert-ok');
    if (iconEl)  iconEl.textContent  = options.icon || 'ℹ️';
    if (titleEl) titleEl.textContent = message || '';
    overlay.classList.add('navi-alert-show');
    okBtn.onclick = function() {
      overlay.classList.remove('navi-alert-show');
      if (typeof options.onClose === 'function') options.onClose();
    };
  }

  /**
   * showConfirmDialog(message, onConfirm, options)
   * — navi-confirm-overlay DOM을 재활용하되 텍스트만 동적으로 교체합니다.
   * — 기존 _showConfirm(onLeave) 호출부는 그대로 작동합니다.
   * options.icon       : 이모지 (기본 '⚠️')
   * options.confirmText: 확인 버튼 텍스트 (기본 '확인')
   * options.cancelText : 취소 버튼 텍스트 (기본 '취소')
   */
  function showConfirmDialog(message, onConfirm, options) {
    options = options || {};
    _ensureConfirmModal();
    var overlay   = document.getElementById('navi-confirm-overlay');
    var iconEl    = overlay.querySelector('.navi-confirm-icon');
    var titleEl   = overlay.querySelector('.navi-confirm-title');
    var descEl    = overlay.querySelector('.navi-confirm-desc');
    var leaveBtn  = document.getElementById('navi-confirm-leave');
    var stayBtn   = document.getElementById('navi-confirm-stay');

    /* 텍스트 교체 */
    if (iconEl)   iconEl.textContent   = options.icon || '⚠️';
    if (titleEl)  titleEl.textContent  = message || '확인하시겠습니까?';
    if (descEl)   descEl.textContent   = '';   // 부가 설명 없음
    if (leaveBtn) leaveBtn.textContent = options.confirmText || '확인';
    if (stayBtn)  stayBtn.textContent  = options.cancelText  || '취소';

    overlay.classList.add('navi-confirm-show');

    stayBtn.onclick = function() {
      overlay.classList.remove('navi-confirm-show');
      _restoreConfirmModal(); /* 원래 텍스트 복원 */
    };
    leaveBtn.onclick = function() {
      overlay.classList.remove('navi-confirm-show');
      _restoreConfirmModal(); /* 원래 텍스트 복원 */
      if (typeof onConfirm === 'function') onConfirm();
    };
  }

  /* 기존 _showConfirm이 다시 쓸 수 있도록 고정 텍스트를 복원 */
  function _restoreConfirmModal() {
    var overlay  = document.getElementById('navi-confirm-overlay');
    if (!overlay) return;
    var iconEl   = overlay.querySelector('.navi-confirm-icon');
    var titleEl  = overlay.querySelector('.navi-confirm-title');
    var descEl   = overlay.querySelector('.navi-confirm-desc');
    var leaveBtn = document.getElementById('navi-confirm-leave');
    var stayBtn  = document.getElementById('navi-confirm-stay');
    if (iconEl)   iconEl.textContent   = '💾';
    if (titleEl)  titleEl.textContent  = '저장하지 않은 내용이 있습니다';
    if (descEl)   descEl.innerHTML     = '이 페이지를 떠나면 작성한 내용이<br>사라집니다. 정말 이동하시겠습니까?';
    if (leaveBtn) leaveBtn.textContent = '저장 안 하고 이동';
    if (stayBtn)  stayBtn.textContent  = '계속 작성하기';
  }

  /**
   * showLoading(message) — 기존 showLoading()을 확장
   * 메시지를 인수로 받아 로딩 텍스트를 동적으로 변경합니다.
   * 인수 없이 호출하면 기존과 동일하게 동작합니다.
   */
  function showLoadingMsg(message) {
    _injectSpinnerStyle();
    _ensureOverlay();
    var textEl = document.querySelector('#navi-loading-overlay .navi-loading-text');
    if (textEl && message) textEl.innerHTML = message + '<br>잠시만 기다려주세요.';
    else if (textEl)       textEl.innerHTML = '처리 중입니다.<br>잠시만 기다려주세요.';
    document.getElementById('navi-loading-overlay').classList.add('navi-loading-show');
  }

  /**
   * hideLoadingWithMsg(successMessage) — 로딩 숨기고 완료 알림
   * successMessage 가 있으면 showAlert로 완료 메시지를 표시합니다.
   */
  function hideLoadingWithMsg(successMessage, onClose) {
    hideLoading();
    if (successMessage) {
      showAlert(successMessage, { icon: '✅', onClose: onClose });
    } else if (typeof onClose === 'function') {
      onClose();
    }
  }

  /**
   * lockButtons() / unlockButtons()
   * 페이지 내 모든 button 요소를 일괄 비활성화/활성화합니다.
   * 이미 disabled 였던 버튼은 unlock 시 건드리지 않습니다.
   */
  function lockButtons() {
    var btns = document.querySelectorAll('button');
    btns.forEach(function(btn) {
      if (!btn.disabled) {
        btn.setAttribute('data-navi-lock', '1');
        btn.disabled = true;
      }
    });
  }

  function unlockButtons() {
    var btns = document.querySelectorAll('button[data-navi-lock="1"]');
    btns.forEach(function(btn) {
      btn.disabled = false;
      btn.removeAttribute('data-navi-lock');
    });
  }

  /* ════════════════════════════════════════════════════════════════
     로딩 스피너 (공통)
     ════════════════════════════════════════════════════════════════ */
  function _injectSpinnerStyle() {
    if (document.getElementById('navi-spinner-style')) return;
    var style = document.createElement('style');
    style.id = 'navi-spinner-style';
    style.textContent = [
      '#navi-loading-overlay {',
      '  display: none;',
      '  position: fixed;',
      '  inset: 0;',
      '  background: rgba(0,0,0,0.35);',
      '  z-index: 99999;',
      '  align-items: center;',
      '  justify-content: center;',
      '}',
      '#navi-loading-overlay.navi-loading-show {',
      '  display: flex;',
      '}',
      '.navi-spinner {',
      '  width: 52px;',
      '  height: 52px;',
      '  border: 5px solid #e5e7eb;',
      '  border-top-color: #3b82f6;',
      '  border-radius: 50%;',
      '  animation: navi-spin 0.75s linear infinite;',
      '}',
      '.navi-loading-box {',
      '  display: flex;',
      '  flex-direction: column;',
      '  align-items: center;',
      '  gap: 16px;',
      '}',
      '.navi-loading-text {',
      '  color: #ffffff;',
      '  font-size: 0.95rem;',
      '  font-weight: 500;',
      '  letter-spacing: 0.03em;',
      '  animation: navi-pulse-text 1.4s ease-in-out infinite;',
      '}',
      '@keyframes navi-pulse-text {',
      '  0%, 100% { opacity: 1; }',
      '  50%       { opacity: 0.35; }',
      '}',
      '@keyframes navi-spin {',
      '  to { transform: rotate(360deg); }',
      '}'
    ].join('\n');
    document.head.appendChild(style);
  }

  function _ensureOverlay() {
    if (document.getElementById('navi-loading-overlay')) return;
    var div = document.createElement('div');
    div.id = 'navi-loading-overlay';
    div.innerHTML = '<div class="navi-loading-box"><div class="navi-spinner"></div><p class="navi-loading-text">저장 중입니다.<br>잠시만 기다려주세요.</p></div>';
    document.body.appendChild(div);
  }

  function showLoading() {
    _injectSpinnerStyle();
    _ensureOverlay();
    document.getElementById('navi-loading-overlay').classList.add('navi-loading-show');
  }

  function hideLoading() {
    var el = document.getElementById('navi-loading-overlay');
    if (el) el.classList.remove('navi-loading-show');
  }

  /* ════════════════════════════════════════════════════════════════
     공개 API
     ════════════════════════════════════════════════════════════════ */
  return {
    init        : init,
    update      : update,
    /* 내부 핸들러 (onclick 에서 호출됨) */
    _onNavClick : _onNavClick,
    _onSave     : _onSave,
    _onLogout   : _onLogout,
    /* 로딩 스피너 (기존) */
    showLoading : showLoading,
    hideLoading : hideLoading,
    /* 미저장 상태 관리 */
    setDirty    : function(val) { _isDirty = !!val; },
    getDirty    : function() { return _isDirty; },
    showConfirm : _showConfirm,
    /* ── 확장 공개 API (방법 A 추가분) ── */
    showAlert           : showAlert,
    showConfirmDialog   : showConfirmDialog,
    showLoadingMsg      : showLoadingMsg,
    hideLoadingWithMsg  : hideLoadingWithMsg,
    lockButtons         : lockButtons,
    unlockButtons       : unlockButtons
  };

})();
