'use strict'

const S3 = require('aws-sdk/clients/s3')
const fetchStats = require('./fetchers/github-stats-fetcher')
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

  await upload.promise().then((data, err) => {
    if (err) {
      return console.log(err)
    }

    return console.log(data)
  })
}

async function fetchGithubStats(username = 'Amabel') {
  const stats = await fetchStats(username)

  return stats
}
