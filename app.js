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

    // Toss Design System (TDS) Primary Blue (#3182f6) for completed repayment segments
    function getCompletedColor(index, count) {
      return '#3182f6';
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

    if (tabId === 'settlement-status') {
      if (settlementDetailView) settlementDetailView.style.display = 'flex';
      if (comingSoonView) comingSoonView.hidden = true;
    } else {
      if (settlementDetailView) settlementDetailView.style.display = 'none';
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

  const sidebarSearchInput = document.getElementById('sidebarSearchInput');
  if (sidebarSearchInput) {
    window.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        sidebarSearchInput.focus();
      }
    });

    sidebarSearchInput.addEventListener('input', () => {
      const q = sidebarSearchInput.value.trim().toLowerCase();
      document.querySelectorAll('.sidebar .nav-item, .sidebar .nav-subitem').forEach((item) => {
        const text = item.textContent.toLowerCase();
        const row = item.closest('.nav-item-row') || item;
        row.style.display = !q || text.includes(q) ? '' : 'none';
      });
      if (q && loanSubMenu) {
        loanSubMenu.style.display = 'flex';
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
    const fee = Math.floor(baseDeposit * 0.009);
    const totalRepayDays = selectionState.baseDays + selectionState.extraDays;
    const repayAmount = totalRepayDays * 410000;
    const overdueAmount = selectionState.overdueDays * 410000;
    const bondFee = parseInt(String(bondFeeInput ? bondFeeInput.value : '0').replace(/[^0-9]/g, ''), 10) || 0;
    const payout = Math.max(0, baseDeposit - fee - repayAmount - overdueAmount - bondFee);

    if (previewDepositVal) previewDepositVal.textContent = formatKRW(baseDeposit);
    if (previewFeeVal) previewFeeVal.textContent = formatKRW(fee);
    if (previewRepayLabel) previewRepayLabel.textContent = `일 상환금(${totalRepayDays}일)`;
    if (previewRepayVal) previewRepayVal.textContent = formatKRW(repayAmount);
    if (previewOverdueVal) {
      previewOverdueVal.textContent = formatKRW(overdueAmount);
      previewOverdueVal.classList.toggle('term-val--danger', overdueAmount > 0);
    }
    if (previewBondVal) previewBondVal.textContent = formatKRW(bondFee);
    if (previewPayoutVal) previewPayoutVal.textContent = formatKRW(payout);

    return { baseDeposit, fee, totalRepayDays, repayAmount, overdueAmount, bondFee, payout };
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
    const { baseDeposit, fee, repayAmount, overdueAmount, bondFee, payout } = computePreviewNumbers();
    const cells = firstRow.querySelectorAll('.td-cell');
    // 12-Column indices:
    // 0: 정산일/유형, 1: 매출일, 2: 카드매출, 3: (+)실입금, 4: (-)정산수수료, 5: (-)일상환금, 6: (-)채권수수료, 7: (-)기존미납, 8: 신규미납, 9: (=)지급액(보낼돈), 10: 상태, 11: 정산 삭제
    if (cells.length >= 10) {
      const depEl = cells[3].querySelector('.deposit-amount');
      if (depEl) depEl.textContent = formatKRW(baseDeposit);
      cells[4].textContent = `-${formatKRW(fee)}`;
      cells[5].textContent = `-${formatKRW(repayAmount)}`;
      cells[6].textContent = bondFee > 0 ? `-${formatKRW(bondFee)}` : '—';
      cells[6].classList.toggle('td-cell--muted', bondFee <= 0);
      cells[6].classList.toggle('td-cell--deduct', bondFee > 0);
      cells[7].textContent = overdueAmount > 0 ? `-${formatKRW(overdueAmount)}` : '—';
      cells[7].classList.toggle('td-cell--muted', overdueAmount <= 0);
      cells[7].classList.toggle('td-cell--deduct', overdueAmount > 0);
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
})();
