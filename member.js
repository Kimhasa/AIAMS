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
        const storedData = JSON.parse(localStorage.getItem('members')) || [];
        const rowIndex = Array.from(tbody.children).indexOf(row); // 현재 행의 인덱스

        // members 데이터의 해당 인덱스에 removed 설정
        if (storedData[rowIndex]) {
            storedData[rowIndex].removed = 1;
            localStorage.setItem('members', JSON.stringify(storedData)); // 업데이트된 데이터 저장
        }

        row.style.display = 'none'; // 화면에서 숨기기
        updateTotalPersonnel();
    });
});

// 총 인원 업데이트
function updateTotalPersonnel() {
    const storedData = JSON.parse(localStorage.getItem('members')) || [];
    const totalPersonnel = storedData.filter(member => member.removed === 0).length;
    document.getElementById('totalPersonnel').value = totalPersonnel;
}

// 저장 버튼 클릭 이벤트 (로컬스토리지에 저장)
document.getElementById('saveBtn').addEventListener('click', function () {
    const rows = document.querySelectorAll('.personnel-table tbody tr');
    const members = JSON.parse(localStorage.getItem('members')) || [];

    rows.forEach((row, index) => {
        const name = row.querySelector('input[type="text"]').value || `인원${index + 1}`;
        const isSoldier = row.querySelector('.leader-checkbox').checked ? 0 : 1;

        if (members[index]) {
            // 기존 데이터 업데이트
            members[index].name = name;
            members[index].isSoldier = isSoldier;
            members[index].removed = members[index].removed || 0; // removed 상태 유지
        } else {
            // 새로운 데이터 추가
            members.push({
                id: index + 1,
                name: name,
                isSoldier: isSoldier,
                removed: 0,
            });
        }
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
            if (member.removed === 0) { // removed가 0인 경우만 표시
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
                    const storedData = JSON.parse(localStorage.getItem('members')) || [];
                    storedData[index].removed = 1; // 삭제 처리
                    localStorage.setItem('members', JSON.stringify(storedData)); // 로컬스토리지 업데이트
                    row.style.display = 'none'; // 화면에서 숨기기
                    updateTotalPersonnel();
                });
            }
        });

        updateTotalPersonnel();
    }
}

// 인원 데이터 초기화 버튼 클릭 이벤트
document.getElementById('resetBtn').addEventListener('click', function () {
    if (confirm('정말로 모든 인원 데이터를 초기화하시겠습니까?')) {
        localStorage.removeItem('members'); // 로컬스토리지에서 members 키 삭제
        document.querySelector('.personnel-table tbody').innerHTML = ''; // 테이블 초기화
        document.getElementById('totalPersonnel').value = 0; // 총 인원 수 초기화
        alert('모든 인원 데이터가 초기화되었습니다!');
    }
});


// 페이지 로드 시 초기화
window.addEventListener('DOMContentLoaded', () => {
    loadMembersFromStorage();
    updateStorageInfo();
});
