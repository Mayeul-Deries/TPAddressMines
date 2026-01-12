import express from 'express';
import path from 'path';
import * as fs from "node:fs";
import * as YAML from 'yaml';
import swaggerUi from 'swagger-ui-express';

import { AddressController } from './adapters/driving/addressController';
import { InMemoryAddressRepo } from "./adapters/driven/inMemoryAddressRepo";

const app = express();
app.use(express.json());

const addressRepo = new InMemoryAddressRepo();

const file  = fs.readFileSync('./openapi.yaml', 'utf8')
const swaggerDocument = YAML.parse(file)

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

const addressController = new AddressController(addressRepo);
addressController.registerRoutes(app);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
  console.log(`Swagger docs at http://localhost:${port}/docs`);
});
