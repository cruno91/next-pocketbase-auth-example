// token_manager.go
package server

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"sync"
	"time"
)

var adminToken string
var tokenMutex sync.Mutex

// authenticateAdmin authenticates with PocketBase to retrieve a new admin token.
func authenticateAdmin() (string, error) {
	url := os.Getenv("POCKETBASE_URL") + "/api/admins/auth-with-password"
	email := os.Getenv("POCKETBASE_ADMIN")
	password := os.Getenv("POCKETBASE_ADMIN_PASSWORD")

	// Prepare JSON payload
	payload := map[string]string{
		"identity": email,
		"password": password,
	}
	jsonPayload, _ := json.Marshal(payload)

	req, err := http.NewRequest("POST", url, bytes.NewBuffer(jsonPayload))
	if err != nil {
		return "", fmt.Errorf("failed to create auth request: %v", err)
	}
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return "", fmt.Errorf("failed to authenticate admin: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return "", fmt.Errorf("authentication failed with status %d", resp.StatusCode)
	}

	// Parse token from response
	var result struct {
		Token string `json:"token"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return "", fmt.Errorf("failed to decode token response: %v", err)
	}

	return result.Token, nil
}

// GetAdminToken retrieves a valid admin token, refreshing it if necessary.
func GetAdminToken() (string, error) {
	tokenMutex.Lock()
	defer tokenMutex.Unlock()

	if adminToken == "" {
		newToken, err := authenticateAdmin()
		if err != nil {
			return "", err
		}
		adminToken = newToken
		go refreshTokenOnExpiry() // Schedule refresh for when the token expires
	}
	return adminToken, nil
}

// refreshTokenOnExpiry refreshes the token before it expires.
func refreshTokenOnExpiry() {
	// This should be replaced by an actual check for token validity.
	time.Sleep(24 * time.Hour) // Adjust based on PocketBase token lifetime.

	tokenMutex.Lock()
	defer tokenMutex.Unlock()

	// Refresh the token
	newToken, err := authenticateAdmin()
	if err != nil {
		fmt.Println("Failed to refresh token:", err)
		return
	}
	adminToken = newToken
}
