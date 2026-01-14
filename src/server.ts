import express from 'express';
import * as YAML from 'yaml';
import swaggerUi from 'swagger-ui-express';
import * as fs from 'node:fs';
import path from 'path';

import { ActivityController } from './adapters/driving/activityController';
import { InMemoryActivityRepo } from "./adapters/driven/inMemoryActivityRepo";
import { ActivityService } from "./services/activityService";

import { UserController } from './adapters/driving/userController';
import { InMemoryUserRepo } from "./adapters/driven/inMemoryUserRepo";
import { UserService } from "./services/userService";

const app = express();
app.use(express.json());

const activityRepo = new InMemoryActivityRepo();
const userRepo = new InMemoryUserRepo();

const activityService = new ActivityService(activityRepo);
const activityController = new ActivityController(activityService);
activityController.registerRoutes(app);

const userService = new UserService(userRepo);
const userController = new UserController(userService);
userController.registerRoutes(app);

const file  = fs.readFileSync('./openapi.yaml', 'utf8')
const swaggerDocument = YAML.parse(file)

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
  console.log(`Swagger docs at http://localhost:${port}/docs`);
});
