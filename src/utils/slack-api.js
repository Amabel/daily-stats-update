const axios = require('axios')
const slackToken = process.env.SLACK_BOT_USER_OAUTH_TOKEN

const CHANNEL_ID = 'C03HETSHSEL'

const sendToSlack = (content) => {
  const url = 'https://slack.com/api/chat.postMessage'
  const headers = {
    'Content-Type': 'application/json; charset=UTF-8',
    Authorization: `Bearer ${slackToken}`,
  }

  return axios.post(
    url,
    {
      channel: CHANNEL_ID,
      ...content,
    },
    { headers },
  )
}

const sendGithubStatsToSlack = async (data) => {
  const {
    totalPRs,
    totalCommits,
    totalIssues,
    totalStars,
    contributedTo,
    rank: { level },
  } = data

  const date = new Date().toISOString().split('T')[0]

  const content = {
    username: 'GitHub Stats Report',
    icon_emoji: ':github-mark:',
    text: `GitHub Stats Report ${date}`,
    blocks: [
      {
        type: 'section',
        fields: [
          {
            type: 'mrkdwn',
            text: `*Total PRs:*\n${totalPRs}`,
          },
          {
            type: 'mrkdwn',
            text: `*Total Commits:*\n${totalCommits}`,
          },
        ],
      },
      {
        type: 'section',
        fields: [
          {
            type: 'mrkdwn',
            text: `*Total Issues:*\n${totalIssues}`,
          },
          {
            type: 'mrkdwn',
            text: `*Total Stars:*\n${totalStars}`,
          },
        ],
      },
      {
        type: 'section',
        fields: [
          {
            type: 'mrkdwn',
            text: `*Contributed To:*\n${contributedTo}`,
          },
          {
            type: 'mrkdwn',
            text: `*Rank:*\n${level}`,
          },
        ],
      },
    ],
  }

  const res = await sendToSlack(content)
  console.log(res.data)

  return
}

const sendWakatimeStatsToSlack = async (text) => {
  const content = {
    username: 'Wakatime Stats Report',
    icon_emoji: ':wakatime-mark:',
    text,
  }

  const res = await sendToSlack(content)
  console.log(res.data)

  return
}

module.exports = {
  sendGithubStatsToSlack,
  sendWakatimeStatsToSlack,
}
