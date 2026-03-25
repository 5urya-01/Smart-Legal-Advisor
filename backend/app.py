import urllib.parse
import asyncio
import smtplib
import random
import uuid
from datetime import datetime
from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from werkzeug.security import generate_password_hash, check_password_hash
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from google.genai import types

# --- IMPORT AI LOGIC ---
from agent import runner, session_service, APP_NAME

app = Flask(__name__)
CORS(app)

# --- MONGODB SETUP ---
username = "x4yrus"
password = "RkpqVdDGYhi9UM2l" 
escaped_password = urllib.parse.quote_plus(password)
MONGO_URI = f"mongodb+srv://{username}:{escaped_password}@smartlegaladvisor.q1fbhnv.mongodb.net/?appName=SmartLegalAdvisor"

client = MongoClient(MONGO_URI)
db = client.smart_legal
users_collection = db.users
conversations_collection = db.conversations
otps_collection = db.otps

# --- GMAIL OTP HELPER ---
def send_otp_email(receiver_email, otp, subject_type="Verification"):
    sender_email = "smartlegaladvisor.noreply@gmail.com" 
    sender_password = "jorr qqdm czwb nfnx" 
    message = MIMEMultipart()
    message["From"] = sender_email
    message["To"] = receiver_email
    message["Subject"] = f"Smart Legal Advisor - {subject_type} Code"
    body = f"Hello,\n\nYour 6-digit {subject_type} code is: {otp}\n\nRegards,\nSecurity Team"
    message.attach(MIMEText(body, "plain"))
    try:
        server = smtplib.SMTP("smtp.gmail.com", 587); server.starttls()
        server.login(sender_email, sender_password)
        server.sendmail(sender_email, receiver_email, message.as_string()); server.quit()
        return True
    except: return False

# --- API ROUTES ---

@app.route('/api/request_signup_otp', methods=['POST'])
def request_signup_otp():
    email = request.json.get('email')
    if users_collection.find_one({"email": email}): return jsonify({"error": "Exists"}), 400
    otp = str(random.randint(100000, 999999))
    otps_collection.update_one({"email": email}, {"$set": {"otp": otp, "ts": datetime.utcnow()}}, upsert=True)
    if send_otp_email(email, otp, "Signup"): return jsonify({"message": "Sent"}), 200
    return jsonify({"error": "Failed"}), 500

@app.route('/api/signup', methods=['POST'])
def signup():
    data = request.json
    otp_record = otps_collection.find_one({"email": data['email']})
    if not otp_record or otp_record['otp'] != data.get('otp'): return jsonify({"error": "Invalid OTP"}), 401
    hashed_pw = generate_password_hash(data['password'])
    users_collection.insert_one({"name": data['name'], "email": data['email'], "password": hashed_pw, "lang": "EN"})
    otps_collection.delete_one({"email": data['email']})
    return jsonify({"message": "Success"}), 201

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    user = users_collection.find_one({"email": data['email']})
    if user and check_password_hash(user['password'], data['password']):
        return jsonify({"name": user['name'], "email": user['email'], "lang": user.get('lang', 'EN')}), 200
    return jsonify({"error": "Invalid"}), 401

@app.route('/api/update_profile', methods=['POST'])
def update_profile():
    data = request.json
    email = data.get('email')
    new_lang = data.get('lang')
    
    if not email or not new_lang:
        return jsonify({"error": "Missing data"}), 400
        
    result = users_collection.update_one(
        {"email": email}, 
        {"$set": {"lang": new_lang}}
    )
    
    if result.matched_count > 0:
        return jsonify({"message": "Profile updated successfully"}), 200
    return jsonify({"error": "User not found"}), 404

@app.route('/api/chat', methods=['POST'])
def chat():
    data = request.json
    user_email = data.get('email')
    user_profile = users_collection.find_one({"email": user_email})
    db_lang_code = user_profile.get('lang', 'EN') if user_profile else 'EN'
    lang_map = {'HI': 'Hindi', 'TE': 'Telugu', 'EN': 'English'}
    lang_pref = lang_map.get(db_lang_code, 'English')
    
    session_id = str(uuid.uuid4())
    # Note: Tagged to match the instruction in agent.py
    prompt = f"[LANGUAGE INSTRUCTION: Respond ONLY in {lang_pref}]\n\nUSER: {data.get('message')}"

    async def execute_chat():
        await session_service.create_session(app_name=APP_NAME, user_id="default_user", session_id=session_id)
        response_text = ""
        async for event in runner.run_async(
            user_id="default_user", session_id=session_id,
            new_message=types.Content(role="user", parts=[types.Part(text=prompt)])
        ):
            if event.is_final_response():
                response_text = event.content.parts[0].text; break
        return response_text

    try:
        return jsonify({"response": asyncio.run(execute_chat())}), 200
    except Exception as e:
        print(f"🚨 CRITICAL CHAT ERROR: {str(e)}") # Add this line!
        import traceback
        traceback.print_exc()                      # Add this line!
        return jsonify({"error": str(e)}), 500

@app.route('/api/save_chat', methods=['POST'])
def save_chat():
    data = request.json
    chat_id, messages, email = data.get('chat_id'), data.get('messages', []), data.get('email')
    if chat_id:
        from bson import ObjectId
        db.conversations.update_one({"_id": ObjectId(chat_id)}, {"$set": {"messages": messages, "timestamp": data.get('timestamp')}})
        return jsonify({"message": "Updated", "chat_id": chat_id}), 200
    first_msg = next((m['content'] for m in messages if m['role'] == 'user'), "New Consultation")
    title = (first_msg[:30] + '...') if len(first_msg) > 30 else first_msg
    res = db.conversations.insert_one({"email": email, "title": title, "messages": messages, "timestamp": data.get('timestamp')})
    return jsonify({"message": "Saved", "chat_id": str(res.inserted_id)}), 201

@app.route('/api/get_history/<email>', methods=['GET'])
def get_history(email):
    chats = list(db.conversations.find({"email": email}).sort("timestamp", -1))
    for chat in chats: chat['_id'] = str(chat['_id'])
    return jsonify(chats), 200

@app.route('/api/delete_chat/<chat_id>', methods=['DELETE'])
def delete_chat(chat_id):
    from bson import ObjectId
    db.conversations.delete_one({"_id": ObjectId(chat_id)})
    return jsonify({"message": "Deleted"}), 200

if __name__ == '__main__':
    app.run(debug=True, port=5000, use_reloader=False)