'use strict';
require('dotenv').config();
const { google } = require('googleapis');

(async () => {
  const authorize = () => {
    const jwtClient = new google.auth.JWT(
      process.env.client_email,
      null,
      process.env.private_key,
      ['https://www.googleapis.com/auth/spreadsheets']
    );
    jwtClient.authorize((err, tokens) => {
      if (err) {
        console.log(err);
        return;
      } else {
        console.log('Authorize');
      }
    });
    return google.sheets({ version: 'v4', auth: jwtClient });
  }

  try {
    const sheets = authorize();
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.SHEET_ID,
      range: 'A1',
    })
    console.log('res', res.data.values[0])//スプシのA1
    if (res.data.values[0] == '出社' || res.data.values[0] == 'リモート') {
      //TODO
    }
  } catch (error) {
    console.log('The API returned an error: ' + error);
  }
})();
