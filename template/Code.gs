/**
 * Social Posts Previewer — Feedback Write-back
 *
 * Setup:
 * 1. In your Google Sheet, go to Extensions > Apps Script
 * 2. Paste this entire file into the editor (replace any existing code)
 * 3. Click Deploy > New deployment
 * 4. Type: Web app
 * 5. Execute as: Me
 * 6. Who has access: Anyone
 * 7. Click Deploy and copy the URL
 * 8. Add &script=YOUR_URL to the previewer link
 */

function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var data = JSON.parse(e.postData.contents);

  var postId = data.postId;
  var approved = data.approved;
  var comment = data.comment;

  // Find the row with this Post ID (Column A)
  var range = sheet.getDataRange();
  var values = range.getValues();

  for (var i = 1; i < values.length; i++) {
    if (String(values[i][0]).trim() === String(postId).trim()) {
      // Column J (index 9) = Approved
      sheet.getRange(i + 1, 10).setValue(
        approved === 'approved' ? '✅' : approved === 'rejected' ? '❌' : ''
      );
      // Column K (index 10) = Client Comment
      if (comment) {
        sheet.getRange(i + 1, 11).setValue(comment);
      }
      // Column L (index 11) = Reviewed At
      sheet.getRange(i + 1, 12).setValue(new Date().toISOString());
      break;
    }
  }

  return ContentService
    .createTextOutput(JSON.stringify({ success: true, postId: postId }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doGet() {
  return ContentService
    .createTextOutput(JSON.stringify({ status: 'ok', message: 'Social Posts Previewer feedback endpoint' }))
    .setMimeType(ContentService.MimeType.JSON);
}
