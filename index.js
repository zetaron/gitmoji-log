#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

const getUserHome = () => {
  return process.env[(process.platform === 'win32') ? 'USERPROFILE' : 'HOME']
}

const readEmojis = () => new Promise((resolve, reject) => {
  const configPath = path.join(getUserHome(), '.gitmoji', 'gitmojis.json')

  fs.readFile(configPath, { encoding: 'utf8' }, (error, content) => {
    if (error) {
      reject(error)
      return
    }

    const json = JSON.parse(content)
    const emojis = new Map()

    json.forEach((item) => {
      emojis.set(item.code, item.emoji)
    })

    resolve(emojis)
  })
})

const readStdin = () => new Promise((resolve, reject) => {
  const stdin = process.stdin
  let result = ''

  if (stdin.isTTY) {
    resolve(result)
    return
  }

  stdin.setEncoding('utf8')
  stdin.on('readable', () => {
    let chunk
    while ((chunk = stdin.read())) {
      result += chunk
    }
  })
  stdin.on('end', () => {
    resolve(result)
  })
})

const emojify = (emojis, input) => {
  return input.replace(/:[a-zA-Z0-9_]+:/ig, (match) => {
    if (emojis.has(match)) {
      return `${emojis.get(match)} `
    }

    return match
  })
}

const log = (data) => {
  console.log(data)

  return data
}

Promise.all([readEmojis(), readStdin()])
  .then((results) => {
    const emojis = results[0]
    const stdin = results[1]

    return emojify(emojis, stdin)
  })
  .then(log)
