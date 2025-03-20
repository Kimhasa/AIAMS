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
    updateStorageInfo();  // 저장 공간 정보 업데이트
}

// 요일 계산 함수
function getDayOfWeek(dateString) {
    const days = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
    const date = new Date(dateString);
    return days[date.getDay()];
}

function distributeTaskTimes(schedule, startTime, endTime, lunchStartTime, lunchEndTime) {
    let currentTime = startTime;
    let overflowSchedules = [];
    let overflowTasks = [];

    function addMinutes(time, minutes) {
        const [hours, mins] = time.split(":").map(Number);
        const date = new Date();
        date.setHours(hours, mins);
        date.setMinutes(date.getMinutes() + minutes);
        return date.toTimeString().slice(0, 5);
    }

    function calculateMinutesBetween(startTime, endTime) {
        const [startHours, startMinutes] = startTime.split(":").map(Number);
        const [endHours, endMinutes] = endTime.split(":").map(Number);
        return (endHours * 60 + endMinutes) - (startHours * 60 + startMinutes);
    }

    function isOverlappingLunch(startTime, duration) {
        const taskEndTime = addMinutes(startTime, duration);
        return startTime < lunchEndTime && taskEndTime > lunchStartTime;
    }

    for (let i = 0; i < schedule.length; ) {
        let item = schedule[i];
        let taskDuration = parseInt(item["시간"], 10);

        const remainingTimeToEnd = calculateMinutesBetween(currentTime, endTime);

        if (taskDuration > remainingTimeToEnd) {
            overflowTasks.push({ ...item });
            schedule.splice(i, 1);
            continue;
        }

        if (isOverlappingLunch(currentTime, taskDuration)) {
            currentTime = lunchEndTime;
        }

        const taskStartTime = currentTime;
        const taskEndTime = addMinutes(currentTime, taskDuration);

        item["시작시간"] = taskStartTime;
        item["종료시간"] = taskEndTime;
        currentTime = taskEndTime;

        i++;
    }

    // 초과 작업 처리
    while (overflowTasks.length > 0) {
        let newOverflowList = [];
        let remainingOverflowTasks = [];
        let overflowStartTime = startTime;

        overflowTasks.forEach(task => {
            let taskDuration = parseInt(task["시간"], 10);
            const remainingTimeToEnd = calculateMinutesBetween(overflowStartTime, endTime);

            if (taskDuration > remainingTimeToEnd) {
                remainingOverflowTasks.push({ ...task });
                return;
            }

            if (isOverlappingLunch(overflowStartTime, taskDuration)) {
                overflowStartTime = lunchEndTime;
            }

            const taskStartTime = overflowStartTime;
            const taskEndTime = addMinutes(overflowStartTime, taskDuration);

            newOverflowList.push({ ...task, "시작시간": taskStartTime, "종료시간": taskEndTime });

            overflowStartTime = taskEndTime;
        });

        overflowSchedules.push(newOverflowList);
        overflowTasks = remainingOverflowTasks;
    }

    return overflowSchedules;
}

// 저장 버튼 클릭 이벤트
document.getElementById("saveBtn").addEventListener("click", function () {
    const date = document.getElementById("date").value;
    const startTime = document.getElementById("startTime").value;
    const endTime = document.getElementById("endTime").value;
    const lunchStartTime = document.getElementById("lunchStartTime").value;
    const lunchEndTime = document.getElementById("lunchEndTime").value;
    const holidayChecked = document.getElementById("holiday").checked;

    if (!date) {
        alert("날짜를 입력하세요!");
        return;
    }

    const start = holidayChecked ? "" : startTime;
    const end = holidayChecked ? "" : endTime;

    const schedulesData = JSON.parse(localStorage.getItem("schedules")) || {};
    const month = date.slice(0, 7); // yyyy-MM
    const day = parseInt(date.slice(-2), 10); // 1~31

    if (!schedulesData[month]) {
        schedulesData[month] = {};
    }

    if (!schedulesData[month][day]) {
        schedulesData[month][day] = [];
    }

    const dailySchedule = schedulesData[month][day];
    let overflowTasks = [];

    if (!holidayChecked) {
        overflowTasks = distributeTaskTimes(dailySchedule, start, end, lunchStartTime, lunchEndTime);
    } else {
        // 공휴일인 경우 시작시간 및 종료시간 초기화
        dailySchedule.forEach(item => {
            item["시작시간"] = "";
            item["종료시간"] = "";
        });
    }

    const existingEntryIndex = scheduleData.findIndex(entry => entry.date === date);
    const newEntry = {
        date,
        day: getDayOfWeek(date),
        start,
        end,
        lunchStart: lunchStartTime,
        lunchEnd: lunchEndTime,
        holiday: holidayChecked ? 1 : 0,
    };

    if (existingEntryIndex > -1) {
        scheduleData[existingEntryIndex] = newEntry;
    } else {
        scheduleData.push(newEntry);
    }

    schedulesData[month][day] = dailySchedule;
    localStorage.setItem("schedules", JSON.stringify(schedulesData));

    if (overflowTasks.length > 0) {
        const overflowKey = `overflow_${month}_${day}`;
        const existingOverflowTasks = JSON.parse(localStorage.getItem(overflowKey)) || [];
        localStorage.setItem(overflowKey, JSON.stringify([...existingOverflowTasks, ...overflowTasks]));
        alert(`작업 시간이 초과되었습니다. 초과 작업은 '${overflowKey}' 키에 저장되었습니다.`);
    }

    saveToLocalStorage();
    updateTable();
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
            <td>${item.date}</td>
            <td>${item.day}</td>
            <td>${item.start}</td>
            <td>${item.end}</td>
            <td>${item.lunchStart}</td>
            <td>${item.lunchEnd}</td>
            <td>
                <input type="checkbox" ${item.holiday ? 'checked' : ''}>
            </td>
            <td>
                <span class="btn red" onclick="deleteRow(${index})">삭제</span>
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

// 행 삭제 함수
function deleteRow(index) {
    scheduleData.splice(index, 1); // 데이터 삭제
    saveToLocalStorage(); // 로컬스토리지에 저장
    updateTable(); // 테이블 업데이트
}

// happy 체크박스 이벤트 처리 함수
function handleHappyChange(checkboxId, startTime, endTime) {
    document.getElementById(checkboxId).addEventListener("change", function () {
        const startTimeInput = document.getElementById("startTime");
        const endTimeInput = document.getElementById("endTime");

        if (this.checked) {
            startTimeInput.value = startTime;
            endTimeInput.value = endTime;
        } else {
            startTimeInput.value = "";
            endTimeInput.value = "";
        }

        // 다른 체크박스 해제 (하나만 선택 가능하도록)
        document.querySelectorAll('.happy-checkbox').forEach(cb => {
            if (cb.id !== checkboxId) cb.checked = false;
        });
    });
}

// happy 이벤트 리스너 등록
handleHappyChange("happy1", "08:30", "17:30");
handleHappyChange("happy2", "08:00", "17:30");
handleHappyChange("happy3", "08:00", "16:00");


// 점심시간 체크박스 이벤트
document.getElementById("lunchTime").addEventListener("change", function () {
    const lunchStartInput = document.getElementById("lunchStartTime");
    const lunchEndInput = document.getElementById("lunchEndTime");

    if (this.checked) {
        lunchStartInput.value = "12:00"; // 24시간 형식으로 값 설정
        lunchEndInput.value = "13:00";
    } else {
        lunchStartInput.value = ""; // 값 초기화
        lunchEndInput.value = "";
    }
});

// 월별 조회 버튼 클릭 이벤트
document.getElementById('filterBtn').addEventListener('click', function () {
    const filterDate = document.getElementById('filterDate').value; // YYYY-MM 형식
    if (!filterDate) {
        alert('조회할 월을 입력하세요!');
        return;
    }

    // 월별 데이터 필터링 (date에서 YYYY-MM 추출)
    const filteredData = scheduleData.filter(item => item.date.startsWith(filterDate));
    updateTable(filteredData); // 필터링된 데이터로 테이블 업데이트
});


// 인원 데이터 초기화 버튼 클릭 이벤트
document.getElementById('resetBtn').addEventListener('click', function () {
    const filterDate = document.getElementById('filterDate').value; // YYYY-MM 형식
    if (!filterDate) {
        alert('삭제할 월을 입력하세요!');
        return;
    }

    if (confirm(`${filterDate}에 해당하는 데이터를 삭제하시겠습니까?`)) {
        // 선택한 월에 해당하지 않는 데이터를 필터링
        scheduleData = scheduleData.filter(item => !item.date.startsWith(filterDate));

        // 로컬스토리지 업데이트
        saveToLocalStorage();

        // 테이블 업데이트
        updateTable();

        alert(`${filterDate}에 해당하는 데이터가 삭제되었습니다.`);
    } else {
        alert('삭제가 취소되었습니다.');
    }
});


// 초기화 버튼 클릭 시 전체 데이터 표시
document.getElementById('viewAllBtn').addEventListener('click', function () {
    updateTable(); // 전체 데이터로 테이블 초기화
});

// 페이지 로드 시 실행될 코드 통합
window.addEventListener('DOMContentLoaded', () => {
    // 로컬스토리지에서 데이터 불러오기
    loadFromLocalStorage();

    // 기본 날짜 설정
    const today = new Date().toISOString().split('T')[0]; // 오늘 날짜
    document.getElementById('date').value = today; // 기본 날짜 설정
});

