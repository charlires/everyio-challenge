import { PrismaClient } from '@prisma/client';

import { ApolloServer } from '@apollo/server';
import { ApolloServerErrorCode } from '@apollo/server/errors';
import { startStandaloneServer } from '@apollo/server/standalone';
import { GraphQLError } from 'graphql';

import logger from './logger';

import { typeDefs } from './graphql.schema';
import MainResolver, { ErrorCode } from './resolver';
import ColumnService from './services/column';
import TaskService from './services/task';
import UserService from './services/user';

const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
})

async function main() {

    const taskService = new TaskService()
    const columnService = new ColumnService()
    const userService = new UserService()

    const resolver = new MainResolver(taskService, columnService)

    const resolvers = {
        Query: {
            tasks: resolver.findAllTasks,
            columns: resolver.findAllColumns
        },
        Mutation: {
            addTask: resolver.addTask,
            updateTask: resolver.updateTask,
            updateTaskStatus: resolver.changeStatus,
            archiveTask: resolver.archiveTask,
            moveToColumn: resolver.moveToColumn,
            addColumn: resolver.addColumn,
            updateColumn: resolver.updateColumn
        }
    };

    const server = new ApolloServer({
        typeDefs,
        resolvers,
        logger,
        formatError: (formattedError, error: Error) => {
            logger.error(error.message, error.stack)

            // Return a different error message
            switch (formattedError.extensions.code) {
                case ApolloServerErrorCode.GRAPHQL_VALIDATION_FAILED:
                    return { message: formattedError.message, locations: formattedError.locations };
                case ApolloServerErrorCode.BAD_USER_INPUT:
                    return { message: formattedError.message, locations: formattedError.locations }
                case ErrorCode.INVALID_OPERATION:
                    return { message: formattedError.message }
                default:
                    return formattedError;
                // return {
                //     ...formattedError,
                //     message: "Your input doesn't match the schema. Try double-checking it!",
                // };
            }
        },
    });

    const { url } = await startStandaloneServer(server, {
        listen: { port: 4000 },
        context: async ({ req }) => {
            // ideally this should be a JWT and we will have a mechanism to validate it and decode it
            // for simplicity the token is just the user email
            const token = req.headers.authorization || '';

            const user = await userService.getById(token);
            if (!user)
                throw new GraphQLError('User is not authenticated', {
                    extensions: {
                        code: 'UNAUTHENTICATED',
                        http: { status: 401 },
                    },
                });

            // context can include more information in the future
            return { user };
        },
    });

    logger.info(`server running in: ${url}`);
}

main()
    .catch(async (e) => {
        logger.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })