### 프로젝트 용도 및 특징
* 특정 기관의 예방정비 관리 시스템 예방정비표를 계획수립 전 인시수 확인을 위한 용도로 사용됨
* 로컬스토리지로 데이터를 저장하기 때문에 인터넷 연결이 필요 없음

---------------------------------------------------------------------

### 프로젝트 구성
* html5, css3, javascript, FileSaver.js, SheetJS(xlsx.js)

--------------------------------------------------------------------

### 개발 기간
* 2025.01 ~ 2025. 02(2개월)
* 2025.02 ~ 지금 (유지보수)

---------------------------------------------------------------------

### 사용방법
1. 인원 입력을 먼저한다.
2. 작업지시에 넣을 데이터를 클립보드에 복사를 한다.
3. 일과 시간 지정을 한다. (인원 배정을 꼭 해야만 일정표의 시간이 나눠짐)
---------------------------------------------------------------------

### 주의
* 작업지시의 데이터를 새로 입력할 때 **무조건** 기존데이터를 초기화 하고 넣어야함
* 주작업자, 보조작업자 배치로직 
  주작업자 수를 일정표의 개수로 나누어 각 일정표에 균등 배치함

- **예시:**  
  예를 들어, 일정표가 총 **4개**이고 주작업자가 총 **7명**이라면:
  - 먼저, **각 일정표마다 1명씩 배치**. (총 4명 배치 완료)
  - 이후 남은 주작업자(**3명**)를 **첫 번째 일정표부터 순서대로 한 명씩 추가로 배치**.

| 일정표 | 배정된 주작업자 수 |
|--------|-------------------|
| 1      | 2명 ✅ (1명 기본 배치 + 1명 추가 배치) |
| 2      | 2명 ✅ (1명 기본 배치 + 1명 추가 배치) |
| 3      | 2명 ✅ (1명 기본 배치 + 1명 추가 배치) |
| 4      | 1명 ✅ (1명 기본 배치) |

즉, **일정표를 순차적으로 돌며 남은 인원을 하나씩 추가 배치**하는 방식.

