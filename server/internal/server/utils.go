// utils.go

package server

import (
	"encoding/json"
	"fmt"
	"github.com/spf13/viper"
	"golang.org/x/crypto/bcrypt"
	"net/http"
)

type ContentItem struct {
	Created     string `json:"created"`
	Description string `json:"description"`
	ID          string `json:"id"`
	Title       string `json:"title"`
	Updated     string `json:"updated"`
}

func VerifyApiKey(rawApiKey string, hashedApiKey string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hashedApiKey), []byte(rawApiKey))
	return err == nil
}

func GetUserFromEmail(email string) (string, error) {
	client := &http.Client{}
	adminToken, err := GetAdminToken() // Retrieve valid token
	if err != nil {
		return "", err
	}

	url := fmt.Sprintf("%s/api/collections/users/records?filter=email='%s'", viper.GetString("pocketbase.url"), email)
	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return "", err
	}

	req.Header.Set("Authorization", adminToken)

	resp, err := client.Do(req)
	if err != nil || resp.StatusCode != http.StatusOK {
		return "", fmt.Errorf("failed to get account from email with PocketBase")
	}
	defer resp.Body.Close()

	// Parse JSON response to extract account ID
	var result struct {
		Items []struct {
			Account string `json:"id"`
		} `json:"items"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return "", err
	}

	if len(result.Items) == 0 {
		return "", fmt.Errorf("User not found")
	}

	return result.Items[0].Account, nil
}

// GetAccountIDFromAPIKey checks if an API key exists in PocketBase and returns the associated account ID.
func GetAccountIDFromAPIKey(apiKey string, email string) (string, error) {
	account, _ := GetUserFromEmail(email)

	client := &http.Client{}
	adminToken, err := GetAdminToken() // Retrieve valid token
	if err != nil {
		return "", err
	}

	keysUrl := fmt.Sprintf("%s/api/collections/api_keys/records?filter=account='%s'", viper.GetString("pocketbase.url"), account)
	req, err := http.NewRequest("GET", keysUrl, nil)
	if err != nil {
		return "", err
	}

	req.Header.Set("Authorization", adminToken)

	resp, err := client.Do(req)
	if err != nil || resp.StatusCode != http.StatusOK {
		return "", fmt.Errorf("failed to query PocketBase for API keys for user")
	}
	defer resp.Body.Close()

	// Parse JSON response to extract account ID
	var result struct {
		Items []struct {
			HashedKey string `json:"key"`
		} `json:"items"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return "", err
	}

	if len(result.Items) == 0 {
		return "", fmt.Errorf("no API keys found for user")
	}

	for _, r := range result.Items {
		if VerifyApiKey(apiKey[7:], r.HashedKey) {
			return account, nil
		}
	}

	return "", fmt.Errorf("API key did not match keys for given account")
}

// Fetch example content associated with a specific account ID
func FetchContentForAccount(accountID string) ([]ContentItem, error) {
	client := &http.Client{}
	adminToken, err := GetAdminToken() // Retrieve valid token
	if err != nil {
		return nil, err
	}

	url := fmt.Sprintf("%s/api/collections/example_content/records?filter=account='%s'", viper.GetString("pocketbase.url"), accountID)
	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return nil, err
	}

	req.Header.Set("Authorization", adminToken)

	resp, err := client.Do(req)
	if err != nil || resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("failed to fetch content")
	}
	defer resp.Body.Close()

	var result struct {
		Items []ContentItem `json:"items"`
	}

	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return nil, err
	}

	return result.Items, nil
}
