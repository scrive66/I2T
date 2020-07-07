var instaFields = ["id", "caption", "media_type", "permalink", "thumbnail_url"];
var tokenRefreshUrl = "https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=";

function getTokenCell() {
    return SpreadsheetApp.getActiveSpreadsheet().getRangeByName("Token");
}

function refreshAccessToken() {
    var tokenCell = getTokenCell();
    var oldToken = tokenCell.getValue();

    var refresh_url = tokenRefreshUrl + oldToken;

    var response = UrlFetchApp.fetch(refresh_url);
    var json = JSON.parse(response.getContentText());

    Logger.log(json);

    tokenCell.setValue(json["access_token"]);
}

function getToken() {
    return getTokenCell().getValue();
}

function getPosts() {
    var url = "https://graph.instagram.com/me/media?fields="
        + instaFields.join() + "&access_token=" + getToken();
    var response = UrlFetchApp.fetch(url);
    var json = JSON.parse(response.getContentText());

    return json
}

