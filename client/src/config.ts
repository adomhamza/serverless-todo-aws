// TODO: Once your application is deployed, copy an API id here so that the frontend could interact with it
const apiId = 'u8hc4r94p1'
export const apiEndpoint = `https://${apiId}.execute-api.us-east-1.amazonaws.com/dev`

export const authConfig = {
  // TODO: Create an Auth0 application and copy values from it into this map
  domain: 'cellmanager12.auth0.com',            // Auth0 domain
  clientId: 'P34SKhIOS83y2q4vnT9EBcUAF2MDj98u',          // Auth0 client id
  callbackUrl: 'http://localhost:3000/callback'
}
