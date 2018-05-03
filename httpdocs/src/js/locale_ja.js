export default {
  resultOverviewBalloonTpl: [
    "<h4>",
    '<div style="background-color: <%= bgColor %>; border-color: <%= borderColor %>; " class="result-identifier-color"></div>',
    "<span><%= originAddress %>から<%= travelModeExpr %><%= timeExpr %>分のエリア</span>",
    "</h4>",
    "<div>",
    '<a role="show-routes" >ルートを表示</a>',
    '<a role="erase-result">この結果をクリア</a>',
    '<a role="tweet-result">結果をツイート</a>',
    '<a role="report-problem">この結果の問題を報告</a>',
    '<a role="download-kml">ダウンロード（KML）</a>',
    '<a role="download-geojson">ダウンロード（GeoJSON）</a>',
    "</div>"
  ].join(""),
  resultSummaryBalloonTpl: [
    "<h4>",
    '<div style="background-color: <%= bgColor %>; border-color: <%= borderColor %>; " class="result-identifier-color"></div>',
    "<span><%= originAddress %>から<%= travelModeExpr %><%= timeExpr %>分のエリア</span>",
    "</h4>",
    "<div>",
    '<a role="erase-result">この結果をクリア</a>',
    '<a role="download-kml">ダウンロード（KML）</a>',
    '<a role="download-geojson">ダウンロード（GeoJSON）</a>',
    "</div>"
  ].join(""),
  routeDetailBalloonTpl: [
    '<a role="back-to-summary">&lt;&lt; もどる</a>',
    "<h4><%= summary %></h4>",
    "<p><%= dest %>まで<%= time %></p>",
    '<a href="<%= url %>" target="_blank">',
    "Googleマップで経路を表示",
    "</a>",
    "<hr>",
    "<p><%= copyright %></p>"
  ].join(""),
  summaryTpl:
    "<%= originAddress %>から<%= travelModeExpr %><%= timeExpr %>分のエリア",
  descriptionTpl: `Walk30m（${
    process.env.APP_URL
  }）から<%= executionDateExpr %>にエクスポート.  開始地点: <%= originAddress %>（緯度: <%= origin.lat %>, 経度: <%= origin.lng %>）, 所要時間: <%= timeExpr %>分, 交通手段: <%= travelModeExpr %>, 計算時の優先項目: <%= preferenceExpr %>, 有料道路の使用: <%= avoidTollsExpr %>, 自動車専用道路の使用: <%= avoidHighwaysExpr %>, フェリーの使用: <%= avoidFerriesExpr %>`,
  tweetMessageTpl:
    "<%= originAddress %>から<%= travelModeExpr %><%= timeExpr %>分以内のエリアを調べました。",
  contact: "お問い合わせ内容を入力してください",
  thanks: "ありがとうございました！",
  geocoderResultNotFound:
    "キーワードにマッチする場所が見つかりませんでした。より一般的なキーワードを使用してください。",
  originLocationIsRequired: "開始地点を入力してください",
  searching:
    "<%= address %>から<%= travelModeExpr %><%= min %>分のエリアを調べています...",
  askIfAbort: "中止しますか？",
  preferences: {
    SPEED: "計算の速さ",
    BALANCE: "バランス（既定値）",
    PRECISION: "正確さ"
  },
  travelModes: {
    WALKING: "歩いて",
    DRIVING: "車で",
    TRANSIT: "公共交通機関で",
    BISYCLING: "自転車で"
  },
  use: "使用する",
  noUse: "使用しない",
  completed: "完了しました。",
  dragMapToSpecifyLocation: "地図をドラッグして場所を決めます。",
  geolocationForbidden: "現在地の利用を許可してください。",
  geolocationUnavailable: "現在地は利用できません。",
  geolocationFailure: "現在地が取得できませんでした。",
  geolocationError: "GeoLocation APIで不明なエラーが発生しました。",
  geolocationDetecting: "現在位置を検出しています...",
  reportMessageTpl: [
    "次の結果の問題点について報告します。",
    "<%= summary %>",
    "------",
    "(以下にお気付きの問題点を記載してください。)",
    ""
  ].join("\r\n"),
  askIfReload:
    "計算に時間がかかっているようです。この問題は画面を再読み込みすることで解決する場合があります。いますぐ画面を再読み込みしますか？",
  failedToSendMessage:
    "申し訳ありません。メッセージの送信がうまくいきませんでした。",
  brokenResult: "結果を表示しようとしましたが、壊れているため表示できません。",
  pleaseSpeak: "話してください...",
  cannotRecognizeSpeech: "すみません、聞き取れませんでした。",
  pleaseCheckConditions:
    "計算途中でエラーが発生しました。繰り返し同じエラーが発生する場合、検索条件を見直してください。経路がまったく存在しない場所で実行すると必ずエラーが発生します。"
};
