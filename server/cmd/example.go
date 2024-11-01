// cmd/example.go

package cmd

import (
	"bytes"
	"encoding/json"
	"fmt"
	"github.com/spf13/cobra"
	"github.com/spf13/viper"
	"net/http"
)

// exampleCmd represents the serve command
var exampleCmd = &cobra.Command{
	Use:   "example",
	Short: "",
	Long:  ``,
	Run: func(cmd *cobra.Command, args []string) {
		fmt.Println("Example")
		baseURL := viper.GetString("pocketbase.url")
		if baseURL == "" {
			fmt.Println("pocketbase.url is not set")
			return
		}

		// Ensure we don’t accidentally double up on slashes in the URL
		if baseURL[len(baseURL)-1:] == "/" {
			baseURL = baseURL[:len(baseURL)-1]
		}

		url := fmt.Sprintf("%s/api/admins/auth-with-password", baseURL)
		email := viper.GetString("pocketbase.email")
		password := viper.GetString("pocketbase.password")

		payload := map[string]string{
			"identity": email,
			"password": password,
		}
		jsonPayload, _ := json.Marshal(payload)

		req, err := http.NewRequest("POST", url, bytes.NewBuffer(jsonPayload))
		if err != nil {
			fmt.Printf("failed to create auth request: %v\n", err)
			return
		}
		req.Header.Set("Content-Type", "application/json")

		client := &http.Client{}
		resp, err := client.Do(req)
		if err != nil {
			fmt.Printf("failed to authenticate admin: %v\n", err)
			return
		}
		defer resp.Body.Close()

		if resp.StatusCode != http.StatusOK {
			fmt.Printf("authentication failed with status %d\n", resp.StatusCode)
			return
		}

		fmt.Println("Authenticated successfully")

		var result struct {
			Token string `json:"token"`
		}
		if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
			fmt.Printf("failed to decode token response: %v\n", err)
			return
		}

		fmt.Println("Admin token:", result.Token)

		// Use the token to retrieve API keys
		apiKeys, err := getAPIKeys(result.Token, baseURL)
		if err != nil {
			fmt.Println("Error retrieving API keys:", err)
			return
		}

		// Print API keys for demonstration
		fmt.Println("API Keys:")
		fmt.Println("API Keys:")
		for _, key := range apiKeys {
			fmt.Println("-----------")
			fmt.Printf("ID: %s\n", key["id"])
			fmt.Printf("Name: %s\n", key["name"])
			fmt.Printf("Account: %s\n", key["account"])
			fmt.Printf("Collection ID: %s\n", key["collectionId"])
			fmt.Printf("Collection Name: %s\n", key["collectionName"])
			fmt.Printf("Key: %s\n", key["key"])
			fmt.Printf("Created: %s\n", key["created"])
			fmt.Printf("Last Used: %s\n", key["last_used"])
			fmt.Printf("Revoked: %v\n", key["revoked"])
			fmt.Printf("Updated: %s\n", key["updated"])
		}
	},
}

func init() {
	// Register exampleCmd with the root command
	rootCmd.AddCommand(exampleCmd)
}

func getAPIKeys(adminToken, baseURL string) ([]map[string]interface{}, error) {
	url := fmt.Sprintf("%s/api/collections/api_keys/records", baseURL)
	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %v", err)
	}
	req.Header.Set("Authorization", adminToken)

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to retrieve API keys with status %d", resp.StatusCode)
	}
	defer resp.Body.Close()

	// Check the status code and output response body for debugging
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("failed to retrieve API keys with status %d", resp.StatusCode)
	}

	// For debugging: print the raw response body
	var debugBody map[string]interface{}
	if err := json.NewDecoder(resp.Body).Decode(&debugBody); err != nil {
		return nil, fmt.Errorf("failed to decode API keys response: %v", err)
	}
	fmt.Printf("Raw API keys response: %+v\n", debugBody)

	// Reset the response body and decode as expected
	resp.Body.Close()
	resp, _ = client.Do(req) // Re-request to avoid reading from a closed body

	// Decode response to actual result
	var result struct {
		Items []map[string]interface{} `json:"items"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return nil, fmt.Errorf("failed to decode API keys response: %v", err)
	}

	return result.Items, nil
}
