const config = {
    en: { placeholder: "Apple / 사과 / I like apples.", exams: [{name:"TOEIC", info:"비즈니스 영어"}, {name:"OPIc", info:"영어 말하기"}] },
    jp: { placeholder: "りんご / 사과 / りんごを食べる。", exams: [{name:"JLPT", info:"일본어 능력시험"}, {name:"JPT", info:"실용 일본어"}] },
    cn: { placeholder: "苹果 / 사과 / 我吃苹果。", exams: [{name:"HSK", info:"중국어 능력시험"}] }
};

let currentLang = localStorage.getItem('selectedLang') || 'en';
let db = JSON.parse(localStorage.getItem('langLabDB')) || {
    en: { words: [], archives: [], goal: "" },
    jp: { words: [], archives: [], goal: "" },
    cn: { words: [], archives: [], goal: "" }
};

function switchLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('selectedLang', lang);
    document.getElementById('langSelect').value = lang;
    document.getElementById('display-lang').innerText = lang.toUpperCase();
    document.getElementById('exIn').placeholder = config[lang].placeholder;
    document.getElementById('goalInput').value = db[lang].goal || "";
    renderAll();
}

function addWord() {
    const w = document.getElementById('wordIn').value;
    const m = document.getElementById('meanIn').value;
    const e = document.getElementById('exIn').value;
    if(!w || !m) return;
    db[currentLang].words.push({ word: w, mean: m, ex: e, done: false });
    saveAndRefresh();
    document.getElementById('wordIn').value = ''; document.getElementById('meanIn').value = ''; document.getElementById('exIn').value = '';
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

function toggleWord(index) {
    db[currentLang].words[index].done = !db[currentLang].words[index].done;
    saveAndRefresh();
}

function deleteItem(index, type) {
    db[currentLang][type].splice(index, 1);
    saveAndRefresh();
}

function saveGoal() {
    db[currentLang].goal = document.getElementById('goalInput').value;
    saveAndRefresh();
}

function saveAndRefresh() {
    localStorage.setItem('langLabDB', JSON.stringify(db));
    renderAll();
}

function renderAll() {
    // 통계
    const words = db[currentLang].words;
    const doneCount = words.filter(w => w.done).length;
    document.getElementById('total-words').innerText = words.length;
    document.getElementById('done-words').innerText = doneCount;
    document.getElementById('progress-pct').innerText = words.length ? Math.round((doneCount/words.length)*100)+'%' : '0%';

    // 단어장 리스트
    document.getElementById('wordList').innerHTML = words.map((w, i) => `
        <tr class="${w.done ? 'done-row' : ''}">
            <td><input type="checkbox" ${w.done ? 'checked' : ''} onclick="toggleWord(${i})"></td>
            <td><strong>${w.word}</strong></td>
            <td>${w.mean}<br><small>${w.ex}</small></td>
            <td><button onclick="deleteItem(${i}, 'words')" style="color:red; background:none;">✕</button></td>
        </tr>
    `).join('');

    // 자료 정리 리스트
    document.getElementById('archiveDisplay').innerHTML = db[currentLang].archives.map((a, i) => `
        <div class="archive-item">
            <span class="tag">${a.type.toUpperCase()}</span>
            <div style="font-weight:bold; margin-bottom:5px;">${a.title}</div>
            <div style="font-size:13px; color:var(--text-sub);">${a.content}</div>
            <button onclick="deleteItem(${i}, 'archives')" style="position:absolute; top:5px; right:5px; background:none; font-size:10px;">✕</button>
        </div>
    `).join('');

    // 시험 정보 탭
    document.getElementById('examTabs').innerHTML = config[currentLang].exams.map((e, i) => `
        <button class="tab-btn" onclick="showExam(${i})">${e.name}</button>
    `).join('');
}

function showExam(i) {
    const e = config[currentLang].exams[i];
    document.getElementById('examDetail').innerHTML = `<strong>${e.name}</strong><br>${e.info}`;
    document.querySelectorAll('.tab-btn').forEach((b, idx) => b.classList.toggle('active', idx === i));
}

function exportData() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(db));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "my_language_data.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
}

window.onload = () => switchLanguage(currentLang);
