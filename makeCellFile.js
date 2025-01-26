// 이 파일을 사용할때는 다른 라이브러리도 같이 추가해 줘야함.
// <script src="FileSaver.min.js"></script>
// <script src="xlsx.mini.min.js"></script>
// <script src="jszip.min.js"></script>
// <script src="makeCellFile.js"></script>

//table = 삼차원 배열, filename = 파일명.확장자
async function makeCellFile(table, filename) {
    // workbook 생성
    let wb = XLSX.utils.book_new();

    // sheet 생성
    for (let i = 0; i < table.length; i++) {
        const sheet = XLSX.utils.aoa_to_sheet(table[i]);;
        // 칸을 병합할 필요가 있으면 병합함.
        sheet["!merges"] = [];
        for (let j = 0; j < table[i].length; j++)
            if (table[i][j].length == 1) {
                let size = 3;
                if (j + 1 < table[i].length)
                    size = Math.max(size, table[i][j + 1].length);
                sheet["!merges"].push({ s: { r: j, c: 0 }, e: { r: j, c: size - 1 } });
            }

        const sheetName = `${i + 1}일`;
        wb.SheetNames.push(sheetName);
        wb.Sheets[sheetName] = sheet;
    }

    // 엑셀 파일 쓰기
    let wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'binary' });
    function s2ab(s) {
        var buf = new ArrayBuffer(s.length);
        var view = new Uint8Array(buf);
        for (var i = 0; i < s.length; i++) view[i] = s.charCodeAt(i) & 0xFF;
        return buf;
    }
    let blob = new Blob([s2ab(wbout)]);

    if (filename.split(".")[1] == "cell") {
        const zipContent = await new JSZip().loadAsync(blob);
        const oldStr = await zipContent.file("[Content_Types].xml").async("string");
        const oldVal = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml";
        const newVal = "application/vnd.ms-excel.sheet.macroEnabled.main+xml";
        const newStr = oldStr.replace(oldVal, newVal);
        zipContent.file("[Content_Types].xml", newStr);
        blob = await zipContent.generateAsync({ type: "blob" });
    }

    saveAs(blob, filename);
}

function makeTestCellFile() {
    makeCellFile([[
        ["작업내용", "번호"],
        ["어쩌구 점검", "1"],
        ["저쩌구 점검", "2"],
    ]], "테스트파일.xlsx");
}

function schedule2sheet(year, month) {
    const year_month = `${year}-${String(month).padStart(2, "0")}`;
    const schedules = JSON.parse(localStorage.getItem("schedules") || "{}");
    const scheduleForMonth = schedules[year_month] || {};
    const scheduleHeaders = scheduleForMonth.headers || [];
    const lastDay = new Date(year, month, 0).getDate();

    const sheets = [];
    for (let day = 1; day <= lastDay; day++) {
        const scheduleForDay = scheduleForMonth[`${day}`] || [];
        if (scheduleForDay.length === 0) {
            sheets.push([[`${month}월 ${day}일에 예정된 점검 항목이 없습니다.`]]);
            continue;
        }

        const data = [scheduleHeaders];
        scheduleForDay.forEach(rowData => {
            const row = scheduleHeaders.map(header => rowData[header.trim()] || "N/A");
            data.push(row);
        });

        sheets.push(data);
    }

    return sheets;
}

function overflowSchedules2sheet(year, month) {
    const year_month = `${year}-${String(month).padStart(2, "0")}`;
    const lastDay = new Date(year, month, 0).getDate();

    const sheets = [];
    for (let day = 1; day <= lastDay; day++) {
        const overflowKey = `overflow_${year_month}_${day}`;
        const overflowSchedules = JSON.parse(localStorage.getItem(overflowKey) || "[]");

        if (overflowSchedules == null || overflowSchedules.length === 0) {
            sheets.push([[`${month}월 ${day}일에 초과작업이 없습니다.`]]);
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

    return sheets;
}

function mergeSheet(year, month, title1, sheet1, title2, sheet2) {
    const lastDay = new Date(year, month, 0).getDate();

    const sheets = [];
    for (let day = 1; day <= lastDay; day++) {
        const sheet = [];

        sheet.push([`${month}월 ${day}일 ${title1}`]);
        sheet1[day - 1].forEach(row => sheet.push(row));

        sheet.push([`${month}월 ${day}일 ${title2}`]);
        sheet2[day - 1].forEach(row => sheet.push(row));

        sheets.push(sheet);
    }

    return sheets;
}

function download2File() {
    const year_month = document.getElementById("downloadMonth").value;
    const year = new Date(year_month).getFullYear();
    const month = new Date(year_month).getMonth() + 1;

    const fileFormatNodeList = document.getElementsByName('fileFormat');
    let fileFormat = "cell";
    fileFormatNodeList.forEach((node) => {
        if (node.checked)
            fileFormat = node.value;
    })

    makeCellFile(schedule2sheet(year, month), `${year_month} 예방정비표.${fileFormat}`);
    makeCellFile(overflowSchedules2sheet(year, month), `${year_month} 초과작업표.${fileFormat}`);
}

function download1File() {
    const year_month = document.getElementById("downloadMonth").value;
    const year = new Date(year_month).getFullYear();
    const month = new Date(year_month).getMonth() + 1;

    const fileFormatNodeList = document.getElementsByName('fileFormat');
    let fileFormat = "cell";
    fileFormatNodeList.forEach((node) => {
        if (node.checked)
            fileFormat = node.value;
    })

    const title1 = "예방정비 내용"
    const sheet1 = schedule2sheet(year, month);

    const title2 = "초과작업 내용"
    const sheet2 = overflowSchedules2sheet(year, month);

    const sheet = mergeSheet(year, month, title1, sheet1, title2, sheet2);

    makeCellFile(sheet, `${year_month} 표.${fileFormat}`);
}