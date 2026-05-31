import crypto from 'crypto'

export function buildSolisHeaders(
  path: string,
  body: object,
  apiId: string,
  apiSecret: string
): Record<string, string> {
  const bodyJson = JSON.stringify(body)

  const contentMd5 = crypto
    .createHash('md5')
    .update(bodyJson)
    .digest('base64')

  const date = new Date().toUTCString()

  const contentType = 'application/json;charset=UTF-8'

  const signingString = ['POST', contentMd5, contentType, date, path].join('\n')

  const signature = crypto
    .createHmac('sha1', apiSecret)
    .update(signingString)
    .digest('base64')

  return {
    'Content-Type': contentType,
    'Content-MD5': contentMd5,
    'Date': date,
    'Authorization': `API ${apiId}:${signature}`,
  }
}
