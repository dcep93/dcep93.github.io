# ln -s ~/repos/dcep93.github.io/mac/zprofile.sh ~/.zprofile

x() {
	git pull && com x && git push
}

com() {
	git add -A
	git commit -m "$*"
}

cdr() { cd ~/repos; }

cdic() {
	cd '/Users/danielcepeda/Library/Mobile Documents/com~apple~CloudDocs/top_secret_x'
}

gpsu() {
	git push --set-upstream origin "$(git branch --show-current)"
}

ghtf() {
	cmds=(
		"npm ci"
		"npm run lint"
		"npm run build"
		"npm run build:tests"
		"npm test"
		"docker build ."
	)

	for cmd in "${cmds[@]}"; do
		echo "+ $cmd"
		if ! eval "$cmd"; then
			echo "FAILED: $cmd"
			return 1
		fi
	done

	say g
}

newapp() {
	(
		set -xeuo pipefail
		BACKUP_DIR=~/repos/watchwall420
		cp -r $BACKUP_DIR/.github ./
		yes n | npm create vite@latest app -- --template react-ts
		mkdir -p app/src/app_x/config
		cp $BACKUP_DIR/app/src/app_x/config/sha_x.json app/src/app_x/config/sha_x.json
		cp $BACKUP_DIR/app/src/app_x/config/sha_x.ts app/src/app_x/config/sha_x.ts
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
	)
}
