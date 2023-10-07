import { PrismaClient, Task, TaskStatus } from '@prisma/client';

const prisma = new PrismaClient()

export default class TaskService {

    public async add(task: Task): Promise<Task> {
        // initial status is always TODO
        // colunm can be empty
        task.status = TaskStatus.TODO
        return prisma.task.create({ data: task })
    }

    public async update(id: string, task: { title: string, description: string }): Promise<Task> {
        return prisma.task.update({
            where: {
                id: id,
            },
            data: {
                title: task.title,
                description: task.description,
            }
        })
    }

    public async getById(id: string): Promise<Task> {
        return prisma.task.findFirst({
            where: {
                id: id
            }
        })
    }

    public async findByOwner(ownerId: string, status: TaskStatus): Promise<Array<Task>> {
        let where = { owner: ownerId, status: undefined }
        if (status) {
            where.status = status
        }
        return prisma.task.findMany({ where })
    }

    public async findByColunm(ownerId: string, columnId: string): Promise<Array<Task>> {
        let where = {
            NOT: {
                status: TaskStatus.ARCHIVED
            },
            columnId: columnId,
            owner: null
        }
        if (ownerId) {
            where.owner = ownerId
        }
        return prisma.task.findMany({ where })
    }

    public async findAll(status: TaskStatus): Promise<Array<Task>> {
        if (status) {
            return prisma.task.findMany({
                where: {
                    status: status
                }
            })
        }
        return prisma.task.findMany()
    }

    public async changeStatus(id: string, status: TaskStatus): Promise<Task> {
        return prisma.task.update({
            where: {
                id: id,
            },
            data: {
                status: status,
            },
        })
    }

    public async archive(id: string): Promise<Task> {
        return prisma.task.update({
            where: {
                id: id,
            },
            data: {
                status: TaskStatus.ARCHIVED,
                archivedAt: new Date(),
            },
        })
    }

    public async moveToColumn(id: string, columnId: string): Promise<Task> {
        return prisma.task.update({
            where: {
                id: id,
            },
            data: {
                columnId: columnId
            },
        })
    }
}