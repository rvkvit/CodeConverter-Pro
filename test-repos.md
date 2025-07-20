# Test Repository URLs

Use these public GitHub repositories to test your code conversion platform:

## Java + Selenium + TestNG Examples
- `https://github.com/SeleniumHQ/selenium` - Official Selenium repository
- `https://github.com/testng-team/testng` - TestNG framework
- `https://github.com/microsoft/playwright-java` - Playwright Java examples

## Python + PyTest Examples  
- `https://github.com/pytest-dev/pytest` - PyTest framework
- `https://github.com/microsoft/playwright-python` - Playwright Python examples

## JavaScript/TypeScript + Cypress Examples
- `https://github.com/cypress-io/cypress` - Cypress framework
- `https://github.com/cypress-io/cypress-example-kitchensink` - Cypress examples

## Test with Different URL Formats
The validation now supports these formats:
- `https://github.com/owner/repo`
- `https://github.com/owner/repo.git`
- `github.com/owner/repo`
- `git@github.com:owner/repo.git`

## Testing Steps
1. Open the application at `http://localhost:5000`
2. Try validating one of the above repositories
3. If successful, proceed to configure the tech stack
4. Enter your OpenAI API key to test the conversion process

## Private Repository Testing
For private repositories, you'll need a GitHub Personal Access Token with `repo` permissions:
1. Go to GitHub Settings > Developer settings > Personal access tokens
2. Generate a new token with `repo` scope
3. Use it in the "Access Token" field when validating private repositories