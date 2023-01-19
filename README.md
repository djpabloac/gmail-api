
# Imap

## Getting Started

First, create file `credentials.json` in [Google Cloud](https://console.cloud.google.com/), follow the following [documentation](https://developers.google.com/gmail/api/quickstart/nodejs). Rename `credentials-example.json` to `credentials.json` and replace the values indicated in the previous documentation.

Documentation of [gmail-api](https://developers.google.com/gmail/api/reference/rest).

Then run the following command line:

```bash
# 1. Install package npm
yarn

# 2. Run service
yarn start:dev
```

## Environment Variables

To run this project, you will need to add the following environment variables to your `.env` file.

`EMAIL_USER=<email>`

`EMAIL_PASSWORD=<password>`

`ENABLED_PRINT_CONSOLE=false`

`ENABLED_UNREAD=false`

`BUCKET_DIR=<dir_upload>`

`AWS_ACCESS_KEY_ID=<access_key_id>`

`AWS_SECRET_ACCESS_KEY=<secret_access_key>`

`AWS_REGION=<region>`

Note: Environment variables for dev.

`ENABLED_MESSAGE_UNREAD=true`

`ENABLED_UPLOAD=true`

`PROFILE_ID`

## Authors

- [@dj.pablo.ac](https://gitlab.com/dj.pablo.ac)

## License

[MIT](https://choosealicense.com/licenses/mit/)