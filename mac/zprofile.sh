function x() { git pull && com x && git push; }
function com() { git add -A && git commit -m "$*"; }
function cdr() { cd ~/repos; }
function cdic() { cd '/Users/danielcepeda/Library/Mobile Documents/com~apple~CloudDocs/top_secret_x'; }
function gpsu() { git push --set-upstream origin "$(git branch --show-current)"; }
function ghtf(){(cmds=("npm ci" "npm run lint" "npm run build" "npm run build:tests" "npm test" "docker build .");for cmd in "${cmds[@]}";do echo "+ $cmd";if ! eval "$cmd";then echo "FAILED: $cmd";exit 1;fi;done); say g; }

