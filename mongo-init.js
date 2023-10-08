db.createCollection('users');
db.createCollection('tasks');
db.createCollection('columns');
db.users.insertOne({ email: "carlos@every.io", role: "MEMBER" })
db.users.insertOne({ email: "jose@every.io", role: "MEMBER" })
db.users.insertOne({ email: "admin@every.io", role: "ADMIN" })