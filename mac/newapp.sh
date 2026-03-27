#!/bin/bash

# bash ~/repos/dcep93.github.io/mac/newapp.sh

set -xeuo pipefail

yes n | npm create vite@latest app -- --template react-ts || true
mkdir -p .github/workflows
cat >.github/workflows/build_react.sh <<'EOF'
#!/bin/bash

set -euo pipefail

# npm create vite@latest app -- --template react-ts

cd app
npm install
yarn build
rm -rf node_modules
EOF
cat >.github/workflows/deploy_to_firebase.sh <<'EOF'
#!/bin/bash

set -euo pipefail

SA_KEY="$1"

cd app

export GOOGLE_APPLICATION_CREDENTIALS="gac.json"
echo "$SA_KEY" >"$GOOGLE_APPLICATION_CREDENTIALS"
npm install -g firebase-tools
gcloud auth activate-service-account --key-file="$GOOGLE_APPLICATION_CREDENTIALS"
project_id="$(cat $GOOGLE_APPLICATION_CREDENTIALS | jq -r .project_id)"

cat <<EOF2 >firebase.json
{
    "hosting": {
        "public": "dist",
        "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
        "rewrites": [{
            "source": "**",
            "destination": "/index.html"
        }]
    }
}
EOF2

cat <<EOF2 >.firebaserc
{
    "projects": {
        "default": "$project_id"
    }
}
EOF2

firebase deploy --project "$project_id"
EOF
cat >.github/workflows/record_sha.sh <<'EOF'
#!/bin/bash

set -euo pipefail

target_sha_path="app/src/app_x/config/sha_x.json"

if [[ ! -f "$target_sha_path" ]]; then
  echo "Expected sha.json at $target_sha_path before writing." >&2
  exit 1
fi

cat > "$target_sha_path" <<EOF2
{
  "time": $(TZ='America/New_York' date | jq -Rs .),
  "git_log": $(git log -1 | jq -Rs .)
}
EOF2
EOF
cat >.github/workflows/workflow.yaml <<'EOF'
on:
  push:
    branches:
      - main
jobs:
  workflow:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: cache
        uses: actions/cache@v4
        with:
          path: |
            app/node_modules
          key: v1
          restore-keys: |
            v1

      - run: bash .github/workflows/record_sha.sh
      - run: bash .github/workflows/build_react.sh
      - run: bash .github/workflows/deploy_to_firebase.sh '${{ secrets.SA_KEY }}'
EOF
mkdir -p app/src/app_x/config
cat >app/src/app_x/config/sha_x.json <<'EOF'
{
  "time": "",
  "git_log": ""
}
EOF
cat >app/src/app_x/config/sha_x.ts <<'EOF'
import shaDetailsRaw from "./sha_x.json?raw";

export type ShaX = {
  time: string;
  git_log: string;
};

export function getShaX(): ShaX {
  return JSON.parse(shaDetailsRaw) as ShaX;
}
EOF
cat >app/src/app_x/index.tsx <<'EOF'
import { getShaX } from "./config/sha_x";

export default function AppX() {
  return <pre>{JSON.stringify(getShaX(), null, 2)}</pre>;
}
EOF
cat >app/src/main.tsx <<'EOF'
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import AppX from "./app_x/index.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppX />
  </StrictMode>,
);
EOF
(
	cd app
	npm install
)
cat <<'EOF'
set -e
gcloud billing projects unlink $GOOGLE_CLOUD_PROJECT
gcloud services enable firebase.googleapis.com
firebase projects:addfirebase $GOOGLE_CLOUD_PROJECT
firebase init hosting --project "$GOOGLE_CLOUD_PROJECT"
gcloud iam service-accounts create deployer-github
sleep 1
gcloud projects add-iam-policy-binding "$GOOGLE_CLOUD_PROJECT" --member="serviceAccount:deployer-github@$GOOGLE_CLOUD_PROJECT.iam.gserviceaccount.com" --role="roles/firebasehosting.admin"
gcloud iam service-accounts keys create gac.json --iam-account "deployer-github@$GOOGLE_CLOUD_PROJECT.iam.gserviceaccount.com"
echo; echo; echo
cat gac.json
echo; echo; echo
EOF
