# walk30m

[![wercker status](https://app.wercker.com/status/a37daacd68f6c6707e8f77790e3cf9bc/s/master 'wercker status')](https://app.wercker.com/project/byKey/a37daacd68f6c6707e8f77790e3cf9bc)

https://www.walk30m.com

## Development

### Requirements

* node 4.2.6
* AWS CLI 1.10+ - uses configured profile named `walk30m`

### Environment Variables

| name                    | description                                                         |
| :---------------------- | :------------------------------------------------------------------ |
| `GOOGLE_MAPS_API_KEY`   | Published by the Google API Management Console to use Google Maps   |
| `GA_TRACKING_ID`        | Google analytics tracking ID                                        |
| `IP_INFO_DB_KEY`        | Published by IPInfoDB to use its API                                |
| `PUBLIC_API_URL_BASE`   | An URL of the walk30m public API                                    |
| `S3_PUBLIC_BUCKET_NAME` | The name of an S3 bucket to host app                                |
| `MESSAGE_TOPIC_ARN`     | Amazon SNS topic ARN to receive messages from a form on the website |
| `APP_URL`               | A URL to which we deploy the application                            |
| `WHAT3WORDS_API_KEY`    | what3words API key                                                  |
