VERSION="$1"
git checkout main
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
