#!/usr/bin/env bash
# Pokreće samo privremenu lokalnu bazu; ne čita .env niti se spaja na Supabase.
set -euo pipefail
inbox_test_dir=$(mktemp -d /private/tmp/costay-inbox-rls.XXXXXX)
inbox_test_script_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)
initdb -D "$inbox_test_dir/data" -U postgres -A trust --no-locale > "$inbox_test_dir/init.log"
trap 'pg_ctl -D "$inbox_test_dir/data" -m fast -w stop > /dev/null 2>&1 || true' EXIT
pg_ctl -D "$inbox_test_dir/data" -l "$inbox_test_dir/postgres.log" -o "-k $inbox_test_dir -c listen_addresses=''" -w start > /dev/null
psql -X -h "$inbox_test_dir" -U postgres -d postgres -v ON_ERROR_STOP=1 -f "$inbox_test_script_dir/inbox_rls.sql"
