import { parseUserId } from '../auth/utils'
import { TodoAccess } from '../dataLayer/todoAccess'
import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { createLogger } from '../utils/logger'
import { v4 } from 'uuid'

const logger = createLogger('todos')

const todoAccess = new TodoAccess()
const bucketName = process.env.TODOS_S3_BUCKET

export const createTodo = async (
  createTodoRequest: CreateTodoRequest,
  jwtToken: string
): Promise<TodoItem> => {
  logger.info('in createTodo() function')
  const userId = parseUserId(jwtToken)
  const newId = v4()
  const todoItem: TodoItem = {
    todoId: newId,
    userId,
    attachmentUrl: `https://${bucketName}.s3.amazonaws.com/${newId}`,
    done: false,
    createdAt: new Date().toISOString(),
    ...createTodoRequest
  }
  const result = JSON.stringify(todoItem)
  logger.info('create >>' + result)
  return await todoAccess.createTodo(todoItem)
}

export const updateTodoItem = async (
  updateTodoRequest: UpdateTodoRequest,
  todoId: string,
  jwtToken: string
): Promise<TodoItem> => {
  logger.info('in updateTodo() function')
  const userId = parseUserId(jwtToken)
  logger.info(`userId ${userId}`)

  return await todoAccess.updateTodo({
    todoId,
    userId,
    name: updateTodoRequest.name,
    dueDate: updateTodoRequest.dueDate,
    done: updateTodoRequest.done,
    createdAt: new Date().toISOString()
  })
}

export const deleteTodo = async (
  todoId: string,
  jwtToken: string
): Promise<string> => {
  logger.info('in deleteTodo() function')
  const userId = parseUserId(jwtToken)
  logger.info('Delete todo with id: ' + JSON.stringify(todoId))
  return await todoAccess.deleteTodo(todoId, userId)
}

export const generateUploadUrl = async (todoId: string): Promise<string> => {
  logger.info('in generateUploadUrl() function')
  return await todoAccess.generateUploadUrl(todoId)
}

export const getAllTodos = async (jwtToken: string): Promise<TodoItem[]> => {
  logger.info('in getAllTodos() function')
  const userId = parseUserId(jwtToken)
  logger.info('Getting all todo items for user: ', +userId)
  return await todoAccess.getUserTodos(userId)
}
