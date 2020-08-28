import 'source-map-support/register'
import { cors } from 'middy/middlewares'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { deleteTodo } from '../../businessLogic/todos'
import { getToken } from '../../auth/utils'
import { createLogger } from '../../utils/logger'

const logger = createLogger('deleteTodo')

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoId = event.pathParameters.todoId
    const jwtToken = getToken(event.headers.Authorization)
    try {
      await deleteTodo(todoId, jwtToken)
      // TODO: Remove a TODO item by id
      return {
        statusCode: 200,
        body: ''
      }
    } catch (e) {
      logger.error('Error: ' + e.message)
      return {
        statusCode: 500,
        body: e.message
      }
    }
  }
)

handler.use(cors({ credentials: true }))
