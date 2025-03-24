### 프로젝트 용도 및 특징

* 특정 기관의 월간 작업 일정표 수립 시스템을 보조하는 프로그램으로, 월간 일정 계획을 간편하게 수립하기 위해 제작

* 로컬 스토리지(Local Storage) 에 데이터를 저장하여 인터넷 연결 없이 사용이 가능

* 기존에는 하루 단위의 작업 일정을 일일이 수작업으로 배정하고 계산하는 데 약 2~3시간이 소요되었으나,
  이 프로그램을 통해 간단한 클릭만으로 신속하고 정확한 일정 관리 및 자동 시간 계산이 가능해짐

##

### 기술스택

#### 프로그래밍 언어
* html5, css3, javascript

#### 라이브러리
*  FileSaver.js (파일 저장 기능), SheetJS (xlsx.js, 엑셀 파일 생성 및 관리 기능)

##

### 개발 기간

* 2025.01 ~ 2025. 02 (2개월)
  
* 2025.02 ~ 지금 (유지보수)

##

### 사용방법
1. 인원 입력을 먼저한다.
   
2. 작업지시에 넣을 데이터를 클립보드에 복사를 한다.
   
3. 일과 시간 지정을 한다. (인원 배정을 꼭 해야만 일정표의 시간이 나눠짐)

##

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


### 프로젝트 화면

|  |  |
|:---:|:---:|
| <img width="400" height="400" src="https://github.com/user-attachments/assets/243622f2-c87a-4bdb-bdad-bd4d747351e1" /><br>인원 입력 화면| <img width="400" height="400" alt="Image" src="https://github.com/user-attachments/assets/3c9ec463-5d3f-4f43-8a43-ca8a6a5063b2" /><br>작업지시 화면 -1|
| <img width="400" height="400" alt="Image" src="https://github.com/user-attachments/assets/e67f344b-bdd4-4066-bae6-57fa723ed60a" /><br>작업지시 화면 -2 | <img width="400" height="400" alt="Image" src="https://github.com/user-attachments/assets/ed64d5a7-2f9c-4199-823f-b61f43320ad1" /><br>일과시간 지정 화면 |
| <img width="400" height="400" alt="Image" src="https://github.com/user-attachments/assets/3fe2f079-803b-49f1-89d7-f13254964113" /><br>인원 배정 화면 | <img width="400" height="400" alt="Image" src="https://github.com/user-attachments/assets/db4e6d3a-2870-4a52-958c-1aefcb80625a" /><br>Excel, 한셀 파일 다운 화면 |
| <img width="400" height="400" alt="Image" src="https://github.com/user-attachments/assets/d33de20c-f8b4-4639-8f8b-2a82894beaa4" /><br>다운로드 받은 엑셀 화면 |  |


















