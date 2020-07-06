var INSTA_FIELDS = ["id", "caption", "media_type", "permalink", "thumbnail_url"];
var TOKEN_REFRESH_URL = "https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=";

function getSettingSheet() {
    return SpreadsheetApp.getSheetByName("Setting");
}

function getTokenCell() {
    return getActiveSpreadsheet().getRangeByName("Token");
}

function refreshAccessToken() {
    var tokenCell = getTokenCell();
    var oldToken = tokenCell.getValue();

    var refresh_url = TOKEN_REFRESH_URL + oldToken;

    var response = UrlFetchApp.fetch(refresh_url);
    var json = JSON.parse(response.getContentText());

    Logger.log(json);

    tokenCell.setValue(json["access_token"]);
}

function getToken() {
    return getTokenCell.getValue();
}

function getPosts() {
    var url = "https://graph.instagram.com/me/media?fields="
        + instaFields.join() + "&access_token=" + getAccessToken();
    var response = UrlFetchApp.fetch(url);
    var json = JSON.parse(response.getContentText());

    return json
}

