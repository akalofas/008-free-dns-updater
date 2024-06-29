
# Dynamic DNS Updater Client for Cloudflare Zones

## Introduction

The Dynamic DNS Updater Client is a free, user-friendly application designed to update Cloudflare DNS records with your current WAN IP address. This application is especially useful for users with dynamic IP addresses, ensuring that their domain always points to their current IP.

## Why Use This Application?

For many years, users in need of dynamic DNS services relied on services like DynDNS or No-IP. However, these services have two major flaws:

1. **Cost**: These services have started charging for their offerings.
2. **IPv6 Support**: They often do not handle IPv6 updates properly, or they do not allow different hostnames for IPv4 and IPv6 addresses.

The Dynamic DNS Updater Client solves both of these problems:

- **Cost**: The application is completely free. You just need to have a domain, and if you don't have one, you can get one. Some domain TLDs like `.win` start from $4 per year.
- **IPv6 Support**: You can use different hostnames for IPv4 and IPv6, allowing you to freely choose different hostnames for each.

## Requirements

- A free Cloudflare account.
- The DNS zone of your domain must be managed by Cloudflare.

### Prerequisites

1. **Cloudflare Free Account**: You can sign up for a free Cloudflare account at [Cloudflare Signup](https://dash.cloudflare.com/sign-up).
2. **DNS Zone in Cloudflare**: Ensure that your domain’s DNS zone is managed by Cloudflare. This can be done by changing the nameservers to those provided by Cloudflare.

### Creating an API Token

To use the Dynamic DNS Updater Client, you need an API token from Cloudflare. Follow these steps to create an API token:

1. Log in to your Cloudflare account.
2. Navigate to the API Tokens section at [Cloudflare API Tokens](https://dash.cloudflare.com/profile/api-tokens).
3. Click on "Create Token".
4. Select the "Edit zone DNS" template.
5. Specify the necessary permissions:
   - Zone: DNS: Edit
6. Choose the account and zone for which this token will be valid.
7. Click "Continue to summary" and then "Create Token".
8. Copy the generated token and keep it secure. You will input this token in the settings dialog under the Common tab of the application.

### Finding Your Zone ID

The Zone ID is a unique identifier for your domain’s DNS zone in Cloudflare. To find your Zone ID:

1. Log in to your Cloudflare account.
2. Navigate to the dashboard of the domain you want to manage.
3. On the Overview page, you will find the Zone ID listed under the "API" section. You will input this Zone ID in the settings dialog under the Common tab of the application.

### Creating DNS Records

Ensure you have an A (IPv4) and/or AAAA (IPv6) record set up in Cloudflare for your domain. Follow these steps to create these records:

1. Log in to your Cloudflare account.
2. Navigate to the DNS settings of the domain you want to manage.
3. Click on "Add Record".
4. Select the record type (A for IPv4, AAAA for IPv6).
5. Enter the hostname you want to use (e.g., `example.com` for IPv4, `ipv6.example.com` for IPv6).
6. For the IP address, you can use placeholder values such as `1.1.1.1` for IPv4 or `fe80::1` for IPv6. These will be updated by the application later.
7. Save the DNS record.

You can find the record IDs by using the "Get Record IDs" button in the application.

## Application Setup

### Necessary Packages

The application uses the following npm packages to function correctly:

- `axios`: For making HTTP requests.
- `electron`: For building the desktop application.

### Settings

For developers, create a `settings.json` file in the root folder of the project from `settings-example.json` that is in the GitHub repository. Here is an example `settings.json`:

```json
{
  "updateInterval": "YOUR_UPDATE_INTERVAL",
  "ipv4": {
    "enabled": true,
    "dnsRecord": "YOUR_IPV4_DNS_RECORD",
    "recordId": "YOUR_IPV4_RECORD_ID"
  },
  "ipv6": {
    "enabled": false,
    "dnsRecord": "YOUR_IPV6_DNS_RECORD",
    "recordId": "YOUR_IPV6_RECORD_ID"
  },
  "apiToken": "YOUR_API_TOKEN",
  "zoneId": "YOUR_ZONE_ID"
}
```

For those building the app or the .exe, the `settings.json` will be created in the user's data directory automatically.

### Building the Application

#### For dev in IDE

1. Ensure all dependencies are installed:

   ```sh
   npm install
   ```
2. Create a .env file in the root folder of the project. And add the NODE_ENV=dev

   ```sh
   touch .env
   echo -e "# dev for development and production for production\nNODE_ENV=dev" > .env
   ```
3. Run the application:

   ```sh
   npm start
   ```

This will run the application, don't forget that you will need to have the file named settings.json in the root folder.

#### For macOS

1. Ensure all dependencies are installed:

   ```sh
   npm install
   ```
2. Build the Electron application:

   ```sh
   npm run build-mac
   ```

This will generate the application file that can be run on macOS.

#### For Windows

1. Ensure all dependencies are installed:

   ```sh
   npm install
   ```
2. Build the Electron application:

   ```sh
   npm run build-win
   ```

This will generate the executable file that can be run on Windows.

### Run on Login

#### For macOS

You can enable the application to load on startup in two ways:

1. **Through Terminal**:

   - Open Terminal.
   - Use the following command to add the application to startup items:
     ```sh
     osascript -e 'tell application "System Events" to make login item at end with properties {path:"/path/to/your/app", hidden:false}'
     ```

     Replace `"/path/to/your/app"` with the actual path to your application.
2. **Through macOS Interface (macOS 12+)**:

   - Open "System Settings" from the Apple menu.
   - Navigate to "General" > "Login Items".
   - Click the "+" button under "Open at Login".
   - Browse to your application and add it to the list.

##### Security on First Run

When you first run the application, macOS might flag it as an untrusted application. To allow the app to run:

1. Open "System Preferences".
2. Navigate to "Security & Privacy" > "General".
3. You will see a message indicating that the app was blocked. Click "Open Anyway".
4. Confirm that you want to open the application.

To run the application in the background:

1. Open the app.
2. Right-click on the application icon in the Dock.
3. Select "Options".
4. Check "Open at Login".
5. Ensure "Keep in Dock" is unchecked if you do not want the app to stay in the Dock.

#### For Windows

1. **Create .exe File**:

   ```sh
   npm run build-win
   ```
2. **Set Up App to Run on Login**:

   - Open Task Scheduler.
   - Create a new task.
   - Under the `Triggers` tab, set to run at login.
   - Under the `Actions` tab, set to start the application.

## File Structure, Usage, and Logic

### File Structure

The application consists of several key files:

1. **`package.json`**: Defines the project and its dependencies.
2. **`settings.json`**: Stores the application settings such as API token, Zone ID, update interval, and DNS records.
3. **`main.js`**: The main Electron application script, handling the tray icon, settings window, and DNS updates.
4. **Utility Files**:
   - `utils/getIPs.js`: Fetches the current WAN IP address.
   - `utils/config.js`: Manages loading and saving settings.
   - `utils/api/fetchDNSRecords.js`: Fetches DNS records from Cloudflare.
   - `utils/api/getCurrentDNSIP.js`: Gets the current DNS IP from Cloudflare.
   - `utils/api/updateDNSRecord.js`: Updates the DNS record in Cloudflare.
   - `utils/checkSettings.js`: Validates the application settings.
5. **Settings UI Files**:
   - `settings/settings.html`: The HTML for the settings window.
   - `settings/settings.js`: The JavaScript handling settings logic.
   - `settings/settingsPreload.js`: Preload script for settings window IPC.
   - `settings/style.css`: Styles for the settings window.
6. **Record Selection Files**:
   - `recordSelect/recordSelect.html`: The HTML for selecting DNS records.
   - `recordSelect/recordSelect.js`: The JavaScript handling record selection logic.
   - `recordSelect/recordSelectPreload.js`: Preload script for record selection IPC.
   - `recordSelect/style.css`: Styles for the record selection window.

### Usage and Logic

#### Technologies Used

1. **Electron**: Used to build the desktop application. Electron allows for the creation of native applications using web technologies like HTML, CSS, and JavaScript.
2. **Node.js**: Provides the runtime environment for executing JavaScript code server-side.
3. **Axios**: A promise-based HTTP client used for making API requests to Cloudflare.
4. **HTML/CSS**: Used for creating the user interface of the settings and record selection windows.

#### Logic and File Interactions

1. **Main Application Logic (`main.js`)**

   - Initializes the application, creates the tray icon, and handles settings and DNS updates.
   - Manages IPC (Inter-Process Communication) between the main process and renderer processes.
   - Schedules periodic DNS updates based on the specified interval.
2. **Configuration Management (`utils/config.js`)**

- Manages loading and saving settings to and from the `settings.json` file.
- Ensures that user configurations are persistent across application restarts.

3. **Settings Validation (`utils/checkSettings.js`)**

   - Validates the application settings to ensure all required configurations are present and correctly formatted.
   - Returns a response indicating the validity of common, IPv4, and IPv6 settings.
4. **IP Retrieval (`utils/getIPs.js`)**

   - Contains functions to fetch the current WAN IP addresses for both IPv4 and IPv6 using public APIs.
   - Includes validation and retry mechanisms to handle network issues.
5. **DNS API Interactions**

   - **Fetching DNS Records (`utils/api/fetchDNSRecords.js`)**: Retrieves the current DNS records from Cloudflare using the provided API token and Zone ID.
   - **Getting Current DNS IP (`utils/api/getCurrentDNSIP.js`)**: Gets the current IP address for a specific DNS record from Cloudflare.
   - **Updating DNS Records (`utils/api/updateDNSRecord.js`)**: Updates a DNS record in Cloudflare with the new IP address if it has changed.
6. **Settings UI Logic (`settings/settings.html`, `settings/settings.js`, `settings/settingsPreload.js`, `settings/style.css`)**

   - **HTML**: Defines the structure of the settings window.
   - **JavaScript**: Handles loading and saving settings, validating user input, and managing IPC communication.
   - **Preload Script**: Ensures secure IPC communication between the main process and the renderer process.
   - **CSS**: Provides styling for the settings window to ensure a user-friendly interface.
7. **Record Selection UI Logic (`recordSelect/recordSelect.html`, `recordSelect/recordSelect.js`, `recordSelect/recordSelectPreload.js`, `recordSelect/style.css`)**

   - **HTML**: Defines the structure of the DNS record selection window.
   - **JavaScript**: Handles the logic for selecting a DNS record from the list of fetched records.
   - **Preload Script**: Ensures secure IPC communication between the main process and the renderer process.
   - **CSS**: Provides styling for the record selection window to ensure a user-friendly interface.

### Logic Flow

1. **Initialization**:

   - The application starts by initializing in `main.js`, where the tray icon is created and settings are loaded.
   - `checkSettings.js` validates the loaded settings to ensure all required configurations are present.
2. **DNS Update Cycle**:

   - A scheduled interval is set up to periodically check and update DNS records.
   - `getIPs.js` retrieves the current WAN IP addresses.
   - `getCurrentDNSIP.js` and `updateDNSRecord.js` interact with the Cloudflare API to update DNS records if the WAN IP has changed.
3. **Settings Management**:

   - Users can open the settings window to configure the application.
   - Changes are handled by `settings.js` and saved using `config.js`.
   - Validity of the settings is rechecked, and the application state is updated accordingly.
4. **Record Selection**:

   - Users can select DNS records from the fetched list through the record selection window.
   - `recordSelect.js` manages the selection process and updates the settings with the chosen record.

By modularizing the logic and separating concerns across different files, the application ensures maintainability, scalability, and ease of updates.

## Conclusion

The Dynamic DNS Updater Client for Cloudflare is a free, convenient tool to ensure your domain always points to your current IP address, even if it changes frequently. By following this documentation, you can easily set up and configure the application to work with your Cloudflare account, keeping your DNS records up-to-date with minimal effort.

## GitHub Repository

For more details, support, or to report issues, visit the [GitHub repository](https://github.com/akalofas/008-dns-updater.git).

## Contact

If you need support or want to report bugs, feel free to open an issue on GitHub or contact me. This app is free to use.

---

### Code Review and Best Practices

The current code adheres to best practices:

- **Modularization**: The code is well-modularized, separating concerns across different files.
- **Error Handling**: Functions handle errors gracefully, providing useful error messages.
- **Configuration Management**: Configuration is managed through a `settings.json` file, with functions provided to load and save settings.
- **Code Redundancy**: There are no redundant or duplicate code blocks.
- **IPC Security**: Secure IPC communication is implemented between the main process and renderer processes.

The application follows best practices in terms of structure, error handling, and configuration management. The code is clean and well-organized, ensuring maintainability and ease of updates.
