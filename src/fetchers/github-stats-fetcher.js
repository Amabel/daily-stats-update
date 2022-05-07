const axios = require('axios')
const calculateRank = require('../utils/calculateRank')
const token = process.env.GITHUB_ACCESS_TOKEN

const request = (data, headers) => {
  return axios({
    url: 'https://api.github.com/graphql',
    method: 'post',
    headers,
    data,
  })
}

const fetcher = (variables) => {
  return request(
    {
      query: `
      query userInfo($login: String!) {
        user(login: $login) {
          name
          login
          contributionsCollection {
            totalCommitContributions
            restrictedContributionsCount
          }
          repositoriesContributedTo(first: 1, contributionTypes: [COMMIT, ISSUE, PULL_REQUEST, REPOSITORY]) {
            totalCount
          }
          pullRequests(first: 1) {
            totalCount
          }
          issues(first: 1) {
            totalCount
          }
          followers {
            totalCount
          }
          repositories(first: 100, ownerAffiliations: OWNER, orderBy: {direction: DESC, field: STARGAZERS}) {
            totalCount
            nodes {
              stargazers {
                totalCount
              }
            }
          }
        }
      }
      `,
      variables,
    },
    {
      Authorization: `bearer ${token}`,
    },
  )
}

// https://github.com/anuraghazra/github-readme-stats/issues/92#issuecomment-661026467
// https://github.com/anuraghazra/github-readme-stats/pull/211/
const totalCommitsFetcher = async (username) => {
  const res = await axios({
    method: 'get',
    url: `https://api.github.com/search/commits?q=author:${username}`,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/vnd.github.cloak-preview',
      Authorization: `bearer ${token}`,
    },
  })

  return res.data.total_count
}

async function fetchStats(
  username,
  count_private = true,
  include_all_commits = true,
) {
  if (!username) throw Error('Invalid username')

  const stats = {
    name: '',
    totalPRs: 0,
    totalCommits: 0,
    totalIssues: 0,
    totalStars: 0,
    contributedTo: 0,
    rank: { level: 'C', score: 0 },
  }

  let res = await fetcher({ login: username })

  const user = res.data.data.user

  stats.name = user.name || user.login
  stats.totalIssues = user.issues.totalCount

  // normal commits
  stats.totalCommits = user.contributionsCollection.totalCommitContributions

  // if include_all_commits then just get that,
  // since totalCommitsFetcher already sends totalCommits no need to +=
  if (include_all_commits) {
    stats.totalCommits = await totalCommitsFetcher(username)
  }

  // if count_private then add private commits to totalCommits so far.
  if (count_private) {
    stats.totalCommits +=
      user.contributionsCollection.restrictedContributionsCount
  }

  stats.totalPRs = user.pullRequests.totalCount
  stats.contributedTo = user.repositoriesContributedTo.totalCount

  stats.totalStars = user.repositories.nodes.reduce((prev, curr) => {
    return prev + curr.stargazers.totalCount
  }, 0)

  stats.rank = calculateRank({
    totalCommits: stats.totalCommits,
    totalRepos: user.repositories.totalCount,
    followers: user.followers.totalCount,
    contributions: stats.contributedTo,
    stargazers: stats.totalStars,
    prs: stats.totalPRs,
    issues: stats.totalIssues,
  })
  console.log(stats)

  return stats
}

module.exports = fetchStats
