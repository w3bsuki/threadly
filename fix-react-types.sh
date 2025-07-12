#!/bin/bash

# Fix React type inference issues in all async components

echo "Fixing React type inference issues..."

# Files that need fixing
files=(
  "apps/app/app/[locale]/layout.tsx"
  "apps/app/app/[locale]/(authenticated)/dashboard/page.tsx"
  "apps/app/app/[locale]/(authenticated)/onboarding/page.tsx"
  "apps/app/app/[locale]/(authenticated)/selling/test-minimal/page.tsx"
  "apps/app/app/[locale]/page.tsx"
  "apps/app/app/[locale]/(authenticated)/selling/onboarding/page.tsx"
  "apps/app/app/[locale]/(authenticated)/selling/page.tsx"
  "apps/app/app/[locale]/(authenticated)/admin/products/page.tsx"
  "apps/app/app/[locale]/(authenticated)/admin/reports/page.tsx"
  "apps/app/app/[locale]/(authenticated)/admin/users/page.tsx"
)

for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    echo "Processing: $file"
    
    # Extract function name
    func_name=$(grep -oP 'export default async function \K\w+' "$file" | head -1)
    
    if [ ! -z "$func_name" ]; then
      echo "  Found function: $func_name"
      
      # Replace function declaration
      sed -i "s/export default async function ${func_name}(/const ${func_name}: React.FC<{ params: Promise<{ locale: string }> }> = async (/" "$file"
      
      # Add export at the end
      if ! grep -q "export default ${func_name};" "$file"; then
        # Find the last closing brace and add export after it
        sed -i '/^}$/,$ {/^}$/ s/$/\n\nexport default '"${func_name}"';/; t; b}' "$file"
      fi
    fi
  fi
done

echo "Done!"