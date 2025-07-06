import openai
import json
import os

openai.api_key = os.getenv("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")

def generate_flashcards(text):
    prompt = f"""Generate flashcards in JSON format for this text:
    {text}
    
    Output format:
    {{
      "flashcards": [
        {{"front": "Question", "back": "Answer"}}
      ]
    }}"""
    
    response = openai.ChatCompletion.create(
        model="gpt-3.5-turbo",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.3
    )
    return json.loads(response.choices[0].message['content'])

def generate_pomodoro_tip():
    tips = [
        "Focus on one task at a time - multitasking reduces efficiency",
        "Take a deep breath before starting your next session",
        "Hydrate during your break to maintain mental clarity",
        "Stretch your legs during the 5-minute break",
        "Close all unrelated tabs to minimize distractions"
    ]
    return {"tip": tips[0]}  # In production, randomize tips

def generate_language_study_steps(text):
    prompt = f"""Create a language study plan for this text in JSON format:
    {text}
    
    Output format:
    {{
      "steps": [
        {{"title": "Step Title", "description": "Step explanation"}}
      ]
    }}"""
    
    response = openai.ChatCompletion.create(
        model="gpt-3.5-turbo",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.4
    )
    return json.loads(response.choices[0].message['content'])

def chat_with_user(messages):
    response = openai.ChatCompletion.create(
        model="gpt-3.5-turbo",
        messages=messages,
        temperature=0.7
    )
    return response.choices[0].message['content']