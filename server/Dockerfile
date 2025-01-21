FROM python:3.10.13-bullseye

WORKDIR /app
ADD . /app

RUN apt-get update \
        && apt-get install libportaudio2 libportaudiocpp0 portaudio19-dev libasound-dev libsndfile1-dev -y
RUN apt-get -y update
RUN apt-get -y upgrade
RUN apt-get install -y ffmpeg

# Add environment variables
ENV DEEPGRAM_API_KEY=
ENV OPENAI_API_KEY=
ENV AZURE_SPEECH_KEY=
ENV AZURE_SPEECH_REGION=

RUN pip install --no-cache-dir --upgrade poetry
RUN poetry config virtualenvs.create false
RUN poetry install --no-interaction --no-ansi

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]