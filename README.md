# AgroSense

AgroSense is an AI-based agriculture system that provides plant disease detection using image classification and crop yield prediction using a trained machine learning model.  
The project includes a React frontend and a FastAPI backend with integrated ML models.

### Features
- Scan or upload leaf images for disease identification
- Predict crop yield using rainfall, fertilizer, pesticide, crop type, season and state
- Authentication-enabled dashboard
- Frontend and backend communicate via REST API

### Tech Stack
Frontend: React  
Backend: FastAPI (Python)  
Machine Learning: TensorFlow + Scikit-Learn  
Model Training: Pandas, NumPy, Joblib  

### Yield Model Inputs
- Area (hectares)
- Annual_Rainfall (mm)
- Fertilizer (kg/ha)
- Pesticide (kg/ha)
- Crop
- Season
- State

### Run Frontend
# AgroSense

AgroSense is an AI-based agriculture system that provides plant disease detection using image classification and crop yield prediction using a trained machine learning model.  
The project includes a React frontend and a FastAPI backend with integrated ML models.

### Features
- Scan or upload leaf images for disease identification
- Predict crop yield using rainfall, fertilizer, pesticide, crop type, season and state
- Authentication-enabled dashboard
- Frontend and backend communicate via REST API

### Tech Stack
Frontend: React  
Backend: FastAPI (Python)  
Machine Learning: TensorFlow + Scikit-Learn  
Model Training: Pandas, NumPy, Joblib  

### Yield Model Inputs
- Area (hectares)
- Annual_Rainfall (mm)
- Fertilizer (kg/ha)
- Pesticide (kg/ha)
- Crop
- Season
- State

### Run Frontend
cd client
npm install
npm start

### Run Backend
cd ml-service
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8001


### Summary
AgroSense combines computer vision and predictive modeling to support farmers through digital agriculture. The platform allows disease identification through leaf images and yield estimation based on agricultural parameters.
