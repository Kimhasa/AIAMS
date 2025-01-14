//<script src="jszip.min.js"></script> 를 같이 추가해야함

//table = 이차원 배열, filename = 파일명.확장자
function makeCellFile(table, filename) {
    const content = table.map((innerArr, index) => {
        const row = index + 1;
        const innerContent = innerArr.map((value, i) => {
            const col = String.fromCharCode('A'.charCodeAt(0) + index);
            return `<c r="${col}${row}" t="inlineStr"><is><t>${value}</t></is></c>`;
        });
        const content = `
        <row r="${row}">
            ${innerContent}
        </row>
        `;
        return content;
    });

    const workbookXml = `<?xml version="1.0" encoding="UTF-8"?>
        <workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
            <sheets>
                <sheet name="Sheet1" sheetId="1" r:id="rId1"/>
            </sheets>
        </workbook>`;

    let temp = `<?xml version="1.0" encoding="UTF-8"?>
        <worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
            <sheetData>`;
    temp += '\n' + content;
    const worksheetXml = temp + `
            </sheetData>
        </worksheet>`;

    const relsXml = `<?xml version="1.0" encoding="UTF-8"?>
        <Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
            <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
        </Relationships>`;

    const contentTypesXml = `<?xml version="1.0" encoding="UTF-8"?>
        <Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
            <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
            <Default Extension="xml" ContentType="application/xml"/>
            <Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
            <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
        </Types>`;

    const zip = new JSZip();

    // Add files to the ZIP
    zip.file("[Content_Types].xml", contentTypesXml);
    zip.file("_rels/.rels", relsXml);
    zip.file("xl/workbook.xml", workbookXml);
    zip.file("xl/worksheets/sheet1.xml", worksheetXml);

    // Generate ZIP file and create Blob
    zip.generateAsync({ type: "blob" }).then(function (content) {
        // Create a download link
        const link = document.createElement("a");
        link.href = URL.createObjectURL(content);
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });
}

function makeTestCellFile() {
    makeCellFile([
        ["작업내용", "번호"],
        ["어쩌구 점검", "1"],
        ["저쩌구 점검", "2"],
    ], "테스트파일.cell");
}