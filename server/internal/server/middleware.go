// middleware.go

package server

import (
	"github.com/gin-gonic/gin"
	"net/http"
)

// ValidateAPIKey middleware to validate API key and set account ID in the context
func ValidateAPIKey(c *gin.Context) {
	apiKey := c.GetHeader("Authorization")

	// Check if API key exists and is valid
	accountID, err := getAccountIDFromAPIKey(apiKey)
	if apiKey == "" || err != nil || accountID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		c.Abort()
		return
	}

	// Set the account ID in the context from the validated API key
	c.Set("account_id", accountID)
	c.Next()
}
