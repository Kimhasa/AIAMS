let scheduleData = []; // 데이터를 저장할 배열

// 로컬스토리지에서 데이터 불러오기
function loadFromLocalStorage() {
    const data = localStorage.getItem('schedule');
    if (data) {
        scheduleData = JSON.parse(data);
        updateTable();
    }
}

// 로컬스토리지에 데이터 저장
function saveToLocalStorage() {
    localStorage.setItem('schedule', JSON.stringify(scheduleData));
}

// 요일 계산 함수
function getDayOfWeek(dateString) {
    const days = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
    const date = new Date(dateString);
    return days[date.getDay()];
}

// 저장 버튼 클릭 이벤트
document.getElementById('saveBtn').addEventListener('click', function () {
    const date = document.getElementById('date').value;
    const startTime = document.getElementById('startTime').value;
    const endTime = document.getElementById('endTime').value;
    const lunchStartTime = document.getElementById('lunchStartTime').value;
    const lunchEndTime = document.getElementById('lunchEndTime').value;
    const holidayChecked = document.getElementById('holiday').checked;

    if (!date) {
        alert('날짜를 입력하세요!');
        return;
    }

    // 공휴일이면 일과시간 비우기
    const start = holidayChecked ? '' : startTime;
    const end = holidayChecked ? '' : endTime;

    // 새 데이터 추가
    const newEntry = {
        date,
        day: getDayOfWeek(date),
        start,
        end,
        lunchStart: lunchStartTime,
        lunchEnd: lunchEndTime,
        holiday: holidayChecked ? 1 : 0,
        tasks: []
    };

    scheduleData.push(newEntry); // 데이터 추가

    // 추가 후 내림차순 정렬 (날짜 기준)
    scheduleData.sort((a, b) => new Date(b.date) - new Date(a.date));

    saveToLocalStorage(); // 로컬스토리지에 저장
    updateTable(); // 테이블 업데이트
});

// 테이블 업데이트 함수
function updateTable(filteredData = null) {
    const tbody = document.getElementById('scheduleTableBody');
    tbody.innerHTML = ''; // 기존 행 초기화

    const dataToDisplay = filteredData || scheduleData;

    dataToDisplay.forEach((item, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}</td>
            <td contenteditable="true" onblur="updateAndSaveField(${index}, 'date', this.textContent.trim())" onkeydown="preventEnter(event)">${item.date}</td>
            <td>${item.day}</td>
            <td contenteditable="true" onblur="updateAndSaveField(${index}, 'start', this.textContent.trim())" onkeydown="preventEnter(event)">${item.start}</td>
            <td contenteditable="true" onblur="updateAndSaveField(${index}, 'end', this.textContent.trim())" onkeydown="preventEnter(event)">${item.end}</td>
            <td contenteditable="true" onblur="updateAndSaveField(${index}, 'lunchStart', this.textContent.trim())" onkeydown="preventEnter(event)">${item.lunchStart}</td>
            <td contenteditable="true" onblur="updateAndSaveField(${index}, 'lunchEnd', this.textContent.trim())" onkeydown="preventEnter(event)">${item.lunchEnd}</td>
            <td>
                <input type="checkbox" ${item.holiday ? 'checked' : ''} onchange="updateAndSaveField(${index}, 'holiday', this.checked ? 1 : 0)">
            </td>
            <td>
                <span class="delete-btn" onclick="deleteRow(${index})">삭제</span>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Enter 키 방지 함수
function preventEnter(event) {
    if (event.key === 'Enter') {
        event.preventDefault(); // 기본 Enter 동작 방지
    }
}

// 필드 수정 및 저장 함수
function updateAndSaveField(index, field, value) {
    if (field === 'date') {
        scheduleData[index].day = getDayOfWeek(value); // 날짜 변경 시 요일 자동 업데이트
    }
    scheduleData[index][field] = value; // 데이터 업데이트

    // 데이터 정렬 (내림차순)
    scheduleData.sort((a, b) => new Date(b.date) - new Date(a.date));

    saveToLocalStorage(); // 로컬스토리지에 저장
    updateTable(); // 테이블 업데이트 (화면에 반영)
}

// 행 삭제 함수
function deleteRow(index) {
    scheduleData.splice(index, 1); // 데이터 삭제
    saveToLocalStorage(); // 로컬스토리지에 저장
    updateTable(); // 테이블 업데이트
}

// 날짜별 조회 기능
document.getElementById('filterBtn').addEventListener('click', function () {
    const filterDate = document.getElementById('filterDate').value;
    if (!filterDate) {
        alert('조회할 날짜를 입력하세요!');
        return;
    }

    const filteredData = scheduleData.filter(item => item.date === filterDate);
    updateTable(filteredData);
});

// 초기화 버튼 클릭 시 전체 데이터 표시
document.getElementById('resetBtn').addEventListener('click', function () {
    updateTable(); // 전체 데이터로 테이블 초기화
});

// 페이지 로드 시 로컬스토리지 데이터 불러오기
window.addEventListener('DOMContentLoaded', loadFromLocalStorage);