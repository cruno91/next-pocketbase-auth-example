// utils.go

package server

import (
	"encoding/json"
	"fmt"
	"net/http"
	"os"
)

// Validate API key by checking it against stored keys in PocketBase
func isValidAPIKey(apiKey string) bool {
	accountID, err := getAccountIDFromAPIKey(apiKey)
	return err == nil && accountID != ""
}

// Get account ID associated with the API key
func getAccountIDFromAPIKey(apiKey string) (string, error) {
	client := &http.Client{}
	req, err := http.NewRequest("GET", os.Getenv("POCKETBASE_URL")+"/api/collections/api_keys/records", nil)
	if err != nil {
		return "", err
	}

	req.Header.Set("Authorization", "Bearer "+apiKey)

	resp, err := client.Do(req)
	if err != nil || resp.StatusCode != http.StatusOK {
		return "", fmt.Errorf("failed to validate API key")
	}
	defer resp.Body.Close()

	// Parse JSON response to extract account ID
	var result struct {
		Account string `json:"account"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return "", err
	}
	return result.Account, nil
}

// Fetch example content associated with a specific account ID
func fetchContentForAccount(accountID string) ([]map[string]interface{}, error) {
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
