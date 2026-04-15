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
 *
 * Expected columns (by header, order doesn't matter):
 *   Post ID, Campaign, Platform, Variant, Post Text, Image URL,
 *   Link URL, Headline, CTA Text, Scheduled Date, Status,
 *   Approved, Client Comment, Reviewed At
 */

function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var data = JSON.parse(e.postData.contents);

  var postId = data.postId;
  var approved = data.approved;
  var comment = data.comment;

  // Find columns by header name (row 1)
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  var colMap = {};
  for (var c = 0; c < headers.length; c++) {
    colMap[String(headers[c]).toLowerCase().trim()] = c;
  }

  var postIdCol = colMap['post id'] !== undefined ? colMap['post id'] : 0;
  var approvedCol = colMap['approved'];
  var commentCol = colMap['client comment'];
  var reviewedCol = colMap['reviewed at'];

  if (approvedCol === undefined) {
    return ContentService
      .createTextOutput(JSON.stringify({ error: 'Missing "Approved" column header' }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  // Find the row with this Post ID
  var range = sheet.getDataRange();
  var values = range.getValues();

  for (var i = 1; i < values.length; i++) {
    if (String(values[i][postIdCol]).trim() === String(postId).trim()) {
      // Approved column
      sheet.getRange(i + 1, approvedCol + 1).setValue(
        approved === 'approved' ? '✅' : approved === 'rejected' ? '❌' : ''
      );
      // Client Comment column
      if (comment && commentCol !== undefined) {
        sheet.getRange(i + 1, commentCol + 1).setValue(comment);
      }
      // Reviewed At column
      if (reviewedCol !== undefined) {
        sheet.getRange(i + 1, reviewedCol + 1).setValue(new Date().toISOString());
      }
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
