# walk30m

https://www.walk30m.com

## Development

### Requirements

- node 4.2.6
- AWS CLI 1.10+
	- uses configured profile named `walk30m`

### Environment Variables

| name | description |
|:---|:---|
| `GOOGLE_MAPS_API_KEY` | Published by the Google API Management Console to use Google Maps |
| `GA_TRACKING_ID` | Google analytics tracking ID |
| `IP_INFO_DB_KEY` | Published by IPInfoDB to use its API |
| `PUBLIC_API_URL_BASE` | An URL of the walk30m public API |
| `S3_PUBLIC_BUCKET_NAME` | The name of an S3 bucket to host app |
