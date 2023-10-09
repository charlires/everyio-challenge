import { Column, ColumnModel } from '../schemas';

export default class ColumnService {

    public async findAll(): Promise<Array<Column>> {
        return ColumnModel.find().populate('tasks')//.exec()
    }

    public add(colunm: Column): Promise<Column> {

        return new ColumnModel({ createdAt: new Date(), ...colunm }).save()
    }

    public async update(id: string, column: { name: string }): Promise<Column> {

        const res = await ColumnModel.updateOne({
            title: column.name,
        }, {
            '_id': id
        })
        if (res.modifiedCount === 1) {
            return ColumnModel.findById(id)
        }
    }
}