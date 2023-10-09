import mongoose, { Model, Schema, Types } from "mongoose"

export enum TaskStatus {
    TODO = 'TODO',
    INPROGRESS = 'INPROGRESS',
    DONE = 'DONE',
    ARCHIVED = 'ARCHIVED',
}

export enum UserRole {
    MEMBER = 'MEMBER',
    ADMIN = 'ADMIN',
}

export interface Task {
    id: string
    title: string
    description: string
    status: TaskStatus
    createdAt: Date
    archivedAt: Date
    // columnId?: String
    column?: Types.ObjectId | Column
    owner: string
}

const TaskSchema = new Schema<Task>({
    title: { type: String, required: true },
    description: { type: String, required: true },
    status: { type: String, required: true },
    owner: { type: String, required: true },
    createdAt: Date,
    column: {
        type: Types.ObjectId,
        ref: 'Column'
    },
})
export const TaskModel = mongoose.model('Task', TaskSchema)

export interface Column {
    id: string
    name: string
    createdAt: Date
    tasks?: Array<Types.ObjectId | Task>
}

const ColumnSchema = new Schema<Column>({
    name: { type: String, required: true }, // posible unique
    createdAt: Date,
    tasks: [{
        type: Types.ObjectId,
        ref: 'Task'
    }]
})

export const ColumnModel = mongoose.model('Column', ColumnSchema)

export interface User {
    id: string
    email: string
    role: UserRole
}

const UserSchema = new Schema<User>({
    email: { type: String, required: true, unique: true },
    role: { type: String, required: true },
})

export const UserModel: Model<User> = mongoose.model('User', UserSchema)

