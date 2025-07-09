# **DFIR-Fullstack Project**

This project is an endpoint management and job assignment platform built on a multi-tenant architecture. The system consists of a central management panel (AIR Admin), a server application offered to each tenant (AIR Server), and desktop agents that connect to this server (Responder Desktop).

The project has been developed using modern microservice architecture principles, event-driven data flow, and the CQRS (Command and Query Responsibility Segregation) design pattern.

## **Technology Stack**

- **Backend:** NodeJS, TypeScript, NestJS (Microservices & Monolithic)
- **Frontend:** Vue.js (AIR Admin & AIR Server)
- **Desktop Application:** Electron & React (Responder Desktop)
- **Databases:** PostgreSQL (Relational Data), Redis (Cache & Real-time Data)
- **Messaging & Event Streaming:** RabbitMQ (Message Queue), EMQX (MQTT Broker)

  ## **Installation Steps**

This project is designed to be set up quickly and in an isolated manner using `pnpm` and `Docker`.

1. **Clone the Repository:**

```sh
git clone https://github.com/kumbulali/dfir-fullstack.git
cd dfir-fullstack
```

2.  **Set Node.js Version:** Node.js v22.17.0 (LTS) is required to run the project. If you use `nvm` (Node Version Manager), you can switch to the correct version with the following command:

```sh
nvm use
```

3.  **Install PNPM:** If you do not have `pnpm` installed on your system, install it globally with the following command:

```sh
npm i -g pnpm
```

4.  **Install Dependencies:** While in the project's root directory, install the dependencies for all workspaces (applications and libraries) with a single command:

```sh
pnpm i -r
```

5.  **Start Docker Services (Compose V2):** Bring up all backend services, databases, and brokers with a single command:

```sh
docker compose up -d

```

7.  Once this command completes, the following services will be running:

- **AIR Admin:** `http://localhost:8090`
- **AIR Server:** `http://localhost:8080`

8. **Run the Responder Desktop Application:** The Responder application must be run separately.

```sh
cd apps/responder-desktop
npm i
npm run dev
```

## **Usage Flow**

The `.env` files within the project are provided with default, non-secure credentials.

1. **Admin Login:** Navigate to the AIR Admin panel at `http://localhost:8090`.
   - **Username:** `admin@test.com`
   - **Password:** `test123`
2. **Create a Tenant:** After logging in, create a new tenant (e.g., `test_tenant`) from the "Tenants" section.
3. **Create a Tenant User:** Go to the detail page of the tenant you created and create a new user specific to that tenant.
4. **Log in to AIR Server:** Navigate to the AIR Server at `http://localhost:8080` and log in with the tenant user you just created.
5. **Register a Responder:**
   - In the AIR Server interface, go to the "Responders" page and click the "Register Responder" button to generate a one-time enrollment token.
   - In the running Responder Desktop application, enter your `tenantId` and the newly generated enrollment token in the respective fields to complete the registration.
6. **Assign and Track Jobs:**

   - From the AIR Server, go to the "Jobs" page and assign a job to your registered Responder.
   - Sample commands `add` (addition) and `subtract` (subtraction) are available. These operations are applied to the array of numbers provided as `args`.
   - The Responder Desktop application will receive the assigned job, process it with a 5-second delay, and submit the result back to the AIR Server.

   ## **API Documentation**

The Postman collection, which includes the project's API endpoints and usage examples, is located in the `/postman` directory within the project files. You can import this collection into your Postman application to test all API requests.

## **Architectural Summary**

### **Architectural Decisions**

In multi-user and high-volume systems like this, resource management and scalability are of critical importance. Therefore, architectural choices were made to meet these requirements:

- **AIR-Server (Microservice Architecture):** Potentially high-load operations such as real-time heartbeats from Responders, job results, and user interactions are divided into independent microservices (ingestion, sync, jobs, etc.). This prevents the load or failure of one service from affecting the entire system and allows each component to be scaled according to its specific needs.
- **AIR-Admin (Monolithic Architecture):** Administrative tasks (tenant creation, user management, etc.) are less frequent and less resource-intensive. For this reason, a monolithic structure, which is simpler, faster to develop, and easier to maintain, was preferred.

  ### **Event-Driven Statistics Aggregation (Stats Aggregator)**

The global statistics on the Admin Panel are collected using an event-driven architecture, in line with best practices.

- Every action that affects statistics, such as adding a `Responder` or assigning/completing a `Job`, is published as an event to RabbitMQ by the respective microservice.
- A dedicated `stats-aggregator` service listens to these events and atomically increments or decrements counters stored in Redis (under the `global_stats` key).
- Additionally, this service calculates the total number of healthy responders every 10 seconds by counting the heartbeat signals in Redis and adds this information to the main statistics object.
- This allows the admin panel to present critical data—such as total users, total responders, healthy responder ratio, total number of jobs, and their statuses (pending, completed, etc.)—in near real-time, without putting a load on the main databases.

  ### **Other Architectural Details**

- **Heartbeat Signals:** Responders send a health signal via MQTT every 5 seconds. These signals are received and parsed by EMQX and then forwarded to an exchange in RabbitMQ.
- **Ingestion Service:** This microservice listens for signals arriving at RabbitMQ and instantly writes them to Redis.
- **Sync Service:** This microservice reads the data from Redis every 30 seconds and emits an `batch_update_responders` event to update the `lastSeen` fields of the records in the respective tenant's database within the `responder` service.
- **CQRS and SOLID:** All read (Query) and write (Command) operations are segregated according to CQRS principles. Each service and module is designed to adhere to SOLID principles, ensuring they do not interfere with database operations outside their own responsibility.
