# Script to push all files to GitHub
Write-Host "Starting GitHub push process..."

# Create README.md if it doesn't exist
if (-not (Test-Path -Path "README.md")) {
    Write-Host "Creating README.md..."
    echo "# occ-world-final" >> README.md
}

# Initialize a new Git repository
Write-Host "Initializing Git repository..."
git init

# Add all files to the repository
Write-Host "Adding all files..."
git add .

# Commit all files
Write-Host "Committing files..."
git commit -m "Initial commit with all project files"

# Set the branch to main
Write-Host "Setting branch to main..."
git branch -M main

# Add the GitHub repository as remote
Write-Host "Adding remote repository..."
git remote add origin https://github.com/sinhabinayak2207/occ-world-final.git

# Push to the main branch
Write-Host "Pushing to GitHub..."
git push -u origin main

Write-Host "Push completed!"
