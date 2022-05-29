'use strict'

const axios = require('axios')
const S3 = require('aws-sdk/clients/s3')
const slackApi = require('./utils/slack-api')
const S3_BUCKET = process.env.S3_BUCKET_NAME
const WAKATIME_API_KEY = process.env.WAKATIME_API_KEY

module.exports.handler = async (event) => {
  let data = await fetchWakatimeStats()

  if (!data.total_seconds_including_other_language) {
    await slackApi.sendWakatimeStatsToSlack(
      'Failed to fetch wakatime stats, retrying...',
    )
    data = await fetchWakatimeStats()
  }

  if (data.total_seconds_including_other_language) {
    await uploadToS3(data)
    const totalSeconds = data.total_seconds_including_other_language
    const hrs = (totalSeconds / 3600).toFixed(2)
    await slackApi.sendWakatimeStatsToSlack(
      `Wakatime stats updated, total seconds: ${data.total_seconds_including_other_language} （${hrs} hours）`,
    )
  } else {
    await slackApi.sendWakatimeStatsToSlack(
      'Failed to fetch wakatime stats after retrying, stop fetching',
    )
  }

  return
}

async function fetchWakatimeStats() {
  const { data } = await axios.get(
    `https://wakatime.com/api/v1/users/Amabel/stats/last_year?is_including_today=true&api_key=${WAKATIME_API_KEY}`,
  )

  console.log(data.data)
  return data.data
}

async function uploadToS3(data) {
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
