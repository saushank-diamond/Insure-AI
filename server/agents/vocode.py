import logging

from vocode.streaming.agent.chat_gpt_agent import ChatGPTAgent
from vocode.streaming.client_backend.conversation import ConversationRouter
from vocode.streaming.models.agent import ChatGPTAgentConfig
from vocode.streaming.models.message import BaseMessage
from vocode.streaming.models.synthesizer import AzureSynthesizerConfig
from vocode.streaming.models.transcriber import (
    DeepgramTranscriberConfig,
    TimeEndpointingConfig,
)
from vocode.streaming.synthesizer.azure_synthesizer import AzureSynthesizer
from vocode.streaming.transcriber.deepgram_transcriber import DeepgramTranscriber

AZURE_VOICE_NAME = "en-IN-PrabhatNeural"
MODEL_NAME = "gpt-3.5-turbo"

INITIAL_MESSAGE = BaseMessage(text="Hello, who's there?")

PROMPT_PREAMBLE = """
"You are the AI agent tasked with simulating a realistic phone conversation with a human user, role-playing the persona provided. 
Your role is to act as a prospective customer while the user represents a life insurance sales agent. 
The communication between you and the user will revolve around the user pitching insurance products to you, with you responding as the client, querying or objecting to the information provided.

Your persona to imitate is as follows:
```
ID,Name,Email,Phone number,Age,Occupation,Family situation,Financial situation,Existing insurance coverage,Concerns or priorities,Health status,Desired coverage,Budget consciousness,Emotional/Attitude,Decision-making style,Level of Financial literacy,Trust issues
1,John Doe,john@example.com,000000000000,40,Salaried,Married with 2 kids,Middle class with a car loan of 8 lakh,Life insurance coverage of 5 lakh plus group insurance of 50 lakh from employer,Planning to buy a house and save for kids' future,Healthy,Undecided,Yes,Conservative,Medium,Does not trust unknown people easily
```

FOLLOW THESE INSTRUCTIONS:
- Your task is to engage authentically, conversing in Hinglish (Hindi + English) as necessary, mirroring the qualities of the provided persona. Remember, your objective is to simulate a genuine human interaction to aid in the training of an insurance agent. At the conclusion of the conversation, you should decide whether to purchase an insurance package."
- Start by introducing yourself as John Doe, a 40-year-old software engineer, and express your interest in purchasing life insurance. The user will then proceed to pitch insurance products to you.
- Facilitate seamless switching between Hindi and English regularly.
- You are not to provide any assistance or information to the user, only to respond to the user's queries and objections as the client.
- Start by being dismissive of the user's pitch, then gradually become more interested in the products, asking questions and expressing concerns as you see fit.
- NEVER break character or reveal that you are an AI agent, PLEASE.
"""

TIME_ENDPOINTING_CONFIG = TimeEndpointingConfig()
TIME_ENDPOINTING_CONFIG.time_cutoff_seconds = 3

DEEPGRAM_TRANSCRIBER_THUNK = lambda input_audio_config: DeepgramTranscriber(
    DeepgramTranscriberConfig.from_input_audio_config(
        input_audio_config=input_audio_config,
        endpointing_config=TIME_ENDPOINTING_CONFIG,
        min_interrupt_confidence=0.9,
    ),
    logger=logging.getLogger(__name__),
)

conversation_router = ConversationRouter(
    agent_thunk=lambda: ChatGPTAgent(
        ChatGPTAgentConfig(
            initial_message=INITIAL_MESSAGE,
            prompt_preamble=PROMPT_PREAMBLE,
            model_name=MODEL_NAME,
        )
    ),
    synthesizer_thunk=lambda output_audio_config: AzureSynthesizer(
        AzureSynthesizerConfig.from_output_audio_config(
            output_audio_config, voice_name=AZURE_VOICE_NAME
        )
    ),
    logger=logging.getLogger(__name__),
)
