import cv2
import mediapipe as mp
import numpy as np
import pickle
import os
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score
import json
from datetime import datetime

class HandGestureAI:
    def __init__(self):
        # Khởi tạo MediaPipe
        self.mp_hands = mp.solutions.hands
        self.hands = self.mp_hands.Hands(
            static_image_mode=False,
            max_num_hands=2,
            min_detection_confidence=0.7,
            min_tracking_confidence=0.5
        )
        self.mp_drawing = mp.solutions.drawing_utils
        
        # Khởi tạo model và data
        self.model = RandomForestClassifier(n_estimators=100, random_state=42)
        self.training_data = []
        self.training_labels = []
        self.gesture_names = {}
        self.is_trained = False
        
        # Tạo thư mục lưu model
        self.model_dir = "gesture_models"
        if not os.path.exists(self.model_dir):
            os.makedirs(self.model_dir)
        
        # Load model đã có (nếu có)
        self.load_model()
    
    def extract_landmarks(self, results):
        """Trích xuất landmarks từ kết quả MediaPipe"""
        if results.multi_hand_landmarks:
            landmarks = []
            for hand_landmarks in results.multi_hand_landmarks:
                for landmark in hand_landmarks.landmark:
                    landmarks.extend([landmark.x, landmark.y, landmark.z])
            
            # Normalize landmarks (chuẩn hóa về tọa độ tương đối)
            if len(landmarks) >= 63:  # 21 landmarks * 3 coordinates
                landmarks = landmarks[:63]  # Chỉ lấy 1 tay đầu tiên
                # Normalize dựa trên wrist (điểm 0)
                wrist_x, wrist_y = landmarks[0], landmarks[1]
                normalized = []
                for i in range(0, len(landmarks), 3):
                    normalized.extend([
                        landmarks[i] - wrist_x,
                        landmarks[i+1] - wrist_y,
                        landmarks[i+2]
                    ])
                return np.array(normalized)
        return None
    
    def collect_gesture_data(self, gesture_name, num_samples=50):
        """Thu thập dữ liệu cho một cử chỉ mới"""
        print(f"Bắt đầu thu thập dữ liệu cho cử chỉ: {gesture_name}")
        print(f"Làm cử chỉ '{gesture_name}' trước camera và nhấn SPACE để capture")
        print("Nhấn ESC để dừng thu thập")
        
        cap = cv2.VideoCapture(0)
        samples_collected = 0
        gesture_data = []
        
        while samples_collected < num_samples:
            ret, frame = cap.read()
            if not ret:
                break
            
            # Flip frame để dễ nhìn
            frame = cv2.flip(frame, 1)
            rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            results = self.hands.process(rgb_frame)
            
            # Vẽ landmarks
            if results.multi_hand_landmarks:
                for hand_landmarks in results.multi_hand_landmarks:
                    self.mp_drawing.draw_landmarks(
                        frame, hand_landmarks, self.mp_hands.HAND_CONNECTIONS)
            
            # Hiển thị thông tin
            cv2.putText(frame, f"Gesture: {gesture_name}", (10, 30), 
                       cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
            cv2.putText(frame, f"Samples: {samples_collected}/{num_samples}", 
                       (10, 70), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
            cv2.putText(frame, "SPACE: Capture | ESC: Exit", (10, 110), 
                       cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)
            
            cv2.imshow('Hand Gesture Data Collection', frame)
            
            key = cv2.waitKey(1) & 0xFF
            if key == 27:  # ESC
                break
            elif key == 32:  # SPACE
                landmarks = self.extract_landmarks(results)
                if landmarks is not None:
                    gesture_data.append(landmarks)
                    samples_collected += 1
                    print(f"Captured sample {samples_collected}/{num_samples}")
        
        cap.release()
        cv2.destroyAllWindows()
        
        # Thêm vào training data
        self.training_data.extend(gesture_data)
        gesture_id = len(self.gesture_names)
        self.gesture_names[gesture_id] = gesture_name
        self.training_labels.extend([gesture_id] * len(gesture_data))
        
        print(f"Đã thu thập {len(gesture_data)} samples cho cử chỉ '{gesture_name}'")
        return len(gesture_data)
    
    def train_model(self):
        """Huấn luyện model với dữ liệu đã thu thập"""
        if len(self.training_data) < 10:
            print("Cần ít nhất 10 samples để huấn luyện!")
            return False
        
        print("Bắt đầu huấn luyện model...")
        X = np.array(self.training_data)
        y = np.array(self.training_labels)
        
        # Chia dữ liệu train/test
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42, stratify=y
        )
        
        # Huấn luyện model
        self.model.fit(X_train, y_train)
        
        # Đánh giá model
        y_pred = self.model.predict(X_test)
        accuracy = accuracy_score(y_test, y_pred)
        
        print(f"Model đã được huấn luyện với accuracy: {accuracy:.2f}")
        self.is_trained = True
        
        # Lưu model
        self.save_model()
        return True
    
    def predict_gesture(self, landmarks):
        """Dự đoán cử chỉ từ landmarks"""
        if not self.is_trained or landmarks is None:
            return None, 0
        
        # Reshape landmarks để predict
        landmarks_reshaped = landmarks.reshape(1, -1)
        
        # Predict
        prediction = self.model.predict(landmarks_reshaped)
        probability = self.model.predict_proba(landmarks_reshaped)
        
        gesture_id = prediction[0]
        confidence = np.max(probability)
        
        if confidence > 0.7:  # Threshold confidence
            return self.gesture_names.get(gesture_id, "Unknown"), confidence
        else:
            return None, confidence
    
    def save_model(self):
        """Lưu model và dữ liệu"""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        
        # Lưu model
        model_path = os.path.join(self.model_dir, f"gesture_model_{timestamp}.pkl")
        with open(model_path, 'wb') as f:
            pickle.dump(self.model, f)
        
        # Lưu dữ liệu training
        data_path = os.path.join(self.model_dir, f"training_data_{timestamp}.pkl")
        with open(data_path, 'wb') as f:
            pickle.dump({
                'training_data': self.training_data,
                'training_labels': self.training_labels,
                'gesture_names': self.gesture_names
            }, f)
        
        # Lưu model mới nhất
        latest_model_path = os.path.join(self.model_dir, "latest_model.pkl")
        with open(latest_model_path, 'wb') as f:
            pickle.dump(self.model, f)
        
        latest_data_path = os.path.join(self.model_dir, "latest_data.pkl")
        with open(latest_data_path, 'wb') as f:
            pickle.dump({
                'training_data': self.training_data,
                'training_labels': self.training_labels,
                'gesture_names': self.gesture_names
            }, f)
        
        print(f"Model đã được lưu: {model_path}")
    
    def load_model(self):
        """Load model đã lưu"""
        latest_model_path = os.path.join(self.model_dir, "latest_model.pkl")
        latest_data_path = os.path.join(self.model_dir, "latest_data.pkl")
        
        try:
            # Load model
            with open(latest_model_path, 'rb') as f:
                self.model = pickle.load(f)
            
            # Load dữ liệu
            with open(latest_data_path, 'rb') as f:
                data = pickle.load(f)
                self.training_data = data['training_data']
                self.training_labels = data['training_labels']
                self.gesture_names = data['gesture_names']
            
            self.is_trained = True
            print("Đã load model thành công!")
            print(f"Có {len(self.gesture_names)} cử chỉ đã học: {list(self.gesture_names.values())}")
            
        except FileNotFoundError:
            print("Không tìm thấy model đã lưu. Sẽ tạo model mới.")
    
    def real_time_recognition(self):
        """Nhận diện cử chỉ real-time"""
        if not self.is_trained:
            print("Model chưa được huấn luyện! Vui lòng thu thập dữ liệu và huấn luyện trước.")
            return
        
        print("Bắt đầu nhận diện cử chỉ real-time...")
        print("Nhấn ESC để thoát")
        
        cap = cv2.VideoCapture(0)
        
        while True:
            ret, frame = cap.read()
            if not ret:
                break
            
            # Flip frame
            frame = cv2.flip(frame, 1)
            rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            results = self.hands.process(rgb_frame)
            
            # Vẽ landmarks
            if results.multi_hand_landmarks:
                for hand_landmarks in results.multi_hand_landmarks:
                    self.mp_drawing.draw_landmarks(
                        frame, hand_landmarks, self.mp_hands.HAND_CONNECTIONS)
                
                # Predict gesture
                landmarks = self.extract_landmarks(results)
                gesture, confidence = self.predict_gesture(landmarks)
                
                if gesture:
                    cv2.putText(frame, f"Gesture: {gesture}", (10, 30), 
                               cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
                    cv2.putText(frame, f"Confidence: {confidence:.2f}", (10, 70), 
                               cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
                else:
                    cv2.putText(frame, "No gesture detected", (10, 30), 
                               cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)
            
            cv2.putText(frame, "ESC: Exit", (10, frame.shape[0] - 10), 
                       cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)
            
            cv2.imshow('Hand Gesture Recognition', frame)
            
            if cv2.waitKey(1) & 0xFF == 27:  # ESC
                break
        
        cap.release()
        cv2.destroyAllWindows()
    
    def show_menu(self):
        """Hiển thị menu chính"""
        while True:
            print("\n" + "="*50)
            print("AI NHẬN DIỆN CỬ CHỈ TAY TỰ HỌC")
            print("="*50)
            print("1. Thu thập dữ liệu cử chỉ mới")
            print("2. Huấn luyện model")
            print("3. Nhận diện cử chỉ real-time")
            print("4. Xem danh sách cử chỉ đã học")
            print("5. Thoát")
            print("="*50)
            
            choice = input("Chọn chức năng (1-5): ").strip()
            
            if choice == "1":
                gesture_name = input("Nhập tên cử chỉ: ").strip()
                if gesture_name:
                    num_samples = int(input("Số samples (mặc định 50): ") or "50")
                    self.collect_gesture_data(gesture_name, num_samples)
                else:
                    print("Tên cử chỉ không hợp lệ!")
            
            elif choice == "2":
                self.train_model()
            
            elif choice == "3":
                self.real_time_recognition()
            
            elif choice == "4":
                if self.gesture_names:
                    print("\nCác cử chỉ đã học:")
                    for gesture_id, gesture_name in self.gesture_names.items():
                        count = self.training_labels.count(gesture_id)
                        print(f"- {gesture_name}: {count} samples")
                else:
                    print("Chưa có cử chỉ nào được học!")
            
            elif choice == "5":
                print("Tạm biệt!")
                break
            
            else:
                print("Lựa chọn không hợp lệ!")

# Hàm chính
def main():
    """Hàm chính để chạy ứng dụng"""
    print("Khởi tạo AI nhận diện cử chỉ tay...")
    
    # Kiểm tra requirements
    try:
        import cv2
        import mediapipe
        import sklearn
        print("✓ Tất cả thư viện đã được cài đặt")
    except ImportError as e:
        print(f"✗ Thiếu thư viện: {e}")
        print("Vui lòng cài đặt: pip install opencv-python mediapipe scikit-learn")
        return
    
    # Khởi tạo và chạy ứng dụng
    ai = HandGestureAI()
    ai.show_menu()

if __name__ == "__main__":
    main()