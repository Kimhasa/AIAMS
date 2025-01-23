// 이 파일을 사용할때는 다른 라이브러리도 같이 추가해 줘야함.
// <script src="FileSaver.min.js"></script>
// <script src="xlsx.mini.min.js"></script>
// <script src="makeCellFile.js"></script>

//table = 삼차원 배열, filename = 파일명.확장자
function makeCellFile(table, filename) {
    // workbook 생성
    let wb = XLSX.utils.book_new();

    console.log(table);

    // sheet 생성
    for (let i = 0; i < table.length; i++) {
        const sheetName = `${i + 1}일`;
        wb.SheetNames.push(sheetName);
        wb.Sheets[sheetName] = XLSX.utils.aoa_to_sheet(table[i]);
    }

    // 엑셀 파일 쓰기
    let wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'binary' });

    // ArrayBuffer 만들어주는 함수
    function s2ab(s) {
        var buf = new ArrayBuffer(s.length); //convert s to arrayBuffer
        var view = new Uint8Array(buf);  //create uint8array as viewer
        for (var i = 0; i < s.length; i++) view[i] = s.charCodeAt(i) & 0xFF; //convert to octet
        return buf;
    }
    // 파일 다운로드
    saveAs(new Blob([s2ab(wbout)], { type: "application/octet-stream" }), filename);
}

function makeTestCellFile() {
    makeCellFile([[
        ["작업내용", "번호"],
        ["어쩌구 점검", "1"],
        ["저쩌구 점검", "2"],
    ]], "테스트파일.cell");
}

function downloadScheduleFile(year, month) {
    // LocalStorage에서 스케줄 데이터 가져오기
    const year_month = `${year}-${String(month).padStart(2, "0")}`;
    const schedules = JSON.parse(localStorage.getItem("schedules") || "{}");
    const scheduleForMonth = schedules[year_month] || {};
    const scheduleHeaders = scheduleForMonth.headers || [];
    const lastDay = new Date(year, month, 0).getDate();

    const sheets = [];
    for (let day = 1; day <= lastDay; day++) {
        const scheduleForDay = scheduleForMonth[`${day}`] || [];
        if (scheduleForDay.length === 0) {
            sheets.push([[`${day}일에 예정된 점검 항목이 없습니다.`]]);
            continue;
        }

        const data = [scheduleHeaders];
        scheduleForDay.forEach(rowData => {
            const row = scheduleHeaders.map(header => rowData[header.trim()] || "N/A");
            data.push(row);
        });

        sheets.push(data);
    }

    makeCellFile(sheets, `${year_month} 예방정비표.xlsx`);
}

function downloadOverflowScheduleFile(year, month) {
    // LocalStorage에서 스케줄 데이터 가져오기
    const year_month = `${year}-${String(month).padStart(2, "0")}`;
    const lastDay = new Date(year, month, 0).getDate();

    const sheets = [];
    for (let day = 1; day <= lastDay; day++) {
        const overflowKey = `overflow_${year_month}_${day}`;
        const overflowSchedules = JSON.parse(localStorage.getItem(overflowKey) || "[]");

        if (overflowSchedules == null || overflowSchedules.length === 0) {
            sheets.push([[`${day}일에 예정된 점검 항목이 없습니다.`]]);
            continue;
        }

        const headers = Object.keys(overflowSchedules[0]);
        const data = [headers];
        overflowSchedules.forEach(rowData => {
            const row = headers.map(header => rowData[header.trim()] || "N/A");
            data.push(row);
        });

        sheets.push(data);
    }

    makeCellFile(sheets, `${year_month} 초과작업표.xlsx`);
}

function downloadFiles(year = 2025, month = 1) {
    downloadScheduleFile(year, month);
    downloadOverflowScheduleFile(year, month);
}