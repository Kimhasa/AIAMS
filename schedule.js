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
    let currentTime = startTime; // 작업 시작 시간
    let overflowTasks = []; // 초과 작업 저장 배열

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

        const start = startHours * 60 + startMinutes;
        const end = endHours * 60 + endMinutes;

        return end - start;
    }

    // 작업 배정을 위한 반복
    for (let i = 0; i < schedule.length; ) {
        let item = schedule[i];
        let taskDuration = parseInt(item["시간"], 10); // 작업 소요 시간

        // 남은 시간을 계산하여 초과 작업 여부 판단
        const remainingTimeToEnd = calculateMinutesBetween(currentTime, endTime);
        if (taskDuration > remainingTimeToEnd) {
            overflowTasks.push({ ...item });
            schedule.splice(i, 1);
            continue; // 다음 작업으로 이동
        }

        let taskCompleted = false; // 작업 완료 여부

        while (taskDuration > 0) {
            // 점심시간 처리: 점심시간에 걸치는 경우 작업을 무조건 점심시간 종료 후로 이동
            if (currentTime < lunchEndTime && addMinutes(currentTime, taskDuration) > lunchStartTime) {
                currentTime = lunchEndTime; // 점심시간 이후로 강제 이동
                continue;
            }

            const remainingTime = calculateMinutesBetween(currentTime, endTime);

            if (remainingTime > 0) {
                const allocatableTime = Math.min(taskDuration, remainingTime);
                const taskStartTime = currentTime;
                const taskEndTime = addMinutes(currentTime, allocatableTime);

                // 작업 배정
                item["시작시간"] = taskStartTime;
                item["종료시간"] = taskEndTime;
                taskDuration -= allocatableTime;
                currentTime = taskEndTime;

                if (taskDuration === 0) {
                    taskCompleted = true;
                    break;
                }
            } else {
                break;
            }
        }

        // 작업이 끝나지 않은 경우 초과 작업으로 분류
        if (!taskCompleted && taskDuration > 0) {
            const overflowTask = { ...item };
            overflowTask["시간"] = taskDuration;
            overflowTasks.push(overflowTask);
            schedule.splice(i, 1); // 초과 작업에서 제거
        } else {
            i++;
        }
    }

    // 초과 작업을 기존 **시작 시간부터** 재배정
    let overflowStartTime = startTime; // 초과 작업 시작 시간 초기화
    overflowTasks.forEach(task => {
        let taskDuration = parseInt(task["시간"], 10);

        while (taskDuration > 0) {
            // 점심시간 체크: 점심시간에 걸치는 경우 무조건 점심시간 이후로 이동
            if (overflowStartTime < lunchEndTime && addMinutes(overflowStartTime, taskDuration) > lunchStartTime) {
                overflowStartTime = lunchEndTime; // 점심시간 이후로 이동
                continue;
            }

            const remainingTime = calculateMinutesBetween(overflowStartTime, endTime);

            if (remainingTime > 0) {
                const allocatableTime = Math.min(taskDuration, remainingTime);
                const taskStartTime = overflowStartTime;
                const taskEndTime = addMinutes(overflowStartTime, allocatableTime);

                // 초과 작업 배정
                task["시작시간"] = taskStartTime;
                task["종료시간"] = taskEndTime;
                taskDuration -= allocatableTime;
                overflowStartTime = taskEndTime;

                if (taskDuration === 0) {
                    break;
                }
            } else {
                break; // 더 이상 배정할 시간이 없으면 루프 종료
            }
        }
    });

    return overflowTasks; // 최종 초과 작업 반환
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
// 테이블 업데이트 함수 (수정 기능 제거)
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

// 필드 수정 및 저장 함수
function updateAndSaveField(index, field, value) {
    if (field === 'date') {
        scheduleData[index].day = getDayOfWeek(value); // 날짜 변경 시 요일 자동 업데이트
    }
    scheduleData[index][field] = value; // 데이터 업데이트

    // 데이터 정렬 (내림차순)
    scheduleData.sort((a, b) => new Date(b.date) - new Date(a.date));

    saveToLocalStorage(); // 로컬스토리지에 저장
    updateStorageInfo();  // 저장 공간 정보 업데이트
    updateTable(); // 테이블 업데이트 (화면에 반영)
}

// 행 삭제 함수
function deleteRow(index) {
    scheduleData.splice(index, 1); // 데이터 삭제
    saveToLocalStorage(); // 로컬스토리지에 저장
    updateTable(); // 테이블 업데이트
}

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

