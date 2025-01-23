# insure-ai

## Development Instructions

### Requirements
- Node.js v18+
- Python v3.10+
- PostgreSQL v14+

### Backend 

We use FastAPI for the backend. You can find the backend in the `server` package.

#### Directory Structure:
- `main.py`: The entry point that sets up the FastAPI server ([FastAPI documentation](https://fastapi.tiangolo.com/)).
- `services`: Contains the database layer.
- `api`: Contains all the routes.
- `models`: Contains all Pydantic, database, and other models.
- `core`: Contains configuration, database setup, and some security-related code.

#### Running the server:

1. Obtain API keys from the following services:
   - [OPENAI_API_KEY](https://openai.com)
   - [RETELL_API_KEY](https://retell-ai.com)

2. Set up the environment variables by creating a `.env` file using `.env.example` as a template.

3. Create a virtual environment and install dependencies:

    ```bash
    poetry install
    ```

4. Ensure you have a PostgreSQL server running and have the necessary database and user created with the environment variables set up. Now you can run the migrations to create the database tables:

    ```bash
    python ./initial_data.py
    ```

5. Start the server:

    ```bash
    poetry run uvicorn main:app --host 0.0.0.0 --port 8000
    ```

The server will be running at `http://localhost:8000`. You can access the API documentation at `http://localhost:8000/docs`.

### Frontend

We use [Next.js](https://nextjs.org/docs) for the frontend. You can find the frontend in the `web-client` package.

#### Running the web client:

1. Create a new `.env` file with the variables from `.env.example`.

2. Run the following commands:
    ```bash
    npm install
    npm run dev
    ```

The server will be running at `http://localhost:3000`.

### Additional Notes

- Ensure all necessary environment variables are properly configured before deploying either the backend or the frontend.
- For more details on each service and how to obtain API keys, refer to the provided links.
- The backend receives events from Retell through webhooks. To test the webhooks in local development, you can use a tool like [ngrok](https://ngrok.com/). Once you have ngrok installed, run the following command to start a tunnel to your local server:
    ```bash
    ngrok http 8000
    ```
    This will create a public URL that you can use to test the webhooks. You can then use this URL in the `.env` file for the `WEBHOOK_URL` variable.

### Deployment

To deploy the backend to Azure, you can use the provided Dockerfile in the `server` package. To build the image, run the following command:

```bash
az acr build --resource-group insure-ai --registry insureai --image insureai-server:latest .
```

To deploy the web client to Azure, you can run the following command from the `web-client` package.
Make sure you have the `.env.production` file with the correct environment variables set up.
```bash
az acr build --resource-group insure-ai --registry insureai --image insureai-client:latest .
```
