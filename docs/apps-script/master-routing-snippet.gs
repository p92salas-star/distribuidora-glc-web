// Add this helper file to the EXISTING operational Apps Script project.
var GLC_MASTER_SPREADSHEET_ID =
  '1QydykhTtaD5HqpB04opPU0MTUTeWxKt3YOQkBJTAMA4';

function glcMasterSpreadsheet_() {
  return SpreadsheetApp.openById(GLC_MASTER_SPREADSHEET_ID);
}

/*
COPY ONLY THE FOLLOWING IF BLOCK into the beginning of the EXISTING doPost(e),
before its current request parsing/writes. Do not add another doPost function.
All other requests continue through the existing logic unchanged.

if (e && e.parameter && e.parameter.source === 'glc_website_distributor_program') {
  return glcHandleDistributorLead(e, glcMasterSpreadsheet_());
}

END INSERTION. The block above is deliberately commented out at file scope.
*/
