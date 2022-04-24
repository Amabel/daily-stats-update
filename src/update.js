'use strict'

const axios = require('axios')
const S3 = require('aws-sdk/clients/s3')
const S3_BUCKET = process.env.S3_BUCKET_NAME
const WAKATIME_API_KEY = process.env.WAKATIME_API_KEY

module.exports.handler = async (event) => {
  const data = await fetchWakatimeStats()

  const upload = new S3.ManagedUpload({
    params: {
      Bucket: S3_BUCKET,
      Key: 'stats.txt',
      Body: JSON.stringify(data),
    },
  })

  await upload.promise().then((data, err) => {
    if (err) {
      return console.log(err)
    }

    return console.log(data)
  })
}

async function fetchWakatimeStats() {
  const { data } = await axios.get(
    `https://wakatime.com/api/v1/users/Amabel/stats/last_year?is_including_today=true&api_key=${WAKATIME_API_KEY}`,
  )

  return data.data
}
