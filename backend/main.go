package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"strings"

	_ "github.com/lib/pq"
)

type Response struct {
	Message string `json:"message"`
	Status  string `json:"status"`
}

type SignupRequest struct {
	Name     string `json:"name"`
	Email    string `json:"email"`
	Password string `json:"password"`
}

type SignupResponse struct {
	Message string `json:"message"`
	Status  string `json:"status"`
}

type loginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type loginResponse struct {
	Message string `json:"message"`
	Status  string `json:"status"`
}

type User struct {
	ID       int    `json:"id"`
	Name     string `json:"name"`
	Email    string `json:"email"`
	Password string `json:"password"`
}

func healthHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	response := Response{
		Message: "Backend is running",
		Status:  "success",
	}
	json.NewEncoder(w).Encode(response)
}

func signupHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	if r.Method != http.MethodPost {
		w.WriteHeader(http.StatusMethodNotAllowed)
		json.NewEncoder(w).Encode(SignupResponse{
			Message: "Only Post Method is allowed",
			Status:  "error",
		})
		return
	}
	var user SignupRequest
	err := json.NewDecoder(r.Body).Decode(&user)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(SignupResponse{
			Message: "Invalid request body",
			Status:  "error",
		})
		return
	}
	user.Name = strings.TrimSpace(user.Name)
	user.Email = strings.TrimSpace(user.Email)
	user.Password = strings.TrimSpace(user.Password)

	if user.Name == "" || user.Email == "" || user.Password == "" {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(SignupResponse{
			Message: "All fields are required",
			Status:  "error",
		})
		return
	}
	query := `INSERT INTO users (name, email, password) VALUES ($1, $2, $3)`

	_, err = db.Exec(query, user.Name, user.Email, user.Password)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(SignupResponse{
			Message: "Email already exists or database error",
			Status:  "error",
		})
		return
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(SignupResponse{
		Message: "User signup successful",
		Status:  "success",
	})
}

func loginHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	if r.Method != http.MethodPost {
		w.WriteHeader(http.StatusMethodNotAllowed)
		json.NewEncoder(w).Encode(loginResponse{
			Message: "Only POST method allowed",
			Status:  "error",
		})
		return
	}

	var loginData loginRequest
	err := json.NewDecoder(r.Body).Decode(&loginData)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(loginResponse{
			Message: "Invalid request body",
			Status:  "error",
		})
		return
	}
	loginData.Email = strings.TrimSpace(loginData.Email)
	loginData.Password = strings.TrimSpace(loginData.Password)

	if loginData.Email == "" || loginData.Password == "" {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(loginResponse{
			Message: "Email and password required",
			Status:  "error",
		})
		return
	}

	var dbUser User
	var dbPassword string
	query := `SELECT id, name, email, password FROM users WHERE email=$1`

	err = db.QueryRow(query, loginData.Email).Scan(
		&dbUser.ID,
		&dbUser.Name,
		&dbUser.Email,
		&dbPassword,
	)

	if err != nil {
		w.WriteHeader(http.StatusUnauthorized)
		json.NewEncoder(w).Encode(loginResponse{
			Message: "Invalid email or password",
			Status:  "error",
		})
		return
	}

	if dbPassword != loginData.Password {
		w.WriteHeader(http.StatusUnauthorized)
		json.NewEncoder(w).Encode(loginResponse{
			Message: "Invalid email or password",
			Status:  "error",
		})
		return
	}

	json.NewEncoder(w).Encode(loginResponse{
		Message: "Login successful",
		Status:  "success",
	})
}

func usersHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	if r.Method != http.MethodGet {
		w.WriteHeader(http.StatusMethodNotAllowed)
		json.NewEncoder(w).Encode(Response{
			Message: "Only GET method allowed",
			Status:  "error",
		})
		return
	}

	query := `SELECT id, name, email FROM users`
	rows, err := db.Query(query)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(Response{
			Message: "Database error",
			Status:  "error",
		})
		return
	}
	defer rows.Close()

	var users []User
	for rows.Next() {
		var user User
		err := rows.Scan(&user.ID, &user.Name, &user.Email)
		if err != nil {
			continue
		}
		users = append(users, user)
	}
	json.NewEncoder(w).Encode(users)
}

var db *sql.DB

func getEnv(key, fallback string) string {
	val := os.Getenv(key)
	if val == "" {
		return fallback
	}
	return val
}

func connectDB() {
	host := getEnv("DB_HOST", "localhost")
	port := getEnv("DB_PORT", "5432")
	user := getEnv("DB_USER", "postgres")
	password := getEnv("DB_PASSWORD", "postgres")
	dbname := getEnv("DB_NAME", "student_api")

	connStr := fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=disable",
		host, port, user, password, dbname)

	var err error
	db, err = sql.Open("postgres", connStr)
	if err != nil {
		log.Fatal(err)
	}

	err = db.Ping()
	if err != nil {
		log.Fatal(err)
	}
	log.Println("PostgreSQL connected successfully")
}

func updateUser(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	if r.Method != http.MethodPut {
		w.WriteHeader(http.StatusMethodNotAllowed)
		json.NewEncoder(w).Encode(map[string]string{"message": "Only PUT method allowed", "status": "error"})
		return
	}

	id := strings.TrimPrefix(r.URL.Path, "/api/users/")
	var user User
	err := json.NewDecoder(r.Body).Decode(&user)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"message": "Invalid request body", "status": "error"})
		return
	}

	query := `UPDATE users SET name=$1, email=$2, password=$3 WHERE id=$4`
	_, err = db.Exec(query, user.Name, user.Email, user.Password, id)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"message": "Failed to update user", "status": "error"})
		return
	}

	json.NewEncoder(w).Encode(map[string]string{"message": "User updated successfully", "status": "success"})
}

func deleteUser(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	id := strings.TrimPrefix(r.URL.Path, "/api/users/")

	if id == "" {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"message": "User id is required"})
		return
	}

	query := `DELETE FROM users WHERE id=$1`
	result, err := db.Exec(query, id)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"message": "Failed to delete user"})
		return
	}

	rowsAffected, _ := result.RowsAffected()
	if rowsAffected == 0 {
		w.WriteHeader(http.StatusNotFound)
		json.NewEncoder(w).Encode(map[string]string{"message": "User not found"})
		return
	}

	json.NewEncoder(w).Encode(map[string]string{"message": "User deleted successfully"})
}

func userByIDHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method == http.MethodPut {
		updateUser(w, r)
		return
	}
	if r.Method == http.MethodDelete {
		deleteUser(w, r)
		return
	}
	w.WriteHeader(http.StatusMethodNotAllowed)
	json.NewEncoder(w).Encode(map[string]string{"message": "Method not allowed"})
}

// OPTIMIZED: Helper function to get origins map dynamically or fallback safely
func isOriginAllowed(origin string) bool {
	originsStr := os.Getenv("ALLOWED_ORIGINS")
	if originsStr == "" {
		// Fallback hardcoded values agar env set nahi hai
		return origin == "http://localhost:5173" || origin == "http://65.2.167.217:5173"
	}

	origins := strings.Split(originsStr, ",")
	for _, o := range origins {
		if strings.TrimSpace(o) == origin {
			return true
		}
	}
	return false
}

// FIXED: Cleaned Middleware configuration
func enableCORS(handler http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		origin := r.Header.Get("Origin")

		// Agar dynamically allow match karta hai toh use exact pass karein
		if origin != "" && isOriginAllowed(origin) {
			w.Header().Set("Access-Control-Allow-Origin", origin)
			w.Header().Set("Access-Control-Allow-Credentials", "true")
		} else if origin != "" {
			// Safe fallback: Agar dynamic fallback kaam na kare, toh explicitly deployment URL allow karein
			w.Header().Set("Access-Control-Allow-Origin", "http://65.2.167.217:5173")
			w.Header().Set("Access-Control-Allow-Credentials", "true")
		}

		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With")

		// CORS preflight rules handle karne ke liye
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusOK)
			return
		}

		handler(w, r)
	}
}

func main() {
	connectDB()

	http.HandleFunc("/api/health", enableCORS(healthHandler))
	http.HandleFunc("/api/signup", enableCORS(signupHandler))
	http.HandleFunc("/api/login", enableCORS(loginHandler))
	http.HandleFunc("/api/create-user", enableCORS(signupHandler))
	http.HandleFunc("/api/users", enableCORS(usersHandler))
	http.HandleFunc("/api/users/", enableCORS(userByIDHandler))

	log.Println("Server running on port 8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}
