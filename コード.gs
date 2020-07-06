var instaFields = ["id", "caption", "media_type", "permalink", "thumbnail_url"];
var tweetMaxLength = 110;

function debug(text) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet();
  sheet.appendRow([text]);
}

function refreshAccessToken() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet();
  var range = sheet.getRange("A2");  
  var oldToken = range.getValue();
  
  var url = "https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=" + oldToken;
  
  var response = UrlFetchApp.fetch(url);
  var json = JSON.parse(response.getContentText());
  
  Logger.log(json);
  
  range.setValue(json["access_token"]);
}

function getAccessToken() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet();
  var range = sheet.getRange("A2");
  var token = range.getValue();
    
  return token;
}

function getPosts() {
  var url = "https://graph.instagram.com/me/media?fields=" + instaFields.join() + "&access_token=" + getAccessToken();
  var response = UrlFetchApp.fetch(url);
  var json = JSON.parse(response.getContentText());
  
  var sheet = SpreadsheetApp.getActiveSpreadsheet();
  var range = sheet.getRange("A1");
  var range2 = sheet.getRange("A3");
  var oldId = range.getValue();
  
  var index = 0;
  var newObj = json["data"]["0"];
  while (true) {
    if (newObj["media_type"] == "VIDEO") {
      break;
    }
    index = index + 1;
    newObj = json["data"][index.toString()];
  }
  var newId = newObj["id"];
  
  if (newId != oldId) {
    var caption = newObj["caption"];
    var permalink = newObj["permalink"];
    var thumbnail_url = newObj["thumbnail_url"];
    
    if (caption.indexOf("#") > 0) {
      caption = caption.substring(0, caption.indexOf("#"));
    }
    
    var remain = caption;
    var tmp = "";
    var isFirstTweet = true;
    var id_str = "";
    
    while (remain.length > 0) {
      if (remain.length > tweetMaxLength) {
        tmp = remain.substring(0, tweetMaxLength) + "...";
        remain = remain.substring(tweetMaxLength);
      } else {
        tmp = remain;
        remain = "";
      }

      var response2 = null;
      if (isFirstTweet) {
        response2 = tweetWithImage(tmp, permalink, thumbnail_url);
        isFirstTweet = false;
      } else {
        response2 = reply(tmp, id_str);
      }
      id_str = response2["id_str"];
    }
      
    range.setValue(newId);
  }
}

function tweetWithImage(caption, permalink, thumbnail_url) { 
  var response = UrlFetchApp.fetch(thumbnail_url);
  var blob = response.getBlob();
  var base64image = Utilities.base64Encode(blob.getBytes());
  
  var img_option = { 'method':"POST", 'payload':{'media_data':base64image} };
  var image_upload = JSON.parse(Twitter.oauth.service().fetch("https://upload.twitter.com/1.1/media/upload.json",img_option)); 
  var sendmsg = caption + "\n\n" + permalink + "\n\n"; 
  var sendoption = { 'status':sendmsg, 'media_ids':image_upload['media_id_string']} ;//オプションに突っ込む
  
  Logger.log(sendoption);
  
  return Twitter.api('statuses/update', sendoption);
}

function reply(caption, id_str) {
  return Twitter.tweet(caption, id_str);
}

function tweetWithImageTest() {
  var caption = "test";
  var permalink = "https://twitter.com/scrive66";
  var url = "https://pbs.twimg.com/profile_banners/149789702/1550481203/1080x360";
 
  tweetWithImage(caption, permalink, url);
}

function toBase64Url(url, callback){
  var xhr = new XMLHttpRequest();
  xhr.onload = function() {
    var reader = new FileReader();
    reader.onloadend = function() {
      callback(reader.result);
    }
    reader.readAsDataURL(xhr.response);
  };
  xhr.open('GET', url);
  xhr.responseType = 'blob';
  xhr.send();
}