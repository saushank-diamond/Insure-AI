# InsuranceGPT

InsuranceGPT is a project that combines a FastAPI Python backend with a Next.js frontend. This repository serves as a platform for integrating various APIs and deploying an insurance-related application.

## Deployment Instructions

### Backend Deployment

1. Obtain API keys from the following services:
   - [DEEPGRAM_API_KEY](https://www.deepgram.com/)
   - [OPENAI_API_KEY](https://openai.com/)
   - [AZURE_SPEECH_KEY](https://azure.microsoft.com/en-us/services/cognitive-services/speech-to-text/)
   - [AZURE_SPEECH_REGION](https://azure.microsoft.com/en-us/global-infrastructure/services/?products=speech-to-text)

2. Set up the environment variables by creating a `.env` file using `.env.example` as a template.

3. To deploy the backend, there are two methods:
    - **Using Poetry:**
      ```bash
      poetry install
      poetry run uvicorn main:app --host 0.0.0.0 --port 8000
      ```

    - **Using Docker:**
      Build the Docker container provided in the `server` directory. Ensure all environment variables are filled in the Dockerfile.
      
      ```bash
      docker build -t insurancegpt-backend ./server
      ```

### Frontend Deployment

1. Obtain API keys:
   - OPENAI_API_KEY
   - AUTH_SECRET (a random string)
   - GOOGLE_CLIENT_ID
   - GOOGLE_CLIENT_SECRET

2. Set up a KV Database Instance on Vercel by following the steps outlined in the [quick start guide](https://vercel.com/docs/storage/vercel-kv/quickstart#create-a-kv-database). Update the environment variables (`KV_URL`, `KV_REST_API_URL`, `KV_REST_API_TOKEN`, `KV_REST_API_READ_ONLY_TOKEN`) in the `.env` file with the credentials provided during the KV database setup.

3. Obtain [Google OAuth credentials](https://developers.google.com/identity/protocols/oauth2).

4. Create a new `.env` file with the variables from `.env.example`.

5. Run the following commands:
    ```bash
    pnpm install
    pnpm dev
    ```

## Additional Notes

- Make sure all necessary environment variables are properly configured before deploying either the backend or the frontend.
- For more details on each service and how to obtain API keys, refer to the provided links.