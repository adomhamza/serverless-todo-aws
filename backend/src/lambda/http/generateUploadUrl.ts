import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { createLogger } from '../../utils/logger'
import * as middy from 'middy'

import { generateUploadUrl } from '../../businessLogic/todos'
import { cors } from 'middy/middlewares'

const logger = createLogger('generateUploadUrl')

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
      const todoId = event.pathParameters.todoId
      const uploadUrl = await generateUploadUrl(todoId)

      // TODO: Return a presigned URL to upload a file for a TODO item with the provided id
      return {
        statusCode: 200,
        body: JSON.stringify({ uploadUrl })
      }
    } catch (e) {
      logger.error(`Error: ${e.message}`)
      return {
        statusCode: 500,
        body: e.message
      }
    }
  }
)

handler.use(cors({ credentials: true }))
