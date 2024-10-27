// utils.go

package server

import (
	"encoding/json"
	"fmt"
	"net/http"
	"os"
)

// GetAccountIDFromAPIKey checks if an API key exists in PocketBase and returns the associated account ID.
func GetAccountIDFromAPIKey(apiKey string) (string, error) {
	client := &http.Client{}
	adminToken, err := GetAdminToken() // Retrieve valid token
	if err != nil {
		return "", err
	}

	url := fmt.Sprintf("%s/api/collections/api_keys/records?filter=key='%s'", os.Getenv("POCKETBASE_URL"), apiKey)
	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return "", err
	}

	req.Header.Set("Authorization", "Admin "+adminToken)

	resp, err := client.Do(req)
	if err != nil || resp.StatusCode != http.StatusOK {
		return "", fmt.Errorf("failed to validate API key with PocketBase")
	}
	defer resp.Body.Close()

	// Parse JSON response to extract account ID
	var result struct {
		Items []struct {
			Account string `json:"account"`
		} `json:"items"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return "", err
	}

	if len(result.Items) == 0 {
		return "", fmt.Errorf("API key not found")
	}

	return result.Items[0].Account, nil
}

// Fetch example content associated with a specific account ID
func FetchContentForAccount(accountID string) ([]map[string]interface{}, error) {
	client := &http.Client{}
	url := fmt.Sprintf("%s/api/collections/example_content/records?filter=account='%s'", os.Getenv("POCKETBASE_URL"), accountID)
	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return nil, err
	}

	resp, err := client.Do(req)
	if err != nil || resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("failed to fetch content")
	}
	defer resp.Body.Close()

	var content []map[string]interface{}
	if err := json.NewDecoder(resp.Body).Decode(&content); err != nil {
		return nil, err
	}

	return content, nil
}
