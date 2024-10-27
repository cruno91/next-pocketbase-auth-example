// handlers.go

package server

import (
	"github.com/gin-gonic/gin"
	"net/http"
)

// GetContentHandler serves content associated with the authorized account
func GetContentHandler(c *gin.Context) {
	accountID, exists := c.Get("account_id")
	if !exists {
		c.JSON(http.StatusForbidden, gin.H{"error": "Access denied"})
		return
	}

	// Fetch example content specific to the account ID
	content, err := fetchContentForAccount(accountID.(string)) // Implemented in utils.go
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch content"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"content": content})
}
