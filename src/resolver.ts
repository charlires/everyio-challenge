import { GraphQLError } from 'graphql';

import { Column, Task, TaskStatus, User, UserRole } from './schemas/schemas';
import ColumnService from './services/column';
import TaskService from './services/task';

export enum ErrorCode {
    INVALID_OPERATION = "INVALID_OPERATION",
}

export const errors = {
    titleExpected: new GraphQLError("title must be present"),
    descriptionExpected: new GraphQLError("description must be present"),
    taskIsArchived: new GraphQLError("task is archived"),
    invalidStatus: new GraphQLError("invalid status provided"),
    invalidOwner: new GraphQLError("user is not the owner"),
    adminOnly: new GraphQLError("admin only operation")
}

const isAdmin = (user: User): boolean => {
    if (!user) return false
    if (user.role === UserRole.ADMIN) return true
    return false
}

const isOwner = (user: User, task: Task): boolean => {
    if (!user) return false
    if (isAdmin(user)) return true
    if (user.id === task.owner) return true
    return false
}

export default class MainResolver {

    constructor(
        private taskService: TaskService,
        private columnService: ColumnService
    ) { }

    // (root, args, ctx)
    public addTask = async (root, args: {
        task: Task
    }, ctx): Promise<Task> => {

        if (!args.task.title) throw errors.titleExpected;
        if (!args.task.description) throw errors.descriptionExpected;
        return this.taskService.add({ owner: ctx.user.id, createdAt: new Date(), ...args.task })
    }

    public updateTask = async (root, args: {
        id: string
        task: Task
    }, ctx): Promise<Task> => {

        const task = await this.taskService.getById(args.id)
        if (!isOwner(ctx.user, task)) throw errors.invalidOwner
        return this.taskService.update(args.id, args.task)
    }

    public findAllTasks = async (root, args: {
        status?: TaskStatus
    }, ctx): Promise<Array<Task>> => {
        if (ctx.user.role === UserRole.ADMIN) {
            return this.taskService.findAll(args.status)
        } else {
            return this.taskService.findByOwner(ctx.user._id, args.status)
        }
    }

    public changeStatus = async (root, args: {
        id: string,
        status: TaskStatus
    }, ctx): Promise<Task> => {
        if (args.status == TaskStatus.ARCHIVED) throw errors.invalidStatus
        const task = await this.taskService.getById(args.id)

        if (!isOwner(ctx.user, task)) throw errors.invalidOwner
        if (task.status == TaskStatus.ARCHIVED) throw errors.taskIsArchived
        return this.taskService.changeStatus(args.id, args.status)
    }
    public archiveTask = async (root, args: {
        id: string,
    }, ctx): Promise<Task> => {

        const task = await this.taskService.getById(args.id)
        if (!isOwner(ctx.user, task)) throw errors.invalidOwner
        if (task.status == TaskStatus.ARCHIVED) throw errors.taskIsArchived
        return this.taskService.archive(args.id)
    }

    public moveToColumn = async (root, args: {
        id: string,
        columnId: string,
    }, ctx): Promise<boolean> => {

        const task = await this.taskService.getById(args.id)
        if (!isOwner(ctx.user, task)) throw errors.invalidOwner
        if (task.status == TaskStatus.ARCHIVED) throw errors.taskIsArchived
        const column = await this.taskService.moveToColumn(args.id, args.columnId)
        return !!column
    }

    public findAllColumns = async (root, args, ctx): Promise<Array<Column>> => {

        if (!ctx.user) throw errors.invalidOwner
        let columns = await this.columnService.findAll()
        if (isAdmin(ctx.user)) {
            return columns
        }
        return columns.map((column) => {
            column['tasks'] = column['tasks'].filter((task: Task) => isOwner(ctx.user, task))
            return column
        })
    }

    public addColumn = async (root, args: {
        column: Column
    }, ctx): Promise<Column> => {

        if (!isAdmin(ctx.user)) throw errors.adminOnly
        return this.columnService.add(args.column)
    }

    public updateColumn = async (root, args: {
        id: string,
        column: Column
    }, ctx): Promise<Column> => {

        if (!isAdmin(ctx.user)) throw errors.adminOnly
        return this.columnService.update(args.id, args.column)
    }

}