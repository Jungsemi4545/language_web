// [초기 데이터 및 설정]
const config = {
    en: { placeholder: "Apple / 사과", exams: [{name:"TOEIC", info:"비즈니스 영어"}, {name:"OPIc", info:"말하기"}] },
    jp: { placeholder: "りんご / 사과", exams: [{name:"JLPT", info:"일본어 능력시험"}, {name:"JPT", info:"실용 일본어"}] },
    cn: { placeholder: "苹果 / 사과", exams: [{name:"HSK", info:"중국어 능력시험"}] }
};

let currentLang = localStorage.getItem('selectedLang') || 'en';
let db = JSON.parse(localStorage.getItem('langLabDB')) || {
    en: { words: [], archives: [], goal: "" },
    jp: { words: [], archives: [], goal: "" },
    cn: { words: [], archives: [], goal: "" }
};

// [섹션 전환 로직]
function showSection(id) {
    document.querySelectorAll('.content-section').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    document.querySelectorAll('.nav-link').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('onclick').includes(id));
    });
}

// [기본 기능들]
function switchLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('selectedLang', lang);
    document.getElementById('display-lang').innerText = lang.toUpperCase();
    document.getElementById('goalInput').value = db[lang].goal || "";
    renderAll();
}

function addWord() {
    const w = document.getElementById('wordIn').value;
    const m = document.getElementById('meanIn').value;
    const c = document.getElementById('vocaCat').value;
    if(!w || !m) return;
    db[currentLang].words.push({ word: w, mean: m, cat: c, done: false });
    saveAndRefresh();
    document.getElementById('wordIn').value = ''; document.getElementById('meanIn').value = '';
}

function addArchive() {
    const type = document.getElementById('archiveType').value;
    const title = document.getElementById('archiveTitle').value;
    const content = document.getElementById('archiveContent').value;
    if(!title) return;
    db[currentLang].archives.push({ type, title, content });
    saveAndRefresh();
    document.getElementById('archiveTitle').value = ''; document.getElementById('archiveContent').value = '';
}

function saveAndRefresh() {
    localStorage.setItem('langLabDB', JSON.stringify(db));
    renderAll();
}

// [렌더링 로직]
function renderAll() {
    const words = db[currentLang].words;
    const doneCount = words.filter(w => w.done).length;
    const pct = words.length ? Math.round((doneCount/words.length)*100) : 0;

    // 대시보드 업데이트
    document.getElementById('total-words').innerText = words.length;
    document.getElementById('done-words').innerText = doneCount;
    document.getElementById('progress-pct').innerText = pct + '%';
    document.getElementById('progress-fill').style.width = pct + '%';

    renderWords('전체');
    renderArchives();
    
    // 시험 탭
    document.getElementById('examTabs').innerHTML = config[currentLang].exams.map((e, i) => 
        `<button class="tab-btn" onclick="showExam(${i})">${e.name}</button>`
    ).join('');
}

function renderWords(filter) {
    let list = db[currentLang].words;
    if(filter === '미완료') list = list.filter(w => !w.done);
    else if(filter !== '전체') list = list.filter(w => w.cat === filter);

    document.getElementById('wordList').innerHTML = list.map((w, i) => `
        <tr class="${w.done ? 'done-row' : ''}">
            <td><input type="checkbox" ${w.done ? 'checked' : ''} onclick="toggleWord(${db[currentLang].words.indexOf(w)})"></td>
            <td><strong>${w.word}</strong> <small>(${w.cat})</small></td>
            <td>${w.mean}</td>
            <td><button onclick="deleteItem(${db[currentLang].words.indexOf(w)}, 'words')" style="color:red; background:none;">✕</button></td>
        </tr>
    `).join('');
}

function renderArchives() {
    document.getElementById('archiveDisplay').innerHTML = db[currentLang].archives.map((a, i) => `
        <div class="archive-item">
            <span class="tag">${a.type.toUpperCase()}</span>
            <div style="font-weight:bold;">${a.title}</div>
            <div style="font-size:12px; margin-top:5px; word-break:break-all;">${a.content}</div>
            <button onclick="deleteItem(${i}, 'archives')" style="position:absolute; top:5px; right:5px; background:none;">✕</button>
        </div>
    `).join('');
}

// [퀴즈 엔진]
function startQuiz() {
    const words = db[currentLang].words;
    if(words.length < 4) return alert("퀴즈를 위해 최소 4개의 단어가 필요합니다.");
    
    const target = words[Math.floor(Math.random() * words.length)];
    let options = [target.mean];
    while(options.length < 4) {
        let randomMean = words[Math.floor(Math.random() * words.length)].mean;
        if(!options.includes(randomMean)) options.push(randomMean);
    }
    options.sort(() => Math.random() - 0.5);

    document.getElementById('quiz-area').innerHTML = `
        <div class="quiz-question">"${target.word}"의 뜻은?</div>
        <div class="quiz-options">
            ${options.map(opt => `<button class="option-btn" onclick="checkAnswer('${opt}', '${target.mean}')">${opt}</button>`).join('')}
        </div>
    `;
}

function checkAnswer(selected, correct) {
    if(selected === correct) alert("정답입니다! 🎉");
    else alert(`틀렸습니다. 정답은 [${correct}]입니다.`);
    startQuiz();
}

// 기타 기능 (삭제, 체크, 목표저장 등)
function toggleWord(i) { db[currentLang].words[i].done = !db[currentLang].words[i].done; saveAndRefresh(); }
function deleteItem(i, type) { db[currentLang][type].splice(i, 1); saveAndRefresh(); }
function saveGoal() { db[currentLang].goal = document.getElementById('goalInput').value; saveAndRefresh(); }
function showExam(i) {
    const e = config[currentLang].exams[i];
    document.getElementById('examDetail').innerHTML = `<strong>${e.name}</strong>: ${e.info}`;
}

window.onload = () => switchLanguage(currentLang);
