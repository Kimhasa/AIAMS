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

            // 주작업자/보조작업자 동시 선택 방지
            const mainCheckbox = row.querySelector('.main-checkbox');
            const subCheckbox = row.querySelector('.sub-checkbox');

            mainCheckbox.addEventListener('change', () => {
                if (mainCheckbox.checked) subCheckbox.checked = false;
            });

            subCheckbox.addEventListener('change', () => {
                if (subCheckbox.checked) mainCheckbox.checked = false;
            });
        });
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
    const tableCount = scheduleCount + overflowCount;

    // 모든 작업자 데이터를 가져오기
    const members = JSON.parse(localStorage.getItem(membersKey)) || [];
    const mainWorkers = workScheduleData.filter(s => s.main === 1).map(s => members.find(m => m.id === s.idx));
    const subWorkers = workScheduleData.filter(s => s.sub === 1).map(s => members.find(m => m.id === s.idx));

    // 유효성 검사: 주작업자와 보조작업자가 충분한지 확인
    if (mainWorkers.length < tableCount) {
        alert(`주작업자가 최소 ${tableCount}명 이상 필요합니다.`);
        return;
    }

    // 주작업자와 보조작업자 배치
    for (let i = 0; i < tableCount; i++) {
        const mainWorker = mainWorkers[i] ? mainWorkers[i].name : "미지정";

        // 보조작업자 그룹 나누기 (남은 보조작업자만큼만 배치)
        const subWorkerGroup = subWorkers.slice(i * 2, (i + 1) * 2); // 2명씩 가져오기
        const subWorkerNames = subWorkerGroup.map(worker => worker?.name).join(", ") || "미지정";

        // 기존 작업표: 첫 번째 표
        if (i === 0 && scheduleCount > 0) {
            dailySchedules.forEach(entry => {
                entry["주작업자"] = mainWorker;
                entry["보조작업자"] = subWorkerNames;
            });
        }

        // 초과 작업표: 두 번째 표
        if (i === 1 && overflowCount > 0) {
            overflowSchedules.forEach(entry => {
                entry["주작업자"] = mainWorker;
                entry["보조작업자"] = subWorkerNames;
            });
        }
    }

    // 저장
    localStorage.setItem(overflowKey, JSON.stringify(overflowSchedules));
    schedules[month][day] = dailySchedules;
    localStorage.setItem(schedulesKey, JSON.stringify(schedules));

    console.log("기존 작업표:", dailySchedules);
    console.log("초과 작업표:", overflowSchedules);
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

    alert('일정이 저장되었습니다!');
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
