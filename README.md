# YTB-Recorder

유튜브 페이지에서 간단한 레코딩을 할 수 있는 크롬 확장 앱입니다.

[vanillaJS로 구현](https://github.com/gomiseki/chrome-extension-ytbRecording)했던 앱을
manifest V2가 지원 종료됨에 따라 React기반의 앱으로 재구성 했습니다.

<br>
<br>

## 구조

실행 시 getUserMedia를 통해 마이크 장치의 권한을 획득하고, 업창에서 유튜브 페이지의 DOM을 조작합니다. 
영상이 정지된 상태에서 녹음버튼을 누르면, mediaCapture를 통해 마이크의 오디오트랙과 유튜브 비디오 오디오트랙이 동시에 녹음됩니다.
녹음이 끝나면 미디어스트림은 base64포맷으로 인코딩, ocalstrorage를 통해 팝업창에 전달되어 재생할 수 있게 됩니다.

![슬라이드2](https://user-images.githubusercontent.com/50083131/157593555-1e4b6361-fcdd-48d6-b97b-189562e9587e.png)

## 동작
![시연](https://user-images.githubusercontent.com/50083131/157592623-1abfbedb-f8b3-4bc2-b2fd-35dab626db0c.gif)
