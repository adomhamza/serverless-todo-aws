import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk-core'
import { TodoItem } from '../models/TodoItem'
import { createLogger } from '../utils/logger'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'

const logger = createLogger('todoAccess')
const XAWS = AWSXRay.captureAWS(AWS)

export class TodoAccess {
  constructor(
    private readonly docClient: DocumentClient = new XAWS.DynamoDB.DocumentClient(),
    private readonly todosTable = process.env.TODOS_TABLE,
    private readonly userIdIndex = process.env.USER_ID_INDEX,
    private readonly s3 = new XAWS.S3({ signatureVersion: 'v4' }),
    private readonly urlExpiration = process.env.SIGNED_URL_EXPIRATION,
    private readonly bucketName = process.env.TODOS_S3_BUCKET
  ) {}

  async getUserTodos(userId: string): Promise<TodoItem[]> {
    const result = await this.docClient
      .query({
        TableName: this.todosTable,
        IndexName: this.userIdIndex,
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
          ':userId':userId
        }
      })
      .promise()
    return result.Items as TodoItem[]
  }

  /**
   *
   * @param todo
   */
  async createTodo(todo: TodoItem): Promise<TodoItem> {
    const item = {
      ...todo
      // attachmentUrl: `https://${this.bucketName}.s3.amazonaws.com/${todo.todoId}`
    }
    logger.info('todo: >>' + JSON.stringify(item))
    const result = await this.docClient
      .put({
        TableName: this.todosTable,
        Item: todo
      })
      .promise()

    logger.info(`created todo: ${todo} and result: ${result}`)
    return todo
  }

  /**
   *
   * @param todo
   */
  async updateTodo(todo: TodoItem): Promise<TodoItem> {
    logger.info('inside updateTodo() function')
    const updateExpression =
      'SET name = :todoName, dueDate = :todoDueDate, done = :todoDone'
    const result = await this.docClient
      .update({
        TableName: this.todosTable,
        Key: { todoId: todo.todoId, userId: todo.userId },
        UpdateExpression: updateExpression,
        ExpressionAttributeValues: {
          ':todoName': todo.name,
          ':todoDueDate': todo.dueDate,
          ':todoDone': todo.done,
          ':todoId': todo.todoId
        },
        ReturnValues: 'UPDATED_NEW'
      })
      .promise()
      logger.info('result from update: ' + JSON.stringify(result))
    return todo
  }

  /**
   *
   * @param todoId
   */
  async deleteTodo(todoId: string, userId: string): Promise<string> {
    logger.info('delete item with id: ' + todoId)
    await this.docClient
      .delete({
        TableName: this.todosTable,
        Key: {
          userId,
          todoId
        },
        ConditionExpression: 'todoId = :todoId',
        ExpressionAttributeValues: {
          ':todoId': todoId
        }
      })
      .promise()

    return userId
  }

  /**
   * @param userId
   * @return TodoItem[]
   */
  async getAllTodos(userId: string): Promise<TodoItem[]> {
    logger.info('in getAllTodos() function')
    const result = await this.docClient
      .query({
        TableName: this.todosTable,
        IndexName: this.userIdIndex,
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
          ':userId': userId
        },
        ScanIndexForward: false
      })
      .promise()
    return result.Items as TodoItem[]
  }

  async generateUploadUrl(todoId: string): Promise<string> {
    logger.info('in generateUploadUrl() function')
    const result = this.s3.getSignedUrl('putObject', {
      Bucket: this.bucketName,
      Key: todoId,
      Expires: parseInt(this.urlExpiration, 10) 
    })
    logger.info('upload: ' + result)
    return result
  }
}
