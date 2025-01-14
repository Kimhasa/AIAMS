// 인원 추가 버튼 클릭 이벤트
document.getElementById('addBtn').addEventListener('click', function () {
    const tbody = document.querySelector('.personnel-table tbody');
    const rowCount = tbody.children.length + 1; // 현재 행 개수 + 1
    const row = document.createElement('tr');

    row.innerHTML = `
        <td>${rowCount}</td>
        <td><input type="text" placeholder="이름 입력"></td>
        <td><input type="checkbox" class="leader-checkbox"></td>
        <td><button class="btn red delete-row">삭제</button></td>
    `;
    tbody.appendChild(row);

    updateTotalPersonnel(); // 총 인원 업데이트

    // 삭제 버튼에 이벤트 핸들러 추가
    row.querySelector('.delete-row').addEventListener('click', function () {
        row.remove();
        updateTotalPersonnel();
    });
});

// 총 인원 업데이트
function updateTotalPersonnel() {
    const totalPersonnel = document.querySelectorAll('.personnel-table tbody tr').length;
    document.getElementById('totalPersonnel').value = totalPersonnel;
}

// 저장 버튼 클릭 이벤트 (로컬스토리지에 저장)
document.getElementById('saveBtn').addEventListener('click', function () {
    const rows = document.querySelectorAll('.personnel-table tbody tr');
    const members = [];

    rows.forEach((row, index) => {
        const name = row.querySelector('input[type="text"]').value || `인원${index + 1}`;
        const isSoldier = row.querySelector('.leader-checkbox').checked ? 0 : 1;

        members.push({
            id: index + 1,
            name: name,
            isSoldier: isSoldier,
            removed: 0,
        });
    });

    localStorage.setItem('members', JSON.stringify(members));
    alert('인원 데이터가 로컬스토리지에 저장되었습니다!');
    updateStorageInfo();
});

// 로컬스토리지에서 데이터 불러오기
function loadMembersFromStorage() {
    const storedData = localStorage.getItem('members');
    if (storedData) {
        const members = JSON.parse(storedData);
        const tbody = document.querySelector('.personnel-table tbody');
        tbody.innerHTML = ''; // 기존 테이블 초기화

        members.forEach((member, index) => {
            if (member.removed === 0) {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${index + 1}</td>
                    <td><input type="text" value="${member.name}" placeholder="이름 입력"></td>
                    <td><input type="checkbox" class="leader-checkbox" ${member.isSoldier === 0 ? 'checked' : ''}></td>
                    <td><button class="btn red delete-row">삭제</button></td>
                `;
                tbody.appendChild(row);

                // 삭제 버튼 이벤트 추가
                row.querySelector('.delete-row').addEventListener('click', function () {
                    row.remove();
                    updateTotalPersonnel();
                });
            }
        });

        updateTotalPersonnel();
    }
}

// 페이지 로드 시 초기화
window.addEventListener('DOMContentLoaded', () => {
    loadMembersFromStorage();
    updateStorageInfo();
});
