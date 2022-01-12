VERSION="$1"
MAIN_BRANCH="${2-main}"
git checkout main
cp README.md projects/ngx-auth-utils/README.md
perl -pi -e "s/version\": \".*?\"/version\": \"$VERSION\"/" projects/ngx-auth-utils/package.json
git commit -am "Bump version $VERSION"
git tag $VERSION
git push
git push --tags
npx ng build ngx-auth-utils --prod
(
  cd dist/ngx-auth-utils
  npm publish
)
