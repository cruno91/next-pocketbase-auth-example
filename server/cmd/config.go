// cmd/serve.go

package cmd

import (
	"errors"
	"fmt"
	"github.com/spf13/cobra"
	"github.com/spf13/viper"
)

var (
	PbUrl   string
	PbPw    string
	PbEmail string
)

// configCmd represents the serve command
var configCmd = &cobra.Command{
	Use:   "config",
	Short: "",
	Long:  ``,
	Run: func(cmd *cobra.Command, args []string) {
		// Set Viper configuration values
		viper.Set("pocketbase.url", PbUrl)
		viper.Set("pocketbase.password", PbPw)
		viper.Set("pocketbase.email", PbEmail)

		// Try to write the configuration to an existing config file or create one if it doesn't exist
		if err := viper.SafeWriteConfig(); err != nil {
			// SafeWriteConfig returns an error if the file already exists, so we use WriteConfig instead
			var configFileAlreadyExistsError viper.ConfigFileAlreadyExistsError
			if errors.As(err, &configFileAlreadyExistsError) {
				err = viper.WriteConfig()
			}
		}

		// Write the changes to the configuration file
		err := viper.WriteConfig()
		if err != nil {
			fmt.Printf("Error writing config file: %v\n", err)
		} else {
			fmt.Println("Configuration saved successfully.")
		}
	},
}

func init() {
	// Register configCmd with the root command
	rootCmd.AddCommand(configCmd)

	// Add flags for configuration settings
	configCmd.Flags().StringVarP(&PbUrl, "url", "u", "http://db.authexample.lndo.site", "Pocketbase URL")
	configCmd.Flags().StringVarP(&PbPw, "password", "p", "In5ecureP4S123", "Pocketbase password")
	configCmd.Flags().StringVarP(&PbEmail, "email", "e", "admin@example.com", "Pocketbase email")

	// Bind Viper to each flag to allow loading them directly
	err := viper.BindPFlag("pocketbase.url", configCmd.Flags().Lookup("url"))
	if err != nil {
		return
	}
	err = viper.BindPFlag("pocketbase.password", configCmd.Flags().Lookup("password"))
	if err != nil {
		return
	}
	err = viper.BindPFlag("pocketbase.email", configCmd.Flags().Lookup("email"))
	if err != nil {
		return
	}
}
