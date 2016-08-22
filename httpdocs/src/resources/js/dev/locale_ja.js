window.messages = {
	"resultSummaryBalloonTpl": [
		'<h4>{{originAddress}}から{{timeExpr}}のエリア</h4>',
		'<div>',
			'<a role="show-routes" >ルートを表示</a>',
			'<a role="erase-result">この結果をクリア</a>',
			'<a role="tweet-result">結果をツイート</a>',
			'<a role="report-problem">この結果の問題を報告</a>',
		'</div>'
	].join(''),
	"routeDetailBalloonTpl": [
		'<h4>{{summary}}</h4>',
		'<p>{{dest}}まで{{time}}</p>',
		'<a href="{{url}}" target="_blank">',
		"Googleマップで経路を表示",
		'</a>',
		'<hr>',
		'<p>{{copyright}}</p>'
	].join(''),
	"summaryTpl": "{{originAddress}}から{{travelModeExpr}}{{timeExpr}}のエリア",
	"tweetMessageTpl": "walk30m.comで{{originAddress}}から{{travelModeExpr}}{{timeExpr}}分以内のエリアを調べました。",
	"contact": "お問い合わせ内容を入力してください",
	"thanks": "ありがとうございました！",
	"geocoderResultNotFound": "キーワードにマッチする場所が見つかりませんでした。より一般的なキーワードを使用してください。",
	"originLocationIsRequired": "開始地点を入力してください",
	"searching": "{{address}}から{{travelModeExpr}}{{min}}分のエリアを調べています...",
	"askIfAbort": "中止しますか？",
	"travelModes": {
		"WALKING": '歩いて',
		"DRIVING": '車で',
		"TRANSIT": '公共交通機関で',
		"BISYCLING": '自転車で'
	},
	"completed": "完了しました。",
	"dragMapToSpecifyLocation": "地図をドラッグして場所を決めます。",
	"geolocationForbidden": "現在地の利用を許可してください。",
	"geolocationUnavailable": "現在地は利用できません。",
	"geolocationFailure": "現在地が取得できませんでした。",
	"geolocationError": "GeoLocation APIで不明なエラーが発生しました。",
	"geolocationDetecting": "現在位置を検出しています...",
	"timeUnitMinExpr": "分",
	"reportMessageTpl": [
		"次の結果の問題点について報告します。",
		"ID: {{id}}",
		"{{summary}}",
		"------",
		"(以下にお気付きの問題点を記載してください。)",
		""
	].join('\r\n'),
	"askIfReload": "計算に時間がかかっているようです。この問題は画面を再読み込みすることで解決する場合があります。いますぐ画面を再読み込みしますか？"
};

