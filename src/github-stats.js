'use strict'

const S3 = require('aws-sdk/clients/s3')
const fetchStats = require('./fetchers/github-stats-fetcher')
const slackApi = require('./utils/slack-api')
const S3_BUCKET = process.env.S3_BUCKET_NAME

module.exports.handler = async (event) => {
  const data = await fetchGithubStats()

  await uploadToS3(data)
  await slackApi.sendGithubStatsToSlack(data)

  return
}

async function fetchGithubStats(username = 'Amabel') {
  const stats = await fetchStats(username)

  return stats
}

async function uploadToS3(data) {
  const upload = new S3.ManagedUpload({
    params: {
      Bucket: S3_BUCKET,
      Key: 'github-stats.txt',
      Body: JSON.stringify(data),
    },
  })

  await upload.promise().then(async (res, err) => {
    if (err) {
      return console.log(err)
    }
    return console.log(res)
  })
}
