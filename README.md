### MF 勤怠自動打刻

### コマンド

node mf.js  
heroku logs --tail -a mf-auto

utc12:30am = jtc9:30am

### 参考

https://www.youtube.com/watch?v=dFaV95gS_0M  
https://note.com/pro_buncho/n/n0b13e7764c7b

### 概要

Google カレンダーの出勤予定を取得（Google Calender API から正しく取得できなかったため、GAS 経由でスプレッドシートに出力）  
スプレッドシートから今日の勤務状況を取得し、出社 or リモートの場合は打刻処理に進む  
Heroku Scheduler に登録し（朝と夜）、puppeteer で出勤 or 退社をクリック  
完了したら Slack へ通知する
