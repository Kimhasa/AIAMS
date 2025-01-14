// 로컬스토리지 용량 계산
function updateStorageInfo() {
    const totalBytes = new Blob(Object.values(localStorage)).size;
    const maxMB = 5;
    const usedPercentage = ((totalBytes / (maxMB * 1024 * 1024)) * 100).toFixed(4);

    const usedSpace = totalBytes < 1024
        ? `${totalBytes}Byte`
        : totalBytes < 1024 * 1024
            ? `${(totalBytes / 1024).toFixed(2)}KB`
            : `${(totalBytes / (1024 * 1024)).toFixed(2)}MB`;

    document.getElementById('storageInfo').textContent =
        `로컬스토리지 저장 가능 공간 ${usedSpace} / 5MB (${usedPercentage}%)`;
}

// 페이지 로드 시 초기화
window.addEventListener('DOMContentLoaded', () => {
    updateStorageInfo();
});