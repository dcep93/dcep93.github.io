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
