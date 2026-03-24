// [1] 데이터 초기 설정
const config = {
    en: { name: "영어", exams: [{n:"TOEIC", d:"비즈니스 중심 리스닝/리딩 시험"}, {n:"OPIc", d:"실제 회화 능력 평가 말하기 시험"}] },
    jp: { name: "일본어", exams: [{n:"JLPT", d:"일본 정부 주관 공식 능력시험 (N1~N5)"}, {n:"JPT", d:"실무 일본어 커뮤니케이션 시험"}] },
    cn: { name: "중국어", exams: [{n:"HSK", d:"중국어 능력 시험 (1~6급)"}] }
};

let currentLang = localStorage.getItem('selectedLang') || 'en';
let db = JSON.parse(localStorage.getItem('langLabDataPro')) || {
    en: { words: [], archives: [], goal: "" },
    jp: { words: [], archives: [], goal: "" },
    cn: { words: [], archives: [], goal: "" }
};

// [2] 페이지 전환 기능
function showSection(id, btnEl) {
    document.querySelectorAll('.content-section').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    if(btnEl) btnEl.classList.add('active');
}

// [3] 언어 변경 및 저장
function switchLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('selectedLang', lang);
    renderAll();
}

function saveAndRefresh() {
    localStorage.setItem('langLabDataPro', JSON.stringify(db));
    renderAll();
}

// [4] 핵심 렌더링 함수
function renderAll() {
    const data = db[currentLang];
    const words = data.words;
    const learned = words.filter(w => w.done).length;
    const pct = words.length ? Math.round((learned / words.length) * 100) : 0;

    // 대시보드 업데이트
    document.getElementById('display-lang-name').innerText = config[currentLang].name;
    document.getElementById('total-words').innerText = words.length;
    document.getElementById('done-words').innerText = learned;
    document.getElementById('progress-pct').innerText = pct + "%";
    document.getElementById('progress-fill').style.width = pct + "%";
    document.getElementById('goalInput').value = data.goal || "";

    // 시험 정보 탭 초기화
    document.getElementById('examTabs').innerHTML = config[currentLang].exams.map((ex, i) => 
        `<button class="tab-btn" onclick="showExam(${i}, this)">${ex.n}</button>`
    ).join('');
    document.getElementById('examDetail').innerText = "시험 버튼을 클릭해 상세 정보를 확인하세요.";

    filterWords('전체'); // 단어장 렌더링
    renderArchives();   // 자료실 렌더링
    resetQuizView();    // 퀴즈 뷰 초기화
}

// [5] 단어 관리 기능
function addWord() {
    const word = document.getElementById('wordIn').value;
    const mean = document.getElementById('meanIn').value;
    const cat = document.getElementById('vocaCat').value;
    if(!word || !mean) return alert("단어와 뜻을 모두 입력하세요!");

    db[currentLang].words.push({ word, mean, cat, done: false });
    document.getElementById('wordIn').value = '';
    document.getElementById('meanIn').value = '';
    saveAndRefresh();
}

function filterWords(type, btn) {
    if(btn) {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
    }
    
    let list = db[currentLang].words;
    if(type === '미완료') list = list.filter(w => !w.done);
    else if(type !== '전체') list = list.filter(w => w.cat === type);

    document.getElementById('wordListDisplay').innerHTML = list.map((w, i) => {
        // 원본 인덱스 찾기
        const originalIndex = db[currentLang].words.indexOf(w);
        return `
            <div class="voca-card ${w.done ? 'done' : ''}">
                <button class="btn-del" onclick="deleteItem(${originalIndex}, 'words')">✕</button>
                <input type="checkbox" ${w.done ? 'checked' : ''} onclick="toggleWord(${originalIndex})">
                <strong>${w.word}</strong> <span class="voca-tag">${w.cat}</span>
                <p style="margin: 10px 0 0;">${w.mean}</p>
            </div>
        `;
    }).join('');
}

function toggleWord(index) {
    db[currentLang].words[index].done = !db[currentLang].words[index].done;
    saveAndRefresh();
}

// [6] 자료실 관리 기능
function addArchive() {
    const title = document.getElementById('archiveTitle').value;
    const content = document.getElementById('archiveContent').value;
    const type = document.getElementById('archiveType').value;
    if(!title) return alert("제목을 입력하세요!");

    db[currentLang].archives.push({ title, content, type });
    document.getElementById('archiveTitle').value = '';
    document.getElementById('archiveContent').value = '';
    saveAndRefresh();
}

function renderArchives() {
    document.getElementById('archiveDisplay').innerHTML = db[currentLang].archives.map((a, i) => `
        <div class="archive-item">
            <div class="archive-info">
                <small style="color:var(--accent)">[${a.type.toUpperCase()}]</small>
                <h4>${a.title}</h4>
                <p>${a.content}</p>
            </div>
            <button onclick="deleteItem(${i}, 'archives')" style="color:red; background:none; border:none; cursor:pointer;">삭제</button>
        </div>
    `).join('');
}

// [7] 공통 삭제 및 목표 저장
function deleteItem(index, type) {
    if(confirm("정말 삭제하시겠습니까?")) {
        db[currentLang][type].splice(index, 1);
        saveAndRefresh();
    }
}

function saveGoal() {
    db[currentLang].goal = document.getElementById('goalInput').value;
    localStorage.setItem('langLabDataPro', JSON.stringify(db));
}

function showExam(index, btn) {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const exam = config[currentLang].exams[index];
    document.getElementById('examDetail').innerHTML = `<strong>${exam.n}</strong>: ${exam.d}`;
}

// [8] 퀴즈 기능
function resetQuizView() {
    document.getElementById('quiz-container').innerHTML = `
        <div id="quiz-start-view">
            <p>등록한 단어들로 퀴즈를 풀어보세요! (최소 4단어 필요)</p>
            <button class="primary-btn large" onclick="startQuiz()">퀴즈 시작하기</button>
        </div>
    `;
}

function startQuiz() {
    const words = db[currentLang].words;
    if(words.length < 4) return alert("퀴즈를 풀기 위해 단어를 4개 이상 등록해주세요!");

    const target = words[Math.floor(Math.random() * words.length)];
    let options = [target.mean];
    while(options.length < 4) {
        let r = words[Math.floor(Math.random() * words.length)].mean;
        if(!options.includes(r)) options.push(r);
    }
    options.sort(() => Math.random() - 0.5);

    document.getElementById('quiz-container').innerHTML = `
        <h3>다음 단어의 뜻은 무엇일까요?</h3>
        <h1 style="font-size: 40px; margin: 20px 0;">${target.word}</h1>
        <div class="quiz-options-box">
            ${options.map(opt => `<button class="quiz-option" onclick="checkAnswer('${opt}', '${target.mean}')">${opt}</button>`).join('')}
        </div>
        <button onclick="resetQuizView()" style="margin-top:20px; background:none; border:none; color:gray; cursor:pointer;">그만하기</button>
    `;
}

function checkAnswer(selected, correct) {
    if(selected === correct) alert("정답입니다! 잘하셨어요! 🎉");
    else alert(`아쉽네요. 정답은 [${correct}] 입니다.`);
    startQuiz();
}

// [9] 데이터 백업 (JSON 다운로드)
function exportData() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(db));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute("href", dataStr);
    dlAnchor.setAttribute("download", "my_lang_backup.json");
    dlAnchor.click();
}

// 초기 실행
window.onload = () => {
    document.getElementById('langSelect').value = currentLang;
    renderAll();
};
