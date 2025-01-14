// 이 파일을 사용할때는 다른 라이브러리도 같이 추가해 줘야함.
// <script src="FileSaver.min.js"></script>
// <script src="xlsx.mini.min.js"></script>
// <script src="makeCellFile.js"></script>

//table = 이차원 배열, filename = 파일명.확장자
function makeCellFile(table, filename) {
    // workbook 생성
    let wb = XLSX.utils.book_new();

    // sheet 생성
    wb.SheetNames.push("sheet 1");

    // 배열 데이터로 시트 데이터 생성
    let ws = XLSX.utils.aoa_to_sheet(table);

    // 시트 데이터를 시트에 넣기 ( 시트 명이 없는 시트인경우 첫번째 시트에 데이터가 들어감 )
    wb.Sheets["sheet 1"] = ws;

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
    saveAs(new Blob([s2ab(wbout)], { type: "application/octet-stream" }), '엑셀_다운로드.xlsx');
}

function makeTestCellFile() {
    makeCellFile([
        ["작업내용", "번호"],
        ["어쩌구 점검", "1"],
        ["저쩌구 점검", "2"],
    ], "테스트파일.cell");
}