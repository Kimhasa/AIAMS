let currentMonth = ""; // 현재 선택된 달
let currentDate = "";  // 현재 선택된 날짜

// 클립보드에서 데이터를 읽어오는 함수
function pasteFromClipboard(callback) {
    navigator.clipboard.readText().then((data) => {
        callback(data);
    }).catch((err) => {
        alert("클립보드에서 데이터를 읽는 중 오류 발생: " + err);
    });
}

// 데이터를 파싱하고 동적 헤더 및 달별 데이터 저장
function parseAndSaveSchedule(data, month) {
    const rows = data.trim().split("\n").map(row => row.split("\t")); // 데이터 파싱
    const rawHeaders = rows[0].map(header => header.trim()); // 헤더 정리
    const headers = rawHeaders.slice(0, rawHeaders.length - 31); // 날짜(1~31)를 제외한 헤더만 저장

    // 추가 헤더 정의
    const extraHeaders = ["시작시간", "종료시간", "주작업자", "보조작업자"];
    const updatedHeaders = [...headers, ...extraHeaders]; // 기존 헤더에 추가 헤더 병합

    const content = rows.slice(1); // 본문 데이터 추출

    const scheduleByDay = { headers: updatedHeaders }; // 업데이트된 헤더 저장

    content.forEach(row => {
        const rowData = row.map(cell => cell.trim());
        const generalData = rowData.slice(0, headers.length); // 일반 데이터
        const days = rowData.slice(headers.length); // 날짜 데이터 (1~31)

        days.forEach((dayData, index) => {
            const day = index + 1; // 날짜는 1일부터 시작
            if (dayData === "/") { // `/`가 있는 경우
                if (!scheduleByDay[day]) {
                    scheduleByDay[day] = []; // 해당 날짜가 비어있으면 배열 생성
                }

                // 데이터 객체 생성
                const dataObject = {};
                updatedHeaders.forEach((header, i) => {
                    if (i < headers.length) {
                        dataObject[header] = generalData[i] || "N/A";
                    } else {
                        dataObject[header] = ""; // 추가 헤더는 빈 값으로 초기화
                    }
                });

                scheduleByDay[day].push(dataObject);
            }
        });
    });

    // 로컬스토리지에 저장
    const existingData = JSON.parse(localStorage.getItem("schedules") || "{}");
    existingData[month] = scheduleByDay;
    localStorage.setItem("schedules", JSON.stringify(existingData));

    alert(`${month}의 일정이 저장되었습니다!`);
}




// 선택된 날짜의 데이터를 렌더링
function renderScheduleForDay(month, day) {
    const schedules = JSON.parse(localStorage.getItem("schedules") || "{}");
    const scheduleForMonth = schedules[month] || {};
    const scheduleHeaders = scheduleForMonth.headers || [];
    const scheduleForDay = scheduleForMonth[day] || [];

    const resultContainer = document.getElementById("result");
    resultContainer.innerHTML = ""; // 기존 결과 초기화

    if (scheduleForDay.length === 0) {
        resultContainer.innerHTML = `<p>${day}일에 예정된 점검 항목이 없습니다.</p>`;
        return;
    }

    // 테이블 생성
    const table = document.createElement("table");
    table.style.width = "100%";
    table.style.borderCollapse = "collapse";
    table.border = "1";

    // 동적 헤더 생성
    const thead = document.createElement("thead");
    const headerRow = document.createElement("tr");

    scheduleHeaders.forEach(header => {
        const th = document.createElement("th");
        th.innerText = header.trim();
        th.style.border = "1px solid #ddd";
        th.style.padding = "8px";
        th.style.backgroundColor = "#f4f4f4";
        headerRow.appendChild(th);
    });

    thead.appendChild(headerRow);
    table.appendChild(thead);

    // 본문 생성
    const tbody = document.createElement("tbody");
    scheduleForDay.forEach(rowData => {
        const row = document.createElement("tr");

        scheduleHeaders.forEach(header => {
            const td = document.createElement("td");
            td.innerText = rowData[header.trim()] || "N/A"; // 헤더에 맞는 데이터 삽입
            td.style.border = "1px solid #ddd";
            td.style.padding = "8px";
            row.appendChild(td);
        });

        tbody.appendChild(row);
    });

    table.appendChild(tbody);
    resultContainer.appendChild(table);
}

// 날짜 변경 및 렌더링
function updateDate(date) {
    currentDate = date;
    const [year, month, day] = currentDate.split("-");
    const selectedMonth = `${year}-${month}`;
    const selectedDay = parseInt(day, 10);

    // 선택한 날짜의 데이터를 렌더링
    renderScheduleForDay(selectedMonth, selectedDay);
}

// 이전 날짜로 이동
function prevDay() {
    const date = new Date(currentDate);
    date.setDate(date.getDate() - 1); // 하루 전으로 이동
    const formattedDate = date.toISOString().split("T")[0];
    updateDate(formattedDate); // 날짜 업데이트 및 렌더링
    document.getElementById("workDate").value = formattedDate; // 날짜 선택기 업데이트
}

// 다음 날짜로 이동
function nextDay() {
    const date = new Date(currentDate);
    date.setDate(date.getDate() + 1); // 하루 후로 이동
    const formattedDate = date.toISOString().split("T")[0];
    updateDate(formattedDate); // 날짜 업데이트 및 렌더링
    document.getElementById("workDate").value = formattedDate; // 날짜 선택기 업데이트
}

// "입력" 버튼 클릭 이벤트
document.getElementById("pasteDataBtn").addEventListener("click", () => {
    const monthInput = document.getElementById("workMonth").value;
    if (!monthInput) {
        alert("먼저 입력할 달을 선택하세요.");
        return;
    }

    currentMonth = monthInput; // 현재 달 설정

    pasteFromClipboard((clipboardData) => {
        parseAndSaveSchedule(clipboardData, currentMonth);
    });
});

// 날짜 선택 이벤트
document.getElementById("workDate").addEventListener("change", (event) => {
    const selectedDate = event.target.value; // yyyy-mm-dd 형식
    updateDate(selectedDate);
});

// 이전/다음 버튼 이벤트
document.getElementById("prevDayBtn").addEventListener("click", prevDay);
document.getElementById("nextDayBtn").addEventListener("click", nextDay);

// 초기화
document.addEventListener("DOMContentLoaded", () => {
    const monthInput = document.getElementById("workMonth");
    monthInput.addEventListener("change", () => {
        currentMonth = monthInput.value;
    });

    // 기본 날짜 설정
    const today = new Date().toISOString().split("T")[0];
    document.getElementById("workDate").value = today;
    currentDate = today;
});
