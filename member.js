// 총 인원 수 입력 후 Enter 키로 행 생성
document.getElementById('totalPersonnel').addEventListener('keypress', function (event) {
    if (event.key === 'Enter') {
        const total = parseInt(this.value); // 입력된 총 인원 수
        const tbody = document.querySelector('.personnel-table tbody');
        tbody.innerHTML = ''; // 기존 테이블 초기화

        // 입력된 총 인원 수만큼 행 생성
        for (let i = 1; i <= total; i++) {
            const row = document.createElement('tr');
            row.innerHTML = `
                    <td>${i}</td>
                    <td><input type="text" placeholder="이름 입력"></td>
                    <td><input type="checkbox" class="leader-checkbox"></td>
                    <td><input type="checkbox" class="attendance-checkbox"></td>
                    <td><button class="btn red delete-row">삭제</button></td>
                `;
            tbody.appendChild(row);
        }

        // 각 삭제 버튼에 이벤트 핸들러 추가
        document.querySelectorAll('.delete-row').forEach(btn => {
            btn.addEventListener('click', function () {
                this.closest('tr').remove(); // 행 삭제
                updateStorageInfo(); // 삭제 시 저장 공간 업데이트
            });
        });
    }
});

// 저장 버튼 클릭 이벤트 (로컬스토리지에 저장)
document.getElementById('saveBtn').addEventListener('click', function () {
    const rows = document.querySelectorAll('.personnel-table tbody tr');
    const members = []; // 저장할 멤버 데이터

    rows.forEach((row, index) => {
        const name = row.querySelector('input[type="text"]').value || `인원${index + 1}`; // 이름 필드
        const isLeader = row.querySelector('.leader-checkbox').checked ? 0 : 1; // 간부 여부 (0: 간부, 1: 병사)
        const isPresent = row.querySelector('.attendance-checkbox').checked ? 1 : 0; // 출근 여부 (1: 출근)

        // 멤버 객체 생성
        members.push({
            id: index + 1, // 순번
            name: name, // 이름
            isSoldier: isLeader, // 병사 여부
            work: isPresent // 출근 여부
        });
    });

    // 로컬스토리지에 저장
    localStorage.setItem('members', JSON.stringify(members));
    alert('인원 데이터가 로컬스토리지에 저장되었습니다!');
    updateStorageInfo(); // 저장 후 저장 공간 업데이트
});

// 로컬스토리지에서 데이터 불러오기 함수
function loadMembersFromStorage() {
    const tbody = document.querySelector('.personnel-table tbody');
    tbody.innerHTML = ''; // 기존 테이블 초기화

    // 로컬스토리지에서 데이터 가져오기
    const storedData = localStorage.getItem('members');
    if (storedData) {
        const members = JSON.parse(storedData);

        // 저장된 데이터로 테이블 행 생성
        members.forEach((member, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                    <td>${index + 1}</td>
                    <td><input type="text" value="${member.name}" placeholder="이름 입력"></td>
                    <td><input type="checkbox" class="leader-checkbox" ${member.isSoldier === 0 ? 'checked' : ''}></td>
                    <td><input type="checkbox" class="attendance-checkbox" ${member.work === 1 ? 'checked' : ''}></td>
                    <td><button class="btn red delete-row">삭제</button></td>
                `;
            tbody.appendChild(row);
        });

        // 각 삭제 버튼에 이벤트 핸들러 추가
        document.querySelectorAll('.delete-row').forEach(btn => {
            btn.addEventListener('click', function () {
                this.closest('tr').remove(); // 행 삭제
                updateStorageInfo(); // 삭제 시 저장 공간 업데이트
            });
        });
    }
}

// 로컬스토리지 용량 계산 함수
function updateStorageInfo() {
    const totalBytes = new Blob(Object.values(localStorage)).size; // 로컬스토리지 전체 크기 계산
    const maxMB = 5; // 로컬스토리지 최대 용량
    let usedSpace = '';
    let usedPercentage = ((totalBytes / (maxMB * 1024 * 1024)) * 100).toFixed(4); // 사용량 퍼센트 계산

    // 단위 환산
    if (totalBytes < 1024) {
        usedSpace = `${totalBytes}Byte`; // 바이트 단위
    } else if (totalBytes < 1024 * 1024) {
        usedSpace = `${(totalBytes / 1024).toFixed(2)}KB`; // KB 단위
    } else {
        usedSpace = `${(totalBytes / (1024 * 1024)).toFixed(2)}MB`; // MB 단위
    }

    // 화면에 텍스트 업데이트
    document.getElementById('storageInfo').textContent =
        `로컬스토리지 저장 가능 공간 ${usedSpace} / 5MB (${usedPercentage}%)`;

    // 콘솔에 출력
    console.log(`현재 로컬스토리지 사용량: ${usedSpace} / 5MB (${usedPercentage}%)`);
}

// 페이지 로드 시 자동으로 로컬스토리지 데이터 불러오기 및 저장 공간 업데이트
window.addEventListener('DOMContentLoaded', () => {
    loadMembersFromStorage();
    updateStorageInfo(); // 저장 공간 정보 업데이트
});
