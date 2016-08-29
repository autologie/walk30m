window.messages = {
  "resultOverviewBalloonTpl": [
    '<h4>',
      '<div style="background-color: {{bgColor}}; border-color: {{borderColor}}; " class="result-identifier-color"></div>',
      '<span>Area within {{timeExpr}} minutes from {{originAddress}}</span>',
    '</h4>',
    '<div>',
      '<a role="show-routes" >Show routes</a>',
      '<a role="erase-result">Clear this result</a>',
      '<a role="tweet-result">Tweet this result</a>',
      '<a role="report-problem">Report problems on this result</a>',
    '</div>'
  ].join(''),
  "resultSummaryBalloonTpl": [
    '<h4>',
      '<div style="background-color: {{bgColor}}; border-color: {{borderColor}}; " class="result-identifier-color"></div>',
      '<span>Area within {{timeExpr}} minutes from {{originAddress}}</span>',
    '</h4>',
    '<div>',
      '<a role="erase-result">Clear this result</a>',
    '</div>'
  ].join(''),
  "routeDetailBalloonTpl": [
    '<a role="back-to-summary">&lt;&lt; Back to Summary</a>',
    '<h4>{{summary}}</h4>',
    '<p>It takes {{time}} to reach to {{dest}}.</p>',
    '<a href="{{url}}" target="_blank">',
    "Show this route on the Google Maps",
    '</a>',
    '<hr>',
    '<p>{{copyright}}</p>'
  ].join(''),
  "summaryTpl": "The area within {{timeExpr}} minutes {{travelModeExpr}} from {{originAddress}}",
  "tweetMessageTpl": "The area within {{timeExpr}} minutes {{travelModeExpr}} from {{originAddress}}:",
  "contact": "Please input the message body.",
  "thanks": "Thank you for your cooperation!",
  "geocoderResultNotFound": "Location is not found. Try more general keywords.",
  "originLocationIsRequired": "Input the origination location.",
  "searching": "Computing the area within {{min}} minutes {{travelModeExpr}} from {{address}}...",
  "askIfAbort": "Are you sure to abort the computation?",
  "travelModes": {
    "WALKING": 'by walk',
    "DRIVING": 'by car',
    "TRANSIT": 'by transits',
    "BISYCLING": 'by bicycle'
  },
  "completed": "Completed.",
  "dragMapToSpecifyLocation": "Specify the location by dragging the map.",
  "geolocationForbidden": "Please allow this application to use location information.",
  "geolocationUnavailable": "The current location is not available.",
  "geolocationFailure": "The current location could not be detected.",
  "geolocationError": "An unknown error occured in the GeoLocation API.",
  "geolocationDetecting": "Detecting the current location...",
  "reportMessageTpl": [
    "I am reporting a problem about the following result:",
    "{{summary}}",
    "------",
    "(Please describe the problem you found below.)",
    ""
  ].join('\r\n'),
  "askIfReload": "It seems that the compution is taking long time. This problem may be resolved by reloading the web page. Would you like to reload now?",
  "failedToSendMEssage": "Oops! Something bad happend and your message is not sent.",
  "brokenResult": "Oops! The result you requested seems to be broken!",
  "pleaseSpeak": "Please speak...",
  "cannotRecognizeSpeech": "Sorry, could not recognize.",
  "pleaseCheckConditions": "An error occured during the calculation. If this happens repeatedly, please check the condition you input. Chances are that there is no route around the specified location."
};

