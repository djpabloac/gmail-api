/* eslint-disable no-console */

import imaps, { ImapSimpleOptions } from 'imap-simple'

const config: ImapSimpleOptions = {
  imap: {
    authTimeout: 3000,
    host       : 'imap.zoho.com',
    password   : process.env.EMAIL_PASSWORD || '',
    port       : 993,
    tls        : true,
    tlsOptions : {
      rejectUnauthorized: false
    },
    user: process.env.EMAIL_USER || ''
  }
}

imaps.connect(config).then(function (connection) {

  return connection.openBox('INBOX').then(function () {
    const searchCriteria = [
      'UNSEEN'
    ]

    const fetchOptions = {
      bodies  : ['HEADER', 'TEXT'],
      markSeen: false
    }

    return connection.search(searchCriteria, fetchOptions).then(function (results) {
      const subjects = results.map(function (res) {
        return res.parts.filter(function (part) {
          return part.which === 'HEADER'
        })[0].body.subject[0]
      })

      console.log(subjects)
    })
  })
})
