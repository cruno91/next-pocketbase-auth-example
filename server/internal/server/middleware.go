// middleware.go

package server

import (
	"fmt"
	"github.com/gin-gonic/gin"
	"net/http"
)

// ValidateAPIKey Middleware to validate API key and set account ID in the context
func ValidateAPIKey(c *gin.Context) {
	apiKey := c.GetHeader("Authorization")
	if apiKey == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		c.Abort()
		return
	}

	// Check if the API key is valid and get the associated account ID
	accountID, err := GetAccountIDFromAPIKey(apiKey)
	if err != nil {
		fmt.Println("Unauthorized access:", err)
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		c.Abort()
		return
	}

	// Set the account ID in the context if the API key is valid
	c.Set("account_id", accountID)
	c.Next()
}
