var tweetMaxLength = 110;

function Insta2Tweet() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet();
  var range = sheet.getRangeByName("LastPostId");
  var oldId = range.getValue();

  var json = getPosts();

  // 最新の動画投稿を取り出し
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

  if (newId == oldId) {
    return;
  }

  var caption = newObj["caption"];
  var permalink = newObj["permalink"];
  var thumbnail_url = newObj["thumbnail_url"];

  // 投稿内のタグは削除
  if (caption.indexOf("#") > 0) {
    caption = caption.substring(0, caption.indexOf("#"));
  }

  // ピリオドのみの行は削除
  var lines = caption.split(/\r\n|\r|\n/);
  for (var i = lines.length - 1; i >= 0 ; --i) {
    var line = lines[i];
    if (line == ".") {
      lines.splice(i, 1);
    }
  }
  caption = lines.join("\n");

  var remain = caption;
  var tmp = "";
  var isFirstTweet = true;
  var id_str = "";

  // 投稿を分割
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

function tweetWithImage(caption, permalink, thumbnail_url) {
  var response = UrlFetchApp.fetch(thumbnail_url);
  var blob = response.getBlob();
  var base64image = Utilities.base64Encode(blob.getBytes());

  var img_option = { 'method': "POST", 'payload': { 'media_data': base64image } };
  var image_upload = JSON.parse(
    Twitter.oauth.service()
      .fetch("https://upload.twitter.com/1.1/media/upload.json", img_option));
  var sendmsg = caption + "\n\n" + permalink + "\n\n";
  var sendoption = {
    'status': sendmsg,
    'media_ids': image_upload['media_id_string']
  };//オプションに突っ込む

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

function toBase64Url(url, callback) {
  var xhr = new XMLHttpRequest();
  xhr.onload = function () {
    var reader = new FileReader();
    reader.onloadend = function () {
      callback(reader.result);
    }
    reader.readAsDataURL(xhr.response);
  };
  xhr.open('GET', url);
  xhr.responseType = 'blob';
  xhr.send();
}