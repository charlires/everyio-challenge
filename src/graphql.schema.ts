export const typeDefs = `#graphql
enum TaskStatus {
    TODO
    INPROGRESS
    DONE
    ARCHIVED
}
type Task {
    id: String
    title: String
    description: String
    status: TaskStatus
    createdAt: String
    archivedAt: String 
    column: String
    owner: String
}

type Column {
    id: String
    name: String
    createdAt: String
    tasks: [Task]
}

type Query {
    # get tasks by status
    tasks(status: TaskStatus): [Task]
    # get columns
    columns: [Column]
}


input TaskInput {
    title: String
    description: String
}

input ColumnInput {
    name: String
}


type Mutation {
    addTask(task: TaskInput!): Task
    # update a task title and description
    updateTask(id: String!, task: TaskInput!): Task
    updateTaskStatus(id: String!, status: TaskStatus!): Task 
    archiveTask(id: String!): Task
    moveToColumn(id: String!, columnId: String!): Boolean

    addColumn(column: ColumnInput!): Column
    # update column name
    updateColumn(id: String!, column: ColumnInput!): Column
}
`;