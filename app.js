(function () {
  function formatKRW(num) {
    return '₩' + Number(num).toLocaleString('ko-KR');
  }

  // 1. Render 90-day segmented progress bar (63 elapsed: 62 completed in FinTech Emerald-Teal gradient, last elapsed day 63 overdue in red, 27 pending)
  const progressContainer = document.getElementById('repaymentProgressSegments');
  if (progressContainer) {
    const totalDays = 90;
    const elapsedDays = 63;
    const overdueDayIndex = elapsedDays - 1; // 마지막 경과일(63일차) 미납 빨강 네모

    function lerp(a, b, t) {
      return Math.round(a + (b - a) * t);
    }

    // Commercial Web Service Token Scale: Primary Royal Blue (#2550E5 = --primitive-blue-600)
    function getCompletedColor(index, count) {
      return '#2550E5';
    }

    const fragment = document.createDocumentFragment();
    for (let i = 0; i < totalDays; i++) {
      const seg = document.createElement('div');
      const dayNum = String(i + 1).padStart(2, '0');
      if (i === overdueDayIndex) {
        seg.className = 'progress-segment progress-segment--overdue';
        seg.setAttribute('data-name', `${dayNum}일차 · 미납 (₩410,000)`);
        seg.title = `${dayNum}일차 · 미납 (₩410,000)`;
      } else if (i < elapsedDays) {
        seg.className = 'progress-segment';
        seg.style.backgroundColor = getCompletedColor(i, elapsedDays);
        seg.setAttribute('data-name', `${dayNum}일차 · 상환 완료`);
        seg.title = `${dayNum}일차 · 상환 완료 (₩410,000)`;
      } else {
        seg.className = 'progress-segment progress-segment--pending';
        seg.setAttribute('data-name', `${dayNum}일차 · 상환 예정`);
        seg.title = `${dayNum}일차 · 상환 예정`;
      }
      fragment.appendChild(seg);
    }
    progressContainer.appendChild(fragment);
  }

  // 1-B. Collapse / Expand Repayment Progress Card (Persisted in localStorage)
  const REPAYMENT_COLLAPSED_KEY = 'festio_repayment_collapsed';
  const repaymentCard = document.getElementById('repaymentCard');
  const repaymentToggleBtn = document.getElementById('repaymentToggleBtn');
  const repaymentToggleText = document.getElementById('repaymentToggleText');

  function applyRepaymentCollapsedState(isCollapsed) {
    if (!repaymentCard || !repaymentToggleBtn) return;
    repaymentCard.classList.toggle('is-collapsed', isCollapsed);
    repaymentToggleBtn.setAttribute('aria-expanded', String(!isCollapsed));
    if (repaymentToggleText) {
      repaymentToggleText.textContent = isCollapsed ? '펼치기' : '접기';
    }
  }

  if (repaymentCard && repaymentToggleBtn) {
    try {
      const savedVal = window.localStorage.getItem(REPAYMENT_COLLAPSED_KEY);
      // Default to collapsed (true) unless user explicitly opened it ('0')
      const isCollapsed = savedVal === null ? true : savedVal === '1';
      applyRepaymentCollapsedState(isCollapsed);
    } catch (_) {
      // Ignore storage access errors
    }

    repaymentToggleBtn.addEventListener('click', () => {
      const nextCollapsed = !repaymentCard.classList.contains('is-collapsed');
      applyRepaymentCollapsedState(nextCollapsed);
      try {
        window.localStorage.setItem(REPAYMENT_COLLAPSED_KEY, nextCollapsed ? '1' : '0');
      } catch (_) {
        // Ignore storage access errors
      }
    });
  }

  // 1-C. Collapse / Expand Settlement Calculation Card (Persisted in localStorage)
  const CALC_COLLAPSED_KEY = 'festio_calc_collapsed';
  const calcCard = document.getElementById('calcCard');
  const calcToggleBtn = document.getElementById('calcToggleBtn');
  const calcToggleText = document.getElementById('calcToggleText');

  function applyCalcCollapsedState(isCollapsed) {
    if (!calcCard || !calcToggleBtn) return;
    calcCard.classList.toggle('is-collapsed', isCollapsed);
    calcToggleBtn.setAttribute('aria-expanded', String(!isCollapsed));
    if (calcToggleText) {
      calcToggleText.textContent = isCollapsed ? '펼치기' : '접기';
    }
  }

  if (calcCard && calcToggleBtn) {
    try {
      const savedCalcCollapsed = window.localStorage.getItem(CALC_COLLAPSED_KEY) === '1';
      applyCalcCollapsedState(savedCalcCollapsed);
    } catch (_) {
      // Ignore storage access errors
    }

    calcToggleBtn.addEventListener('click', () => {
      const nextCollapsed = !calcCard.classList.contains('is-collapsed');
      applyCalcCollapsedState(nextCollapsed);
      try {
        window.localStorage.setItem(CALC_COLLAPSED_KEY, nextCollapsed ? '1' : '0');
      } catch (_) {
        // Ignore storage access errors
      }
    });
  }

  // 2. Safe Data Reset Trigger
  const safeResetTriggerBtn = document.getElementById('safeResetTriggerBtn');
  if (safeResetTriggerBtn) {
    safeResetTriggerBtn.addEventListener('click', () => {
      window.confirm(
        '[주의] 기존 수집된 매출 데이터를 모두 초기화하고 다시 수집하시겠습니까?\n이 작업은 되돌릴 수 없습니다.'
      );
    });
  }

  // 3. Multi-Tab Menu System & Coming Soon View Switching
  const workspaceTabBar = document.getElementById('workspaceTabBar');
  const settlementDetailView = document.getElementById('settlementDetailView');
  const comingSoonView = document.getElementById('comingSoonView');
  const comingSoonTitle = document.getElementById('comingSoonTitle');
  const backToSettlementBtn = document.getElementById('backToSettlementBtn');

  function syncSidebarHighlight(tabId) {
    document.querySelectorAll('.sidebar .nav-subitem').forEach((el) => {
      el.classList.toggle('nav-subitem--active', el.getAttribute('data-menu-id') === tabId);
    });
  }

  function activateWorkspaceTab(tabEl) {
    if (!workspaceTabBar || !tabEl) return;
    workspaceTabBar.querySelectorAll('.ws-tab').forEach((t) => {
      t.classList.remove('ws-tab--active');
      t.setAttribute('aria-selected', 'false');
    });
    tabEl.classList.add('ws-tab--active');
    tabEl.setAttribute('aria-selected', 'true');

    const tabId = tabEl.getAttribute('data-tab-id');
    const titleSpan = tabEl.querySelector('.ws-tab-title');
    const menuTitle = titleSpan ? titleSpan.textContent : '메뉴';
    const bcMenuText = document.getElementById('bcMenuText');
    if (bcMenuText) bcMenuText.textContent = menuTitle;

    syncSidebarHighlight(tabId);

    const operatorManagementView = document.getElementById('operatorManagementView');
    const permissionManagementView = document.getElementById('permissionManagementView');

    if (tabId === 'settlement-status') {
      if (settlementDetailView) settlementDetailView.style.display = 'flex';
      if (operatorManagementView) operatorManagementView.style.display = 'none';
      if (permissionManagementView) permissionManagementView.style.display = 'none';
      if (comingSoonView) comingSoonView.hidden = true;
    } else if (tabId === 'menu-operators') {
      if (settlementDetailView) settlementDetailView.style.display = 'none';
      if (operatorManagementView) operatorManagementView.style.display = 'flex';
      if (permissionManagementView) permissionManagementView.style.display = 'none';
      if (comingSoonView) comingSoonView.hidden = true;
    } else if (tabId === 'menu-permissions') {
      if (settlementDetailView) settlementDetailView.style.display = 'none';
      if (operatorManagementView) operatorManagementView.style.display = 'none';
      if (permissionManagementView) permissionManagementView.style.display = 'flex';
      if (comingSoonView) comingSoonView.hidden = true;
    } else {
      if (settlementDetailView) settlementDetailView.style.display = 'none';
      if (operatorManagementView) operatorManagementView.style.display = 'none';
      if (permissionManagementView) permissionManagementView.style.display = 'none';
      if (comingSoonView) comingSoonView.hidden = false;
      if (comingSoonTitle) comingSoonTitle.textContent = `${menuTitle} · 준비중입니다`;
    }
  }

  const MAX_TABS = 10;
  const tabCountBadge = document.getElementById('tabCountBadge');
  const closeOtherTabsBtn = document.getElementById('closeOtherTabsBtn');

  function updateTabCounter() {
    if (!workspaceTabBar || !tabCountBadge) return;
    const count = workspaceTabBar.querySelectorAll('.ws-tab').length;
    tabCountBadge.textContent = `${count} / ${MAX_TABS}`;
  }

  function openOrFocusMenuTab(menuId, label) {
    if (!workspaceTabBar) return;
    let existing = workspaceTabBar.querySelector(`.ws-tab[data-tab-id="${menuId}"]`);
    if (!existing) {
      const currentTabs = workspaceTabBar.querySelectorAll('.ws-tab');
      if (currentTabs.length >= MAX_TABS) {
        window.alert(`메뉴 탭은 최대 ${MAX_TABS}개까지만 열 수 있습니다. 사용하지 않는 탭을 닫아주세요.`);
        return;
      }
      existing = document.createElement('div');
      existing.className = 'ws-tab';
      existing.setAttribute('role', 'tab');
      existing.setAttribute('tabindex', '0');
      existing.setAttribute('data-tab-id', menuId);
      existing.setAttribute('title', label);
      existing.innerHTML = `
        <span class="ws-tab-title">${label}</span>
        <button type="button" class="ws-tab-close" aria-label="탭 닫기" data-close-tab="${menuId}">×</button>
      `;
      workspaceTabBar.appendChild(existing);
      updateTabCounter();
    }
    activateWorkspaceTab(existing);
  }

  if (closeOtherTabsBtn && workspaceTabBar) {
    closeOtherTabsBtn.addEventListener('click', () => {
      workspaceTabBar.querySelectorAll('.ws-tab:not(.ws-tab--active)').forEach((t) => t.remove());
      updateTabCounter();
    });
  }

  if (workspaceTabBar) {
    workspaceTabBar.addEventListener('click', (e) => {
      const closeBtn = e.target.closest('[data-close-tab]');
      if (closeBtn) {
        e.stopPropagation();
        const tabs = workspaceTabBar.querySelectorAll('.ws-tab');
        if (tabs.length <= 1) return;
        const tab = closeBtn.closest('.ws-tab');
        const wasActive = tab.classList.contains('ws-tab--active');
        const nextSibling = tab.nextElementSibling && tab.nextElementSibling.classList.contains('ws-tab')
          ? tab.nextElementSibling
          : tab.previousElementSibling;
        tab.remove();
        if (wasActive && nextSibling) {
          activateWorkspaceTab(nextSibling);
        }
        return;
      }

      const tabEl = e.target.closest('.ws-tab');
      if (tabEl) {
        activateWorkspaceTab(tabEl);
      }
    });
  }

  if (backToSettlementBtn) {
    backToSettlementBtn.addEventListener('click', () => {
      openOrFocusMenuTab('settlement-status', '정산·상환 현황');
    });
  }

  // Period Filter Tabs
  document.querySelectorAll('.period-tab').forEach((tab) => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.period-tab').forEach((el) => el.classList.remove('period-tab--active'));
      tab.classList.add('period-tab--active');
    });
  });

  // 4. Interactive Sidebar Collapse/Expand, Submenu Toggle, Search Filtering & Ctrl+K Shortcut
  const appSidebar = document.getElementById('appSidebar');
  const sidebarCollapseBtn = document.getElementById('sidebarCollapseBtn');
  if (appSidebar && sidebarCollapseBtn) {
    sidebarCollapseBtn.addEventListener('click', () => {
      appSidebar.classList.toggle('is-collapsed');
      document.body.classList.toggle('sidebar-collapsed');
    });

    const searchBox = appSidebar.querySelector('.sidebar-search');
    if (searchBox) {
      searchBox.addEventListener('click', () => {
        if (appSidebar.classList.contains('is-collapsed')) {
          appSidebar.classList.remove('is-collapsed');
          const input = document.getElementById('sidebarSearchInput');
          if (input) input.focus();
        }
      });
    }
  }

  const loanNavGroup = document.getElementById('loanNavGroup');
  const loanNavToggle = document.getElementById('loanNavToggle');
  const loanSubMenu = document.getElementById('loanSubMenu');
  const loanNavChevron = document.getElementById('loanNavChevron');
  if (loanNavToggle && loanSubMenu) {
    loanNavToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      if (appSidebar && appSidebar.classList.contains('is-collapsed')) {
        if (loanNavGroup) loanNavGroup.classList.toggle('flyout-open');
        return;
      }
      const isHidden = loanSubMenu.style.display === 'none';
      loanSubMenu.style.display = isHidden ? 'flex' : 'none';
      loanNavToggle.setAttribute('aria-expanded', String(isHidden));
      if (loanNavChevron) {
        loanNavChevron.classList.toggle('nav-chevron-down--collapsed', !isHidden);
      }
    });
  }

  document.addEventListener('click', () => {
    if (loanNavGroup) loanNavGroup.classList.remove('flyout-open');
  });

  // Open/Activate Menu Tab when clicking any Sidebar Menu Item
  document.querySelectorAll('.sidebar [data-menu-id]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const menuId = btn.getAttribute('data-menu-id');
      const menuTitle = btn.getAttribute('data-menu-title') || btn.textContent.trim();
      openOrFocusMenuTab(menuId, menuTitle);
      if (loanNavGroup) loanNavGroup.classList.remove('flyout-open');
    });
  });

  // 4. Header Menu Search & Live Sidebar Filter + Quick Dropdown
  const headerSearchInput = document.getElementById('headerSearchInput');
  const headerSearchDropdown = document.getElementById('headerSearchDropdown');
  const headerSearchResults = document.getElementById('headerSearchResults');

  const searchableMenuItems = [
    { id: 'menu-dashboard', title: '대시보드', category: '업무 메뉴' },
    { id: 'settlement-status', title: '정산·상환 현황', category: '선정산 관리' },
    { id: 'menu-limit', title: '한도·심사 관리', category: '선정산 관리' },
    { id: 'menu-execution', title: '선지급 실행 관리', category: '선정산 관리' },
    { id: 'menu-overdue', title: '회수·미납 관리', category: '선정산 관리' },
    { id: 'menu-pipeline', title: '가맹점 파이프라인', category: '영업' },
    { id: 'menu-calendar', title: '정산 캘린더 · 일정', category: '활동 및 일정' },
    { id: 'menu-report', title: '정산 리포트', category: '통계' },
    { id: 'menu-operators', title: '운영자 관리', category: '시스템 관리' },
    { id: 'menu-permissions', title: '권한 관리', category: '시스템 관리' },
    { id: 'menu-settings', title: '환경 설정', category: '시스템 관리' },
    { id: 'menu-help', title: '도움말', category: '지원' },
  ];

  if (headerSearchInput) {
    window.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        headerSearchInput.focus();
        headerSearchInput.select();
      }
      if (e.key === 'Escape' && headerSearchDropdown && !headerSearchDropdown.hidden) {
        headerSearchDropdown.hidden = true;
        headerSearchInput.blur();
      }
    });

    headerSearchInput.addEventListener('input', () => {
      const q = headerSearchInput.value.trim().toLowerCase();

      // 1) Filter sidebar items
      document.querySelectorAll('.sidebar .nav-item, .sidebar .nav-subitem').forEach((item) => {
        const text = item.textContent.toLowerCase();
        const row = item.closest('.nav-item-row') || item;
        row.style.display = !q || text.includes(q) ? '' : 'none';
      });
      if (q && loanSubMenu) {
        loanSubMenu.style.display = 'flex';
      }

      // 2) Populate quick results dropdown
      if (!q) {
        if (headerSearchDropdown) headerSearchDropdown.hidden = true;
        return;
      }

      const matches = searchableMenuItems.filter((m) =>
        m.title.toLowerCase().includes(q) || m.category.toLowerCase().includes(q)
      );

      if (headerSearchResults && headerSearchDropdown) {
        headerSearchResults.innerHTML = '';
        if (matches.length === 0) {
          headerSearchResults.innerHTML = '<div class="header-search-empty">일치하는 메뉴가 없습니다</div>';
        } else {
          matches.forEach((item) => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'header-search-item';
            btn.innerHTML = `<span><strong>${item.title}</strong></span><span class="header-search-item-badge">${item.category}</span>`;
            btn.addEventListener('click', () => {
              openOrFocusMenuTab(item.id, item.title);
              headerSearchDropdown.hidden = true;
              headerSearchInput.value = '';
              // reset sidebar
              document.querySelectorAll('.sidebar .nav-item, .sidebar .nav-subitem').forEach((it) => {
                const row = it.closest('.nav-item-row') || it;
                row.style.display = '';
              });
            });
            headerSearchResults.appendChild(btn);
          });
        }
        headerSearchDropdown.hidden = false;
      }
    });

    headerSearchInput.addEventListener('focus', () => {
      if (headerSearchInput.value.trim() && headerSearchDropdown) {
        headerSearchDropdown.hidden = false;
      }
    });

    document.addEventListener('click', (e) => {
      if (!e.target.closest('#headerSearchWrap') && headerSearchDropdown) {
        headerSearchDropdown.hidden = true;
      }
    });
  }

  // 5. Interactive Settlement Calculation & Live Accounting Formula Preview
  const selectionState = {
    method: '개별 정산',
    prepay: '미리 상환 안 함',
    advance: '선반영 안 함',
    overdue: '미납 상환 안 함',
    baseDays: 1,
    extraDays: 0,
    overdueDays: 0,
  };

  const selectionSummaryText = document.getElementById('selectionSummaryText');
  const previewDepositVal = document.getElementById('previewDepositVal');
  const previewFeeVal = document.getElementById('previewFeeVal');
  const previewRepayLabel = document.getElementById('previewRepayLabel');
  const previewRepayVal = document.getElementById('previewRepayVal');
  const previewOverdueVal = document.getElementById('previewOverdueVal');
  const previewBondVal = document.getElementById('previewBondVal');
  const previewPayoutVal = document.getElementById('previewPayoutVal');
  const bondFeeInput = document.getElementById('bondFeeInput');
  const applyToTodayRowBtn = document.getElementById('applyToTodayRowBtn');
  const calcRunBtn = document.getElementById('calcRunBtn');
  const topOverdueStatusTag = document.getElementById('topOverdueStatusTag');
  const tableBody = document.getElementById('settlementTableBody');

  function computePreviewNumbers() {
    const baseDeposit = selectionState.baseDays === 3 ? 2647898 : 965206;
    const fee = Math.floor(baseDeposit * 0.009); // 정산수수료 (0.90%)
    const bondFee = parseInt(String(bondFeeInput ? bondFeeInput.value : '0').replace(/[^0-9]/g, ''), 10) || 0;

    // PRD 9번 수수료 차감 및 부분 상환·미납 회계 엔진
    // 1단계: 수수료 차감 후 상환 가능금액 산출
    const availableForRepayment = Math.max(0, baseDeposit - fee - bondFee);

    // 2단계: 당일 상환 예정금액 산출 (일 상환금 + 기존 미납 완납 선택분)
    const totalRepayDays = selectionState.baseDays + selectionState.extraDays;
    const scheduledRepayAmount = totalRepayDays * 410000;
    const existingOverdueAmount = selectionState.overdueDays * 410000;
    const targetRepayTotal = scheduledRepayAmount + existingOverdueAmount;

    // 3단계: 실제 상환 처리금액 및 신규 미납 발생액 분리 (회계 정합성: 실제상환 + 미납 = 예정액)
    const actualRepayAmount = Math.min(targetRepayTotal, availableForRepayment);
    const newOverdueAmount = Math.max(0, targetRepayTotal - availableForRepayment);

    // 4단계: 차감 후 가맹점 지급액 (보낼 돈)
    const payout = Math.max(0, availableForRepayment - targetRepayTotal);

    if (previewDepositVal) previewDepositVal.textContent = formatKRW(baseDeposit);
    if (previewFeeVal) previewFeeVal.textContent = formatKRW(fee);
    if (previewRepayLabel) previewRepayLabel.textContent = `일 상환금(${totalRepayDays}일)`;
    if (previewRepayVal) previewRepayVal.textContent = formatKRW(actualRepayAmount);
    if (previewOverdueVal) {
      previewOverdueVal.textContent = formatKRW(existingOverdueAmount);
      previewOverdueVal.classList.toggle('term-val--danger', existingOverdueAmount > 0);
    }
    if (previewBondVal) previewBondVal.textContent = formatKRW(bondFee);
    if (previewPayoutVal) previewPayoutVal.textContent = formatKRW(payout);

    return {
      baseDeposit,
      fee,
      totalRepayDays,
      scheduledRepayAmount,
      actualRepayAmount,
      newOverdueAmount,
      existingOverdueAmount,
      bondFee,
      payout
    };
  }

  function updateSelectionBanner() {
    if (selectionSummaryText) {
      const parts = [selectionState.method, selectionState.prepay, selectionState.advance];
      if (selectionState.overdueDays > 0) {
        parts.push(selectionState.overdue);
      }
      selectionSummaryText.textContent = parts.join(' · ');
    }
    computePreviewNumbers();
  }

  const prepayCustomBox = document.getElementById('prepayCustomBox');
  const prepayCustomInput = document.getElementById('prepayCustomInput');
  const advanceCustomBox = document.getElementById('advanceCustomBox');
  const advanceCustomInput = document.getElementById('advanceCustomInput');
  const MAX_REMAINING_DAYS = 27;

  document.querySelectorAll('.btn-group[data-group]').forEach((groupEl) => {
    const groupKey = groupEl.getAttribute('data-group');
    groupEl.querySelectorAll('button[data-value]').forEach((btn) => {
      btn.addEventListener('click', () => {
        groupEl.querySelectorAll('button[data-value]').forEach((sibling) => {
          sibling.classList.remove('btn--seg-active');
        });
        btn.classList.add('btn--seg-active');
        selectionState[groupKey] = btn.getAttribute('data-value');
        if (btn.hasAttribute('data-days')) {
          selectionState.baseDays = Number(btn.getAttribute('data-days')) || 1;
        }
        if (btn.hasAttribute('data-extra-days')) {
          selectionState.extraDays = Number(btn.getAttribute('data-extra-days')) || 0;
          if (prepayCustomInput) prepayCustomInput.value = '';
          if (prepayCustomBox) prepayCustomBox.classList.remove('is-active');
        }
        if (btn.hasAttribute('data-advance-days')) {
          if (advanceCustomInput) advanceCustomInput.value = '';
          if (advanceCustomBox) advanceCustomBox.classList.remove('is-active');
        }
        if (btn.hasAttribute('data-overdue-days')) {
          selectionState.overdueDays = Number(btn.getAttribute('data-overdue-days')) || 0;
        }
        updateSelectionBanner();
      });
    });
  });

  if (topOverdueStatusTag) {
    topOverdueStatusTag.addEventListener('click', () => {
      const targetDays = selectionState.overdueDays > 0 ? '0' : '1';
      const targetBtn = document.querySelector(`.btn-group[data-group="overdue"] button[data-overdue-days="${targetDays}"]`);
      if (targetBtn) {
        targetBtn.click();
      }
    });
  }

  if (prepayCustomInput) {
    const applyCustomPrepayDays = () => {
      const raw = prepayCustomInput.value.trim();
      const prepayGroup = document.querySelector('.btn-group[data-group="prepay"]');
      if (!raw) {
        if (prepayCustomBox) prepayCustomBox.classList.remove('is-active');
        return;
      }
      let days = parseInt(raw, 10);
      if (Number.isNaN(days) || days < 1) {
        days = 1;
      } else if (days > MAX_REMAINING_DAYS) {
        days = MAX_REMAINING_DAYS;
        prepayCustomInput.value = String(MAX_REMAINING_DAYS);
      }

      if (prepayGroup) {
        prepayGroup.querySelectorAll('button[data-value]').forEach((b) => {
          b.classList.remove('btn--seg-active');
        });
      }
      if (prepayCustomBox) {
        prepayCustomBox.classList.add('is-active');
      }
      selectionState.extraDays = days;
      selectionState.prepay = `미리 상환 +${days}일`;
      updateSelectionBanner();
    };

    prepayCustomInput.addEventListener('input', applyCustomPrepayDays);
    prepayCustomInput.addEventListener('change', () => {
      const raw = prepayCustomInput.value.trim();
      if (!raw) {
        const zeroBtn = document.querySelector('.btn-group[data-group="prepay"] button[data-extra-days="0"]');
        if (zeroBtn) zeroBtn.click();
      } else {
        applyCustomPrepayDays();
      }
    });
  }

  if (advanceCustomInput) {
    const applyCustomAdvanceDays = () => {
      const raw = advanceCustomInput.value.trim();
      const advanceGroup = document.querySelector('.btn-group[data-group="advance"]');
      if (!raw) {
        if (advanceCustomBox) advanceCustomBox.classList.remove('is-active');
        return;
      }
      let days = parseInt(raw, 10);
      if (Number.isNaN(days) || days < 1) {
        days = 1;
      } else if (days > MAX_REMAINING_DAYS) {
        days = MAX_REMAINING_DAYS;
        advanceCustomInput.value = String(MAX_REMAINING_DAYS);
      }

      if (advanceGroup) {
        advanceGroup.querySelectorAll('button[data-value]').forEach((b) => {
          b.classList.remove('btn--seg-active');
        });
      }
      if (advanceCustomBox) {
        advanceCustomBox.classList.add('is-active');
      }
      selectionState.advance = `선반영 +${days}일`;
      updateSelectionBanner();
    };

    advanceCustomInput.addEventListener('input', applyCustomAdvanceDays);
    advanceCustomInput.addEventListener('change', () => {
      const raw = advanceCustomInput.value.trim();
      if (!raw) {
        const zeroBtn = document.querySelector('.btn-group[data-group="advance"] button[data-advance-days="0"]');
        if (zeroBtn) zeroBtn.click();
      } else {
        applyCustomAdvanceDays();
      }
    });
  }

  if (bondFeeInput) {
    bondFeeInput.addEventListener('input', computePreviewNumbers);
  }

  // Apply preview to today's row (2026-11-18)
  function applyCalculationToTodayRow() {
    if (!tableBody) return;
    const firstRow = tableBody.querySelector('.tr-row');
    if (!firstRow) return;
    const {
      baseDeposit,
      fee,
      actualRepayAmount,
      newOverdueAmount,
      existingOverdueAmount,
      bondFee,
      payout
    } = computePreviewNumbers();
    const cells = firstRow.querySelectorAll('.td-cell');
    // 12-Column indices:
    // 0: 정산일/유형, 1: 매출일, 2: 카드매출, 3: (+)실입금, 4: (-)정산수수료, 5: (-)일상환금, 6: (-)채권수수료, 7: (-)기존미납, 8: 신규미납, 9: (=)지급액(보낼돈), 10: 상태, 11: 정산 삭제
    if (cells.length >= 10) {
      const depEl = cells[3].querySelector('.deposit-amount');
      if (depEl) depEl.textContent = formatKRW(baseDeposit);
      cells[4].textContent = `-${formatKRW(fee)}`;
      cells[5].textContent = actualRepayAmount > 0 ? `-${formatKRW(actualRepayAmount)}` : '—';
      cells[6].textContent = bondFee > 0 ? `-${formatKRW(bondFee)}` : '—';
      cells[6].classList.toggle('td-cell--muted', bondFee <= 0);
      cells[6].classList.toggle('td-cell--deduct', bondFee > 0);
      cells[7].textContent = existingOverdueAmount > 0 ? `-${formatKRW(existingOverdueAmount)}` : '—';
      cells[7].classList.toggle('td-cell--muted', existingOverdueAmount <= 0);
      cells[7].classList.toggle('td-cell--deduct', existingOverdueAmount > 0);

      // 8: 신규미납 (부족분만 정밀 기록)
      if (cells[8]) {
        if (newOverdueAmount > 0) {
          cells[8].textContent = formatKRW(newOverdueAmount);
          cells[8].className = 'td-cell td-cell--right td-cell--danger td-cell--bold';
        } else {
          cells[8].textContent = '—';
          cells[8].className = 'td-cell td-cell--right td-cell--muted';
        }
      }

      // 9: 지급액 (보낼 돈)
      cells[9].textContent = formatKRW(payout);
      firstRow.setAttribute('data-deposit', String(baseDeposit));
      firstRow.setAttribute('data-payout', String(payout));
      recalculateSubtotals();
    }
  }

  if (applyToTodayRowBtn) {
    applyToTodayRowBtn.addEventListener('click', applyCalculationToTodayRow);
  }
  if (calcRunBtn) {
    calcRunBtn.addEventListener('click', applyCalculationToTodayRow);
  }

  // 6. Interactive Settlement Table Actions, Search Filter & Column Sorting
  const subtotalRowLabel = document.getElementById('subtotalRowLabel');
  const subtotalDeposit = document.getElementById('subtotalDeposit');
  const subtotalPayout = document.getElementById('subtotalPayout');
  const confirmedCountBadge = document.getElementById('confirmedCountBadge');
  const topCompareDeposit = document.getElementById('topCompareDeposit');
  const topComparePayout = document.getElementById('topComparePayout');
  const historySearchInput = document.getElementById('historySearchInput');
  const historySearchClearBtn = document.getElementById('historySearchClearBtn');
  const historyTypeFilter = document.getElementById('historyTypeFilter');
  const historyStartDate = document.getElementById('historyStartDate');
  const historyEndDate = document.getElementById('historyEndDate');
  const historyDateRangeBox = document.getElementById('historyDateRangeBox');
  const historyFilterResetBtn = document.getElementById('historyFilterResetBtn');
  const historySortStatusText = document.getElementById('historySortStatusText');
  const settlementTableHeader = document.getElementById('settlementTableHeader');
  const periodTabs = document.querySelectorAll('.period-tabs .period-tab');

  function recalculateSubtotals() {
    if (!tableBody) return;
    const allRows = Array.from(tableBody.querySelectorAll('.tr-row'));
    const visibleRows = allRows.filter((row) => !row.hidden);
    let depositSum = 0;
    let payoutSum = 0;

    visibleRows.forEach((row, index) => {
      if (!row.classList.contains('tr-row--today')) {
        row.classList.toggle('tr-row--alt', index % 2 === 1);
      }
      const isExcluded = row.getAttribute('data-excluded') === 'true';
      const dep = isExcluded ? 0 : Number(row.getAttribute('data-deposit') || 0);
      const pay = Number(row.getAttribute('data-payout') || 0);
      depositSum += dep;
      payoutSum += pay;
    });

    let emptyRow = tableBody.querySelector('.table-empty-row');
    if (visibleRows.length === 0) {
      if (!emptyRow) {
        emptyRow = document.createElement('div');
        emptyRow.className = 'table-empty-row';
        emptyRow.textContent = '검색 조건에 일치하는 정산 내역이 없습니다.';
        tableBody.appendChild(emptyRow);
      }
      emptyRow.hidden = false;
    } else if (emptyRow) {
      emptyRow.hidden = true;
    }

    if (subtotalRowLabel) subtotalRowLabel.textContent = `표시된 ${visibleRows.length}건 소계`;
    if (confirmedCountBadge) confirmedCountBadge.textContent = `${visibleRows.length}건 확정`;
    if (subtotalDeposit) subtotalDeposit.textContent = `실입금  ${formatKRW(depositSum)}`;
    if (subtotalPayout) subtotalPayout.textContent = `지급액  ${formatKRW(payoutSum)}`;
    if (topCompareDeposit) topCompareDeposit.textContent = `실입금 ${formatKRW(depositSum)}`;
    if (topComparePayout) topComparePayout.textContent = `지급액 ${formatKRW(payoutSum)}`;
  }

  function applyHistoryFilters() {
    if (!tableBody) return;
    const rawQuery = (historySearchInput ? historySearchInput.value : '').trim().toLowerCase();
    const numericQuery = rawQuery.replace(/[,₩\s]/g, '');
    const typeFilter = historyTypeFilter ? historyTypeFilter.value : 'all';
    const startVal = historyStartDate ? historyStartDate.value : '';
    const endVal = historyEndDate ? historyEndDate.value : '';

    if (historySearchClearBtn) {
      historySearchClearBtn.hidden = rawQuery.length === 0;
    }

    const rows = Array.from(tableBody.querySelectorAll('.tr-row'));
    rows.forEach((row) => {
      const rowText = (row.textContent || '').toLowerCase();
      const rowNumericText = rowText.replace(/[,₩\s]/g, '');
      const isBundle = rowText.includes('묶음') || rowText.includes('~');
      const firstCellText = (row.querySelector('.td-cell')?.textContent || '').trim();
      const dateMatch = firstCellText.match(/\d{4}-\d{2}-\d{2}/);
      const rowDate = dateMatch ? dateMatch[0] : '';

      let matchesDate = true;
      if (rowDate) {
        if (startVal && rowDate < startVal) matchesDate = false;
        if (endVal && rowDate > endVal) matchesDate = false;
      }

      let matchesType = true;
      if (typeFilter === 'single') {
        matchesType = !isBundle;
      } else if (typeFilter === 'bundle') {
        matchesType = isBundle;
      }

      let matchesQuery = true;
      if (rawQuery.length > 0) {
        matchesQuery =
          rowText.includes(rawQuery) ||
          (numericQuery.length > 0 && rowNumericText.includes(numericQuery));
      }

      row.hidden = !(matchesDate && matchesType && matchesQuery);
    });

    recalculateSubtotals();
  }

  if (historySearchInput) {
    historySearchInput.addEventListener('input', applyHistoryFilters);
  }

  if (historySearchClearBtn && historySearchInput) {
    historySearchClearBtn.addEventListener('click', () => {
      historySearchInput.value = '';
      applyHistoryFilters();
      historySearchInput.focus();
    });
  }

  if (historyTypeFilter) {
    historyTypeFilter.addEventListener('change', applyHistoryFilters);
  }

  function handleCustomDateChange() {
    periodTabs.forEach((t) => t.classList.remove('period-tab--active'));
    if (historyDateRangeBox) {
      historyDateRangeBox.classList.add('is-custom-active');
    }
    applyHistoryFilters();
  }

  if (historyStartDate) {
    historyStartDate.addEventListener('change', handleCustomDateChange);
  }

  if (historyEndDate) {
    historyEndDate.addEventListener('change', handleCustomDateChange);
  }

  periodTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      periodTabs.forEach((t) => t.classList.remove('period-tab--active'));
      tab.classList.add('period-tab--active');
      if (historyDateRangeBox) {
        historyDateRangeBox.classList.remove('is-custom-active');
      }
      const presetStart = tab.getAttribute('data-start');
      const presetEnd = tab.getAttribute('data-end');
      if (historyStartDate && presetStart) historyStartDate.value = presetStart;
      if (historyEndDate && presetEnd) historyEndDate.value = presetEnd;
      applyHistoryFilters();
    });
  });

  if (historyFilterResetBtn) {
    historyFilterResetBtn.addEventListener('click', () => {
      if (historySearchInput) historySearchInput.value = '';
      if (historyTypeFilter) historyTypeFilter.value = 'all';
      if (historyStartDate) historyStartDate.value = '2026-11-10';
      if (historyEndDate) historyEndDate.value = '2026-11-18';
      if (historyDateRangeBox) historyDateRangeBox.classList.remove('is-custom-active');
      periodTabs.forEach((t, idx) => t.classList.toggle('period-tab--active', idx === 0));
      applyHistoryFilters();
    });
  }

  function extractSortValue(row, colIndex, sortType) {
    const cells = row.querySelectorAll('.td-cell');
    const cell = cells[colIndex];
    if (!cell) return 0;

    if (colIndex === 3) {
      const isExcluded = row.getAttribute('data-excluded') === 'true';
      return isExcluded ? 0 : Number(row.getAttribute('data-deposit') || 0);
    }
    if (colIndex === 9) {
      return Number(row.getAttribute('data-payout') || 0);
    }

    const text = (cell.textContent || '').trim();
    if (sortType === 'date') {
      const match = text.match(/\d{4}-\d{2}-\d{2}/);
      return match ? match[0] : text;
    }
    if (sortType === 'currency') {
      const digits = text.replace(/[^0-9]/g, '');
      return digits ? Number(digits) : 0;
    }
    return text;
  }

  if (settlementTableHeader && tableBody) {
    const sortableHeaders = settlementTableHeader.querySelectorAll('.th-cell--sortable');

    function handleHeaderSort(th) {
      const colIndex = Number(th.getAttribute('data-sort-col') || 0);
      const sortType = th.getAttribute('data-sort-type') || 'text';
      const sortLabel = th.getAttribute('data-sort-label') || '정산일';
      const currentDir = th.getAttribute('data-sort-dir');
      const nextDir = currentDir === 'desc' ? 'asc' : 'desc';

      sortableHeaders.forEach((header) => {
        header.classList.remove('is-sorted');
        header.removeAttribute('data-sort-dir');
        const icon = header.querySelector('.th-sort-icon');
        if (icon) icon.textContent = '↕';
      });

      th.classList.add('is-sorted');
      th.setAttribute('data-sort-dir', nextDir);
      const activeIcon = th.querySelector('.th-sort-icon');
      if (activeIcon) activeIcon.textContent = nextDir === 'desc' ? '↓' : '↑';

      if (historySortStatusText) {
        historySortStatusText.textContent = `${sortLabel} ${nextDir === 'desc' ? '내림차순' : '오름차순'}`;
      }

      const rows = Array.from(tableBody.querySelectorAll('.tr-row'));
      rows.sort((a, b) => {
        const valA = extractSortValue(a, colIndex, sortType);
        const valB = extractSortValue(b, colIndex, sortType);
        let cmp = 0;
        if (typeof valA === 'number' && typeof valB === 'number') {
          cmp = valA - valB;
        } else {
          cmp = String(valA).localeCompare(String(valB), 'ko-KR');
        }
        return nextDir === 'desc' ? -cmp : cmp;
      });

      rows.forEach((row) => tableBody.appendChild(row));
      recalculateSubtotals();
    }

    sortableHeaders.forEach((th) => {
      th.addEventListener('click', () => handleHeaderSort(th));
      th.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleHeaderSort(th);
        }
      });
    });
  }

  function applyHistoryFilters() {
    if (!tableBody) return;
    const rawQuery = (historySearchInput ? historySearchInput.value : '').trim().toLowerCase();
    const numericQuery = rawQuery.replace(/[,₩\s]/g, '');
    const typeFilter = historyTypeFilter ? historyTypeFilter.value : 'all';

    if (historySearchClearBtn) {
      historySearchClearBtn.hidden = rawQuery.length === 0;
    }

    const rows = Array.from(tableBody.querySelectorAll('.tr-row'));
    rows.forEach((row) => {
      const rowText = (row.textContent || '').toLowerCase();
      const rowNumericText = rowText.replace(/[,₩\s]/g, '');
      const isBundle = rowText.includes('묶음') || rowText.includes('~');

      let matchesType = true;
      if (typeFilter === 'single') {
        matchesType = !isBundle;
      } else if (typeFilter === 'bundle') {
        matchesType = isBundle;
      }

      let matchesQuery = true;
      if (rawQuery.length > 0) {
        matchesQuery =
          rowText.includes(rawQuery) ||
          (numericQuery.length > 0 && rowNumericText.includes(numericQuery));
      }

      row.hidden = !(matchesDate && matchesType && matchesQuery);
    });

    recalculateSubtotals();
  }

  if (historySearchInput) {
    historySearchInput.addEventListener('input', applyHistoryFilters);
  }

  if (historySearchClearBtn && historySearchInput) {
    historySearchClearBtn.addEventListener('click', () => {
      historySearchInput.value = '';
      applyHistoryFilters();
      historySearchInput.focus();
    });
  }

  if (historyTypeFilter) {
    historyTypeFilter.addEventListener('change', applyHistoryFilters);
  }

  function handleCustomDateChange() {
    periodTabs.forEach((t) => t.classList.remove('period-tab--active'));
    if (historyDateRangeBox) {
      historyDateRangeBox.classList.add('is-custom-active');
    }
    applyHistoryFilters();
  }

  if (historyStartDate) {
    historyStartDate.addEventListener('change', handleCustomDateChange);
  }

  if (historyEndDate) {
    historyEndDate.addEventListener('change', handleCustomDateChange);
  }

  periodTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      periodTabs.forEach((t) => t.classList.remove('period-tab--active'));
      tab.classList.add('period-tab--active');
      if (historyDateRangeBox) {
        historyDateRangeBox.classList.remove('is-custom-active');
      }
      const presetStart = tab.getAttribute('data-start');
      const presetEnd = tab.getAttribute('data-end');
      if (historyStartDate && presetStart) historyStartDate.value = presetStart;
      if (historyEndDate && presetEnd) historyEndDate.value = presetEnd;
      applyHistoryFilters();
    });
  });

  if (historyFilterResetBtn) {
    historyFilterResetBtn.addEventListener('click', () => {
      if (historySearchInput) historySearchInput.value = '';
      if (historyTypeFilter) historyTypeFilter.value = 'all';
      if (historyStartDate) historyStartDate.value = '2026-11-10';
      if (historyEndDate) historyEndDate.value = '2026-11-18';
      if (historyDateRangeBox) historyDateRangeBox.classList.remove('is-custom-active');
      periodTabs.forEach((t, idx) => t.classList.toggle('period-tab--active', idx === 0));
      applyHistoryFilters();
    });
  }

  function extractSortValue(row, colIndex, sortType) {
    const cells = row.querySelectorAll('.td-cell');
    const cell = cells[colIndex];
    if (!cell) return 0;

    if (colIndex === 3) {
      const isExcluded = row.getAttribute('data-excluded') === 'true';
      return isExcluded ? 0 : Number(row.getAttribute('data-deposit') || 0);
    }
    if (colIndex === 9) {
      return Number(row.getAttribute('data-payout') || 0);
    }

    const text = (cell.textContent || '').trim();
    if (sortType === 'date') {
      const match = text.match(/\d{4}-\d{2}-\d{2}/);
      return match ? match[0] : text;
    }
    if (sortType === 'currency') {
      const digits = text.replace(/[^0-9]/g, '');
      return digits ? Number(digits) : 0;
    }
    return text;
  }

  if (settlementTableHeader && tableBody) {
    const sortableHeaders = settlementTableHeader.querySelectorAll('.th-cell--sortable');

    function handleHeaderSort(th) {
      const colIndex = Number(th.getAttribute('data-sort-col') || 0);
      const sortType = th.getAttribute('data-sort-type') || 'text';
      const sortLabel = th.getAttribute('data-sort-label') || '정산일';
      const currentDir = th.getAttribute('data-sort-dir');
      const nextDir = currentDir === 'desc' ? 'asc' : 'desc';

      sortableHeaders.forEach((header) => {
        header.classList.remove('is-sorted');
        header.removeAttribute('data-sort-dir');
        const icon = header.querySelector('.th-sort-icon');
        if (icon) icon.textContent = '↕';
      });

      th.classList.add('is-sorted');
      th.setAttribute('data-sort-dir', nextDir);
      const activeIcon = th.querySelector('.th-sort-icon');
      if (activeIcon) activeIcon.textContent = nextDir === 'desc' ? '↓' : '↑';

      if (historySortStatusText) {
        historySortStatusText.textContent = `${sortLabel} ${nextDir === 'desc' ? '내림차순' : '오름차순'}`;
      }

      const rows = Array.from(tableBody.querySelectorAll('.tr-row'));
      rows.sort((a, b) => {
        const valA = extractSortValue(a, colIndex, sortType);
        const valB = extractSortValue(b, colIndex, sortType);
        let cmp = 0;
        if (typeof valA === 'number' && typeof valB === 'number') {
          cmp = valA - valB;
        } else {
          cmp = String(valA).localeCompare(String(valB), 'ko-KR');
        }
        return nextDir === 'desc' ? -cmp : cmp;
      });

      rows.forEach((row) => tableBody.appendChild(row));
      recalculateSubtotals();
    }

    sortableHeaders.forEach((th) => {
      th.addEventListener('click', () => handleHeaderSort(th));
      th.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleHeaderSort(th);
        }
      });
    });
  }

  if (tableBody) {
    tableBody.addEventListener('click', (e) => {
      const btn = e.target.closest('button[data-action]');
      if (!btn) return;
      const row = btn.closest('.tr-row');
      if (!row) return;
      const action = btn.getAttribute('data-action');

      if (action === 'unlock') {
        row.removeAttribute('data-locked');
        return;
      }

      if (action === 'delete') {
        if (!window.confirm('이 정산 내역 행을 삭제하시겠습니까?')) {
          return;
        }
        row.remove();
        recalculateSubtotals();
      } else if (action === 'exclude') {
        const currentlyExcluded = row.getAttribute('data-excluded') === 'true';
        const amountEl = row.querySelector('.deposit-amount');
        if (!currentlyExcluded) {
          row.setAttribute('data-excluded', 'true');
          if (amountEl) amountEl.textContent = '₩0 (제외)';
          btn.textContent = '제외 해제';
        } else {
          row.removeAttribute('data-excluded');
          const orig = Number(row.getAttribute('data-deposit') || 0);
          if (amountEl) amountEl.textContent = formatKRW(orig);
          btn.textContent = '입금 제외';
        }
        recalculateSubtotals();
      } else if (action === 'edit') {
        const currentDeposit = row.getAttribute('data-deposit') || '0';
        const nextVal = window.prompt('실입금 금액(원)을 입력하세요:', currentDeposit);
        if (nextVal !== null) {
          const parsed = parseInt(String(nextVal).replace(/[^0-9]/g, ''), 10);
          if (!Number.isNaN(parsed)) {
            row.setAttribute('data-deposit', String(parsed));
            row.removeAttribute('data-excluded');
            const amountEl = row.querySelector('.deposit-amount');
            if (amountEl) amountEl.textContent = formatKRW(parsed);
            recalculateSubtotals();
          }
        }
      }
    });
  }

  // 7. Top Header User Profile Dropdown & Account Edit Modal
  const userProfileWrap = document.getElementById('userProfileDropdownWrap');
  const userProfileTrigger = document.getElementById('userProfileTrigger');
  const userProfileMenu = document.getElementById('userProfileMenu');
  const accountModalBackdrop = document.getElementById('accountModalBackdrop');
  const accountModalCloseBtn = document.getElementById('accountModalCloseBtn');
  const modalTabs = document.querySelectorAll('.account-modal-tab[data-modal-tab]');
  const panelAccount = document.getElementById('modalPanelAccount');
  const panelPassword = document.getElementById('modalPanelPassword');
  const panelMerchants = document.getElementById('modalPanelMerchants');
  const topUserNameText = document.getElementById('topUserNameText');
  const dropdownUserNameText = document.getElementById('dropdownUserNameText');
  const dropdownUserMetaText = document.getElementById('dropdownUserMetaText');

  function closeUserDropdown() {
    if (userProfileMenu && userProfileTrigger) {
      userProfileMenu.hidden = true;
      userProfileTrigger.setAttribute('aria-expanded', 'false');
    }
  }

  function switchModalTab(tabKey) {
    modalTabs.forEach((t) => {
      const active = t.getAttribute('data-modal-tab') === tabKey;
      t.classList.toggle('is-active', active);
      t.setAttribute('aria-selected', String(active));
    });
    if (panelAccount) panelAccount.hidden = tabKey !== 'account';
    if (panelPassword) panelPassword.hidden = tabKey !== 'password';
    if (panelMerchants) panelMerchants.hidden = tabKey !== 'merchants';
  }

  function openAccountModal(tabKey) {
    closeUserDropdown();
    switchModalTab(tabKey || 'account');
    if (accountModalBackdrop) {
      accountModalBackdrop.hidden = false;
    }
  }

  function closeAccountModal() {
    if (accountModalBackdrop) {
      accountModalBackdrop.hidden = true;
    }
  }

  if (userProfileTrigger && userProfileMenu) {
    userProfileTrigger.addEventListener('click', (e) => {
      e.stopPropagation();
      const willOpen = userProfileMenu.hidden;
      userProfileMenu.hidden = !willOpen;
      userProfileTrigger.setAttribute('aria-expanded', String(willOpen));
    });

    userProfileMenu.addEventListener('click', (e) => {
      const opBtn = e.target.closest('#userMenuOperatorsBtn');
      if (opBtn) {
        closeUserDropdown();
        openOrFocusMenuTab('menu-operators', '운영자 관리');
        return;
      }
      const permBtn = e.target.closest('#userMenuPermissionsBtn');
      if (permBtn) {
        closeUserDropdown();
        openOrFocusMenuTab('menu-permissions', '권한 관리');
        return;
      }
      const item = e.target.closest('.user-dropdown-item[data-profile-tab]');
      if (!item) return;
      openAccountModal(item.getAttribute('data-profile-tab'));
    });

    document.addEventListener('click', (e) => {
      if (userProfileWrap && !userProfileWrap.contains(e.target)) {
        closeUserDropdown();
      }
    });
  }

  const topbarLogoutBtn = document.getElementById('topbarLogoutBtn');
  if (topbarLogoutBtn) {
    topbarLogoutBtn.addEventListener('click', () => {
      if (confirm('정말 로그아웃하시겠습니까?')) {
        showToast('안전하게 로그아웃되었습니다.');
      }
    });
  }

  modalTabs.forEach((tabBtn) => {
    tabBtn.addEventListener('click', () => {
      switchModalTab(tabBtn.getAttribute('data-modal-tab'));
    });
  });

  if (accountModalCloseBtn) {
    accountModalCloseBtn.addEventListener('click', closeAccountModal);
  }

  if (accountModalBackdrop) {
    accountModalBackdrop.addEventListener('click', (e) => {
      if (e.target === accountModalBackdrop || e.target.closest('[data-modal-cancel]')) {
        closeAccountModal();
      }
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeUserDropdown();
      closeAccountModal();
    }
  });

  if (panelAccount) {
    panelAccount.addEventListener('submit', (e) => {
      e.preventDefault();
      const nameVal = (document.getElementById('accNameInput')?.value || '').trim();
      const emailVal = (document.getElementById('accEmailInput')?.value || '').trim();
      const roleVal = (document.getElementById('accRoleInput')?.value || '').trim();
      if (nameVal) {
        if (topUserNameText) topUserNameText.textContent = nameVal;
        if (dropdownUserNameText) dropdownUserNameText.textContent = nameVal;
      }
      if (dropdownUserMetaText && (roleVal || emailVal)) {
        const dept = roleVal.split('·')[0].trim() || '정산운영팀';
        dropdownUserMetaText.textContent = `${dept} · ${emailVal}`;
      }
      closeAccountModal();
    });
  }

  if (panelPassword) {
    panelPassword.addEventListener('submit', (e) => {
      e.preventDefault();
      panelPassword.reset();
      closeAccountModal();
    });
  }

  // 8. Merchant Header Select Dropdowns (카드수수료율 / 상환 / 계약 관리)
  const cardFeeSelectWrap = document.getElementById('cardFeeSelectWrap');
  const cardFeeSelectBtn = document.getElementById('cardFeeSelectBtn');
  const cardFeeSelectMenu = document.getElementById('cardFeeSelectMenu');

  const repaymentSelectWrap = document.getElementById('repaymentSelectWrap');
  const repaymentSelectBtn = document.getElementById('repaymentSelectBtn');
  const repaymentSelectMenu = document.getElementById('repaymentSelectMenu');

  const contractSelectWrap = document.getElementById('contractSelectWrap');
  const contractSelectBtn = document.getElementById('contractSelectBtn');
  const contractSelectMenu = document.getElementById('contractSelectMenu');

  function closeCardFeeSelect() {
    if (cardFeeSelectMenu && cardFeeSelectBtn) {
      cardFeeSelectMenu.hidden = true;
      cardFeeSelectBtn.setAttribute('aria-expanded', 'false');
    }
  }

  function closeRepaymentSelect() {
    if (repaymentSelectMenu && repaymentSelectBtn) {
      repaymentSelectMenu.hidden = true;
      repaymentSelectBtn.setAttribute('aria-expanded', 'false');
    }
  }

  function closeContractSelect() {
    if (contractSelectMenu && contractSelectBtn) {
      contractSelectMenu.hidden = true;
      contractSelectBtn.setAttribute('aria-expanded', 'false');
    }
  }

  if (cardFeeSelectBtn && cardFeeSelectMenu) {
    cardFeeSelectBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      closeRepaymentSelect();
      closeContractSelect();
      const willOpen = cardFeeSelectMenu.hidden;
      cardFeeSelectMenu.hidden = !willOpen;
      cardFeeSelectBtn.setAttribute('aria-expanded', String(willOpen));
    });

    cardFeeSelectMenu.addEventListener('click', (e) => {
      const item = e.target.closest('.repayment-select-item[data-fee-action]');
      if (!item) return;
      closeCardFeeSelect();
      window.alert('준비중입니다.');
    });
  }

  if (repaymentSelectBtn && repaymentSelectMenu) {
    repaymentSelectBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      closeCardFeeSelect();
      closeContractSelect();
      const willOpen = repaymentSelectMenu.hidden;
      repaymentSelectMenu.hidden = !willOpen;
      repaymentSelectBtn.setAttribute('aria-expanded', String(willOpen));
    });

    repaymentSelectMenu.addEventListener('click', (e) => {
      const item = e.target.closest('.repayment-select-item[data-repay-type]');
      if (!item) return;
      closeRepaymentSelect();
      window.alert('준비중입니다.');
    });
  }

  if (contractSelectBtn && contractSelectMenu) {
    contractSelectBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      closeCardFeeSelect();
      closeRepaymentSelect();
      const willOpen = contractSelectMenu.hidden;
      contractSelectMenu.hidden = !willOpen;
      contractSelectBtn.setAttribute('aria-expanded', String(willOpen));
    });

    contractSelectMenu.addEventListener('click', (e) => {
      const item = e.target.closest('.repayment-select-item[data-contract-action]');
      if (!item) return;
      closeContractSelect();
      window.alert('준비중입니다.');
    });
  }

  document.addEventListener('click', (e) => {
    if (cardFeeSelectWrap && !cardFeeSelectWrap.contains(e.target)) {
      closeCardFeeSelect();
    }
    if (repaymentSelectWrap && !repaymentSelectWrap.contains(e.target)) {
      closeRepaymentSelect();
    }
    if (contractSelectWrap && !contractSelectWrap.contains(e.target)) {
      closeContractSelect();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeCardFeeSelect();
      closeRepaymentSelect();
      closeContractSelect();
    }
  });
  // ==========================================================================
  // 6. Operator Registration & Permission Management System (PRD 2, 5, 10)
  // ==========================================================================
  const operatorModalBackdrop = document.getElementById('operatorModalBackdrop');
  const openOperatorRegisterModalBtn = document.getElementById('openOperatorRegisterModalBtn');
  const operatorModalCloseBtn = document.getElementById('operatorModalCloseBtn');
  const operatorModalCancelBtn = document.getElementById('operatorModalCancelBtn');
  const operatorRegisterForm = document.getElementById('operatorRegisterForm');
  const opModalTitle = document.getElementById('opModalTitle');
  const operatorTableBody = document.getElementById('operatorTableBody');
  const operatorRoleTabs = document.getElementById('operatorRoleTabs');
  const operatorDeptFilter = document.getElementById('operatorDeptFilter');
  const operatorDbStatusFilter = document.getElementById('operatorDbStatusFilter');
  const operatorSearchInput = document.getElementById('operatorSearchInput');
  const savePermissionsBtn = document.getElementById('savePermissionsBtn');
  const resetPermissionsBtn = document.getElementById('resetPermissionsBtn');
  const exportOperatorsBtn = document.getElementById('exportOperatorsBtn');
  let editingOpRow = null;

  function showNotificationToast(msg) {
    let toast = document.getElementById('systemNotificationToast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'systemNotificationToast';
      toast.className = 'system-notification-toast';
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.classList.add('is-visible');
    setTimeout(() => {
      toast.classList.remove('is-visible');
    }, 2800);
  }

  function openOperatorModal(editTargetRow = null) {
    if (!operatorModalBackdrop) return;
    editingOpRow = editTargetRow;
    if (editingOpRow) {
      if (opModalTitle) opModalTitle.textContent = '운영자 정보 수정';
      const submitBtn = operatorRegisterForm ? operatorRegisterForm.querySelector('button[type="submit"]') : null;
      if (submitBtn) submitBtn.textContent = '변경사항 저장';

      const strongEl = editingOpRow.querySelector('.user-cell strong');
      const name = strongEl ? strongEl.textContent.trim() : '';
      const codeBadge = editingOpRow.querySelector('.code-badge');
      const code = codeBadge ? codeBadge.textContent.trim() : '';
      const role = editingOpRow.getAttribute('data-role') || 'sales';
      const dept = editingOpRow.getAttribute('data-dept') || '신탁영업 1팀';
      const phoneCell = editingOpRow.children[6];
      const phone = phoneCell ? phoneCell.textContent.trim() : '';
      const titleEl = editingOpRow.querySelector('.user-cell-role');
      const title = titleEl ? titleEl.textContent.trim() : '';

      const nameInput = document.getElementById('regOpName');
      const codeInput = document.getElementById('regOpCode');
      const deptInput = document.getElementById('regOpDept');
      const titleInput = document.getElementById('regOpTitle');
      const phoneInput = document.getElementById('regOpPhone');
      const emailInput = document.getElementById('regOpEmail');

      if (nameInput) nameInput.value = name;
      if (codeInput) codeInput.value = code;
      if (deptInput) deptInput.value = dept;
      if (titleInput) titleInput.value = title;
      if (phoneInput) phoneInput.value = phone;
      if (emailInput) emailInput.value = `${name.toLowerCase()}@festio.co.kr`;

      if (operatorRegisterForm) {
        const radio = operatorRegisterForm.querySelector(`input[name="regRole"][value="${role}"]`);
        if (radio) radio.checked = true;
      }
    } else {
      if (opModalTitle) opModalTitle.textContent = '신규 운영자 등록';
      const submitBtn = operatorRegisterForm ? operatorRegisterForm.querySelector('button[type="submit"]') : null;
      if (submitBtn) submitBtn.textContent = '운영자 계정 등록';
      if (operatorRegisterForm) operatorRegisterForm.reset();
      const codeInput = document.getElementById('regOpCode');
      if (codeInput) {
        const nextNum = Math.floor(25 + Math.random() * 20);
        codeInput.value = `FES-2026-0${nextNum}`;
      }
    }
    operatorModalBackdrop.hidden = false;
  }

  function closeOperatorModal() {
    if (operatorModalBackdrop) operatorModalBackdrop.hidden = true;
    editingOpRow = null;
  }

  if (openOperatorRegisterModalBtn) {
    openOperatorRegisterModalBtn.addEventListener('click', () => openOperatorModal(null));
  }
  if (operatorModalCloseBtn) {
    operatorModalCloseBtn.addEventListener('click', closeOperatorModal);
  }
  if (operatorModalCancelBtn) {
    operatorModalCancelBtn.addEventListener('click', closeOperatorModal);
  }
  if (operatorModalBackdrop) {
    operatorModalBackdrop.addEventListener('click', (e) => {
      if (e.target === operatorModalBackdrop) closeOperatorModal();
    });
  }

  if (operatorRegisterForm) {
    operatorRegisterForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('regOpName').value.trim();
      const code = document.getElementById('regOpCode').value.trim();
      const email = document.getElementById('regOpEmail').value.trim();
      const phone = document.getElementById('regOpPhone').value.trim();
      const dept = document.getElementById('regOpDept').value;
      const title = document.getElementById('regOpTitle').value.trim() || '매니저';
      const roleRadio = operatorRegisterForm.querySelector('input[name="regRole"]:checked');
      const role = roleRadio ? roleRadio.value : 'sales';
      const dbActive = document.getElementById('regDbActive') ? document.getElementById('regDbActive').checked : true;

      const roleBadgeClass = role === 'admin' ? 'role-badge--admin' : (role === 'lead' ? 'role-badge--lead' : 'role-badge--sales');
      const roleBadgeLabel = role === 'admin' ? '관리자' : (role === 'lead' ? '팀장' : '영업자');
      const userDotClass = role === 'admin' ? 'user-dot--admin' : (role === 'lead' ? 'user-dot--lead' : 'user-dot--sales');
      const custScope = role === 'admin' ? '전사 전체' : (role === 'lead' ? '팀 전체' : '본인 배정');

      if (editingOpRow) {
        editingOpRow.setAttribute('data-role', role);
        editingOpRow.setAttribute('data-dept', dept);
        editingOpRow.setAttribute('data-db', dbActive ? 'active' : 'paused');
        editingOpRow.children[0].innerHTML = `<span class="code-badge">${code}</span>`;
        editingOpRow.children[1].innerHTML = `
          <div class="user-cell">
            <span class="user-dot ${userDotClass}"></span>
            <div>
              <strong>${name}</strong>
              <span class="user-cell-role">${title}</span>
            </div>
          </div>
        `;
        editingOpRow.children[2].textContent = dept;
        editingOpRow.children[3].innerHTML = `<span class="role-badge ${roleBadgeClass}">${roleBadgeLabel}</span>`;
        editingOpRow.children[6].textContent = phone;
        const toggleInput = editingOpRow.querySelector('.toggle-switch input');
        if (toggleInput) toggleInput.checked = dbActive;

        showNotificationToast(`운영자 [${name}] 님의 정보가 수정되었습니다.`);
      } else {
        const tr = document.createElement('tr');
        tr.setAttribute('data-role', role);
        tr.setAttribute('data-dept', dept);
        tr.setAttribute('data-db', dbActive ? 'active' : 'paused');
        tr.innerHTML = `
          <td><span class="code-badge">${code}</span></td>
          <td>
            <div class="user-cell">
              <span class="user-dot ${userDotClass}"></span>
              <div>
                <strong>${name}</strong>
                <span class="user-cell-role">${title}</span>
              </div>
            </div>
          </td>
          <td>${dept}</td>
          <td><span class="role-badge ${roleBadgeClass}">${roleBadgeLabel}</span></td>
          <td>
            <span class="product-tag">선정산</span>
            <span class="product-tag">신탁</span>
          </td>
          <td style="text-align: center;"><strong>${custScope} (신규)</strong></td>
          <td>${phone}</td>
          <td style="text-align: center;">
            <label class="toggle-switch" title="DB 자동 배정 활성 상태">
              <input type="checkbox" ${dbActive ? 'checked' : ''} />
              <span class="toggle-slider"></span>
            </label>
          </td>
          <td style="text-align: center;">
            <button type="button" class="btn btn--sm btn--secondary edit-op-btn">수정</button>
            <button type="button" class="btn btn--sm btn--secondary perm-op-btn">권한</button>
          </td>
        `;
        if (operatorTableBody) {
          operatorTableBody.prepend(tr);
        }
        showNotificationToast(`신규 운영자 [${name}] 님이 성공적으로 등록되었습니다.`);
      }
      closeOperatorModal();
      filterOperatorTable();
    });
  }

  function filterOperatorTable() {
    if (!operatorTableBody) return;
    const activeTab = operatorRoleTabs ? operatorRoleTabs.querySelector('.period-tab--active') : null;
    const selectedRole = activeTab ? activeTab.getAttribute('data-op-role') : 'all';
    const selectedDept = operatorDeptFilter ? operatorDeptFilter.value : 'all';
    const selectedDb = operatorDbStatusFilter ? operatorDbStatusFilter.value : 'all';
    const query = operatorSearchInput ? operatorSearchInput.value.trim().toLowerCase() : '';

    const rows = operatorTableBody.querySelectorAll('tr');
    rows.forEach((row) => {
      const rowRole = row.getAttribute('data-role');
      const rowDept = row.getAttribute('data-dept');
      const rowDb = row.getAttribute('data-db');
      const text = row.textContent.toLowerCase();

      const matchRole = selectedRole === 'all' || rowRole === selectedRole;
      const matchDept = selectedDept === 'all' || (rowDept && rowDept.includes(selectedDept));
      const matchDb = selectedDb === 'all' || rowDb === selectedDb;
      const matchQuery = !query || text.includes(query);

      row.style.display = (matchRole && matchDept && matchDb && matchQuery) ? '' : 'none';
    });
  }

  if (operatorRoleTabs) {
    operatorRoleTabs.querySelectorAll('.period-tab').forEach((tab) => {
      tab.addEventListener('click', () => {
        operatorRoleTabs.querySelectorAll('.period-tab').forEach((t) => t.classList.remove('period-tab--active'));
        tab.classList.add('period-tab--active');
        filterOperatorTable();
      });
    });
  }
  if (operatorDeptFilter) operatorDeptFilter.addEventListener('change', filterOperatorTable);
  if (operatorDbStatusFilter) operatorDbStatusFilter.addEventListener('change', filterOperatorTable);
  if (operatorSearchInput) operatorSearchInput.addEventListener('input', filterOperatorTable);

  if (operatorTableBody) {
    operatorTableBody.addEventListener('click', (e) => {
      const editBtn = e.target.closest('.edit-op-btn');
      if (editBtn) {
        const row = editBtn.closest('tr');
        openOperatorModal(row);
        return;
      }
      const permBtn = e.target.closest('.perm-op-btn');
      if (permBtn) {
        openOrFocusMenuTab('menu-permissions', '권한 관리');
        return;
      }
    });
  }

  if (savePermissionsBtn) {
    savePermissionsBtn.addEventListener('click', () => {
      showNotificationToast('역할별 세부 권한 변경사항이 안전하게 저장되었습니다.');
    });
  }

  if (resetPermissionsBtn) {
    resetPermissionsBtn.addEventListener('click', () => {
      if (window.confirm('모든 역할 권한을 시스템 표준 기본값으로 초기화하시겠습니까?')) {
        showNotificationToast('권한 설정이 표준 기본값으로 복원되었습니다.');
      }
    });
  }

  if (exportOperatorsBtn) {
    exportOperatorsBtn.addEventListener('click', () => {
      showNotificationToast('전체 운영자 목록(24명) CSV 다운로드가 완료되었습니다.');
    });
  }

  // Floating Design System Color Guide Drawer
  const floatingDesignGuideBtn = document.getElementById('floatingDesignGuideBtn');
  const designGuideDrawer = document.getElementById('designGuideDrawer');
  const designGuideBackdrop = document.getElementById('designGuideBackdrop');
  const designGuideCloseBtn = document.getElementById('designGuideCloseBtn');

  function openDesignGuide() {
    if (designGuideDrawer && designGuideBackdrop) {
      designGuideDrawer.hidden = false;
      designGuideBackdrop.hidden = false;
      requestAnimationFrame(() => {
        designGuideDrawer.classList.add('is-open');
        designGuideBackdrop.classList.add('is-open');
      });
    }
  }

  function closeDesignGuide() {
    if (designGuideDrawer && designGuideBackdrop) {
      designGuideDrawer.classList.remove('is-open');
      designGuideBackdrop.classList.remove('is-open');
      setTimeout(() => {
        designGuideDrawer.hidden = true;
        designGuideBackdrop.hidden = true;
      }, 250);
    }
  }

  if (floatingDesignGuideBtn) {
    floatingDesignGuideBtn.addEventListener('click', openDesignGuide);
  }
  if (designGuideCloseBtn) {
    designGuideCloseBtn.addEventListener('click', closeDesignGuide);
  }
  if (designGuideBackdrop) {
    designGuideBackdrop.addEventListener('click', closeDesignGuide);
  }
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && designGuideDrawer && !designGuideDrawer.hidden) {
      closeDesignGuide();
    }
  });

  // Color chips copy to clipboard
  document.querySelectorAll('.dg-chip').forEach((chip) => {
    chip.addEventListener('click', () => {
      const code = chip.getAttribute('data-copy');
      if (code && navigator.clipboard) {
        navigator.clipboard.writeText(code).then(() => {
          showNotificationToast(`클립보드에 복사되었습니다: ${code}`);
        }).catch(() => {});
      }
    });
  });

  // Design Guide Tabs Switching
  const dgTabs = document.querySelectorAll('.dg-nav-tab');
  const dgSections = document.querySelectorAll('.design-guide-body [data-dg-section]');
  dgTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      dgTabs.forEach(t => t.classList.remove('is-active'));
      tab.classList.add('is-active');
      const target = tab.getAttribute('data-dg-tab');
      dgSections.forEach((sec) => {
        if (target === 'all' || sec.getAttribute('data-dg-section') === target) {
          sec.style.display = '';
        } else {
          sec.style.display = 'none';
        }
      });
    });
  });

  // Design Guide Live Search
  const dgSearchInput = document.getElementById('dgSearchInput');
  if (dgSearchInput) {
    dgSearchInput.addEventListener('input', (e) => {
      const q = e.target.value.trim().toLowerCase();
      const chips = document.querySelectorAll('.dg-chip');
      const rows = document.querySelectorAll('.dg-table tbody tr');
      if (!q) {
        chips.forEach(c => c.style.display = '');
        rows.forEach(r => r.style.display = '');
        return;
      }
      chips.forEach((c) => {
        const text = c.textContent.toLowerCase();
        c.style.display = text.includes(q) ? '' : 'none';
      });
      rows.forEach((r) => {
        const text = r.textContent.toLowerCase();
        r.style.display = text.includes(q) ? '' : 'none';
      });
    });
  }

  // 3:7 Master-Detail Organization List Switching & Filtering
  const orgSearchInput = document.getElementById('orgSearchInput');
  const orgManagerFilter = document.getElementById('orgManagerFilter');
  const orgFilterTabs = document.querySelectorAll('.org-filter-tab');
  const orgItems = document.querySelectorAll('.org-item');
  const orgPaneCount = document.getElementById('orgPaneCount');
  const orgStatTotal = document.getElementById('orgStatTotal');
  const orgStatNormal = document.getElementById('orgStatNormal');
  const orgStatOverdue = document.getElementById('orgStatOverdue');
  const orgStatDone = document.getElementById('orgStatDone');
  let activeOrgFilter = 'all';
  let activeManagerFilter = 'all';

  function applyOrgFilters() {
    const q = orgSearchInput ? orgSearchInput.value.trim().toLowerCase() : '';
    let visibleCount = 0;
    let totalForManager = 0;
    let normalForManager = 0;
    let overdueForManager = 0;
    let doneForManager = 0;
    let firstVisible = null;
    let activeIsHidden = false;

    orgItems.forEach((item) => {
      const status = item.getAttribute('data-org-status') || '';
      const manager = item.getAttribute('data-org-manager') || '';
      const text = item.textContent.toLowerCase();
      const matchManager = activeManagerFilter === 'all' || manager === activeManagerFilter;
      const matchSearch = !q || text.includes(q);

      if (matchManager && matchSearch) {
        totalForManager += 1;
        if (status === 'normal') normalForManager += 1;
        else if (status === 'overdue') overdueForManager += 1;
        else if (status === 'done') doneForManager += 1;
      }

      const matchFilter = activeOrgFilter === 'all' || status === activeOrgFilter;
      const show = matchManager && matchFilter && matchSearch;
      item.style.display = show ? '' : 'none';
      if (show) {
        visibleCount += 1;
        if (!firstVisible) firstVisible = item;
      } else if (item.classList.contains('is-active')) {
        activeIsHidden = true;
      }
    });

    if (orgPaneCount) orgPaneCount.textContent = `(${visibleCount})`;
    if (orgStatTotal) orgStatTotal.textContent = String(totalForManager);
    if (orgStatNormal) orgStatNormal.textContent = String(normalForManager);
    if (orgStatOverdue) orgStatOverdue.textContent = String(overdueForManager);
    if (orgStatDone) orgStatDone.textContent = String(doneForManager);

    if (activeIsHidden && firstVisible) {
      firstVisible.click();
    }
  }

  if (orgSearchInput) {
    orgSearchInput.addEventListener('input', applyOrgFilters);
  }

  if (orgManagerFilter) {
    orgManagerFilter.addEventListener('change', (e) => {
      activeManagerFilter = e.target.value || 'all';
      applyOrgFilters();
    });
  }

  orgFilterTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      orgFilterTabs.forEach((t) => t.classList.remove('is-active'));
      tab.classList.add('is-active');
      activeOrgFilter = tab.getAttribute('data-org-filter') || 'all';
      applyOrgFilters();
    });
  });

  orgItems.forEach((item) => {
    item.addEventListener('click', () => {
      orgItems.forEach((el) => {
        el.classList.remove('is-active');
        el.setAttribute('aria-selected', 'false');
      });
      item.classList.add('is-active');
      item.setAttribute('aria-selected', 'true');

      const name = item.getAttribute('data-org-name');
      const ceo = item.getAttribute('data-org-ceo');
      const manager = item.getAttribute('data-org-manager');
      const channel = item.getAttribute('data-org-channel');
      const dateStr = item.getAttribute('data-org-date');
      const fee = item.getAttribute('data-org-fee');
      const overdue = item.getAttribute('data-org-overdue');
      const days = item.getAttribute('data-org-days');
      const collected = item.getAttribute('data-org-collected');
      const remaining = item.getAttribute('data-org-remaining');

      const mainBranchName = document.querySelector('.branch-select-name');
      if (mainBranchName && name) mainBranchName.textContent = name;

      const dateBadge = document.querySelector('.merchant-header-left .status-badge');
      if (dateBadge && dateStr) dateBadge.textContent = dateStr;

      const metaVals = document.querySelectorAll('.merchant-meta-list .meta-v');
      if (metaVals.length >= 3) {
        if (ceo) metaVals[0].textContent = ceo;
        if (manager) metaVals[1].textContent = manager;
        if (channel) metaVals[2].textContent = channel;
      }

      const feeTag = document.querySelector('.fee-rate-tag');
      if (feeTag && fee) feeTag.textContent = `수수료율 ${fee}`;

      const overdueTag = document.getElementById('topOverdueStatusTag');
      if (overdueTag) {
        if (overdue) {
          overdueTag.style.display = '';
          overdueTag.innerHTML = `<span class="overdue-dot" aria-hidden="true"></span>${overdue}`;
        } else {
          overdueTag.style.display = 'none';
        }
      }

      const summarySpans = document.querySelectorAll('.repayment-collapsed-summary span');
      if (summarySpans.length >= 5) {
        if (days) summarySpans[0].textContent = days;
        if (collected) summarySpans[2].innerHTML = `회수 <strong>${collected}</strong>`;
        if (remaining) summarySpans[4].innerHTML = `잔여 <strong>${remaining}</strong>`;
      }

      if (typeof showNotificationToast === 'function' && name) {
        showNotificationToast(`기관 선택: ${name}`);
      }
    });
  });
})();
