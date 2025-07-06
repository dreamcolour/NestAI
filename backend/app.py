from flask import Flask, request, jsonify, session, redirect, url_for
from flask_sqlalchemy import SQLAlchemy
from database import db, User, StudySession
import ai_bot
import os
from functools import wraps

app = Flask(__name__)
app.config['SECRET_KEY'] = os.getenv("SECRET_KEY", "nest-ai-secret")
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///nestai.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db.init_app(app)

with app.app_context():
    db.create_all()

def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            return jsonify({"error": "Unauthorized"}), 401
        return f(*args, **kwargs)
    return decorated_function

@app.route('/signup', methods=['POST'])
def signup():
    data = request.json
    if not data or 'email' not in data or 'password' not in data:
        return jsonify({"error": "Missing email or password"}), 400
    
    if User.query.filter_by(email=data['email']).first():
        return jsonify({"error": "Email already registered"}), 409
    
    user = User(email=data['email'], name=data.get('name', ''))
    user.set_password(data['password'])
    db.session.add(user)
    db.session.commit()
    
    session['user_id'] = user.id
    return jsonify({"message": "User created", "user_id": user.id}), 201

@app.route('/login', methods=['POST'])
def login():
    data = request.json
    user = User.query.filter_by(email=data['email']).first()
    
    if not user or not user.check_password(data['password']):
        return jsonify({"error": "Invalid credentials"}), 401
    
    session['user_id'] = user.id
    return jsonify({"message": "Logged in", "user_id": user.id}), 200

@app.route('/logout')
def logout():
    session.pop('user_id', None)
    return jsonify({"message": "Logged out"}), 200

@app.route('/pomodoro/tip')
@login_required
def pomodoro_tip():
    tip = ai_bot.generate_pomodoro_tip()
    return jsonify(tip), 200

@app.route('/flashcards', methods=['POST'])
@login_required
def create_flashcards():
    data = request.json
    flashcards = ai_bot.generate_flashcards(data['text'])
    
    # Save session
    session_record = StudySession(
        user_id=session['user_id'],
        session_type='flashcards',
        content=data['text'],
        result=str(flashcards)
    )
    db.session.add(session_record)
    db.session.commit()
    
    return jsonify(flashcards), 200

@app.route('/language-guide', methods=['POST'])
@login_required
def language_guide():
    data = request.json
    guide = ai_bot.generate_language_study_steps(data['text'])
    
    session_record = StudySession(
        user_id=session['user_id'],
        session_type='language',
        content=data['text'],
        result=str(guide)
    )
    db.session.add(session_record)
    db.session.commit()
    
    return jsonify(guide), 200

@app.route('/chat', methods=['POST'])
@login_required
def chat():
    messages = request.json['messages']
    response = ai_bot.chat_with_user(messages)
    
    session_record = StudySession(
        user_id=session['user_id'],
        session_type='chat',
        content=str(messages),
        result=response
    )
    db.session.add(session_record)
    db.session.commit()
    
    return jsonify({"response": response}), 200

@app.route('/sessions')
@login_required
def get_sessions():
    sessions = StudySession.query.filter_by(user_id=session['user_id']).all()
    return jsonify([{
        'id': s.id,
        'type': s.session_type,
        'timestamp': s.timestamp.isoformat()
    } for s in sessions]), 200

if __name__ == '__main__':
    app.run(debug=True)