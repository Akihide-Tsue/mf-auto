'use strict';
require('dotenv').config();
const { google } = require('googleapis');
const _ = require('lodash')
const puppeteer = require('puppeteer');
const { setTimeout } = require("timers/promises");
const { IncomingWebhook } = require("@slack/webhook");

(async () => {
  //スプシ認証
  const authorize = () => {
    const email = process.env.client_email
    const privateKey = _.replace(process.env.private_key, /\\n/g, '\n');
    const scope = ['https://www.googleapis.com/auth/spreadsheets'];
    const jsonWebToken = new google.auth.JWT(email, null, privateKey, scope, null);

    jsonWebToken.authorize((err, tokens) => {
      if (err) {
        console.log(err);
        return;
      } else {
        console.log('Authorized!');
      }
    });
    return google.sheets({ version: 'v4', auth: jsonWebToken });
  }

  //MF打刻
  const mfPuppeteer = async () => {
    const browser = await puppeteer.launch({
      //  headless: false, //ブラウザ起動
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--single-process']
    });
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36');
    console.log('newPage OK')
    await page.goto('https://attendance.moneyforward.com/employee_session/new', { waitUntil: ['load', 'networkidle2'] })
    await setTimeout(20000)//20秒
    await page.click('a[class="attendance-button-mfid attendance-button-link attendance-button-size-wide"]');
    console.log('ページ遷移')
    await setTimeout(20000)
    await page.type('input[name="mfid_user[email]"]', process.env.MF_ID);
    await page.click('input[type="submit"]');
    await setTimeout(20000)
    console.log('パスワード画面')
    await page.type('input[name="mfid_user[password]"]', process.env.MF_PASSWORD);
    await setTimeout(20000)
    await page.click('input[type="submit"]');
    console.log('ログイン完了')
    await setTimeout(20000)

    let buttonType = 'in'
    let message = '出勤打刻'
    //13時以降
    if (new Date().getHours() > 13) {
      console.log('退勤')
      buttonType = 'out'
      message = '退勤打刻'
    }
    await setTimeout(20000)
    await page.click(`button[class="_btn__2D6J_ __fit-width__2D6J_ _btn-hover-dark__2D6J_ karte-close"]`);//ダイアログ
    await setTimeout(20000)
    await page.click(`div[class="attendance-card-time-stamp-icon attendance-card-time-stamp-clock-${buttonType}"]`);
    await setTimeout(20000)
    await page.click(`div[class="attendance-card-time-stamp-icon attendance-card-time-stamp-clock-${buttonType}"]`);
    await setTimeout(20000)
    console.log('完了')

    //Slack通知
    const webhook = new IncomingWebhook(process.env.SLACK_HOOK_URL);
    webhook.send({
      text: "<!channel>\n" + message,
      username: "MF勤怠", //通知のユーザー名
      icon_url: 'https://icooon-mono.com/i/icon_12426/icon_124261_64.png',
    });
    await browser.close();
  }

  try {
    console.log('-----開始-----', new Date().getHours())
    const sheets = authorize();
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.SHEET_ID,
      range: 'A1',
    })
    console.log('本日の勤務：', res.data.values[0])//スプシのA1
    if (res.data.values[0] == '出社' || res.data.values[0] == 'リモート') {
      mfPuppeteer()
    } else {
      console.log('今日は休日')
    }
  } catch (error) {
    console.log('The API returned an error: ' + error);
  }
})();
