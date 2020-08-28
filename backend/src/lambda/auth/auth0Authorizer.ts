import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'

import { verify, decode } from 'jsonwebtoken'
import { createLogger } from '../../utils/logger'
import Axios from 'axios'
import { Jwt } from '../../auth/Jwt'
import { JwtPayload } from '../../auth/JwtPayload'

const logger = createLogger('auth')

// TODO: Provide a URL that can be used to download a certificate that can be used
// to verify JWT token signature.
// To get this URL you need to go to an Auth0 page -> Show Advanced Settings -> Endpoints -> JSON Web Key Set
const jwksUrl = process.env.JWKS_URL


export const handler = async (
  event: CustomAuthorizerEvent
): Promise<CustomAuthorizerResult> => {
  logger.info(`Authorizing a user => ${event.authorizationToken}`)
  logger.info(`JWKS url => ${jwksUrl}`)
  try {
    const jwtToken = await verifyToken(event.authorizationToken)
    logger.info('User was authorized', jwtToken)

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    logger.error('Authorized failure', { error: e.message })

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}

async function verifyToken(authHeader: string): Promise<JwtPayload> {
  const token = getToken(authHeader)
  logger.info('token => ' + token)
  const jwt: Jwt = decode(token, { complete: true }) as Jwt

  // TODO: Implement token verification
  // You should implement it similarly to how it was implemented for the exercise for the lesson 5
  // You can read more about how to do this here: https://auth0.com/blog/navigating-rs256-and-jwks/
  const response = await Axios.get(jwksUrl)
  const certificate_key_id = response.data.keys[0].x5c[0]
  const certificate = certToPEM(certificate_key_id)

  logger.info(certificate)
  const result = verify(token, certificate, {
    algorithms: [jwt.header.alg]
  }) as JwtPayload
  logger.info('JWTPayload => ' + result)
  return result
}

function getToken(authHeader: string): string {
  if (!authHeader) throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return token
}

// async function verifyToken1(authHeader: string): Promise<JwtPayload> {
//   logger.info('verifying token, authHeader:' + authHeader)
//   const token = getToken(authHeader)
//   logger.info('token => ' + token)
//   const jwt: Jwt = decode(token, { complete: true }) as Jwt

//   // TODO: Implement token verification
//   // You should implement it similarly to how it was implemented for the exercise for the lesson 5
//   // You can read more about how to do this here: https://auth0.com/blog/navigating-rs256-and-jwks/
//   const response = await Axios.get(jwksUrl)
//   const certificate_key_id = response.data.keys[0].x5c[0]
//   const { kid, nbf } = response.data.keys
//   const publicKey = certToPEM(certificate_key_id)
//   logger.info('unique key >>>>>' + {kid, nbf})
//   logger.info(certificate_key_id)
//   const certificate = `-----BEGIN CERTIFICATE-----\n${certificate_key_id}\n-----END CERTIFICATE-----`

//   return new Promise((resolve,reject)=> {
//     logger.info('inside promise')
//     verify(token, certificate, {
//       algorithms: [jwt.header.alg]
//     }, function (err, decoded: JwtPayload) {
//       if(err) {
//         logger.info('Error: >>>>>>>' + err)
//         return reject(err)
//       } else {
//         logger.info('Decoded: ', + decoded)
//         return resolve(decoded);
//       }
//     });
//   })
  
// }

function certToPEM(cert) {
  cert = cert.match(/.{1,64}/g).join('\n');
  cert = `-----BEGIN CERTIFICATE-----\n${cert}\n-----END CERTIFICATE-----\n`;
  return cert;
}