// ===== STATE =====
const state = {
  selectedForms: ['masu'],
  selectedLevels: ['N5', 'N4', 'N3'],
  showFurigana: true,
  prioritizeFrequent: true,
  trapBoost: false,
  wrongBoost: true,
  currentSet: [],
  questionCount: 40,
  results: {},      // { questionKey: 'correct' | 'wrong' | null }
  wrongVerbs: {},   // loaded from localStorage
  revealedAnswers: new Set(),
};

// ===== localStorage =====
function loadWrongVerbs() {
  try {
    const raw = localStorage.getItem('jlpt_wrong_verbs');
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}
function saveWrongVerbs() {
  try {
    localStorage.setItem('jlpt_wrong_verbs', JSON.stringify(state.wrongVerbs));
  } catch {}
}
function getWrongKey(verbId, form) { return `${verbId}_${form}`; }

// ===== FURIGANA UTILS =====
function rubyHTML(kanji, reading) {
  if (!kanji || !reading) return kanji || '';
  // Simple: wrap entire word
  return `<ruby>${kanji}<rt>${reading}</rt></ruby>`;
}

// Produce interleaved ruby for dictionary form
// e.g. "読む" + "よむ" => <ruby>読<rt>よ</rt></ruby>む
// For simplicity, use word-level ruby
function furigana(word, reading) {
  if (!state.showFurigana || !reading) return `<span class="kanji-plain">${word}</span>`;
  return `<ruby>${word}<rt>${reading}</rt></ruby>`;
}

// ===== QUESTION GENERATION =====
const ALL_FORMS = Object.keys(FORM_LABELS);

function getActiveForms() {
  if (state.selectedForms.includes('all')) return ALL_FORMS;
  return state.selectedForms;
}

function buildCandidatePool() {
  const levels = state.selectedLevels;
  let pool = VERB_DB.filter(v => levels.includes(v.jlpt));
  return pool;
}

function weightedSample(pool, forms, count) {
  const questions = [];
  const weights = [];

  for (const verb of pool) {
    for (const form of forms) {
      const key = getWrongKey(verb.id, form);
      const wrongCount = state.wrongVerbs[key] || 0;
      let w = 1;
      if (state.prioritizeFrequent) w *= verb.frequency;
      if (state.trapBoost && verb.trap) w *= 3;
      if (state.wrongBoost && wrongCount > 0) w *= (1 + wrongCount * 2);
      questions.push({ verb, form });
      weights.push(w);
    }
  }

  if (questions.length === 0) return [];

  // Weighted random sampling without replacement
  const total = weights.reduce((a, b) => a + b, 0);
  const selected = [];
  const usedIdx = new Set();

  const safeguard = count * 20;
  let attempts = 0;
  while (selected.length < Math.min(count, questions.length) && attempts < safeguard) {
    attempts++;
    let rand = Math.random() * total;
    let cumulative = 0;
    for (let i = 0; i < questions.length; i++) {
      cumulative += weights[i];
      if (rand <= cumulative && !usedIdx.has(i)) {
        usedIdx.add(i);
        selected.push(questions[i]);
        break;
      }
    }
  }

  // If not enough, fill remainder randomly
  if (selected.length < Math.min(count, questions.length)) {
    const remaining = questions
      .map((q, i) => ({ q, i }))
      .filter(({ i }) => !usedIdx.has(i));
    for (const { q } of remaining.slice(0, count - selected.length)) {
      selected.push(q);
    }
  }

  return selected;
}

function generateQuestions() {
  const pool = buildCandidatePool();
  const forms = getActiveForms();
  if (pool.length === 0 || forms.length === 0) return;

  const allQ = weightedSample(pool, forms, state.questionCount);

  // Mix Type A (70%) and Type B (30%)
  const typeACount = Math.round(allQ.length * 0.7);
  state.currentSet = allQ.map((q, i) => ({
    ...q,
    type: i < typeACount ? 'A' : 'B',
    idx: i + 1,
  }));

  state.results = {};
  state.revealedAnswers = new Set();
  renderQuestions();
  updateProgress();
}

// ===== RENDERING =====
function renderQuestions() {
  const container = document.getElementById('questions-container');
  if (!container) return;

  if (state.currentSet.length === 0) {
    container.innerHTML = '<div class="empty-state"><p>옵션을 선택하고 [문제 생성] 버튼을 누르세요.</p></div>';
    return;
  }

  container.innerHTML = state.currentSet.map(q => renderCard(q)).join('');
}

function renderCard(q) {
  const { verb, form, type, idx } = q;
  const cardKey = `${verb.id}_${form}_${type}`;
  const result = state.results[cardKey];
  const revealed = state.revealedAnswers.has(cardKey);

  const formLabel = FORM_LABELS[form]?.label || form;
  const prompt = TYPE_A_PROMPTS[form] || '';

  let questionHTML = '';
  let answerHTML = '';

  if (type === 'A') {
    // Dictionary form → conjugated form
    const dictWord = furigana(verb.dictionary, verb.reading);
    questionHTML = `
      <div class="question-type-badge type-a">A 원형→활용</div>
      <div class="question-main">
        <div class="verb-display">${dictWord}</div>
        <div class="meaning">${verb.meaning_ko}</div>
        <div class="arrow-prompt">→ <span class="form-label">${formLabel}</span>（${prompt}）</div>
        <div class="write-line">_______________</div>
      </div>
    `;
    const answerKey = `${form}_reading`;
    answerHTML = `
      <div class="answer-content">
        <div class="answer-label">정답</div>
        <div class="answer-word">${furigana(verb[form], verb[answerKey])}</div>
        <div class="answer-reading">（${verb[answerKey]}）</div>
      </div>
    `;
  } else {
    // Conjugated form → dictionary form
    const formKey = `${form}_reading`;
    const conjWord = furigana(verb[form], verb[formKey]);
    questionHTML = `
      <div class="question-type-badge type-b">B 활용→원형</div>
      <div class="question-main">
        <div class="verb-display">${conjWord}</div>
        <div class="form-hint">（${FORM_LABELS[form]?.hint || ''}）</div>
        <div class="arrow-prompt">→ <span class="form-label">원형은?</span></div>
        <div class="write-line">_______________</div>
      </div>
    `;
    answerHTML = `
      <div class="answer-content">
        <div class="answer-label">정답</div>
        <div class="answer-word">${furigana(verb.dictionary, verb.reading)}</div>
        <div class="answer-reading">（${verb.reading}）　${verb.meaning_ko}</div>
        ${verb.trap ? '<div class="trap-badge">⚠️ 함정동사</div>' : ''}
      </div>
    `;
  }

  const resultClass = result ? `result-${result}` : '';
  const revealedClass = revealed ? 'revealed' : '';
  const trapClass = verb.trap ? 'is-trap' : '';

  return `
    <article class="question-card ${resultClass} ${trapClass}" data-key="${cardKey}" data-verb-id="${verb.id}" data-form="${form}">
      <div class="card-header">
        <span class="q-number">${idx}</span>
        ${verb.trap ? '<span class="trap-indicator" title="함정동사">⚠️</span>' : ''}
        <span class="jlpt-badge jlpt-${verb.jlpt}">${verb.jlpt}</span>
      </div>
      <div class="card-body">
        ${questionHTML}
      </div>
      <div class="answer-section ${revealedClass}" id="answer-${cardKey}">
        ${answerHTML}
      </div>
      <div class="card-actions">
        <button class="btn-reveal" onclick="toggleAnswer('${cardKey}')">
          ${revealed ? '답 숨기기' : '정답 보기'}
        </button>
        <div class="result-buttons">
          <button class="btn-correct ${result === 'correct' ? 'active' : ''}"
            onclick="markResult('${cardKey}', 'correct')">○ 맞음</button>
          <button class="btn-wrong ${result === 'wrong' ? 'active' : ''}"
            onclick="markResult('${cardKey}', 'wrong')">× 틀림</button>
        </div>
      </div>
    </article>
  `;
}

function toggleAnswer(key) {
  if (state.revealedAnswers.has(key)) {
    state.revealedAnswers.delete(key);
  } else {
    state.revealedAnswers.add(key);
  }
  // Re-render just that card
  const card = document.querySelector(`[data-key="${key}"]`);
  if (!card) return;
  const q = state.currentSet.find(q => `${q.verb.id}_${q.form}_${q.type}` === key);
  if (!q) return;
  card.outerHTML = renderCard(q);
  // After innerHTML replacement, reattach
  const newCard = document.querySelector(`[data-key="${key}"]`);
  if (newCard) {
    const answerSection = newCard.querySelector('.answer-section');
    const btn = newCard.querySelector('.btn-reveal');
    if (state.revealedAnswers.has(key)) {
      answerSection?.classList.add('revealed');
      if (btn) btn.textContent = '답 숨기기';
    }
  }
}

function markResult(key, result) {
  const prev = state.results[key];
  const card = document.querySelector(`[data-key="${key}"]`);

  if (prev === result) {
    // Toggle off
    state.results[key] = null;
    if (card) {
      card.classList.remove('result-correct', 'result-wrong');
      card.querySelector('.btn-correct')?.classList.remove('active');
      card.querySelector('.btn-wrong')?.classList.remove('active');
    }
  } else {
    state.results[key] = result;
    if (card) {
      card.classList.remove('result-correct', 'result-wrong');
      card.classList.add(`result-${result}`);
      card.querySelector('.btn-correct')?.classList.toggle('active', result === 'correct');
      card.querySelector('.btn-wrong')?.classList.toggle('active', result === 'wrong');
    }
  }

  // Update wrong verbs DB
  const parts = key.split('_');
  const verbId = parseInt(parts[0]);
  const form = parts[1];
  const wrongKey = getWrongKey(verbId, form);

  if (state.results[key] === 'wrong') {
    state.wrongVerbs[wrongKey] = (state.wrongVerbs[wrongKey] || 0) + 1;
  } else if (prev === 'wrong') {
    // Was wrong, now correct: decrease counter
    if (state.wrongVerbs[wrongKey] > 0) {
      state.wrongVerbs[wrongKey]--;
      if (state.wrongVerbs[wrongKey] === 0) delete state.wrongVerbs[wrongKey];
    }
  }

  saveWrongVerbs();
  updateProgress();
}

function updateProgress() {
  const total = state.currentSet.length;
  const correct = Object.values(state.results).filter(r => r === 'correct').length;
  const wrong = Object.values(state.results).filter(r => r === 'wrong').length;
  const answered = correct + wrong;

  const progressEl = document.getElementById('progress-text');
  const progressBar = document.getElementById('progress-fill');
  const statsEl = document.getElementById('stats-detail');

  if (progressEl) progressEl.textContent = `${answered} / ${total}`;
  if (progressBar) progressBar.style.width = `${total > 0 ? (answered / total) * 100 : 0}%`;
  if (statsEl) {
    const pct = answered > 0 ? Math.round((correct / answered) * 100) : 0;
    statsEl.textContent = `맞음 ${correct}  틀림 ${wrong}  정답률 ${pct}%`;
  }
}

// ===== UI CONTROLS =====
function setupControls() {
  // Form selector buttons
  document.querySelectorAll('.form-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const form = btn.dataset.form;
      if (form === 'all') {
        state.selectedForms = ['all'];
        document.querySelectorAll('.form-btn').forEach(b => {
          b.classList.toggle('active', b.dataset.form === 'all');
        });
      } else {
        state.selectedForms = state.selectedForms.filter(f => f !== 'all');
        const idx = state.selectedForms.indexOf(form);
        if (idx >= 0) {
          state.selectedForms.splice(idx, 1);
        } else {
          state.selectedForms.push(form);
        }
        if (state.selectedForms.length === 0) state.selectedForms = [form];
        document.querySelectorAll('.form-btn').forEach(b => {
          b.classList.toggle('active',
            b.dataset.form === 'all'
              ? false
              : state.selectedForms.includes(b.dataset.form)
          );
        });
      }
    });
  });

  // Level checkboxes
  document.querySelectorAll('.level-cb').forEach(cb => {
    cb.addEventListener('change', () => {
      state.selectedLevels = [];
      document.querySelectorAll('.level-cb:checked').forEach(c => {
        state.selectedLevels.push(c.value);
      });
    });
  });

  // Option toggles
  document.getElementById('toggle-furigana')?.addEventListener('change', e => {
    state.showFurigana = e.target.checked;
    renderQuestions();
  });
  document.getElementById('toggle-frequent')?.addEventListener('change', e => {
    state.prioritizeFrequent = e.target.checked;
  });
  document.getElementById('toggle-trap')?.addEventListener('change', e => {
    state.trapBoost = e.target.checked;
  });
  document.getElementById('toggle-wrong')?.addEventListener('change', e => {
    state.wrongBoost = e.target.checked;
  });

  // Question count
  document.getElementById('q-count')?.addEventListener('change', e => {
    state.questionCount = parseInt(e.target.value) || 40;
  });

  // Generate button
  document.getElementById('btn-generate')?.addEventListener('click', generateQuestions);

  // Clear wrong verbs
  document.getElementById('btn-clear-wrong')?.addEventListener('click', () => {
    if (confirm('오답 기록을 모두 삭제할까요?')) {
      state.wrongVerbs = {};
      saveWrongVerbs();
      updateWrongCount();
    }
  });
}

function updateWrongCount() {
  const count = Object.keys(state.wrongVerbs).length;
  const el = document.getElementById('wrong-count');
  if (el) el.textContent = count;
}

function init() {
  state.wrongVerbs = loadWrongVerbs();
  setupControls();
  updateProgress();
  updateWrongCount();
  // Set initial active states on buttons
  document.querySelectorAll('.form-btn').forEach(btn => {
    btn.classList.toggle('active', state.selectedForms.includes(btn.dataset.form));
  });
}

document.addEventListener('DOMContentLoaded', init);
