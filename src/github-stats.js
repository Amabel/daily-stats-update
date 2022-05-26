'use strict'

const S3 = require('aws-sdk/clients/s3')
const fetchStats = require('./fetchers/github-stats-fetcher')
const slackApi = require('./utils/slack-api')
const S3_BUCKET = process.env.S3_BUCKET_NAME

module.exports.handler = async (event) => {
  const data = await fetchGithubStats()

  const upload = new S3.ManagedUpload({
    params: {
      Bucket: S3_BUCKET,
      Key: 'github-stats.txt',
      Body: JSON.stringify(data),
    },
  })

  await upload.promise().then((res, err) => {
    if (err) {
      return console.log(err)
    }

    slackApi.sendGithubStatsToSlack(data)
    return console.log(res)
  })
}

async function fetchGithubStats(username = 'Amabel') {
  const stats = await fetchStats(username)

  return stats
}
