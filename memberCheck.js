// 로컬스토리지 키
const membersKey = "members"; // 인원 키
const workScheduleKey = "workSchedule"; // 인원 배정 키
const schedulesKey = "schedules"; // 일과시간 지정 키

// 테이블 채우기
function populateTable(schedule = []) {
    const membersData = JSON.parse(localStorage.getItem(membersKey)) || [];
    const tbody = document.querySelector('.personnel-table tbody');
    tbody.innerHTML = ''; // 테이블 초기화

    membersData
        .filter(member => member.removed === 0) // removed가 0인 멤버만 표시
        .forEach((member) => {
            const scheduleData = schedule.find(item => item.idx === member.id) || {
                idx: member.id,
                work: false,
                main: false,
                sub: false,
            };

            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${member.name}</td>
                <td><input type="checkbox" class="work-checkbox" ${scheduleData.work ? 'checked' : ''}></td>
                <td><input type="checkbox" class="main-checkbox" ${scheduleData.main ? 'checked' : ''}></td>
                <td><input type="checkbox" class="sub-checkbox" ${scheduleData.sub ? 'checked' : ''}></td>
            `;
            tbody.appendChild(row);
        });

    // 출근, 주작업자, 보조작업자 전체 체크기능
    const workHeaderCheckbox = document.querySelector('th:nth-child(2) input[type="checkbox"]');
    const mainHeaderCheckbox = document.querySelector('th:nth-child(3) input[type="checkbox"]');
    const subHeaderCheckbox = document.querySelector('th:nth-child(4) input[type="checkbox"]');

    if (workHeaderCheckbox) {
        workHeaderCheckbox.addEventListener('change', () => {
            document.querySelectorAll('.work-checkbox').forEach(cb => {
                cb.checked = workHeaderCheckbox.checked;
            });
        });
    }

    if (mainHeaderCheckbox) {
        mainHeaderCheckbox.addEventListener('change', () => {
            document.querySelectorAll('.main-checkbox').forEach(cb => {
                cb.checked = mainHeaderCheckbox.checked;
            });
        });
    }

    if (subHeaderCheckbox) {
        subHeaderCheckbox.addEventListener('change', () => {
            document.querySelectorAll('.sub-checkbox').forEach(cb => {
                cb.checked = subHeaderCheckbox.checked;
            });
        });
    }
}



// 일정 불러오기 함수
function loadSchedule(date) {
    if (!date) {
        alert('날짜를 선택하세요!');
        return;
    }

    const scheduleData = JSON.parse(localStorage.getItem(workScheduleKey)) || {};
    populateTable(scheduleData[date] || []);
}

function updateSchedules(date) {
    const schedules = JSON.parse(localStorage.getItem(schedulesKey)) || {};
    const workSchedules = JSON.parse(localStorage.getItem(workScheduleKey)) || {};
    const workScheduleData = workSchedules[date] || [];
    const month = date.slice(0, 7); // yyyy-mm 형태의 월 추출
    const day = parseInt(date.slice(-2), 10); // 날짜 추출

    if (!schedules[month]) {
        schedules[month] = { headers: [], [day]: [] };
    }

    const dailySchedules = schedules[month][day] || [];
    const overflowKey = `overflow_${month}_${day}`;
    const overflowSchedules = JSON.parse(localStorage.getItem(overflowKey)) || [];

    // 일정표와 초과 일정표 개수 계산
    const scheduleCount = dailySchedules.length > 0 ? 1 : 0;
    const overflowCount = overflowSchedules.length > 0 ? 1 : 0;

    // 모든 작업자 데이터를 가져오기
    const members = JSON.parse(localStorage.getItem(membersKey)) || [];
    const mainWorkers = workScheduleData.filter(s => s.main === 1).map(s => members.find(m => m.id === s.idx));
    const subWorkers = workScheduleData.filter(s => s.sub === 1).map(s => members.find(m => m.id === s.idx));

    // 유효성 검사: 최소 작업자 수 확인
    if (mainWorkers.length < 1 || subWorkers.length < 1) {
        alert(`주작업자와 보조작업자가 최소 1명 이상 필요합니다.`);
        return;
    }

    // 주작업자와 보조작업자 균등 분배
    const totalMainWorkers = mainWorkers.length;
    const totalSubWorkers = subWorkers.length;

    const mainWorkersForDaily = mainWorkers.slice(0, Math.ceil(totalMainWorkers / 2)).map(worker => worker?.name || "미지정");
    const mainWorkersForOverflow = mainWorkers.slice(Math.ceil(totalMainWorkers / 2)).map(worker => worker?.name || "미지정");

    const subWorkersForDaily = subWorkers.slice(0, Math.ceil(totalSubWorkers / 2)).map(worker => worker?.name || "미지정");
    const subWorkersForOverflow = subWorkers.slice(Math.ceil(totalSubWorkers / 2)).map(worker => worker?.name || "미지정");

    // 기존표 작업자 배치
    if (scheduleCount > 0) {
        dailySchedules.forEach(entry => {
            entry["주작업자"] = mainWorkersForDaily.join(", "); // 기존표 주작업자
            entry["보조작업자"] = subWorkersForDaily.join(", "); // 기존표 보조작업자
        });
    }

    // 초과표 작업자 배치
    if (overflowCount > 0 || mainWorkersForOverflow.length > 0 || subWorkersForOverflow.length > 0) {
        overflowSchedules.forEach(entry => {
            entry["주작업자"] = mainWorkersForOverflow.join(", "); // 초과표 주작업자
            entry["보조작업자"] = subWorkersForOverflow.join(", "); // 초과표 보조작업자
        });
    } else {
        // 초과표가 필요 없는 경우, 삭제
        localStorage.removeItem(overflowKey);
    }

    // 저장
    schedules[month][day] = dailySchedules;
    localStorage.setItem(schedulesKey, JSON.stringify(schedules));
    if (overflowSchedules.length > 0) {
        localStorage.setItem(overflowKey, JSON.stringify(overflowSchedules));
    }

    console.log("기존 작업표:", dailySchedules);
    if (overflowSchedules.length > 0) {
        console.log("초과 작업표:", overflowSchedules);
    } else {
        console.log("초과 작업표 없음.");
    }
}



// 일정 저장
document.getElementById('saveScheduleBtn').addEventListener('click', () => {
    const date = document.getElementById('workDate').value;
    if (!date) {
        alert('날짜를 선택하세요!');
        return;
    }

    const rows = document.querySelectorAll('.personnel-table tbody tr');
    const schedule = [];

    rows.forEach((row, index) => {
        const work = row.querySelector('.work-checkbox').checked ? 1 : 0;
        const main = row.querySelector('.main-checkbox').checked ? 1 : 0;
        const sub = row.querySelector('.sub-checkbox').checked ? 1 : 0;

        const membersData = JSON.parse(localStorage.getItem(membersKey)) || [];
        const member = membersData.filter(m => m.removed === 0)[index];

        schedule.push({
            idx: member.id,
            work,
            main,
            sub
        });
    });

    const scheduleData = JSON.parse(localStorage.getItem(workScheduleKey)) || {};
    scheduleData[date] = schedule;
    localStorage.setItem(workScheduleKey, JSON.stringify(scheduleData));

    // schedules 데이터 업데이트
    updateSchedules(date, schedule);

    updateStorageInfo();  // 저장 공간 정보 업데이트
    alert('일정이 저장되었습니다!');
});

// 인원 배정 데이터 초기화 버튼 클릭 이벤트
document.getElementById('resetBtn').addEventListener('click', function () {
    if (confirm('정말로 모든 인원 배정 데이터를 초기화하시겠습니까?')) {
        // 로컬스토리지에서 workSchedule 키 삭제
        localStorage.removeItem(workScheduleKey);

        // 테이블 초기화
        const tbody = document.querySelector('.personnel-table tbody');
        tbody.innerHTML = '';

        // 저장 공간 정보 업데이트
        updateStorageInfo();

        alert('모든 인원 배정 데이터가 초기화되었습니다!');
    }
});


// 날짜 변경 시 자동 불러오기
document.getElementById('workDate').addEventListener('change', (event) => {
    loadSchedule(event.target.value);
});

// 페이지 로드 시 기본 날짜 설정 및 자동 불러오기
window.addEventListener('DOMContentLoaded', () => {
    const today = new Date().toISOString().split('T')[0]; // 오늘 날짜
    document.getElementById('workDate').value = today; // 기본 날짜 설정
    loadSchedule(today); // 오늘 날짜의 일정 자동 불러오기
});
