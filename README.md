### MF 勤怠自動打刻

### コマンド

node mf.js

utc12:30am = jtc9:30am

### 参考

https://www.youtube.com/watch?v=dFaV95gS_0M  
https://note.com/pro_buncho/n/n0b13e7764c7b

### 概要
Googleカレンダーの出勤予定を取得（Google Calender APIから正しく取得できなかったため、GAS経由でスプレッドシートに出力）   
スプレッドシートから今日の勤務状況を取得し、出社orリモートの場合は打刻処理に進む  
Heroku Schedulerに登録し（朝と夜）、puppeteerで出勤or退社をクリック  
完了したらSlackへ通知する  
