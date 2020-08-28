import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'

import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { updateTodoItem } from '../../businessLogic/todos'
import { getToken } from '../../auth/utils'
import { createLogger } from '../../utils/logger'

const logger = createLogger('updateTodo')

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const todoId = event.pathParameters.todoId
  const updatedTodo: UpdateTodoRequest = JSON.parse(event.body)

  // TODO: Update a TODO item with the provided id using values in the "updatedTodo" object
  try {
    const jwtToken = getToken(event.headers.Authorization)
    const updatedItem = await updateTodoItem(updatedTodo, todoId, jwtToken)
    return {
      statusCode:200,
      body:JSON.stringify({updatedItem})
    }
  } catch (error) {
    logger.error('Error: ', + error.message)
    return {
      statusCode:500,
      body:error.message
    }
  }
  
})

handler.use(cors({credentials:true}))
