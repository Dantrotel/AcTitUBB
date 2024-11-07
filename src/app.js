import 'dotenv/config';
import express from 'express';

import router from './routes/person.routes.js';
import routerRole from './routes/role.routes.js';
import createRolesAndUsers from './db/connection.db.js';

const app = express();

app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.use('/api/v1/users', router);
app.use('/api/v1/roles', routerRole);

const PORT = process.env.PORT || 3000;

createRolesAndUsers();

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
