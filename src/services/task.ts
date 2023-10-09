import { Column, ColumnModel, Task, TaskModel, TaskStatus } from '../schemas';

export default class TaskService {

    public async add(task: Task): Promise<Task> {
        // initial status is always TODO
        // colunm can be empty
        task.status = TaskStatus.TODO
        return new TaskModel(task).save()
    }

    public async update(id: string, task: { title: string, description: string }): Promise<Task> {
        const res = await TaskModel.updateOne({
            '_id': id
        }, {
            title: task.title,
            description: task.description
        })
        if (res.modifiedCount === 1) {
            return TaskModel.findById(id)
        }
    }

    public async getById(id: string): Promise<Task> {
        return TaskModel.findById(id)
    }

    public async findByOwner(ownerId: string, status: TaskStatus): Promise<Array<Task>> {
        let query = TaskModel.find()
        query = query.where('owner').equals(ownerId)
        if (status) {
            query = query.where('status').equals(status)
        }
        return query.exec()
    }

    public async findAll(status: TaskStatus): Promise<Array<Task>> {
        let query = TaskModel.find()
        if (status) {
            query = query.where('status').equals(status)
        }
        return query.exec()
    }

    public async changeStatus(id: string, status: TaskStatus): Promise<Task> {
        const res = await TaskModel.updateOne({
            '_id': id
        }, {
            'status': status
        })
        if (res.modifiedCount === 1) {
            return TaskModel.findById(id)
        }
    }

    public async archive(id: string): Promise<Task> {
        const res = await TaskModel.updateOne({
            '_id': id
        }, {
            'status': TaskStatus.ARCHIVED,
            'archivedAt': new Date()
        })
        if (res.modifiedCount === 1) {
            return TaskModel.findById(id)
        }
    }

    public async moveToColumn(id: string, columnId: string): Promise<Column> {
        const task = await TaskModel.findById(id)
        const res = await ColumnModel.
            updateOne({ _id: columnId }, { '$addToSet': { tasks: task._id } })
        if (res.matchedCount === 1) {
            return ColumnModel.findById(columnId)
        }
    }
}