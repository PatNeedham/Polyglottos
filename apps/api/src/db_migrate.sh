#!/bin/bash
set -e

# Source environment variables from the local .env file if exists
if [ -f "$(dirname "$0")/../.env" ]; then
    echo "Sourcing environment variables..."
    source "$(dirname "$0")/../.env"
fi

if [ -z "$D1_DATABASE_ID" ]; then
    echo "Error: D1_DATABASE_ID is not set. Please ensure your .env file defines D1_DATABASE_ID."
    exit 1
fi

echo "Generating wrangler.toml..."
envsubst < "$(dirname "$0")/../wrangler.toml.example" > "$(dirname "$0")/../wrangler.toml"

echo "REMOTE_ENV value: $REMOTE_ENV"

npx drizzle-kit generate &>/dev/null

migration_files=$(ls ./drizzle/*.sql 2>/dev/null | sort)

if [ "$REMOTE_ENV" = "true" ]; then
    echo "Running in remote mode"
    remote_flag="--remote"
else
    echo "Running in local mode"
    remote_flag=""
fi

create_migrations_table() {
    local cmd="CREATE TABLE IF NOT EXISTS _drizzle_migrations (id TEXT PRIMARY KEY, hash TEXT NOT NULL, created_at TEXT NOT NULL)"
    if [ "$remote_flag" = "--remote" ]; then
        echo "Creating migrations table in remote database"
        wrangler d1 execute DB $remote_flag --command "$cmd"
    else
        echo "Creating migrations table in local database"
        wrangler d1 execute DB --command "$cmd"
    fi
}

create_migrations_table

if [ -n "$migration_files" ]; then
    for file in $migration_files; do
        migration_id=$(basename "$file" .sql)
        echo "Processing migration: $migration_id"

        if [ "$remote_flag" = "--remote" ]; then
            echo "Checking remote migration status"
            migration_output=$(wrangler d1 execute DB $remote_flag --command "SELECT COUNT(*) AS count FROM _drizzle_migrations WHERE id = '$migration_id'" --json)
            echo "Raw migration query output for $migration_id: $migration_output"
            migration_count=$(echo "$migration_output" | jq -r '.[0].results[0].count')
            echo "Migration count for $migration_id: '$migration_count'"
            if [ -z "$migration_count" ] || [ "$migration_count" -eq 0 ]; then
                echo "Applying migration to remote database"
                if wrangler d1 execute DB $remote_flag --file="$file"; then
                    wrangler d1 execute DB $remote_flag --command "INSERT INTO _drizzle_migrations (id, hash, created_at) VALUES ('$migration_id', 'N/A', '$(date -Iseconds)')"
                    echo "Successfully applied migration: $migration_id"
                else
                    echo "Failed to apply migration: $migration_id"
                    exit 1
                fi
            else
                echo "Skipping already applied migration: $migration_id"
            fi
        else
            echo "Checking local migration status"
            migration_output=$(wrangler d1 execute DB --command "SELECT COUNT(*) AS count FROM _drizzle_migrations WHERE id = '$migration_id'" --json)
            echo "Raw migration query output for $migration_id: $migration_output"
            migration_count=$(echo "$migration_output" | jq -r '.[0].results[0].count')
            echo "Migration count for $migration_id: '$migration_count'"
            if [ -z "$migration_count" ] || [ "$migration_count" -eq 0 ]; then
                echo "Applying migration to local database"
                if wrangler d1 execute DB --file="$file"; then
                    wrangler d1 execute DB --command "INSERT INTO _drizzle_migrations (id, hash, created_at) VALUES ('$migration_id', 'N/A', '$(date -Iseconds)')"
                    echo "Successfully applied migration: $migration_id"
                else
                    echo "Failed to apply migration: $migration_id"
                    exit 1
                fi
            else
                echo "Skipping already applied migration: $migration_id"
            fi
        fi
    done

    echo "Migrations complete."
else
    echo "No migrations to apply."
fi
