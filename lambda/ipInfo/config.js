exports.ipInfoDB = {
	url: 'https://api.ipinfodb.com/v3',
	key: '%IP_INFO_DB_KEY%',
	timeout: 2000,
	fallbackResponses: [
		{ lat: 43.1502899, lng: 140.9286021 }, // 小樽
		{ lat: 35.3339224, lng: 139.5057884 }, // 鎌倉
		{ lat: 34.4756217, lng: 136.6554674 }, // 伊勢
		{ lat: 43.0594447, lng: 141.3354806 }, // 札幌
		{ lat: 32.7473544, lng: 129.8685007 }, // 長崎
		{ lat: 34.9738328, lng: 135.8092633 }, // 祇園
		{ lat: 36.5060328, lng: 136.5470527 }, // 金沢
	]
};

