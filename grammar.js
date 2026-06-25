// ===== GRAMMAR DATABASE =====

// ===== 가능형 (Potential Form) =====
// Stored directly in VERB_DB as potential / potential_reading
// This object just maps group rules for reference

// ===== 수수표현 (Giving & Receiving) =====
const GIVING_RECEIVING_DB = [
  // ─── Basic giving/receiving verbs ───
  {
    id: "gr_01",
    category: "basic",
    subject_ko: "나 → 남",
    pattern: "あげる",
    pattern_reading: "あげる",
    meaning_ko: "주다 (내가 남에게)",
    example: "友達に本をあげました。",
    example_reading: "ともだちにほんをあげました。",
    example_ko: "친구에게 책을 주었습니다.",
    jlpt: "N4"
  },
  {
    id: "gr_02",
    category: "basic",
    subject_ko: "남 → 나",
    pattern: "くれる",
    pattern_reading: "くれる",
    meaning_ko: "주다 (남이 나에게)",
    example: "友達が本をくれました。",
    example_reading: "ともだちがほんをくれました。",
    example_ko: "친구가 나에게 책을 주었습니다.",
    jlpt: "N4"
  },
  {
    id: "gr_03",
    category: "basic",
    subject_ko: "나 ← 남",
    pattern: "もらう",
    pattern_reading: "もらう",
    meaning_ko: "받다",
    example: "友達に本をもらいました。",
    example_reading: "ともだちにほんをもらいました。",
    example_ko: "친구에게 책을 받았습니다.",
    jlpt: "N4"
  },
  // ─── て형 giving/receiving ───
  {
    id: "gr_04",
    category: "te_form",
    subject_ko: "나 → 남",
    pattern: "てあげる",
    pattern_reading: "てあげる",
    meaning_ko: "~해 주다 (내가 남에게)",
    example: "友達に本を読んであげました。",
    example_reading: "ともだちにほんをよんであげました。",
    example_ko: "친구에게 책을 읽어 주었습니다.",
    jlpt: "N4"
  },
  {
    id: "gr_05",
    category: "te_form",
    subject_ko: "남 → 나",
    pattern: "てくれる",
    pattern_reading: "てくれる",
    meaning_ko: "~해 주다 (남이 나에게)",
    example: "友達が本を読んでくれました。",
    example_reading: "ともだちがほんをよんでくれました。",
    example_ko: "친구가 나에게 책을 읽어 주었습니다.",
    jlpt: "N4"
  },
  {
    id: "gr_06",
    category: "te_form",
    subject_ko: "나 ← 남",
    pattern: "てもらう",
    pattern_reading: "てもらう",
    meaning_ko: "~해 받다",
    example: "友達に本を読んでもらいました。",
    example_reading: "ともだちにほんをよんでもらいました。",
    example_ko: "친구에게 책을 읽어 받았습니다.",
    jlpt: "N4"
  },
];

// Questions generated from GIVING_RECEIVING_DB
const GIVING_RECEIVING_QUESTIONS = [
  // Type: choose correct particle/verb
  {
    id: "grq_01",
    type: "choose_verb",
    prompt_ko: "나 → 친구에게 책을 주었습니다.",
    prompt_jp: "私は友達に本を＿＿＿。",
    prompt_jp_reading: "わたしはともだちにほんを＿＿＿。",
    answer: "あげました",
    answer_reading: "あげました",
    hint: "주는 방향: 나 → 남",
    jlpt: "N4"
  },
  {
    id: "grq_02",
    type: "choose_verb",
    prompt_ko: "친구가 나에게 책을 주었습니다.",
    prompt_jp: "友達が私に本を＿＿＿。",
    prompt_jp_reading: "ともだちがわたしにほんを＿＿＿。",
    answer: "くれました",
    answer_reading: "くれました",
    hint: "주는 방향: 남 → 나",
    jlpt: "N4"
  },
  {
    id: "grq_03",
    type: "choose_verb",
    prompt_ko: "나는 친구에게 책을 받았습니다.",
    prompt_jp: "私は友達に本を＿＿＿。",
    prompt_jp_reading: "わたしはともだちにほんを＿＿＿。",
    answer: "もらいました",
    answer_reading: "もらいました",
    hint: "받는 동작: もらう",
    jlpt: "N4"
  },
  {
    id: "grq_04",
    type: "te_form",
    prompt_ko: "나는 친구에게 숙제를 도와 주었습니다.",
    prompt_jp: "私は友達の宿題を手伝って＿＿＿。",
    prompt_jp_reading: "わたしはともだちのしゅくだいをてつだって＿＿＿。",
    answer: "あげました",
    answer_reading: "あげました",
    hint: "내가 남에게 해 주는 것 → てあげる",
    jlpt: "N4"
  },
  {
    id: "grq_05",
    type: "te_form",
    prompt_ko: "선생님이 나에게 설명해 주었습니다.",
    prompt_jp: "先生が私に説明して＿＿＿。",
    prompt_jp_reading: "せんせいがわたしにせつめいして＿＿＿。",
    answer: "くれました",
    answer_reading: "くれました",
    hint: "남이 나에게 해 주는 것 → てくれる",
    jlpt: "N4"
  },
  {
    id: "grq_06",
    type: "te_form",
    prompt_ko: "나는 친구에게 사진을 찍어 받았습니다.",
    prompt_jp: "私は友達に写真を撮って＿＿＿。",
    prompt_jp_reading: "わたしはともだちにしゃしんをとって＿＿＿。",
    answer: "もらいました",
    answer_reading: "もらいました",
    hint: "내가 남에게 ~해 받는 것 → てもらう",
    jlpt: "N4"
  },
  {
    id: "grq_07",
    type: "choose_verb",
    prompt_ko: "오빠가 나에게 케이크를 사 주었습니다.",
    prompt_jp: "お兄さんが私にケーキを買って＿＿＿。",
    prompt_jp_reading: "おにいさんがわたしにケーキをかって＿＿＿。",
    answer: "くれました",
    answer_reading: "くれました",
    hint: "남(가족)이 나에게 해 주는 것 → てくれる",
    jlpt: "N4"
  },
  {
    id: "grq_08",
    type: "choose_verb",
    prompt_ko: "나는 후배에게 노트를 빌려 주었습니다.",
    prompt_jp: "私は後輩にノートを貸して＿＿＿。",
    prompt_jp_reading: "わたしはこうはいにノートをかして＿＿＿。",
    answer: "あげました",
    answer_reading: "あげました",
    hint: "내가 남에게 해 주는 것 → てあげる",
    jlpt: "N4"
  },
];

// ===== 추측·전언 (Conjecture & Hearsay) =====
const CONJECTURE_DB = [
  // そうだ (추측 - looks like)
  {
    id: "conj_01",
    type: "sou_conjecture",
    label: "～そうだ (추측)",
    meaning_ko: "~할 것 같다 (보기에)",
    connects: "verb_stem / adj_stem",
    rule_ko: "동사 ます형 어간 / 형용사 어간 + そうだ",
    example_base: "雨が降る",
    example_base_reading: "あめがふる",
    example_base_ko: "비가 내리다",
    example_answer: "雨が降りそうだ",
    example_answer_reading: "あめがふりそうだ",
    example_answer_ko: "비가 내릴 것 같다",
    jlpt: "N4"
  },
  {
    id: "conj_02",
    type: "sou_hearsay",
    label: "～そうだ (전언)",
    meaning_ko: "~라고 한다 (들었다)",
    connects: "plain_form",
    rule_ko: "보통형 + そうだ",
    example_base: "田中さんは来る",
    example_base_reading: "たなかさんはくる",
    example_base_ko: "다나카 씨는 온다",
    example_answer: "田中さんは来るそうだ",
    example_answer_reading: "たなかさんはくるそうだ",
    example_answer_ko: "다나카 씨는 온다고 한다",
    jlpt: "N4"
  },
  {
    id: "conj_03",
    type: "deshou",
    label: "～でしょう",
    meaning_ko: "~일 것입니다 (추측)",
    connects: "plain_form",
    rule_ko: "보통형 + でしょう",
    example_base: "明日は晴れる",
    example_base_reading: "あしたははれる",
    example_base_ko: "내일은 맑다",
    example_answer: "明日は晴れるでしょう",
    example_answer_reading: "あしたははれるでしょう",
    example_answer_ko: "내일은 맑을 것입니다",
    jlpt: "N4"
  },
  {
    id: "conj_04",
    type: "kamoshirenai",
    label: "～かもしれない",
    meaning_ko: "~일지도 모른다",
    connects: "plain_form",
    rule_ko: "보통형 + かもしれない",
    example_base: "彼女は知っている",
    example_base_reading: "かのじょはしっている",
    example_base_ko: "그녀는 알고 있다",
    example_answer: "彼女は知っているかもしれない",
    example_answer_reading: "かのじょはしっているかもしれない",
    example_answer_ko: "그녀는 알고 있을지도 모른다",
    jlpt: "N4"
  },
];

const CONJECTURE_QUESTIONS = [
  {
    id: "cq_01",
    type: "sou_conjecture",
    prompt_ko: "비가 내릴 것 같다 (보기에)",
    prompt_base: "雨が降る",
    prompt_base_reading: "あめがふる",
    instruction: "추측 そうだ를 사용해서",
    answer: "雨が降りそうだ",
    answer_reading: "あめがふりそうだ",
    hint: "ます형 어간(降り) + そうだ",
    jlpt: "N4"
  },
  {
    id: "cq_02",
    type: "sou_conjecture",
    prompt_ko: "이 요리는 맛있을 것 같다",
    prompt_base: "この料理はおいしい",
    prompt_base_reading: "このりょうりはおいしい",
    instruction: "추측 そうだ를 사용해서",
    answer: "この料理はおいしそうだ",
    answer_reading: "このりょうりはおいしそうだ",
    hint: "い형용사 어간(おいし) + そうだ",
    jlpt: "N4"
  },
  {
    id: "cq_03",
    type: "sou_conjecture",
    prompt_ko: "저 가방은 비쌀 것 같다",
    prompt_base: "あのかばんは高い",
    prompt_base_reading: "あのかばんはたかい",
    instruction: "추측 そうだ를 사용해서",
    answer: "あのかばんは高そうだ",
    answer_reading: "あのかばんはたかそうだ",
    hint: "い형용사 어간(高) + そうだ",
    jlpt: "N4"
  },
  {
    id: "cq_04",
    type: "sou_hearsay",
    prompt_ko: "다나카 씨는 내일 온다고 한다",
    prompt_base: "田中さんは明日来る",
    prompt_base_reading: "たなかさんはあしたくる",
    instruction: "전언 そうだ를 사용해서",
    answer: "田中さんは明日来るそうだ",
    answer_reading: "たなかさんはあしたくるそうだ",
    hint: "보통형(来る) + そうだ",
    jlpt: "N4"
  },
  {
    id: "cq_05",
    type: "sou_hearsay",
    prompt_ko: "이 영화는 재미있다고 한다",
    prompt_base: "この映画はおもしろい",
    prompt_base_reading: "このえいがはおもしろい",
    instruction: "전언 そうだ를 사용해서",
    answer: "この映画はおもしろいそうだ",
    answer_reading: "このえいがはおもしろいそうだ",
    hint: "보통형(おもしろい) + そうだ",
    jlpt: "N4"
  },
  {
    id: "cq_06",
    type: "deshou",
    prompt_ko: "내일은 비가 올 것입니다",
    prompt_base: "明日は雨が降る",
    prompt_base_reading: "あしたはあめがふる",
    instruction: "でしょう를 사용해서",
    answer: "明日は雨が降るでしょう",
    answer_reading: "あしたはあめがふるでしょう",
    hint: "보통형(降る) + でしょう",
    jlpt: "N4"
  },
  {
    id: "cq_07",
    type: "deshou",
    prompt_ko: "그녀는 학생일 것입니다",
    prompt_base: "彼女は学生だ",
    prompt_base_reading: "かのじょはがくせいだ",
    instruction: "でしょう를 사용해서",
    answer: "彼女は学生でしょう",
    answer_reading: "かのじょはがくせいでしょう",
    hint: "명사 + でしょう (だ 삭제)",
    jlpt: "N4"
  },
  {
    id: "cq_08",
    type: "kamoshirenai",
    prompt_ko: "그는 아직 자고 있을지도 모른다",
    prompt_base: "彼はまだ寝ている",
    prompt_base_reading: "かれはまだねている",
    instruction: "かもしれない를 사용해서",
    answer: "彼はまだ寝ているかもしれない",
    answer_reading: "かれはまだねているかもしれない",
    hint: "보통형(寝ている) + かもしれない",
    jlpt: "N4"
  },
  {
    id: "cq_09",
    type: "kamoshirenai",
    prompt_ko: "이 약은 효과가 있을지도 모른다",
    prompt_base: "この薬は効果がある",
    prompt_base_reading: "このくすりはこうかがある",
    instruction: "かもしれない를 사용해서",
    answer: "この薬は効果があるかもしれない",
    answer_reading: "このくすりはこうかがあるかもしれない",
    hint: "보통형(ある) + かもしれない",
    jlpt: "N4"
  },
  {
    id: "cq_10",
    type: "sou_conjecture",
    prompt_ko: "이 일은 어려울 것 같다",
    prompt_base: "この仕事は難しい",
    prompt_base_reading: "このしごとはむずかしい",
    instruction: "추측 そうだ를 사용해서",
    answer: "この仕事は難しそうだ",
    answer_reading: "このしごとはむずかしそうだ",
    hint: "い형용사 어간(難し) + そうだ",
    jlpt: "N4"
  },
];

// ===== 문형 (Grammar Patterns) =====
const GRAMMAR_PATTERN_DB = [
  {
    id: "gp_01",
    pattern: "つもり",
    pattern_reading: "つもり",
    meaning_ko: "~할 생각이다",
    connects: "동사 원형",
    rule_ko: "동사 원형 + つもりだ",
    example: "日本へ行くつもりです。",
    example_reading: "にほんへいくつもりです。",
    example_ko: "일본에 갈 생각입니다.",
    jlpt: "N4"
  },
  {
    id: "gp_02",
    pattern: "と思う",
    pattern_reading: "とおもう",
    meaning_ko: "~라고 생각한다",
    connects: "보통형",
    rule_ko: "보통형 + と思う",
    example: "彼は来ないと思います。",
    example_reading: "かれはこないとおもいます。",
    example_ko: "그는 오지 않는다고 생각합니다.",
    jlpt: "N4"
  },
  {
    id: "gp_03",
    pattern: "ことがある",
    pattern_reading: "ことがある",
    meaning_ko: "~하는 경우가 있다",
    connects: "동사 원형",
    rule_ko: "동사 원형 + ことがある",
    example: "朝ご飯を食べないことがあります。",
    example_reading: "あさごはんをたべないことがあります。",
    example_ko: "아침밥을 먹지 않는 경우가 있습니다.",
    jlpt: "N4"
  },
  {
    id: "gp_04",
    pattern: "たことがある",
    pattern_reading: "たことがある",
    meaning_ko: "~한 적이 있다",
    connects: "동사 た형",
    rule_ko: "동사 た형 + ことがある",
    example: "富士山に登ったことがあります。",
    example_reading: "ふじさんにのぼったことがあります。",
    example_ko: "후지산에 오른 적이 있습니다.",
    jlpt: "N4"
  },
  {
    id: "gp_05",
    pattern: "ながら",
    pattern_reading: "ながら",
    meaning_ko: "~하면서",
    connects: "동사 ます형 어간",
    rule_ko: "동사 ます형 어간 + ながら",
    example: "音楽を聴きながら勉強します。",
    example_reading: "おんがくをききながらべんきょうします。",
    example_ko: "음악을 들으면서 공부합니다.",
    jlpt: "N4"
  },
  {
    id: "gp_06",
    pattern: "てみる",
    pattern_reading: "てみる",
    meaning_ko: "~해 보다",
    connects: "동사 て형",
    rule_ko: "동사 て형 + みる",
    example: "この料理を食べてみました。",
    example_reading: "このりょうりをたべてみました。",
    example_ko: "이 요리를 먹어 보았습니다.",
    jlpt: "N4"
  },
  {
    id: "gp_07",
    pattern: "てしまう",
    pattern_reading: "てしまう",
    meaning_ko: "~해 버리다",
    connects: "동사 て형",
    rule_ko: "동사 て형 + しまう",
    example: "宿題を忘れてしまいました。",
    example_reading: "しゅくだいをわすれてしまいました。",
    example_ko: "숙제를 잊어 버렸습니다.",
    jlpt: "N4"
  },
  {
    id: "gp_08",
    pattern: "てもいい",
    pattern_reading: "てもいい",
    meaning_ko: "~해도 된다",
    connects: "동사 て형",
    rule_ko: "동사 て형 + もいい",
    example: "ここに座ってもいいですか。",
    example_reading: "ここにすわってもいいですか。",
    example_ko: "여기 앉아도 됩니까?",
    jlpt: "N4"
  },
  {
    id: "gp_09",
    pattern: "てはいけない",
    pattern_reading: "てはいけない",
    meaning_ko: "~하면 안 된다",
    connects: "동사 て형",
    rule_ko: "동사 て형 + はいけない",
    example: "ここでタバコを吸ってはいけません。",
    example_reading: "ここでタバコをすってはいけません。",
    example_ko: "여기서 담배를 피우면 안 됩니다.",
    jlpt: "N4"
  },
  {
    id: "gp_10",
    pattern: "なければならない",
    pattern_reading: "なければならない",
    meaning_ko: "~하지 않으면 안 된다 / ~해야 한다",
    connects: "동사 ない형 어간",
    rule_ko: "동사 ない형 어간 + なければならない",
    example: "薬を飲まなければなりません。",
    example_reading: "くすりをのまなければなりません。",
    example_ko: "약을 먹지 않으면 안 됩니다.",
    jlpt: "N4"
  },
  {
    id: "gp_11",
    pattern: "ために",
    pattern_reading: "ために",
    meaning_ko: "~하기 위해",
    connects: "동사 원형",
    rule_ko: "동사 원형 + ために",
    example: "日本語を勉強するために、毎日練習します。",
    example_reading: "にほんごをべんきょうするために、まいにちれんしゅうします。",
    example_ko: "일본어를 공부하기 위해 매일 연습합니다.",
    jlpt: "N4"
  },
  {
    id: "gp_12",
    pattern: "ように",
    pattern_reading: "ように",
    meaning_ko: "~하도록 / ~하게",
    connects: "동사 원형 / ない형",
    rule_ko: "동사 원형/ない형 + ように",
    example: "忘れないように、メモします。",
    example_reading: "わすれないように、メモします。",
    example_ko: "잊지 않도록 메모합니다.",
    jlpt: "N4"
  },
  {
    id: "gp_13",
    pattern: "らしい",
    pattern_reading: "らしい",
    meaning_ko: "~인 것 같다 (근거 있는 추측)",
    connects: "보통형",
    rule_ko: "보통형 + らしい",
    example: "彼女は先生らしい。",
    example_reading: "かのじょはせんせいらしい。",
    example_ko: "그녀는 선생님인 것 같다.",
    jlpt: "N4"
  },
  {
    id: "gp_14",
    pattern: "ばよかった",
    pattern_reading: "ばよかった",
    meaning_ko: "~했으면 좋았을 텐데",
    connects: "동사 ば형",
    rule_ko: "동사 ば형 + よかった",
    example: "もっと早く来ればよかった。",
    example_reading: "もっとはやくくればよかった。",
    example_ko: "더 일찍 왔으면 좋았을 텐데.",
    jlpt: "N4"
  },
];

// Grammar pattern questions
const GRAMMAR_QUESTIONS = [
  {
    id: "gpq_01",
    pattern_id: "gp_01",
    prompt_ko: "일본에 갈 생각입니다.",
    prompt_jp: "日本へ行く＿＿＿です。",
    prompt_jp_reading: "にほんへいく＿＿＿です。",
    answer: "つもり",
    answer_reading: "つもり",
    hint: "동사 원형 + つもりだ",
    jlpt: "N4"
  },
  {
    id: "gpq_02",
    pattern_id: "gp_02",
    prompt_ko: "그는 오지 않는다고 생각합니다.",
    prompt_jp: "彼は来ない＿＿＿思います。",
    prompt_jp_reading: "かれはこない＿＿＿おもいます。",
    answer: "と",
    answer_reading: "と",
    hint: "보통형 + と思う",
    jlpt: "N4"
  },
  {
    id: "gpq_03",
    pattern_id: "gp_04",
    prompt_ko: "후지산에 오른 적이 있습니까?",
    prompt_jp: "富士山に登った＿＿＿がありますか。",
    prompt_jp_reading: "ふじさんにのぼった＿＿＿がありますか。",
    answer: "こと",
    answer_reading: "こと",
    hint: "た형 + ことがある",
    jlpt: "N4"
  },
  {
    id: "gpq_04",
    pattern_id: "gp_05",
    prompt_ko: "음악을 들으면서 공부합니다.",
    prompt_jp: "音楽を聴き＿＿＿勉強します。",
    prompt_jp_reading: "おんがくをきき＿＿＿べんきょうします。",
    answer: "ながら",
    answer_reading: "ながら",
    hint: "ます형 어간 + ながら",
    jlpt: "N4"
  },
  {
    id: "gpq_05",
    pattern_id: "gp_06",
    prompt_ko: "이 요리를 먹어 보았습니다.",
    prompt_jp: "この料理を食べて＿＿＿。",
    prompt_jp_reading: "このりょうりをたべて＿＿＿。",
    answer: "みました",
    answer_reading: "みました",
    hint: "て형 + みる",
    jlpt: "N4"
  },
  {
    id: "gpq_06",
    pattern_id: "gp_07",
    prompt_ko: "숙제를 잊어 버렸습니다.",
    prompt_jp: "宿題を忘れて＿＿＿。",
    prompt_jp_reading: "しゅくだいをわすれて＿＿＿。",
    answer: "しまいました",
    answer_reading: "しまいました",
    hint: "て형 + しまう",
    jlpt: "N4"
  },
  {
    id: "gpq_07",
    pattern_id: "gp_08",
    prompt_ko: "여기 앉아도 됩니까?",
    prompt_jp: "ここに座って＿＿＿いいですか。",
    prompt_jp_reading: "ここにすわって＿＿＿いいですか。",
    answer: "も",
    answer_reading: "も",
    hint: "て형 + もいい",
    jlpt: "N4"
  },
  {
    id: "gpq_08",
    pattern_id: "gp_09",
    prompt_ko: "여기서 담배를 피우면 안 됩니다.",
    prompt_jp: "ここでタバコを吸って＿＿＿いけません。",
    prompt_jp_reading: "ここでタバコをすって＿＿＿いけません。",
    answer: "は",
    answer_reading: "は",
    hint: "て형 + はいけない",
    jlpt: "N4"
  },
  {
    id: "gpq_09",
    pattern_id: "gp_10",
    prompt_ko: "약을 먹어야 합니다.",
    prompt_jp: "薬を飲ま＿＿＿なりません。",
    prompt_jp_reading: "くすりをのま＿＿＿なりません。",
    answer: "なければ",
    answer_reading: "なければ",
    hint: "ない형 어간 + なければならない",
    jlpt: "N4"
  },
  {
    id: "gpq_10",
    pattern_id: "gp_11",
    prompt_ko: "건강해지기 위해 운동합니다.",
    prompt_jp: "健康になる＿＿＿、運動します。",
    prompt_jp_reading: "けんこうになる＿＿＿、うんどうします。",
    answer: "ために",
    answer_reading: "ために",
    hint: "동사 원형 + ために",
    jlpt: "N4"
  },
  {
    id: "gpq_11",
    pattern_id: "gp_12",
    prompt_ko: "잊지 않도록 메모합니다.",
    prompt_jp: "忘れない＿＿＿、メモします。",
    prompt_jp_reading: "わすれない＿＿＿、メモします。",
    answer: "ように",
    answer_reading: "ように",
    hint: "ない형 + ように",
    jlpt: "N4"
  },
];

// ===== 경어 (Honorifics) =====
const HONORIFIC_DB = [
  // 존경어 (Respectful - 尊敬語)
  { id: "hon_01", type: "respectful", plain: "いる", plain_reading: "いる", honorific: "いらっしゃる", honorific_reading: "いらっしゃる", meaning_ko: "계시다" },
  { id: "hon_02", type: "respectful", plain: "行く", plain_reading: "いく", honorific: "いらっしゃる", honorific_reading: "いらっしゃる", meaning_ko: "가시다" },
  { id: "hon_03", type: "respectful", plain: "来る", plain_reading: "くる", honorific: "いらっしゃる", honorific_reading: "いらっしゃる", meaning_ko: "오시다" },
  { id: "hon_04", type: "respectful", plain: "言う", plain_reading: "いう", honorific: "おっしゃる", honorific_reading: "おっしゃる", meaning_ko: "말씀하시다" },
  { id: "hon_05", type: "respectful", plain: "食べる", plain_reading: "たべる", honorific: "召し上がる", honorific_reading: "めしあがる", meaning_ko: "드시다" },
  { id: "hon_06", type: "respectful", plain: "飲む", plain_reading: "のむ", honorific: "召し上がる", honorific_reading: "めしあがる", meaning_ko: "드시다" },
  { id: "hon_07", type: "respectful", plain: "もらう", plain_reading: "もらう", honorific: "いただく", honorific_reading: "いただく", meaning_ko: "받으시다" },
  { id: "hon_08", type: "respectful", plain: "くれる", plain_reading: "くれる", honorific: "くださる", honorific_reading: "くださる", meaning_ko: "주시다" },
  { id: "hon_09", type: "respectful", plain: "する", plain_reading: "する", honorific: "なさる", honorific_reading: "なさる", meaning_ko: "하시다" },
  { id: "hon_10", type: "respectful", plain: "知っている", plain_reading: "しっている", honorific: "ご存知だ", honorific_reading: "ごぞんじだ", meaning_ko: "알고 계시다" },
  // 겸양어 (Humble - 謙譲語)
  { id: "hon_11", type: "humble", plain: "行く", plain_reading: "いく", honorific: "参る", honorific_reading: "まいる", meaning_ko: "가다 (겸양)" },
  { id: "hon_12", type: "humble", plain: "来る", plain_reading: "くる", honorific: "参る", honorific_reading: "まいる", meaning_ko: "오다 (겸양)" },
  { id: "hon_13", type: "humble", plain: "いる", plain_reading: "いる", honorific: "おる", honorific_reading: "おる", meaning_ko: "있다 (겸양)" },
  { id: "hon_14", type: "humble", plain: "言う", plain_reading: "いう", honorific: "申す", honorific_reading: "もうす", meaning_ko: "말하다 (겸양)" },
  { id: "hon_15", type: "humble", plain: "食べる", plain_reading: "たべる", honorific: "いただく", honorific_reading: "いただく", meaning_ko: "먹다 (겸양)" },
  { id: "hon_16", type: "humble", plain: "もらう", plain_reading: "もらう", honorific: "いただく", honorific_reading: "いただく", meaning_ko: "받다 (겸양)" },
  { id: "hon_17", type: "humble", plain: "あげる", plain_reading: "あげる", honorific: "差し上げる", honorific_reading: "さしあげる", meaning_ko: "드리다 (겸양)" },
  { id: "hon_18", type: "humble", plain: "する", plain_reading: "する", honorific: "いたす", honorific_reading: "いたす", meaning_ko: "하다 (겸양)" },
  { id: "hon_19", type: "humble", plain: "知っている", plain_reading: "しっている", honorific: "存じている", honorific_reading: "ぞんじている", meaning_ko: "알고 있다 (겸양)" },
  { id: "hon_20", type: "humble", plain: "見る", plain_reading: "みる", honorific: "拝見する", honorific_reading: "はいけんする", meaning_ko: "보다 (겸양)" },
];
