'use strict';
(() => {
  const menuButton = document.querySelector('.menu-toggle');
  const nav = document.querySelector('#site-nav');
  if (menuButton && nav) {
    menuButton.hidden = false;
    const narrow = window.matchMedia('(max-width: 800px)');
    const setMenu = (open) => {
      nav.dataset.open = String(open);
      menuButton.setAttribute('aria-expanded', String(open));
      menuButton.querySelector('[data-menu-label]').textContent = open ? '메뉴 닫기' : '메뉴 열기';
    };
    setMenu(!narrow.matches);
    menuButton.addEventListener('click', () => setMenu(nav.dataset.open !== 'true'));
    const resizeMenu = () => {
      const focusWasInside = nav.contains(document.activeElement);
      setMenu(!narrow.matches);
      if (narrow.matches && focusWasInside) menuButton.focus();
    };
    if (narrow.addEventListener) narrow.addEventListener('change', resizeMenu);
    else narrow.addListener(resizeMenu);
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && narrow.matches && nav.dataset.open === 'true') {
        setMenu(false);
        menuButton.focus();
      }
    });
  }
  const grid = document.querySelector('#company-grid');

  const companies = [
    {id:'gaon', name:'가온기술', sector:'기술', price:52400, description:'업무에 필요한 프로그램을 만드는 가상 기업입니다. 기업용 서비스 사업을 예시로 살펴봅니다.', question:'지속적으로 서비스를 이용하는 고객이 늘고 있나요?'},
    {id:'nuri', name:'누리반도체', sector:'기술', price:37800, description:'전자제품에 들어가는 부품을 설계하는 가상 기업입니다. 주문과 생산 흐름을 예시로 살펴봅니다.', question:'제품 주문량과 재고는 어떻게 달라지고 있나요?'},
    {id:'on', name:'온생활', sector:'생활', price:18600, description:'일상에서 쓰는 생활용품을 판매하는 가상 기업입니다. 고객의 반복 구매를 예시로 살펴봅니다.', question:'매출이 늘어날 때 비용과 이익도 함께 확인했나요?'},
    {id:'bom', name:'봄날식품', sector:'생활', price:24100, description:'간편하게 먹을 수 있는 식품을 만드는 가상 기업입니다. 원재료 가격과 판매 흐름을 살펴봅니다.', question:'원재료 가격 변화가 이익에 어떤 영향을 주나요?'},
    {id:'bit', name:'빛에너지', sector:'에너지', price:31200, description:'태양광 발전 설비를 만드는 가상 기업입니다. 계약과 설치 과정을 예시로 살펴봅니다.', question:'계약한 사업이 실제 매출로 이어지는 시점은 언제인가요?'},
    {id:'pureun', name:'푸른전력', sector:'에너지', price:28700, description:'전력 사용을 효율적으로 관리하는 가상 기업입니다. 설비 투자와 운영비를 예시로 살펴봅니다.', question:'새로운 설비에 필요한 비용과 기대 효과를 비교했나요?'}
  ];
  const storageKey = 'lpk-morgans-favorites-v1';
  const input = document.querySelector('#company-search');
  const savedOnly = document.querySelector('#saved-only');
  const status = document.querySelector('#action-status');
  const storageStatus = document.querySelector('#storage-status');
  let favorites = new Set();
  let category = '전체';
  let storageAvailable = true;
  function warnStorage() {
    storageAvailable = false;
    if (storageStatus) storageStatus.textContent = '이 브라우저에서 저장을 사용할 수 없습니다. 관심종목은 현재 화면에서만 유지됩니다. 파일로 연 경우 브라우저 설정에 따라 저장이 제한될 수 있습니다.';
  }
  try {
    const raw = localStorage.getItem(storageKey);
    const stored = raw ? JSON.parse(raw) : [];
    if (Array.isArray(stored)) favorites = new Set(stored.filter(id => companies.some(company => company.id === id)));
    localStorage.setItem(storageKey, JSON.stringify([...favorites]));
  } catch (_) { warnStorage(); }
  const homeSummary = document.querySelector('#home-saved-summary');
  if (homeSummary) {
    const updateSummary = () => { homeSummary.textContent = favorites.size ? `저장한 관심 기업 ${favorites.size}개 · ${companies.filter(c => favorites.has(c.id)).map(c => c.name).join(', ')}` : '아직 저장한 기업이 없습니다. 투자 정보에서 별 버튼을 눌러 관심종목을 추가해 보세요.'; };
    updateSummary();
    window.addEventListener('pageshow', () => {
      try { const data = JSON.parse(localStorage.getItem(storageKey) || '[]'); if (Array.isArray(data)) favorites = new Set(data.filter(id => companies.some(c => c.id === id))); } catch (_) {}
      updateSummary();
    });
  }
  if (!grid) return;
  const notesKey = 'lpk-morgans-notes-v1';
  let notes = {};
  try {
    const data = JSON.parse(localStorage.getItem(notesKey) || '{}');
    if (data && typeof data === 'object' && !Array.isArray(data)) {
      companies.forEach(company => { if (typeof data[company.id] === 'string') notes[company.id] = data[company.id].slice(0, 300); });
    }
  } catch (_) { warnStorage(); }
  savedOnly.checked = new URLSearchParams(window.location.search).get('view') === 'saved';
  function render() {
    const query = input.value.trim().toLocaleLowerCase('ko');
    const matches = companies.filter(company =>
      (category === '전체' || company.sector === category) &&
      (!savedOnly.checked || favorites.has(company.id)) &&
      `${company.name} ${company.sector} ${company.description}`.toLocaleLowerCase('ko').includes(query)
    );
    grid.replaceChildren();
    matches.forEach(company => {
      const selected = favorites.has(company.id);
      const article = document.createElement('article');
      article.className = 'company-card';
      // Values below are fixed illustrative records; user search text is never inserted as HTML.
      article.innerHTML = `<div class="company-card-header"><div class="company-symbol" aria-hidden="true">${company.name[0]}</div><div><h3>${company.name}</h3><p class="category">가상 기업 · ${company.sector}</p></div><button type="button" class="save-button" data-id="${company.id}" aria-pressed="${selected}" aria-label="${company.name} 관심종목 ${selected ? '해제' : '추가'}">${selected ? '★' : '☆'}</button></div><p class="description">${company.description}</p><div class="company-meta"><span>예시 주가</span><strong>${company.price.toLocaleString('ko-KR')}원</strong></div><div class="question-box"><h3>확인할 질문</h3><p>${company.question}</p></div><p class="source">출처: 학습용 가상 자료<br>기준일: 2026년 11월 2일 · 실제 시세 아님</p>`;
      const chartLink = document.createElement('a');
      chartLink.href = '#detail-chart-title'; chartLink.className = 'company-chart-link';
      chartLink.textContent = '이 기업의 예시 차트 보기';
      chartLink.addEventListener('click', () => { chartSelect.value = company.id; drawChart(); document.querySelector('#detail-chart-title').focus(); });
      article.append(chartLink);
      if (selected) {
        const editor = document.createElement('div'); editor.className = 'note-editor';
        const label = document.createElement('label'); label.htmlFor = `note-${company.id}`; label.textContent = '나의 관심 메모';
        const textarea = document.createElement('textarea'); textarea.id = label.htmlFor; textarea.dataset.note = company.id; textarea.maxLength = 300; textarea.value = notes[company.id] || ''; textarea.placeholder = '관심 이유나 확인할 내용을 적어 보세요.';
        const help = document.createElement('p'); help.className = 'note-help'; help.id = `note-help-${company.id}`; help.textContent = '최대 300자 · 이 브라우저에 자동 저장됩니다.'; textarea.setAttribute('aria-describedby', help.id);
        if (!storageAvailable) help.textContent = '최대 300자 · 저장이 제한되어 현재 화면에서만 유지됩니다.';
        const noteStatus = document.createElement('p'); noteStatus.className = 'note-save-status'; noteStatus.dataset.noteStatus = company.id;
        editor.append(label,textarea,help,noteStatus); article.append(editor);
      }
      grid.append(article);
    });
    document.querySelector('#result-count').textContent = `${matches.length}개`;
    document.querySelector('#empty-state').hidden = matches.length > 0;
  }
  const chartSelect = document.querySelector('#chart-company');
  let period = '1개월';
  document.querySelector('#detail-chart-title').tabIndex = -1;
  companies.forEach(company => {
    const option = document.createElement('option'); option.value = company.id; option.textContent = `${company.name} · ${company.sector}`; chartSelect.append(option);
  });
  function drawChart() {
    const company = companies.find(c => c.id === chartSelect.value) || companies[0];
    const offset = companies.indexOf(company) * 3 + ['1주','1개월','3개월','1년'].indexOf(period) * 9;
    const values = Array.from({length:40}, (_, i) => 70 + Math.sin(i * .55 + offset) * 12 + Math.cos(i * .23 + offset) * 8 + i * .6);
    const min = Math.min(...values) - 8, max = Math.max(...values) + 8;
    const points = values.map((v,i) => `${(20+i*760/39).toFixed(1)},${(210-(v-min)/(max-min)*180).toFixed(1)}`);
    const line = points.map((point,i) => (i ? 'L' : 'M') + point).join(' ');
    document.querySelector('#chart-company-name').textContent = company.name + ' · ' + period;
    document.querySelector('#chart-price').textContent = company.price.toLocaleString('ko-KR') + '원 · 예시';
    document.querySelector('#detail-chart').innerHTML = `<svg class="detail-chart-svg" viewBox="0 0 800 240" role="img" aria-label="${company.name} ${period} 임의 예시 차트. 실제 주가가 아닙니다."><g stroke="#dfe4ea"><path d="M20 40H780M20 95H780M20 150H780M20 205H780"/></g><path d="${line} L780 225H20Z" fill="#b28a45" fill-opacity=".12"/><path d="${line}" fill="none" stroke="#b28a45" stroke-width="3" stroke-linejoin="round"/></svg><div class="chart-axis"><span>기간 시작</span><span>${period} · 임의 값</span><span>기간 끝</span></div>`;
  }
  chartSelect.addEventListener('change', drawChart);
  document.querySelectorAll('[data-period]').forEach(button => button.addEventListener('click', () => {
    period = button.dataset.period;
    document.querySelectorAll('[data-period]').forEach(item => { const active = item === button; item.classList.toggle('active',active); item.setAttribute('aria-pressed',String(active)); });
    drawChart();
  }));
  grid.addEventListener('input', event => {
    const textarea = event.target.closest('textarea[data-note]'); if (!textarea) return;
    const id = textarea.dataset.note; notes[id] = textarea.value.slice(0,300);
    if (storageAvailable) { try { localStorage.setItem(notesKey,JSON.stringify(notes)); } catch (_) { warnStorage(); } }
    const message = storageAvailable ? '메모를 저장했습니다.' : '메모는 현재 화면에서만 유지됩니다.';
    grid.querySelector(`[data-note-status="${id}"]`).textContent = message;
  });
  drawChart();
  document.querySelector('#search-form').addEventListener('submit', event => {
    event.preventDefault(); render();
    status.textContent = `검색 결과 ${grid.children.length}개입니다.`;
  });
  input.addEventListener('input', () => { render(); status.textContent = `검색 결과 ${grid.children.length}개입니다.`; });
  document.querySelectorAll('[data-category]').forEach(button => {
    button.addEventListener('click', () => {
      category = button.dataset.category;
      document.querySelectorAll('[data-category]').forEach(item => {
        const active = item === button;
        item.classList.toggle('active', active);
        item.setAttribute('aria-pressed', String(active));
      });
      render(); status.textContent = `${category} 분야, ${grid.children.length}개 기업이 표시됩니다.`;
    });
  });
  savedOnly.addEventListener('change', () => { render(); status.textContent = `${savedOnly.checked ? '관심종목' : '전체 기업'} ${grid.children.length}개가 표시됩니다.`; });
  grid.addEventListener('click', event => {
    const button = event.target.closest('.save-button');
    if (!button) return;
    const id = button.dataset.id;
    const wasSaved = favorites.has(id);
    if (wasSaved) favorites.delete(id); else favorites.add(id);
    if (storageAvailable) {
      try { localStorage.setItem(storageKey, JSON.stringify([...favorites])); }
      catch (_) { warnStorage(); }
    }
    const company = companies.find(item => item.id === id);
    const buttons = [...grid.querySelectorAll('.save-button')];
    const index = buttons.indexOf(button);
    render();
    const remaining = [...grid.querySelectorAll('.save-button')];
    const focusTarget = remaining.find(item => item.dataset.id === id) || remaining[Math.min(index, remaining.length - 1)] || document.querySelector('#reset-filters');
    focusTarget.focus();
    status.textContent = `${company.name} ${wasSaved ? '관심종목에서 해제했습니다.' : storageAvailable ? '관심종목에 저장했습니다.' : '관심종목에 추가했습니다. 현재 화면에서만 유지됩니다.'}`;
  });
  document.querySelector('#reset-filters').addEventListener('click', () => {
    input.value = ''; category = '전체'; savedOnly.checked = false;
    document.querySelectorAll('[data-category]').forEach(button => {
      const active = button.dataset.category === '전체';
      button.classList.toggle('active', active); button.setAttribute('aria-pressed', String(active));
    });
    render(); input.focus(); status.textContent = '전체 기업을 표시합니다.';
  });
  window.addEventListener('storage', event => {
    if (event.key !== storageKey && event.key !== null) return;
    try {
      const stored = event.newValue ? JSON.parse(event.newValue) : [];
      favorites = new Set(Array.isArray(stored) ? stored.filter(id => companies.some(company => company.id === id)) : []);
      render();
    } catch (_) { /* Ignore malformed data from another tab. */ }
  });
  render();
})();
