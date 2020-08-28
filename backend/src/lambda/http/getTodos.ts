import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { cors } from 'middy/middlewares'
import * as middy from 'middy'
import { getAllTodos } from '../../businessLogic/todos'
import { getToken } from '../../auth/utils'
import { createLogger } from '../../utils/logger'

const logger = createLogger('getAllTodos')
export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    // TODO: Get all TODO items for a current user
    try {
      const jwtToken = getToken(event.headers.Authorization)
      const result = await getAllTodos(jwtToken)
      return {
        statusCode: 200,
        body: JSON.stringify({ items: result })
      }
    } catch (error) {
      logger.error('Error: ' + error.message)
      return { statusCode: 500, body: error.message }
    }
  }
)

handler.use(cors({ credentials: true }))
