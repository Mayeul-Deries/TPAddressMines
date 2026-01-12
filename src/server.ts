import express from 'express';
import * as YAML from 'yaml';
import swaggerUi from 'swagger-ui-express';
import userController from './adapters/driving/userController';
import path from 'path';
import * as fs from "node:fs";

const app = express();
app.use(express.json());

const file  = fs.readFileSync('./openapi.yaml', 'utf8')
const swaggerDocument = YAML.parse(file)

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use('/users', userController);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
  console.log(`Swagger docs at http://localhost:${port}/docs`);
});
