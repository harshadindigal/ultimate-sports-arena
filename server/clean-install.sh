
#!/bin/bash
echo "Cleaning node_modules..."
rm -rf node_modules
echo "Reinstalling dependencies..."
npm install --no-optional
echo "Dependencies reinstalled without optional packages"
