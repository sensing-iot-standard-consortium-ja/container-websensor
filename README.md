# motion-recorder

## prepare

1. ngrok account
go to https://ngrok.com/
create account
get token

2. provisioning sensor
curl -i -X POST \
   -H "X-Auth-Token: {access token}" \
   -H "fiware-service: servicename" \
   -H "fiware-servicepath:/" \
   -H "Content-Type:application/json" \
   -d \
'{
    "devices": [
        {
            "device_id": "motion00",
            "entity_name": "urn:ngsi-ld:Value:001",
            "entity_type": "Motion",
            "timezone": "Asia/Tokyo",
            "attributes": [
                {
                    "name": "DateTime",
                    "type": "DateTime"
                },
                {
                    "name": "x",
                    "type": "Double"
                },
                {
                    "name": "y",
                    "type": "Double"
                },
                {
                    "name": "z",
                    "type": "Double"
                },
                {
                    "name": "alpha",
                    "type": "Double"
                },
                {
                    "name": "beta",
                    "type": "Double"
                },
                {
                    "name": "gamma",
                    "type": "Double"
                }
            ],
            "static_attributes": []
        }
    ]
}' \
 'https://api.data.iotbase.in/idm/oauth2/token'

## Build Setup

```bash
# install dependencies
$ yarn install

# serve with hot reload at localhost:3000
$ yarn dev

# serve with hot reload from internet

$ cat > .env
NGROK_AUTHTOKEN='{ngrok_auth_token here}'
NUXT_ENV_ORION_ENDPOINT='https://839f-124-36-47-90.ngrok.io/container/parse'
NUXT_ENV_ORION_USERNAME='username'
NUXT_ENV_ORION_PASSWORD='password'
NUXT_ENV_ORION_OAUTH2_TOKEN='{uuidlike token}'

$ yarn dev


# build for production and launch server
$ yarn build
$ yarn start

# generate static project
$ yarn generate
```

## customize
check pages/index.vue
post_single_data method post data to FiWare
