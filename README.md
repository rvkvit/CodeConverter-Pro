# Code Converter Pro - Windows Compatible

A locally-runnable full-stack code conversion platform for transforming test automation code to Robot Framework on Windows machines.

## Features

🔧 **Full-Stack Architecture**: React frontend with Node.js/Express backend
🤖 **AI-Powered Conversion**: Uses OpenAI GPT-4o for intelligent code analysis and conversion
🐙 **GitHub Integration**: Clone repositories, analyze code structure, and push converted code
🖥️ **Windows Compatible**: Designed specifically for Windows development environments
🎯 **Multi-Framework Support**: Convert from Java/Selenium, Python/PyTest, C#/NUnit, JavaScript/Cypress to Robot Framework

## Prerequisites

### Required Software (Windows)

1. **Node.js 20+** - Download from [nodejs.org](https://nodejs.org/)
2. **Git for Windows** - Download from [git-scm.com](https://git-scm.com/download/win)
3. **OpenAI API Key** - Get from [platform.openai.com](https://platform.openai.com/)

### Environment Setup

```bash
# Clone this repository
git clone <your-repo-url>
cd code-converter-pro

# Install dependencies
npm install

# Set up environment variables
# Create a .env file in the root directory with:
OPENAI_API_KEY=your_openai_api_key_here

# Start the development server
npm run dev
```

## Windows-Specific Features

- **Cross-platform file paths**: Handles Windows backslash paths correctly
- **Windows Git commands**: Uses proper Windows Git command syntax (`cd /d` for directory changes)
- **Temp directory handling**: Uses Windows TEMP/TMP environment variables for temporary file storage
- **Path normalization**: Converts Windows paths for Git operations

## Usage

1. **Start the Application**
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:5000`

2. **Connect Your Repository**
   - Enter your GitHub repository URL
   - Provide access token for private repositories
   - Validate and connect to the repository

3. **Configure Tech Stack**
   - Select your source language (Java, Python, C#, JavaScript)
   - Choose source framework (TestNG, JUnit, PyTest, Cypress, etc.)
   - Select target framework (Robot Framework with Browser Library)
   - Enter your OpenAI API key

4. **Convert Your Code**
   - AI analyzes your existing test automation code
   - Converts tests to Robot Framework format
   - Generates .robot files and resource libraries

5. **Review & Deploy**
   - Preview converted files
   - Download ZIP file of converted code
   - Deploy directly to GitHub repository

## Project Structure

```
code-converter-pro/
├── client/              # React frontend
│   ├── src/
│   │   ├── components/  # UI components
│   │   ├── hooks/       # React hooks
│   │   ├── lib/         # Utilities
│   │   └── pages/       # Route pages
├── server/              # Express backend
│   ├── services/        # Business logic
│   │   ├── github.ts    # Git operations
│   │   ├── openai.ts    # AI integration
│   │   └── converter.ts # Conversion orchestration
│   └── storage.ts       # Data storage
├── shared/              # Shared types/schemas
└── temp/                # Windows temp directory
```

## Tech Stack

**Frontend:**
- React 18 with TypeScript
- Tailwind CSS + shadcn/ui components
- TanStack Query for state management
- Wouter for routing

**Backend:**
- Node.js + Express
- TypeScript
- OpenAI GPT-4o integration
- GitPython equivalent operations

**Windows Compatibility:**
- Cross-platform file handling
- Windows path management
- Windows Git command support
- Windows temp directory usage

## Development

```bash
# Install dependencies
npm install

# Start development server (both frontend and backend)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Type checking
npm run check
```

## Environment Variables

Create a `.env` file in the root directory:

```env
OPENAI_API_KEY=your_openai_api_key_here
NODE_ENV=development
```

## Conversion Examples

### Java + Selenium + TestNG → Robot Framework + Browser Library

**Input (Java):**
```java
@Test
public void loginTest() {
    driver.get("https://example.com/login");
    driver.findElement(By.id("username")).sendKeys("testuser");
    driver.findElement(By.id("password")).sendKeys("password");
    driver.findElement(By.id("loginBtn")).click();
    Assert.assertTrue(driver.findElement(By.id("dashboard")).isDisplayed());
}
```

**Output (Robot Framework):**
```robot
*** Test Cases ***
Login Test
    Open Browser    https://example.com/login    chrome
    Fill Text       id=username    testuser
    Fill Text       id=password    password
    Click           id=loginBtn
    Get Element     id=dashboard    # Element should be visible
```

## Troubleshooting

### Windows-Specific Issues

1. **Git Path Issues**: Ensure Git is in your PATH environment variable
2. **Permission Errors**: Run terminal as administrator if needed
3. **Path Length**: Enable long path support in Windows if working with deep directory structures
4. **Antivirus**: Whitelist the temp directory if antivirus blocks file operations

### Common Issues

1. **OpenAI API Key**: Ensure your API key is valid and has sufficient credits
2. **GitHub Access**: Use personal access tokens for private repositories
3. **Node Version**: Requires Node.js 20+ for optimal performance

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes with Windows compatibility in mind
4. Test on Windows environment
5. Submit a pull request

## License

MIT License - feel free to use this for your own projects.

## Support

This is a Windows-compatible, locally-runnable version designed for development teams working on Windows environments. The application handles cross-platform differences automatically and provides a smooth experience on Windows machines.