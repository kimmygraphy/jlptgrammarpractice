// ===== STATE =====
const state = {
  activeTab: 'verb',
  selectedForms: ['masu'],
  selectedLevels: ['N5', 'N4', 'N3'],
  showFurigana: true,
  prioritizeFrequent: true,
  trapBoost: false,
  wrongBoost: true,
  currentSet: [],
  questionCount: 40,
  results: {},
  wrongVerbs: {},
  revealedAnswers: new Set(),
  // derived tab
  derivedForm: 'potential',
  // grammar tab
  grammarFilter: 'all',
  // conjecture tab
  conjectureFilter: 'all',
  // giving/receiving tab
  grFilter: 'all',
  // honorific tab
  honorificType: 'both',
  // comprehensive tab
  compModes: ['verb', 'potential', 'passive', 'causative', 'giving_receiving', 'conjecture'],
};

// ===== localStorage =====
function loadWrongVerbs() {
  try { return JSON.parse(localStorage.getItem('jlpt_wrong_verbs') || '{}'); } catch { return {}; }
}
function saveWrongVerbs() {
  try { localStorage.setItem('jlpt_wrong_verbs', JSON.stringify(state.wrongVerbs)); } catch {}
}
function getWrongKey(id, form) { return `${id}_${form}`; }

// ===== FURIGANA =====
function furigana(word, reading) {
  if (!word) return '';
  if (!state.showFurigana || !reading || reading === word) return `<span class="kanji-plain">${word}</span>`;
  return `<ruby>${word}<rt>${reading}</rt></ruby>`;
}

// ===== FORM LABELS =====
const ALL_FORMS = Object.keys(FORM_LABELS);

// ===== WEIGHTED SAMPLING =====
function weightedSample(items, weightFn, count) {
  const weights = items.map(weightFn);
  const total = weights.reduce((a, b) => a + b, 0);
  const selected = [];
  const used = new Set();
  const cap = Math.min(count, items.length);
  let tries = 0;
  while (selected.length < cap && tries < cap * 20) {
    tries++;
    let r = Math.random() * total, cum = 0;
    for (let i = 0; i < items.length; i++) {
      cum += weights[i];
      if (r <= cum && !used.has(i)) { used.add(i); selected.push(items[i]); break; }
    }
  }
  // fill remainder
  items.forEach((item, i) => {
    if (selected.length < cap && !used.has(i)) { used.add(i); selected.push(item); }
  });
  return selected;
}

// ===== PROGRESS =====
function updateProgress() {
  const total = state.currentSet.length;
  const correct = Object.values(state.results).filter(r => r === 'correct').length;
  const wrong   = Object.values(state.results).filter(r => r === 'wrong').length;
  const answered = correct + wrong;
  const el  = document.getElementById('progress-text');
  const bar = document.getElementById('progress-fill');
  const st  = document.getElementById('stats-detail');
  if (el)  el.textContent  = `${answered} / ${total}`;
  if (bar) bar.style.width = total > 0 ? `${(answered / total) * 100}%` : '0%';
  if (st)  st.textContent  = answered > 0 ? `맞음 ${correct}  틀림 ${wrong}  정답률 ${Math.round(correct/answered*100)}%` : '—';
  document.getElementById('wrong-count').textContent = Object.keys(state.wrongVerbs).length;
}

// ===== MARK RESULT (shared) =====
function markResult(key, result) {
  const prev = state.results[key];
  state.results[key] = prev === result ? null : result;
  const card = document.querySelector(`[data-key="${key}"]`);
  if (card) {
    card.classList.remove('result-correct', 'result-wrong');
    if (state.results[key]) card.classList.add(`result-${state.results[key]}`);
    card.querySelector('.btn-correct')?.classList.toggle('active', state.results[key] === 'correct');
    card.querySelector('.btn-wrong')?.classList.toggle('active',   state.results[key] === 'wrong');
  }
  // update wrongVerbs
  const parts = key.split('_');
  const id = parseInt(parts[0]), form = parts.slice(1).join('_');
  const wk = getWrongKey(id, form);
  if (state.results[key] === 'wrong') {
    state.wrongVerbs[wk] = (state.wrongVerbs[wk] || 0) + 1;
  } else if (prev === 'wrong') {
    if (state.wrongVerbs[wk] > 0) { state.wrongVerbs[wk]--; if (!state.wrongVerbs[wk]) delete state.wrongVerbs[wk]; }
  }
  saveWrongVerbs();
  updateProgress();
}

function toggleAnswer(key) {
  state.revealedAnswers.has(key) ? state.revealedAnswers.delete(key) : state.revealedAnswers.add(key);
  const ansEl = document.querySelector(`[data-key="${key}"] .answer-section`);
  const btnEl = document.querySelector(`[data-key="${key}"] .btn-reveal`);
  if (ansEl) ansEl.classList.toggle('revealed', state.revealedAnswers.has(key));
  if (btnEl) btnEl.textContent = state.revealedAnswers.has(key) ? '답 숨기기' : '정답 보기';
}

// ===== CARD ACTIONS HTML =====
function actionsHTML(key, result) {
  return `
    <div class="card-actions">
      <button class="btn-reveal" onclick="toggleAnswer('${key}')">정답 보기</button>
      <div class="result-buttons">
        <button class="btn-correct ${result==='correct'?'active':''}" onclick="markResult('${key}','correct')">○ 맞음</button>
        <button class="btn-wrong ${result==='wrong'?'active':''}" onclick="markResult('${key}','wrong')">× 틀림</button>
      </div>
    </div>`;
}

// ===== TAB: 동사활용 =====
function generateVerbQuestions() {
  const levels = state.selectedLevels;
  const forms = state.selectedForms.includes('all') ? ALL_FORMS : state.selectedForms;
  const pool = VERB_DB.filter(v => levels.includes(v.jlpt));
  if (!pool.length || !forms.length) return;

  const candidates = [];
  for (const verb of pool) for (const form of forms) candidates.push({ verb, form });

  const sampled = weightedSample(candidates, ({ verb, form }) => {
    let w = 1;
    if (state.prioritizeFrequent) w *= verb.frequency;
    if (state.trapBoost && verb.trap) w *= 3;
    if (state.wrongBoost) w *= 1 + (state.wrongVerbs[getWrongKey(verb.id, form)] || 0) * 2;
    return w;
  }, state.questionCount);

  const typeACount = Math.round(sampled.length * 0.7);
  state.currentSet = sampled.map((q, i) => ({ ...q, type: i < typeACount ? 'A' : 'B', idx: i + 1 }));
  state.results = {};
  state.revealedAnswers = new Set();
  renderVerbCards();
  updateProgress();
}

function renderVerbCards() {
  const container = document.getElementById('questions-container');
  if (!container) return;
  if (!state.currentSet.length) {
    container.innerHTML = '<div class="empty-state"><p>옵션을 선택하고 문제 생성 버튼을 누르세요.</p></div>';
    return;
  }
  container.innerHTML = state.currentSet.map(q => {
    const { verb, form, type, idx } = q;
    const key = `${verb.id}_${form}_${type}`;
    const result = state.results[key];
    const formLabel = FORM_LABELS[form]?.label || form;
    const prompt = TYPE_A_PROMPTS[form] || '';
    let questionHTML, answerHTML;

    if (type === 'A') {
      questionHTML = `
        <div class="question-type-badge type-a">A 원형→활용</div>
        <div class="question-main">
          <div class="verb-display">${furigana(verb.dictionary, verb.reading)}</div>
          <div class="meaning">${verb.meaning_ko}</div>
          <div class="arrow-prompt">→ <span class="form-label">${formLabel}</span>（${prompt}）</div>
          <div class="write-line">_______________</div>
        </div>`;
      answerHTML = `<div class="answer-content">
        <div class="answer-label">정답</div>
        <div class="answer-word">${furigana(verb[form], verb[form+'_reading'])}</div>
        <div class="answer-reading">（${verb[form+'_reading']}）</div>
      </div>`;
    } else {
      answerHTML = `<div class="answer-content">
        <div class="answer-label">정답</div>
        <div class="answer-word">${furigana(verb.dictionary, verb.reading)}</div>
        <div class="answer-reading">（${verb.reading}）　${verb.meaning_ko}</div>
        ${verb.trap ? '<div class="trap-badge">⚠️ 함정동사</div>' : ''}
      </div>`;
      questionHTML = `
        <div class="question-type-badge type-b">B 활용→원형</div>
        <div class="question-main">
          <div class="verb-display">${furigana(verb[form], verb[form+'_reading'])}</div>
          <div class="form-hint">（${FORM_LABELS[form]?.hint || ''}）</div>
          <div class="arrow-prompt">→ <span class="form-label">원형은?</span></div>
          <div class="write-line">_______________</div>
        </div>`;
    }

    return `<article class="question-card ${result?'result-'+result:''} ${verb.trap?'is-trap':''}" data-key="${key}">
      <div class="card-header">
        <span class="q-number">${idx}</span>
        ${verb.trap ? '<span class="trap-indicator">⚠️</span>' : ''}
        <span class="jlpt-badge jlpt-${verb.jlpt}">${verb.jlpt}</span>
      </div>
      <div class="card-body">${questionHTML}</div>
      <div class="answer-section${state.revealedAnswers.has(key)?' revealed':''}" id="answer-${key}">${answerHTML}</div>
      ${actionsHTML(key, result)}
    </article>`;
  }).join('');
}

// ===== TAB: 가능형/수동형/사역형/사역수동형 =====
function generateDerivedQuestions() {
  const form = state.derivedForm; // potential | passive | causative | caus_pass
  const levels = state.selectedLevels;
  const pool = VERB_DB.filter(v => levels.includes(v.jlpt) && DERIVED_MAP[v.id]);

  const sampled = weightedSample(pool, v => {
    let w = v.frequency || 1;
    if (state.wrongBoost) w *= 1 + (state.wrongVerbs[getWrongKey(v.id, form)] || 0) * 2;
    return w;
  }, state.questionCount);

  state.currentSet = sampled.map((verb, i) => ({ verb, form, idx: i + 1, tab: 'derived' }));
  state.results = {};
  state.revealedAnswers = new Set();
  renderDerivedCards();
  updateProgress();
}

const DERIVED_LABELS = {
  potential:  { label: '가능형', hint: '~할 수 있다' },
  passive:    { label: '수동형', hint: '~당하다/받다' },
  causative:  { label: '사역형', hint: '~시키다' },
  caus_pass:  { label: '사역수동형', hint: '~하게 만들어지다' },
};

function renderDerivedCards() {
  const container = document.getElementById('questions-container');
  if (!container) return;
  container.innerHTML = state.currentSet.map(({ verb, form, idx }) => {
    const key = `${verb.id}_${form}_D`;
    const result = state.results[key];
    const d = DERIVED_MAP[verb.id];
    const answer = d?.[form] || '?';
    const answerR = d?.[form+'_r'] || '';
    const { label, hint } = DERIVED_LABELS[form];

    return `<article class="question-card ${result?'result-'+result:''}" data-key="${key}">
      <div class="card-header">
        <span class="q-number">${idx}</span>
        <span class="jlpt-badge jlpt-${verb.jlpt}">${verb.jlpt}</span>
      </div>
      <div class="card-body">
        <div class="question-type-badge type-a">${label}</div>
        <div class="question-main">
          <div class="verb-display">${furigana(verb.dictionary, verb.reading)}</div>
          <div class="meaning">${verb.meaning_ko}</div>
          <div class="arrow-prompt">→ <span class="form-label">${label}</span>（${hint}）</div>
          <div class="write-line">_______________</div>
        </div>
      </div>
      <div class="answer-section${state.revealedAnswers.has(key)?' revealed':''}" id="answer-${key}">
        <div class="answer-content">
          <div class="answer-label">정답</div>
          <div class="answer-word">${furigana(answer, answerR)}</div>
          <div class="answer-reading">（${answerR}）</div>
        </div>
      </div>
      ${actionsHTML(key, result)}
    </article>`;
  }).join('');
}

// ===== TAB: 수수표현 =====
function generateGRQuestions() {
  const filter = state.grFilter;
  let pool = GIVING_RECEIVING_QUESTIONS;
  if (filter !== 'all') pool = pool.filter(q => q.type === filter);
  const sampled = weightedSample(pool, q => {
    let w = 1;
    if (state.wrongBoost) w *= 1 + (state.wrongVerbs[getWrongKey(q.id, 'gr')] || 0) * 2;
    return w;
  }, state.questionCount);

  state.currentSet = sampled.map((q, i) => ({ ...q, idx: i + 1, tab: 'gr' }));
  state.results = {};
  state.revealedAnswers = new Set();
  renderGRCards();
  updateProgress();
}

function renderGRCards() {
  const container = document.getElementById('questions-container');
  if (!container) return;
  container.innerHTML = state.currentSet.map(q => {
    const key = `${q.id}_gr`;
    const result = state.results[key];
    return `<article class="question-card ${result?'result-'+result:''}" data-key="${key}">
      <div class="card-header">
        <span class="q-number">${q.idx}</span>
        <span class="jlpt-badge jlpt-N4">N4</span>
      </div>
      <div class="card-body">
        <div class="question-type-badge type-a">수수표현</div>
        <div class="question-main">
          <div class="meaning" style="margin-bottom:8px">${q.prompt_ko}</div>
          <div class="verb-display" style="font-size:1.1rem">${furigana(q.prompt_jp, q.prompt_jp_reading)}</div>
          <div class="write-line">_______________</div>
          <div class="hint-text">힌트: ${q.hint}</div>
        </div>
      </div>
      <div class="answer-section${state.revealedAnswers.has(key)?' revealed':''}" id="answer-${key}">
        <div class="answer-content">
          <div class="answer-label">정답</div>
          <div class="answer-word">${furigana(q.answer, q.answer_reading)}</div>
          <div class="answer-reading">（${q.answer_reading}）</div>
        </div>
      </div>
      ${actionsHTML(key, result)}
    </article>`;
  }).join('');
}

// ===== TAB: 추측·전언 =====
function generateConjectureQuestions() {
  const filter = state.conjectureFilter;
  let pool = CONJECTURE_QUESTIONS;
  if (filter !== 'all') pool = pool.filter(q => q.type === filter);
  const sampled = weightedSample(pool, q => {
    let w = 1;
    if (state.wrongBoost) w *= 1 + (state.wrongVerbs[getWrongKey(q.id, 'conj')] || 0) * 2;
    return w;
  }, state.questionCount);

  state.currentSet = sampled.map((q, i) => ({ ...q, idx: i + 1, tab: 'conjecture' }));
  state.results = {};
  state.revealedAnswers = new Set();
  renderConjectureCards();
  updateProgress();
}

const CONJ_LABELS = {
  sou_conjecture: '추측 そうだ',
  sou_hearsay:    '전언 そうだ',
  deshou:         'でしょう',
  kamoshirenai:   'かもしれない',
};

function renderConjectureCards() {
  const container = document.getElementById('questions-container');
  if (!container) return;
  container.innerHTML = state.currentSet.map(q => {
    const key = `${q.id}_conj`;
    const result = state.results[key];
    const typeLabel = CONJ_LABELS[q.type] || q.type;
    return `<article class="question-card ${result?'result-'+result:''}" data-key="${key}">
      <div class="card-header">
        <span class="q-number">${q.idx}</span>
        <span class="jlpt-badge jlpt-N4">N4</span>
      </div>
      <div class="card-body">
        <div class="question-type-badge type-a">${typeLabel}</div>
        <div class="question-main">
          <div class="verb-display">${furigana(q.prompt_base, q.prompt_base_reading)}</div>
          <div class="meaning">${q.prompt_base_ko}</div>
          <div class="arrow-prompt">→ <span class="form-label">${q.instruction}</span></div>
          <div class="write-line">_______________</div>
          <div class="hint-text">힌트: ${q.hint}</div>
        </div>
      </div>
      <div class="answer-section${state.revealedAnswers.has(key)?' revealed':''}" id="answer-${key}">
        <div class="answer-content">
          <div class="answer-label">정답</div>
          <div class="answer-word">${furigana(q.answer, q.answer_reading)}</div>
          <div class="answer-reading">（${q.answer_reading}）</div>
          <div class="answer-reading">${q.prompt_ko}</div>
        </div>
      </div>
      ${actionsHTML(key, result)}
    </article>`;
  }).join('');
}

// ===== TAB: 문형 =====
function generateGrammarQuestions() {
  const filter = state.grammarFilter;
  let pool = GRAMMAR_QUESTIONS;
  if (filter !== 'all') pool = pool.filter(q => q.pattern_id === filter);
  const sampled = weightedSample(pool, q => {
    let w = 1;
    if (state.wrongBoost) w *= 1 + (state.wrongVerbs[getWrongKey(q.id, 'gp')] || 0) * 2;
    return w;
  }, state.questionCount);

  state.currentSet = sampled.map((q, i) => ({ ...q, idx: i + 1, tab: 'grammar' }));
  state.results = {};
  state.revealedAnswers = new Set();
  renderGrammarCards();
  updateProgress();
}

function renderGrammarCards() {
  const container = document.getElementById('questions-container');
  if (!container) return;
  container.innerHTML = state.currentSet.map(q => {
    const key = `${q.id}_gp`;
    const result = state.results[key];
    const pattern = GRAMMAR_PATTERN_DB.find(p => p.id === q.pattern_id);
    return `<article class="question-card ${result?'result-'+result:''}" data-key="${key}">
      <div class="card-header">
        <span class="q-number">${q.idx}</span>
        ${pattern ? `<span class="pattern-chip">${pattern.pattern}</span>` : ''}
        <span class="jlpt-badge jlpt-N4">N4</span>
      </div>
      <div class="card-body">
        <div class="question-type-badge type-a">문형</div>
        <div class="question-main">
          <div class="meaning" style="margin-bottom:8px">${q.prompt_ko}</div>
          <div class="verb-display" style="font-size:1.1rem">${furigana(q.prompt_jp, q.prompt_jp_reading)}</div>
          <div class="write-line">_______________</div>
          <div class="hint-text">힌트: ${q.hint}</div>
        </div>
      </div>
      <div class="answer-section${state.revealedAnswers.has(key)?' revealed':''}" id="answer-${key}">
        <div class="answer-content">
          <div class="answer-label">정답</div>
          <div class="answer-word">${furigana(q.answer, q.answer_reading)}</div>
          ${pattern ? `<div class="answer-reading">${pattern.meaning_ko} · ${pattern.rule_ko}</div>` : ''}
        </div>
      </div>
      ${actionsHTML(key, result)}
    </article>`;
  }).join('');
}

// ===== TAB: 경어 =====
function generateHonorificQuestions() {
  const htype = state.honorificType;
  let pool = HONORIFIC_DB;
  if (htype !== 'both') pool = pool.filter(h => h.type === htype);
  const sampled = weightedSample(pool, h => {
    let w = 1;
    if (state.wrongBoost) w *= 1 + (state.wrongVerbs[getWrongKey(h.id, 'hon')] || 0) * 2;
    return w;
  }, state.questionCount);

  state.currentSet = sampled.map((h, i) => ({ ...h, idx: i + 1, tab: 'honorific' }));
  state.results = {};
  state.revealedAnswers = new Set();
  renderHonorificCards();
  updateProgress();
}

function renderHonorificCards() {
  const container = document.getElementById('questions-container');
  if (!container) return;
  container.innerHTML = state.currentSet.map(h => {
    const key = `${h.id}_hon`;
    const result = state.results[key];
    const typeLabel = h.type === 'respectful' ? '존경어' : '겸양어';
    const typeBadge = h.type === 'respectful' ? 'type-a' : 'type-b';
    return `<article class="question-card ${result?'result-'+result:''}" data-key="${key}">
      <div class="card-header">
        <span class="q-number">${h.idx}</span>
        <span class="jlpt-badge jlpt-N4">N4</span>
      </div>
      <div class="card-body">
        <div class="question-type-badge ${typeBadge}">${typeLabel}</div>
        <div class="question-main">
          <div class="verb-display">${furigana(h.plain, h.plain_reading)}</div>
          <div class="meaning">${h.meaning_ko.replace(' (겸양)', '').replace(' (겸양)', '')}</div>
          <div class="arrow-prompt">→ <span class="form-label">${typeLabel}로</span></div>
          <div class="write-line">_______________</div>
        </div>
      </div>
      <div class="answer-section${state.revealedAnswers.has(key)?' revealed':''}" id="answer-${key}">
        <div class="answer-content">
          <div class="answer-label">정답</div>
          <div class="answer-word">${furigana(h.honorific, h.honorific_reading)}</div>
          <div class="answer-reading">（${h.honorific_reading}）　${h.meaning_ko}</div>
        </div>
      </div>
      ${actionsHTML(key, result)}
    </article>`;
  }).join('');
}

// ===== TAB: 종합 =====
function generateComprehensiveQuestions() {
  const modes = state.compModes;
  const levels = state.selectedLevels;
  let allItems = [];

  if (modes.includes('verb')) {
    const forms = ALL_FORMS;
    const pool = VERB_DB.filter(v => levels.includes(v.jlpt));
    for (const verb of pool.slice(0, 60)) for (const form of forms.slice(0, 4)) {
      allItems.push({ _type: 'verb', verb, form });
    }
  }
  if (modes.includes('potential') || modes.includes('passive') || modes.includes('causative') || modes.includes('caus_pass')) {
    const derivedForms = ['potential','passive','causative','caus_pass'].filter(f => modes.includes(f));
    const pool = VERB_DB.filter(v => levels.includes(v.jlpt) && DERIVED_MAP[v.id]);
    for (const verb of pool.slice(0, 60)) for (const form of derivedForms) {
      allItems.push({ _type: 'derived', verb, form });
    }
  }
  if (modes.includes('giving_receiving')) {
    GIVING_RECEIVING_QUESTIONS.forEach(q => allItems.push({ _type: 'gr', q }));
  }
  if (modes.includes('conjecture')) {
    CONJECTURE_QUESTIONS.forEach(q => allItems.push({ _type: 'conj', q }));
  }
  if (modes.includes('grammar')) {
    GRAMMAR_QUESTIONS.forEach(q => allItems.push({ _type: 'gp', q }));
  }
  if (modes.includes('honorific')) {
    HONORIFIC_DB.forEach(h => allItems.push({ _type: 'hon', h }));
  }

  const sampled = weightedSample(allItems, item => 1, state.questionCount);
  state.currentSet = sampled.map((item, i) => ({ ...item, idx: i + 1 }));
  state.results = {};
  state.revealedAnswers = new Set();
  renderComprehensiveCards();
  updateProgress();
}

function renderComprehensiveCards() {
  const container = document.getElementById('questions-container');
  if (!container) return;
  container.innerHTML = state.currentSet.map(item => {
    const { idx, _type } = item;
    if (_type === 'verb') {
      const { verb, form } = item;
      const key = `${verb.id}_${form}_CV`;
      const result = state.results[key];
      const formLabel = FORM_LABELS[form]?.label || form;
      return `<article class="question-card ${result?'result-'+result:''}" data-key="${key}">
        <div class="card-header"><span class="q-number">${idx}</span><span class="jlpt-badge jlpt-${verb.jlpt}">${verb.jlpt}</span></div>
        <div class="card-body">
          <div class="question-type-badge type-a">동사활용</div>
          <div class="question-main">
            <div class="verb-display">${furigana(verb.dictionary, verb.reading)}</div>
            <div class="meaning">${verb.meaning_ko}</div>
            <div class="arrow-prompt">→ <span class="form-label">${formLabel}</span></div>
            <div class="write-line">_______________</div>
          </div>
        </div>
        <div class="answer-section${state.revealedAnswers.has(key)?' revealed':''}" id="answer-${key}">
          <div class="answer-content">
            <div class="answer-label">정답</div>
            <div class="answer-word">${furigana(verb[form], verb[form+'_reading'])}</div>
          </div>
        </div>
        ${actionsHTML(key, result)}
      </article>`;
    }
    if (_type === 'derived') {
      const { verb, form } = item;
      const key = `${verb.id}_${form}_CV`;
      const result = state.results[key];
      const d = DERIVED_MAP[verb.id];
      const answer = d?.[form] || '?', answerR = d?.[form+'_r'] || '';
      const { label } = DERIVED_LABELS[form];
      return `<article class="question-card ${result?'result-'+result:''}" data-key="${key}">
        <div class="card-header"><span class="q-number">${idx}</span><span class="jlpt-badge jlpt-${verb.jlpt}">${verb.jlpt}</span></div>
        <div class="card-body">
          <div class="question-type-badge type-a">${label}</div>
          <div class="question-main">
            <div class="verb-display">${furigana(verb.dictionary, verb.reading)}</div>
            <div class="meaning">${verb.meaning_ko}</div>
            <div class="arrow-prompt">→ <span class="form-label">${label}</span></div>
            <div class="write-line">_______________</div>
          </div>
        </div>
        <div class="answer-section${state.revealedAnswers.has(key)?' revealed':''}" id="answer-${key}">
          <div class="answer-content">
            <div class="answer-label">정답</div>
            <div class="answer-word">${furigana(answer, answerR)}</div>
          </div>
        </div>
        ${actionsHTML(key, result)}
      </article>`;
    }
    if (_type === 'gr') {
      const { q } = item;
      const key = `${q.id}_gr_CV`;
      const result = state.results[key];
      return `<article class="question-card ${result?'result-'+result:''}" data-key="${key}">
        <div class="card-header"><span class="q-number">${idx}</span><span class="jlpt-badge jlpt-N4">N4</span></div>
        <div class="card-body">
          <div class="question-type-badge type-a">수수표현</div>
          <div class="question-main">
            <div class="meaning" style="margin-bottom:6px">${q.prompt_ko}</div>
            <div class="verb-display" style="font-size:1rem">${furigana(q.prompt_jp, q.prompt_jp_reading)}</div>
            <div class="write-line">_______________</div>
          </div>
        </div>
        <div class="answer-section${state.revealedAnswers.has(key)?' revealed':''}" id="answer-${key}">
          <div class="answer-content">
            <div class="answer-label">정답</div>
            <div class="answer-word">${furigana(q.answer, q.answer_reading)}</div>
          </div>
        </div>
        ${actionsHTML(key, result)}
      </article>`;
    }
    if (_type === 'conj') {
      const { q } = item;
      const key = `${q.id}_conj_CV`;
      const result = state.results[key];
      const typeLabel = CONJ_LABELS[q.type] || q.type;
      return `<article class="question-card ${result?'result-'+result:''}" data-key="${key}">
        <div class="card-header"><span class="q-number">${idx}</span><span class="jlpt-badge jlpt-N4">N4</span></div>
        <div class="card-body">
          <div class="question-type-badge type-a">${typeLabel}</div>
          <div class="question-main">
            <div class="verb-display">${furigana(q.prompt_base, q.prompt_base_reading)}</div>
            <div class="meaning">${q.prompt_base_ko}</div>
            <div class="arrow-prompt">→ <span class="form-label">${q.instruction}</span></div>
            <div class="write-line">_______________</div>
          </div>
        </div>
        <div class="answer-section${state.revealedAnswers.has(key)?' revealed':''}" id="answer-${key}">
          <div class="answer-content">
            <div class="answer-label">정답</div>
            <div class="answer-word">${furigana(q.answer, q.answer_reading)}</div>
          </div>
        </div>
        ${actionsHTML(key, result)}
      </article>`;
    }
    if (_type === 'gp') {
      const { q } = item;
      const key = `${q.id}_gp_CV`;
      const result = state.results[key];
      return `<article class="question-card ${result?'result-'+result:''}" data-key="${key}">
        <div class="card-header"><span class="q-number">${idx}</span><span class="jlpt-badge jlpt-N4">N4</span></div>
        <div class="card-body">
          <div class="question-type-badge type-a">문형</div>
          <div class="question-main">
            <div class="meaning" style="margin-bottom:6px">${q.prompt_ko}</div>
            <div class="verb-display" style="font-size:1rem">${furigana(q.prompt_jp, q.prompt_jp_reading)}</div>
            <div class="write-line">_______________</div>
          </div>
        </div>
        <div class="answer-section${state.revealedAnswers.has(key)?' revealed':''}" id="answer-${key}">
          <div class="answer-content">
            <div class="answer-label">정답</div>
            <div class="answer-word">${furigana(q.answer, q.answer_reading)}</div>
          </div>
        </div>
        ${actionsHTML(key, result)}
      </article>`;
    }
    if (_type === 'hon') {
      const { h } = item;
      const key = `${h.id}_hon_CV`;
      const result = state.results[key];
      const typeLabel = h.type === 'respectful' ? '존경어' : '겸양어';
      const typeBadge = h.type === 'respectful' ? 'type-a' : 'type-b';
      return `<article class="question-card ${result?'result-'+result:''}" data-key="${key}">
        <div class="card-header"><span class="q-number">${idx}</span><span class="jlpt-badge jlpt-N4">N4</span></div>
        <div class="card-body">
          <div class="question-type-badge ${typeBadge}">${typeLabel}</div>
          <div class="question-main">
            <div class="verb-display">${furigana(h.plain, h.plain_reading)}</div>
            <div class="meaning">${h.meaning_ko}</div>
            <div class="arrow-prompt">→ <span class="form-label">${typeLabel}로</span></div>
            <div class="write-line">_______________</div>
          </div>
        </div>
        <div class="answer-section${state.revealedAnswers.has(key)?' revealed':''}" id="answer-${key}">
          <div class="answer-content">
            <div class="answer-label">정답</div>
            <div class="answer-word">${furigana(h.honorific, h.honorific_reading)}</div>
          </div>
        </div>
        ${actionsHTML(key, result)}
      </article>`;
    }
    return '';
  }).join('');
}

// ===== TAB SWITCHING =====
function switchTab(tab) {
  state.activeTab = tab;
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.toggle('active', p.dataset.panel === tab));
  // clear questions
  const container = document.getElementById('questions-container');
  if (container) container.innerHTML = '<div class="empty-state"><p>문제 생성 버튼을 누르세요.</p></div>';
  state.currentSet = [];
  state.results = {};
  state.revealedAnswers = new Set();
  updateProgress();
}

function generateCurrent() {
  switch (state.activeTab) {
    case 'verb':         generateVerbQuestions(); break;
    case 'potential':    state.derivedForm = 'potential';  generateDerivedQuestions(); break;
    case 'passive':      state.derivedForm = 'passive';    generateDerivedQuestions(); break;
    case 'causative':    state.derivedForm = 'causative';  generateDerivedQuestions(); break;
    case 'caus_pass':    state.derivedForm = 'caus_pass';  generateDerivedQuestions(); break;
    case 'giving':       generateGRQuestions(); break;
    case 'honorific':    generateHonorificQuestions(); break;
    case 'conjecture':   generateConjectureQuestions(); break;
    case 'grammar':      generateGrammarQuestions(); break;
    case 'comprehensive': generateComprehensiveQuestions(); break;
  }
}

// ===== SETUP =====
function setupControls() {
  // Tab buttons
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
  });

  // Form selector
  document.querySelectorAll('.form-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const form = btn.dataset.form;
      if (form === 'all') {
        state.selectedForms = ['all'];
        document.querySelectorAll('.form-btn').forEach(b => b.classList.toggle('active', b.dataset.form === 'all'));
      } else {
        state.selectedForms = state.selectedForms.filter(f => f !== 'all');
        const idx = state.selectedForms.indexOf(form);
        if (idx >= 0) state.selectedForms.splice(idx, 1); else state.selectedForms.push(form);
        if (!state.selectedForms.length) state.selectedForms = [form];
        document.querySelectorAll('.form-btn').forEach(b => {
          b.classList.toggle('active', b.dataset.form !== 'all' && state.selectedForms.includes(b.dataset.form));
        });
      }
    });
  });

  // Level checkboxes
  document.querySelectorAll('.level-cb').forEach(cb => {
    cb.addEventListener('change', () => {
      state.selectedLevels = [...document.querySelectorAll('.level-cb:checked')].map(c => c.value);
    });
  });

  // Option toggles
  document.getElementById('toggle-furigana')?.addEventListener('change', e => {
    state.showFurigana = e.target.checked;
    generateCurrent();
  });
  document.getElementById('toggle-frequent')?.addEventListener('change', e => { state.prioritizeFrequent = e.target.checked; });
  document.getElementById('toggle-trap')?.addEventListener('change', e => { state.trapBoost = e.target.checked; });
  document.getElementById('toggle-wrong')?.addEventListener('change', e => { state.wrongBoost = e.target.checked; });
  document.getElementById('q-count')?.addEventListener('change', e => { state.questionCount = parseInt(e.target.value) || 40; });

  // Generate button
  document.getElementById('btn-generate')?.addEventListener('click', generateCurrent);

  // Clear wrong
  document.getElementById('btn-clear-wrong')?.addEventListener('click', () => {
    if (confirm('오답 기록을 모두 삭제할까요?')) {
      state.wrongVerbs = {};
      saveWrongVerbs();
      updateProgress();
    }
  });

  // Honorific type
  document.querySelectorAll('.hon-type-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      state.honorificType = btn.dataset.htype;
      document.querySelectorAll('.hon-type-btn').forEach(b => b.classList.toggle('active', b.dataset.htype === state.honorificType));
    });
  });

  // Conjecture filter
  document.querySelectorAll('.conj-filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      state.conjectureFilter = btn.dataset.ctype;
      document.querySelectorAll('.conj-filter-btn').forEach(b => b.classList.toggle('active', b.dataset.ctype === state.conjectureFilter));
    });
  });

  // Comp mode checkboxes
  document.querySelectorAll('.comp-mode-cb').forEach(cb => {
    cb.addEventListener('change', () => {
      state.compModes = [...document.querySelectorAll('.comp-mode-cb:checked')].map(c => c.value);
    });
  });
}

function init() {
  state.wrongVerbs = loadWrongVerbs();
  setupControls();
  updateProgress();
  // set initial active form btn
  document.querySelectorAll('.form-btn').forEach(btn => {
    btn.classList.toggle('active', state.selectedForms.includes(btn.dataset.form));
  });
}

document.addEventListener('DOMContentLoaded', init);
