#!/bin/bash

npx drizzle-kit generate &>/dev/null

migration_files=$(ls ./drizzle/*.sql 2>/dev/null | sort) # Suppress ls errors if 'drizzle' is empty

if [[ -n "$migration_files" ]]; then # Check if there are any migration files
    for file in $migration_files; do
        migration_id=$(basename "$file" .sql)

        # Check if the migration has already been applied (correctly)
        migration_count=$(wrangler d1 execute polyglottos_db --command "SELECT COUNT(*) FROM _drizzle_migrations WHERE id = '$migration_id'" | grep -oE '^[0-9]+$')

        if [[ -z "$migration_count" || "$migration_count" -eq 0 ]]; then
            wrangler d1 execute polyglottos_db --file="$file" &>/dev/null

            wrangler d1 execute polyglottos_db --command "INSERT INTO _drizzle_migrations (id, hash, created_at) VALUES ('$migration_id', 'N/A', '$(date -Iseconds)')" &>/dev/null
            echo "Applied migration: $migration_id"
        else
            echo "Skipping already applied migration: $migration_id"
        fi
    done

    echo "Migrations complete."
else
    echo "No migrations to apply."
fi
