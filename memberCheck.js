// 로컬스토리지 키
const membersKey = "members";
const workScheduleKey = "workSchedule";

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
        const work = row.querySelector('.work-checkbox').checked;
        const main = row.querySelector('.main-checkbox').checked;
        const sub = row.querySelector('.sub-checkbox').checked;

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