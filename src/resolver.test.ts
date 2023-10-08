import { afterEach, beforeEach, expect, it, jest } from '@jest/globals';

import MainResolver, { errors } from './resolver';
import { Column, Task, TaskStatus, User, UserRole } from './schemas/schemas';
import ColumnService from './services/column';
import TaskService from './services/task';
jest.mock("./services/column")
jest.mock("./services/task")

// import { Column, Task, TaskStatus, User, UserRole } from '@prisma/client';

const mockedDate = new Date("2023-10-05T22:46:17Z")

let taskService: TaskService
let columnService: ColumnService
let taskResolver: MainResolver
const member1: User = {
    id: 'member1',
    email: 'member1@every.io',
    role: UserRole.MEMBER
}
const member2: User = {
    id: 'member2',
    email: 'member2@every.io',
    role: UserRole.MEMBER
}
const admin: User = {
    id: 'admin1',
    email: 'admin@every.io',
    role: UserRole.ADMIN
}
const baseTask: Task = {
    id: '',
    title: '',
    description: '',
    createdAt: null,
    archivedAt: null,
    status: TaskStatus.TODO,
    // columnId: null,
    owner: member1.id
}

const baseColumn: Column = {
    id: '',
    name: '',
    createdAt: mockedDate
}

beforeEach(() => {
    taskService = new TaskService()
    columnService = new ColumnService()
    taskResolver = new MainResolver(taskService, columnService)
})

afterEach(() => {
    jest.clearAllMocks()
});

it('add task success', () => {
    const inputTask = {
        ...baseTask,
        title: 'test title',
        description: 'test description'
    }

    const responseTask = {
        ...baseTask,
        title: 'test title',
        description: 'test description',
        createdAt: mockedDate,
        status: TaskStatus.TODO
    }

    jest.spyOn(taskService, 'add')
        .mockResolvedValueOnce(responseTask)

    return taskResolver.addTask(null, { task: inputTask }, { user: member1 })
        .then(data => {
            expect(taskService.add).toBeCalled();
            expect(data).toBe(responseTask)
            expect(data.status).toBe(TaskStatus.TODO)
            jest.mock
        })
})

it('add task empty title error', () => {
    return taskResolver.addTask(null, { task: { ...baseTask } }, null).catch(error => {
        expect(taskService.add).not.toBeCalled();
        expect(error).toEqual(errors.titleExpected)
    })
})

it('add task empty description error', () => {
    const inputTask = {
        ...baseTask,
        title: 'test title'
    }
    return taskResolver.addTask(null, { task: inputTask }, null).catch(error => {
        expect(taskService.add).not.toBeCalled();
        expect(error).toEqual(errors.descriptionExpected)
    })
})

it('find all tasks by owner', () => {

    const responseTask = {
        ...baseTask,
        title: 'test title',
        description: 'test description',
        createdAt: mockedDate,
        status: TaskStatus.TODO
    }

    jest.spyOn(taskService, 'findByOwner')
        .mockResolvedValueOnce([responseTask, responseTask])

    return taskResolver.findAllTasks(null, {}, { user: member1 })
        .then(data => {
            expect(taskService.findByOwner).toBeCalled();
            expect(data.length).toBe(2)
            expect(data).toEqual([responseTask, responseTask])
        })
})

it('find all tasks as admin', () => {

    const responseTask = {
        ...baseTask,
        title: 'test title',
        description: 'test description',
        createdAt: mockedDate,
        status: TaskStatus.TODO
    }

    jest.spyOn(taskService, 'findAll')
        .mockImplementationOnce(async () => [responseTask, responseTask])

    return taskResolver.findAllTasks(null, {}, { user: admin })
        .then(data => {
            expect(taskService.findAll).toBeCalled();
            expect(data.length).toBe(2)
            expect(data).toEqual([responseTask, responseTask])
        })
})

it('find all tasks no filter', () => {
    jest.spyOn(taskService, 'findByOwner')
        .mockImplementationOnce(async () => [])

    return taskResolver.findAllTasks(null, {}, { user: member1 })
        .then(data => {
            expect(taskService.findByOwner).toBeCalled();
            expect(data).toEqual([])
        })
})

it('find all tasks with filter', () => {
    jest.spyOn(taskService, 'findByOwner')
        .mockImplementationOnce(async () => [])

    return taskResolver.findAllTasks(null, { status: TaskStatus.TODO }, { user: member1 })
        .then(data => {
            expect(taskService.findByOwner).toBeCalled();
            expect(data).toEqual([])
        })
})

it('change status', () => {
    let responseTask: Task = {
        ...baseTask,
        title: 'test title',
        description: 'test description',
        status: TaskStatus.TODO,
        createdAt: mockedDate,
        archivedAt: mockedDate
    }
    jest.spyOn(taskService, 'getById')
        .mockResolvedValueOnce(responseTask)

    responseTask.status = TaskStatus.INPROGRESS
    jest.spyOn(taskService, 'changeStatus')
        .mockResolvedValueOnce(responseTask)

    return taskResolver.changeStatus(null, { id: 'test-id', status: TaskStatus.INPROGRESS }, { user: member1 })
        .then(data => {
            expect(taskService.getById).toBeCalled();
            expect(taskService.changeStatus).toBeCalled();
            expect(data).toBe(responseTask)
        })
})

it('change status as another user', () => {
    let responseTask: Task = {
        ...baseTask,
        title: 'test title',
        description: 'test description',
        status: TaskStatus.TODO,
        createdAt: mockedDate,
        archivedAt: mockedDate
    }
    jest.spyOn(taskService, 'getById')
        .mockResolvedValueOnce(responseTask)

    return taskResolver.changeStatus(null, { id: 'test-id', status: TaskStatus.INPROGRESS }, { user: member2 })
        .catch(e => {
            expect(taskService.getById).toBeCalled();
            expect(e).not.toBeNull()
            expect(e).toBe(errors.invalidOwner)
        })
})

it('change status error invalid status', () => {
    return taskResolver.changeStatus(null, { id: 'test-id', status: TaskStatus.ARCHIVED }, null)
        .catch(error => {
            expect(taskService.getById).not.toBeCalled()
            expect(taskService.changeStatus).not.toBeCalled()
            expect(error).toBe(errors.invalidStatus)
        })
})

it('archive task', () => {
    const responseTask1 = {
        ...baseTask,
        title: 'test title',
        description: 'test description',
        createdAt: mockedDate,
        status: TaskStatus.TODO,
        archivedAt: mockedDate
    }
    jest.spyOn(taskService, 'getById')
        .mockImplementationOnce(async () => responseTask1)

    const responseTask2 = {
        ...baseTask,
        title: 'test title',
        description: 'test description',
        createdAt: mockedDate,
        status: TaskStatus.ARCHIVED,
        archivedAt: mockedDate
    }
    jest.spyOn(taskService, 'archive')
        .mockImplementationOnce(async () => responseTask2)

    return taskResolver.archiveTask(null, { id: 'test-id' }, { user: member1 })
        .then(data => {
            expect(taskService.getById).toBeCalled();
            expect(taskService.archive).toBeCalled();
            expect(data).toBe(responseTask2)
        })
})

it('archive task error already archived', () => {
    const responseTask = {
        ...baseTask,
        title: 'test title',
        description: 'test description',
        createdAt: mockedDate,
        status: TaskStatus.ARCHIVED
    }
    jest.spyOn(taskService, 'getById')
        .mockResolvedValueOnce(responseTask)

    return taskResolver.archiveTask(null, { id: 'test-id' }, { user: member1 })
        .catch(error => {
            expect(taskService.getById).toBeCalled();
            expect(taskService.archive).not.toBeCalled();
            expect(error).toEqual(errors.taskIsArchived)
        })
})

it('Create column as admin', () => {
    const inputColumn = {
        ...baseColumn,
        name: 'test title',
    }

    const responseColumn = {
        ...inputColumn,
        createdAt: mockedDate
    }
    jest.spyOn(columnService, 'add')
        .mockResolvedValueOnce(responseColumn)

    return taskResolver.addColumn(null, { column: inputColumn }, { user: admin })
        .then(data => {
            expect(columnService.add).toBeCalled();
            expect(data).toEqual(responseColumn)
        })
})

it('Create column as a member', () => {
    const inputColumn = {
        ...baseColumn,
        name: 'test title',
    }

    const responseColumn = {
        ...inputColumn,
        createdAt: mockedDate
    }
    jest.spyOn(columnService, 'add')
        .mockResolvedValueOnce(responseColumn)

    return taskResolver.addColumn(null, { column: inputColumn }, { user: member1 })
        .catch(error => {
            expect(error).toEqual(errors.adminOnly)
        })
})

it('update column as admin', () => {
    const inputColumn = {
        ...baseColumn,
        name: 'test new title',
    }

    const responseColumn = {
        ...inputColumn,
        createdAt: mockedDate
    }
    jest.spyOn(columnService, 'update')
        .mockResolvedValueOnce(responseColumn)

    return taskResolver.updateColumn(null, { id: inputColumn.id, column: inputColumn }, { user: admin })
        .then(data => {
            expect(columnService.update).toBeCalled();
            expect(data).toEqual(responseColumn)
        })
})

// it('move task to column', () => {
//     const columnId = "column-id"
//     const responseTask = {
//         ...baseTask,
//         title: 'test-title',
//         description: 'test-description',
//         createdAt: mockedDate,
//         // columnId: columnId,
//     }

//     jest.spyOn(taskService, 'getById')
//         .mockResolvedValueOnce(responseTask)

//     responseTask.columnId = columnId
//     jest.spyOn(taskService, 'moveToColumn')
//         .mockResolvedValueOnce(responseTask)

//     return taskResolver.moveToColumn(null, { id: 'test-id', columnId: columnId }, { user: member1 })
//         .then(data => {
//             expect(taskService.getById).toBeCalled();
//             expect(data).toBe(responseTask)
//             expect(data.columnId).toBe(columnId)
//         })
// })