// "입력" 버튼 클릭 시 실행
document.getElementById("pasteDataBtn").addEventListener("click", () => {
    pasteFromClipboard((clipboardData) => {
        const parsedData = parseTable(clipboardData); // 데이터를 파싱
        renderTable(parsedData); // 테이블 생성 및 렌더링
    });
});

// 클립보드에서 데이터를 읽어오는 함수
function pasteFromClipboard(callback) {
    navigator.clipboard.readText()
        .then((text) => {
            callback(text);
        })
        .catch((err) => {
            alert("클립보드에서 데이터를 읽을 수 없습니다.");
            console.error(err);
        });
}

// 클립보드 데이터를 파싱하여 배열로 변환
function parseTable(data) {
    const rows = data.trim().split("\n");
    const headers = rows[0].split("\t"); // 첫 번째 줄은 헤더
    const parsedRows = rows.slice(1).map((row) => row.split("\t")); // 나머지 줄은 데이터
    return { headers, rows: parsedRows };
}

// 테이블을 생성하고 화면에 렌더링
function renderTable({ headers, rows }) {
    const resultDiv = document.getElementById("result");
    resultDiv.innerHTML = ""; // 기존 테이블 초기화

    const table = document.createElement("table");

    // 테이블 헤더 생성
    const thead = document.createElement("thead");
    const headerRow = document.createElement("tr");
    headers.forEach((header) => {
        const th = document.createElement("th");
        th.textContent = header;
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    // 테이블 본문 생성
    const tbody = document.createElement("tbody");
    rows.forEach((row) => {
        const tr = document.createElement("tr");
        row.forEach((cell) => {
            const td = document.createElement("td");
            td.textContent = cell;
            tr.appendChild(td);
        });
        tbody.appendChild(tr);
    });
    table.appendChild(tbody);

    resultDiv.appendChild(table);a
}
