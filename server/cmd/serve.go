// cmd/serve.go
package cmd

import (
	"fmt"
	"github.com/gin-gonic/gin"
	"github.com/spf13/cobra"
	"log"
)

var port string

// serveCmd represents the serve command
var serveCmd = &cobra.Command{
	Use:   "serve",
	Short: "Starts the HTTP server",
	Long:  `Starts an HTTP server to serve API requests`,
	Run: func(cmd *cobra.Command, args []string) {
		startServer()
	},
}

func init() {
	// Register serveCmd with the root command
	rootCmd.AddCommand(serveCmd)

	// Add flags for server configuration
	serveCmd.Flags().StringVarP(&port, "port", "p", "8090", "Port to run the HTTP server on")
}

// startServer initializes and runs the HTTP server
func startServer() {
	addr := ":" + port
	fmt.Printf("Starting server on port %s\n", port)

	router := gin.Default()

	// Health check route
	router.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"message": "Server is healthy",
		})
	})

	// Start the server
	if err := router.Run(addr); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
