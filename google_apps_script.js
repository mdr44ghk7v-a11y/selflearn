/**
 * 【智光商工資處科 - Google 試算表即時連線腳本】
 * 
 * 如果你想讓全班同學用自己的手機填寫，並且即時把資料全部自動存到同一個「Google 試算表」：
 * 
 * 步驟非常簡單：
 * 1. 打開 Google 雲端硬碟，建立一個新的「Google 試算表」
 * 2. 在第一列（第1行）分別填上欄位標題：
 *    A1: 登記時間 | B1: 班級 | C1: 座號 | D1: 姓名 | E1: 參賽組別 | F1: 主題或書名 | G1: 使用AI工具 | H1: 指導老師 | I1: 聯絡方式
 * 3. 點擊試算表上方選單的【擴充功能】->【Apps Script】
 * 4. 把 Apps Script 原本的內容清空，整份複製貼上這份檔案的程式碼
 * 5. 點擊右上角【部署】->【新部署】
 *    - 種類選擇：網頁應用程式 (Web App)
 *    - 執行身分：我 (您的帳號)
 *    - 誰可以存取：任何人 (Anyone)
 * 6. 點擊【部署】，複製取得的「網頁應用程式網址 (Web App URL)」
 * 7. 把該網址填入 index.html 或使用本腳本接收 POST 請求即可！
 */

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(10000); // 鎖定防衝突

  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = JSON.parse(e.postData.contents);

    var currentTime = Utilities.formatDate(new Date(), "GMT+8", "yyyy-MM-dd HH:mm:ss");

    // 將同學填寫的資料寫入試算表新的一列
    sheet.appendRow([
      currentTime,
      data.class || "資處一智",
      data.seat || "",
      data.name || "",
      data.group || "",
      data.topic || "",
      (data.aiTools && data.aiTools.length > 0) ? data.aiTools.join(", ") : "",
      data.teacher || "",
      data.contact || ""
    ]);

    return ContentService.createTextOutput(JSON.stringify({
      "result": "success",
      "message": "報名資料已成功儲存至 Google 試算表！"
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      "result": "error",
      "error": error.toString()
    })).setMimeType(ContentService.MimeType.JSON);

  } finally {
    lock.releaseLock();
  }
}

function doGet(e) {
  // 供查詢目前所有名單
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var rows = sheet.getDataRange().getValues();
    var headers = rows[0];
    var data = [];

    for (var i = 1; i < rows.length; i++) {
      var row = rows[i];
      data.push({
        time: row[0],
        class: row[1],
        seat: row[2],
        name: row[3],
        group: row[4],
        topic: row[5],
        aiTools: row[6] ? String(row[6]).split(", ") : [],
        teacher: row[7],
        contact: row[8]
      });
    }

    return ContentService.createTextOutput(JSON.stringify({
      "result": "success",
      "data": data
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      "result": "error",
      "error": error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}
