// 클립보드에서 데이터를 읽어와 콜백으로 전달하는 함수
function pasteFromClipboard(callback) {
    navigator.clipboard.read()
        .then((c) => c[0].getType('text/html'))
        .then((b) => b.text())
        .then((r) => {
            callback(r);
        });
}

// 현재 이름과 현재 날짜를 저장하는 변수
let currentName = "";
let currentDay = 1;

// 입력된 이름을 읽고 제목에 표시하며 초기 데이터를 설정하는 함수
function load() {
    currentName = document.getElementById('name').value; // 입력값 읽기
    document.getElementById('title').innerText = currentName; // 제목 업데이트
    setDay(1); // 초기 날짜 설정

    // 서브 데이터와 네트워크 데이터가 있으면 결과 업데이트, 없으면 리스트 확인
    if (getSub() && getNetwork()) {
        updateResult();
    } else {
        checkLists();
    }
}

// 현재 날짜를 설정하고 UI에 반영하는 함수
function setDay(day) {
    currentDay = day;
    document.getElementById("dayvalue").innerText = currentDay;
}

// 결과를 업데이트하여 화면에 표시하는 함수
function updateResult() {
    // 필요한 데이터가 모두 없는 경우 경고
    if (!getSub() && getNetwork()) {
        alert("정보를 전부 등록해주세요.");
        return;
    }

    // 현재 날짜에 대한 테이블 생성
    const table = createTable(currentDay);

    // 생성된 테이블을 렌더링하여 결과 영역에 추가
    const r = render([], table, (td, e) => {
        if (e.color) {
            td.style.background = e.color; // 색상 스타일 적용
        }
    });

    const result = document.getElementById("result");
    result.innerHTML = ""; // 기존 결과 초기화
    result.appendChild(r); // 새 결과 추가
}

// 데이터를 확인하고 화면에 리스트로 출력하는 함수
function checkLists() {
    const subData = getSub(); // 서브 데이터 가져오기
    const networkData = getNetwork(); // 네트워크 데이터 가져오기
    const result = document.getElementById("result");
    result.innerHTML = ""; // 기존 결과 초기화

    // 서브 데이터가 있을 경우 렌더링
    if (subData) {
        const renderData = subData.map((e) => {
            const nameindex = Object.keys(e).findIndex(e => e.startsWith("작업내용"));
            const v = Object.values(e)[nameindex];
            return [{ content: v, color: e.color }];
        });
        console.log(renderData);

        const r = render(["작업명"], renderData, (td, e) => {
            if (e.color) {
                td.style.background = e.color;
            }
        });

        const title = document.createElement("h2");
        title.innerText = "간접";
        result.appendChild(title);
        result.appendChild(r);
    }

    // 네트워크 데이터 렌더링
    if (networkData) {
        const renderData = subData.map((e) => {
            const nameindex = Object.keys(e).findIndex(e => e.startsWith("작업내용"));
            const v = Object.values(e)[nameindex];
            return [{ content: v, color: e.color }];
        });
        console.log(renderData);

        const r = render(["작업명"], renderData, (td, e) => {
            if (e.color) {
                td.style.background = e.color;
            }
        });

        const title = document.createElement("h2");
        title.innerText = "네트워크";
        result.appendChild(title);
        result.appendChild(r);
    }
}

// 현재 이름을 반환하는 함수
function getCurrentName() {
    return currentName;
}

// 데이터를 저장하고 리스트를 다시 확인하는 함수
function storeData(name, type, data) {
    if (!localStorage.delis) {
        localStorage.delis = "{}";
    }
    let delis = JSON.parse(localStorage.delis);
    if (!delis[name]) {
        delis[name] = {};
    }
    delis[name][type] = data;
    localStorage.delis = JSON.stringify(delis);
    checkLists();
}

// 다음 날짜로 이동하는 함수
function next(params) {
    setDay(currentDay + 1);
    updateResult();
}

// 이전 날짜로 이동하는 함수
function prev(params) {
    setDay(currentDay - 1);
    updateResult();
}

// 결과를 복사하는 함수
function copy() {
    const result = document.getElementById("result");
    const target = result.children[0];
    const range = document.createRange();
    range.selectNode(target);
    window.getSelection().removeAllRanges();
    window.getSelection().addRange(range);
    document.execCommand("copy");
    window.getSelection().removeAllRanges();
}

// 데이터를 로드하는 함수
function loadData(name, type) {
    const parsed = JSON.parse(localStorage.delis);
    if (parsed[name]) {
        return parsed[name][type];
    } else {
        return undefined;
    }
}

// 네트워크 데이터를 파싱하여 저장하는 함수
function parseNetwork() {
    pasteFromClipboard((data) => {
        const parsed = parseTable(data);
        storeData(getCurrentName(), "network", parsed);
    });
}

// 서브 데이터를 파싱하여 저장하는 함수
function parseSub() {
    pasteFromClipboard((data) => {
        const parsed = parseTable(data);
        storeData(getCurrentName(), "sub", parsed);
    });
}

// 네트워크 데이터를 가져오는 함수
function getNetwork() {
    return loadData(getCurrentName(), "network");
}

// 서브 데이터를 가져오는 함수
function getSub() {
    return loadData(getCurrentName(), "sub");
}

// 특정 날짜에 대한 테이블 데이터를 생성하는 함수
function createTable(day) {
    const works = [];

    const network = getNetwork();
    const sub = getSub();

    // 네트워크 데이터 추가
    network.forEach((e) => {
        if (e[day] !== "") {
            const time = e["소요시간"];
            const name = e[Object.keys(e).find((key) => key.startsWith("작업내용"))];
            const color = e["color"];
            works.push([{ content: time, color }, { content: name, color }]);
        }
    });

    // 서브 데이터 추가
    sub.forEach((e) => {
        console.log(!(e[day] !== ""), e[day], e);
        if (e[day] !== "") {
            const time = e["소요시간"];
            const name = e[Object.keys(e).find(e => e.startsWith("작업내용"))];
            const color = e["color"];
            works.push([{ content: time, color }, { content: name, color }]);
        }
    });

    return works;
}

// 테이블을 렌더링하여 DOM 요소로 반환하는 함수
function render(head, rows, styling) {
    const table = document.createElement("table");
    const thead = document.createElement("thead");
    const tbody = document.createElement("tbody");

    // 테이블 헤더 생성
    head.forEach((e) => {
        const th = document.createElement("th");
        th.innerText = e;
        thead.appendChild(th);
    });

    // 테이블 본문 생성
    rows.forEach((row) => {
        const tr = document.createElement("tr");
        row.forEach((e) => {
            const td = document.createElement("td");
            td.innerText = e.content;
            if (styling) {
                styling(td, e);
            }
            tr.appendChild(td);
        });
        tbody.appendChild(tr);
    });

    table.appendChild(thead);
    table.appendChild(tbody);

    return table;
}

// HTML 내용을 파싱하여 테이블 데이터를 추출하는 함수
function parseTable(html_content) {
    const content = document.createElement("div");
    content.innerHTML = html_content;

    let rows = [...content.getElementsByTagName("tr")];
    let head = [...rows[0].children].map((e) => e.innerText);

    rows = rows.filter((_i, i) => i !== 0);

    const datas = rows.map((row) => {
        const tds = [...row.children];
        const line = {};

        tds.forEach((data, i) => {
            line[head[i]] = data.innerText.trim();
        });

        const colorIndex = head.findIndex((e) => e.startsWith("작업내용"));
        line.color = tds[colorIndex].style.background;

        console.log(line);
        return line;
    });

    console.log(datas);
    return datas;
}
